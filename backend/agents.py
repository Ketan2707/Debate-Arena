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
    client = None
else:
    # Initialize the Groq API client
    client = Groq(api_key=settings.GROQ_API_KEY)

# Prioritized list of active chat generation models on Groq
CANDIDATE_MODELS = [
    "groq/compound-mini",
    "groq/compound",
    "allam-2-7b",
    "qwen/qwen3.6-27b"
]

_active_model = None
_available_models_cache = None

def get_available_groq_models():
    """
    Fetches the currently active model IDs on this Groq account.
    Caches the list in memory.
    """
    global _available_models_cache
    if _available_models_cache is not None:
        return _available_models_cache
    if MOCK_MODE or not client:
        return set()
    try:
        models = client.models.list()
        _available_models_cache = {m.id for m in models.data if getattr(m, 'active', True)}
        print(f"Groq: Discovered {len(_available_models_cache)} active models on account.")
        return _available_models_cache
    except Exception as e:
        print(f"Warning: Could not fetch Groq models list ({e}). Will try candidates sequentially.")
        return set()

def get_best_model(requested_model: str = "") -> str:
    """
    Returns the best available active model, prioritizing fast compound models.
    """
    global _active_model
    available = get_available_groq_models()
    
    if requested_model and (not available or requested_model in available):
        return requested_model
        
    if _active_model and (not available or _active_model in available):
        return _active_model
        
    for candidate in CANDIDATE_MODELS:
        if not available or candidate in available:
            _active_model = candidate
            return _active_model
            
    return "groq/compound-mini"

def strip_internal_thinking(text: str) -> str:
    """
    Strips internal thinking tokens (<think>...</think>), reasoning blocks, and scratchpad meta notes.
    """
    if not text:
        return ""
    # If </think> is present, take the text following the final </think> tag
    if "</think>" in text.lower():
        parts = re.split(r'</think>', text, flags=re.IGNORECASE)
        cleaned = parts[-1].strip()
    elif "<think>" in text.lower():
        # Unclosed think tag: strip the <think> tag itself
        cleaned = re.sub(r'<think>', '', text, flags=re.IGNORECASE).strip()
    else:
        cleaned = text.strip()

    # Strip "Thinking Process: ..." or "Thought Process: ..."
    cleaned = re.sub(r'^(?:Thinking Process|Thought Process|Reasoning):[\s\S]*?\n\n', '', cleaned.strip(), flags=re.IGNORECASE)
    # Strip markdown scratchpad items like *Word Count:* ...
    cleaned = re.sub(r'\*+(?:Word Count|Constraint|Cutting|Deconstruct)[^*]*\*+[\s\S]*?(?=\n\n|\Z)', '', cleaned, flags=re.IGNORECASE)
    # Clean bracketed footnote tags <[1]> to [1]
    cleaned = re.sub(r'<\s*\[\s*(\d+)\s*\]\s*>', r'[\1]', cleaned)
    return cleaned.strip()

def clean_and_parse_json(text: str):
    """
    Cleans markdown code blocks, thinking tags, and extracts JSON safely from LLM outputs.
    """
    clean_text = strip_internal_thinking(text)
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
        match_obj = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', clean_text)
        if match_obj:
            try:
                return json.loads(match_obj.group(1))
            except json.JSONDecodeError:
                pass
        raise Exception(f"Failed to parse JSON from output: {text[:250]}")

def generate_content_with_retry(
    model_name: str = "", 
    prompt: str = "", 
    temperature: float = 0.7, 
    json_mode: bool = False, 
    max_retries: int = 3,
    max_tokens: int = 2048
) -> str:
    """
    Calls the Groq API with automatic model discovery, multi-tier fallback, exponential backoff, and jitter.
    """
    global _active_model
    if MOCK_MODE or not client:
        return "{}"
        
    best_initial = get_best_model(model_name)
    models_to_try = [best_initial] + [m for m in CANDIDATE_MODELS if m != best_initial]
    
    last_exception = None
    
    for current_model in models_to_try:
        delay = 0.8
        for attempt in range(max_retries):
            try:
                cur_prompt = prompt
                if json_mode and "json" not in cur_prompt.lower():
                    cur_prompt += "\n\nPlease ensure your output is in valid JSON format."
                    
                completion = client.chat.completions.create(
                    model=current_model,
                    messages=[{"role": "user", "content": cur_prompt}],
                    temperature=temperature,
                    response_format={"type": "json_object"} if json_mode else None,
                    max_tokens=max_tokens
                )
                _active_model = current_model
                raw_content = completion.choices[0].message.content or ""
                return strip_internal_thinking(raw_content)
            except Exception as e:
                err_str = str(e).lower()
                last_exception = e
                # Check for model not found / deleted / terms required / decommissioned
                if "model_not_found" in err_str or "404" in err_str or "does not exist" in err_str or "decommissioned" in err_str or "terms_required" in err_str or "model_terms_required" in err_str:
                    print(f"Model '{current_model}' unavailable on Groq ({err_str[:60]}). Trying next candidate...")
                    break  # Move directly to next candidate model
                elif "413" in err_str or "too_large" in err_str or "request entity too large" in err_str:
                    print(f"Payload too large for '{current_model}'. Switching to next model...")
                    break  # Switch to next candidate model with larger context window
                elif "429" in err_str or "rate limit" in err_str:
                    print(f"Groq rate limit on '{current_model}'. Switching to next model...")
                    time.sleep(0.5)
                    break  # Rotate to next candidate model immediately for fresh quota
                elif "response_format" in err_str or "json_object" in err_str or "json_validate_failed" in err_str:
                    # Model failed JSON validation mode, fallback to text mode and parse JSON from string
                    try:
                        text_prompt = cur_prompt + "\n\nCRITICAL: Output ONLY a valid JSON object without surrounding explanations or conversation."
                        completion = client.chat.completions.create(
                            model=current_model,
                            messages=[{"role": "user", "content": text_prompt}],
                            temperature=temperature,
                            max_tokens=max_tokens
                        )
                        _active_model = current_model
                        raw_content = completion.choices[0].message.content or ""
                        return strip_internal_thinking(raw_content)
                    except Exception as sub_e:
                        last_exception = sub_e
                        break
                else:
                    print(f"Groq API error on '{current_model}' (attempt {attempt+1}/{max_retries}): {e}")
                    time.sleep(delay)
                    
    raise Exception(f"All Groq models failed. Last error: {last_exception}")

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
    VERIFIED RESEARCH SOURCES (PRIMARY EVIDENCE POOL):
    ══════════════════════════════════════════
    {research_context}
    ══════════════════════════════════════════
    
    RULES FOR CITING SOURCES:
    • Prioritize facts, statistics, dates, and claims from the research sources above.
    • For factual claims, include an inline citation using the format: [Source Name](URL)
    • NEVER use numbered footnotes or plain bracketed numbers like [1], [2], [3].
    """
    else:
        research_section = """
    RULES FOR CITING SOURCES:
    • Ground arguments in factual logic, statistics, and verifiable events.
    • Include inline citations to reputable news/research sources in [Source Name](URL) format where relevant.
    """

    prompt = f"""
    You are a professional debater in a formal Fact-Checked ArguForge AI debate.
    
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
    8. CRITICAL: Output ONLY the speech paragraphs directly. Do NOT output thinking steps, scratchpad, <think> tags, or word counts.
    
    Begin your response directly with your arguments. No salutations.
    """
    
    try:
        raw = generate_content_with_retry("groq/compound-mini", prompt, temperature=temperature)
        return strip_internal_thinking(raw)
    except Exception as e:
        print(f"Error generating debate turn for {agent_name} (Round {round_number}): {e}")
        return f"{agent_name} argues for round {round_number} regarding '{topic}'. In accordance with the stance '{stance}', the empirical arguments and logical considerations demonstrate significant merits that must be addressed."

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
    VERIFIED RESEARCH SOURCES (PRIMARY EVIDENCE POOL):
    ══════════════════════════════════════════
    {research_context}
    ══════════════════════════════════════════
    """

    # Customize instructions and outputs based on stance preference
    if stance_preference == "for":
        sections_instruction = """
    Produce a structured analysis with TWO sections:
    1. "for_case" — The strongest arguments SUPPORTING the topic. 
       Write a detailed, comprehensive analysis of 200-300 words containing specific facts, figures, dates, and percentages.
       Cite factual claims with [Source Name](URL).
       
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
       Write a detailed, comprehensive analysis of 200-300 words containing specific facts, figures, dates, and percentages.
       Cite factual claims with [Source Name](URL).
       
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
       Write 180-250 words. Cite factual claims with [Source Name](URL).
       
    2. "against_case" — The strongest arguments OPPOSING the topic.
       Write 180-250 words. Cite factual claims with [Source Name](URL).
       
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
    • Provide specific facts, figures, dates, and statistics. Avoid vague summaries.
    • For cited sources, use the exact markdown link format: [Source Name](URL).
    • If research sources are provided above, prioritize them. If not, cite known authoritative domain sources (e.g. [Reuters](https://reuters.com), [BBC](https://bbc.com), [Pew Research](https://pewresearch.org), [Wikipedia](https://wikipedia.org)).
    • NEVER use numbered footnotes like [1], [2].
    
    {output_format}
    """
    
    try:
        response_text = generate_content_with_retry("groq/compound-mini", prompt, temperature=0.3, json_mode=True)
        result = clean_and_parse_json(response_text)
        
        # Ensure fallback keys are populated to avoid frontend breakdown
        if stance_preference == "for" or stance_preference == "both":
            if "for_case" not in result or not result["for_case"]:
                result["for_case"] = f"Key evidence supporting '{topic}' emphasizes technological advancement, public benefits, and efficiency gains documented across industry studies."
        if stance_preference == "against" or stance_preference == "both":
            if "against_case" not in result or not result["against_case"]:
                result["against_case"] = f"Key counterarguments regarding '{topic}' highlight implementation complexities, financial costs, and regulatory trade-offs identified by analysts."
        if "verdict" not in result or not result["verdict"]:
            result["verdict"] = f"A balanced assessment of '{topic}' indicates valid evidentiary points on both sides, requiring careful policy and practical consideration."
            
        return result
    except Exception as e:
        print(f"Error generating factcheck analysis: {e}")
        return {
            "for_case": f"Proponents of '{topic}' present arguments centered on societal advancement, data-driven outcomes, and operational benefits.",
            "against_case": f"Critics of '{topic}' raise considerations regarding economic barriers, scalability concerns, and alternative approaches.",
            "verdict": f"The overall evidence regarding '{topic}' demonstrates nuanced perspectives from both supporters and critics."
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
    5. Extract at most 4 of the most critical and prominent checkable factual claims. If there are fewer, extract only those.
    
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

def verify_claims_batch(claims_list: list[dict], search_results_list: list[list[dict]]) -> list[dict]:
    """
    Verifies a batch of claims against their respective search results in a SINGLE LLM call.
    This saves multiple parallel API calls and avoids hitting Groq rate limits (429).
    """
    if MOCK_MODE:
        results = []
        for i, claim in enumerate(claims_list):
            s_res = search_results_list[i] if i < len(search_results_list) else []
            if s_res:
                results.append({
                    "verdict": "Confirmed",
                    "source_url": s_res[0]["url"],
                    "reasoning": "Source matches claim content."
                })
            else:
                results.append({
                    "verdict": "Unverifiable",
                    "source_url": None,
                    "reasoning": "No matching source found."
                })
        return results

    if not claims_list:
        return []

    # Build the prompt with all claims and their search results
    formatted_claims = []
    for idx, claim in enumerate(claims_list):
        claim_text = claim["claim_text"]
        cited_url = claim.get("cited_url")
        search_results = search_results_list[idx] if idx < len(search_results_list) else []

        # If cited_url is present, ensure it's in search results
        cited_url_in_results = False
        if cited_url:
            from backend.config import get_domain_tier
            cited_tier = get_domain_tier(cited_url)
            if cited_tier is not None:
                cited_url_in_results = True
                if not any(r["url"] == cited_url for r in search_results):
                    search_results = [{"url": cited_url, "title": "Agent-cited source", "snippet": "", "tier": cited_tier}] + search_results

        formatted_res = ""
        for s_idx, res in enumerate(search_results):
            formatted_res += f"  [{s_idx+1}] URL: {res['url']}\n  Title: {res.get('title', '')}\n  Snippet: {res.get('snippet', '')}\n  Tier: {res.get('tier', 'N/A')}\n\n"

        cited_note = ""
        if cited_url and cited_url_in_results:
            cited_note = f" (Priority Cited URL: {cited_url})"

        formatted_claims.append({
            "claim_index": idx + 1,
            "claim_text": claim_text,
            "cited_note": cited_note,
            "search_results": formatted_res or "No search results found.\n"
        })

    prompt_items = ""
    for fc in formatted_claims:
        prompt_items += f"""
---
CLAIM #{fc['claim_index']}: "{fc['claim_text']}"{fc['cited_note']}
SEARCH RESULTS:
{fc['search_results']}
"""

    prompt = f"""
    You are a Source-Integrity Fact-Checker. Evaluate the following claims against their respective search results.
    {prompt_items}
    
    VERDICT CRITERIA:
    - 'Confirmed': The search results directly and unambiguously support the claim. The snippet text must clearly validate the key facts (numbers, dates, events) in the claim.
    - 'Disputed': Credible whitelisted sources in the results directly contradict or disprove the claim with specific counter-evidence.
    - 'Unverifiable': The search results do not contain enough specific details to confirm or contradict the claim. Do not guess.
    
    IMPORTANT RULES:
    1. No source link = no 'Confirmed' or 'Disputed' label allowed. 'source_url' MUST be one of the exact URLs from the search results for that claim.
    2. If the verdict is 'Unverifiable', the 'source_url' MUST be null.
    3. Write a 2-3 sentence explanation of your reasoning based strictly on the snippets. Quote specific text from the snippets.
    4. Be STRICT: only mark as Confirmed if the snippet clearly validates the specific numbers/facts in the claim.
    
    Output MUST be a JSON object with a single key "verifications", which is an array of objects matching the claim order. Each object must have keys "claim_index", "verdict", "source_url", and "reasoning".
    
    Example Output JSON Format:
    {{
      "verifications": [
        {{
          "claim_index": 1,
          "verdict": "Confirmed",
          "source_url": "https://example.com/source1",
          "reasoning": "Snippet states '...' which confirms the claim."
        }},
        {{
          "claim_index": 2,
          "verdict": "Unverifiable",
          "source_url": null,
          "reasoning": "No details found in search results to verify this statement."
        }}
      ]
    }}
    """
    
    try:
        response_text = generate_content_with_retry("llama-3.1-8b-instant", prompt, temperature=0.1, json_mode=True)
        parsed = clean_and_parse_json(response_text)
        verifications = parsed.get("verifications", [])
        
        results = []
        for idx, claim in enumerate(claims_list):
            search_results = search_results_list[idx] if idx < len(search_results_list) else []
            valid_urls = [res["url"] for res in search_results]
            
            # Find matching index from LLM output
            matching_ver = next((v for v in verifications if v.get("claim_index") == idx + 1), None)
            
            if matching_ver:
                verdict = matching_ver.get("verdict", "Unverifiable")
                source_url = matching_ver.get("source_url")
                reasoning = matching_ver.get("reasoning", "")
            else:
                verdict = "Unverifiable"
                source_url = None
                reasoning = "Not processed by model."
                
            if verdict in ["Confirmed", "Disputed"]:
                if not source_url or source_url not in valid_urls:
                    if valid_urls:
                        source_url = valid_urls[0]
                    else:
                        verdict = "Unverifiable"
                        source_url = None
            else:
                source_url = None
                
            results.append({
                "verdict": verdict,
                "source_url": source_url,
                "reasoning": reasoning
            })
            
        return results
    except Exception as e:
        print(f"Error during batch verification: {e}")
        return [{
            "verdict": "Unverifiable",
            "source_url": None,
            "reasoning": f"Batch verification failed: {e}"
        } for _ in claims_list]

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
    You are an expert Debate Judge in a Fact-Checked ArguForge AI debate.
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
