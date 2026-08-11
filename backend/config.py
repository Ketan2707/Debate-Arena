import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Resolve project root directory relative to this config file
PROJECT_ROOT = Path(__file__).resolve().parent.parent
env_path = PROJECT_ROOT / ".env"

load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    # Optional search engine configurations
    GOOGLE_SEARCH_API_KEY: str = os.getenv("GOOGLE_SEARCH_API_KEY", "")
    GOOGLE_SEARCH_CX: str = os.getenv("GOOGLE_SEARCH_CX", "")

    # SQLite Database File
    DATABASE_URL: str = "debates.db"

    # Whitelist definition
    TIER_1_DOMAINS: list[str] = [
        "reuters.com",
        "apnews.com",
        "pib.gov.in",
        "pib.nic.in",
        "afp.com",
        "gov.in",
        "courtlistener.com",
        "supremecourt.gov",
        "congress.gov",
        "senate.gov",
        "house.gov",
        "europa.eu",
    ]

    TIER_2_DOMAINS: list[str] = [
        "bbc.com",
        "bbc.co.uk",
        "thehindu.com",
        "indianexpress.com",
        "nytimes.com",
        "theguardian.com",
        "bloomberg.com",
        "wsj.com",
        "npr.org",
        "hindustantimes.com",
        "timesofindia.indiatimes.com",
        "indiatimes.com",
        "ft.com",
        "aljazeera.com",
        "cnn.com",
        "washingtonpost.com",
        "dw.com",
        "cnbc.com",
        "nbcnews.com",
        "abcnews.go.com",
        "abcnews.com",
        "cbsnews.com",
        "sky.com",
        "news.sky.com",
    ]

    TIER_3_DOMAINS: list[str] = [
        "brookings.edu",
        "cfr.org",
        "pewresearch.org",
        "cato.org",
        "heritage.org",
        "economist.com",
        "foreignaffairs.com",
        "wikipedia.org",
    ]

    class Config:
        env_file = str(PROJECT_ROOT / ".env")
        extra = "ignore"

settings = Settings()

def get_domain_tier(url: str) -> int | None:
    """
    Parses the domain from a URL and returns its tier (1, 2, or 3).
    Returns None if the domain is not in the whitelist.
    """
    from urllib.parse import urlparse
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        # Remove 'www.' prefix if present
        if netloc.startswith("www."):
            netloc = netloc[4:]
        
        # Check direct match or suffix match (e.g. .gov or .gov.in)
        for domain in settings.TIER_1_DOMAINS:
            if netloc == domain or netloc.endswith("." + domain) or (domain in ["gov", "mil"] and netloc.endswith("." + domain)):
                return 1
        
        for domain in settings.TIER_2_DOMAINS:
            if netloc == domain or netloc.endswith("." + domain):
                return 2
                
        for domain in settings.TIER_3_DOMAINS:
            if netloc == domain or netloc.endswith("." + domain):
                return 3
                
        # Extra check for international/generic governmental domains
        if netloc.endswith(".gov") or netloc.endswith(".mil") or ".gov." in netloc or ".mil." in netloc or netloc == "europa.eu" or netloc.endswith(".europa.eu"):
            return 1
            
        # Check academic research domains
        if netloc.endswith(".edu") or ".edu." in netloc:
            return 3
            
        # Reputable organization domains (with user-content exclusions)
        if netloc.endswith(".org") or ".org." in netloc:
            excluded_orgs = ["archive.org", "wordpress.org", "change.org", "gofundme.com"]
            if not any(excl in netloc for excl in excluded_orgs):
                return 3
            
        return None
    except Exception:
        return None
