import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Shield, RefreshCw, Award, BookOpen, AlertTriangle, 
  CheckCircle, HelpCircle, ChevronRight, History, ArrowLeft, 
  ExternalLink, Sparkles, MessageSquare, Info, Star,
  Search, LogIn, LogOut, UserPlus, Lock, Mail, Eye, EyeOff,
  Zap, Crown, TrendingUp, Target, Globe, Sun, Moon, Volume2, VolumeX, Radio, Mic, MicOff,
  PanelLeft, Plus, Paperclip, ChevronDown, Check, Trash2, Settings, Download, Cpu, Send, Layers, Terminal, Sliders, Share2, Home,
  PlusCircle, LayoutList, Copy, Maximize2, ArrowDown, Code2, Image as ImageIcon, Video, Square, X,
  Scale, Swords, ShieldCheck, ThumbsUp, ThumbsDown
} from 'lucide-react';
import CloudShader from './CloudShader';
import NightSky from './NightSky';
import FloatingDock from './FloatingDock';
import BattleTransition from './BattleTransition';
import DebateSpeechPlayer, { useDebateAudio } from './DebateSpeechPlayer';
import logo from './assets/logo.png';
import { ParticleCard } from './MagicBento';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const STANCE_OPTIONS = [
  {
    id: 'both',
    name: 'Both Sides',
    subtitle: 'Dual-Agent Adversarial Clash',
    desc: 'Assistant A defends, Assistant B counters across 5 structured debate rounds.',
    icon: <Scale className="h-4 w-4" />
  },
  {
    id: 'for',
    name: 'Affirmative (Pro)',
    subtitle: 'Supporting Thesis & Evidence',
    desc: 'Formulates an evidence-backed pro-motion case brief with multi-tier source links.',
    icon: <ThumbsUp className="h-4 w-4" />
  },
  {
    id: 'against',
    name: 'Negative (Con)',
    subtitle: 'Opposition & Counter-Audit',
    desc: 'Formulates an adversarial critique exposing logical fallacies, risks & counter-evidence.',
    icon: <ThumbsDown className="h-4 w-4" />
  }
];

export const MODE_OPTIONS = [
  {
    id: 'debate',
    name: 'Debate Arena',
    subtitle: '5-Round Multi-Agent Arena',
    desc: 'Temperature-tuned Assistant A and B clash live with cross-examination and scorecard.',
    icon: <Swords className="h-4 w-4" />
  },
  {
    id: 'factcheck',
    name: 'Fact-Check Audit',
    subtitle: 'Whitelisted Ground-Truth Audit',
    desc: 'Fact-checks claims against Tier 1/2/3 official record databases and registries.',
    icon: <ShieldCheck className="h-4 w-4" />
  }
];

// ─── Dark mode helper ───
function getInitialDarkMode() {
  try {
    const saved = localStorage.getItem('arguforge-dark-mode');
    if (saved !== null) return saved === 'true';
  } catch (_) {}
  return false;
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

const BattleArenaLoader = ({ mode, topic, darkMode }) => {
  const [dots, setDots] = useState('.');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '.' : prev + '.'));
    }, 500);

    const stepsInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 5);
    }, 2800);

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
        "Orchestrating Assistant A (Affirmative) and Assistant B (Negative)...",
        "Tuning Assistant A parameters (Temp: 0.6)...",
        "Tuning Assistant B parameters (Temp: 0.8)...",
        "Synthesizing argument boundaries & ground truth...",
        "Opening Round 1 statements..."
      ];

  return (
    <div className={`w-full rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-6 shadow-2xl relative overflow-hidden min-h-[360px] border backdrop-blur-2xl ${
      darkMode ? 'bg-[#080d19]/85 border-white/15 text-white' : 'bg-white/85 border-blue-200 text-slate-900'
    }`}>
      <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl border ${
        darkMode ? 'bg-white/5 border-white/10 text-cyan-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
      }`}>
        <RefreshCw className="h-7 w-7 animate-spin" />
      </div>

      <div className="space-y-1.5 z-10 max-w-lg mx-auto">
        <h4 className="text-base font-bold font-sans tracking-wide">
          {mode === 'factcheck' ? 'Auditing Factual Sources' : 'Evaluating Agentic Arena'}
        </h4>
        <p className={`text-xs font-sans italic ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          "{topic}"
        </p>
      </div>

      <div className={`px-5 py-2 rounded-xl text-xs font-mono font-medium z-10 flex items-center justify-center space-x-2 border ${
        darkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <span className={`h-2 w-2 rounded-full animate-pulse ${darkMode ? 'bg-cyan-400' : 'bg-indigo-600'}`}></span>
        <span>{steps[currentStep]}{dots}</span>
      </div>
    </div>
  );
};

function App() {
  const [activeView, setActiveView] = useState('landing'); // 'landing', 'studio', 'debate', 'history', 'login', 'register'
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
  const [claimFilter, setClaimFilter] = useState('all');
  
  // Transition state
  const [isCloudWiping, setIsCloudWiping] = useState(false);
  const [cloudWipeStatus, setCloudWipeStatus] = useState('Summoning AI Debaters...');
  
  // History state
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Auth state
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('debate_arena_token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState('');

  const [authLoading, setAuthLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Stance & Mode Dropdown states
  const [showStanceDropdown, setShowStanceDropdown] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const stanceDropdownRef = useRef(null);
  const modeDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (stanceDropdownRef.current && !stanceDropdownRef.current.contains(e.target)) {
        setShowStanceDropdown(false);
      }
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target)) {
        setShowModeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🎙️ Live Dual-Voice AI Speech Narration Hook
  const debateAudio = useDebateAudio();

  // Sidebar and UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [showPromoCard, setShowPromoCard] = useState(true);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const recognitionRef = useRef(null);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem('arguforge-dark-mode', String(next)); } catch(_) {}
      return next;
    });
  };

  // Sync HTML and Body classes with darkMode state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Voice speech-to-text toggle
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    if (isRecordingVoice) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecordingVoice(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsRecordingVoice(true);
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
          setTopicInput(transcript);
        };
        recognition.onerror = () => setIsRecordingVoice(false);
        recognition.onend = () => setIsRecordingVoice(false);
        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        setIsRecordingVoice(false);
      }
    }
  };

  // SSE event source ref
  const eventSourceRef = useRef(null);
  const streamCompletedRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const turnsEndRef = useRef(null);

  // Auto-scroll when new turns arrive
  useEffect(() => {
    if (turnsEndRef.current) {
      turnsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [turns, status]);

  // Load history list & verify token once on mount
  useEffect(() => {
    loadHistory();
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
      loadHistory();
      
      if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        setActiveView('studio');
        setTimeout(() => {
          handleStartDebate(null, action);
        }, 100);
      } else {
        setActiveView('studio');
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
      loadHistory();
      
      if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        setActiveView('studio');
        setTimeout(() => {
          handleStartDebate(null, action);
        }, 100);
      } else {
        setActiveView('studio');
      }
    } catch (err) {
      setRegisterError('Network error. Make sure backend is running.');
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
    
    const topic = topicInput.trim() || "ai in ecom";
    setError(null);
    setTurns([]);
    setScores([]);
    setStances({ stance_a: '', stance_b: '' });
    setSelectedClaim(null);
    setActiveRoundTab('1');
    setClaimFilter('all');
    setDebateTopic(topic);
    setDebateMode(mode);

    setIsCloudWiping(true);
    setCloudWipeStatus(mode === 'factcheck' ? 'Auditing Factual Sources...' : 'Synthesizing Assistant Stances...');
    const startTime = Date.now();
    
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
      connectToStream(data.debate_id, startTime);
    } catch (err) {
      setError(err.message || "Something went wrong. Make sure backend is running.");
      setStatus({ status: 'idle' });
      setIsCloudWiping(false);
    }
  };

  const connectToStream = (debateId, startTime = null) => {
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
        setCloudWipeStatus('Assistant Matrix Synchronized!');
        const elapsed = startTime ? Date.now() - startTime : 480;
        const remaining = Math.max(0, 480 - elapsed);
        setTimeout(() => {
          setIsCloudWiping(false);
        }, remaining);
      } catch (err) {
        console.error("Error parsing stances:", err);
        setIsCloudWiping(false);
      }
    });
    
    source.addEventListener('status', (e) => {
      try {
        const data = JSON.parse(e.data);
        setStatus(data);
        if (data.round_number && data.round_number >= 1 && data.round_number <= 5) {
          setActiveRoundTab(String(data.round_number));
        }
      } catch (err) {
        console.error("Error parsing status:", err);
      }
    });
    
    source.addEventListener('turn', (e) => {
      try {
        const data = JSON.parse(e.data);
        setIsCloudWiping(false);
        setTurns((prev) => {
          if (prev.some((t) => t.id === data.id)) return prev;
          if (debateAudio.autoNarrate && data.content) {
            debateAudio.speakText(data.content, data.agent);
          }
          return [...prev, data];
        });
        if (data.round_number && data.round_number >= 1 && data.round_number <= 5) {
          setActiveRoundTab(String(data.round_number));
        }
      } catch (err) {
        console.error("Error parsing turn:", err);
        setIsCloudWiping(false);
      }
    });
    
    source.addEventListener('verdict', (e) => {
      try {
        const data = JSON.parse(e.data);
        setScores(data.scores || []);
        setActiveRoundTab('verdict');
        if (debateAudio.autoNarrate && data.scores && data.scores.length > 0) {
          const winner = getWinner(data.scores);
          const verdictSpeech = winner === 'Tie' 
            ? "The double-blind judgment has concluded in a tie." 
            : `The official verdict is in. The winner is ${winner}.`;
          debateAudio.speakText(verdictSpeech, 'Judge');
        }
      } catch (err) {
        console.error("Error parsing verdict:", err);
      }
      setStatus({ status: 'idle' });
      streamCompletedRef.current = true;
      reconnectAttemptsRef.current = 0;
      source.close();
      setIsCloudWiping(false);
      loadHistory();
    });
    
    source.addEventListener('error', (e) => {
      if (streamCompletedRef.current) return;
      setIsCloudWiping(false);
      try {
        const data = JSON.parse(e.data);
        if (data && data.error) {
          setError(data.error);
          setStatus({ status: 'idle' });
          streamCompletedRef.current = true;
          source.close();
        }
      } catch (err) {}
    });
    
    source.onerror = async (err) => {
      if (streamCompletedRef.current) {
        source.close();
        return;
      }
      
      console.warn("SSE connection interrupted. Verifying debate status...", err);
      source.close();

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
            loadHistory();
            return;
          } else if (detail.status === 'failed') {
            setError(detail.error || "Analysis was interrupted. Click Retry to run again.");
            setStatus({ status: 'idle' });
            streamCompletedRef.current = true;
            return;
          }
        }
      } catch (checkErr) {}

      if (reconnectAttemptsRef.current < 3) {
        reconnectAttemptsRef.current += 1;
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

  const handleViewPastDebate = async (debateId) => {
    setError(null);
    setTurns([]);
    setScores([]);
    setSelectedClaim(null);
    setStatus({ status: 'loading', agent: 'Orchestrator' });
    setActiveView('debate');
    setActiveDebateId(debateId);
    
    try {
      const res = await fetch(`${API_BASE}/api/debates/${debateId}`);
      if (!res.ok) throw new Error("Failed to load debate details");
      const data = await res.json();
      
      setDebateTopic(data.topic);
      setDebateMode(data.mode || 'debate');
      setTurns(data.turns || []);
      setScores(data.scores || []);
      setActiveRoundTab('1');
      
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

  const cleanThinkingAndFootnotes = (rawText) => {
    if (!rawText) return "";
    let cleaned = rawText;
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    cleaned = cleaned.replace(/<think>[\s\S]*$/gi, '');
    cleaned = cleaned.replace(/^(?:Thinking Process|Thought Process|Reasoning):[\s\S]*?\n\n/gi, '');
    cleaned = cleaned.replace(/\*+(?:Word Count|Constraint|Cutting|Deconstruct)[^*]*\*+[\s\S]*?(?=\n\n|$)/gi, '');
    cleaned = cleaned.replace(/^(?:Reference\(s\)|References|Bibliography|Sources|Works Cited):\s*\n(?:[-*•\d.]+[^\n]*\n*)*/gi, '');
    cleaned = cleaned.replace(/\n+(?:Reference\(s\)|References|Bibliography|Sources|Works Cited):\s*\n(?:[-*•\d.]+[^\n]*\n*)*$/gi, '');
    cleaned = cleaned.replace(/^(?:Reference\(s\)|References|Bibliography|Sources|Works Cited):[ \t]*\n*/gi, '');
    cleaned = cleaned.replace(/^(?:[-*•]\s+[A-Za-z\s,.\(\)\d]+(?:Retrieved from\s*)?<https?:\/\/[^\s>]+>\s*\n*)+/gi, '');
    cleaned = cleaned.replace(/<\s*\[\s*\d+\s*\]\s*>/g, '');
    cleaned = cleaned.replace(/[【\u3010][^】\u3011]*[】\u3011]/g, '');
    cleaned = cleaned.replace(/\s*\[\d+\](?!\()/g, '');
    return cleaned.trim();
  };

  const getDomainFromUrl = (url) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return url.length > 22 ? url.substring(0, 22) + '...' : url;
    }
  };

  const parseMarkdownLinks = (text) => {
    if (!text) return "";
    const sanitized = cleanThinkingAndFootnotes(text);
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
          className={`inline-flex items-center space-x-1 px-1.5 py-0.5 mx-1 rounded text-[11px] font-medium border transition-colors ${
            darkMode 
              ? 'bg-white/10 text-cyan-300 hover:bg-white/20 border-white/15' 
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
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

  const renderContentWithClaims = (content, claims) => {
    if (!content) return null;
    const cleanedContent = cleanThinkingAndFootnotes(content);
    if (!cleanedContent) return null;

    const lines = cleanedContent.split('\n');
    return (
      <div className={`space-y-3 text-[14px] leading-relaxed font-sans ${
        darkMode ? 'text-slate-200' : 'text-slate-800'
      }`}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;
          
          if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className={`text-xl sm:text-2xl font-bold font-sans mt-3 mb-1.5 tracking-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {trimmed.replace(/^#+\s*/, '')}
              </h3>
            );
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className={`text-base font-semibold font-sans mt-2.5 mb-1 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {trimmed.replace(/^###\s*/, '')}
              </h4>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-1">
                <span className={`mt-1.5 text-xs ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>•</span>
                <div className="flex-1">{parseMarkdownLinks(trimmed.replace(/^[-*]\s*/, ''))}</div>
              </div>
            );
          }
          return <p key={idx}>{parseMarkdownLinks(trimmed)}</p>;
        })}
      </div>
    );
  };

  const getWinner = (debateScores) => {
    if (!debateScores || debateScores.length === 0) return null;
    const scoreA = debateScores.find(s => s.agent === 'Agent A')?.total || 0;
    const scoreB = debateScores.find(s => s.agent === 'Agent B')?.total || 0;
    if (scoreA > scoreB) return 'Agent A';
    if (scoreB > scoreA) return 'Agent B';
    return 'Tie';
  };

  const filteredHistory = useMemo(() => {
    if (!sidebarSearch.trim()) return historyList;
    const q = sidebarSearch.toLowerCase();
    return historyList.filter(d => (d.topic || '').toLowerCase().includes(q));
  }, [historyList, sidebarSearch]);

  const quickStarterCards = [
    {
      id: 'ai-ecom',
      icon: <TrendingUp className="h-4 w-4" />,
      title: 'AI in E-Commerce & Retail',
      desc: 'Workforce displacement vs augmentation',
      topic: 'Will generative AI and autonomous agents net benefit or displace human retail workforces?'
    },
    {
      id: 'nuclear-energy',
      icon: <Zap className="h-4 w-4" />,
      title: 'Nuclear Power & Clean Grid',
      desc: 'Base load energy security vs renewables',
      topic: 'Is nuclear power indispensable for achieving a zero-carbon global energy grid?'
    },
    {
      id: 'ev-mandate',
      icon: <Shield className="h-4 w-4" />,
      title: 'EV Mandate by 2035',
      desc: 'Grid infrastructure & lithium supply chain',
      topic: 'Should electric vehicles be mandatory for all new consumer car sales by 2035?'
    },
    {
      id: 'ubi',
      icon: <Award className="h-4 w-4" />,
      title: 'Universal Basic Income (UBI)',
      desc: 'Automation safety net vs fiscal inflation',
      topic: 'Is Universal Basic Income (UBI) an economically viable necessity in an automated economy?'
    },
    {
      id: 'social-media',
      icon: <Globe className="h-4 w-4" />,
      title: 'Social Media Algorithms',
      desc: 'Free expression vs public safety audit',
      topic: 'Do algorithmic recommendation feeds cause more societal harm than benefit?'
    },
    {
      id: 'space-colonization',
      icon: <Sparkles className="h-4 w-4" />,
      title: 'Deep Space Colonization',
      desc: 'Multi-planetary future vs Earth resilience',
      topic: 'Should governments prioritize funding deep space colonization over domestic Earth climate resilience?'
    }
  ];

  return (
    <div className={`w-screen ${
      activeView === 'landing' ? 'min-h-screen' : 'h-screen overflow-hidden'
    } flex flex-col ${
      darkMode ? 'bg-[#060813] text-slate-100 dark-mode' : 'bg-gradient-to-b from-[#3876ba] via-[#5a96d8] to-[#8cbfe8] text-slate-900'
    } antialiased relative font-sans select-none overflow-x-hidden`}>
      
      {/* Background Shaders (Always active across all views) */}
      {!darkMode ? (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <CloudShader
            speed={0.7}
            count={6}
            cloudColor="#fbf8f2"
            skyTopColor="#3876ba"
            skyBottomColor="#8cbfe8"
            paused={activeView === 'debate'}
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <NightSky
            starCount={180}
            speed={0.6}
            enableShootingStars={true}
            paused={activeView === 'debate'}
          />
        </div>
      )}
      <div className="dot-grid"></div>

      {/* Versus Battle Transition Overlay */}
      <BattleTransition
        isActive={isCloudWiping}
        topic={debateTopic}
        mode={debateMode}
        statusMessage={cloudWipeStatus}
        darkMode={darkMode}
      />

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 1: HOMEPAGE (LANDING VIEW - 100% PRESERVED THEME & DESIGN)
          ═══════════════════════════════════════════════════════════════ */}
      {activeView === 'landing' && (
        <div className="flex-1 flex flex-col justify-between relative z-10 w-full">
          {/* Top Floating Glass Header */}
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 relative z-40">
            <header className="glass rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between border border-white/10 shadow-xl">
              <div 
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group"
                onClick={() => setActiveView('landing')}
              >
                <div className="text-white font-extrabold flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src={logo} className="h-7 w-7 sm:h-9 sm:w-9 object-contain" alt="Logo" />
                </div>
                <div>
                  <h1 className="text-xs sm:text-lg font-bold tracking-tight font-sans text-brand-textLight">ArguForge AI</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button 
                  onClick={() => setActiveView('studio')}
                  className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-cyan-400 hover:underline transition-colors font-sans py-1 flex items-center space-x-1 cursor-pointer"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>AI Arena</span>
                </button>
                <button 
                  onClick={() => {
                    loadHistory();
                    setActiveView('history');
                  }}
                  className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-white transition-colors font-sans py-1 cursor-pointer"
                >
                  Archive
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('site-footer')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-white transition-colors font-sans cursor-pointer py-1"
                >
                  About
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="theme-toggle"
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </button>

                {/* Auth Button */}
                {currentUser ? (
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex items-center space-x-1.5 sm:space-x-2 glass px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/10">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center">
                        <span className="text-[9px] sm:text-[10px] font-bold text-brand-accent">{currentUser.email?.[0]?.toUpperCase()}</span>
                      </div>
                      <span className="text-xs text-brand-textMuted font-sans hidden md:inline">{currentUser.email}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-[11px] sm:text-xs text-slate-400 hover:text-white transition-colors font-sans py-1 cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setActiveView('login')}
                    className="bg-white hover:bg-slate-200 text-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-md font-sans cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </header>
          </div>

          {/* Main Hero Section with "Start Debate" in place of old textbox */}
          <main className="flex-1 max-w-4xl mx-auto w-full py-12 sm:py-20 px-4 flex flex-col items-center justify-center text-center animate-slide-up">
            {/* Pill Badge */}
            <div className={`inline-flex items-center justify-center backdrop-blur-md px-4 py-1.5 rounded-full mb-5 text-xs font-sans tracking-wide animate-scale-in ${
              darkMode ? 'border border-white/10 bg-white/5 text-slate-300' : 'border border-blue-200 bg-white/60 text-slate-700'
            }`}>
              <span className={`px-2.5 py-0.5 rounded-full font-bold mr-2 text-[9px] ${darkMode ? 'bg-cyan-400 text-black' : 'bg-indigo-600 text-white'}`}>NEW</span>
              <span>Agentic Arena Architecture</span>
            </div>

            {/* Hero Heading */}
            <h2 className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-sans mb-3 sm:mb-4 leading-tight max-w-3xl mx-auto px-1 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Beneath the Noise, the Truth Awaits.
            </h2>

            <p className={`text-sm sm:text-base md:text-lg mb-8 sm:mb-10 max-w-xl font-sans font-light leading-relaxed px-2 ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Submit any topic. Settle claims with verified sources. Temperature-tuned dual AI agents clashing with multi-tier source verification and bias-free scoring.
            </p>

            {/* Start a Debate CTA Buttons (Replaces previous textbox) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
              <ParticleCard
                enableStars={true}
                enableTilt={true}
                enableMagnetism={true}
                clickEffect={true}
                glowColor="6, 182, 212"
                className="magic-bento-card w-full rounded-2xl"
              >
                <button
                  onClick={() => setActiveView('studio')}
                  className={`w-full py-4 px-8 rounded-2xl font-bold font-sans text-base sm:text-lg flex items-center justify-center space-x-3 transition-all duration-300 shadow-2xl cursor-pointer ${
                    darkMode
                      ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white glow-cyan-strong'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                  }`}
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>Start Debate</span>
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              </ParticleCard>
            </div>

            {/* Quick prefill examples */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2 max-w-2xl px-2">
              <span className="text-xs text-slate-500 mr-1 flex items-center font-sans">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-cyan-400" />Explore:
              </span>
              {["ai in ecom", "Should electric vehicles be mandatory by 2035?", "Is AI a net benefit to public education?"].map((ex) => (
                <button 
                  key={ex}
                  onClick={() => {
                    setTopicInput(ex);
                    setActiveView('studio');
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded-full transition-all duration-300 font-sans cursor-pointer ${
                    darkMode 
                      ? 'bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40' 
                      : 'bg-white/60 border border-blue-200 text-slate-700 hover:text-indigo-700 hover:border-indigo-300'
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>
          </main>

          {/* Aceternity-style Mega Footer (Preserved on Homepage) */}
          <footer id="site-footer" className="relative z-10 border-t border-brand-border/30 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl pt-10 sm:pt-14 pb-8 px-4 sm:px-12 mt-12 sm:mt-16 font-sans">
            <div className="max-w-7xl mx-auto">
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 pb-6 sm:pb-10 border-b border-brand-border/20 dark:border-white/10">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center space-x-2.5">
                    <img src={logo} className="h-7 w-7 object-contain" alt="ArguForge AI Logo" />
                    <h3 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">ArguForge AI</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Source-integrity-first adversarial debate &amp; factual analysis platform. Temperature-tuned dual AI agents clashing with multi-tier source verification and bias-free scoring.
                  </p>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    Engineered by <span className="font-bold underline decoration-indigo-400/50">Ketan Karan Arora</span> &bull; <a href="https://github.com/Ketan2707" target="_blank" rel="noopener noreferrer" className="hover:underline">Building in public @Ketan2707</a>
                  </p>
                </div>

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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 py-8 sm:py-10 text-xs">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">Debate Arena</h4>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Adversarial AI Engine</li>
                    <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Temperature Tuning</li>
                    <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Cross-Examination</li>
                    <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Live SSE Streaming</li>
                    <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Real-Time Rebuttals</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">Fact-Check Tiers</h4>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-default">Tier 1: AP &amp; Reuters Wire</li>
                    <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-default">Tier 1: PIB Public Records</li>
                    <li className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default">Tier 2: BBC, NYT &amp; Guardian</li>
                    <li className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-default">Tier 3: CFR &amp; Brookings</li>
                    <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Domain Whitelist Index</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">Bias-Free Judge</h4>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Double-Blind Scoring</li>
                    <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Position Label Swapping</li>
                    <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Logic &amp; Fallacy Audit</li>
                    <li className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-default">Evidence Weight Analysis</li>
                  </ul>
                </div>

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
                  </ul>
                </div>

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
                      <a href="mailto:ketanarora7890@gmail.com" className="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center space-x-1.5">
                        <span>Email Developer</span>
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
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 2: AI AREA (STUDIO & ARENA WITH HOMEPAGE GLASS THEME)
          ═══════════════════════════════════════════════════════════════ */}
      {(activeView === 'studio' || activeView === 'debate') && (
        <div className="flex-1 h-full w-full flex flex-row overflow-hidden relative z-20">
          
          {/* Mobile Backdrop Overlay when sidebar is open */}
          {sidebarOpen && (
            <div 
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-25 sm:hidden"
            />
          )}

          {/* Left Minimalist Glass Sidebar */}
          <aside className={`h-full flex-shrink-0 z-30 transition-all duration-200 flex flex-col justify-between ${
            sidebarOpen ? 'w-64 sm:w-68' : 'w-0 -translate-x-full overflow-hidden'
          } ${
            darkMode 
              ? 'bg-[#080d1a]/85 border-r border-white/10 text-slate-200 backdrop-blur-2xl' 
              : 'bg-white/70 border-r border-blue-200/70 text-slate-800 backdrop-blur-2xl'
          }`}>
            
            {/* Top Sidebar Action Items */}
            <div className="p-3 space-y-1 flex-shrink-0">
              <div className="flex items-center justify-between px-1 pb-2 sm:hidden">
                <div className="flex items-center space-x-2">
                  <img src={logo} className="h-6 w-6 object-contain" alt="Logo" />
                  <span className="font-bold text-xs">ArguForge AI</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  if (eventSourceRef.current) eventSourceRef.current.close();
                  setStatus({ status: 'idle' });
                  setActiveDebateId(null);
                  setTurns([]);
                  setScores([]);
                  setTopicInput('');
                  setActiveView('studio');
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer font-medium border ${
                  darkMode 
                    ? 'border-white/10 hover:bg-white/10 text-slate-200' 
                    : 'border-blue-200/80 bg-white/60 hover:bg-white/90 text-slate-800 shadow-xs'
                }`}
              >
                <PlusCircle className={`h-4 w-4 ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`} />
                <span>New Chat</span>
              </button>

              <button
                onClick={() => {
                  loadHistory();
                  setActiveView('history');
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer font-medium ${
                  darkMode ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-white/60 text-slate-700'
                }`}
              >
                <LayoutList className="h-4 w-4 opacity-70" />
                <span>Leaderboard</span>
              </button>

              <div className="relative pt-1">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Search"
                  className={`w-full text-xs rounded-xl pl-8 pr-3 py-1.5 outline-none transition-all border ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-slate-200 placeholder-slate-500 focus:bg-white/10' 
                      : 'bg-white/70 border-blue-200/70 text-slate-800 placeholder-slate-400 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            {/* History Sessions List (Takes up all middle space) */}
            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2 thin-scrollbar">
              <div className={`text-[11px] font-semibold uppercase tracking-wider px-2 pt-2 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Today
              </div>

              {/* Current Active Session */}
              {activeDebateId && (
                <div 
                  onClick={() => setActiveView('debate')}
                  className={`flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                    darkMode 
                      ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300' 
                      : 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="truncate flex-1 font-sans">{debateTopic || "ai in ecom"}</span>
                </div>
              )}

              {/* History list */}
              <div className="space-y-1">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleViewPastDebate(item.id)}
                    className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all ${
                      darkMode 
                        ? 'text-slate-300 hover:text-white hover:bg-white/5' 
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <span className="text-slate-400 text-sm">⤭</span>
                    <span className="truncate flex-1">{item.topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Section: Promo Card & Log In (Pinned to bottom of viewport) */}
            <div className={`mt-auto flex-shrink-0 p-3 border-t space-y-3 ${
              darkMode ? 'border-white/10' : 'border-blue-200/70'
            }`}>
              {showPromoCard && (
                <div className={`rounded-2xl p-3.5 space-y-2.5 text-xs border backdrop-blur-xl ${
                  darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-blue-200/80 shadow-sm'
                }`}>
                  <div className={`h-14 rounded-xl flex items-center justify-center overflow-hidden border ${
                    darkMode ? 'bg-black/40 border-white/10' : 'bg-indigo-50 border-indigo-100'
                  }`}>
                    <img src={logo} className="h-9 w-9 object-contain" alt="Promo" />
                  </div>
                  <div>
                    <h5 className={`font-bold text-xs font-sans ${darkMode ? 'text-white' : 'text-slate-900'}`}>Get More Done With Agents</h5>
                    <p className={`text-[11px] mt-0.5 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Start evaluating agentic AI on Arena today. <a href="https://github.com/Ketan2707" target="_blank" rel="noopener noreferrer" className="text-cyan-400 dark:text-cyan-300 underline font-medium">Learn more</a>
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => setActiveView('studio')}
                      className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm ${
                        darkMode ? 'bg-white text-black hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      Try it now
                    </button>
                    <button
                      onClick={() => setShowPromoCard(false)}
                      className={`w-full py-1 text-[11px] transition-colors cursor-pointer text-center block ${
                        darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ⤭ Hide this
                    </button>
                  </div>
                </div>
              )}

              {/* Log In Button */}
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-2 border ${
                    darkMode ? 'bg-white/10 hover:bg-white/15 border-white/10 text-white' : 'bg-white/80 hover:bg-white border-blue-200 text-slate-800'
                  }`}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="truncate">{currentUser.email}</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveView('login')}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                    darkMode ? 'bg-white hover:bg-slate-200 text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  Log In
                </button>
              )}

              {/* Footer text */}
              <div className={`flex items-center justify-between text-[10px] px-1 pt-1 font-sans ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <a href="#footer" onClick={(e) => { e.preventDefault(); setActiveView('landing'); }} className="hover:underline">Home</a>
                <span className="hover:underline cursor-pointer">Terms of Use</span>
                <span className="hover:underline cursor-pointer">Privacy Policy</span>
                <span className="hover:underline cursor-pointer">Cookies</span>
              </div>
            </div>
          </aside>

          {/* Main Workspace Viewport */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            
            {/* Minimalist Glass Top Control Bar */}
            <header className={`px-4 py-2.5 flex items-center justify-between flex-shrink-0 z-20 border-b backdrop-blur-xl ${
              darkMode ? 'bg-black/30 border-white/10' : 'bg-white/50 border-blue-200/70'
            }`}>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-white/80 border-blue-200 text-slate-700'
                  }`}
                  title="Toggle sidebar"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>

                <div 
                  onClick={() => setActiveView('landing')} 
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <img src={logo} className="h-6 w-6 object-contain group-hover:scale-105 transition-transform" alt="Logo" />
                  <span className={`text-xs font-bold font-sans hidden md:inline ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>ArguForge AI</span>
                </div>
              </div>

              {/* Right utility buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveView('landing')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer font-sans ${
                    darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-white/80 border-blue-200 text-slate-700 hover:text-slate-900'
                  }`}
                  title="Return to ArguForge Homepage"
                >
                  Homepage
                </button>

                <button
                  onClick={() => debateAudio.toggleAutoNarrate()}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    debateAudio.autoNarrate 
                      ? (darkMode ? 'text-cyan-300 bg-cyan-500/20 border-cyan-400' : 'text-indigo-700 bg-indigo-100 border-indigo-300')
                      : (darkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white/80 border-blue-200 text-slate-600')
                  }`}
                  title="Dual-Voice Audio Narration"
                >
                  {debateAudio.autoNarrate ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>

                <button
                  onClick={toggleVoiceInput}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    isRecordingVoice 
                      ? 'text-rose-400 bg-rose-500/20 border-rose-400 animate-pulse' 
                      : (darkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white/80 border-blue-200 text-slate-600')
                  }`}
                  title="Voice Input"
                >
                  <Mic className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    if (eventSourceRef.current) eventSourceRef.current.close();
                    setStatus({ status: 'idle' });
                    setTurns([]);
                    setScores([]);
                    setTopicInput('');
                    setActiveView('studio');
                  }}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    darkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-rose-400' : 'bg-white/80 border-blue-200 text-slate-600 hover:text-rose-600'
                  }`}
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  onClick={toggleDarkMode}
                  className="theme-toggle ml-1"
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </button>

                {!currentUser && (
                  <button
                    onClick={() => setActiveView('login')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ml-1 shadow-sm ${
                      darkMode ? 'bg-cyan-400 hover:bg-cyan-300 text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </header>

            {/* Main Center Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar flex flex-col justify-between">
              
              {/* ─────────────────────────────────────────────────────────────
                  INITIAL SCREEN (Screenshot 1: "What would you like to do?")
                  ───────────────────────────────────────────────────────────── */}
              {activeView === 'studio' && (
                <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full py-6 sm:py-10 space-y-8 animate-fade-in">
                  
                  {/* Elegant Serif Heading */}
                  <h1 className={`text-3xl sm:text-5xl font-serif font-normal tracking-tight text-center ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    What would you like to do?
                  </h1>

                  {/* Center Chat / Prompt Input Box (Glassmorphic) */}
                  <div className="w-full max-w-2xl">
                    <form 
                      onSubmit={(e) => handleStartDebate(e)}
                      className={`rounded-2xl p-4 transition-all shadow-2xl space-y-3.5 border backdrop-blur-2xl ${
                        darkMode 
                          ? 'bg-[#080d19]/85 border-white/15 focus-within:border-cyan-400/60' 
                          : 'bg-white/85 border-blue-200/90 focus-within:border-indigo-500'
                      }`}
                    >
                      <textarea
                        rows={2}
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleStartDebate(e);
                          }
                        }}
                        placeholder="Ask anything..."
                        className={`w-full bg-transparent resize-none outline-none font-sans text-sm leading-relaxed ${
                          darkMode ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-500 font-medium'
                        }`}
                      />

                      {/* Bottom Action Bar: Professional Dropdown Selectors */}
                      <div className={`flex flex-wrap items-center justify-between gap-2 pt-2.5 text-xs border-t relative z-30 ${
                        darkMode ? 'border-white/10 text-slate-300' : 'border-blue-100 text-slate-600'
                      }`}>
                        <div className="flex items-center space-x-2">
                          
                          {/* 1. Mode Selector Dropdown */}
                          <div className="relative" ref={modeDropdownRef}>
                            <button
                              type="button"
                              onClick={() => {
                                setShowModeDropdown(!showModeDropdown);
                                setShowStanceDropdown(false);
                              }}
                              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs font-semibold border ${
                                debateMode === 'debate'
                                  ? (darkMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' : 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs')
                                  : (darkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs')
                              }`}
                              title="Select Engine Mode"
                            >
                              <span className="p-0.5">
                                {debateMode === 'debate' ? <Swords className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                              </span>
                              <span>{debateMode === 'debate' ? 'Debate Arena' : 'Fact-Check Audit'}</span>
                              <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${showModeDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Mode Dropdown Menu */}
                            {showModeDropdown && (
                              <div className={`absolute left-0 bottom-full mb-2 w-72 rounded-2xl p-2 border shadow-2xl z-50 backdrop-blur-2xl animate-scale-in ${
                                darkMode 
                                  ? 'bg-[#080d19]/95 border-white/20 text-white shadow-black/80' 
                                  : 'bg-white/95 border-blue-200 text-slate-900 shadow-xl'
                              }`}>
                                <div className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  Select Engine Mode
                                </div>
                                <div className="space-y-1 mt-1">
                                  {MODE_OPTIONS.map((opt) => {
                                    const isSelected = debateMode === opt.id;
                                    return (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                          setDebateMode(opt.id);
                                          setShowModeDropdown(false);
                                        }}
                                        className={`w-full flex items-start space-x-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                                          isSelected
                                            ? (opt.id === 'debate' 
                                                ? (darkMode ? 'bg-cyan-500/20 border border-cyan-400/50' : 'bg-indigo-50 border border-indigo-200 shadow-xs')
                                                : (darkMode ? 'bg-emerald-500/20 border border-emerald-400/50' : 'bg-emerald-50 border border-emerald-200 shadow-xs'))
                                            : (darkMode ? 'hover:bg-white/5 border border-transparent' : 'hover:bg-slate-50 border border-transparent')
                                        }`}
                                      >
                                        <div className={`p-1.5 rounded-lg mt-0.5 ${
                                          isSelected 
                                            ? (opt.id === 'debate' 
                                                ? (darkMode ? 'bg-cyan-500 text-black' : 'bg-indigo-600 text-white')
                                                : (darkMode ? 'bg-emerald-500 text-black' : 'bg-emerald-600 text-white'))
                                            : (darkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-700')
                                        }`}>
                                          {opt.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between">
                                            <span className={`text-xs font-bold font-sans ${
                                              isSelected 
                                                ? (opt.id === 'debate' ? (darkMode ? 'text-cyan-300' : 'text-indigo-700') : (darkMode ? 'text-emerald-300' : 'text-emerald-700'))
                                                : (darkMode ? 'text-white' : 'text-slate-900')
                                            }`}>
                                              {opt.name}
                                            </span>
                                            {isSelected && <Check className={`h-3.5 w-3.5 ${opt.id === 'debate' ? (darkMode ? 'text-cyan-400' : 'text-indigo-600') : (darkMode ? 'text-emerald-400' : 'text-emerald-600')}`} />}
                                          </div>
                                          <p className={`text-[11px] leading-tight mt-0.5 ${
                                            darkMode ? 'text-slate-400' : 'text-slate-500'
                                          }`}>
                                            {opt.desc}
                                          </p>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 2. Stance Focus Dropdown */}
                          <div className="relative" ref={stanceDropdownRef}>
                            <button
                              type="button"
                              onClick={() => {
                                setShowStanceDropdown(!showStanceDropdown);
                                setShowModeDropdown(false);
                              }}
                              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs font-semibold border ${
                                darkMode 
                                  ? 'bg-white/5 border-white/15 hover:bg-white/10 text-slate-200 shadow-sm' 
                                  : 'bg-white border-blue-200 text-slate-800 hover:bg-slate-50 shadow-xs'
                              }`}
                              title="Choose Stance Focus"
                            >
                              <span className="p-0.5">
                                {stancePreference === 'both' ? <Scale className="h-3.5 w-3.5 text-cyan-400 dark:text-cyan-300" /> :
                                 stancePreference === 'for' ? <ThumbsUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> :
                                 <ThumbsDown className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />}
                              </span>
                              <span>
                                {stancePreference === 'both' ? 'Both Sides' : stancePreference === 'for' ? 'Affirmative (Pro)' : 'Negative (Con)'}
                              </span>
                              <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${showStanceDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Stance Dropdown Menu */}
                            {showStanceDropdown && (
                              <div className={`absolute left-0 bottom-full mb-2 w-72 rounded-2xl p-2 border shadow-2xl z-50 backdrop-blur-2xl animate-scale-in ${
                                darkMode 
                                  ? 'bg-[#080d19]/95 border-white/20 text-white shadow-black/80' 
                                  : 'bg-white/95 border-blue-200 text-slate-900 shadow-xl'
                              }`}>
                                <div className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  Select Debate Stance
                                </div>
                                <div className="space-y-1 mt-1">
                                  {STANCE_OPTIONS.map((opt) => {
                                    const isSelected = stancePreference === opt.id;
                                    return (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                          setStancePreference(opt.id);
                                          setShowStanceDropdown(false);
                                        }}
                                        className={`w-full flex items-start space-x-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                                          isSelected
                                            ? (darkMode ? 'bg-cyan-500/20 border border-cyan-400/50' : 'bg-indigo-50 border border-indigo-200 shadow-xs')
                                            : (darkMode ? 'hover:bg-white/5 border border-transparent' : 'hover:bg-slate-50 border border-transparent')
                                        }`}
                                      >
                                        <div className={`p-1.5 rounded-lg mt-0.5 ${
                                          isSelected 
                                            ? (darkMode ? 'bg-cyan-500 text-black' : 'bg-indigo-600 text-white')
                                            : (darkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-700')
                                        }`}>
                                          {opt.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between">
                                            <span className={`text-xs font-bold font-sans ${
                                              isSelected 
                                                ? (darkMode ? 'text-cyan-300' : 'text-indigo-700')
                                                : (darkMode ? 'text-white' : 'text-slate-900')
                                            }`}>
                                              {opt.name}
                                            </span>
                                            {isSelected && <Check className={`h-3.5 w-3.5 ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`} />}
                                          </div>
                                          <p className={`text-[11px] leading-tight mt-0.5 ${
                                            darkMode ? 'text-slate-400' : 'text-slate-500'
                                          }`}>
                                            {opt.desc}
                                          </p>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 3. Voice Dictation */}
                          <button
                            type="button"
                            onClick={toggleVoiceInput}
                            className={`p-2 rounded-xl transition-all cursor-pointer border ${
                              isRecordingVoice 
                                ? 'text-rose-400 bg-rose-500/20 border-rose-400 animate-pulse' 
                                : (darkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-blue-200 text-slate-600 hover:text-slate-900 shadow-xs')
                            }`}
                            title={isRecordingVoice ? "Recording... Click to stop" : "Voice Dictation"}
                          >
                            <Mic className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* 4. Submit Button */}
                        <button
                          type="submit"
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all cursor-pointer shadow-md ${
                            darkMode 
                              ? 'bg-cyan-400 hover:bg-cyan-300 text-black' 
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                          title="Transmit prompt"
                        >
                          <Send className="h-4 w-4 ml-0.5" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* "Get started" 2x3 Grid of Quick Starter Cards */}
                  <div className="w-full max-w-2xl space-y-2.5">
                    <span className={`text-xs font-bold uppercase tracking-wider block ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>Get started</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {quickStarterCards.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => {
                            setTopicInput(card.topic);
                            handleStartDebate(null, 'debate');
                          }}
                          className={`p-3.5 rounded-2xl border backdrop-blur-xl transition-all cursor-pointer flex items-start space-x-3 group ${
                            darkMode 
                              ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/40 shadow-sm' 
                              : 'bg-white/75 border-blue-200/80 hover:bg-white hover:border-indigo-300 shadow-sm'
                          }`}
                        >
                          <div className={`p-2 rounded-xl mt-0.5 ${
                            darkMode ? 'bg-cyan-500/15 text-cyan-300' : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {card.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-bold font-sans truncate ${
                              darkMode ? 'text-white group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-indigo-700'
                            }`}>
                              {card.title}
                            </h4>
                            <p className={`text-[11px] font-sans truncate mt-0.5 ${
                              darkMode ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {card.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  ACTIVE ARENA DECK (Screenshot 2: Assistant A vs Assistant B)
                  ───────────────────────────────────────────────────────────── */}
              {activeView === 'debate' && (
                <div className="flex-1 flex flex-col space-y-4 max-w-6xl mx-auto w-full animate-fade-in pb-2">
                  
                  {/* Top Right User Query Bubble */}
                  <div className="flex justify-end pt-1">
                    <div className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-sans max-w-md shadow-md border ${
                      darkMode 
                        ? 'bg-slate-800/90 border-white/15 text-white' 
                        : 'bg-white/90 border-blue-200 text-slate-900 font-medium'
                    }`}>
                      {debateTopic}
                    </div>
                  </div>

                  {/* Dual Voice Speech Narration Player */}
                  <div className="relative z-20">
                    <DebateSpeechPlayer audioState={debateAudio} darkMode={darkMode} />
                  </div>

                  {/* Stage Round Selector Pills */}
                  {debateMode === 'debate' && (
                    <div className="flex items-center justify-between pb-1 text-xs font-sans">
                      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                        {[1, 2, 3, 4, 5].map((rnd) => {
                          const isStreamingThis = status.round_number === rnd && status.status !== 'idle';
                          const roundTitle = rnd === 1 ? 'Round 1: Opening' : rnd === 5 ? 'Round 5: Closing' : `Round ${rnd}: Rebuttal`;
                          return (
                            <button
                              key={rnd}
                              onClick={() => setActiveRoundTab(String(rnd))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 border ${
                                activeRoundTab === String(rnd)
                                  ? (darkMode ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-indigo-600 text-white border-indigo-600 shadow-sm')
                                  : (darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white/70 border-blue-200 text-slate-700 hover:bg-white')
                              }`}
                            >
                              {isStreamingThis && <RefreshCw className="h-2.5 w-2.5 animate-spin text-amber-400" />}
                              <span>{roundTitle}</span>
                            </button>
                          );
                        })}

                        {scores && scores.length > 0 && (
                          <button
                            onClick={() => setActiveRoundTab('verdict')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 border ${
                              activeRoundTab === 'verdict'
                                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                            }`}
                          >
                            <Award className="h-3.5 w-3.5" />
                            <span>Scorecard</span>
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => setActiveRoundTab(activeRoundTab === 'all' ? '1' : 'all')}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-white/80 border-blue-200 text-slate-700'
                        }`}
                      >
                        {activeRoundTab === 'all' ? "Stage View" : "Full Transcript"}
                      </button>
                    </div>
                  )}

                  {/* Dual Deck Assistant Columns (Screenshot 2 Style) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 flex-1 min-h-[380px]">
                    
                    {/* Assistant A (Affirmative) Deck */}
                    <div className={`rounded-2xl p-5 border flex flex-col justify-between space-y-4 shadow-2xl relative overflow-hidden backdrop-blur-2xl ${
                      darkMode ? 'bg-[#080d19]/85 border-white/15 text-slate-100' : 'bg-white/85 border-blue-200 text-slate-900'
                    }`}>
                      <div className="space-y-3">
                        {/* Header */}
                        <div className={`flex items-center justify-between pb-2.5 border-b text-xs ${
                          darkMode ? 'border-white/10' : 'border-blue-100'
                        }`}>
                          <span className={`font-bold font-sans text-sm ${darkMode ? 'text-cyan-400' : 'text-indigo-700'}`}>
                            Assistant A
                          </span>
                          <div className="flex items-center space-x-1.5 text-slate-400">
                            <button 
                              onClick={() => {
                                const text = turns.filter(t => t.agent === 'Agent A' || t.agent === 'FOR').map(t => t.content).join('\n\n');
                                navigator.clipboard.writeText(text);
                                alert("Copied Assistant A speech!");
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" 
                              title="Copy"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Expand">
                              <Maximize2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Speech Content */}
                        {turns.filter(t => t.agent === 'Agent A' || t.agent === 'FOR').length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs italic">
                            Assistant A formulating opening thesis...
                          </div>
                        ) : (
                          turns
                            .filter(t => t.agent === 'Agent A' || t.agent === 'FOR')
                            .filter(t => activeRoundTab === 'all' || String(t.round_number) === activeRoundTab || debateMode === 'factcheck')
                            .map((turn) => (
                              <div key={turn.id} className="space-y-2">
                                <div className={`text-[11px] font-bold uppercase tracking-wider ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  {debateMode === 'factcheck' ? 'Supporting Evidence Brief' : `Round ${turn.round_number}`}
                                </div>
                                <div>{renderContentWithClaims(turn.content, turn.claims)}</div>
                              </div>
                            ))
                        )}
                      </div>

                      {/* Floating scroll down indicator */}
                      <div className="flex justify-center pt-2">
                        <button 
                          onClick={() => turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                            darkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-blue-200 text-slate-600 hover:text-slate-900 shadow-xs'
                          }`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Assistant B (Negative) Deck */}
                    <div className={`rounded-2xl p-5 border flex flex-col justify-between space-y-4 shadow-2xl relative overflow-hidden backdrop-blur-2xl ${
                      darkMode ? 'bg-[#080d19]/85 border-white/15 text-slate-100' : 'bg-white/85 border-blue-200 text-slate-900'
                    }`}>
                      <div className="space-y-3">
                        {/* Header */}
                        <div className={`flex items-center justify-between pb-2.5 border-b text-xs ${
                          darkMode ? 'border-white/10' : 'border-blue-100'
                        }`}>
                          <div className="flex items-center space-x-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${darkMode ? 'bg-amber-400' : 'bg-amber-500'}`}></span>
                            <span className={`font-bold font-sans text-sm ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                              Assistant B
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-slate-400">
                            <button 
                              onClick={() => {
                                const text = turns.filter(t => t.agent === 'Agent B' || t.agent === 'AGAINST').map(t => t.content).join('\n\n');
                                navigator.clipboard.writeText(text);
                                alert("Copied Assistant B speech!");
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" 
                              title="Copy"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Expand">
                              <Maximize2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Speech Content */}
                        {turns.filter(t => t.agent === 'Agent B' || t.agent === 'AGAINST').length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs italic">
                            Assistant B formulating adversarial response...
                          </div>
                        ) : (
                          turns
                            .filter(t => t.agent === 'Agent B' || t.agent === 'AGAINST')
                            .filter(t => activeRoundTab === 'all' || String(t.round_number) === activeRoundTab || debateMode === 'factcheck')
                            .map((turn) => (
                              <div key={turn.id} className="space-y-2">
                                <div className={`text-[11px] font-bold uppercase tracking-wider ${
                                  darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  {debateMode === 'factcheck' ? 'Counter Evidence Brief' : `Round ${turn.round_number}`}
                                </div>
                                <div>{renderContentWithClaims(turn.content, turn.claims)}</div>
                              </div>
                            ))
                        )}
                      </div>

                      {/* Floating scroll down indicator */}
                      <div className="flex justify-center pt-2">
                        <button 
                          onClick={() => turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                            darkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-blue-200 text-slate-600 hover:text-slate-900 shadow-xs'
                          }`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Double-Blind Judgment Scorecard (When active) */}
                  {scores && scores.length > 0 && (activeRoundTab === 'all' || activeRoundTab === 'verdict') && (
                    <div className={`rounded-2xl p-5 border space-y-4 backdrop-blur-2xl ${
                      darkMode ? 'bg-[#0b1222]/90 border-amber-500/40' : 'bg-white/90 border-amber-300 shadow-xl'
                    }`}>
                      <div className="flex items-center space-x-2 text-amber-500 font-sans text-xs font-bold uppercase">
                        <Award className="h-4 w-4" />
                        <span>Double-Blind Arbiter Verdict</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scores.map((score) => {
                          const winner = getWinner(scores);
                          const isWinner = score.agent === winner;
                          return (
                            <div key={score.agent} className={`p-4 rounded-xl border space-y-2.5 ${
                              darkMode ? 'bg-black/40 border-white/10' : 'bg-white border-blue-100 shadow-xs'
                            }`}>
                              <div className="flex justify-between items-center">
                                <span className={`font-bold text-sm flex items-center space-x-1.5 ${
                                  darkMode ? 'text-white' : 'text-slate-900'
                                }`}>
                                  <span>{score.agent}</span>
                                  {isWinner && <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded font-bold">WINNER</span>}
                                </span>
                                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{score.total} <span className="text-xs opacity-60">/ 10</span></span>
                              </div>
                              <p className={`text-xs font-sans leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{score.judge_reasoning}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div ref={turnsEndRef}></div>

                  {/* Persistent Bottom Follow-up Input Bar (Screenshot 2 Style with Glass Theme) */}
                  <div className="w-full max-w-3xl mx-auto pt-2">
                    <form 
                      onSubmit={(e) => handleStartDebate(e)}
                      className={`rounded-2xl p-3.5 transition-all shadow-2xl space-y-2 border backdrop-blur-2xl ${
                        darkMode ? 'bg-[#080d19]/85 border-white/15' : 'bg-white/85 border-blue-200/90'
                      }`}
                    >
                      <textarea
                        rows={1}
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleStartDebate(e);
                          }
                        }}
                        placeholder="Ask followup counter-argument or submit new claim..."
                        className={`w-full bg-transparent resize-none outline-none font-sans text-xs sm:text-sm leading-relaxed ${
                          darkMode ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-500 font-medium'
                        }`}
                      />

                      <div className={`flex items-center justify-between pt-1.5 text-xs border-t ${
                        darkMode ? 'border-white/10' : 'border-blue-100'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setDebateMode(debateMode === 'debate' ? 'factcheck' : 'debate')}
                            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer text-[11px] font-semibold border ${
                              debateMode === 'debate'
                                ? (darkMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' : 'bg-indigo-50 text-indigo-700 border-indigo-200')
                                : (darkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                            }`}
                            title="Switch mode"
                          >
                            <Zap className="h-3 w-3" />
                            <span>{debateMode === 'debate' ? '⚔️ Debate' : '🛡️ Fact-Check'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={toggleVoiceInput}
                            className={`p-1.5 rounded-xl transition-all cursor-pointer border ${
                              isRecordingVoice 
                                ? 'text-rose-400 bg-rose-500/20 border-rose-400 animate-pulse' 
                                : (darkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-blue-200 text-slate-600')
                            }`}
                            title="Voice Input"
                          >
                            <Mic className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          type="submit"
                          className={`px-3 py-1 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm ${
                            darkMode ? 'bg-cyan-400 hover:bg-cyan-300 text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          <span>Transmit</span>
                          <Send className="h-3 w-3" />
                        </button>
                      </div>
                    </form>

                    <p className={`text-[10px] text-center mt-2 font-sans ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Inputs are processed by third-party AI and responses may be inaccurate.
                    </p>
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 3: HISTORY / ARCHIVE VAULT
          ═══════════════════════════════════════════════════════════════ */}
      {activeView === 'history' && (
        <div className="max-w-5xl mx-auto w-full py-10 px-4 space-y-6 animate-slide-up relative z-20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-2xl font-bold font-serif ${darkMode ? 'text-white' : 'text-slate-900'}`}>Debate Archive Vault</h3>
              <p className={`text-xs font-sans mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Review past debate telemetry, fact-checks, and judgment scorecards.</p>
            </div>
            <button
              onClick={() => setActiveView('landing')}
              className={`px-4 py-2 rounded-xl border font-sans text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-white border-blue-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back Home</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {historyList.length === 0 ? (
              <div className={`col-span-2 rounded-2xl p-12 text-center text-sm border backdrop-blur-xl ${
                darkMode ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-white/80 border-blue-200 text-slate-600 shadow-sm'
              }`}>
                No past debates found in archive. Start your first debate from the arena!
              </div>
            ) : (
              historyList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleViewPastDebate(item.id)}
                  className={`rounded-2xl p-4 cursor-pointer space-y-3 transition-all border backdrop-blur-xl ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 hover:border-cyan-400/40 text-white' 
                      : 'bg-white/85 border-blue-200 hover:border-indigo-300 text-slate-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-sans font-bold">
                    <span className={darkMode ? 'text-cyan-400 uppercase' : 'text-indigo-600 uppercase'}>{item.mode || 'debate'}</span>
                    <span className="opacity-60">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-sm line-clamp-2 font-sans">
                    {item.topic}
                  </h4>
                  <div className={`flex items-center justify-between pt-2 border-t text-xs font-sans ${
                    darkMode ? 'border-white/10' : 'border-blue-100'
                  }`}>
                    <span className="opacity-75">Status: <strong className="text-emerald-500">{item.status}</strong></span>
                    <span className={darkMode ? 'text-cyan-300 font-bold' : 'text-indigo-600 font-bold'}>&rarr; Open</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 4: AUTHENTICATION (LOGIN & REGISTER)
          ═══════════════════════════════════════════════════════════════ */}
      {(activeView === 'login' || activeView === 'register') && (
        <div className="max-w-md mx-auto w-full py-16 px-4 animate-slide-up relative z-20">
          <div className={`rounded-3xl p-8 shadow-2xl space-y-6 border backdrop-blur-2xl ${
            darkMode ? 'bg-[#080d19]/90 border-white/15 text-white' : 'bg-white/90 border-blue-200 text-slate-900'
          }`}>
            <div className="text-center space-y-1.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 border ${
                darkMode ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
              }`}>
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-serif">
                {activeView === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className={`text-xs font-sans ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {activeView === 'login' ? 'Sign in to access your secure debate archive.' : 'Register to preserve session logs and custom tuning.'}
              </p>
            </div>

            <form onSubmit={activeView === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className={`mb-1 block uppercase text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Email</label>
                <input
                  type="email"
                  value={activeView === 'login' ? loginEmail : registerEmail}
                  onChange={(e) => activeView === 'login' ? setLoginEmail(e.target.value) : setRegisterEmail(e.target.value)}
                  placeholder="user@example.com"
                  className={`w-full rounded-xl px-3.5 py-2.5 outline-none border transition-all ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white focus:border-cyan-400' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`mb-1 block uppercase text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Password</label>
                <input
                  type="password"
                  value={activeView === 'login' ? loginPassword : registerPassword}
                  onChange={(e) => activeView === 'login' ? setLoginPassword(e.target.value) : setRegisterPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-xl px-3.5 py-2.5 outline-none border transition-all ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white focus:border-cyan-400' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                  }`}
                  required
                />
              </div>

              {(loginError || registerError) && (
                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-[11px]">
                  {loginError || registerError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                  darkMode 
                    ? 'bg-cyan-400 hover:bg-cyan-300 text-black' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {authLoading ? 'AUTHENTICATING...' : (activeView === 'login' ? 'SIGN IN' : 'REGISTER')}
              </button>
            </form>

            <div className={`text-center pt-2 text-xs font-sans space-y-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <p>
                {activeView === 'login' ? "Need an account? " : "Already have an account? "}
                <button 
                  onClick={() => setActiveView(activeView === 'login' ? 'register' : 'login')}
                  className={`underline font-bold ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`}
                >
                  {activeView === 'login' ? 'Register' : 'Sign in'}
                </button>
              </p>
              <button onClick={() => setActiveView('landing')} className="opacity-70 hover:opacity-100 text-[11px]">
                &larr; Return to Homepage
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
