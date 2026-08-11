import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Shield, RefreshCw, Award, BookOpen, AlertTriangle, 
  CheckCircle, HelpCircle, ChevronRight, History, ArrowLeft, 
  ExternalLink, Sparkles, MessageSquare, Info, Star 
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

function App() {
  const [activeView, setActiveView] = useState('landing'); // 'landing', 'debate', 'history'
  const [topicInput, setTopicInput] = useState('');
  const [activeDebateId, setActiveDebateId] = useState(null);
  const [debateTopic, setDebateTopic] = useState('');
  const [stances, setStances] = useState({ stance_a: '', stance_b: '' });
  const [turns, setTurns] = useState([]);
  const [status, setStatus] = useState({ status: 'idle' }); // { status, agent, round_number }
  const [scores, setScores] = useState([]);
  const [error, setError] = useState(null);
  
  // Detail selection state for the sidebar/modal fact-check display
  const [selectedClaim, setSelectedClaim] = useState(null);
  
  // History state
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // SSE event source ref
  const eventSourceRef = useRef(null);
  const turnsEndRef = useRef(null);

  // Auto-scroll when new turns arrive
  useEffect(() => {
    if (turnsEndRef.current) {
      turnsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [turns, status]);

  // Load history list
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE}/api/debates`);
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      } else {
        console.error("Failed to fetch history");
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Start a new debate
  const handleStartDebate = async (e) => {
    if (e) e.preventDefault();
    const topic = topicInput.trim() || "Should electric vehicles be mandatory by 2035?";
    setError(null);
    setTurns([]);
    setScores([]);
    setStances({ stance_a: '', stance_b: '' });
    setSelectedClaim(null);
    setDebateTopic(topic);
    
    try {
      setStatus({ status: 'creating', agent: 'Orchestrator' });
      setActiveView('debate');
      
      const res = await fetch(`${API_BASE}/api/debates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      
      if (!res.ok) {
        throw new Error("Failed to initialize debate");
      }
      
      const data = await res.json();
      setActiveDebateId(data.debate_id);
      connectToStream(data.debate_id);
    } catch (err) {
      setError(err.message || "Something went wrong. Make sure backend is running.");
      setStatus({ status: 'idle' });
    }
  };

  // Connect to the SSE stream
  const connectToStream = (debateId) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    const source = new EventSource(`${API_BASE}/api/debates/${debateId}/stream`);
    eventSourceRef.current = source;
    
    source.addEventListener('stances', (e) => {
      const data = JSON.parse(e.data);
      setStances(data);
    });
    
    source.addEventListener('status', (e) => {
      const data = JSON.parse(e.data);
      setStatus(data);
    });
    
    source.addEventListener('turn', (e) => {
      const data = JSON.parse(e.data);
      setTurns((prev) => {
        if (prev.some((t) => t.id === data.id)) return prev;
        return [...prev, data];
      });
    });
    
    source.addEventListener('verdict', (e) => {
      const data = JSON.parse(e.data);
      setScores(data.scores);
      setStatus({ status: 'idle' });
      source.close();
    });
    
    source.addEventListener('error', (e) => {
      const data = JSON.parse(e.data);
      setError(data.error);
      setStatus({ status: 'idle' });
      source.close();
    });
    
    source.onerror = (err) => {
      console.error("SSE stream error:", err);
      setError("Network connection lost. The debate may still be generating on the backend; check back in history or refresh.");
      setStatus({ status: 'idle' });
      source.close();
    };
  };

  // View past debate from history
  const handleViewPastDebate = async (debateId) => {
    setError(null);
    setTurns([]);
    setScores([]);
    setSelectedClaim(null);
    setStatus({ status: 'loading', agent: 'Orchestrator' });
    setActiveView('debate');
    
    try {
      const res = await fetch(`${API_BASE}/api/debates/${debateId}`);
      if (!res.ok) throw new Error("Failed to load debate history details");
      const data = await res.json();
      
      setDebateTopic(data.topic);
      setTurns(data.turns || []);
      setScores(data.scores || []);
      
      // Attempt to load stances from the first turns or fall back to generic
      setStances({
        stance_a: "In support of the topic",
        stance_b: "Opposing the topic"
      });
      
      setStatus({ status: 'idle' });
    } catch (err) {
      setError(err.message);
      setStatus({ status: 'idle' });
    }
  };

  // Clean up EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Format date helper
  const formatDate = (isoStr) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to parse claims and apply dynamic underlines
  const renderContentWithClaims = (content, claims) => {
    if (!claims || claims.length === 0) {
      return <p className="text-slate-300 leading-relaxed font-sans">{content}</p>;
    }
    
    let segments = [];
    let lastIndex = 0;
    
    // Extract exact matches in the text
    let matches = [];
    claims.forEach((claim) => {
      const text = claim.claim_text.trim();
      let index = content.indexOf(text);
      if (index === -1) {
        const normalizedContent = content.toLowerCase();
        const normalizedClaim = text.toLowerCase();
        index = normalizedContent.indexOf(normalizedClaim);
      }
      
      if (index !== -1) {
        matches.push({
          start: index,
          end: index + text.length,
          claim: claim
        });
      }
    });
    
    // Sort by starting index and avoid overlaps
    matches.sort((a, b) => a.start - b.start);
    
    let filteredMatches = [];
    let currentEnd = 0;
    for (let match of matches) {
      if (match.start >= currentEnd) {
        filteredMatches.push(match);
        currentEnd = match.end;
      }
    }
    
    if (filteredMatches.length === 0) {
      return <p className="text-slate-300 leading-relaxed font-sans">{content}</p>;
    }
    
    let parts = [];
    let idx = 0;
    for (let match of filteredMatches) {
      if (match.start > idx) {
        parts.push(content.substring(idx, match.start));
      }
      
      const claimText = content.substring(match.start, match.end);
      const verdict = match.claim.verdict;
      
      let borderStyle = 'border-slate-500 text-slate-100 hover:bg-slate-800/40';
      if (verdict === 'Confirmed') borderStyle = 'border-emerald-500/80 text-emerald-100 hover:bg-emerald-950/20';
      if (verdict === 'Disputed') borderStyle = 'border-amber-500/80 text-amber-100 hover:bg-amber-950/20';
      
      parts.push(
        <span 
          key={match.claim.id || match.start}
          onClick={() => setSelectedClaim(match.claim)}
          className={`cursor-pointer inline transition-all border-b-2 decoration-dotted pb-0.5 ${borderStyle}`}
          title="Click to view source integrity check"
        >
          {claimText}
          <span className={`inline-flex items-center justify-center rounded-full ml-1.5 px-1 py-0.5 text-[9px] font-extrabold select-none ${
            verdict === 'Confirmed' 
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' 
              : verdict === 'Disputed' 
              ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30' 
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            {verdict === 'Confirmed' ? '✓' : verdict === 'Disputed' ? '⚠️' : '?'}
          </span>
        </span>
      );
      
      idx = match.end;
    }
    
    if (idx < content.length) {
      parts.push(content.substring(idx));
    }
    
    return <p className="text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">{parts}</p>;
  };

  // Calculate winner for card preview
  const getWinner = (debateScores) => {
    if (!debateScores || debateScores.length === 0) return null;
    const scoreA = debateScores.find(s => s.agent === 'Agent A')?.total || 0;
    const scoreB = debateScores.find(s => s.agent === 'Agent B')?.total || 0;
    if (scoreA > scoreB) return 'Agent A';
    if (scoreB > scoreA) return 'Agent B';
    return 'Tie';
  };

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col antialiased">
      {/* Top Header */}
      <header className="border-b border-brand-border bg-brand-dark/95 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => {
            if (status.status === 'idle') {
              setActiveView('landing');
            }
          }}
        >
          <div className="bg-brand-accent p-2 rounded-lg text-brand-dark font-extrabold flex items-center justify-center shadow-lg shadow-brand-accent/15">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-serif text-brand-textLight">Debate Arena</h1>
            <span className="text-[10px] text-brand-textMuted tracking-wider uppercase font-semibold font-sans">Source Integrity Verification</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {activeView !== 'landing' && (
            <button 
              onClick={() => {
                if (status.status === 'idle' || confirm("A debate is currently active. Stop and return home?")) {
                  if (eventSourceRef.current) eventSourceRef.current.close();
                  setStatus({ status: 'idle' });
                  setActiveView('landing');
                }
              }}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
            >
              New Debate
            </button>
          )}
          <button 
            onClick={() => {
              if (status.status === 'idle' || confirm("Leave active debate?")) {
                if (eventSourceRef.current) eventSourceRef.current.close();
                setStatus({ status: 'idle' });
                loadHistory();
                setActiveView('history');
              }
            }}
            className="flex items-center space-x-2 bg-brand-panel hover:bg-brand-border border border-brand-border px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white transition-all duration-200"
          >
            <History className="h-4 w-4 text-brand-accent" />
            <span>Debate Archive</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center">
        
        {/* VIEW 1: LANDING VIEW */}
        {activeView === 'landing' && (
          <div className="max-w-2xl mx-auto w-full py-16 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="inline-flex items-center justify-center bg-brand-accent/10 border border-brand-accent/20 px-3 py-1.5 rounded-full mb-6 text-xs text-brand-accent font-semibold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5 mr-2 animate-pulse" />
              Fact-Checked AI Debate Chamber
            </div>
            <h2 className="text-5xl font-bold font-serif mb-4 leading-tight text-brand-textLight">
              Where AI models debate.<br/>
              Where <span className="underline decoration-brand-accent decoration-2 underline-offset-8">credible sources</span> settle claims.
            </h2>
            <p className="text-brand-textMuted text-lg mb-10 max-w-lg font-sans font-light leading-relaxed">
              Submit any debate topic. Two adversarial Gemini agents construct arguments, a Fact-Checker scrubs every claim against a restricted domain whitelist, and a Judge awards scores.
            </p>
            
            <form onSubmit={handleStartDebate} className="w-full relative group">
              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full bg-brand-panel/60 p-2.5 rounded-2xl border border-brand-border focus-within:border-brand-accent transition-all duration-300 shadow-2xl">
                <input 
                  type="text" 
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="Should electric vehicles be mandatory by 2035?"
                  className="flex-1 bg-transparent px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none font-sans text-md"
                />
                <button 
                  type="submit"
                  className="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark px-6 py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-200 group-hover:scale-[1.01]"
                >
                  <Play className="h-4 w-4 fill-brand-dark" />
                  <span>Start Debate</span>
                </button>
              </div>
            </form>
            
            {/* Quick prefill examples */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-brand-textMuted mr-2">Try examples:</span>
              <button 
                onClick={() => { setTopicInput("Should electric vehicles be mandatory by 2035?"); }}
                className="bg-brand-panel/40 border border-brand-border text-xs px-3.5 py-1.5 rounded-full text-slate-400 hover:text-white hover:border-brand-accent transition-colors"
              >
                Electric Vehicles (Neutral)
              </button>
              <button 
                onClick={() => { setTopicInput("Is artificial intelligence a net benefit to public education?"); }}
                className="bg-brand-panel/40 border border-brand-border text-xs px-3.5 py-1.5 rounded-full text-slate-400 hover:text-white hover:border-brand-accent transition-colors"
              >
                AI in Education
              </button>
              <button 
                onClick={() => { setTopicInput("Should lab-grown meat be certified for commercial scale distribution?"); }}
                className="bg-brand-panel/40 border border-brand-border text-xs px-3.5 py-1.5 rounded-full text-slate-400 hover:text-white hover:border-brand-accent transition-colors"
              >
                Lab-Grown Meat
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: ACTIVE DEBATE / TRANSCRIPT STREAM */}
        {activeView === 'debate' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
            {/* Left Side: Topic Title & Stances */}
            <div className="lg:col-span-3 flex flex-col space-y-6">
              
              {/* Active topic display card */}
              <div className="bg-brand-panel border border-brand-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-brand-accent/5 rounded-full filter blur-2xl pointer-events-none"></div>
                <div className="flex items-center space-x-2 text-brand-accent text-xs font-semibold mb-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>ACTIVE DEBATE ROOM</span>
                </div>
                <h3 className="text-3xl font-bold font-serif mb-4 leading-snug">{debateTopic}</h3>
                
                {stances.stance_a && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-brand-border/60">
                    <div className="bg-brand-dark/50 p-4 rounded-xl border border-brand-border/60">
                      <div className="text-xs text-brand-accent font-semibold mb-1 uppercase tracking-wider">Agent A (Affirmative)</div>
                      <p className="text-sm text-slate-300 font-sans">{stances.stance_a}</p>
                    </div>
                    <div className="bg-brand-dark/50 p-4 rounded-xl border border-brand-border/60">
                      <div className="text-xs text-brand-accentAmber font-semibold mb-1 uppercase tracking-wider">Agent B (Negative)</div>
                      <p className="text-sm text-slate-300 font-sans">{stances.stance_b}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Debate Chamber: Two columns scroll view */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[450px]">
                {/* Agent A Column */}
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-brand-accent/15 border border-brand-accent/30 rounded-full self-start">
                    <div className="h-2 w-2 bg-brand-accent rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-100 tracking-wider">AGENT A</span>
                  </div>

                  {turns
                    .filter((t) => t.agent === 'Agent A')
                    .map((turn, index) => (
                      <div 
                        key={turn.id} 
                        className="bg-brand-panel border border-brand-border/80 rounded-2xl p-5 shadow-md flex flex-col space-y-3 animate-fade-in relative hover:border-brand-accent/30 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] text-brand-textMuted border-b border-brand-border/40 pb-2">
                          <span className="font-semibold tracking-wider font-sans uppercase">Round {turn.round_number} ({turn.round_number === 1 ? 'Opening' : turn.round_number === 5 ? 'Closing' : 'Rebuttal'})</span>
                        </div>
                        {renderContentWithClaims(turn.content, turn.claims)}
                      </div>
                    ))}

                  {status.agent === 'Agent A' && (
                    <div className="bg-brand-panel/40 border border-brand-border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 text-center">
                      <div className="bg-brand-accent/10 p-3 rounded-full text-brand-accent animate-spin duration-3000">
                        <RefreshCw className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-300">
                          {status.status === 'writing' ? "Agent A is formulating statement..." : "Fact-checking Agent A's claims..."}
                        </p>
                        <span className="text-xs text-brand-textMuted font-sans">
                          {status.status === 'writing' ? "Generating structured arguments under 150 words" : "Scrubbing claims against whitelist domains..."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Agent B Column */}
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-brand-accentAmber/15 border border-brand-accentAmber/30 rounded-full self-start">
                    <div className="h-2 w-2 bg-brand-accentAmber rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-100 tracking-wider">AGENT B</span>
                  </div>

                  {turns
                    .filter((t) => t.agent === 'Agent B')
                    .map((turn, index) => (
                      <div 
                        key={turn.id} 
                        className="bg-brand-panel border border-brand-border/80 rounded-2xl p-5 shadow-md flex flex-col space-y-3 animate-fade-in relative hover:border-brand-accentAmber/30 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] text-brand-textMuted border-b border-brand-border/40 pb-2">
                          <span className="font-semibold tracking-wider font-sans uppercase">Round {turn.round_number} ({turn.round_number === 1 ? 'Opening' : turn.round_number === 5 ? 'Closing' : 'Rebuttal'})</span>
                        </div>
                        {renderContentWithClaims(turn.content, turn.claims)}
                      </div>
                    ))}

                  {status.agent === 'Agent B' && (
                    <div className="bg-brand-panel/40 border border-brand-border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 text-center">
                      <div className="bg-brand-accentAmber/10 p-3 rounded-full text-brand-accentAmber animate-spin duration-3000">
                        <RefreshCw className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-300">
                          {status.status === 'writing' ? "Agent B is formulating statement..." : "Fact-checking Agent B's claims..."}
                        </p>
                        <span className="text-xs text-brand-textMuted font-sans">
                          {status.status === 'writing' ? "Analyzing opponent arguments and citing facts" : "Scrubbing claims against whitelist domains..."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div ref={turnsEndRef} />

              {/* Status display for Judging state */}
              {status.agent === 'Judge' && (
                <div className="bg-brand-panel border border-brand-border rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                  <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-full text-indigo-400 animate-pulse">
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold font-serif text-slate-200">The Judge Agent is evaluating the debate...</h4>
                    <p className="text-sm text-brand-textMuted max-w-md mx-auto font-sans mt-2">
                      Running double-blind grading models (A vs B and B vs A swapped) to remove position bias. Comparing logic validity, scoring evidence quality directly based on fact-checker verdicts, and evaluating rebuttals.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Callout */}
              {error && (
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-5 flex items-start space-x-3.5 text-rose-200">
                  <AlertTriangle className="h-6 w-6 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">Debate Engine Interrupted</h5>
                    <p className="text-xs text-rose-300/90 font-sans mt-1 leading-relaxed">{error}</p>
                    <button 
                      onClick={() => handleStartDebate()}
                      className="mt-3 bg-rose-500 hover:bg-rose-600 text-brand-dark px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Retry Debate
                    </button>
                  </div>
                </div>
              )}

              {/* Scorecard Panel (Triggered after judging ends) */}
              {scores && scores.length > 0 && (
                <div className="bg-brand-panel border border-brand-border rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in">
                  <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                    <Award className="h-4 w-4" />
                    <span>Official Scorecard</span>
                  </div>
                  
                  <h4 className="text-2xl font-bold font-serif text-brand-textLight">Judge's Final Verdict</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brand-border/60">
                    {/* Agent A Score block */}
                    {scores.map((score, index) => {
                      const isA = score.agent === 'Agent A';
                      return (
                        <div key={score.agent} className={`p-5 rounded-xl border ${isA ? 'border-brand-accent/20 bg-brand-accent/5' : 'border-brand-accentAmber/20 bg-brand-accentAmber/5'} flex flex-col space-y-4`}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold font-serif text-lg text-slate-200">{score.agent}</span>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-3xl font-extrabold text-white">{score.total}</span>
                              <span className="text-xs text-slate-400">/ 10</span>
                            </div>
                          </div>

                          {/* Score breakdowns */}
                          <div className="space-y-2 text-sm">
                            <div>
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Logic Validity</span>
                                <span className="font-bold text-slate-200">{score.logic}/10</span>
                              </div>
                              <div className="h-2 w-full bg-brand-dark rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${isA ? 'bg-brand-accent' : 'bg-brand-accentAmber'}`} 
                                  style={{ width: `${score.logic * 10}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Evidence Quality (Fact-Checker Grounded)</span>
                                <span className="font-bold text-slate-200">{score.evidence}/10</span>
                              </div>
                              <div className="h-2 w-full bg-brand-dark rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${isA ? 'bg-brand-accent' : 'bg-brand-accentAmber'}`} 
                                  style={{ width: `${score.evidence * 10}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Rebuttal effectiveness</span>
                                <span className="font-bold text-slate-200">{score.rebuttal}/10</span>
                              </div>
                              <div className="h-2 w-full bg-brand-dark rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${isA ? 'bg-brand-accent' : 'bg-brand-accentAmber'}`} 
                                  style={{ width: `${score.rebuttal * 10}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-brand-dark/40 p-4 rounded-lg border border-brand-border/60 text-xs text-slate-300 font-sans leading-relaxed">
                            <strong className="block text-brand-textLight mb-1.5 font-serif text-[13px]">Judge Reasoning:</strong>
                            {score.judge_reasoning}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Column (Desktop Sidebar): Claims Inspection Tooltip Panel */}
            <div className="lg:col-span-1 flex flex-col space-y-6">
              <div className="bg-brand-panel border border-brand-border rounded-2xl p-5 shadow-xl flex flex-col space-y-4 sticky top-24">
                <div className="flex items-center space-x-2 text-brand-textMuted border-b border-brand-border/40 pb-3">
                  <Shield className="h-4.5 w-4.5 text-brand-accent" />
                  <h4 className="text-sm font-bold tracking-wider uppercase font-sans">Fact-Checker Log</h4>
                </div>

                {!selectedClaim ? (
                  <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-3">
                    <Info className="h-10 w-10 text-brand-border/80" />
                    <div>
                      <h5 className="font-serif text-slate-300 font-semibold">Inspect Claims</h5>
                      <p className="text-xs text-brand-textMuted font-sans mt-1 leading-relaxed">
                        Factual statements in the debate transcript are underlined. Click on any underlined text to inspect source verification files.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4 animate-fade-in">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          selectedClaim.verdict === 'Confirmed' 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' 
                            : selectedClaim.verdict === 'Disputed' 
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {selectedClaim.verdict === 'Confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {selectedClaim.verdict === 'Disputed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {selectedClaim.verdict === 'Unverifiable' && <HelpCircle className="h-3 w-3 mr-1" />}
                          <span>{selectedClaim.verdict}</span>
                        </span>
                        
                        {selectedClaim.source_tier && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                            Tier {selectedClaim.source_tier} Source
                          </span>
                        )}
                      </div>
                      
                      <h5 className="text-xs text-brand-textMuted uppercase font-bold tracking-wider font-sans mb-1">FACTUAL CLAIM:</h5>
                      <p className="text-sm font-sans font-medium text-slate-200 leading-relaxed bg-brand-dark/50 p-3 rounded-lg border border-brand-border/40">
                        "{selectedClaim.claim_text}"
                      </p>
                    </div>

                    <div className="border-t border-brand-border/40 pt-4 flex flex-col space-y-3">
                      <div>
                        <span className="text-xs text-brand-textMuted uppercase font-bold tracking-wider font-sans block mb-1">Verification Reasoning:</span>
                        <p className="text-xs text-slate-300 font-sans leading-relaxed">
                          {selectedClaim.reasoning}
                        </p>
                      </div>

                      {selectedClaim.source_url ? (
                        <div>
                          <span className="text-xs text-brand-textMuted uppercase font-bold tracking-wider font-sans block mb-1">Official Reference:</span>
                          <a 
                            href={selectedClaim.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 text-brand-accent hover:text-brand-accent/80 text-xs font-medium border-b border-brand-accent/30 pb-0.5 break-all leading-relaxed"
                          >
                            <span>{new URL(selectedClaim.source_url).hostname}</span>
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                          </a>
                          
                          <span className="block text-[10px] text-brand-textMuted font-sans mt-2">
                            {selectedClaim.source_tier === 1 && "✓ Tier 1 (Wire service or official public record, high authority)"}
                            {selectedClaim.source_tier === 2 && "✓ Tier 2 (Established national/international newspaper, high authority)"}
                            {selectedClaim.source_tier === 3 && "✓ Tier 3 (Advocacy organization, think tank, or perspective piece)"}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-slate-900/40 p-3 rounded border border-brand-border/40 text-[10px] text-brand-textMuted font-sans leading-relaxed">
                          No source link verified. Under source-integrity rules, claims without a verifiable whitelisted domain citation must be labeled Unverifiable.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: PAST DEBATES HISTORY */}
        {activeView === 'history' && (
          <div className="max-w-4xl mx-auto w-full py-8 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold font-serif text-brand-textLight">Debate Archive</h3>
                <p className="text-sm text-brand-textMuted font-sans mt-1">Review past debates, judges' scoring cards, and fact-checking trails.</p>
              </div>
              <button 
                onClick={() => setActiveView('landing')}
                className="flex items-center space-x-2 bg-brand-panel hover:bg-brand-border border border-brand-border px-4 py-2 rounded-lg text-sm transition-colors text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back Home</span>
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="h-8 w-8 text-brand-accent animate-spin" />
                <span className="text-sm text-brand-textMuted">Loading saved debates...</span>
              </div>
            ) : historyList.length === 0 ? (
              <div className="bg-brand-panel border border-brand-border rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4">
                <BookOpen className="h-12 w-12 text-brand-border" />
                <div>
                  <h4 className="font-serif text-lg font-semibold text-slate-300">No debates in archive</h4>
                  <p className="text-xs text-brand-textMuted font-sans mt-1 max-w-xs mx-auto leading-relaxed">
                    Create and run your first debate. Once it completes, the transcript and fact-checking data are saved here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historyList.map((debate) => {
                  const winner = getWinner(debate.scores);
                  const confCount = debate.claim_stats?.Confirmed || 0;
                  const dispCount = debate.claim_stats?.Disputed || 0;
                  const unverCount = debate.claim_stats?.Unverifiable || 0;
                  
                  return (
                    <div 
                      key={debate.id}
                      onClick={() => handleViewPastDebate(debate.id)}
                      className="bg-brand-panel border border-brand-border rounded-xl p-5 hover:border-brand-accent hover:scale-[1.01] cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-brand-textMuted font-sans font-semibold">
                          <span>{formatDate(debate.created_at)}</span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                            debate.status === 'completed' 
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' 
                              : debate.status === 'failed'
                              ? 'bg-rose-950/40 text-rose-400 border border-rose-500/20'
                              : 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 animate-pulse'
                          }`}>
                            {debate.status}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-lg text-slate-100 group-hover:text-brand-textLight transition-colors leading-snug">
                          {debate.topic}
                        </h4>
                      </div>

                      {debate.status === 'completed' && debate.scores?.length > 0 && (
                        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
                          <span className="text-brand-textMuted font-sans flex items-center">
                            Winner: <strong className="text-indigo-400 ml-1 font-serif font-bold flex items-center">
                              {winner === 'Tie' ? 'Tie' : winner}
                              {winner !== 'Tie' && <Star className="h-3 w-3 fill-indigo-400 ml-0.5" />}
                            </strong>
                          </span>
                          
                          {/* Claim stats preview */}
                          <div className="flex items-center space-x-2 text-[10px] font-sans font-bold">
                            <span className="text-emerald-400">✓ {confCount}</span>
                            <span className="text-amber-400">⚠️ {dispCount}</span>
                            <span className="text-slate-400">? {unverCount}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border bg-brand-dark/50 py-6 px-6 text-center text-xs text-brand-textMuted font-sans flex flex-col sm:flex-row items-center justify-between max-w-7xl w-full mx-auto">
        <p>&copy; {new Date().getFullYear()} Debate Arena — Fact-Checked AI Debate Sandbox.</p>
        <p className="mt-2 sm:mt-0 flex items-center space-x-3">
          <span>Tier 1: AP / Reuters / PIB</span>
          <span>&middot;</span>
          <span>Tier 2: BBC / NYT / Guardian</span>
          <span>&middot;</span>
          <span>Tier 3: CFR / Brookings</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
