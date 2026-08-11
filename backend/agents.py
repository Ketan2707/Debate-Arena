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

def parse_topic_stances(topic: str, research_context: str = "") -> dict:
    """
    Generates opposing stances for Agent A and Agent B based on the topic and optional research.
    """
    if MOCK_MODE:
        if "electric" in topic.lower() or "ev" in topic.lower():
            return {
                "stance_a": "Electric vehicles should be made mandatory by 2035 to reduce greenhouse gas emissions and combat climate change.",
                "stance_b": "Electric vehicle mandates are premature due to grid limitations, resource constraints, and consumer readiness concerns."
            }
        return {
            "stance_a": f"AI models and automation are key drivers for efficiency and growth in '{topic}'.",
            "stance_b": f"Human oversight, economic disruptions, and ethical risks outweigh the benefits of '{topic}'."
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
    Generates a turn for a debating agent.
    """
    if MOCK_MODE:
        # Check if the topic is our EV example, and output high-quality, pre-compiled turns
        is_ev = "electric" in topic.lower() or "ev" in topic.lower()
        if is_ev:
            ev_turns = {
                ("Agent A", 1): "Electric vehicles are essential to achieve net-zero transport targets. In 2023, the global EV market share reached 18%. Furthermore, the International Energy Agency reports that EVs produce 50% fewer lifetime emissions than conventional internal combustion engine cars when charged on standard power grids.",
                ("Agent B", 1): "While electric vehicles reduce direct emissions, their mineral footprint is highly problematic. Specifically, mining cobalt and lithium for EV batteries consumes millions of gallons of water. In South America's lithium triangle, mining accounts for 65% of regional water consumption, threatening local agriculture.",
                ("Agent A", 2): "To address mineral concerns, battery recycling is scaling rapidly. The US Department of Energy states that battery recycling rates will exceed 90% by 2030. In addition, new solid-state battery chemistry reduces cobalt requirements to zero.",
                ("Agent B", 2): "Solid-state technology is still decades from commercial scale. Currently, less than 5% of lithium-ion batteries are recycled globally. The recycling process itself is highly carbon-intensive, and recycling facilities consume significant fossil fuels.",
                ("Agent A", 3): "Charging infrastructure is expanding to support cleaner grids. In 2023, the European Union approved a mandate requiring fast-chargers every 60 kilometers. By 2035, the European power grid is projected to be 85% decarbonized, making EVs virtually emissions-free.",
                ("Agent B", 3): "Grids are not ready for the demand surge. In the United States, charging a full fleet of EVs would require a 25% increase in total grid capacity. Coal and gas plants still account for 60% of US power generation, meaning EVs are powered by fossil fuels.",
                ("Agent A", 4): "Battery energy storage is key to balancing the grid demand. In 2023, global battery grid capacity grew by 120 gigawatts. Additionally, the World Health Organization reports that air pollution from combustion engines causes over 4 million premature deaths annually.",
                ("Agent B", 4): "Grid battery storage requires massive mineral scaling, which leads to child labor in the DRC. Specifically, UNICEF reports that over 40,000 children work in cobalt mines in the DRC. Mandating EVs without ethical supply chains is indefensible.",
                ("Agent A", 5): "In conclusion, electric vehicles are the only viable path to zero-emissions transit. They are highly efficient, and the grid is decarbonizing. Transitioning to EVs by 2035 is crucial for climate stability.",
                ("Agent B", 5): "In summary, EV mandates are premature. The grid capacity is insufficient, and resource depletion is severe. We must invest in hydrogen and public transit instead of forced EV adoption."
            }
            return ev_turns.get((agent_name, round_number), f"Factual claim: In 2024 global investment reached 350 billion dollars. {agent_name} supports its stance on {topic} for round {round_number}.")
        else:
            claims = [
                f"According to a 2024 survey, 65% of professionals support digital integration.",
                f"In 2023, the total revenue in this sector exceeded 1.2 trillion dollars.",
                f"Studies by the Brookings Institution show that automation improves efficiency by 40%.",
                f"A report from the World Bank in 2022 indicated that over 500 million people benefit from these services.",
                f"In 2023, global carbon emissions from transport reached 8 gigatons."
            ]
            claim_to_use = claims[round_number % len(claims)]
            return f"Regarding {topic}, we must look at the facts. {claim_to_use} Therefore, {agent_name} supports its stance on {stance} in this {round_number} round."

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
    REAL-WORLD RESEARCH & VERIFIED FACTS ABOUT THE TOPIC:
    {research_context}
    
    You MUST base your arguments, facts, and figures on the research context provided above. Do not hallucinate or invent conflicting facts.
    """

    prompt = f"""
    You are a professional debater participating in a formal debate arena.
    
    Topic: {topic}
    Your Name: {agent_name}
    Your Stance: {stance}
    Current Phase: {round_name}
    
    {research_section}
    
    DEBATE TRANSCRIPT SO FAR:
    {history_text if history_text else "[Debate is just starting. This is the first turn.]"}
    
    INSTRUCTIONS:
    1. Argue strongly and in good faith. Stick to your assigned stance.
    2. Write under 150 words. Be concise and impactful.
    3. If this is a rebuttal round, directly address and dissect the argument made by {opposing_agent} in their previous turn.
    4. CITE SPECIFIC FACTS, numbers, dates, statistics, or historical events to anchor your arguments.
    5. CRITICAL: Do NOT create links, markdown links, or invent source URLs. Just state the facts.
    6. CRITICAL: Separate factual claims from your opinion or interpretation. Structure factual claims as short, clear, discrete sentences, so a fact-checker can parse them individually.
    
    Begin your response directly with your speech. Do not add salutations like "Thank you, moderator" or "Hello, everyone." Go straight to your arguments.
    """
    
    return generate_content_with_retry("gemini-2.5-flash", prompt, temperature=temperature)

def extract_claims(turn_content: str) -> list[dict]:
    """
    Extracts objectively checkable claims from a turn's content.
    """
    if MOCK_MODE:
        claims_map = {
            "In 2023, the global EV market share reached 18%": "In 2023, the global EV market share reached 18%.",
            "EVs produce 50% fewer lifetime emissions": "EVs produce 50% fewer lifetime emissions than conventional cars.",
            "mining cobalt and lithium for EV batteries consumes millions of gallons of water": "Mining cobalt and lithium for EV battery production consumes millions of gallons of water.",
            "mining accounts for 65% of regional water consumption": "Lithium mining accounts for 65% of regional water consumption in South America.",
            "battery recycling rates will exceed 90% by 2030": "Battery recycling rates will exceed 90% by 2030.",
            "reduces cobalt requirements to zero": "New battery chemistry reduces cobalt requirements to zero.",
            "less than 5% of lithium-ion batteries are recycled globally": "Less than 5% of lithium-ion batteries are recycled globally.",
            "fast-chargers every 60 kilometers": "The European Union requires fast-chargers every 60 kilometers.",
            "European power grid is projected to be 85% decarbonized": "The European power grid is projected to be 85% decarbonized by 2035.",
            "charging a full fleet of EVs would require a 25% increase in total grid capacity": "Charging a full fleet of EVs requires a 25% increase in total grid capacity.",
            "Coal and gas plants still account for 60% of US power generation": "Coal and gas plants account for 60% of US power generation.",
            "global battery grid capacity grew by 120 gigawatts": "Global battery grid capacity grew by 120 gigawatts in 2023.",
            "air pollution from combustion engines causes over 4 million premature deaths": "Air pollution from combustion engines causes over 4 million premature deaths annually.",
            "over 40,000 children work in cobalt mines": "Over 40,000 children work in cobalt mines in the Democratic Republic of Congo."
        }
        
        extracted = []
        for key, val in claims_map.items():
            if key.lower() in turn_content.lower():
                extracted.append({"claim_text": val})
        
        if not extracted:
            # Fallback for generic mock text: grab sentences containing numbers
            sentences = re.split(r'(?<=[.!?])\s+', turn_content)
            for s in sentences:
                if any(char.isdigit() for char in s):
                    extracted.append({"claim_text": s.strip()})
        return extracted

    prompt = f"""
    You are a factual claim extraction agent.
    Analyze the following statement from a debater:
    ---
    "{turn_content}"
    ---
    
    Your task:
    1. Identify and extract only the objectively checkable factual claims (dates, historical events, statistics, numbers, scientific statements, official declarations).
    2. Ignore subjective/opinion statements, interpretations of facts, value judgments, or logical rhetoric. Do NOT check these.
    3. For each extracted factual claim, rewrite it as a short, clear, self-contained sentence. Replace pronouns like 'it', 'they', 'this', or 'the country' with the actual subject (e.g., 'EV batteries', 'United States') so that the claim can be searched.
    
    Your output MUST be a JSON object with key "claims" containing an array of objects representing checkable claims.
    Format:
    {{
      "claims": [
        {{"claim_text": "extracted checkable claim 1"}},
        {{"claim_text": "extracted checkable claim 2"}}
      ]
    }}
    If there are no factual claims, return: {{"claims": []}}.
    Do not add extra text or explanation.
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

def verify_claim(claim_text: str, search_results: list[dict]) -> dict:
    """
    Verifies a claim against search results from whitelisted domains.
    """
    if MOCK_MODE:
        # Determine contextual verdict and real whitelisted URL for our demo turns
        text_lower = claim_text.lower()
        
        if "lithium" in text_lower or "south america" in text_lower or ("water" in text_lower and "consumption" in text_lower):
            verdict = "Confirmed"
            url = "https://www.reuters.com/markets/commodities/south-america-lithium-water-usage-investigation"
            reasoning = "Reuters reports confirm that mineral mining in South America's lithium triangle consumes vast local groundwater resources, accounting for approximately 65% of regional water usage."
        elif "90% by 2030" in text_lower or "solid-state" in text_lower:
            verdict = "Disputed"
            url = "https://www.nytimes.com/2023/11/02/climate/ev-solid-state-battery-limits"
            reasoning = "The New York Times reports that while some manufacturers target solid-state scaling by 2030, energy audits suggest raw material scarcity could delay market adoption."
        elif "60 kilometers" in text_lower or "european power grid" in text_lower:
            verdict = "Confirmed"
            url = "https://europa.eu/newsroom/european-parliament-electric-charger-mandate"
            reasoning = "The official European Union Portal reports that the Parliament approved new guidelines requiring public fast-charging stations every 60km along TEN-T core roads."
        elif "25% increase" in text_lower or "coal and gas" in text_lower:
            verdict = "Disputed"
            url = "https://www.theguardian.com/environment/2023/12/05/usa-power-grid-electric-vehicle-capacity"
            reasoning = "The Guardian notes that grid scientists dispute the 25% capacity increase claim. Modern smart-charging setups are projected to limit load growth to under 10%."
        elif "child labor" in text_lower or "cobalt" in text_lower or "unicef" in text_lower:
            verdict = "Confirmed"
            url = "https://apnews.com/article/congo-cobalt-mining-human-rights-report"
            reasoning = "AP News and UNICEF reports document that artisanal cobalt mining in the DRC involves extensive child labor, with an estimated 40,000 children working in mines."
        elif "ev market share" in text_lower or "lifetime emissions" in text_lower or "internal combustion" in text_lower:
            verdict = "Confirmed"
            url = "https://apnews.com/article/electric-vehicles-emissions-iea-report"
            reasoning = "AP News verified the figures. The International Energy Agency states that global EV market share reached 18% in 2023, and lifecycle emissions remain 50% lower than traditional internal combustion engines."
        elif "brookings" in text_lower or "automation improves efficiency" in text_lower:
            verdict = "Confirmed"
            url = "https://www.brookings.edu/research/automation-and-workforce-productivity-2024"
            reasoning = "Brookings Institution research indicates that workflow automation and technological integration boost operational efficiency by up to 40%."
        elif "world bank" in text_lower or "500 million" in text_lower:
            verdict = "Confirmed"
            url = "https://www.worldbank.org/en/news/press-release/2022/digital-services-global-impact"
            reasoning = "World Bank reports validate that over 500 million individuals globally benefit from expanded digital access and utility programs."
        elif "digital integration" in text_lower or "65% of professionals" in text_lower:
            verdict = "Confirmed"
            url = "https://www.pewresearch.org/internet/2024/01/15/digital-integration-in-the-workplace"
            reasoning = "Pew Research survey data confirms that 65% of surveyed sector professionals advocate for increased digital tool integration."
        elif "1.2 trillion" in text_lower:
            verdict = "Confirmed"
            url = "https://www.bloomberg.com/news/articles/2023-12-10/global-market-revenue-analysis"
            reasoning = "Bloomberg market data reports confirm total annual revenues in this sector surpassed 1.2 trillion dollars in 2023."
        elif "8 gigatons" in text_lower:
            verdict = "Confirmed"
            url = "https://www.iea.org/reports/global-energy-co2-status-report-2023"
            reasoning = "International Energy Agency status report confirms global transport emissions reached approximately 8 gigatons."
        else:
            if search_results:
                url = search_results[0]["url"]
                domain = urllib_domain(url)
                verdict = "Confirmed"
                reasoning = f"Fact-checker verified claim against whitelisted source {domain}. The retrieved records validate that the claim matches reported figures."
            else:
                verdict = "Unverifiable"
                url = None
                reasoning = "No matching source found in the whitelisted domains."
                
        return {
            "verdict": verdict,
            "source_url": url,
            "reasoning": reasoning
        }

    if not search_results:
        return {
            "verdict": "Unverifiable",
            "source_url": None,
            "reasoning": "No matching source found in the whitelisted domains."
        }
        
    formatted_results = ""
    for idx, res in enumerate(search_results):
        formatted_results += f"[{idx+1}] URL: {res['url']}\nTitle: {res['title']}\nSnippet: {res['snippet']}\nTier: {res['tier']}\n\n"
        
    prompt = f"""
    You are a Source-Integrity Fact-Checker.
    Evaluate the following factual claim against the provided web search results.
    
    Factual Claim: "{claim_text}"
    
    Web Search Results (Restricted Whitelist):
    {formatted_results}
    
    VERDICT CRITERIA:
    - 'Confirmed': The search results directly and unambiguously support the claim.
    - 'Disputed': Credible whitelisted sources in the results directly contradict or disprove the claim.
    - 'Unverifiable': The search results do not contain enough specific details to confirm or contradict the claim. Do not guess.
    
    IMPORTANT RULES:
    1. No source link = no 'Confirmed' or 'Disputed' label allowed. If the verdict is 'Confirmed' or 'Disputed', the 'source_url' MUST be one of the exact URLs from the provided search results.
    2. If the verdict is 'Unverifiable', the 'source_url' MUST be null.
    3. Write a 1-2 sentence explanation of your reasoning based strictly on the snippets.
    
    Your output MUST be a JSON object with keys "verdict", "source_url", and "reasoning".
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
    Runs a single judge evaluation with specific agent labels.
    """
    prompt = f"""
    You are an expert Debate Judge.
    Analyze the following debate and score both participants.
    
    Topic: {topic}
    Participant 1: {agent_a_name}
    Participant 2: {agent_b_name}
    
    DEBATE TRANSCRIPT:
    {transcript}
    
    FACT-CHECK SUMMARY:
    - {agent_a_name} Claims Fact-Checked: 
      Confirmed: {claim_stats_a['Confirmed']}, Disputed: {claim_stats_a['Disputed']}, Unverifiable: {claim_stats_a['Unverifiable']}
    - {agent_b_name} Claims Fact-Checked: 
      Confirmed: {claim_stats_b['Confirmed']}, Disputed: {claim_stats_b['Disputed']}, Unverifiable: {claim_stats_b['Unverifiable']}
      
    EVALUATION CRITERIA (Score 1-10 each):
    1. Logic: Consistency of argument, clarity, logical fallacies avoided.
    2. Evidence Quality: Lower the score significantly if that participant's claims were 'Disputed' or 'Unverifiable' by the fact-checker. Good score requires high 'Confirmed' claims.
    3. Rebuttal Quality: Directness, structure, and quality of responses to the opposing party's claims.
    
    Provide your evaluation in structured JSON format with EXACTLY these keys:
    {{
      "agent_a": {{
        "logic": <int 1-10>,
        "evidence": <int 1-10>,
        "rebuttal": <int 1-10>,
        "reasoning": "<2-3 sentence summary>"
      }},
      "agent_b": {{
        "logic": <int 1-10>,
        "evidence": <int 1-10>,
        "rebuttal": <int 1-10>,
        "reasoning": "<2-3 sentence summary>"
      }}
    }}
    Do not add any other keys or formatting.
    """
    response_text = generate_content_with_retry("gemini-2.5-flash", prompt, temperature=0.2, json_mode=True)
    return clean_and_parse_json(response_text)

def evaluate_debate(topic: str, history: list[dict], claims_by_turn: dict) -> dict:
    """
    Runs the judge twice with swapped labels to eliminate position bias, then averages the scores.
    """
    if MOCK_MODE:
        # Calculate claims counts to show real-like evidence grading
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
                        
        # Penalize Agent A or B slightly if they have Disputed/Unverifiable claims
        evidence_a = max(1.0, 9.5 - (claim_stats["Agent A"]["Disputed"] * 1.5) - (claim_stats["Agent A"]["Unverifiable"] * 0.5))
        evidence_b = max(1.0, 9.0 - (claim_stats["Agent B"]["Disputed"] * 1.5) - (claim_stats["Agent B"]["Unverifiable"] * 0.5))
        
        mock_scores = {
            "Agent A": {
                "logic": 8.5,
                "evidence": round(evidence_a, 1),
                "rebuttal": 8.0,
                "reasoning": f"Agent A established a strong opening framework using detailed figures from the International Energy Agency. With {claim_stats['Agent A']['Confirmed']} confirmed claims, their evidence base remained solid, though disputed points on recycling targets slightly pulled down scores."
            },
            "Agent B": {
                "logic": 8.0,
                "evidence": round(evidence_b, 1),
                "rebuttal": 8.5,
                "reasoning": f"Agent B countered effectively by shifting focus to upstream grid shortages and the ethical implications of mining in the DRC. They maintained high rebuttal scores, though grid capacity disputes left their overall evidence at {evidence_b}/10."
            }
        }
        for agent in ["Agent A", "Agent B"]:
            mock_scores[agent]["total"] = round(
                (mock_scores[agent]["logic"] + mock_scores[agent]["evidence"] + mock_scores[agent]["rebuttal"]) / 3, 2
            )
        return mock_scores

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
