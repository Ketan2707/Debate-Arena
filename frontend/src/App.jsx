import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Shield, RefreshCw, Award, BookOpen, AlertTriangle, 
  CheckCircle, HelpCircle, ChevronRight, History, ArrowLeft, 
  ExternalLink, Sparkles, MessageSquare, Info, Star,
  Search, LogIn, LogOut, UserPlus, Lock, Mail, Eye, EyeOff
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function App() {
  const [activeView, setActiveView] = useState('landing'); // 'landing', 'debate', 'history', 'login', 'register'
  const [topicInput, setTopicInput] = useState('');
  const [activeDebateId, setActiveDebateId] = useState(null);
  const [debateTopic, setDebateTopic] = useState('');
  const [debateMode, setDebateMode] = useState('debate'); // 'debate' or 'factcheck'
  const [stancePreference, setStancePreference] = useState('both'); // 'both', 'for', or 'against'
  const [stances, setStances] = useState({ stance_a: '', stance_b: '' });
  const [turns, setTurns] = useState([]);
  const [status, setStatus] = useState({ status: 'idle' });
  const [scores, setScores] = useState([]);
  const [error, setError] = useState(null);
  
  // Detail selection state for the sidebar/modal fact-check display
  const [selectedClaim, setSelectedClaim] = useState(null);
  
  // History state
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Auth state
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('debate_arena_token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'debate' or 'factcheck'

  // SSE event source ref
  const eventSourceRef = useRef(null);
  const turnsEndRef = useRef(null);

  // Auto-scroll when new turns arrive
  useEffect(() => {
    if (turnsEndRef.current) {
      turnsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [turns, status]);

  // Verify token on mount
  useEffect(() => {
    if (authToken) {
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setCurrentUser(data.user))
        .catch(() => {
          localStorage.removeItem('debate_arena_token');
          setAuthToken(null);
          setCurrentUser(null);
        });
    }
  }, [authToken]);

  const handleLogout = () => {
    localStorage.removeItem('debate_arena_token');
    setAuthToken(null);
    setCurrentUser(null);
    setActiveView('landing');
  };

  const handleAuthSubmit = async (isRegister) => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.detail || 'Authentication failed');
        return;
      }
      localStorage.setItem('debate_arena_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setAuthEmail('');
      setAuthPassword('');
      
      // Execute pending action
      if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        if (action === 'debate' || action === 'factcheck') {
          setActiveView('landing');
          // Small delay to let state settle
          setTimeout(() => {
            handleStartDebate(null, action);
          }, 100);
        } else {
          setActiveView('landing');
        }
      } else {
        setActiveView('landing');
      }
    } catch (err) {
      setAuthError('Network error. Make sure backend is running.');
    } finally {
      setAuthLoading(false);
    }
  };

  const requireAuth = (action) => {
    if (!authToken) {
      setPendingAction(action);
      setActiveView('login');
      return false;
    }
    return true;
  };

  // Load history list
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE}/api/debates`);
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Start a new debate or factcheck
  const handleStartDebate = async (e, modeOverride) => {
    if (e) e.preventDefault();
    const mode = modeOverride || debateMode;
    
    if (!requireAuth(mode)) return;
    
    const topic = topicInput.trim() || "Should electric vehicles be mandatory by 2035?";
    setError(null);
    setTurns([]);
    setScores([]);
    setStances({ stance_a: '', stance_b: '' });
    setSelectedClaim(null);
    setDebateTopic(topic);
    setDebateMode(mode);
    
    try {
      setStatus({ status: 'creating', agent: 'Orchestrator' });
      setActiveView('debate');
      
      const res = await fetch(`${API_BASE}/api/debates`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ topic, mode, stance_preference: stancePreference })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to initialize");
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
      setScores(data.scores || []);
      setStatus({ status: 'idle' });
      source.close();
    });
    
    source.addEventListener('error', (e) => {
      try {
        const data = JSON.parse(e.data);
        setError(data.error);
      } catch {
        setError("Stream connection lost.");
      }
      setStatus({ status: 'idle' });
      source.close();
    });
    
    source.onerror = (err) => {
      console.error("SSE stream error:", err);
      setError("Network connection lost. Check back in history or refresh.");
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
      setDebateMode(data.mode || 'debate');
      setTurns(data.turns || []);
      setScores(data.scores || []);
      
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

  // Parse markdown links [text](url) into clickable elements
  const parseMarkdownLinks = (text) => {
    const parts = [];
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <a 
          key={match.index} 
          href={match[2]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-brand-accent hover:text-brand-accent/80 font-medium border-b border-brand-accent/30 transition-colors"
        >
          {match[1]}
          <ExternalLink className="h-3 w-3 ml-0.5 flex-shrink-0" />
        </a>
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  // Helper to parse claims and apply dynamic underlines + inline reference icons
  const renderContentWithClaims = (content, claims) => {
    if (!content) return null;
    
    // 1. Find all inline citations e.g. [Source: https...] or [Name](https...)
    const citationRegex = /\[Source:\s*(https?:\/\/[^\s\]]+)\]|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let citations = [];
    let match;
    while ((match = citationRegex.exec(content)) !== null) {
      const rawText = match[0];
      const url = match[1] || match[3];
      const name = match[2] || "Source";
      citations.push({
        start: match.index,
        end: match.index + rawText.length,
        url: url,
        name: name,
        raw: rawText
      });
    }
    
    // 2. Find all claims mapped to the text
    const stripLinks = (t) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\[Source:\s*[^\s\]]+\]/g, '').trim();
    let claimMatches = [];
    if (claims && claims.length > 0) {
      claims.forEach((claim) => {
        const claimClean = stripLinks(claim.claim_text);
        if (!claimClean) return;
        
        let index = content.toLowerCase().indexOf(claimClean.toLowerCase());
        if (index !== -1) {
          claimMatches.push({
            start: index,
            end: index + claimClean.length,
            claim: claim
          });
        } else {
          // Try fuzzy word-based match
          const words = claimClean.split(/\s+/).slice(0, 4).join('\\s+');
          try {
            const regex = new RegExp(words.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            const m = content.match(regex);
            if (m) {
              let endPos = content.indexOf('.', m.index);
              if (endPos === -1 || endPos - m.index > claimClean.length * 3) {
                endPos = m.index + claimClean.length + 30;
              } else {
                endPos += 1;
              }
              claimMatches.push({
                start: m.index,
                end: Math.min(endPos, content.length),
                claim: claim
              });
            }
          } catch (e) {}
        }
      });
    }
    
    // 3. Combine both types of segments and sort by start index
    const allSegments = [
      ...citations.map(c => ({ ...c, type: 'citation' })),
      ...claimMatches.map(c => ({ ...c, type: 'claim' }))
    ];
    allSegments.sort((a, b) => a.start - b.start);
    
    // De-duplicate and remove overlapping segments
    let filteredSegments = [];
    let currentEnd = 0;
    for (let seg of allSegments) {
      if (seg.start >= currentEnd) {
        filteredSegments.push(seg);
        currentEnd = seg.end;
      }
    }
    
    if (filteredSegments.length === 0) {
      return <p className="text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">{parseMarkdownLinks(content)}</p>;
    }
    
    // 4. Map unique URLs to reference numbers
    let urlToRefNum = {};
    let refCounter = 1;
    filteredSegments.forEach(seg => {
      if (seg.type === 'citation') {
        if (!urlToRefNum[seg.url]) {
          urlToRefNum[seg.url] = refCounter++;
        }
      }
    });
    
    let parts = [];
    let idx = 0;
    
    filteredSegments.forEach((seg, segIdx) => {
      if (seg.start > idx) {
        parts.push(
          <React.Fragment key={`text-${idx}`}>
            {parseMarkdownLinks(content.substring(idx, seg.start))}
          </React.Fragment>
        );
      }
      
      if (seg.type === 'citation') {
        const refNum = urlToRefNum[seg.url];
        // Find matching claim's verification results
        const matchingClaim = claims?.find(c => 
          (c.cited_url && c.cited_url.includes(seg.url)) || 
          (c.source_url && c.source_url.includes(seg.url)) ||
          seg.url.includes(c.cited_url || "NONE") ||
          seg.url.includes(c.source_url || "NONE")
        );
        
        const refObject = matchingClaim ? {
          ...matchingClaim,
          ref_number: refNum
        } : {
          id: `ref-${refNum}`,
          claim_text: `Source link citation: ${seg.name}`,
          verdict: 'Confirmed',
          source_url: seg.url,
          reasoning: `This source (${seg.url}) was cited by the analyst as primary evidence.`,
          cited_url: seg.url,
          ref_number: refNum
        };
        
        parts.push(
          <sup key={`citation-${segIdx}`} className="mx-0.5 select-none">
            <button
              type="button"
              onClick={() => setSelectedClaim(refObject)}
              className="bg-brand-accent/20 hover:bg-brand-accent hover:text-brand-dark text-brand-accent border border-brand-accent/30 text-[9px] font-extrabold px-1.5 py-0.5 rounded transition-all duration-200"
              title={`View citation details: ${seg.url}`}
            >
              [{refNum}]
            </button>
          </sup>
        );
      } else if (seg.type === 'claim') {
        const claimText = content.substring(seg.start, seg.end);
        const verdict = seg.claim.verdict;
        
        let borderStyle = 'border-slate-500 text-slate-100 hover:bg-slate-800/40';
        if (verdict === 'Confirmed') borderStyle = 'border-emerald-500/80 text-emerald-100 hover:bg-emerald-950/20';
        if (verdict === 'Disputed') borderStyle = 'border-amber-500/80 text-amber-100 hover:bg-amber-950/20';
        
        parts.push(
          <span 
            key={`claim-${segIdx}`}
            onClick={() => setSelectedClaim(seg.claim)}
            className={`cursor-pointer inline transition-all border-b-2 decoration-dotted pb-0.5 ${borderStyle}`}
            title="Click to view source integrity check"
          >
            {parseMarkdownLinks(claimText)}
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
      }
      
      idx = seg.end;
    });
    
    if (idx < content.length) {
      parts.push(
        <React.Fragment key="text-end">
          {parseMarkdownLinks(content.substring(idx))}
        </React.Fragment>
      );
    }
    
    return (
      <div className="flex flex-col space-y-4">
        <p className="text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">{parts}</p>
        
        {/* Render Cited Sources Index */}
        {Object.keys(urlToRefNum).length > 0 && (
          <div className="pt-3 border-t border-brand-border/40 text-xs text-brand-textMuted font-sans">
            <div className="font-semibold text-slate-400 mb-1 flex items-center">
              <BookOpen className="h-3.5 w-3.5 mr-1 text-brand-accent" /> Cited Sources
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
              {Object.entries(urlToRefNum).map(([url, num]) => (
                <div key={url} className="flex items-start space-x-1.5 hover:text-slate-200 transition-colors">
                  <span className="font-bold text-brand-accent text-[9px] bg-brand-accent/10 border border-brand-accent/20 px-1 py-0.5 rounded leading-none">[{num}]</span>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline truncate text-[11px] leading-tight inline-flex items-center text-slate-400 hover:text-brand-accent transition-colors"
                  >
                    {url.replace(/https?:\/\/(www\.)?/, '')}
                    <ExternalLink className="h-2.5 w-2.5 ml-1 flex-shrink-0" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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

  // ─── RENDER ────────────────────────────────────────────────

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
            <h1 className="text-xl font-bold tracking-tight font-serif text-brand-textLight">Dialectica AI</h1>
            <span className="text-[10px] text-brand-textMuted tracking-wider uppercase font-semibold font-sans">Fact-Checked AI Analysis</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {activeView !== 'landing' && activeView !== 'login' && activeView !== 'register' && (
            <button 
              onClick={() => {
                if (status.status === 'idle' || confirm("A session is currently active. Stop and return home?")) {
                  if (eventSourceRef.current) eventSourceRef.current.close();
                  setStatus({ status: 'idle' });
                  setActiveView('landing');
                }
              }}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
            >
              New Analysis
            </button>
          )}
          <button 
            onClick={() => {
              if (status.status === 'idle' || confirm("Leave active session?")) {
                if (eventSourceRef.current) eventSourceRef.current.close();
                setStatus({ status: 'idle' });
                loadHistory();
                setActiveView('history');
              }
            }}
            className="flex items-center space-x-2 bg-brand-panel hover:bg-brand-border border border-brand-border px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white transition-all duration-200"
          >
            <History className="h-4 w-4 text-brand-accent" />
            <span>Archive</span>
          </button>

          {/* Auth Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-brand-textMuted font-sans">{currentUser.email}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1.5 bg-brand-panel hover:bg-brand-border border border-brand-border px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-all duration-200"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setActiveView('login')}
              className="flex items-center space-x-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center">
        
        {/* ── LOGIN / REGISTER VIEW (Claude-like) ── */}
        {(activeView === 'login' || activeView === 'register') && (
          <div className="max-w-md mx-auto w-full py-16 animate-fade-in">
            <div className="bg-brand-panel border border-brand-border rounded-2xl p-8 shadow-2xl">
              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <div className="bg-brand-accent p-3 rounded-xl text-brand-dark mb-4 shadow-lg shadow-brand-accent/20">
                  <Shield className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold font-serif text-brand-textLight">
                  {activeView === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-sm text-brand-textMuted font-sans mt-2 text-center">
                  {activeView === 'login' 
                    ? 'Sign in to start fact-checked debates and deep-dive analyses.'
                    : 'Join Dialectica AI to access AI-powered fact-checking.'
                  }
                </p>
              </div>

              {/* Auth Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleAuthSubmit(activeView === 'register'); }} className="space-y-4">
                <div>
                  <label className="block text-xs text-brand-textMuted font-sans font-semibold mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors font-sans text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-brand-textMuted font-sans font-semibold mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder={activeView === 'register' ? "At least 6 characters" : "Enter your password"}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-10 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors font-sans text-sm"
                      required
                      minLength={activeView === 'register' ? 6 : 1}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-300 font-sans">
                    {authError}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-dark py-3 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {authLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {activeView === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      <span>{activeView === 'login' ? 'Sign In' : 'Create Account'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Toggle login/register */}
              <div className="mt-6 text-center">
                <p className="text-xs text-brand-textMuted font-sans">
                  {activeView === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => {
                      setAuthError('');
                      setActiveView(activeView === 'login' ? 'register' : 'login');
                    }}
                    className="text-brand-accent hover:text-brand-accent/80 font-semibold transition-colors"
                  >
                    {activeView === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>

              {/* Back to home */}
              <div className="mt-4 text-center">
                <button 
                  onClick={() => { setActiveView('landing'); setPendingAction(null); }}
                  className="text-xs text-brand-textMuted hover:text-slate-300 font-sans transition-colors"
                >
                  ← Continue browsing as guest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── LANDING VIEW ── */}
        {activeView === 'landing' && (
          <div className="max-w-2xl mx-auto w-full py-16 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="inline-flex items-center justify-center bg-brand-accent/10 border border-brand-accent/20 px-3 py-1.5 rounded-full mb-6 text-xs text-brand-accent font-semibold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5 mr-2 animate-pulse" />
              Fact-Checked AI Analysis Platform
            </div>
            <h2 className="text-5xl font-bold font-serif mb-4 leading-tight text-brand-textLight">
              Where AI debates.<br/>
              Where <span className="underline decoration-brand-accent decoration-2 underline-offset-8">credible sources</span> settle claims.
            </h2>
            <p className="text-brand-textMuted text-lg mb-10 max-w-lg font-sans font-light leading-relaxed">
              Submit any topic. Choose a full adversarial debate or a quick factual deep-dive. Every claim is verified against trusted sources with clickable references.
            </p>
            
            <form onSubmit={(e) => handleStartDebate(e)} className="w-full relative group">
              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full bg-brand-panel/60 p-2.5 rounded-2xl border border-brand-border focus-within:border-brand-accent transition-all duration-300 shadow-2xl">
                <input 
                  type="text" 
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="Should electric vehicles be mandatory by 2035?"
                  className="flex-1 bg-transparent px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none font-sans text-md"
                />
                <div className="flex space-x-2">
                  <button 
                    type="submit"
                    onClick={() => setDebateMode('debate')}
                    className="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark px-5 py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-200"
                  >
                    <Play className="h-4 w-4 fill-brand-dark" />
                    <span>Debate</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setDebateMode('factcheck');
                      handleStartDebate(null, 'factcheck');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-200"
                  >
                    <Search className="h-4 w-4" />
                    <span>Fact-Check</span>
                  </button>
                </div>
              </div>
            </form>
            
            {/* Stance Preference Selector */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 bg-brand-panel/40 border border-brand-border/60 px-5 py-3 rounded-2xl w-full max-w-lg">
              <span className="text-xs text-brand-textMuted font-sans font-bold uppercase tracking-wider">Analysis Focus:</span>
              <div className="flex bg-brand-dark p-1 rounded-xl border border-brand-border/60">
                {[
                  { value: 'both', label: 'Both Sides' },
                  { value: 'for', label: 'Supporting (FOR)' },
                  { value: 'against', label: 'Opposing (AGAINST)' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStancePreference(opt.value)}
                    className={`text-[11px] px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wide transition-all ${
                      stancePreference === opt.value
                        ? 'bg-brand-accent text-brand-dark shadow-lg shadow-brand-accent/15'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode description */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
              <div className="bg-brand-panel/40 border border-brand-border rounded-xl p-4 text-left">
                <div className="flex items-center space-x-2 mb-2">
                  <Play className="h-4 w-4 text-brand-accent" />
                  <span className="text-sm font-bold text-slate-200">Full Debate</span>
                </div>
                <p className="text-xs text-brand-textMuted font-sans leading-relaxed">
                  Two AI agents debate 5 rounds. Every claim is fact-checked. A judge scores both sides.
                </p>
              </div>
              <div className="bg-brand-panel/40 border border-brand-border rounded-xl p-4 text-left">
                <div className="flex items-center space-x-2 mb-2">
                  <Search className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold text-slate-200">Factual Deep-Dive</span>
                </div>
                <p className="text-xs text-brand-textMuted font-sans leading-relaxed">
                  Structured FOR / AGAINST analysis with a balanced verdict. All claims cited and verified.
                </p>
              </div>
            </div>

            {/* Quick prefill examples */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-brand-textMuted mr-2">Try examples:</span>
              {["Should electric vehicles be mandatory by 2035?", "Is artificial intelligence a net benefit to public education?", "Should lab-grown meat be certified for commercial scale distribution?"].map((ex) => (
                <button 
                  key={ex}
                  onClick={() => setTopicInput(ex)}
                  className="bg-brand-panel/40 border border-brand-border text-xs px-3.5 py-1.5 rounded-full text-slate-400 hover:text-white hover:border-brand-accent transition-colors"
                >
                  {ex.length > 40 ? ex.substring(0, 40) + '...' : ex}
                </button>
              ))}
            </div>

            {!currentUser && (
              <div className="mt-8 bg-brand-panel/30 border border-brand-border/60 rounded-xl p-4 max-w-md">
                <p className="text-xs text-brand-textMuted font-sans text-center">
                  <Lock className="h-3 w-3 inline mr-1" />
                  <button onClick={() => setActiveView('login')} className="text-brand-accent hover:text-brand-accent/80 font-semibold">Sign in</button> to start debates and fact-checks. Browse the archive as a guest.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVE DEBATE / TRANSCRIPT STREAM ── */}
        {activeView === 'debate' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
            {/* Left Side */}
            <div className="lg:col-span-3 flex flex-col space-y-6">
              
              {/* Active topic display card */}
              <div className="bg-brand-panel border border-brand-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-brand-accent/5 rounded-full filter blur-2xl pointer-events-none"></div>
                <div className="flex items-center space-x-2 text-xs font-semibold mb-2">
                  {debateMode === 'factcheck' ? (
                    <><Search className="h-4 w-4 text-emerald-400" /><span className="text-emerald-400">FACTUAL DEEP-DIVE</span></>
                  ) : (
                    <><MessageSquare className="h-4 w-4 text-brand-accent" /><span className="text-brand-accent">ACTIVE DEBATE ROOM</span></>
                  )}
                </div>
                <h3 className="text-3xl font-bold font-serif mb-4 leading-snug">{debateTopic}</h3>
                
                {/* Show stances only for debate mode */}
                {debateMode === 'debate' && stances.stance_a && (
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

              {/* ── FACTCHECK MODE LAYOUT ── */}
              {debateMode === 'factcheck' && (
                <div className="space-y-6">
                  {/* FOR section */}
                  {turns.filter(t => t.agent === 'FOR').map(turn => (
                    <div key={turn.id} className="bg-brand-panel border border-emerald-500/20 rounded-2xl p-6 shadow-md animate-fade-in">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Supporting Case (FOR)</span>
                      </div>
                      {renderContentWithClaims(turn.content, turn.claims)}
                    </div>
                  ))}

                  {/* AGAINST section */}
                  {turns.filter(t => t.agent === 'AGAINST').map(turn => (
                    <div key={turn.id} className="bg-brand-panel border border-rose-500/20 rounded-2xl p-6 shadow-md animate-fade-in">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-rose-400" />
                        <span className="text-sm font-bold text-rose-400 uppercase tracking-wider">Opposing Case (AGAINST)</span>
                      </div>
                      {renderContentWithClaims(turn.content, turn.claims)}
                    </div>
                  ))}

                  {/* VERDICT section */}
                  {turns.filter(t => t.agent === 'VERDICT').map(turn => (
                    <div key={turn.id} className="bg-brand-panel border border-indigo-500/20 rounded-2xl p-6 shadow-md animate-fade-in">
                      <div className="flex items-center space-x-2 mb-3">
                        <Award className="h-5 w-5 text-indigo-400" />
                        <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Balanced Verdict</span>
                      </div>
                      {renderContentWithClaims(turn.content, turn.claims)}
                    </div>
                  ))}
                </div>
              )}

              {/* ── DEBATE MODE LAYOUT ── */}
              {debateMode === 'debate' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[450px]">
                  {/* Agent A Column */}
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-brand-accent/15 border border-brand-accent/30 rounded-full self-start">
                      <div className="h-2 w-2 bg-brand-accent rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-100 tracking-wider">AGENT A</span>
                    </div>

                    {turns
                      .filter((t) => t.agent === 'Agent A')
                      .map((turn) => (
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
                            {status.status === 'writing' ? "Citing verified sources inline" : "Verifying claims against whitelist domains..."}
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
                      .map((turn) => (
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
                            {status.status === 'writing' ? "Analyzing opponent arguments and citing sources" : "Verifying claims against whitelist domains..."}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={turnsEndRef} />

              {/* Status display for analysis / judging */}
              {(status.agent === 'Judge' || status.agent === 'Analyst' || status.agent === 'FOR' || status.agent === 'AGAINST' || status.agent === 'VERDICT') && (
                <div className="bg-brand-panel border border-brand-border rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                  <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-full text-indigo-400 animate-pulse">
                    {debateMode === 'factcheck' ? <Search className="h-8 w-8" /> : <Award className="h-8 w-8" />}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold font-serif text-slate-200">
                      {debateMode === 'factcheck' 
                        ? `Analyzing: ${status.agent} case...`
                        : 'The Judge Agent is evaluating the debate...'
                      }
                    </h4>
                    <p className="text-sm text-brand-textMuted max-w-md mx-auto font-sans mt-2">
                      {debateMode === 'factcheck'
                        ? 'Researching sources, extracting factual claims, and verifying each against the trusted domain whitelist.'
                        : 'Running double-blind grading with swapped labels to remove position bias. Scoring logic, evidence quality, and rebuttal effectiveness.'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Error Callout */}
              {error && (
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-5 flex items-start space-x-3.5 text-rose-200">
                  <AlertTriangle className="h-6 w-6 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">Analysis Engine Interrupted</h5>
                    <p className="text-xs text-rose-300/90 font-sans mt-1 leading-relaxed">{error}</p>
                    <button 
                      onClick={() => handleStartDebate()}
                      className="mt-3 bg-rose-500 hover:bg-rose-600 text-brand-dark px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Scorecard Panel (Debate mode only) */}
              {debateMode === 'debate' && scores && scores.length > 0 && (
                <div className="bg-brand-panel border border-brand-border rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in">
                  <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                    <Award className="h-4 w-4" />
                    <span>Official Scorecard</span>
                  </div>
                  
                  <h4 className="text-2xl font-bold font-serif text-brand-textLight">Judge's Final Verdict</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brand-border/60">
                    {scores.map((score) => {
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

                          <div className="space-y-2 text-sm">
                            {[
                              { label: 'Logic Validity', key: 'logic' },
                              { label: 'Evidence Quality (Fact-Checker Grounded)', key: 'evidence' },
                              { label: 'Rebuttal Effectiveness', key: 'rebuttal' }
                            ].map(({ label, key }) => (
                              <div key={key}>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                  <span>{label}</span>
                                  <span className="font-bold text-slate-200">{score[key]}/10</span>
                                </div>
                                <div className="h-2 w-full bg-brand-dark rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${isA ? 'bg-brand-accent' : 'bg-brand-accentAmber'}`} 
                                    style={{ width: `${score[key] * 10}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
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

              {/* Factcheck completion banner */}
              {debateMode === 'factcheck' && status.status === 'idle' && turns.length > 0 && !error && (
                <div className="bg-brand-panel border border-emerald-500/20 rounded-2xl p-6 text-center animate-fade-in">
                  <div className="flex items-center justify-center space-x-2 text-emerald-400 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Analysis Complete</span>
                  </div>
                  <p className="text-xs text-brand-textMuted font-sans">
                    All factual claims have been extracted and verified against the trusted domain whitelist. Click any underlined claim to inspect its verification details.
                  </p>
                </div>
              )}
            </div>

            {/* Right Side Column: Claims Inspection Panel */}
            <div className="lg:col-span-1 flex flex-col space-y-6">
              <div className="bg-brand-panel border border-brand-border rounded-2xl p-5 shadow-xl flex flex-col space-y-4 sticky top-24">
                <div className="flex items-center justify-between text-brand-textMuted border-b border-brand-border/40 pb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4.5 w-4.5 text-brand-accent" />
                    <h4 className="text-sm font-bold tracking-wider uppercase font-sans">
                      {selectedClaim?.ref_number ? `Reference [${selectedClaim.ref_number}]` : "Fact-Checker Log"}
                    </h4>
                  </div>
                  {selectedClaim && (
                    <button 
                      onClick={() => setSelectedClaim(null)} 
                      className="text-xs hover:text-white text-slate-500 font-semibold transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {!selectedClaim ? (
                  <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-3">
                    <Info className="h-10 w-10 text-brand-border/80" />
                    <div>
                      <h5 className="font-serif text-slate-300 font-semibold">Inspect Claims</h5>
                      <p className="text-xs text-brand-textMuted font-sans mt-1 leading-relaxed">
                        Factual statements are underlined and citations are numbered. Click any element to inspect its source verification.
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
                          <span className="text-xs text-brand-textMuted uppercase font-bold tracking-wider font-sans block mb-1">Verified Source:</span>
                          <a 
                            href={selectedClaim.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 text-brand-accent hover:text-brand-accent/80 text-xs font-medium border-b border-brand-accent/30 pb-0.5 break-all leading-relaxed"
                          >
                            <span>{(() => { try { return new URL(selectedClaim.source_url).hostname; } catch { return selectedClaim.source_url; } })()}</span>
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                          </a>
                          
                          <span className="block text-[10px] text-brand-textMuted font-sans mt-2">
                            {selectedClaim.source_tier === 1 && "✓ Tier 1 (Wire service or official public record)"}
                            {selectedClaim.source_tier === 2 && "✓ Tier 2 (Established national/international newspaper)"}
                            {selectedClaim.source_tier === 3 && "✓ Tier 3 (Think tank, academic, or advocacy organization)"}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-slate-900/40 p-3 rounded border border-brand-border/40 text-[10px] text-brand-textMuted font-sans leading-relaxed">
                          No source link verified. Under source-integrity rules, claims without a verifiable whitelisted domain citation must be labeled Unverifiable.
                        </div>
                      )}

                      {selectedClaim.cited_url && (
                        <div>
                          <span className="text-xs text-brand-textMuted uppercase font-bold tracking-wider font-sans block mb-1">Agent's Cited Source:</span>
                          <a 
                            href={selectedClaim.cited_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 text-xs font-medium break-all leading-relaxed"
                          >
                            <span>{(() => { try { return new URL(selectedClaim.cited_url).hostname; } catch { return selectedClaim.cited_url; } })()}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PAST DEBATES HISTORY ── */}
        {activeView === 'history' && (
          <div className="max-w-4xl mx-auto w-full py-8 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold font-serif text-brand-textLight">Archive</h3>
                <p className="text-sm text-brand-textMuted font-sans mt-1">Review past debates, fact-checks, and scoring cards.</p>
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
                <span className="text-sm text-brand-textMuted">Loading archive...</span>
              </div>
            ) : historyList.length === 0 ? (
              <div className="bg-brand-panel border border-brand-border rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4">
                <BookOpen className="h-12 w-12 text-brand-border" />
                <div>
                  <h4 className="font-serif text-lg font-semibold text-slate-300">No entries in archive</h4>
                  <p className="text-xs text-brand-textMuted font-sans mt-1 max-w-xs mx-auto leading-relaxed">
                    Create your first debate or fact-check. Completed analyses are saved here automatically.
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
                  const mode = debate.mode || 'debate';
                  
                  return (
                    <div 
                      key={debate.id}
                      onClick={() => handleViewPastDebate(debate.id)}
                      className="bg-brand-panel border border-brand-border rounded-xl p-5 hover:border-brand-accent hover:scale-[1.01] cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-brand-textMuted font-sans font-semibold">
                          <div className="flex items-center space-x-2">
                            <span>{formatDate(debate.created_at)}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              mode === 'factcheck' 
                                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                                : 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20'
                            }`}>
                              {mode === 'factcheck' ? 'Fact-Check' : 'Debate'}
                            </span>
                          </div>
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

                      {debate.status === 'completed' && (
                        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
                          {mode === 'debate' && debate.scores?.length > 0 && (
                            <span className="text-brand-textMuted font-sans flex items-center">
                              Winner: <strong className="text-indigo-400 ml-1 font-serif font-bold flex items-center">
                                {winner === 'Tie' ? 'Tie' : winner}
                                {winner !== 'Tie' && <Star className="h-3 w-3 fill-indigo-400 ml-0.5" />}
                              </strong>
                            </span>
                          )}
                          {mode === 'factcheck' && (
                            <span className="text-brand-textMuted font-sans">Factual Analysis</span>
                          )}
                          
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
        <p>&copy; {new Date().getFullYear()} Dialectica AI — Fact-Checked AI Analysis Platform.</p>
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
