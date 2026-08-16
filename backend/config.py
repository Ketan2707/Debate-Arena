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

    # Supabase Cloud Database
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # SQLite fallback (used only if Supabase is not configured)
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

# ─── Authentication Helpers ──────────────────────────────────
import hashlib
import hmac
import base64
import time

# A secret key derived from the Groq API key — unique per deployment.
# In production, use a dedicated SECRET_KEY env variable.
_AUTH_SECRET = hashlib.sha256(
    (settings.GROQ_API_KEY or "arguforge-ai-default-secret-key-2026").encode()
).hexdigest()

def hash_password(password: str) -> str:
    """Hash a password with a random salt using SHA-256."""
    salt = base64.b64encode(hashlib.sha256(str(time.time_ns()).encode()).digest()[:16]).decode()
    hashed = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${hashed}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against a stored salt$hash string."""
    try:
        salt, expected_hash = stored_hash.split("$", 1)
        computed = hashlib.sha256((salt + password).encode()).hexdigest()
        return hmac.compare_digest(computed, expected_hash)
    except Exception:
        return False

def create_session_token(user_id: str, email: str) -> str:
    """Create a signed session token: base64(payload).base64(signature)"""
    payload = f"{user_id}|{email}|{int(time.time())}"
    payload_b64 = base64.urlsafe_b64encode(payload.encode()).decode()
    signature = hmac.new(_AUTH_SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{signature}"

def verify_session_token(token: str) -> dict | None:
    """Verify and decode a session token. Returns {user_id, email} or None."""
    try:
        payload_b64, signature = token.split(".", 1)
        expected_sig = hmac.new(_AUTH_SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None
        payload = base64.urlsafe_b64decode(payload_b64).decode()
        parts = payload.split("|")
        if len(parts) < 3:
            return None
        return {"user_id": parts[0], "email": parts[1]}
    except Exception:
        return None

