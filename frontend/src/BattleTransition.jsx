import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Shield, Swords, Sparkles, Flame, Trophy, Cpu } from 'lucide-react';
import logo from './assets/logo.png';

/**
 * 🎬 CONCEPT 4: CINEMATIC MATCHUP LETTERBOX (Esports & High-End Arena Clash)
 * - Top & Bottom widescreen cinematic letterbox bars slide into place
 * - Central 3-column matchup strip:
 *     Left: Agent A (Cobalt Affirmative)
 *     Center: Sleek Glowing "VS" Core & Contested Motion
 *     Right: Agent B (Amber Negative)
 * - Cinematic curtain retract reveal (Top up, Bottom down)
 */
export default function BattleTransition({
  isActive = false,
  topic = '',
  mode = 'debate',
  statusMessage = 'Orchestrating Adversarial Clash...',
  darkMode = false,
}) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="cinematic-matchup-transition"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center overflow-hidden select-none"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* ═══════════ 1. TOP CINEMATIC LETTERBOX BAR ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { y: '-100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: '0%' }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    y: '-100%',
                    transition: { duration: 0.38, ease: [0.75, 0, 0.2, 1] },
                  }
            }
            transition={{ duration: 0.32, ease: [0.12, 0.95, 0.2, 1.0] }}
            className={`absolute top-0 left-0 right-0 h-[26vh] z-20 border-b shadow-2xl backdrop-blur-2xl ${
              darkMode
                ? 'bg-[#060813]/95 border-indigo-500/30'
                : 'bg-slate-900/90 border-white/20'
            }`}
          >
            {/* Top Glowing Laser Edge */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-white to-amber-500 shadow-[0_0_15px_#818cf8]" />
          </motion.div>

          {/* ═══════════ 2. BOTTOM CINEMATIC LETTERBOX BAR ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: '0%' }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    y: '100%',
                    transition: { duration: 0.38, ease: [0.75, 0, 0.2, 1] },
                  }
            }
            transition={{ duration: 0.32, ease: [0.12, 0.95, 0.2, 1.0] }}
            className={`absolute bottom-0 left-0 right-0 h-[26vh] z-20 border-t shadow-2xl backdrop-blur-2xl ${
              darkMode
                ? 'bg-[#060813]/95 border-amber-500/30'
                : 'bg-slate-900/90 border-white/20'
            }`}
          >
            {/* Bottom Glowing Laser Edge */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-white to-amber-500 shadow-[0_0_15px_#fbbf24]" />
          </motion.div>

          {/* Center Viewport Dimmer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10"
          />

          {/* ═══════════ 3. CENTRAL CINEMATIC MATCHUP STRIP (z-30) ═══════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 1.08,
              filter: 'blur(10px)',
              transition: { duration: 0.28, ease: [0.7, 0, 0.2, 1] },
            }}
            transition={{ delay: 0.08, duration: 0.3, ease: 'easeOut' }}
            className="relative z-30 w-full max-w-6xl px-4 sm:px-8 flex flex-col items-center justify-center"
          >
            {/* Main 3-Column Matchup Stage */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* ── LEFT: AGENT A (AFFIRMATIVE) ── */}
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="hidden md:flex flex-col items-start space-y-2 p-5 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.25)] relative overflow-hidden group"
              >
                <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl" />
                
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-900/90 border border-indigo-400/50 text-indigo-200 text-xs font-black uppercase tracking-widest">
                  <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>{mode === 'factcheck' ? 'EVIDENCE BASE' : 'AGENT A • PRO'}</span>
                </div>

                <h2 className="text-3xl lg:text-4xl font-serif font-black text-white tracking-tight leading-none">
                  {mode === 'factcheck' ? 'SUPPORT' : 'PRO POSITION'}
                </h2>

                <p className="text-xs font-mono text-indigo-300/80">
                  Temperature: 0.6 &bull; Strict Logical Axioms
                </p>
              </motion.div>

              {/* ── CENTER: "VS" EMBLEM & CONTESTED TOPIC ── */}
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                
                {/* Glowing Hexagonal VS Emblem */}
                <motion.div
                  initial={{ scale: 1.6, opacity: 0, rotate: -6 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.12, duration: 0.35, ease: [0.15, 1.25, 0.3, 1.0] }}
                  className="relative flex items-center justify-center"
                >
                  <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-indigo-500/50 via-amber-500/50 to-indigo-500/50 blur-2xl animate-pulse" />
                  
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#090d21] border-2 border-amber-400 shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center p-2.5">
                    <img
                      src={logo}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md mb-0.5"
                      alt="Logo"
                    />
                    <span className="text-lg sm:text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-white to-amber-500 font-sans leading-none">
                      VS
                    </span>

                    {/* Corner Sparkles */}
                    <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black p-1 rounded-full shadow-lg border border-amber-200">
                      <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                  </div>
                </motion.div>

                {/* Contested Motion Banner */}
                {topic && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.25 }}
                    className="w-full max-w-sm sm:max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-3.5 sm:p-4 shadow-2xl"
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center justify-center space-x-1.5 mb-1">
                      <Swords className="w-3 h-3" />
                      <span>CONTESTED MOTION</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-serif font-extrabold text-white line-clamp-2 leading-snug">
                      "{topic}"
                    </h3>
                  </motion.div>
                )}

                {/* Live Status Pill */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.28, duration: 0.2 }}
                  className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-black/80 border border-white/15 shadow-xl text-slate-200 text-xs font-mono font-bold uppercase tracking-wider"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" style={{ animationDuration: '1s' }} />
                  <span>{statusMessage}</span>
                </motion.div>
              </div>

              {/* ── RIGHT: AGENT B (NEGATIVE) ── */}
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="hidden md:flex flex-col items-end text-right space-y-2 p-5 rounded-2xl bg-amber-950/70 border border-amber-500/40 backdrop-blur-xl shadow-[0_0_40px_rgba(245,158,11,0.25)] relative overflow-hidden group"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amber-500/20 blur-2xl" />
                
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-900/90 border border-amber-400/50 text-amber-200 text-xs font-black uppercase tracking-widest ml-auto">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span>{mode === 'factcheck' ? 'COUNTER ANALYSIS' : 'AGENT B • CONTRA'}</span>
                </div>

                <h2 className="text-3xl lg:text-4xl font-serif font-black text-white tracking-tight leading-none">
                  {mode === 'factcheck' ? 'COUNTER' : 'CONTRA STANCE'}
                </h2>

                <p className="text-xs font-mono text-amber-300/80">
                  Temperature: 0.8 &bull; Adversarial Rebuttals
                </p>
              </motion.div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
