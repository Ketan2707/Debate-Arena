import os
import sys

# Ensure backend can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import database, config, search

def test_database():
    print("Testing SQLite Database initialization...")
    database.init_db()
    print("Database tables initialized successfully.")
    
    # Test debate creation
    debate_id = database.create_debate("Should EVs be mandatory by 2035?")
    print(f"Created debate with ID: {debate_id}")
    
    # Test turn saving
    turn_id = database.save_turn(debate_id, "Agent A", 1, "This is an opening statement with factual claims. EVs reduce tailpipe emissions to zero.")
    print(f"Saved turn with ID: {turn_id}")
    
    # Test claim saving with reasoning
    claim_id = database.save_claim(turn_id, "EVs reduce tailpipe emissions to zero.", "Confirmed", "https://reuters.com/ev-emissions", 1, "Reuters verified zero tailpipe emissions for battery electric vehicles.")
    print(f"Saved claim with ID: {claim_id}")
    
    # Test score saving
    database.save_score(debate_id, "Agent A", 8, 9, 7, 8.0, "Logic was sound, evidence was verified by reuters.")
    print("Saved score successfully.")
    
    # Test retrieval
    debate_details = database.get_debate_details(debate_id)
    assert debate_details is not None
    assert debate_details["topic"] == "Should EVs be mandatory by 2035?"
    assert len(debate_details["turns"]) == 1
    assert len(debate_details["turns"][0]["claims"]) == 1
    assert debate_details["turns"][0]["claims"][0]["claim_text"] == "EVs reduce tailpipe emissions to zero."
    assert debate_details["turns"][0]["claims"][0]["reasoning"] == "Reuters verified zero tailpipe emissions for battery electric vehicles."
    
    print("Database retrieval assertions passed!")

def test_domain_tiering():
    print("Testing domain tiering rules...")
    assert config.get_domain_tier("https://reuters.com/news/article") == 1
    assert config.get_domain_tier("https://apnews.com/general") == 1
    assert config.get_domain_tier("https://www.bbc.com/news") == 2
    assert config.get_domain_tier("https://nytimes.com/index.html") == 2
    assert config.get_domain_tier("https://brookings.edu/research") == 3
    assert config.get_domain_tier("https://twitter.com/someuser") is None
    assert config.get_domain_tier("https://unverifiedblog.blogspot.com") is None
    print("Domain tiering rules passed!")

def test_search_cleaning():
    print("Testing search query cleaning...")
    clean = search.clean_claim_for_query("EV's produce 50% fewer emissions [according to studies] in 2023.")
    print(f"Cleaned claim: '{clean}'")
    assert "'" not in clean
    assert "[" not in clean
    assert "]" not in clean
    print("Search cleaning rules passed!")

if __name__ == "__main__":
    print("Running backend tests...")
    test_database()
    test_domain_tiering()
    test_search_cleaning()
    print("All backend tests completed successfully!")
