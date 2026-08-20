import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Shield, RefreshCw, Award, BookOpen, AlertTriangle, 
  CheckCircle, HelpCircle, ChevronRight, History, ArrowLeft, 
  ExternalLink, Sparkles, MessageSquare, Info, Star,
  Search, LogIn, LogOut, UserPlus, Lock, Mail, Eye, EyeOff,
  Zap, Crown, TrendingUp, Target, Globe, Sun, Moon
} from 'lucide-react';
import CloudShader from './CloudShader';
import NightSky from './NightSky';
import FloatingDock from './FloatingDock';
import logo from './assets/logo.png';
import { ParticleCard, GlobalSpotlight } from './MagicBento';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ─── Dark mode helper (outside component to avoid re-creation) ───
function getInitialDarkMode() {
  try {
    const saved = localStorage.getItem('arguforge-dark-mode');
    if (saved !== null) return saved === 'true';
  } catch (_) {}
  return false; // default: light mode
}

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
  const [activeRoundTab, setActiveRoundTab] = useState('all'); // 'all', '1', '2', '3', '4', '5', 'verdict'
  const [claimFilter, setClaimFilter] = useState('all'); // 'all', 'Confirmed', 'Disputed', 'Unverifiable'
  
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
  const streamCompletedRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
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
    setActiveRoundTab('all');
    setClaimFilter('all');
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

  // Connect to the SSE stream with auto-reconnection and completion tracking
  const connectToStream = (debateId) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    streamCompletedRef.current = false;
    const source = new EventSource(`${API_BASE}/api/debates/${debateId}/stream`);
    eventSourceRef.current = source;
    
    source.addEventListener('stances', (e) => {
      try {
        const data = JSON.parse(e.data);
        setStances(data);
      } catch (err) {
        console.error("Error parsing stances:", err);
      }
    });
    
    source.addEventListener('status', (e) => {
      try {
        const data = JSON.parse(e.data);
        setStatus(data);
      } catch (err) {
        console.error("Error parsing status:", err);
      }
    });
    
    source.addEventListener('turn', (e) => {
      try {
        const data = JSON.parse(e.data);
        setTurns((prev) => {
          if (prev.some((t) => t.id === data.id)) return prev;
          return [...prev, data];
        });
      } catch (err) {
        console.error("Error parsing turn:", err);
      }
    });
    
    source.addEventListener('verdict', (e) => {
      try {
        const data = JSON.parse(e.data);
        setScores(data.scores || []);
      } catch (err) {
        console.error("Error parsing verdict:", err);
      }
      setStatus({ status: 'idle' });
      streamCompletedRef.current = true;
      reconnectAttemptsRef.current = 0;
      source.close();
    });
    
    source.addEventListener('error', (e) => {
      if (streamCompletedRef.current) return;
      try {
        const data = JSON.parse(e.data);
        if (data && data.error) {
          setError(data.error);
          setStatus({ status: 'idle' });
          streamCompletedRef.current = true;
          source.close();
        }
      } catch {
        // Non-JSON error frame
      }
    });
    
    source.onerror = async (err) => {
      // If stream finished normally via verdict event or error event, close is expected
      if (streamCompletedRef.current) {
        source.close();
        return;
      }
      
      console.warn("SSE connection interrupted. Verifying debate status...", err);
      source.close();

      // Check if the debate actually completed in the backend
      try {
        const checkRes = await fetch(`${API_BASE}/api/debates/${debateId}`);
        if (checkRes.ok) {
          const detail = await checkRes.json();
          if (detail.turns && detail.turns.length > 0) {
            setTurns(detail.turns);
          }
          if (detail.status === 'completed') {
            setScores(detail.scores || []);
            setStatus({ status: 'idle' });
            streamCompletedRef.current = true;
            return;
          } else if (detail.status === 'failed') {
            setError(detail.error || "Analysis was interrupted. Click Retry to run again.");
            setStatus({ status: 'idle' });
            streamCompletedRef.current = true;
            return;
          }
        }
      } catch (checkErr) {
        console.warn("Could not check debate status:", checkErr);
      }

      // Auto-reconnect if still in progress (up to 3 attempts)
      if (reconnectAttemptsRef.current < 3) {
        reconnectAttemptsRef.current += 1;
        console.log(`Auto-reconnecting to stream (attempt ${reconnectAttemptsRef.current}/3)...`);
        setTimeout(() => {
          if (!streamCompletedRef.current) {
            connectToStream(debateId);
          }
        }, 1200);
      } else {
        setError("Connection lost. Click Retry to continue.");
        setStatus({ status: 'idle' });
      }
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

  // Helper to extract clean domain name from URL
  const getDomainFromUrl = (url) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return url.length > 22 ? url.substring(0, 22) + '...' : url;
    }
  };

  // Sanitize internal thinking scratchpads, <think> tags, and raw bracket tags
  const cleanThinkingAndFootnotes = (rawText) => {
    if (!rawText) return "";
    let cleaned = rawText;
    // Strip <think>...</think> blocks
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    // Strip unclosed <think> blocks
    cleaned = cleaned.replace(/<think>[\s\S]*$/gi, '');
    // Strip "Thinking Process: ..." up to the first real paragraph
    cleaned = cleaned.replace(/^(?:Thinking Process|Thought Process|Reasoning):[\s\S]*?\n\n/gi, '');
    // Strip meta scratchpad lines like *Word Count:* ...
    cleaned = cleaned.replace(/\*+(?:Word Count|Constraint|Cutting|Deconstruct)[^*]*\*+[\s\S]*?(?=\n\n|$)/gi, '');
    // Strip "Reference(s):" or "References:" bibliographic headers and preceding lists
    cleaned = cleaned.replace(/^(?:Reference\(s\)|References|Bibliography|Sources|Works Cited):\s*\n(?:[-*•\d.]+[^\n]*\n*)*/gi, '');
    cleaned = cleaned.replace(/\n+(?:Reference\(s\)|References|Bibliography|Sources|Works Cited):\s*\n(?:[-*•\d.]+[^\n]*\n*)*$/gi, '');
    cleaned = cleaned.replace(/^(?:Reference\(s\)|References|Bibliography|Sources|Works Cited):[ \t]*\n*/gi, '');
    // Strip bulleted bibliographic citations at start (e.g. "- Author (Year)... <http...>")
    cleaned = cleaned.replace(/^(?:[-*•]\s+[A-Za-z\s,.\(\)\d]+(?:Retrieved from\s*)?<https?:\/\/[^\s>]+>\s*\n*)+/gi, '');
    // Strip raw HTML-like bracketed footnote tags like <[1]>, <[2]>, <[3]>
    cleaned = cleaned.replace(/<\s*\[\s*\d+\s*\]\s*>/g, '');
    // Strip Asian citation brackets like 【4:0†source】
    cleaned = cleaned.replace(/[【\u3010][^】\u3011]*[】\u3011]/g, '');
    // Clean unclickable footnotes like [1], [2] unless they are markdown links [1](http...)
    cleaned = cleaned.replace(/\s*\[\d+\](?!\()/g, '');
    return cleaned.trim();
  };

  // Parse markdown links [text](url), parenthetical URLs (https://...), and bare URLs into clean clickable domain badges
  const parseMarkdownLinks = (text) => {
    if (!text) return "";
    const sanitized = cleanThinkingAndFootnotes(text);
    
    // Normalize raw parenthetical URLs like plan(https://reuters.com) -> plan [reuters.com](https://reuters.com)
    const normalized = sanitized.replace(/(?<=[^\s\[])\((https?:\/\/[^\s)]+)\)/g, ' [$1]($1)')
                                .replace(/\((https?:\/\/[^\s)]+)\)/g, ' [$1]($1)');

    const parts = [];
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/[^\s<>)"]+)/g;
    let lastIndex = 0;
    let match;
    
    while ((match = linkRegex.exec(normalized)) !== null) {
      if (match.index > lastIndex) {
        parts.push(normalized.substring(lastIndex, match.index));
      }
      
      const isMarkdown = Boolean(match[1]);
      const rawUrl = isMarkdown ? match[2] : match[3];
      const linkLabel = isMarkdown ? (match[1].startsWith('http') ? getDomainFromUrl(match[1]) : match[1]) : getDomainFromUrl(rawUrl);
      
      parts.push(
        <a 
          key={`link-${match.index}`} 
          href={rawUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`inline-flex items-center space-x-1 px-2 py-0.5 mx-1 rounded-md text-[11px] font-semibold transition-all align-baseline cursor-pointer border ${
            darkMode
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30 hover:underline'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:underline shadow-xs'
          }`}
          title={`Open verified source: ${rawUrl}`}
        >
          <span>{linkLabel}</span>
          <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 ml-0.5" />
        </a>
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < normalized.length) {
      parts.push(normalized.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [normalized];
  };

  // Helper to parse claims and apply dynamic underlines + inline reference icons
  const renderContentWithClaims = (content, claims) => {
    if (!content) return null;

    const cleanedContent = cleanThinkingAndFootnotes(content);
    if (!cleanedContent) return null;
    
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
      return <div className={`leading-relaxed font-sans whitespace-pre-wrap ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{parseMarkdownLinks(cleanedContent)}</div>;
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
              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded transition-all duration-200 cursor-pointer border ${
                darkMode
                  ? 'bg-indigo-500/20 hover:bg-indigo-500 hover:text-white text-indigo-300 border-indigo-500/30'
                  : 'bg-indigo-100 hover:bg-indigo-600 hover:text-white text-indigo-700 border-indigo-200 shadow-xs'
              }`}
              title={`View citation details: ${seg.url}`}
            >
              [{refNum}]
            </button>
          </sup>
        );
      } else if (seg.type === 'claim') {
        const claimText = cleanedContent.substring(seg.start, seg.end);
        const verdict = seg.claim.verdict;
        
        let borderStyle = darkMode 
          ? 'border-slate-500 text-slate-200 hover:bg-slate-800/40' 
          : 'border-slate-400 text-slate-900 hover:bg-slate-100';
        if (verdict === 'Confirmed') {
          borderStyle = darkMode 
            ? 'border-emerald-500/80 text-slate-200 hover:bg-emerald-950/20' 
            : 'border-emerald-500/80 text-slate-900 hover:bg-emerald-50';
        }
        if (verdict === 'Disputed') {
          borderStyle = darkMode 
            ? 'border-amber-500/80 text-slate-200 hover:bg-amber-950/20' 
            : 'border-amber-500/80 text-slate-900 hover:bg-amber-50';
        }
        
        parts.push(
          <span 
            key={`claim-${segIdx}`}
            onClick={() => setSelectedClaim(seg.claim)}
            className={`cursor-pointer inline transition-all border-b-2 decoration-dotted pb-0.5 ${borderStyle}`}
            title="Click to view source integrity check"
          >
            {parseMarkdownLinks(claimText)}
            <span className={`inline-flex items-center justify-center rounded-full ml-1 px-1 py-0.2 text-[9px] font-extrabold select-none ${
              verdict === 'Confirmed' 
                ? (darkMode ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300')
                : verdict === 'Disputed' 
                ? (darkMode ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-800 border border-amber-300')
                : (darkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-300')
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
        <div className={`leading-relaxed font-sans whitespace-pre-wrap ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{parts}</div>
        
        {/* Render Cited Sources Index */}
        {Object.keys(urlToRefNum).length > 0 && (
          <div className={`pt-3 border-t text-xs font-sans ${darkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
            <div className={`font-bold mb-1.5 flex items-center ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
              <BookOpen className="h-3.5 w-3.5 mr-1" /> Cited Sources
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1.5">
              {Object.entries(urlToRefNum).map(([url, num]) => (
                <div key={url} className="flex items-start space-x-1.5 transition-colors">
                  <span className={`font-bold text-[9px] px-1 py-0.5 rounded leading-none border ${
                    darkMode 
                      ? 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30' 
                      : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                  }`}>[{num}]</span>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`hover:underline truncate text-[11px] leading-tight inline-flex items-center transition-colors ${
                      darkMode ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-700'
                    }`}
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

  // ─── DARK MODE ─────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem('arguforge-dark-mode', String(next)); } catch(_) {}
      return next;
    });
  };

  // ─── RENDER ────────────────────────────────────────────────

  return (
    <div className={`min-h-screen bg-brand-dark text-slate-100 flex flex-col antialiased relative${darkMode ? ' dark-mode' : ''}`}>
      {/* Adaptive Background Effects */}
      {!darkMode ? (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <CloudShader
            speed={0.7}
            count={6}
            cloudColor="#fbf8f2"
            skyTopColor="#3876ba"
            skyBottomColor="#8cbfe8"
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <NightSky
            starCount={180}
            speed={0.6}
            enableShootingStars={true}
          />
        </div>
      )}
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
          
          <div className="flex items-center space-x-4">
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
                document.getElementById('site-footer')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors font-sans cursor-pointer"
            >
              About
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="theme-toggle"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
          <div ref={bentoGridRef} className="max-w-4xl mx-auto w-full py-6 sm:py-10 flex flex-col items-center justify-center text-center animate-slide-up bento-section">
            <GlobalSpotlight gridRef={bentoGridRef} spotlightRadius={300} glowColor="168, 85, 247" />

            {/* Pill Badge from image */}
            <div className={`inline-flex items-center justify-center backdrop-blur-md px-4 py-1.5 rounded-full mb-5 text-xs font-sans tracking-wide animate-scale-in ${darkMode ? 'border border-white/10 bg-white/5 text-slate-300' : 'border border-blue-200 bg-white/60 text-slate-700'}`}>
              <span className={`px-2.5 py-0.5 rounded-full font-bold mr-2 text-[9px] ${darkMode ? 'bg-white text-black' : 'bg-indigo-600 text-white'}`}>NEW</span>
              <span>Just shipped v2.0</span>
            </div>

            {/* Hero Heading - matching font and text style */}
            <h2 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-sans mb-4 leading-tight max-w-3xl mx-auto ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Rise above the noise, forge the truth
            </h2>

            <p className={`text-base sm:text-lg mb-8 max-w-xl font-sans font-light leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
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
                <div className={`flex items-center w-full backdrop-blur-xl px-5 py-2.5 rounded-2xl transition-all duration-300 ${darkMode ? 'bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.02)] focus-within:border-white/40 focus-within:shadow-[0_0_30px_rgba(255,255,255,0.08)]' : 'bg-white/70 hover:bg-white/80 border border-blue-200 shadow-lg shadow-black/5 focus-within:border-indigo-400 focus-within:shadow-[0_0_20px_rgba(79,70,229,0.12)]'}`}>
                  <Search className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                  <input 
                    type="text" 
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Should electric vehicles be mandatory by 2035?"
                    className={`w-full bg-transparent py-3 focus:outline-none font-sans text-md ${darkMode ? 'text-slate-100 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
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
                <div className={`flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 backdrop-blur-md px-5 py-3 rounded-2xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white/65 border border-blue-200 shadow-md shadow-black/5'}`}>
                  <span className={`text-xs font-sans font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Analysis Focus:</span>
                  <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-black/40 border border-white/10' : 'bg-slate-200/80 border border-blue-200'}`}>
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
                            ? (darkMode ? 'bg-white text-black shadow-lg' : 'bg-indigo-600 text-white shadow-lg')
                            : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
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
                    className={`font-bold px-8 py-3.5 w-full font-sans flex items-center justify-center space-x-2 transition duration-200 ${darkMode ? 'bg-transparent text-white border border-white/15 hover:bg-white/5' : 'bg-white/60 text-slate-800 border border-blue-200 hover:bg-white/80'}`}
                  >
                    <Shield className="h-4 w-4 text-white" />
                    <span>Run Fact-Check</span>
                  </button>
                </ParticleCard>
              </div>
            </form>
            
            {/* Quick prefill examples */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-2xl">
              <span className="text-xs text-slate-500 mr-1 flex items-center font-sans"><Sparkles className="h-3 w-3 mr-1 text-slate-400" />Try:</span>
              {["Should electric vehicles be mandatory by 2035?", "Is artificial intelligence a net benefit to public education?", "Should lab-grown meat be certified for commercial scale distribution?"].map((ex) => (
                <button 
                  key={ex}
                  onClick={() => setTopicInput(ex)}
                  className={`text-xs px-3.5 py-1.5 rounded-full transition-all duration-300 font-sans ${darkMode ? 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20' : 'bg-white/60 border border-blue-200 text-slate-600 hover:text-slate-900 hover:border-blue-300'}`}
                >
                  {ex.length > 38 ? ex.substring(0, 38) + '...' : ex}
                </button>
              ))}
            </div>


            {!currentUser && (
              <div className={`mt-5 rounded-xl px-4 py-2.5 max-w-md backdrop-blur-md ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-blue-200'}`}>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-sans text-center">
                  <Lock className="h-3 w-3 inline mr-1 opacity-70" />
                  <button onClick={() => setActiveView('login')} className="font-semibold underline hover:opacity-80">Sign in</button> to save debates &amp; fact-checks to your archive.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVE DEBATE / COMMAND CENTER ── */}
        {activeView === 'debate' && (
          <div className="flex flex-col space-y-6 animate-fade-in w-full max-w-7xl mx-auto">
            
            {/* 1. Header Control Bar */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl p-4 rounded-2xl shadow-lg border ${darkMode ? 'bg-slate-900/80 border-white/10 text-white' : 'bg-white/85 border-blue-200 text-slate-900 shadow-md'}`}>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => {
                    if (status.status === 'idle' || confirm("Cancel active analysis and return home?")) {
                      if (eventSourceRef.current) eventSourceRef.current.close();
                      setStatus({ status: 'idle' });
                      setActiveView('landing');
                    }
                  }}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${darkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'}`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{status.status === 'idle' ? "Back to Home" : "Cancel"}</span>
                </button>

                <div className={`h-5 w-[1px] ${darkMode ? 'bg-white/10' : 'bg-slate-300'}`}></div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    debateMode === 'factcheck'
                      ? (darkMode ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                      : (darkMode ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-200')
                  }`}>
                    {debateMode === 'factcheck' ? '🛡️ Factual Deep-Dive' : '⚔️ Debate Arena'}
                  </span>
                  
                  {status.status !== 'idle' ? (
                    <span className={`flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${darkMode ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>{status.status === 'writing' ? `${status.agent} speaking...` : 'Evaluating claims...'}</span>
                    </span>
                  ) : (
                    <span className={`flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${darkMode ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                      <CheckCircle className="h-3 w-3" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Stance Indicator */}
              <div className={`text-xs font-sans ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Focus: <strong className={`capitalize ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{stancePreference}</strong>
              </div>
            </div>

            {/* 2. Topic Display Card */}
            <div className={`rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl border ${darkMode ? 'bg-slate-900/90 border-white/10 text-white shadow-2xl' : 'bg-white/90 border-blue-200 text-slate-900 shadow-lg'}`}>
              <div className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center space-x-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                <Target className="h-3.5 w-3.5" />
                <span>Central Motion / Query</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold font-sans leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {debateTopic}
              </h2>

              {/* Stances Matrix */}
              {debateMode === 'debate' && stances.stance_a && (
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <div className={`rounded-xl p-4 border ${darkMode ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50/70 border-indigo-200'}`}>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center space-x-1.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                      <Zap className="h-3.5 w-3.5" />
                      <span>Agent A (Affirmative)</span>
                    </div>
                    <p className={`text-xs leading-relaxed font-sans ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{stances.stance_a}</p>
                  </div>
                  <div className={`rounded-xl p-4 border ${darkMode ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50/70 border-amber-200'}`}>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center space-x-1.5 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                      <Shield className="h-3.5 w-3.5" />
                      <span>Agent B (Negative)</span>
                    </div>
                    <p className={`text-xs leading-relaxed font-sans ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{stances.stance_b}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Round Selector Tabs (Concept 3 Command Center) */}
            {debateMode === 'debate' && turns.length > 0 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setActiveRoundTab('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeRoundTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : (darkMode ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white/80 border border-blue-200 text-slate-700 hover:bg-white shadow-sm')
                  }`}
                >
                  🌐 All Rounds
                </button>
                
                {[1, 2, 3, 4, 5].map((rnd) => {
                  const hasTurns = turns.some(t => t.round_number === rnd);
                  if (!hasTurns && status.status === 'idle') return null;
                  const label = rnd === 1 ? 'R1: Opening' : rnd === 5 ? 'R5: Closing' : `R${rnd}: Rebuttal`;
                  return (
                    <button
                      key={rnd}
                      onClick={() => setActiveRoundTab(String(rnd))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeRoundTab === String(rnd)
                          ? 'bg-indigo-600 text-white shadow-md'
                          : (darkMode ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white/80 border border-blue-200 text-slate-700 hover:bg-white shadow-sm')
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}

                {scores && scores.length > 0 && (
                  <button
                    onClick={() => setActiveRoundTab('verdict')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                      activeRoundTab === 'verdict'
                        ? 'bg-amber-600 text-white shadow-md'
                        : (darkMode ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 shadow-sm')
                    }`}
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>Official Scorecard</span>
                  </button>
                )}
              </div>
            )}

            {/* 4. Main Arena Body (3-Column Layout: Speeches + Right Fact Radar) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left & Center 2 Columns: Speech Decks */}
              <div className="lg:col-span-2 space-y-6">
                
                {turns.length === 0 && status.status !== 'idle' && !error ? (
                  <BattleArenaLoader mode={debateMode} topic={debateTopic} />
                ) : (
                  <>
                    {/* ── FACTCHECK MODE DECK ── */}
                    {debateMode === 'factcheck' && (
                      <div className="space-y-5">
                        {turns.filter(t => t.agent === 'FOR').map(turn => (
                          <div key={turn.id} className={`rounded-2xl p-6 shadow-md space-y-3 backdrop-blur-xl border ${darkMode ? 'bg-slate-900/90 border-emerald-500/30 text-slate-200' : 'bg-white/92 border-emerald-200 text-slate-900 shadow-md'}`}>
                            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="h-5 w-5" />
                              <span className="text-sm font-bold uppercase tracking-wider">Supporting Evidence (FOR)</span>
                            </div>
                            <div className={`font-sans leading-relaxed text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                              {renderContentWithClaims(turn.content, turn.claims)}
                            </div>
                          </div>
                        ))}

                        {turns.filter(t => t.agent === 'AGAINST').map(turn => (
                          <div key={turn.id} className={`rounded-2xl p-6 shadow-md space-y-3 backdrop-blur-xl border ${darkMode ? 'bg-slate-900/90 border-rose-500/30 text-slate-200' : 'bg-white/92 border-rose-200 text-slate-900 shadow-md'}`}>
                            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                              <AlertTriangle className="h-5 w-5" />
                              <span className="text-sm font-bold uppercase tracking-wider">Counter Arguments (AGAINST)</span>
                            </div>
                            <div className={`font-sans leading-relaxed text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                              {renderContentWithClaims(turn.content, turn.claims)}
                            </div>
                          </div>
                        ))}

                        {turns.filter(t => t.agent === 'VERDICT').map(turn => (
                          <div key={turn.id} className={`rounded-2xl p-6 shadow-md space-y-3 backdrop-blur-xl border ${darkMode ? 'bg-slate-900/90 border-indigo-500/30 text-slate-200' : 'bg-white/92 border-indigo-200 text-slate-900 shadow-md'}`}>
                            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                              <Award className="h-5 w-5" />
                              <span className="text-sm font-bold uppercase tracking-wider">Balanced Factual Synthesis</span>
                            </div>
                            <div className={`font-sans leading-relaxed text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                              {renderContentWithClaims(turn.content, turn.claims)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── DEBATE MODE DECK (Filtered by activeRoundTab) ── */}
                    {debateMode === 'debate' && activeRoundTab !== 'verdict' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Agent A Column */}
                        <div className="space-y-4">
                          <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${darkMode ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50/90 border-indigo-200 shadow-sm'}`}>
                            <div className="flex items-center space-x-2">
                              <div className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></div>
                              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>Agent A (Affirmative)</span>
                            </div>
                            <span className={`text-[10px] font-mono font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Temp: 0.6</span>
                          </div>

                          {turns
                            .filter(t => t.agent === 'Agent A')
                            .filter(t => activeRoundTab === 'all' || String(t.round_number) === activeRoundTab)
                            .map((turn) => (
                              <div key={turn.id} className={`rounded-2xl p-5 shadow-md space-y-3 backdrop-blur-xl border ${darkMode ? 'bg-slate-900/90 border-indigo-500/30 text-slate-100' : 'bg-white/95 border-indigo-200 text-slate-900 shadow-md'}`}>
                                <div className={`flex items-center justify-between pb-2 border-b text-xs font-bold ${darkMode ? 'border-white/10 text-indigo-400' : 'border-slate-200 text-indigo-600'}`}>
                                  <span>
                                    Round {turn.round_number}: {turn.round_number === 1 ? 'Opening Statement' : turn.round_number === 5 ? 'Closing Statement' : 'Rebuttal'}
                                  </span>
                                </div>
                                <div className={`font-sans leading-relaxed text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                  {renderContentWithClaims(turn.content, turn.claims)}
                                </div>
                              </div>
                            ))}

                          {status.agent === 'Agent A' && (
                            <div className={`border border-dashed rounded-2xl p-6 text-center space-y-3 ${darkMode ? 'bg-slate-900/80 border-indigo-500/40' : 'bg-white/90 border-indigo-300 shadow-sm'}`}>
                              <RefreshCw className={`h-6 w-6 animate-spin mx-auto ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                              <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                                Agent A is articulating arguments &amp; citing sources...
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Agent B Column */}
                        <div className="space-y-4">
                          <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${darkMode ? 'bg-amber-950/40 border-amber-500/30' : 'bg-amber-50/90 border-amber-200 shadow-sm'}`}>
                            <div className="flex items-center space-x-2">
                              <div className="h-2.5 w-2.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse"></div>
                              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-amber-300' : 'text-amber-900'}`}>Agent B (Negative)</span>
                            </div>
                            <span className={`text-[10px] font-mono font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Temp: 0.8</span>
                          </div>

                          {turns
                            .filter(t => t.agent === 'Agent B')
                            .filter(t => activeRoundTab === 'all' || String(t.round_number) === activeRoundTab)
                            .map((turn) => (
                              <div key={turn.id} className={`rounded-2xl p-5 shadow-md space-y-3 backdrop-blur-xl border ${darkMode ? 'bg-slate-900/90 border-amber-500/30 text-slate-100' : 'bg-white/95 border-amber-200 text-slate-900 shadow-md'}`}>
                                <div className={`flex items-center justify-between pb-2 border-b text-xs font-bold ${darkMode ? 'border-white/10 text-amber-400' : 'border-slate-200 text-amber-600'}`}>
                                  <span>
                                    Round {turn.round_number}: {turn.round_number === 1 ? 'Opening Statement' : turn.round_number === 5 ? 'Closing Statement' : 'Rebuttal'}
                                  </span>
                                </div>
                                <div className={`font-sans leading-relaxed text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                  {renderContentWithClaims(turn.content, turn.claims)}
                                </div>
                              </div>
                            ))}

                          {status.agent === 'Agent B' && (
                            <div className={`border border-dashed rounded-2xl p-6 text-center space-y-3 ${darkMode ? 'bg-slate-900/80 border-amber-500/40' : 'bg-white/90 border-amber-300 shadow-sm'}`}>
                              <RefreshCw className={`h-6 w-6 animate-spin mx-auto ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                              <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                                Agent B is analyzing claims &amp; executing counter-arguments...
                              </p>
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </>
                )}

                {/* Scorecard Panel */}
                {debateMode === 'debate' && scores && scores.length > 0 && (activeRoundTab === 'all' || activeRoundTab === 'verdict') && (
                  <div className={`rounded-2xl p-6 shadow-2xl space-y-6 backdrop-blur-xl border ${darkMode ? 'bg-slate-900/95 border-amber-500/30 text-slate-100' : 'bg-white/95 border-amber-200 text-slate-900 shadow-xl'}`}>
                    <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <Award className="h-5 w-5" />
                      <span>Official Double-Blind Judgment Scorecard</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {scores.map((score) => {
                        const isA = score.agent === 'Agent A';
                        const winner = getWinner(scores);
                        const isWinner = score.agent === winner;
                        return (
                          <div key={score.agent} className={`p-5 rounded-xl border relative space-y-4 ${
                            isA 
                              ? (darkMode ? 'border-indigo-500/30 bg-indigo-950/20' : 'border-indigo-200 bg-indigo-50/60') 
                              : (darkMode ? 'border-amber-500/30 bg-amber-950/20' : 'border-amber-200 bg-amber-50/60')
                          }`}>
                            {isWinner && winner !== 'Tie' && (
                              <div className="absolute top-4 right-4">
                                <Crown className={`h-5 w-5 ${isA ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'}`} />
                              </div>
                            )}

                            <div className="flex justify-between items-center">
                              <span className={`font-bold text-lg flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                <span>{score.agent}</span>
                                {isWinner && winner !== 'Tie' && (
                                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">WINNER</span>
                                )}
                              </span>
                              <span className={`text-2xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{score.total} <span className="text-xs text-slate-500">/ 10</span></span>
                            </div>

                            <div className="space-y-2.5 text-xs">
                              {[
                                { label: 'Logic Validity', key: 'logic' },
                                { label: 'Evidence Quality', key: 'evidence' },
                                { label: 'Rebuttal Strength', key: 'rebuttal' }
                              ].map(({ label, key }) => (
                                <div key={key}>
                                  <div className="flex justify-between mb-1 font-semibold text-slate-600 dark:text-slate-400">
                                    <span>{label}</span>
                                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{score[key]}/10</span>
                                  </div>
                                  <div className={`h-2 w-full rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                    <div 
                                      className={`h-full rounded-full ${isA ? 'bg-indigo-600' : 'bg-amber-600'}`}
                                      style={{ width: `${score[key] * 10}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className={`p-3 border rounded-lg text-xs leading-relaxed font-sans ${darkMode ? 'bg-slate-800/70 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                              <strong className={`block mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Judge Reasoning:</strong>
                              {score.judge_reasoning}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Right 1 Column: Live Fact-Checker Command Matrix */}
              <div className="lg:col-span-1 space-y-4">
                <div className={`rounded-2xl p-5 shadow-xl sticky top-20 space-y-4 backdrop-blur-xl border ${darkMode ? 'bg-slate-900/90 border-white/10 text-slate-100 shadow-2xl' : 'bg-white/92 border-blue-200 text-slate-900 shadow-lg'}`}>
                  
                  {/* Radar Header */}
                  <div className={`flex items-center justify-between pb-3 border-b ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2">
                      <Shield className={`h-4 w-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Fact-Checker Radar
                      </h4>
                    </div>
                    {selectedClaim && (
                      <button 
                        onClick={() => setSelectedClaim(null)} 
                        className={`text-[11px] font-bold hover:underline cursor-pointer ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                      >
                        &larr; View All
                      </button>
                    )}
                  </div>

                  {/* If A Specific Claim Is Inspected */}
                  {selectedClaim ? (
                    <div className="space-y-4 animate-scale-in">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          selectedClaim.verdict === 'Confirmed' 
                            ? (darkMode ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                            : selectedClaim.verdict === 'Disputed' 
                            ? (darkMode ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200')
                            : (darkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200')
                        }`}>
                          {selectedClaim.verdict === 'Confirmed' ? '✓ Confirmed' : selectedClaim.verdict === 'Disputed' ? '⚠️ Disputed' : '? Unverifiable'}
                        </span>

                        {selectedClaim.source_tier && (
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${darkMode ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' : 'text-indigo-700 bg-indigo-50 border-indigo-200'}`}>
                            Tier {selectedClaim.source_tier} Source
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Statement Tested:</span>
                        <p className={`text-xs font-medium p-3 border rounded-xl leading-relaxed ${darkMode ? 'text-white bg-white/5 border-white/10' : 'text-slate-900 bg-slate-50 border-slate-200'}`}>
                          "{selectedClaim.claim_text}"
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Audit Verification:</span>
                        <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {selectedClaim.reasoning}
                        </p>
                      </div>

                      {selectedClaim.source_url && (
                        <div className={`pt-2 border-t space-y-1.5 ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Verified Citation Link:</span>
                          <a 
                            href={selectedClaim.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`inline-flex items-center space-x-1.5 text-xs font-bold hover:underline break-all ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                          >
                            <span>{getDomainFromUrl(selectedClaim.source_url)}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Live List of All Claims */
                    <div className="space-y-3">
                      {/* Filter Pills */}
                      <div className="flex items-center space-x-1.5 pb-2">
                        {['all', 'Confirmed', 'Disputed'].map((f) => (
                          <button
                            key={f}
                            onClick={() => setClaimFilter(f)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              claimFilter === f
                                ? 'bg-indigo-600 text-white'
                                : (darkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200')
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      {/* Claims List */}
                      {turns.flatMap(t => t.claims || []).length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                          <Search className="h-6 w-6 mx-auto opacity-40 animate-pulse" />
                          <p>Claims will appear here as statements stream in...</p>
                        </div>
                      ) : (
                        <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                          {turns
                            .flatMap(t => t.claims || [])
                            .filter(c => claimFilter === 'all' || c.verdict === claimFilter)
                            .map((c, i) => (
                              <div
                                key={`claim-card-${i}`}
                                onClick={() => setSelectedClaim(c)}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                                  darkMode 
                                    ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-200' 
                                    : 'border-slate-200 bg-white hover:bg-indigo-50/60 text-slate-800 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                                    c.verdict === 'Confirmed' 
                                      ? (darkMode ? 'text-emerald-400 bg-emerald-500/15' : 'text-emerald-700 bg-emerald-100') 
                                      : (darkMode ? 'text-amber-400 bg-amber-500/15' : 'text-amber-700 bg-amber-100')
                                  }`}>
                                    {c.verdict === 'Confirmed' ? '✓ Confirmed' : '⚠️ Disputed'}
                                  </span>
                                  {c.source_tier && <span className="text-slate-500 font-mono">Tier {c.source_tier}</span>}
                                </div>
                                <p className={`text-xs line-clamp-2 font-sans font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                  "{c.claim_text}"
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
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

      {/* ── ACETERNITY-STYLE MULTI-COLUMN MEGA FOOTER (Only shown on Landing View) ── */}
      {activeView === 'landing' && (
        <footer id="site-footer" className="relative z-10 border-t border-brand-border/30 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl pt-14 pb-8 px-6 sm:px-12 mt-16 font-sans">
        <div className="max-w-7xl mx-auto">
          
          {/* Top Brand Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-brand-border/20 dark:border-white/10">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center space-x-2.5">
                <img src={logo} className="h-7 w-7 object-contain" alt="ArguForge AI Logo" />
                <h3 className="text-xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">ArguForge AI</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Source-integrity-first adversarial debate &amp; factual analysis platform. Temperature-tuned dual AI agents clashing with multi-tier source verification and bias-free scoring.
              </p>
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                Engineered by <span className="font-bold underline decoration-indigo-400/50">Ketan Karan Arora</span> &bull; <a href="https://github.com/Ketan2707" target="_blank" rel="noopener noreferrer" className="hover:underline">Building in public @Ketan2707</a>
              </p>
            </div>

            {/* Floating Dock on Top Right of Mega Footer */}
            <div className="flex items-center self-start md:self-center">
              <FloatingDock
                items={[
                  {
                    title: "GitHub / Ketan2707",
                    icon: <GithubIcon className="h-full w-full" />,
                    href: "https://github.com/Ketan2707",
                  },
                  {
                    title: "LinkedIn / Ketan Karan Arora",
                    icon: <LinkedinIcon className="h-full w-full" />,
                    href: "https://www.linkedin.com/in/ketan-karan-arora-5a729b28b/",
                  },
                  {
                    title: "Instagram / @ketannarora",
                    icon: <InstagramIcon className="h-full w-full" />,
                    href: "https://www.instagram.com/ketannarora/",
                  },
                  {
                    title: "Email Developer",
                    icon: <Mail className="h-full w-full" />,
                    href: "mailto:ketanarora7890@gmail.com",
                  },
                ]}
              />
            </div>
          </div>

          {/* 5-Column Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 py-10 text-xs">
            
            {/* Col 1: Debate Arena */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">Debate Arena</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Adversarial AI Engine</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Temperature Tuning</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Cross-Examination</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Live SSE Streaming</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Real-Time Rebuttals</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Stance Focus Selector</li>
              </ul>
            </div>

            {/* Col 2: Fact-Check Tiers */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">Fact-Check Tiers</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-default">Tier 1: AP &amp; Reuters Wire</li>
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-default">Tier 1: PIB Public Records</li>
                <li className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default">Tier 2: BBC, NYT &amp; Guardian</li>
                <li className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-default">Tier 3: CFR &amp; Brookings</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Domain Whitelist Index</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Zero-Hallucination Rule</li>
              </ul>
            </div>

            {/* Col 3: Bias-Free Judge */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">Bias-Free Judge</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Double-Blind Scoring</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Position Label Swapping</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Logic &amp; Fallacy Audit</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Evidence Weight Analysis</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Rebuttal Strength Index</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Verdict Synthesis Reports</li>
              </ul>
            </div>

            {/* Col 4: Platform & Tech */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">Platform</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <button onClick={() => { loadHistory(); setActiveView('history'); }} className="hover:text-indigo-600 dark:hover:text-white transition-colors text-left cursor-pointer">
                    Debate Archive
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('login')} className="hover:text-indigo-600 dark:hover:text-white transition-colors text-left cursor-pointer">
                    OAuth Sign In
                  </button>
                </li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Day &amp; Night Sky Themes</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Claim Drawer Inspector</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">FastAPI Backend Engine</li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Groq &amp; Llama 3.3 LLMs</li>
              </ul>
            </div>

            {/* Col 5: Creator & Connect */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">Developer</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <a href="https://github.com/Ketan2707" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center space-x-1.5">
                    <span>GitHub / Ketan2707</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/ketan-karan-arora-5a729b28b/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center space-x-1.5">
                    <span>LinkedIn / Ketan Karan Arora</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/ketannarora/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center space-x-1.5">
                    <span>Instagram / @ketannarora</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:ketanarora7890@gmail.com" className="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center space-x-1.5">
                    <span>Email Developer</span>
                  </a>
                </li>
                <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Full-Stack AI Engineering</li>
                <li>
                  <a href="https://github.com/Ketan2707/Debate-Arena" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                    ★ Star on GitHub
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-brand-border/20 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} ArguForge AI. All rights reserved. &bull; Engineered by <span className="font-semibold text-slate-700 dark:text-slate-300">Ketan Karan Arora</span>
            </p>
            
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Verification Systems Operational</span>
            </div>
          </div>

        </div>
      </footer>
      )}

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
