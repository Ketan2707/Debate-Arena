import asyncio
import json
import httpx
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from backend import database, agents, search, config
from backend.config import (
    hash_password, verify_password, create_session_token, verify_session_token
)

app = FastAPI(title="ArguForge AI API")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    database.init_db()

# ─── Auth Dependency ─────────────────────────────────────────

def get_current_user(request: Request) -> dict:
    """Extract and verify the Bearer token from the Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header.split(" ", 1)[1]
    user_data = verify_session_token(token)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    return user_data

def get_optional_user(request: Request) -> dict | None:
    """Try to extract user from token, return None for guests."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    return verify_session_token(token)

# ─── Auth Endpoints ──────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/register")
def register_user(req: RegisterRequest):
    email = req.email.strip().lower()
    password = req.password.strip()
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    existing = database.get_user_by_email(email)
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    
    pw_hash = hash_password(password)
    user_id = database.create_user(email, pw_hash)
    token = create_session_token(user_id, email)
    return {"token": token, "user": {"id": user_id, "email": email}}

@app.post("/api/auth/login")
def login_user(req: LoginRequest):
    email = req.email.strip().lower()
    password = req.password.strip()
    
    user = database.get_user_by_email(email)
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_session_token(user["id"], user["email"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"]}}

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    user = database.get_user_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": user}

# ─── OAuth Endpoints ──────────────────────────────────────────

class GoogleCallbackRequest(BaseModel):
    access_token: str

@app.post("/api/auth/google/callback")
async def google_callback(req: GoogleCallbackRequest):
    token = req.access_token
    email = None
    
    if token.startswith("mock-") or not config.settings.GOOGLE_CLIENT_ID:
        # Graceful sandbox fallback for local testing
        email = "demo_google_user@gmail.com"
    else:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if res.status_code == 200:
                    data = res.json()
                    email = data.get("email")
        except Exception:
            pass
            
    if not email:
        raise HTTPException(status_code=401, detail="Google authentication failed or token expired")
        
    email = email.lower().strip()
    user = database.get_user_by_email(email)
    if not user:
        pw_hash = "oauth_placeholder_not_usable_for_password_login"
        user_id = database.create_user(email, pw_hash)
    else:
        user_id = user["id"]
        
    session_token = create_session_token(user_id, email)
    return {"token": session_token, "user": {"id": user_id, "email": email}}

class GitHubCallbackRequest(BaseModel):
    code: str

@app.post("/api/auth/github/callback")
async def github_callback(req: GitHubCallbackRequest):
    code = req.code
    email = None
    
    if code.startswith("mock-") or not config.settings.GITHUB_CLIENT_ID:
        # Graceful sandbox fallback for local testing
        email = "demo_github_user@github.com"
    else:
        try:
            async with httpx.AsyncClient() as client:
                token_res = await client.post(
                    "https://github.com/login/oauth/access_token",
                    headers={"Accept": "application/json"},
                    data={
                        "client_id": config.settings.GITHUB_CLIENT_ID,
                        "client_secret": config.settings.GITHUB_CLIENT_SECRET,
                        "code": code
                    }
                )
                if token_res.status_code == 200:
                    token_data = token_res.json()
                    access_token = token_data.get("access_token")
                    if access_token:
                        user_res = await client.get(
                            "https://api.github.com/user",
                            headers={"Authorization": f"Bearer {access_token}"}
                        )
                        if user_res.status_code == 200:
                            user_data = user_res.json()
                            email = user_data.get("email")
                            
                            if not email:
                                emails_res = await client.get(
                                    "https://api.github.com/user/emails",
                                    headers={"Authorization": f"Bearer {access_token}"}
                                )
                                if emails_res.status_code == 200:
                                    emails_data = emails_res.json()
                                    for email_info in emails_data:
                                        if email_info.get("primary"):
                                            email = email_info.get("email")
                                            break
                                    if not email and emails_data:
                                        email = emails_data[0].get("email")
        except Exception:
            pass
            
    if not email:
        raise HTTPException(status_code=401, detail="GitHub authentication failed or code expired")
        
    email = email.lower().strip()
    user = database.get_user_by_email(email)
    if not user:
        pw_hash = "oauth_placeholder_not_usable_for_password_login"
        user_id = database.create_user(email, pw_hash)
    else:
        user_id = user["id"]
        
    session_token = create_session_token(user_id, email)
    return {"token": session_token, "user": {"id": user_id, "email": email}}

# ─── Debate Endpoints ────────────────────────────────────────

class DebateCreateRequest(BaseModel):
    topic: str
    mode: str = "debate"  # "debate" or "factcheck"
    stance_preference: str = "both"  # "both", "for", or "against"

@app.post("/api/debates")
def start_debate(request: DebateCreateRequest, current_user: dict = Depends(get_current_user)):
    """
    Creates a new debate in the database and returns the debate ID.
    Requires authentication.
    """
    topic_stripped = request.topic.strip()
    if not topic_stripped:
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    
    mode = request.mode if request.mode in ("debate", "factcheck") else "debate"
    stance_pref = request.stance_preference if request.stance_preference in ("both", "for", "against") else "both"
    
    debate_id = database.create_debate(
        topic_stripped, 
        mode=mode, 
        user_id=current_user["user_id"], 
        stance_preference=stance_pref
    )
    return {"debate_id": debate_id, "topic": topic_stripped, "mode": mode, "stance_preference": stance_pref}


@app.get("/api/debates")
def get_debates(current_user: dict | None = Depends(get_optional_user)):
    """
    Returns a list of debates in history for the current signed-in user.
    If not signed in, returns an empty list.
    """
    if not current_user:
        return []
    try:
        return database.list_debates(user_id=current_user["user_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/debates/{debate_id}")
def get_debate(debate_id: str):
    """
    Returns full transcript and scores for a specific debate.
    """
    details = database.get_debate_details(debate_id)
    if not details:
        raise HTTPException(status_code=404, detail="Debate not found")
    return details

# ─── Debate Stream Generator ─────────────────────────────────

async def debate_stream_generator(debate_id: str):
    """
    Orchestrates the debate round-by-round and streams status, turns,
    and the final judge's scorecard to the client via SSE.
    """
    db_debate = await run_in_threadpool(database.get_debate_details, debate_id)
    if not db_debate:
        yield f"event: error\ndata: {json.dumps({'error': 'Debate not found'})}\n\n"
        return
        
    topic = db_debate["topic"]
    mode = db_debate.get("mode", "debate")
    
    # 1. Perform initial topic research to anchor agent and stance knowledge
    research_results = await run_in_threadpool(search.search_whitelist, topic, 20)
    research_context = ""
    if research_results:
        research_context = "Found the following real-world articles and facts about this topic:\n"
        for idx, res in enumerate(research_results):
            research_context += f"- Source: {res.get('url')}\n"
            research_context += f"  Title: {res.get('title')}\n"
            research_context += f"  Snippet: {res.get('snippet')}\n"

    # ── FACTCHECK MODE ────────────────────────────────────────
    if mode == "factcheck":
        yield f"event: status\ndata: {json.dumps({'agent': 'Analyst', 'status': 'researching', 'round_number': 1})}\n\n"
        await asyncio.sleep(0.2)
        
        try:
            # Get stance preference from DB or default
            stance_preference = db_debate.get("stance_preference", "both")

            # Generate structured FOR / AGAINST / VERDICT analysis
            analysis = await run_in_threadpool(
                agents.generate_factcheck_analysis, topic, research_context, stance_preference
            )
            
            # Save analysis sections as turns
            sections_to_process = []
            if stance_preference == "for":
                sections_to_process = ["for_case", "verdict"]
            elif stance_preference == "against":
                sections_to_process = ["against_case", "verdict"]
            else:
                sections_to_process = ["for_case", "against_case", "verdict"]

            for idx, section in enumerate(sections_to_process):
                section_content = analysis.get(section, "")
                if not section_content:
                    continue
                agent_label = {"for_case": "FOR", "against_case": "AGAINST", "verdict": "VERDICT"}[section]
                round_num = idx + 1
                
                turn_id = await run_in_threadpool(
                    database.save_turn, debate_id, agent_label, round_num, section_content
                )
                
                yield f"event: status\ndata: {json.dumps({'agent': agent_label, 'status': 'fact_checking', 'round_number': round_num})}\n\n"
                await asyncio.sleep(0.2)
                
                # Extract and verify claims from this section
                extracted_claims = await run_in_threadpool(agents.extract_claims, section_content)
                
                async def verify_and_save_claim(claim_item, t_id):
                    claim_text = claim_item["claim_text"]
                    cited_url = claim_item.get("cited_url")
                    search_results = await run_in_threadpool(search.search_whitelist, claim_text)
                    verdict_data = await run_in_threadpool(agents.verify_claim, claim_text, search_results, cited_url)
                    source_url = verdict_data.get("source_url")
                    source_tier = None
                    if source_url:
                        source_tier = config.get_domain_tier(source_url)
                    await run_in_threadpool(
                        database.save_claim,
                        t_id, claim_text, verdict_data["verdict"], source_url, source_tier,
                        verdict_data.get("reasoning", ""), cited_url
                    )
                    return {
                        "claim_text": claim_text,
                        "verdict": verdict_data["verdict"],
                        "source_url": source_url,
                        "source_tier": source_tier,
                        "reasoning": verdict_data.get("reasoning", ""),
                        "cited_url": cited_url,
                    }
                
                verified_claims = []
                if extracted_claims:
                    tasks = [verify_and_save_claim(c, turn_id) for c in extracted_claims]
                    verified_claims = await asyncio.gather(*tasks)
                
                new_turn = {
                    "id": turn_id,
                    "debate_id": debate_id,
                    "agent": agent_label,
                    "round_number": round_num,
                    "content": section_content,
                    "claims": list(verified_claims),
                }
                yield f"event: turn\ndata: {json.dumps(new_turn)}\n\n"
                await asyncio.sleep(0.2)
            
            # Mark completed
            await run_in_threadpool(database.update_debate_status, debate_id, "completed")
            yield f"event: verdict\ndata: {json.dumps({'scores': [], 'mode': 'factcheck'})}\n\n"
            
        except Exception as e:
            await run_in_threadpool(database.update_debate_status, debate_id, "failed")
            yield f"event: error\ndata: {json.dumps({'error': f'Factcheck analysis failed: {e}'})}\n\n"
        return

    # ── DEBATE MODE (original flow) ───────────────────────────
    # 2. Generate stances for this topic using the research context
    try:
        stances = await run_in_threadpool(agents.parse_topic_stances, topic, research_context)
    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'error': f'Failed to parse stances: {e}'})}\n\n"
        return
        
    stance_a = stances["stance_a"]
    stance_b = stances["stance_b"]
    
    # Yield stances immediately
    yield f"event: stances\ndata: {json.dumps({'stance_a': stance_a, 'stance_b': stance_b})}\n\n"
    
    # 3. Stream existing turns from the DB (supports resuming after disconnect)
    existing_turns = db_debate.get("turns", [])
    for turn in existing_turns:
        yield f"event: turn\ndata: {json.dumps(turn)}\n\n"
        
    # If debate is already completed, yield the scores and terminate stream
    if db_debate["status"] == "completed":
        scores = db_debate.get("scores", [])
        yield f"event: verdict\ndata: {json.dumps({'scores': scores})}\n\n"
        return

    # Orchestrate turns: 5 rounds total per agent
    total_turns = 10
    agents_list = [
        ("Agent A", stance_a, 0.6),
        ("Agent B", stance_b, 0.8)
    ]
    
    turns_generated = len(existing_turns)
    history = [{"id": t["id"], "agent": t["agent"], "content": t["content"]} for t in existing_turns]
    
    claims_by_turn = {}
    for turn in existing_turns:
        claims_by_turn[turn["id"]] = turn.get("claims", [])
        
    # Main orchestration loop
    for t_idx in range(turns_generated, total_turns):
        round_number = (t_idx // 2) + 1
        agent_name, stance, temp = agents_list[t_idx % 2]
        
        # Yield 'writing' status
        yield f"event: status\ndata: {json.dumps({'agent': agent_name, 'status': 'writing', 'round_number': round_number})}\n\n"
        await asyncio.sleep(0.2)
        
        try:
            # Generate the agent's turn
            content = await run_in_threadpool(
                agents.generate_debate_turn,
                topic, stance, agent_name, history, round_number, temp, research_context
            )
            
            # Save raw turn in DB
            turn_id = await run_in_threadpool(
                database.save_turn, 
                debate_id, agent_name, round_number, content
            )
            
            # Yield 'fact_checking' status
            yield f"event: status\ndata: {json.dumps({'agent': agent_name, 'status': 'fact_checking', 'round_number': round_number})}\n\n"
            await asyncio.sleep(0.2)
            
            # Extract checkable claims
            extracted_claims = await run_in_threadpool(agents.extract_claims, content)
            
            async def verify_and_save_claim(claim_item):
                claim_text = claim_item["claim_text"]
                cited_url = claim_item.get("cited_url")
                
                # Query whitelisted search results
                search_results = await run_in_threadpool(search.search_whitelist, claim_text)
                
                # Perform claim verification
                verdict_data = await run_in_threadpool(agents.verify_claim, claim_text, search_results, cited_url)
                
                # Classify source domain tier
                source_url = verdict_data.get("source_url")
                source_tier = None
                if source_url:
                    source_tier = config.get_domain_tier(source_url)
                    
                # Save the claim and verdict to the DB
                await run_in_threadpool(
                    database.save_claim,
                    turn_id, claim_text, verdict_data["verdict"], source_url, source_tier,
                    verdict_data.get("reasoning", ""), cited_url
                )
                
                return {
                    "claim_text": claim_text,
                    "verdict": verdict_data["verdict"],
                    "source_url": source_url,
                    "source_tier": source_tier,
                    "reasoning": verdict_data.get("reasoning", ""),
                    "cited_url": cited_url,
                }
            
            # Verify and save all claims in parallel
            if extracted_claims:
                tasks = [verify_and_save_claim(c) for c in extracted_claims]
                verified_claims = await asyncio.gather(*tasks)
            else:
                verified_claims = []
                
            claims_by_turn[turn_id] = verified_claims
            
            # Add to local history and stream the completed turn
            new_turn = {
                "id": turn_id,
                "debate_id": debate_id,
                "agent": agent_name,
                "round_number": round_number,
                "content": content,
                "claims": list(verified_claims)
            }
            history.append({"id": turn_id, "agent": agent_name, "content": content})
            
            yield f"event: turn\ndata: {json.dumps(new_turn)}\n\n"
            await asyncio.sleep(0.2)
            
        except Exception as e:
            await run_in_threadpool(database.update_debate_status, debate_id, "failed")
            yield f"event: error\ndata: {json.dumps({'error': f'Failed at round {round_number} ({agent_name}): {e}'})}\n\n"
            return

    # 3. Debate completed, run the Judge
    yield f"event: status\ndata: {json.dumps({'agent': 'Judge', 'status': 'judging', 'round_number': 6})}\n\n"
    await asyncio.sleep(0.2)
    
    try:
        # Run double evaluation
        scores_dict = await run_in_threadpool(agents.evaluate_debate, topic, history, claims_by_turn)
        
        # Save scores to database
        for agent_name, score in scores_dict.items():
            await run_in_threadpool(
                database.save_score,
                debate_id,
                agent_name,
                int(score["logic"]),
                int(score["evidence"]),
                int(score["rebuttal"]),
                score["total"],
                score["reasoning"]
            )
            
        # Update debate status to completed
        await run_in_threadpool(database.update_debate_status, debate_id, "completed")
        
        # Compile score objects to stream
        final_scores = [
            {
                "debate_id": debate_id,
                "agent": agent_name,
                "logic": score["logic"],
                "evidence": score["evidence"],
                "rebuttal": score["rebuttal"],
                "total": score["total"],
                "judge_reasoning": score["reasoning"]
            }
            for agent_name, score in scores_dict.items()
        ]
        
        yield f"event: verdict\ndata: {json.dumps({'scores': final_scores})}\n\n"
        
    except Exception as e:
        await run_in_threadpool(database.update_debate_status, debate_id, "failed")
        yield f"event: error\ndata: {json.dumps({'error': f'Judging failed: {e}'})}\n\n"

@app.get("/api/debates/{debate_id}/stream")
def stream_debate(debate_id: str):
    """
    Streams debate events in real-time.
    """
    return StreamingResponse(
        debate_stream_generator(debate_id),
        media_type="text/event-stream"
    )
