import sqlite3
import uuid
from datetime import datetime, timezone
from contextlib import contextmanager
from backend.config import settings

# ─── Supabase vs SQLite Setup ────────────────────────────────

USE_SUPABASE = bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)
supabase_client = None

if USE_SUPABASE:
    from supabase import create_client, Client
    print("Database Layer: Initializing Supabase Client...")
    supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
else:
    print("Database Layer: Using Local SQLite Database...")

# SQLite context manager
@contextmanager
def get_sqlite_conn():
    conn = sqlite3.connect(settings.DATABASE_URL)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def _get_sqlite_table_columns(conn, table_name: str) -> list[str]:
    cursor = conn.execute(f"PRAGMA table_info({table_name})")
    return [row[1] for row in cursor.fetchall()]

def init_db():
    """
    Initializes local SQLite database if Supabase is not active.
    If Supabase is active, schema should be created via SQL Editor migration.
    """
    if USE_SUPABASE:
        # Schema is created via migration, but we can verify connection
        print("Database Layer: Connected to Supabase Cloud.")
        return

    with get_sqlite_conn() as conn:
        # Create users table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

        # Create debates table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS debates (
                id TEXT PRIMARY KEY,
                topic TEXT NOT NULL,
                created_at TEXT NOT NULL,
                status TEXT NOT NULL,
                mode TEXT NOT NULL DEFAULT 'debate',
                user_id TEXT
            )
        """)
        
        # Create turns table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS turns (
                id TEXT PRIMARY KEY,
                debate_id TEXT NOT NULL,
                agent TEXT NOT NULL,
                round_number INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (debate_id) REFERENCES debates (id) ON DELETE CASCADE
            )
        """)
        
        # Create claims table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS claims (
                id TEXT PRIMARY KEY,
                turn_id TEXT NOT NULL,
                claim_text TEXT NOT NULL,
                verdict TEXT NOT NULL,
                source_url TEXT,
                source_tier INTEGER,
                reasoning TEXT,
                cited_url TEXT,
                FOREIGN KEY (turn_id) REFERENCES turns (id) ON DELETE CASCADE
            )
        """)
        
        # Create scores table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                id TEXT PRIMARY KEY,
                debate_id TEXT NOT NULL,
                agent TEXT NOT NULL,
                logic INTEGER NOT NULL,
                evidence INTEGER NOT NULL,
                rebuttal INTEGER NOT NULL,
                total REAL NOT NULL,
                judge_reasoning TEXT NOT NULL,
                FOREIGN KEY (debate_id) REFERENCES debates (id) ON DELETE CASCADE
            )
        """)

        # Auto-migrations for SQLite
        claims_cols = _get_sqlite_table_columns(conn, "claims")
        if "reasoning" not in claims_cols:
            conn.execute("ALTER TABLE claims ADD COLUMN reasoning TEXT")
        if "cited_url" not in claims_cols:
            conn.execute("ALTER TABLE claims ADD COLUMN cited_url TEXT")

        debates_cols = _get_sqlite_table_columns(conn, "debates")
        if "mode" not in debates_cols:
            conn.execute("ALTER TABLE debates ADD COLUMN mode TEXT NOT NULL DEFAULT 'debate'")
        if "stance_preference" not in debates_cols:
            conn.execute("ALTER TABLE debates ADD COLUMN stance_preference TEXT NOT NULL DEFAULT 'both'")
        if "user_id" not in debates_cols:
            conn.execute("ALTER TABLE debates ADD COLUMN user_id TEXT")


# ─── User CRUD ───────────────────────────────────────────────

def create_user(email: str, password_hash: str) -> str:
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    clean_email = email.lower().strip()
    
    if USE_SUPABASE:
        supabase_client.table("users").insert({
            "id": user_id,
            "email": clean_email,
            "password_hash": password_hash,
            "created_at": now
        }).execute()
    else:
        with get_sqlite_conn() as conn:
            conn.execute(
                "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                (user_id, clean_email, password_hash, now)
            )
    return user_id

def get_user_by_email(email: str) -> dict | None:
    clean_email = email.lower().strip()
    
    if USE_SUPABASE:
        res = supabase_client.table("users").select("*").eq("email", clean_email).execute()
        return res.data[0] if res.data else None
    else:
        with get_sqlite_conn() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE email = ?", (clean_email,)
            ).fetchone()
            return dict(row) if row else None

def get_user_by_id(user_id: str) -> dict | None:
    if USE_SUPABASE:
        res = supabase_client.table("users").select("id", "email", "created_at").eq("id", user_id).execute()
        return res.data[0] if res.data else None
    else:
        with get_sqlite_conn() as conn:
            row = conn.execute(
                "SELECT id, email, created_at FROM users WHERE id = ?", (user_id,)
            ).fetchone()
            return dict(row) if row else None

# ─── Debate CRUD ─────────────────────────────────────────────

def create_debate(topic: str, mode: str = "debate", user_id: str | None = None, stance_preference: str = "both") -> str:
    debate_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    if USE_SUPABASE:
        supabase_client.table("debates").insert({
            "id": debate_id,
            "topic": topic,
            "created_at": now,
            "status": "running",
            "mode": mode,
            "stance_preference": stance_preference,
            "user_id": user_id
        }).execute()
    else:
        with get_sqlite_conn() as conn:
            conn.execute(
                "INSERT INTO debates (id, topic, created_at, status, mode, stance_preference, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (debate_id, topic, now, "running", mode, stance_preference, user_id)
            )
    return debate_id

def update_debate_status(debate_id: str, status: str):
    if USE_SUPABASE:
        supabase_client.table("debates").update({"status": status}).eq("id", debate_id).execute()
    else:
        with get_sqlite_conn() as conn:
            conn.execute(
                "UPDATE debates SET status = ? WHERE id = ?",
                (status, debate_id)
            )

def save_turn(debate_id: str, agent: str, round_number: int, content: str) -> str:
    turn_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    if USE_SUPABASE:
        supabase_client.table("turns").insert({
            "id": turn_id,
            "debate_id": debate_id,
            "agent": agent,
            "round_number": round_number,
            "content": content,
            "created_at": now
        }).execute()
    else:
        with get_sqlite_conn() as conn:
            conn.execute(
                "INSERT INTO turns (id, debate_id, agent, round_number, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (turn_id, debate_id, agent, round_number, content, now)
            )
    return turn_id

def save_claim(turn_id: str, claim_text: str, verdict: str, source_url: str | None, source_tier: int | None, reasoning: str | None = None, cited_url: str | None = None) -> str:
    claim_id = str(uuid.uuid4())
    
    if USE_SUPABASE:
        supabase_client.table("claims").insert({
            "id": claim_id,
            "turn_id": turn_id,
            "claim_text": claim_text,
            "verdict": verdict,
            "source_url": source_url,
            "source_tier": source_tier,
            "reasoning": reasoning,
            "cited_url": cited_url
        }).execute()
    else:
        with get_sqlite_conn() as conn:
            conn.execute(
                "INSERT INTO claims (id, turn_id, claim_text, verdict, source_url, source_tier, reasoning, cited_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (claim_id, turn_id, claim_text, verdict, source_url, source_tier, reasoning, cited_url)
            )
    return claim_id

def save_score(debate_id: str, agent: str, logic: int, evidence: int, rebuttal: int, total: float, judge_reasoning: str):
    score_id = str(uuid.uuid4())
    
    if USE_SUPABASE:
        supabase_client.table("scores").insert({
            "id": score_id,
            "debate_id": debate_id,
            "agent": agent,
            "logic": logic,
            "evidence": evidence,
            "rebuttal": rebuttal,
            "total": total,
            "judge_reasoning": judge_reasoning
        }).execute()
    else:
        with get_sqlite_conn() as conn:
            conn.execute(
                "INSERT INTO scores (id, debate_id, agent, logic, evidence, rebuttal, total, judge_reasoning) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (score_id, debate_id, agent, logic, evidence, rebuttal, total, judge_reasoning)
            )

def list_debates(user_id: str = None) -> list[dict]:
    if not user_id:
        return []
    if USE_SUPABASE:
        res = supabase_client.table("debates").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        debates = res.data or []
        for d in debates:
            debate_id = d["id"]
            # Fetch scores
            scores_res = supabase_client.table("scores").select("agent", "total").eq("debate_id", debate_id).execute()
            d["scores"] = scores_res.data or []
            
            # Fetch claims for stats
            turns_res = supabase_client.table("turns").select("id").eq("debate_id", debate_id).execute()
            turn_ids = [t["id"] for t in (turns_res.data or [])]
            claim_stats = {"Confirmed": 0, "Disputed": 0, "Unverifiable": 0}
            if turn_ids:
                claims_res = supabase_client.table("claims").select("verdict").in_("turn_id", turn_ids).execute()
                for c in (claims_res.data or []):
                    verdict = c["verdict"]
                    if verdict in claim_stats:
                        claim_stats[verdict] += 1
                    else:
                        claim_stats["Unverifiable"] += 1
            d["claim_stats"] = claim_stats
        return debates
    else:
        with get_sqlite_conn() as conn:
            cursor = conn.execute("SELECT * FROM debates WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
            debates = [dict(row) for row in cursor.fetchall()]
            
            for debate in debates:
                debate_id = debate["id"]
                scores = conn.execute("SELECT agent, total FROM scores WHERE debate_id = ?", (debate_id,)).fetchall()
                debate["scores"] = [dict(s) for s in scores]
                
                claim_counts = conn.execute(
                    "SELECT c.verdict, COUNT(*) as count FROM claims c "
                    "JOIN turns t ON c.turn_id = t.id "
                    "WHERE t.debate_id = ? "
                    "GROUP BY c.verdict", (debate_id,)
                ).fetchall()
                debate["claim_stats"] = {row["verdict"]: row["count"] for row in claim_counts}
                
            return debates

def get_debate_details(debate_id: str) -> dict | None:
    if USE_SUPABASE:
        debate_res = supabase_client.table("debates").select("*").eq("id", debate_id).execute()
        if not debate_res.data:
            return None
        debate = debate_res.data[0]
        
        # Fetch turns
        turns_res = supabase_client.table("turns").select("*").eq("debate_id", debate_id).order("round_number", desc=False).order("agent", desc=False).execute()
        turns = turns_res.data or []
        
        for turn in turns:
            claims_res = supabase_client.table("claims").select("*").eq("turn_id", turn["id"]).execute()
            turn["claims"] = claims_res.data or []
            
        debate["turns"] = turns
        
        # Fetch scores
        scores_res = supabase_client.table("scores").select("*").eq("debate_id", debate_id).execute()
        debate["scores"] = scores_res.data or []
        
        return debate
    else:
        with get_sqlite_conn() as conn:
            debate_row = conn.execute("SELECT * FROM debates WHERE id = ?", (debate_id,)).fetchone()
            if not debate_row:
                return None
            
            debate = dict(debate_row)
            
            turns_cursor = conn.execute(
                "SELECT * FROM turns WHERE debate_id = ? ORDER BY round_number ASC, agent ASC",
                (debate_id,)
            )
            turns = [dict(t) for t in turns_cursor.fetchall()]
            
            for turn in turns:
                claims_cursor = conn.execute(
                    "SELECT * FROM claims WHERE turn_id = ?",
                    (turn["id"],)
                )
                turn["claims"] = [dict(c) for c in claims_cursor.fetchall()]
                
            debate["turns"] = turns
            
            scores_cursor = conn.execute("SELECT * FROM scores WHERE debate_id = ?", (debate_id,))
            debate["scores"] = [dict(s) for s in scores_cursor.fetchall()]
            
            return debate
