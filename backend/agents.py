import json
import re
import time
import random
from groq import Groq
from backend.config import settings

# Detect if we should run in Mock Mode for demonstration when API key is missing
MOCK_MODE = not settings.GROQ_API_KEY
if MOCK_MODE:
    print("WARNING: GROQ_API_KEY is not configured. Running in MOCK DEMO MODE.")
else:
    # Initialize the Groq API client
    client = Groq(api_key=settings.GROQ_API_KEY)

def clean_and_parse_json(text: str):
    """
    Cleans markdown code blocks and extracts JSON safely from LLM outputs.
    """
    clean_text = text.strip()
    if clean_text.startswith("```json"):
        clean_text = clean_text[7:]
    elif clean_text.startswith("```"):
        clean_text = clean_text[3:]
    if clean_text.endswith("```"):
        clean_text = clean_text[:-3]
    clean_text = clean_text.strip()
    
    try:
        return json.loads(clean_text)
    except json.JSONDecodeError:
        # Regex search for first matching brace/bracket block
        match_obj = re.search(r'(\{.*\}|\[.*\])', clean_text, re.DOTALL)
        if match_obj:
            try:
                return json.loads(match_obj.group(1))
            except json.JSONDecodeError:
                pass
        raise Exception(f"Failed to parse JSON from output: {text}")

def generate_content_with_retry(model_name: str, prompt: str, temperature: float = 0.7, json_mode: bool = False, max_retries: int = 5) -> str:
    """
    Calls the Groq API with exponential backoff and jitter to handle rate limits.
    """
    if MOCK_MODE:
        return "{}"
        
    actual_model = "llama-3.1-8b-instant"
    delay = 2.0
    
    for attempt in range(max_retries):
        try:
            if json_mode and "json" not in prompt.lower():
                prompt += "\n\nPlease ensure your output is in JSON format."
                
            completion = client.chat.completions.create(
                model=actual_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                response_format={"type": "json_object"} if json_mode else None,
            )
            return completion.choices[0].message.content
        except Exception as e:
            err_str = str(e).lower()
            if "429" in err_str or "rate limit" in err_str:
                backoff = delay * (2 ** attempt) + random.uniform(0.1, 1.0)
                print(f"Groq API rate limit hit. Retrying in {backoff:.2f} seconds... (Attempt {attempt+1}/{max_retries})")
                time.sleep(backoff)
            else:
                print(f"Groq API error (Attempt {attempt+1}/{max_retries}): {e}")
                time.sleep(delay)
                
    raise Exception("Max retries exceeded for Groq API call.")

# ─── Topic Stances ───────────────────────────────────────────

def parse_topic_stances(topic: str, research_context: str = "") -> dict:
    """
    Generates opposing stances for Agent A and Agent B based on the topic and optional research.
    """
    if MOCK_MODE:
        return {
            "stance_a": f"Argues in favor of: '{topic}'.",
            "stance_b": f"Argues against: '{topic}'."
        }

    research_section = ""
    if research_context:
        research_section = f"""
    REAL-WORLD RESEARCH AND FACTS ABOUT THE TOPIC:
    {research_context}
    
    Ensure the stances are factually grounded and aligned with the actual meaning and context of the topic as shown in the research above.
    """

    prompt = f"""
    You are a debate topic parser.
    Given this debate topic: "{topic}"
    
    {research_section}
    
    Define two opposing stances for Agent A (who argues in favor or supports the topic/stance 1) 
    and Agent B (who argues against or supports stance 2).
    Keep each stance simple, specific, and clear (1 sentence each).
    
    Your output MUST be a JSON object with the keys "stance_a" and "stance_b".
    Do not add extra commentary.
    """
    try:
        response_text = generate_content_with_retry("gemini-2.5-flash", prompt, temperature=0.2, json_mode=True)
        return clean_and_parse_json(response_text)
    except Exception as e:
        print(f"Error parsing topic stances: {e}")
        return {
            "stance_a": f"Argue in favor of the statement: '{topic}'",
            "stance_b": f"Argue against the statement: '{topic}'"
        }

# ─── Debate Turn Generation (Grounded with Citations) ────────

def generate_debate_turn(
    topic: str, 
    stance: str, 
    agent_name: str, 
    history: list[dict], 
    round_number: int, 
    temperature: float,
    research_context: str = ""
) -> str:
    """
    Generates a turn for a debating agent, strictly grounded in provided research context.
    The agent MUST cite sources inline using markdown link syntax.
    """
    if MOCK_MODE:
        return f"{agent_name} argues for round {round_number} about {topic}. According to [Reuters](https://www.reuters.com/example), the data supports the stance: {stance}."

    # Map round numbers to names
    round_names = {
        1: "Opening Statement",
        2: "Rebuttal Round 1",
        3: "Rebuttal Round 2",
        4: "Rebuttal Round 3",
        5: "Closing Statement"
    }
    round_name = round_names.get(round_number, f"Round {round_number}")
    
    # Format the transcript history
    history_text = ""
    for turn in history:
        history_text += f"{turn['agent']}: {turn['content']}\n\n"
        
    opposing_agent = "Agent B" if agent_name == "Agent A" else "Agent A"
    
    research_section = ""
    if research_context:
        research_section = f"""
    ══════════════════════════════════════════
    VERIFIED RESEARCH SOURCES (YOUR ONLY EVIDENCE POOL):
    ══════════════════════════════════════════
    {research_context}
    ══════════════════════════════════════════
    
    ABSOLUTE RULES FOR CITING SOURCES:
    • You may ONLY use facts, statistics, dates, and claims that appear in the research sources above.
    • For EVERY factual claim you make, you MUST include an inline citation using the format: [Source Name](URL)
      Example: "EV sales grew 35% in 2023 [Reuters](https://www.reuters.com/article/ev-sales-growth)"
    • If no research source supports a claim, DO NOT make that claim. Omit it entirely.
    • NEVER invent or fabricate statistics, URLs, percentages, or dates that do not appear in the sources above.
    • NEVER write a URL that is not listed in the research sources above.
    """

    prompt = f"""
    You are a professional debater in a formal Fact-Checked Dialectica AI debate.
    
    Topic: {topic}
    Your Name: {agent_name}
    Your Stance: {stance}
    Current Phase: {round_name}
    
    {research_section}
    
    DEBATE TRANSCRIPT SO FAR:
    {history_text if history_text else "[Debate is just starting. This is the first turn.]"}
    
    INSTRUCTIONS:
    1. Argue strongly and in good faith. Stick to your assigned stance.
    2. Write 100-150 words. Be concise and impactful.
    3. If this is a rebuttal round, directly address {opposing_agent}'s previous argument.
    4. EVERY factual claim MUST have an inline citation: [Source Name](exact URL from research)
    5. Do NOT invent facts, statistics, or URLs. Only use what appears in the research sources.
    6. Structure your argument in clear paragraphs. Separate factual claims so they can be independently verified.
    7. If you cannot find supporting evidence for a point, argue using logic and reasoning instead of fabricating data.
    
    Begin your response directly with your arguments. No salutations.
    """
    
    return generate_content_with_retry("gemini-2.5-flash", prompt, temperature=temperature)

# ─── Factcheck Analysis Mode ─────────────────────────────────

def generate_factcheck_analysis(topic: str, research_context: str = "", stance_preference: str = "both") -> dict:
    """
    Generates a structured fact-check analysis focusing on the user's stance preference:
    FOR case, AGAINST case, or BOTH, alongside a balanced/contextual VERDICT.
    All claims must be grounded in the provided research context with inline citations.
    """
    if MOCK_MODE:
        return {
            "for_case": f"The evidence supports '{topic}'. [Reuters](https://reuters.com) reports positive trends.",
            "against_case": f"Critics argue against '{topic}'. [BBC](https://bbc.com) highlights concerns.",
            "verdict": f"The evidence is mixed. Both sides present valid points grounded in credible sources."
        }
    
    research_section = ""
    if research_context:
        research_section = f"""
    ══════════════════════════════════════════
    VERIFIED RESEARCH SOURCES (YOUR ONLY EVIDENCE POOL):
    ══════════════════════════════════════════
    {research_context}
    ══════════════════════════════════════════
    """

    # Customize instructions and outputs based on stance preference
    if stance_preference == "for":
        sections_instruction = """
    Produce a structured analysis with TWO sections:
    1. "for_case" — The strongest arguments SUPPORTING the topic. 
       Write a highly detailed, comprehensive analysis of 250-350 words containing specific facts, figures, dates, and percentages.
       Cite every factual claim with [Source Name](URL) using ONLY the research sources above.
       
    2. "verdict" — Your balanced analytical verdict weighing the evidence supporting the topic.
       Write 100-150 words summarizing the strength of the supporting evidence.
        """
        output_format = """
    Output MUST be a JSON object:
    {
      "for_case": "...",
      "verdict": "..."
    }
        """
    elif stance_preference == "against":
        sections_instruction = """
    Produce a structured analysis with TWO sections:
    1. "against_case" — The strongest arguments OPPOSING the topic.
       Write a highly detailed, comprehensive analysis of 250-350 words containing specific facts, figures, dates, and percentages.
       Cite every factual claim with [Source Name](URL) using ONLY the research sources above.
       
    2. "verdict" — Your balanced analytical verdict weighing the evidence opposing the topic.
       Write 100-150 words summarizing the strength of the opposing evidence.
        """
        output_format = """
    Output MUST be a JSON object:
    {
      "against_case": "...",
      "verdict": "..."
    }
        """
    else:  # both
        sections_instruction = """
    Produce a structured analysis with THREE sections:
    1. "for_case" — The strongest arguments SUPPORTING the topic. 
       Write 200-250 words. Cite every factual claim with [Source Name](URL) using ONLY the research sources above.
       
    2. "against_case" — The strongest arguments OPPOSING the topic.
       Write 200-250 words. Cite every factual claim with [Source Name](URL) using ONLY the research sources above.
       
    3. "verdict" — Your balanced analytical verdict weighing both sides.
       Write 100-150 words. Reference key evidence from both cases. State which side has stronger evidence support.
        """
        output_format = """
    Output MUST be a JSON object:
    {
      "for_case": "...",
      "against_case": "...",
      "verdict": "..."
    }
        """

    prompt = f"""
    You are a Senior Fact-Check Analyst producing a balanced, evidence-based analysis.
    
    Topic: "{topic}"
    Stance Preference: {stance_preference.upper()} (Analyze only the requested sides plus the verdict)
    
    {research_section}
    
    {sections_instruction}
    
    CRITICAL RULES FOR CITATIONS & FACTUAL DEPTH:
    • Provide as many specific facts, figures, dates, and statistics as possible from the research sources. Avoid vague summaries.
    • ONLY cite facts that appear in the research sources above. Do not invent any outside facts.
    • Every factual claim needs an inline citation: [Source Name](URL)
      Example: "EV sales grew 35% in 2023 [Reuters](https://www.reuters.com/article/ev-sales-growth)"
    • NEVER write a URL that is not listed in the research sources above.
    
    {output_format}
    """
    
    try:
        response_text = generate_content_with_retry("gemini-2.5-flash", prompt, temperature=0.3, json_mode=True)
        result = clean_and_parse_json(response_text)
        
        # Ensure fallback keys are populated to avoid frontend breakdown
        if stance_preference == "for" or stance_preference == "both":
            if "for_case" not in result:
                result["for_case"] = "Supporting case analysis could not be generated."
        if stance_preference == "against" or stance_preference == "both":
            if "against_case" not in result:
                result["against_case"] = "Opposing case analysis could not be generated."
        if "verdict" not in result:
            result["verdict"] = "Verdict analysis could not be completed."
            
        return result
    except Exception as e:
        print(f"Error generating factcheck analysis: {e}")
        return {
            "for_case": f"Error generating supporting case analysis: {e}",
            "against_case": f"Error generating opposing case analysis: {e}",
            "verdict": "Analysis could not be completed due to an error."
        }


# ─── Claim Extraction ────────────────────────────────────────

def extract_claims(turn_content: str) -> list[dict]:
    """
    Extracts objectively checkable claims from a turn's content.
    Also extracts any inline cited URLs associated with each claim.
    """
    if MOCK_MODE:
        # Extract markdown links and pair with surrounding sentence
        claims = []
        sentences = re.split(r'(?<=[.!?])\s+', turn_content)
        for s in sentences:
            links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', s)
            if links:
                clean_text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', s).strip()
                claims.append({"claim_text": clean_text, "cited_url": links[0][1]})
            elif any(char.isdigit() for char in s):
                claims.append({"claim_text": s.strip()})
        return claims

    prompt = f"""
    You are a factual claim extraction agent.
    Analyze the following statement from a debater:
    ---
    "{turn_content}"
    ---
    
    Your task:
    1. Identify and extract only the objectively checkable factual claims (dates, historical events, statistics, numbers, scientific statements, official declarations).
    2. Ignore subjective/opinion statements, interpretations, value judgments, or rhetoric.
    3. For each claim, rewrite it as a short, clear, self-contained sentence. Replace pronouns with actual subjects.
    4. If the claim has an inline citation link like [Source](URL), extract that URL as "cited_url".
    
    Output MUST be a JSON object:
    {{
      "claims": [
        {{"claim_text": "extracted checkable claim 1", "cited_url": "https://example.com/article" }},
        {{"claim_text": "extracted checkable claim 2" }}
      ]
    }}
    If there are no factual claims, return: {{"claims": []}}.
    """
    try:
        response_text = generate_content_with_retry("llama-3.1-8b-instant", prompt, temperature=0.1, json_mode=True)
        parsed = clean_and_parse_json(response_text)
        if isinstance(parsed, dict):
            if "claims" in parsed and isinstance(parsed["claims"], list):
                return parsed["claims"]
            for val in parsed.values():
                if isinstance(val, list):
                    return val
            return []
        elif isinstance(parsed, list):
            return parsed
        return []
    except Exception as e:
        print(f"Error extracting claims: {e}")
        return []

# ─── Claim Verification ──────────────────────────────────────

def verify_claim(claim_text: str, search_results: list[dict], cited_url: str | None = None) -> dict:
    """
    Verifies a claim against search results from whitelisted domains.
    If the agent provided a cited_url, that URL is prioritized in verification.
    """
    if MOCK_MODE:
        if search_results:
            return {
                "verdict": "Confirmed",
                "source_url": search_results[0]["url"],
                "reasoning": "Source matches claim content from a whitelisted domain."
            }
        return {
            "verdict": "Unverifiable",
            "source_url": None,
            "reasoning": "No matching source found in the whitelisted domains."
        }

    # If the agent cited a specific URL, check if it's in our search results or whitelist
    cited_url_in_results = False
    if cited_url:
        from backend.config import get_domain_tier
        cited_tier = get_domain_tier(cited_url)
        if cited_tier is not None:
            cited_url_in_results = True
            # Ensure the cited URL is included in the search results for verification
            if not any(r["url"] == cited_url for r in search_results):
                search_results = [{"url": cited_url, "title": "Agent-cited source", "snippet": "", "tier": cited_tier}] + search_results

    if not search_results:
        return {
            "verdict": "Unverifiable",
            "source_url": None,
            "reasoning": "No matching source found in the whitelisted domains."
        }
        
    formatted_results = ""
    for idx, res in enumerate(search_results):
        formatted_results += f"[{idx+1}] URL: {res['url']}\nTitle: {res.get('title', '')}\nSnippet: {res.get('snippet', '')}\nTier: {res.get('tier', 'N/A')}\n\n"
        
    cited_note = ""
    if cited_url and cited_url_in_results:
        cited_note = f"\nNOTE: The debater cited this specific URL: {cited_url}. If it appears in the search results and the snippet supports the claim, give it priority.\n"

    prompt = f"""
    You are a Source-Integrity Fact-Checker.
    Evaluate the following factual claim against the provided web search results.
    
    Factual Claim: "{claim_text}"
    {cited_note}
    Web Search Results (Restricted Whitelist):
    {formatted_results}
    
    VERDICT CRITERIA:
    - 'Confirmed': The search results directly and unambiguously support the claim. The snippet text must clearly validate the key facts (numbers, dates, events) in the claim.
    - 'Disputed': Credible whitelisted sources in the results directly contradict or disprove the claim with specific counter-evidence.
    - 'Unverifiable': The search results do not contain enough specific details to confirm or contradict the claim. Do not guess.
    
    IMPORTANT RULES:
    1. No source link = no 'Confirmed' or 'Disputed' label allowed. 'source_url' MUST be one of the exact URLs from the search results.
    2. If the verdict is 'Unverifiable', the 'source_url' MUST be null.
    3. Write a 2-3 sentence explanation of your reasoning based strictly on the snippets. Quote specific text from the snippets.
    4. Be STRICT: only mark as Confirmed if the snippet clearly validates the specific numbers/facts in the claim.
    
    Output MUST be a JSON object with keys "verdict", "source_url", and "reasoning".
    """
    try:
        response_text = generate_content_with_retry("gemini-2.5-flash", prompt, temperature=0.1, json_mode=True)
        result = clean_and_parse_json(response_text)
        
        verdict = result.get("verdict", "Unverifiable")
        source_url = result.get("source_url")
        
        valid_urls = [res["url"] for res in search_results]
        if verdict in ["Confirmed", "Disputed"]:
            if not source_url or source_url not in valid_urls:
                if valid_urls:
                    result["source_url"] = valid_urls[0]
                else:
                    result["verdict"] = "Unverifiable"
                    result["source_url"] = None
        else:
            result["source_url"] = None
            
        return result
    except Exception as e:
        print(f"Error verifying claim: {e}")
        return {
            "verdict": "Unverifiable",
            "source_url": None,
            "reasoning": f"Fact-checker error: {e}"
        }

# ─── Judge Evaluation (Strengthened Scoring) ──────────────────

def urllib_domain(url: str) -> str:
    from urllib.parse import urlparse
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            return netloc[4:]
        return netloc
    except Exception:
        return "external-source.com"

def run_single_judge_evaluation(
    topic: str, 
    agent_a_name: str, 
    agent_b_name: str, 
    transcript: str, 
    claim_stats_a: dict, 
    claim_stats_b: dict
) -> dict:
    """
    Runs a single judge evaluation with strengthened scoring criteria.
    """
    prompt = f"""
    You are an expert Debate Judge in a Fact-Checked Dialectica AI debate.
    Analyze the following debate and score both participants.
    
    Topic: {topic}
    Participant 1: {agent_a_name}
    Participant 2: {agent_b_name}
    
    DEBATE TRANSCRIPT:
    {transcript}
    
    FACT-CHECK SUMMARY (from automated verification pipeline):
    - {agent_a_name} Claims Fact-Checked: 
      Confirmed: {claim_stats_a['Confirmed']}, Disputed: {claim_stats_a['Disputed']}, Unverifiable: {claim_stats_a['Unverifiable']}
    - {agent_b_name} Claims Fact-Checked: 
      Confirmed: {claim_stats_b['Confirmed']}, Disputed: {claim_stats_b['Disputed']}, Unverifiable: {claim_stats_b['Unverifiable']}
      
    ══════════════════════════════════════════
    SCORING CRITERIA (1-10 each, BE DECISIVE — do NOT cluster around 5-7):
    ══════════════════════════════════════════
    
    1. LOGIC (1-10): 
       - 9-10: Flawless logical chain, no fallacies, masterful argumentation
       - 7-8: Strong logic with minor gaps  
       - 5-6: Average, some logical inconsistencies
       - 1-4: Major logical fallacies or incoherent arguments
    
    2. EVIDENCE QUALITY (1-10) — This is the MOST important criterion:
       - 9-10: >80% of claims Confirmed by fact-checker, zero Disputed, proper source citations
       - 7-8: >60% Confirmed, minimal Disputed, mostly cited
       - 5-6: Mixed results, significant Unverifiable claims
       - 3-4: Majority Unverifiable, multiple Disputed claims  
       - 1-2: Mostly fabricated or completely unsourced arguments
       
    3. REBUTTAL QUALITY (1-10):
       - 9-10: Devastating, precise counter-arguments that dismantle opponent's key points
       - 7-8: Effective rebuttals that address core arguments
       - 5-6: Surface-level rebuttals
       - 1-4: Ignored opponent's arguments or strawmanned them
    
    IMPORTANT: 
    - An agent with MOSTLY CONFIRMED claims and good citations deserves 8-10 in Evidence.
    - An agent with MOSTLY UNVERIFIABLE claims deserves 3-5 in Evidence.
    - An agent with DISPUTED claims deserves 1-3 in Evidence.
    - Write 3-4 sentences of detailed reasoning for each agent.
    
    Output as JSON:
    {{
      "agent_a": {{
        "logic": <int 1-10>,
        "evidence": <int 1-10>,
        "rebuttal": <int 1-10>,
        "reasoning": "<3-4 sentence detailed evaluation>"
      }},
      "agent_b": {{
        "logic": <int 1-10>,
        "evidence": <int 1-10>,
        "rebuttal": <int 1-10>,
        "reasoning": "<3-4 sentence detailed evaluation>"
      }}
    }}
    """
    response_text = generate_content_with_retry("gemini-2.5-flash", prompt, temperature=0.2, json_mode=True)
    return clean_and_parse_json(response_text)

def evaluate_debate(topic: str, history: list[dict], claims_by_turn: dict) -> dict:
    """
    Runs the judge twice with swapped labels to eliminate position bias, then averages the scores.
    """
    if MOCK_MODE:
        return {
            "Agent A": {
                "logic": 8, "evidence": 8, "rebuttal": 7,
                "total": 7.67,
                "reasoning": "Agent A presented well-structured arguments with proper source citations."
            },
            "Agent B": {
                "logic": 7, "evidence": 7, "rebuttal": 8,
                "total": 7.33,
                "reasoning": "Agent B offered strong rebuttals but lacked source depth."
            }
        }

    # Standard path
    transcript_standard = ""
    for turn in history:
        transcript_standard += f"{turn['agent']}: {turn['content']}\n\n"
        
    transcript_swapped = ""
    for turn in history:
        swapped_agent = "Agent B" if turn['agent'] == "Agent A" else "Agent A"
        transcript_swapped += f"{swapped_agent}: {turn['content']}\n\n"
        
    claim_stats = {
        "Agent A": {"Confirmed": 0, "Disputed": 0, "Unverifiable": 0},
        "Agent B": {"Confirmed": 0, "Disputed": 0, "Unverifiable": 0}
    }
    
    for turn_id, claims in claims_by_turn.items():
        agent = next((t["agent"] for t in history if t["id"] == turn_id), None)
        if agent:
            for claim in claims:
                verdict = claim.get("verdict", "Unverifiable")
                if verdict in claim_stats[agent]:
                    claim_stats[agent][verdict] += 1
                else:
                    claim_stats[agent]["Unverifiable"] += 1
                    
    try:
        run1 = run_single_judge_evaluation(
            topic, "Agent A", "Agent B", 
            transcript_standard, claim_stats["Agent A"], claim_stats["Agent B"]
        )
    except Exception as e:
        print(f"Judge Run 1 error: {e}")
        run1 = None
        
    try:
        run2 = run_single_judge_evaluation(
            topic, "Agent B", "Agent A", 
            transcript_swapped, claim_stats["Agent B"], claim_stats["Agent A"]
        )
    except Exception as e:
        print(f"Judge Run 2 error: {e}")
        run2 = None
        
    final_scores = {
        "Agent A": {"logic": 5.0, "evidence": 5.0, "rebuttal": 5.0, "reasoning": ""},
        "Agent B": {"logic": 5.0, "evidence": 5.0, "rebuttal": 5.0, "reasoning": ""}
    }
    
    if run1 and run2:
        scores_a_run1 = run1["agent_a"]
        scores_b_run1 = run1["agent_b"]
        scores_b_run2 = run2["agent_a"]
        scores_a_run2 = run2["agent_b"]
        
        final_scores["Agent A"]["logic"] = round((scores_a_run1["logic"] + scores_a_run2["logic"]) / 2, 1)
        final_scores["Agent A"]["evidence"] = round((scores_a_run1["evidence"] + scores_a_run2["evidence"]) / 2, 1)
        final_scores["Agent A"]["rebuttal"] = round((scores_a_run1["rebuttal"] + scores_a_run2["rebuttal"]) / 2, 1)
        final_scores["Agent A"]["reasoning"] = scores_a_run1["reasoning"]
        
        final_scores["Agent B"]["logic"] = round((scores_b_run1["logic"] + scores_b_run2["logic"]) / 2, 1)
        final_scores["Agent B"]["evidence"] = round((scores_b_run1["evidence"] + scores_b_run2["evidence"]) / 2, 1)
        final_scores["Agent B"]["rebuttal"] = round((scores_b_run1["rebuttal"] + scores_b_run2["rebuttal"]) / 2, 1)
        final_scores["Agent B"]["reasoning"] = scores_b_run1["reasoning"]
    elif run1:
        for category in ["logic", "evidence", "rebuttal"]:
            final_scores["Agent A"][category] = float(run1["agent_a"][category])
            final_scores["Agent B"][category] = float(run1["agent_b"][category])
        final_scores["Agent A"]["reasoning"] = run1["agent_a"]["reasoning"]
        final_scores["Agent B"]["reasoning"] = run1["agent_b"]["reasoning"]
    else:
        final_scores["Agent A"]["reasoning"] = "Could not evaluate debate due to judge error."
        final_scores["Agent B"]["reasoning"] = "Could not evaluate debate due to judge error."
        
    for agent in ["Agent A", "Agent B"]:
        final_scores[agent]["total"] = round(
            (final_scores[agent]["logic"] + final_scores[agent]["evidence"] + final_scores[agent]["rebuttal"]) / 3, 2
        )
        
    return final_scores
