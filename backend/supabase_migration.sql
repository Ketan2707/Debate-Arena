-- ============================================
-- Dialectica AI — Supabase Table Migration
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor → New Query → Paste & Run
-- ============================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 2. Debates table
CREATE TABLE IF NOT EXISTS debates (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'debate',
    stance_preference TEXT NOT NULL DEFAULT 'both',
    user_id TEXT
);


-- 3. Turns table
CREATE TABLE IF NOT EXISTS turns (
    id TEXT PRIMARY KEY,
    debate_id TEXT NOT NULL REFERENCES debates(id) ON DELETE CASCADE,
    agent TEXT NOT NULL,
    round_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 4. Claims table
CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY,
    turn_id TEXT NOT NULL REFERENCES turns(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    verdict TEXT NOT NULL,
    source_url TEXT,
    source_tier INTEGER,
    reasoning TEXT,
    cited_url TEXT
);

-- 5. Scores table
CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    debate_id TEXT NOT NULL REFERENCES debates(id) ON DELETE CASCADE,
    agent TEXT NOT NULL,
    logic INTEGER NOT NULL,
    evidence INTEGER NOT NULL,
    rebuttal INTEGER NOT NULL,
    total REAL NOT NULL,
    judge_reasoning TEXT NOT NULL
);

-- 6. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_debates_user_id ON debates(user_id);
CREATE INDEX IF NOT EXISTS idx_debates_created_at ON debates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_turns_debate_id ON turns(debate_id);
CREATE INDEX IF NOT EXISTS idx_claims_turn_id ON claims(turn_id);
CREATE INDEX IF NOT EXISTS idx_scores_debate_id ON scores(debate_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
