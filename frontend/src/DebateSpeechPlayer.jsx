import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, SkipForward, Sparkles, Mic, Radio, Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * 🎙️ Real-Time Dual-Voice AI Speech Synthesizer & Podcast Player with Accent Picker
 * - Accents: Indian English (en-IN), British (en-GB), American (en-US), Australian (en-AU)
 * - Agent A: Distinct Assertive Voice
 * - Agent B: Distinct Analytical Counter-Voice
 * - Judge: Authoritative Announcer Voice
 */

export const VOICE_ACCENTS = [
  { id: 'en-IN', name: 'Indian English', flag: '🇮🇳', tag: 'IN', short: 'Indian', badgeColor: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-400/40' },
  { id: 'en-GB', name: 'British English', flag: '🇬🇧', tag: 'UK', short: 'British', badgeColor: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-400/40' },
  { id: 'en-US', name: 'American English', flag: '🇺🇸', tag: 'US', short: 'American', badgeColor: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-400/40' },
  { id: 'en-AU', name: 'Australian English', flag: '🇦🇺', tag: 'AU', short: 'Australian', badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/40' },
];

// Helper to strip markdown and citation noise for clean, natural speech
export function sanitizeSpeechText(rawText = '') {
  if (!rawText) return '';
  return rawText
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold
    .replace(/\*(.*?)\*/g, '$1')     // remove italic
    .replace(/\[(.*?)\]/g, '')        // remove brackets/claims
    .replace(/https?:\/\/\S+/g, '')   // remove URLs
    .replace(/#{1,6}\s?/g, '')        // remove markdown headers
    .replace(/[-*•]\s+/g, '')         // remove bullets
    .replace(/\s+/g, ' ')
    .trim();
}

export function useDebateAudio() {
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [autoNarrate, setAutoNarrate] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(() => {
    try {
      return localStorage.getItem('arguforge-voice-accent') || 'en-IN';
    } catch (_) {
      return 'en-IN';
    }
  });

  const queueRef = useRef([]);
  const isSpeakingRef = useRef(false);

  // Save accent preference
  const changeAccent = (accentCode) => {
    setSelectedAccent(accentCode);
    try {
      localStorage.setItem('arguforge-voice-accent', accentCode);
    } catch (_) {}
  };

  // Load available system voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices() || [];
      setVoices(available);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Pick suitable voices based on selected accent and debater role
  const getVoiceForRole = useCallback((role = 'Agent A') => {
    if (!voices.length) return null;

    // Filter by selected accent first (e.g. en-IN, en-GB, en-US, en-AU)
    let accentPool = voices.filter(v => 
      v.lang?.toLowerCase().includes(selectedAccent.toLowerCase().replace('_', '-')) ||
      (selectedAccent === 'en-IN' && (v.name.includes('India') || v.name.includes('Hindi') || v.lang.includes('IN'))) ||
      (selectedAccent === 'en-GB' && (v.name.includes('UK') || v.name.includes('British') || v.lang.includes('GB'))) ||
      (selectedAccent === 'en-US' && (v.name.includes('US') || v.name.includes('United States') || v.lang.includes('US'))) ||
      (selectedAccent === 'en-AU' && (v.name.includes('Australia') || v.lang.includes('AU')))
    );

    // Fallback to any English voice if accent specific isn't present on user's OS
    if (accentPool.length === 0) {
      accentPool = voices.filter(v => v.lang.startsWith('en'));
    }
    if (accentPool.length === 0) {
      accentPool = voices;
    }

    if (role === 'Agent A' || role === 'FOR') {
      // Find male/assertive/first voice in pool
      return (
        accentPool.find(v => v.name.includes('Male') || v.name.includes('Ravi') || v.name.includes('Prabhat') || v.name.includes('George') || v.name.includes('Guy') || v.name.includes('Daniel')) ||
        accentPool[0]
      );
    } else if (role === 'Agent B' || role === 'AGAINST') {
      // Find female/counter voice in pool
      return (
        accentPool.find(v => v.name.includes('Female') || v.name.includes('Heera') || v.name.includes('Neerja') || v.name.includes('Samantha') || v.name.includes('Hazel') || v.name.includes('Karen')) ||
        accentPool[Math.min(1, accentPool.length - 1)]
      );
    } else {
      // Judge / Announcer (Deep/authoritative)
      return (
        accentPool.find(v => v.name.includes('David') || v.name.includes('Oliver') || v.name.includes('Ravi') || v.name.includes('Alex')) ||
        accentPool[0]
      );
    }
  }, [voices, selectedAccent]);

  // Process speech queue
  const processNextInQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentSpeaker(null);
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const item = queueRef.current.shift();
    const clean = sanitizeSpeechText(item.text);
    if (!clean) {
      processNextInQueue();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(clean);
    const selectedVoice = getVoiceForRole(item.agent);
    if (selectedVoice) utterance.voice = selectedVoice;

    if (item.agent === 'Agent A' || item.agent === 'FOR') {
      utterance.pitch = 1.02;
      utterance.rate = 1.01;
    } else if (item.agent === 'Agent B' || item.agent === 'AGAINST') {
      utterance.pitch = 0.95;
      utterance.rate = 1.03;
    } else {
      // Judge
      utterance.pitch = 0.88;
      utterance.rate = 0.96;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setCurrentSpeaker(item.agent);
    };

    utterance.onend = () => {
      processNextInQueue();
    };

    utterance.onerror = () => {
      processNextInQueue();
    };

    window.speechSynthesis.speak(utterance);
  }, [getVoiceForRole]);

  // Play a single speech item or queue it
  const speakText = useCallback((text, agent = 'Agent A', immediate = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (immediate) {
      window.speechSynthesis.cancel();
      queueRef.current = [{ text, agent }];
      processNextInQueue();
    } else {
      queueRef.current.push({ text, agent });
      if (!isSpeakingRef.current) {
        processNextInQueue();
      }
    }
  }, [processNextInQueue]);

  const pauseSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      queueRef.current = [];
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setIsPaused(false);
      setCurrentSpeaker(null);
    }
  }, []);

  return {
    isSpeaking,
    isPaused,
    currentSpeaker,
    autoNarrate,
    setAutoNarrate,
    selectedAccent,
    changeAccent,
    speakText,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
  };
}

/**
 * Floating Audio Player & Waveform HUD with Accent Selector
 */
export default function DebateSpeechPlayer({
  audioState,
  darkMode = false,
}) {
  const { 
    isSpeaking, 
    isPaused, 
    currentSpeaker, 
    autoNarrate, 
    setAutoNarrate, 
    selectedAccent, 
    changeAccent, 
    pauseSpeech, 
    resumeSpeech, 
    stopSpeech 
  } = audioState;

  const [showAccentMenu, setShowAccentMenu] = useState(false);
  const dropdownRef = useRef(null);
  const currentAccentObj = VOICE_ACCENTS.find(a => a.id === selectedAccent) || VOICE_ACCENTS[0];

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAccentMenu(false);
      }
    }
    if (showAccentMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccentMenu]);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border shadow-lg backdrop-blur-xl transition-all relative ${
      darkMode
        ? 'bg-slate-900/95 border-white/10 text-white'
        : 'bg-white/95 border-blue-200 text-slate-900 shadow-md'
    }`}>
      {/* Left: Podcast / Live Broadcast Badge */}
      <div className="flex items-center space-x-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
          isSpeaking 
            ? (currentSpeaker?.includes('B') || currentSpeaker === 'AGAINST' ? 'bg-amber-500 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md')
            : (darkMode ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-600')
        }`}>
          <Radio className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold font-sans">Live AI Voice Narration</span>
            {isSpeaking && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                currentSpeaker?.includes('B') || currentSpeaker === 'AGAINST'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}>
                {currentSpeaker} Speaking
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
            {isSpeaking ? "Dual-voice adversarial audio active" : "Listen to debate arguments with AI voice synthesis"}
          </p>
        </div>
      </div>

      {/* Center: Real-time Audio Waveform */}
      {isSpeaking && (
        <div className="hidden sm:flex items-center space-x-1 h-5 px-3 py-1 rounded-xl bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/10">
          {[0.4, 0.9, 0.6, 1.0, 0.7, 0.3, 0.8].map((h, i) => (
            <motion.span
              key={i}
              animate={{
                scaleY: isPaused ? 0.2 : [h * 0.3, h, h * 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.6 + (i % 3) * 0.2,
                ease: 'easeInOut',
              }}
              className={`w-1 rounded-full origin-bottom ${
                currentSpeaker?.includes('B') || currentSpeaker === 'AGAINST' ? 'bg-amber-400' : 'bg-indigo-500'
              }`}
              style={{ height: '100%' }}
            />
          ))}
        </div>
      )}

      {/* Right: Controls & Accent Selector */}
      <div className="flex items-center space-x-2 ml-auto">
        
        {/* Voice Accent Picker Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowAccentMenu(!showAccentMenu)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs ${
              darkMode 
                ? 'bg-slate-800 hover:bg-slate-700 border-white/15 text-white' 
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900'
            }`}
            title="Choose voice accent"
          >
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${currentAccentObj.badgeColor}`}>
              {currentAccentObj.tag}
            </span>
            <span className="font-sans font-bold">{currentAccentObj.short}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* Accent Menu Dropdown (Solid, High-Contrast & High z-index) */}
          <AnimatePresence>
            {showAccentMenu && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border p-2 z-[999] shadow-2xl ${
                  darkMode 
                    ? 'bg-slate-900 border-white/20 text-white shadow-black/80' 
                    : 'bg-white border-slate-300 text-slate-900 shadow-xl'
                }`}
              >
                <div className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 text-slate-500 dark:text-slate-400">
                  Select Voice Accent
                </div>
                <div className="space-y-1 mt-1">
                  {VOICE_ACCENTS.map(acc => {
                    const isSelected = selectedAccent === acc.id;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          changeAccent(acc.id);
                          setShowAccentMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md'
                            : (darkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-100')
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                            isSelected ? 'bg-white/20 text-white border-white/40' : acc.badgeColor
                          }`}>
                            {acc.tag}
                          </span>
                          <span className="font-sans">{acc.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Auto-Narrate Stream Toggle */}
        <button
          onClick={() => setAutoNarrate(!autoNarrate)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs ${
            autoNarrate
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
              : (darkMode ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200')
          }`}
          title="Automatically speak new arguments as they stream in"
        >
          {autoNarrate ? <Volume2 className="w-3.5 h-3.5 text-white" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{autoNarrate ? 'Auto: ON' : 'Auto: OFF'}</span>
        </button>

        {/* Play/Pause & Stop Controls (Active while speaking) */}
        {isSpeaking && (
          <div className="flex items-center space-x-1">
            {isPaused ? (
              <button
                onClick={resumeSpeech}
                className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer shadow-xs"
                title="Resume Voice"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={pauseSpeech}
                className="p-1.5 rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-all cursor-pointer shadow-xs"
                title="Pause Voice"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={stopSpeech}
              className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-all cursor-pointer shadow-xs"
              title="Stop Voice"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
