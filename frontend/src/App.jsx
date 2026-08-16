import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Shield, RefreshCw, Award, BookOpen, AlertTriangle, 
  CheckCircle, HelpCircle, ChevronRight, History, ArrowLeft, 
  ExternalLink, Sparkles, MessageSquare, Info, Star,
  Search, LogIn, LogOut, UserPlus, Lock, Mail, Eye, EyeOff,
  Zap, Crown, TrendingUp, Target, Globe
} from 'lucide-react';
import DarkVeil from './DarkVeil';
import logo from './assets/logo.png';
import { ParticleCard, GlobalSpotlight } from './MagicBento';

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

  // Score bar animation state
  const [scoreBarsVisible, setScoreBarsVisible] = useState(false);

  // SSE event source ref
  const eventSourceRef = useRef(null);
  const turnsEndRef = useRef(null);
  const bentoGridRef = useRef(null);

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

  // Animate score bars when scores appear
  useEffect(() => {
    if (scores && scores.length > 0) {
      setTimeout(() => setScoreBarsVisible(true), 200);
    } else {
      setScoreBarsVisible(false);
    }
  }, [scores]);

  const handleLogout = () => {
    localStorage.removeItem('debate_arena_token');
    setAuthToken(null);
    setCurrentUser(null);
    setHistoryList([]);
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
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const res = await fetch(`${API_BASE}/api/debates`, { headers });
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

    // Clean up plain unclickable footnotes like [1], [2], [6], [7], etc.
    const cleanedContent = content.replace(/\s*\[\d+\](?!\()/g, '');
    
    // 1. Find all inline citations e.g. [Source: https...] or [Name](https...)
    const citationRegex = /\[Source:\s*(https?:\/\/[^\s\]]+)\]|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let citations = [];
    let match;
    while ((match = citationRegex.exec(cleanedContent)) !== null) {
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
        // Skip Unverifiable claims so we remove unknown sources from underlines/badges
        if (claim.verdict === 'Unverifiable') return;

        const claimClean = stripLinks(claim.claim_text);
        if (!claimClean) return;
        
        let index = cleanedContent.toLowerCase().indexOf(claimClean.toLowerCase());
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
            const m = cleanedContent.match(regex);
            if (m) {
              let endPos = cleanedContent.indexOf('.', m.index);
              if (endPos === -1 || endPos - m.index > claimClean.length * 3) {
                endPos = m.index + claimClean.length + 30;
              } else {
                endPos += 1;
              }
              claimMatches.push({
                start: m.index,
                end: Math.min(endPos, cleanedContent.length),
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
      return <p className="text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">{parseMarkdownLinks(cleanedContent)}</p>;
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
            {parseMarkdownLinks(cleanedContent.substring(idx, seg.start))}
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
        const claimText = cleanedContent.substring(seg.start, seg.end);
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
    
    if (idx < cleanedContent.length) {
      parts.push(
        <React.Fragment key="text-end">
          {parseMarkdownLinks(cleanedContent.substring(idx))}
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
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col antialiased relative">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <DarkVeil
          scanlineIntensity={0.64}
          speed={0.7}
          scanlineFrequency={1.4}
          hueShift={280}
        />
      </div>
      <div className="dot-grid"></div>

      {/* Top Header - Floating design matching the screenshot */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 relative z-40">
        <header className="glass rounded-2xl px-6 py-3 flex items-center justify-between border border-white/10 shadow-2xl">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => {
              if (status.status === 'idle') {
                setActiveView('landing');
              }
            }}
          >
            <div className="text-white font-extrabold flex items-center justify-center transition-transform group-hover:scale-105">
              <img src={logo} className="h-9 w-9 object-contain" alt="Logo" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight font-sans text-brand-textLight">ArguForge AI</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => {
                if (status.status === 'idle' || confirm("Leave active session?")) {
                  if (eventSourceRef.current) eventSourceRef.current.close();
                  setStatus({ status: 'idle' });
                  loadHistory();
                  setActiveView('history');
                }
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors font-sans"
            >
              Archive
            </button>
            <a 
              href="https://github.com/Ketan2707/Debate-Arena" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-slate-400 hover:text-white transition-colors font-sans"
            >
              About
            </a>

            {/* Auth Button */}
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 glass px-3 py-1.5 rounded-xl border border-white/10">
                  <div className="w-5 h-5 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-brand-accent">{currentUser.email?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-xs text-brand-textMuted font-sans hidden sm:inline">{currentUser.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-xs text-slate-400 hover:text-white transition-colors font-sans"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setActiveView('login')}
                className="bg-white hover:bg-slate-200 text-black px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md font-sans"
              >
                Sign up
              </button>
            )}
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center relative z-10">
        
        {/* ── LOGIN / REGISTER VIEW ── */}
        {(activeView === 'login' || activeView === 'register') && (
          <div className="max-w-md mx-auto w-full py-16 animate-slide-up">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="glass rounded-2xl p-8 shadow-2xl glow-accent relative">
              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <div className="mb-4 animate-float">
                  <img src={logo} className="h-16 w-16 object-contain" alt="Logo" />
                </div>
                <h2 className="text-2xl font-bold font-serif text-brand-textLight">
                  {activeView === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-sm text-brand-textMuted font-sans mt-2 text-center">
                  {activeView === 'login' 
                    ? 'Sign in to start fact-checked debates and deep-dive analyses.'
                    : 'Join ArguForge AI to access AI-powered fact-checking.'
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
                      className="w-full bg-brand-dark/80 border border-brand-border rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-500 focus-glow transition-all font-sans text-sm"
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
                      className="w-full bg-brand-dark/80 border border-brand-border rounded-xl pl-10 pr-10 py-3 text-slate-100 placeholder-slate-500 focus-glow transition-all font-sans text-sm"
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
                  <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-300 font-sans flex items-center space-x-2">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-dark py-3.5 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 animate-shine glow-accent"
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
          <div ref={bentoGridRef} className="max-w-4xl mx-auto w-full py-16 flex flex-col items-center justify-center text-center animate-slide-up bento-section">
            <GlobalSpotlight gridRef={bentoGridRef} spotlightRadius={300} glowColor="168, 85, 247" />

            {/* Pill Badge from image */}
            <div className="inline-flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full mb-8 text-xs text-slate-300 font-sans tracking-wide animate-scale-in">
              <span className="bg-white text-black px-2.5 py-0.5 rounded-full font-bold mr-2 text-[9px]">NEW</span>
              <span>Just shipped v2.0</span>
            </div>

            {/* Hero Heading - matching font and text style */}
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight font-sans text-white mb-6 leading-tight max-w-4xl mx-auto">
              Become emboldened by the flame of truth
            </h2>

            <p className="text-slate-400 text-lg mb-10 max-w-xl font-sans font-light leading-relaxed">
              Submit any topic. Settle claims with verified sources. Choose a full adversarial AI debate or a quick factual deep-dive analysis.
            </p>
            
            {/* Search Bar - Highlighted Glassmorphic design with Spotlight support */}
            <form onSubmit={(e) => handleStartDebate(e)} className="w-full max-w-2xl flex flex-col items-center relative group">
              <ParticleCard
                enableStars={false}
                enableTilt={true}
                enableMagnetism={false}
                clickEffect={false}
                glowColor="168, 85, 247"
                className="w-full magic-bento-card rounded-2xl"
              >
                <div className="flex items-center w-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 backdrop-blur-xl px-5 py-2.5 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.02)] focus-within:border-white/40 focus-within:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-300">
                  <Search className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                  <input 
                    type="text" 
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Should electric vehicles be mandatory by 2035?"
                    className="w-full bg-transparent py-3 text-slate-100 placeholder-slate-500 focus:outline-none font-sans text-md"
                  />
                </div>
              </ParticleCard>

              {/* Stance Preference Selector - styled as glassmorphic slider */}
              <ParticleCard
                enableStars={false}
                enableTilt={false}
                enableMagnetism={false}
                clickEffect={false}
                glowColor="168, 85, 247"
                className="mt-6 w-full max-w-lg magic-bento-card rounded-2xl"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 bg-white/5 border border-white/10 backdrop-blur-md px-5 py-3 rounded-2xl">
                  <span className="text-xs text-slate-400 font-sans font-bold uppercase tracking-wider">Analysis Focus:</span>
                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    {[
                      { value: 'both', label: 'Both Sides' },
                      { value: 'for', label: 'Supporting' },
                      { value: 'against', label: 'Opposing' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStancePreference(opt.value)}
                        className={`text-[11px] px-4 py-1.5 rounded-lg font-bold uppercase tracking-wide transition-all ${
                          stancePreference === opt.value
                            ? 'bg-white text-black shadow-lg'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </ParticleCard>

              {/* Action Buttons - clearly differentiated features with React Bits magic animations */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full max-w-2xl">
                <ParticleCard
                  enableStars={true}
                  enableTilt={true}
                  enableMagnetism={true}
                  clickEffect={true}
                  glowColor="255, 255, 255"
                  className="magic-bento-card w-full sm:w-auto rounded-xl"
                >
                  <button 
                    type="submit"
                    onClick={() => setDebateMode('debate')}
                    className="bg-white hover:bg-slate-200 text-black font-bold px-8 py-3.5 w-full font-sans flex items-center justify-center space-x-2 transition duration-200"
                  >
                    <Play className="h-4 w-4 fill-black text-black" />
                    <span>Start AI Debate</span>
                  </button>
                </ParticleCard>

                <ParticleCard
                  enableStars={true}
                  enableTilt={true}
                  enableMagnetism={true}
                  clickEffect={true}
                  glowColor="168, 85, 247"
                  className="magic-bento-card w-full sm:w-auto rounded-xl"
                >
                  <button 
                    type="button"
                    onClick={() => {
                      setDebateMode('factcheck');
                      handleStartDebate(null, 'factcheck');
                    }}
                    className="bg-transparent text-white border border-white/15 hover:bg-white/5 font-bold px-8 py-3.5 w-full font-sans flex items-center justify-center space-x-2 transition duration-200"
                  >
                    <Shield className="h-4 w-4 text-white" />
                    <span>Run Fact-Check</span>
                  </button>
                </ParticleCard>
              </div>
            </form>
            
            {/* Quick prefill examples */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2 max-w-2xl">
              <span className="text-xs text-slate-500 mr-2 flex items-center font-sans"><Sparkles className="h-3 w-3 mr-1 text-slate-400" />Try:</span>
              {["Should electric vehicles be mandatory by 2035?", "Is artificial intelligence a net benefit to public education?", "Should lab-grown meat be certified for commercial scale distribution?"].map((ex, i) => (
                <button 
                  key={ex}
                  onClick={() => setTopicInput(ex)}
                  className="bg-white/5 border border-white/10 text-xs px-4 py-2 rounded-full text-slate-400 hover:text-white hover:border-white/20 transition-all duration-300 font-sans"
                >
                  {ex.length > 40 ? ex.substring(0, 40) + '...' : ex}
                </button>
              ))}
            </div>

            {/* Features row */}
            <div className="mt-12 grid grid-cols-3 gap-4 w-full max-w-lg border-t border-white/10 pt-8">
              {[
                { icon: <Target className="h-4 w-4" />, label: 'Source Verified', color: 'text-slate-400' },
                { icon: <Globe className="h-4 w-4" />, label: 'Trusted Domains', color: 'text-slate-400' },
                { icon: <TrendingUp className="h-4 w-4" />, label: 'Bias-Free Judge', color: 'text-slate-400' }
              ].map((feat) => (
                <div key={feat.label} className="flex flex-col items-center space-y-2 py-1">
                  <div className={`${feat.color}`}>{feat.icon}</div>
                  <span className="text-[11px] text-slate-500 font-sans font-semibold">{feat.label}</span>
                </div>
              ))}
            </div>

            {!currentUser && (
              <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 max-w-md">
                <p className="text-xs text-slate-400 font-sans text-center">
                  <Lock className="h-3 w-3 inline mr-1" />
                  <button onClick={() => setActiveView('login')} className="text-white hover:underline font-semibold">Sign in</button> to start debates and fact-checks. Browse the archive as a guest.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVE DEBATE / TRANSCRIPT STREAM ── */}
        {activeView === 'debate' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
            {/* Left Side */}
            <div className="lg:col-span-3 flex flex-col space-y-4">
              
              {/* Back / Cancel Button */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => {
                    if (status.status === 'idle' || confirm("Cancel active analysis and return home?")) {
                      if (eventSourceRef.current) eventSourceRef.current.close();
                      setStatus({ status: 'idle' });
                      setActiveView('landing');
                    }
                  }}
                  className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200 hover-lift"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
                  <span>{status.status === 'idle' ? "Back to Home" : "Cancel & Return Home"}</span>
                </button>
                
                {status.status !== 'idle' && (
                  <span className="flex items-center space-x-2 text-[11px] text-brand-textMuted font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                    <RefreshCw className="h-3 w-3 animate-spin text-brand-accent" />
                    <span>Processing...</span>
                  </span>
                )}
              </div>
              
              {/* Active topic display card */}
              <div className="glass rounded-2xl p-6 shadow-xl relative overflow-hidden gradient-border">
                <div className="absolute top-0 right-0 h-48 w-48 bg-brand-accent/5 rounded-full filter blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 h-32 w-32 bg-brand-accentAmber/3 rounded-full filter blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center space-x-2 text-xs font-semibold mb-3">
                  {debateMode === 'factcheck' ? (
                    <><div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full"><div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></div><Search className="h-3.5 w-3.5 text-emerald-400" /><span className="text-emerald-400">FACTUAL DEEP-DIVE</span></div></>
                  ) : (
                    <><div className="flex items-center space-x-1.5 bg-brand-accent/10 border border-brand-accent/20 px-3 py-1.5 rounded-full"><div className="h-2 w-2 bg-brand-accent rounded-full animate-pulse"></div><MessageSquare className="h-3.5 w-3.5 text-brand-accent" /><span className="text-brand-accent">ACTIVE DEBATE ROOM</span></div></>
                  )}
                </div>
                <h3 className="text-3xl font-bold font-serif mb-4 leading-snug text-brand-textLight">{debateTopic}</h3>
                
                {/* Show stances only for debate mode */}
                {debateMode === 'debate' && stances.stance_a && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-brand-border/40">
                    <div className="glass rounded-xl p-4 agent-a-border">
                      <div className="text-xs text-brand-accent font-semibold mb-1.5 uppercase tracking-wider flex items-center space-x-1.5">
                        <div className="h-2 w-2 bg-brand-accent rounded-full"></div>
                        <span>Agent A (Affirmative)</span>
                      </div>
                      <p className="text-sm text-slate-300 font-sans">{stances.stance_a}</p>
                    </div>
                    <div className="glass rounded-xl p-4 agent-b-border">
                      <div className="text-xs text-brand-accentAmber font-semibold mb-1.5 uppercase tracking-wider flex items-center space-x-1.5">
                        <div className="h-2 w-2 bg-brand-accentAmber rounded-full"></div>
                        <span>Agent B (Negative)</span>
                      </div>
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
                    <div key={turn.id} className="glass rounded-2xl p-6 shadow-md animate-slide-up" style={{ borderLeft: '3px solid rgba(16, 185, 129, 0.6)' }}>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="bg-emerald-500/15 p-1.5 rounded-lg">
                          <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                        </div>
                        <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Supporting Case (FOR)</span>
                      </div>
                      {renderContentWithClaims(turn.content, turn.claims)}
                    </div>
                  ))}

                  {/* AGAINST section */}
                  {turns.filter(t => t.agent === 'AGAINST').map(turn => (
                    <div key={turn.id} className="glass rounded-2xl p-6 shadow-md animate-slide-up" style={{ borderLeft: '3px solid rgba(244, 63, 94, 0.6)' }}>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="bg-rose-500/15 p-1.5 rounded-lg">
                          <AlertTriangle className="h-4.5 w-4.5 text-rose-400" />
                        </div>
                        <span className="text-sm font-bold text-rose-400 uppercase tracking-wider">Opposing Case (AGAINST)</span>
                      </div>
                      {renderContentWithClaims(turn.content, turn.claims)}
                    </div>
                  ))}

                  {/* VERDICT section */}
                  {turns.filter(t => t.agent === 'VERDICT').map(turn => (
                    <div key={turn.id} className="glass rounded-2xl p-6 shadow-md animate-slide-up glow-accent" style={{ borderLeft: '3px solid rgba(99, 102, 241, 0.6)' }}>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="bg-indigo-500/15 p-1.5 rounded-lg">
                          <Award className="h-4.5 w-4.5 text-indigo-400" />
                        </div>
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
                    <div className="flex items-center space-x-2.5 px-4 py-2 bg-brand-accent/10 border border-brand-accent/25 rounded-full self-start glow-accent">
                      <div className="h-2.5 w-2.5 bg-brand-accent rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-100 tracking-wider">AGENT A</span>
                      <span className="text-[10px] text-brand-accent font-mono">T:0.6</span>
                    </div>

                    {turns
                      .filter((t) => t.agent === 'Agent A')
                      .map((turn) => (
                        <div 
                          key={turn.id} 
                          className="glass rounded-2xl p-5 shadow-md flex flex-col space-y-3 animate-slide-up agent-a-border hover-lift transition-all"
                        >
                          <div className="flex items-center justify-between text-[11px] text-brand-textMuted border-b border-brand-border/40 pb-2">
                            <span className="font-semibold tracking-wider font-sans uppercase flex items-center space-x-1.5">
                              <span className="bg-brand-accent/15 text-brand-accent px-2 py-0.5 rounded-md text-[10px] font-bold">R{turn.round_number}</span>
                              <span>{turn.round_number === 1 ? 'Opening' : turn.round_number === 5 ? 'Closing' : 'Rebuttal'}</span>
                            </span>
                          </div>
                          {renderContentWithClaims(turn.content, turn.claims)}
                        </div>
                      ))}

                    {status.agent === 'Agent A' && (
                      <div className="glass border-dashed rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 text-center">
                        <div className="bg-brand-accent/10 p-3 rounded-full text-brand-accent animate-pulse-glow">
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-300">
                            {status.status === 'writing' ? "Agent A is formulating statement..." : "Fact-checking Agent A's claims..."}
                          </p>
                          <span className="text-xs text-brand-textMuted font-sans">
                            {status.status === 'writing' ? "Citing verified sources inline" : "Verifying claims against whitelist domains..."}
                          </span>
                        </div>
                        {/* Skeleton preview */}
                        <div className="w-full space-y-2 mt-2">
                          <div className="skeleton h-3 w-full rounded"></div>
                          <div className="skeleton h-3 w-4/5 rounded"></div>
                          <div className="skeleton h-3 w-3/5 rounded"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Agent B Column */}
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2.5 px-4 py-2 bg-brand-accentAmber/10 border border-brand-accentAmber/25 rounded-full self-start glow-amber">
                      <div className="h-2.5 w-2.5 bg-brand-accentAmber rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-100 tracking-wider">AGENT B</span>
                      <span className="text-[10px] text-brand-accentAmber font-mono">T:0.8</span>
                    </div>

                    {turns
                      .filter((t) => t.agent === 'Agent B')
                      .map((turn) => (
                        <div 
                          key={turn.id} 
                          className="glass rounded-2xl p-5 shadow-md flex flex-col space-y-3 animate-slide-up agent-b-border hover-lift transition-all"
                        >
                          <div className="flex items-center justify-between text-[11px] text-brand-textMuted border-b border-brand-border/40 pb-2">
                            <span className="font-semibold tracking-wider font-sans uppercase flex items-center space-x-1.5">
                              <span className="bg-brand-accentAmber/15 text-brand-accentAmber px-2 py-0.5 rounded-md text-[10px] font-bold">R{turn.round_number}</span>
                              <span>{turn.round_number === 1 ? 'Opening' : turn.round_number === 5 ? 'Closing' : 'Rebuttal'}</span>
                            </span>
                          </div>
                          {renderContentWithClaims(turn.content, turn.claims)}
                        </div>
                      ))}

                    {status.agent === 'Agent B' && (
                      <div className="glass border-dashed rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 text-center">
                        <div className="bg-brand-accentAmber/10 p-3 rounded-full text-brand-accentAmber animate-pulse-glow">
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-300">
                            {status.status === 'writing' ? "Agent B is formulating statement..." : "Fact-checking Agent B's claims..."}
                          </p>
                          <span className="text-xs text-brand-textMuted font-sans">
                            {status.status === 'writing' ? "Analyzing opponent arguments and citing sources" : "Verifying claims against whitelist domains..."}
                          </span>
                        </div>
                        <div className="w-full space-y-2 mt-2">
                          <div className="skeleton h-3 w-full rounded"></div>
                          <div className="skeleton h-3 w-4/5 rounded"></div>
                          <div className="skeleton h-3 w-3/5 rounded"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={turnsEndRef} />

              {/* Status display for analysis / judging */}
              {(status.agent === 'Judge' || status.agent === 'Analyst' || status.agent === 'FOR' || status.agent === 'AGAINST' || status.agent === 'VERDICT') && (
                <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xl glow-accent">
                  <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl text-indigo-400 animate-pulse-glow">
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
                  {/* Progress skeletons */}
                  <div className="w-full max-w-sm space-y-2 mt-2">
                    <div className="skeleton h-2 w-full rounded-full"></div>
                    <div className="skeleton h-2 w-3/4 rounded-full"></div>
                  </div>
                </div>
              )}

              {/* Error Callout */}
              {error && (
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-5 flex items-start space-x-3.5 text-rose-200 animate-scale-in">
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
                <div className="glass rounded-2xl p-6 shadow-2xl space-y-6 animate-scale-in gradient-border glow-accent">
                  <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                    <Award className="h-4 w-4" />
                    <span>Official Scorecard</span>
                  </div>
                  
                  <h4 className="text-2xl font-bold font-serif gradient-text">Judge's Final Verdict</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brand-border/40">
                    {scores.map((score) => {
                      const isA = score.agent === 'Agent A';
                      const winner = getWinner(scores);
                      const isWinner = score.agent === winner;
                      return (
                        <div key={score.agent} className={`p-5 rounded-xl border relative overflow-hidden ${
                          isA 
                            ? 'border-brand-accent/25 bg-brand-accent/5' 
                            : 'border-brand-accentAmber/25 bg-brand-accentAmber/5'
                        } ${isWinner ? (isA ? 'glow-accent' : 'glow-amber') : ''} flex flex-col space-y-4`}>
                          {/* Winner badge */}
                          {isWinner && winner !== 'Tie' && (
                            <div className="absolute top-3 right-3">
                              <Crown className={`h-5 w-5 ${isA ? 'text-brand-accent' : 'text-brand-accentAmber'} animate-float`} />
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <span className="font-bold font-serif text-lg text-slate-200 flex items-center space-x-2">
                              <span>{score.agent}</span>
                              {isWinner && winner !== 'Tie' && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isA ? 'bg-brand-accent/20 text-brand-accent' : 'bg-brand-accentAmber/20 text-brand-accentAmber'}`}>WINNER</span>
                              )}
                            </span>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-3xl font-extrabold text-white">{score.total}</span>
                              <span className="text-xs text-slate-400">/ 10</span>
                            </div>
                          </div>

                          <div className="space-y-3 text-sm">
                            {[
                              { label: 'Logic Validity', key: 'logic' },
                              { label: 'Evidence Quality', key: 'evidence' },
                              { label: 'Rebuttal Effectiveness', key: 'rebuttal' }
                            ].map(({ label, key }) => (
                              <div key={key}>
                                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                  <span>{label}</span>
                                  <span className="font-bold text-slate-200">{score[key]}/10</span>
                                </div>
                                <div className="h-2.5 w-full bg-brand-dark/60 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full score-bar-fill ${isA ? 'bg-brand-accent' : 'bg-brand-accentAmber'}`} 
                                    style={{ width: scoreBarsVisible ? `${score[key] * 10}%` : '0%' }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="glass p-4 rounded-lg text-xs text-slate-300 font-sans leading-relaxed">
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
                <div className="glass rounded-2xl p-6 text-center animate-scale-in glow-emerald" style={{ borderLeft: '3px solid rgba(16, 185, 129, 0.6)' }}>
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
              <div className="glass-strong rounded-2xl p-5 shadow-xl flex flex-col space-y-4 sticky top-24">
                <div className="flex items-center justify-between text-brand-textMuted border-b border-brand-border/40 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg flex items-center justify-center">
                      <img src={logo} className="h-4 w-4 object-contain" alt="Logo" />
                    </div>
                    <h4 className="text-sm font-bold tracking-wider uppercase font-sans">
                      {selectedClaim?.ref_number ? `Reference [${selectedClaim.ref_number}]` : "Fact-Checker Log"}
                    </h4>
                  </div>
                  {selectedClaim && (
                    <button 
                      onClick={() => setSelectedClaim(null)} 
                      className="text-xs hover:text-white text-slate-500 font-semibold transition-colors bg-brand-border/30 px-2 py-1 rounded-md"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {!selectedClaim ? (
                  <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 rounded-2xl animate-pulse-glow">
                      <img src={logo} className="h-10 w-10 object-contain opacity-50" alt="Logo" />
                    </div>
                    <div>
                      <h5 className="font-serif text-slate-300 font-semibold">Inspect Claims</h5>
                      <p className="text-xs text-brand-textMuted font-sans mt-1 leading-relaxed">
                        Factual statements are underlined and citations are numbered. Click any element to inspect its source verification.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4 animate-scale-in">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
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
                            Tier {selectedClaim.source_tier}
                          </span>
                        )}
                      </div>
                      
                      <h5 className="text-xs text-brand-textMuted uppercase font-bold tracking-wider font-sans mb-1">FACTUAL CLAIM:</h5>
                      <p className="text-sm font-sans font-medium text-slate-200 leading-relaxed glass p-3 rounded-lg">
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
                        <div className="glass p-3 rounded-lg text-[10px] text-brand-textMuted font-sans leading-relaxed">
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
          <div className="max-w-4xl mx-auto w-full py-8 space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold font-serif gradient-text">Archive</h3>
                <p className="text-sm text-brand-textMuted font-sans mt-1">Review past debates, fact-checks, and scoring cards.</p>
              </div>
              <button 
                onClick={() => setActiveView('landing')}
                className="flex items-center space-x-2 glass hover:bg-brand-border/50 px-4 py-2 rounded-xl text-sm transition-all text-slate-300 hover:text-white hover-lift"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back Home</span>
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
                <div className="animate-pulse-glow p-4 rounded-2xl">
                  <RefreshCw className="h-8 w-8 text-brand-accent animate-spin" />
                </div>
                <span className="text-sm text-brand-textMuted">Loading archive...</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="glass rounded-xl p-5 space-y-3">
                      <div className="skeleton h-3 w-1/3 rounded"></div>
                      <div className="skeleton h-5 w-full rounded"></div>
                      <div className="skeleton h-3 w-2/3 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !currentUser ? (
              <div className="glass rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4 glow-accent">
                <div className="p-5 rounded-2xl animate-float">
                  <img src={logo} className="h-12 w-12 object-contain opacity-50" alt="Logo" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-slate-300">Sign in to view your archive</h4>
                  <p className="text-xs text-brand-textMuted font-sans mt-1 max-w-xs mx-auto leading-relaxed">
                    Completed debates and fact-checks are stored privately in your personal archive.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveView('login')}
                  className="mt-2 bg-white hover:bg-slate-200 text-black px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md"
                >
                  Sign In to Your Account
                </button>
              </div>
            ) : historyList.length === 0 ? (
              <div className="glass rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4 glow-accent">
                <div className="p-5 rounded-2xl animate-float">
                  <img src={logo} className="h-12 w-12 object-contain opacity-50" alt="Logo" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-slate-300">No entries in archive</h4>
                  <p className="text-xs text-brand-textMuted font-sans mt-1 max-w-xs mx-auto leading-relaxed">
                    Create your first debate or fact-check. Completed analyses are saved here automatically.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveView('landing')}
                  className="mt-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark px-5 py-2.5 rounded-xl text-sm font-bold transition-all animate-shine"
                >
                  Start Your First Debate
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historyList.map((debate, index) => {
                  const winner = getWinner(debate.scores);
                  const confCount = debate.claim_stats?.Confirmed || 0;
                  const dispCount = debate.claim_stats?.Disputed || 0;
                  const unverCount = debate.claim_stats?.Unverifiable || 0;
                  const mode = debate.mode || 'debate';
                  
                  return (
                    <div 
                      key={debate.id}
                      onClick={() => handleViewPastDebate(debate.id)}
                      className="glass rounded-xl p-5 hover:border-brand-accent/40 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 group hover-lift animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
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
                        <div className="pt-3 border-t border-brand-border/40 flex items-center justify-between text-xs">
                          {mode === 'debate' && debate.scores?.length > 0 && (
                            <span className="text-brand-textMuted font-sans flex items-center">
                              Winner: <strong className="text-indigo-400 ml-1 font-serif font-bold flex items-center">
                                {winner === 'Tie' ? 'Tie' : winner}
                                {winner !== 'Tie' && <Crown className="h-3 w-3 text-brand-accentAmber ml-0.5" />}
                              </strong>
                            </span>
                          )}
                          {mode === 'factcheck' && (
                            <span className="text-brand-textMuted font-sans">Factual Analysis</span>
                          )}
                          
                          <div className="flex items-center space-x-2 text-[10px] font-sans font-bold">
                            <span className="text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded">✓ {confCount}</span>
                            <span className="text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded">⚠️ {dispCount}</span>
                            <span className="text-slate-400 bg-slate-800/50 px-1.5 py-0.5 rounded">? {unverCount}</span>
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
      <footer className="border-t border-brand-border/40 bg-brand-dark/30 backdrop-blur-sm py-8 px-6 text-center text-xs text-brand-textMuted font-sans relative z-10">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <p className="flex items-center space-x-2">
            <img src={logo} className="h-5 w-5 object-contain" alt="Logo" />
            <span>&copy; {new Date().getFullYear()} ArguForge AI — Fact-Checked AI Analysis Platform.</span>
          </p>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">Tier 1: AP / Reuters / PIB</span>
            <span className="bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-2 py-0.5 rounded text-[10px] font-bold">Tier 2: BBC / NYT / Guardian</span>
            <span className="bg-slate-800/60 text-slate-400 border border-slate-700/50 px-2 py-0.5 rounded text-[10px] font-bold">Tier 3: CFR / Brookings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
