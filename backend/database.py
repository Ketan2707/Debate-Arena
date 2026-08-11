import sqlite3
import uuid
from datetime import datetime
from contextlib import contextmanager
from backend.config import settings

@contextmanager
def get_db_conn():
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

def init_db():
    with get_db_conn() as conn:
        # Create debates table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS debates (
                id TEXT PRIMARY KEY,
                topic TEXT NOT NULL,
                created_at TEXT NOT NULL,
                status TEXT NOT NULL
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
                FOREIGN KEY (turn_id) REFERENCES turns (id) ON DELETE CASCADE
            )
        """)
        
        # Check if reasoning column exists for existing databases and add it if missing
        cursor = conn.execute("PRAGMA table_info(claims)")
        columns = [row[1] for row in cursor.fetchall()]
        if "reasoning" not in columns:
            conn.execute("ALTER TABLE claims ADD COLUMN reasoning TEXT")
        
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

def create_debate(topic: str) -> str:
    debate_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    with get_db_conn() as conn:
        conn.execute(
            "INSERT INTO debates (id, topic, created_at, status) VALUES (?, ?, ?, ?)",
            (debate_id, topic, now, "running")
        )
    return debate_id

def update_debate_status(debate_id: str, status: str):
    with get_db_conn() as conn:
        conn.execute(
            "UPDATE debates SET status = ? WHERE id = ?",
            (status, debate_id)
        )

def save_turn(debate_id: str, agent: str, round_number: int, content: str) -> str:
    turn_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    with get_db_conn() as conn:
        conn.execute(
            "INSERT INTO turns (id, debate_id, agent, round_number, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (turn_id, debate_id, agent, round_number, content, now)
        )
    return turn_id

def save_claim(turn_id: str, claim_text: str, verdict: str, source_url: str | None, source_tier: int | None, reasoning: str | None = None) -> str:
    claim_id = str(uuid.uuid4())
    with get_db_conn() as conn:
        conn.execute(
            "INSERT INTO claims (id, turn_id, claim_text, verdict, source_url, source_tier, reasoning) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (claim_id, turn_id, claim_text, verdict, source_url, source_tier, reasoning)
        )
    return claim_id

def save_score(debate_id: str, agent: str, logic: int, evidence: int, rebuttal: int, total: float, judge_reasoning: str):
    score_id = str(uuid.uuid4())
    with get_db_conn() as conn:
        conn.execute(
            "INSERT INTO scores (id, debate_id, agent, logic, evidence, rebuttal, total, judge_reasoning) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (score_id, debate_id, agent, logic, evidence, rebuttal, total, judge_reasoning)
        )

def list_debates() -> list[dict]:
    with get_db_conn() as conn:
        cursor = conn.execute("SELECT * FROM debates ORDER BY created_at DESC")
        debates = [dict(row) for row in cursor.fetchall()]
        
        # Attach scorecard winner or score preview if available
        for debate in debates:
            debate_id = debate["id"]
            scores = conn.execute("SELECT agent, total FROM scores WHERE debate_id = ?", (debate_id,)).fetchall()
            debate["scores"] = [dict(s) for s in scores]
            
            # Count claims summary for the list
            claim_counts = conn.execute(
                "SELECT c.verdict, COUNT(*) as count FROM claims c "
                "JOIN turns t ON c.turn_id = t.id "
                "WHERE t.debate_id = ? "
                "GROUP BY c.verdict", (debate_id,)
            ).fetchall()
            debate["claim_stats"] = {row["verdict"]: row["count"] for row in claim_counts}
            
        return debates

def get_debate_details(debate_id: str) -> dict | None:
    with get_db_conn() as conn:
        debate_row = conn.execute("SELECT * FROM debates WHERE id = ?", (debate_id,)).fetchone()
        if not debate_row:
            return None
        
        debate = dict(debate_row)
        
        # Fetch all turns
        turns_cursor = conn.execute(
            "SELECT * FROM turns WHERE debate_id = ? ORDER BY round_number ASC, agent ASC",
            (debate_id,)
        )
        turns = [dict(t) for t in turns_cursor.fetchall()]
        
        # Fetch claims for each turn
        for turn in turns:
            claims_cursor = conn.execute(
                "SELECT * FROM claims WHERE turn_id = ?",
                (turn["id"],)
            )
            turn["claims"] = [dict(c) for c in claims_cursor.fetchall()]
            
        debate["turns"] = turns
        
        # Fetch scores
        scores_cursor = conn.execute("SELECT * FROM scores WHERE debate_id = ?", (debate_id,))
        debate["scores"] = [dict(s) for s in scores_cursor.fetchall()]
        
        return debate
