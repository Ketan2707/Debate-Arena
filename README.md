# Debate Arena

A full-stack, source-integrity-first AI debate platform. Two AI agents argue opposing sides of a user-submitted topic, an adversarial Fact-Checker agent extracts and verifies factual claims against a restricted whitelist of legitimate domains, and a Judge agent scores the debate based on logic, evidence, and rebuttal quality.

---

## Architecture

```
User submits topic
     ↓
Orchestrator (FastAPI backend)
     ↓
┌──────────────┬──────────────┬──────────────────┬─────────────┐
│   Agent A    │   Agent B    │   Fact-Checker   │    Judge    │
│ (Temp: 0.6)  │ (Temp: 0.8)  │   Agent          │    Agent    │
└──────────────┴──────────────┴──────────────────┴─────────────┘
     ↓
Streaming SSE to Frontend (live transcript & fact-check tags)
     ↓
SQLite Database (debates, turns, claims, scores)
```

### 1. Adversarial Debating Agents
*   **Agent A (Affirmative)** runs with a lower temperature (`0.6`) for highly structured, logical arguments.
*   **Agent B (Negative)** runs with a higher temperature (`0.8`) for creative, aggressive rebuttals.
*   Agents are instructed to write arguments under 150 words and output factual claims in short, discrete sentences.

### 2. Source-Integrity Fact-Checker
*   **Claim Extraction**: Parses the turn content to isolate objective claims from subjective opinions.
*   **Web Search API**: Queries whitelisted domains only. If no `GOOGLE_SEARCH_API_KEY` is provided, falls back to `duckduckgo-search` query parsing.
*   **Verification**: Evaluates search snippets to label claims `Confirmed` (matches Tier 1/2), `Disputed` (credible sources contradict), or `Unverifiable` (no matches found).
*   **Source-Tiering Logic**:
    *   **Tier 1 (Official / Wire Services)**: `reuters.com`, `apnews.com`, `pib.gov.in`, `.gov` / `.gov.in` (official records).
    *   **Tier 2 (National Press & Broadcasters)**: `bbc.com`, `nytimes.com`, `theguardian.com`, `thehindu.com`, `indianexpress.com`, etc.
    *   **Tier 3 (Think Tanks & Perspectives)**: `brookings.edu`, `cfr.org`, `pewresearch.org`, `cato.org`, etc.
    *   **Always Excluded**: Social media platforms (X/Twitter, Reddit, Facebook), forums, or unverified blogs.

### 3. Positional Bias-Free Judge
*   Runs the evaluation twice with swapped labels (Run 1: A vs B, Run 2: B vs A) to eliminate position bias.
*   Averages the scores (1-10) for logic, evidence (directly lowered by disputed/unverifiable claims), and rebuttal.

---

## Setup Instructions

### Prerequisites
*   Python 3.10+
*   Node.js (v18+) & npm

### Configuration
1.  Copy/fill the `.env` template file at the root of the project:
    ```env
    # Google Gemini API Key (Required)
    GEMINI_API_KEY=your_gemini_api_key_here

    # Google Custom Search API Settings (Optional, fallbacks to DuckDuckGo search automatically if blank)
    GOOGLE_SEARCH_API_KEY=
    GOOGLE_SEARCH_CX=
    ```

### Run the Backend (FastAPI)
1.  Navigate to the project root and activate the virtual environment:
    ```powershell
    # Windows
    .\venv\Scripts\activate
    ```
2.  Install dependencies (if not already done):
    ```bash
    pip install -r backend/requirements.txt
    ```
3.  Start the FastAPI application:
    ```bash
    uvicorn backend.main:app --reload --port 8000
    ```
    The server will run on `http://localhost:8000`.

### Run the Frontend (React + Vite)
1.  Open a new terminal tab, navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.
