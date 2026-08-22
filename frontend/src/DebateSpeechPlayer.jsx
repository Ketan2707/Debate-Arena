import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, SkipForward, Sparkles, Mic, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * 🎙️ Real-Time Dual-Voice AI Speech Synthesizer & Podcast Player
 * - Agent A: Distinct Assertive Voice
 * - Agent B: Distinct Analytical Counter-Voice
 * - Judge: Authoritative Announcer Voice
 * - Zero external API latency, browser-native Web Speech API
 */

// Helper to strip markdown and citation noise for clean speech
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
  const queueRef = useRef([]);
  const isSpeakingRef = useRef(false);

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

  // Pick suitable voices for Agent A, Agent B, and Judge
  const getVoiceForRole = useCallback((role = 'Agent A') => {
    if (!voices.length) return null;
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    const pool = englishVoices.length ? englishVoices : voices;

    if (role === 'Agent A' || role === 'FOR') {
      // Find a natural male/confident voice (e.g. Daniel, Google US English, Natural)
      return (
        pool.find(v => v.name.includes('Natural') && v.name.includes('Male')) ||
        pool.find(v => v.name.includes('Daniel') || v.name.includes('George') || v.name.includes('Guy')) ||
        pool[0]
      );
    } else if (role === 'Agent B' || role === 'AGAINST') {
      // Find a natural counter voice (e.g. Samantha, Google UK English Female, Karen)
      return (
        pool.find(v => v.name.includes('Natural') && v.name.includes('Female')) ||
        pool.find(v => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Victoria')) ||
        pool[Math.min(1, pool.length - 1)]
      );
    } else {
      // Judge / Announcer (Deep/authoritative)
      return (
        pool.find(v => v.name.includes('David') || v.name.includes('Oliver') || v.name.includes('Alex')) ||
        pool[0]
      );
    }
  }, [voices]);

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
      utterance.pitch = 1.05;
      utterance.rate = 1.02;
    } else if (item.agent === 'Agent B' || item.agent === 'AGAINST') {
      utterance.pitch = 0.95;
      utterance.rate = 1.04;
    } else {
      // Judge
      utterance.pitch = 0.85;
      utterance.rate = 0.95;
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
    speakText,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
  };
}

/**
 * Floating Audio Player & Waveform HUD for the Debate Stage
 */
export default function DebateSpeechPlayer({
  audioState,
  darkMode = false,
}) {
  const { isSpeaking, isPaused, currentSpeaker, autoNarrate, setAutoNarrate, pauseSpeech, resumeSpeech, stopSpeech } = audioState;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border shadow-lg backdrop-blur-xl transition-all ${
      darkMode
        ? 'bg-slate-900/90 border-white/10 text-white'
        : 'bg-white/95 border-blue-200 text-slate-900 shadow-md'
    }`}>
      {/* Left: Podcast / Live Broadcast Badge */}
      <div className="flex items-center space-x-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
          isSpeaking 
            ? (currentSpeaker?.includes('B') || currentSpeaker === 'AGAINST' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white')
            : (darkMode ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-600')
        }`}>
          <Radio className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold font-sans">Live AI Narration</span>
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
            {isSpeaking ? "Dual-voice adversarial podcast broadcast active" : "Listen to debate arguments with AI voice synthesis"}
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

      {/* Right: Controls */}
      <div className="flex items-center space-x-2 ml-auto">
        {/* Auto-Narrate Stream Toggle */}
        <button
          onClick={() => setAutoNarrate(!autoNarrate)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            autoNarrate
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
              : (darkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200')
          }`}
          title="Automatically speak new arguments as they stream in"
        >
          {autoNarrate ? <Volume2 className="w-3.5 h-3.5 text-white" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{autoNarrate ? 'Auto-Voice: ON' : 'Auto-Voice: OFF'}</span>
        </button>

        {/* Play/Pause & Stop Controls (Active while speaking) */}
        {isSpeaking && (
          <div className="flex items-center space-x-1">
            {isPaused ? (
              <button
                onClick={resumeSpeech}
                className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer"
                title="Resume Voice"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={pauseSpeech}
                className="p-1.5 rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-all cursor-pointer"
                title="Pause Voice"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={stopSpeech}
              className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-all cursor-pointer"
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
