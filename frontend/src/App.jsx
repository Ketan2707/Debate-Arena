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

const GithubIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const BattleArenaLoader = ({ mode, topic }) => {
  const [dots, setDots] = useState('.');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '.' : prev + '.'));
    }, 500);

    const steps = mode === 'factcheck' 
      ? [
          "Resolving whitelisted domain index...",
          "Checking Tier 1 resources (AP News, Reuters, PIB)...",
          "Analyzing claims against Tier 2 publications (BBC, NYT)...",
          "Connecting to secure fact-checking database...",
          "Compiling support and opposition case briefs..."
        ]
      : [
          "Orchestrating AI agents in the arena...",
          "Tuning Agent A (Affirmative) parameters...",
          "Tuning Agent B (Negative) parameters...",
          "Generating initial stances & boundaries...",
          "Forging arguments and source integrity filters..."
        ];

    const stepsInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(stepsInterval);
    };
  }, [mode]);

  const steps = mode === 'factcheck' 
    ? [
        "Resolving whitelisted domain index...",
        "Checking Tier 1 resources (AP News, Reuters, PIB)...",
        "Analyzing claims against Tier 2 publications (BBC, NYT)...",
        "Connecting to secure fact-checking database...",
        "Compiling support and opposition case briefs..."
      ]
    : [
        "Orchestrating AI agents in the arena...",
        "Tuning Agent A (Affirmative) parameters...",
        "Tuning Agent B (Negative) parameters...",
        "Generating initial stances & boundaries...",
        "Forging arguments and source integrity filters..."
      ];

  if (mode === 'factcheck') {
    return (
      <div className="glass rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-6 shadow-2xl relative overflow-hidden min-h-[400px] border border-white/10 glow-emerald">
        {/* Particle effect container */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_60%)] pointer-events-none"></div>
        
        {/* Animated radar/scanner core */}
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-scan-pulse">
          <div className="absolute w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 animate-ping"></div>
          <Search className="h-10 w-10 text-emerald-400" />
        </div>

        <div className="space-y-2 z-10">
          <h4 className="text-xl font-bold font-serif text-slate-100 uppercase tracking-widest">
            Factual Integrity Core Active
          </h4>
          <p className="text-sm text-brand-textMuted max-w-md mx-auto font-sans">
            Auditing claims for "{topic}"
          </p>
        </div>

        {/* Dynamic status ticker */}
        <div className="bg-slate-900/60 border border-white/5 px-6 py-3 rounded-xl min-w-[280px] text-xs font-mono text-emerald-400 z-10 flex items-center justify-center space-x-2">
          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span>{steps[currentStep]}{dots}</span>
        </div>

        {/* High tech progress scanner */}
        <div className="w-full max-w-md space-y-2 z-10 pt-4">
          <div className="h-1.5 bg-white/5 border border-white/10 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full animate-shimmer w-full"></div>
          </div>
          <div className="flex justify-between text-[10px] text-brand-textMuted font-mono uppercase tracking-wider">
            <span>Scan Rate: 100%</span>
            <span>Integrity Tier: Whitelist Only</span>
          </div>
        </div>
      </div>
    );
  }

  // Debate Mode - Adversarial Clash Animation
  return (
    <div className="glass rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[400px] border border-white/10 flex flex-col justify-between space-y-8">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-brand-accent/5 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 bg-brand-accentAmber/5 rounded-full filter blur-3xl pointer-events-none"></div>

      {/* Header info */}
      <div className="text-center z-10 space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 px-3 py-1 rounded-full">
          Preparing Debate Arena
        </span>
        <h4 className="text-base md:text-lg font-serif text-brand-textMuted italic pt-2 max-w-lg mx-auto">
          "{topic}"
        </h4>
      </div>

      {/* The Clash Row */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 relative z-10 py-4">
        {/* Agent A Card (Affirmative) */}
        <div className="w-full max-w-[240px] glass rounded-2xl p-5 border border-brand-accent/30 text-center animate-clash-left glow-accent bg-gradient-to-b from-brand-accent/5 to-transparent">
          <div className="w-12 h-12 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center mx-auto mb-3 text-brand-accent">
            <Shield className="h-6 w-6" />
          </div>
          <h5 className="font-bold text-sm text-slate-200">AGENT A</h5>
          <p className="text-[10px] text-brand-accent font-semibold tracking-widest uppercase mt-0.5">Affirmative</p>
          <div className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 mt-4 text-[10px] text-brand-textMuted font-mono leading-relaxed">
            Formulating logical stance constraints...
          </div>
        </div>

        {/* VS Badge */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 bg-indigo-500/10 rounded-full blur-xl animate-vs-pulse"></div>
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-accent to-brand-accentAmber p-[2px] shadow-2xl relative z-20 animate-vs-pulse">
            <div className="w-full h-full rounded-full bg-[#0e1013] flex items-center justify-center">
              <span className="text-lg font-black font-serif italic text-white tracking-wider">VS</span>
            </div>
          </div>
        </div>

        {/* Agent B Card (Negative) */}
        <div className="w-full max-w-[240px] glass rounded-2xl p-5 border border-brand-accentAmber/30 text-center animate-clash-right glow-amber bg-gradient-to-b from-brand-accentAmber/5 to-transparent">
          <div className="w-12 h-12 rounded-full bg-brand-accentAmber/20 border border-brand-accentAmber/40 flex items-center justify-center mx-auto mb-3 text-brand-accentAmber">
            <Zap className="h-6 w-6" />
          </div>
          <h5 className="font-bold text-sm text-slate-200">AGENT B</h5>
          <p className="text-[10px] text-brand-accentAmber font-semibold tracking-widest uppercase mt-0.5">Negative</p>
          <div className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 mt-4 text-[10px] text-brand-textMuted font-mono leading-relaxed">
            Structuring adversarial counter-arguments...
          </div>
        </div>
      </div>

      {/* Charging Progress / Footer */}
      <div className="w-full max-w-lg mx-auto space-y-3 z-10">
        <div className="bg-slate-900/60 border border-white/5 px-6 py-2.5 rounded-xl text-center text-xs font-mono text-indigo-300 flex items-center justify-center space-x-2">
          <RefreshCw className="h-3 w-3 animate-spin text-brand-accent" />
          <span>{steps[currentStep]}{dots}</span>
        </div>
        
        {/* Animated charging bar */}
        <div className="h-1.5 bg-white/5 border border-white/10 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-brand-accent to-brand-accentAmber rounded-full animate-shimmer w-full"></div>
        </div>
      </div>
    </div>
  );
};

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
  // Separated Auth States to prevent cross-contamination
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerShowPassword, setRegisterShowPassword] = useState(false);

  const [authLoading, setAuthLoading] = useState(false);
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

  // Verify token once on mount
  useEffect(() => {
    const token = localStorage.getItem('debate_arena_token');
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          setAuthToken(token);
          setCurrentUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('debate_arena_token');
          setAuthToken(null);
          setCurrentUser(null);
        });
    }
  }, []);

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

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.detail || 'Invalid email or password');
        return;
      }
      localStorage.setItem('debate_arena_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setLoginEmail('');
      setLoginPassword('');
      
      // Execute pending action
      if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        if (action === 'debate' || action === 'factcheck') {
          setActiveView('landing');
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
      setLoginError('Network error. Make sure backend is running.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setRegisterError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerEmail, password: registerPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.detail || 'Registration failed');
        return;
      }
      localStorage.setItem('debate_arena_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setRegisterEmail('');
      setRegisterPassword('');
      
      // Execute pending action
      if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        if (action === 'debate' || action === 'factcheck') {
          setActiveView('landing');
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
      setRegisterError('Network error. Make sure backend is running.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    const redirectUri = window.location.origin;
    
    if (provider === 'Google') {
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      if (!googleClientId) {
        setLoginError('Google Sign-In is not configured. Please add VITE_GOOGLE_CLIENT_ID.');
        setRegisterError('Google Sign-In is not configured. Please add VITE_GOOGLE_CLIENT_ID.');
        return;
      }
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('email profile')}&state=google&access_type=offline&prompt=consent`;
    } else if (provider === 'GitHub') {
      const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
      if (!githubClientId) {
        setLoginError('GitHub Sign-In is not configured. Please add VITE_GITHUB_CLIENT_ID.');
        setRegisterError('GitHub Sign-In is not configured. Please add VITE_GITHUB_CLIENT_ID.');
        return;
      }
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('user:email')}&state=github`;
    }
  };

  const handleOAuthCallback = async (provider, codeOrToken) => {
    setAuthLoading(true);
    try {
      const endpoint = provider === 'Google' ? '/api/auth/google/callback' : '/api/auth/github/callback';
      const body = provider === 'Google' 
        ? { code: codeOrToken, redirect_uri: window.location.origin } 
        : { code: codeOrToken };
      
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.detail || `${provider} authentication failed`;
        if (activeView === 'register') setRegisterError(errorMsg);
        else setLoginError(errorMsg);
        return;
      }
      
      localStorage.setItem('debate_arena_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      
      if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        if (action === 'debate' || action === 'factcheck') {
          setActiveView('landing');
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
      const errorMsg = 'OAuth callback connection error.';
      if (activeView === 'register') setRegisterError(errorMsg);
      else setLoginError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Detect OAuth redirect callbacks on mount
  useEffect(() => {
    const handleCallbackDetection = async () => {
      const search = window.location.search;
      if (search && search.includes('code=')) {
        const params = new URLSearchParams(search);
        const code = params.get('code');
        const state = params.get('state');
        if (code) {
          window.history.replaceState(null, null, window.location.pathname);
          const provider = state === 'google' ? 'Google' : 'GitHub';
          await handleOAuthCallback(provider, code);
        }
      }
    };
    
    handleCallbackDetection();
  }, []);

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
              <h1 className="text-sm sm:text-lg font-bold tracking-tight font-sans text-brand-textLight">ArguForge AI</h1>
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
            <button 
              onClick={() => {
                if (status.status === 'idle' || confirm("Leave active session?")) {
                  if (eventSourceRef.current) eventSourceRef.current.close();
                  setStatus({ status: 'idle' });
                  setActiveView('about');
                }
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors font-sans cursor-pointer"
            >
              About
            </button>

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
                className="bg-white hover:bg-slate-200 text-black px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md font-sans cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center relative z-10">
        
        {/* ── LOGIN / REGISTER VIEW ── */}
        {/* ── LOGIN VIEW ── */}
        {activeView === 'login' && (
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
                  Welcome back
                </h2>
                <p className="text-sm text-brand-textMuted font-sans mt-2 text-center">
                  Sign in to start fact-checked debates and deep-dive analyses.
                </p>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-brand-textMuted font-sans font-semibold mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
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
                      type={loginShowPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-brand-dark/80 border border-brand-border rounded-xl pl-10 pr-10 py-3 text-slate-100 placeholder-slate-500 focus-glow transition-all font-sans text-sm"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setLoginShowPassword(!loginShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {loginShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-300 font-sans flex items-center space-x-2">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{loginError}</span>
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
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#1b1724] px-2.5 text-slate-500 font-sans tracking-wide">Or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('Google')}
                  className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200"
                >
                  <svg className="h-4 w-4 text-rose-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.78 0 3.3.67 4.47 1.76l2.454-2.453C17.68 1.957 15.152 1 12.24 1 6.136 1 1 6.136 1 12.24s5.136 11.24 11.24 11.24c6.382 0 10.618-4.482 10.618-10.8 0-.727-.08-1.282-.173-1.682H12.24z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('GitHub')}
                  className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200"
                >
                  <svg className="h-4 w-4 text-slate-200 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Toggle login/register */}
              <div className="mt-6 text-center">
                <p className="text-xs text-brand-textMuted font-sans">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => {
                      setLoginError('');
                      setActiveView('register');
                    }}
                    className="text-brand-accent hover:text-brand-accent/80 font-semibold transition-colors"
                  >
                    Sign up
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

        {/* ── REGISTER VIEW ── */}
        {activeView === 'register' && (
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
                  Create your account
                </h2>
                <p className="text-sm text-brand-textMuted font-sans mt-2 text-center">
                  Join ArguForge AI to access AI-powered fact-checking.
                </p>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-brand-textMuted font-sans font-semibold mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
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
                      type={registerShowPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-brand-dark/80 border border-brand-border rounded-xl pl-10 pr-10 py-3 text-slate-100 placeholder-slate-500 focus-glow transition-all font-sans text-sm"
                      required
                      minLength={6}
                    />
                    <button 
                      type="button" 
                      onClick={() => setRegisterShowPassword(!registerShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {registerShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {registerError && (
                  <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-300 font-sans flex items-center space-x-2">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{registerError}</span>
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
                      <UserPlus className="h-4 w-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#1b1724] px-2.5 text-slate-500 font-sans tracking-wide">Or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('Google')}
                  className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200"
                >
                  <svg className="h-4 w-4 text-rose-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.78 0 3.3.67 4.47 1.76l2.454-2.453C17.68 1.957 15.152 1 12.24 1 6.136 1 1 6.136 1 12.24s5.136 11.24 11.24 11.24c6.382 0 10.618-4.482 10.618-10.8 0-.727-.08-1.282-.173-1.682H12.24z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('GitHub')}
                  className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200"
                >
                  <svg className="h-4 w-4 text-slate-200 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Toggle login/register */}
              <div className="mt-6 text-center">
                <p className="text-xs text-brand-textMuted font-sans">
                  Already have an account?{' '}
                  <button 
                    onClick={() => {
                      setRegisterError('');
                      setActiveView('login');
                    }}
                    className="text-brand-accent hover:text-brand-accent/80 font-semibold transition-colors"
                  >
                    Sign in
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

              {turns.length === 0 && status.status !== 'idle' && !error ? (
                <BattleArenaLoader mode={debateMode} topic={debateTopic} />
              ) : (
                <>
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
                </>
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

        {/* ── ABOUT & DEVELOPER VIEW ── */}
        {activeView === 'about' && (
          <div className="max-w-4xl mx-auto w-full py-8 space-y-8 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold font-serif gradient-text">About ArguForge AI</h3>
                <p className="text-sm text-brand-textMuted font-sans mt-1">
                  Argument Forge Artificial Intelligence &mdash; Source-Integrity AI Debate Platform
                </p>
              </div>
              <button 
                onClick={() => setActiveView('landing')}
                className="flex items-center space-x-2 glass hover:bg-brand-border/50 px-4 py-2 rounded-xl text-sm transition-all text-slate-300 hover:text-white hover-lift cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back Home</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Features & Concept (Span 2) */}
              <div className="md:col-span-2 space-y-6">
                {/* Platform Overview */}
                <div className="glass rounded-2xl p-6 glow-accent border border-white/10 relative overflow-hidden group hover-lift">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl group-hover:bg-brand-accent/10 transition-all duration-500"></div>
                  <h4 className="text-xl font-bold font-serif mb-3 text-slate-100 flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-brand-accent animate-pulse" />
                    <span>The Vision</span>
                  </h4>
                  <p className="text-sm text-slate-300 font-sans leading-relaxed">
                    <strong>ArguForge AI</strong> stands for <strong>Argument Forge Artificial Intelligence</strong>. It is a full-stack, source-integrity-first AI debate and factual analysis platform designed to battle misinformation. By setting specialized, temperature-tuned agents in an adversarial debate arena, the platform forge logical, source-verified insights for any topic.
                  </p>
                </div>

                {/* Features Card */}
                <div className="glass rounded-2xl p-6 border border-white/10 hover-lift">
                  <h4 className="text-xl font-bold font-serif mb-4 text-slate-100 flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-brand-accent" />
                    <span>Core Features</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-1.5 hover:bg-white/[0.08] transition-colors duration-300">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-brand-accent" />
                        <h5 className="font-bold text-sm text-slate-200">Adversarial Debate</h5>
                      </div>
                      <p className="text-xs text-brand-textMuted leading-relaxed">
                        Two temperature-tuned agents argue opposing stances (Affirmative vs. Negative) to generate structured, logical rebuttals.
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-1.5 hover:bg-white/[0.08] transition-colors duration-300">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-emerald-400" />
                        <h5 className="font-bold text-sm text-slate-200">Source-Integrity Auditing</h5>
                      </div>
                      <p className="text-xs text-brand-textMuted leading-relaxed">
                        An independent Fact-Checker extracts objective claims and verifies them against a strict multi-tier whitelist.
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-1.5 hover:bg-white/[0.08] transition-colors duration-300">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-brand-accentAmber" />
                        <h5 className="font-bold text-sm text-slate-200">Bias-Free Judging</h5>
                      </div>
                      <p className="text-xs text-brand-textMuted leading-relaxed">
                        Eliminates position bias by evaluating the debate twice (swapping labels) and averaging scores for logic, evidence, and rebuttal.
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-1.5 hover:bg-white/[0.08] transition-colors duration-300">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-indigo-400" />
                        <h5 className="font-bold text-sm text-slate-200">Real-Time Streaming</h5>
                      </div>
                      <p className="text-xs text-brand-textMuted leading-relaxed">
                        Uses Server-Sent Events (SSE) to stream live arguments, factual verdict badges, and judgment scores on the fly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usage Card */}
                <div className="glass rounded-2xl p-6 border border-white/10 hover-lift">
                  <h4 className="text-xl font-bold font-serif mb-4 text-slate-100 flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-brand-accentAmber" />
                    <span>How to Use</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-accent">1</div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-200">Enter your topic</h5>
                        <p className="text-xs text-brand-textMuted mt-0.5 leading-relaxed">Type any debate statement or query in the main input box on the landing page.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-accent">2</div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-200">Select Mode &amp; Stance</h5>
                        <p className="text-xs text-brand-textMuted mt-0.5 leading-relaxed">Choose "Debate" for live argumentation or "Fact-Check" for a structured source-audited synthesis. Optionally select a specific stance preference.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-accent">3</div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-200">Inspect Verifications</h5>
                        <p className="text-xs text-brand-textMuted mt-0.5 leading-relaxed">Click on any claim's color-coded verdict badge (Confirmed, Disputed, Unverifiable) to view source references and reasoning logs.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer Profile (Span 1) */}
              <div className="md:col-span-1 space-y-6">
                <div className="glass rounded-2xl p-6 glow-accent border border-white/10 flex flex-col items-center text-center space-y-5 hover-lift relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-accent/10 rounded-full blur-xl"></div>
                  
                  {/* Developer Avatar */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-accent to-purple-500 p-[2px] shadow-lg animate-float">
                    <div className="w-full h-full rounded-full bg-[#120F17] flex items-center justify-center overflow-hidden">
                      <span className="text-3xl font-bold font-serif text-brand-textLight tracking-wider">KA</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold font-serif text-slate-100">Ketan Arora</h4>
                    <p className="text-xs text-brand-accent font-sans font-semibold mt-0.5">Lead Developer &amp; Creator</p>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Passionate about building intelligent AI agents, robust full-stack applications, and polished user interfaces that prioritize speed and clarity.
                  </p>

                  <div className="w-full border-t border-brand-border/40 my-1"></div>

                  <div className="w-full space-y-3">
                    <span className="text-xs font-semibold text-brand-textMuted font-sans block text-left">Connect with me:</span>
                    
                    <div className="grid grid-cols-1 gap-2.5 w-full">
                      {/* GitHub */}
                      <a 
                        href="https://github.com/Ketan2707" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-sans text-slate-300 hover:text-white transition-all duration-300 group cursor-pointer"
                      >
                        <GithubIcon className="h-4 w-4 text-slate-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">GitHub / Ketan2707</span>
                      </a>

                      {/* LinkedIn */}
                      <a 
                        href="https://www.linkedin.com/in/ketan-karan-arora-5a729b28b/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-sans text-slate-300 hover:text-white transition-all duration-300 group cursor-pointer"
                      >
                        <LinkedinIcon className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">LinkedIn / Ketan Arora</span>
                      </a>

                      {/* Instagram */}
                      <a 
                        href="https://www.instagram.com/ketannarora/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-sans text-slate-300 hover:text-white transition-all duration-300 group cursor-pointer"
                      >
                        <InstagramIcon className="h-4 w-4 text-pink-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Instagram / ketannarora</span>
                      </a>

                      {/* Gmail */}
                      <a 
                        href="mailto:ketanarora7890@gmail.com" 
                        className="flex items-center space-x-3 bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-sans text-slate-300 hover:text-white transition-all duration-300 group cursor-pointer"
                      >
                        <Mail className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Email / ketanarora7890@gmail.com</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

      {/* Mobile Claim Details Drawer / Modal */}
      {selectedClaim && (
        <div 
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 lg:hidden"
          onClick={() => setSelectedClaim(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#120F17] border border-white/10 w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-4 mb-4 text-brand-textMuted">
              <div className="flex items-center space-x-2">
                <img src={logo} className="h-5 w-5 object-contain" alt="Logo" />
                <h4 className="text-sm font-bold tracking-wider uppercase font-sans text-slate-200">
                  {selectedClaim.ref_number ? `Reference [${selectedClaim.ref_number}]` : "Verification Log"}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedClaim(null)} 
                className="text-xs text-slate-400 hover:text-white transition-colors bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10"
              >
                Close
              </button>
            </div>
            
            {/* Body */}
            <div className="flex flex-col space-y-4">
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
                
                <h5 className="text-xs text-brand-textMuted uppercase font-bold tracking-wider font-sans mb-1 mt-3">FACTUAL CLAIM:</h5>
                <p className="text-sm font-sans font-medium text-slate-200 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">
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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
