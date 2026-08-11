import httpx
import json
import sys

API_URL = "http://127.0.0.1:8000"

def test_full_debate_flow():
    print("Connecting to backend API...")
    
    # 1. Create a debate
    print("\n1. Testing POST /api/debates...")
    try:
        res = httpx.post(f"{API_URL}/api/debates", json={"topic": "Should electric vehicles be mandatory by 2035?"})
    except Exception as e:
        print(f"Failed to connect to FastAPI server. Is it running on port 8000? Error: {e}")
        sys.exit(1)
        
    assert res.status_code == 200
    data = res.json()
    debate_id = data["debate_id"]
    print(f"Debate created successfully. ID: {debate_id}")

    # 2. Read SSE stream
    print("\n2. Testing GET /api/debates/{id}/stream (SSE stream)...")
    turns_received = 0
    stances_received = False
    verdict_received = False
    
    with httpx.stream("GET", f"{API_URL}/api/debates/{debate_id}/stream", timeout=300.0) as r:
        assert r.status_code == 200
        event_name = None
        
        for line in r.iter_lines():
            line = line.strip()
            if not line:
                continue
            
            if line.startswith("event:"):
                event_name = line.replace("event:", "").strip()
            elif line.startswith("data:") and event_name:
                payload = json.loads(line.replace("data:", "").strip())
                print(f"Received SSE event [{event_name}]: {list(payload.keys())}")
                
                if event_name == "stances":
                    stances_received = True
                    print(f"Stances -> A: {payload['stance_a']} | B: {payload['stance_b']}")
                elif event_name == "turn":
                    turns_received += 1
                    print(f"Turn {payload['round_number']} received from {payload['agent']}. Content length: {len(payload['content'])}. Claims count: {len(payload['claims'])}")
                    for c in payload['claims']:
                        print(f"  - Claim: '{c['claim_text']}' -> Verdict: {c['verdict']} | Source: {c['source_url']} (Tier {c['source_tier']})")
                elif event_name == "verdict":
                    verdict_received = True
                    print("Judge's scorecard received!")
                    for s in payload["scores"]:
                        print(f"  - {s['agent']}: Total {s['total']} (Logic: {s['logic']}, Evidence: {s['evidence']}, Rebuttal: {s['rebuttal']})")
                elif event_name == "error":
                    print(f"Received error event: {payload}")
                    sys.exit(1)
                    
                event_name = None

    print(f"\nStream complete! Stances: {stances_received}, Turns received: {turns_received}/10, Verdict: {verdict_received}")
    assert stances_received
    assert turns_received == 10
    assert verdict_received

    # 3. Retrieve debate details from history
    print("\n3. Testing GET /api/debates/{id} (retrieve completed)...")
    res = httpx.get(f"{API_URL}/api/debates/{debate_id}")
    assert res.status_code == 200
    details = res.json()
    assert details["status"] == "completed"
    assert len(details["turns"]) == 10
    assert len(details["scores"]) == 2
    print("History retrieval verification passed successfully!")

    # 4. List all debates
    print("\n4. Testing GET /api/debates (list past debates)...")
    res = httpx.get(f"{API_URL}/api/debates")
    assert res.status_code == 200
    history = res.json()
    assert len(history) > 0
    print(f"Found {len(history)} debates in archive database.")
    
    print("\n=== ALL BACKEND API VERIFICATIONS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_full_debate_flow()
