import asyncio
import json
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from backend import database, agents, search, config

app = FastAPI(title="Debate Arena API")

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

class DebateCreateRequest(BaseModel):
    topic: str

@app.post("/api/debates")
def start_debate(request: DebateCreateRequest):
    """
    Creates a new debate in the database and returns the debate ID.
    """
    topic_stripped = request.topic.strip()
    if not topic_stripped:
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
        
    debate_id = database.create_debate(topic_stripped)
    return {"debate_id": debate_id, "topic": topic_stripped}

@app.get("/api/debates")
def get_debates():
    """
    Returns a list of all debates in history.
    """
    try:
        return database.list_debates()
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
    
    # 1. Perform initial topic research to anchor agent and stance knowledge
    research_results = await run_in_threadpool(search.search_whitelist, topic, 8)
    research_context = ""
    if research_results:
        research_context = "Found the following real-world articles and facts about this topic:\n"
        for idx, res in enumerate(research_results):
            research_context += f"- Source: {res.get('url')}\n"
            research_context += f"  Title: {res.get('title')}\n"
            research_context += f"  Snippet: {res.get('snippet')}\n"

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
    # Turn Index 0 to 9. Agent A is even index, Agent B is odd index.
    total_turns = 10
    agents_list = [
        ("Agent A", stance_a, 0.6), # Agent A (lower temp = focused)
        ("Agent B", stance_b, 0.8)  # Agent B (higher temp = creative)
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
        await asyncio.sleep(0.2) # Let event loop handle other stuff
        
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
                
                # Query whitelisted search results
                search_results = await run_in_threadpool(search.search_whitelist, claim_text)
                
                # Perform claim verification
                verdict_data = await run_in_threadpool(agents.verify_claim, claim_text, search_results)
                
                # Classify source domain tier
                source_url = verdict_data.get("source_url")
                source_tier = None
                if source_url:
                    source_tier = config.get_domain_tier(source_url)
                    
                # Save the claim and verdict to the DB
                await run_in_threadpool(
                    database.save_claim,
                    turn_id, claim_text, verdict_data["verdict"], source_url, source_tier, verdict_data.get("reasoning", "")
                )
                
                return {
                    "claim_text": claim_text,
                    "verdict": verdict_data["verdict"],
                    "source_url": source_url,
                    "source_tier": source_tier,
                    "reasoning": verdict_data.get("reasoning", "")
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
                "claims": verified_claims
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
