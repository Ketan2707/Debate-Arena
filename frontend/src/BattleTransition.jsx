import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Shield, Swords, Sparkles, Flame, Trophy, Cpu } from 'lucide-react';
import logo from './assets/logo.png';

/**
 * 🎬 CONCEPT 4: HIGH-CONTRAST CINEMATIC MATCHUP LETTERBOX
 * - 100% Opaque & Crisp Backdrop (No background bleed-through)
 * - Ultra-high contrast cards with bold white serif typography
 * - Top & Bottom widescreen cinematic bars (y: -100% / +100%)
 * - Retracts smoothly when debate starts
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center overflow-hidden select-none bg-[#050714]"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Ambient Glow Atmosphere (Contained inside transition) */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-600/20 blur-[100px] pointer-events-none" />

          {/* ═══════════ 1. TOP CINEMATIC LETTERBOX BAR ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { y: '-100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: '0%' }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    y: '-100%',
                    transition: { duration: 0.35, ease: [0.75, 0, 0.2, 1] },
                  }
            }
            transition={{ duration: 0.28, ease: [0.12, 0.95, 0.2, 1.0] }}
            className="absolute top-0 left-0 right-0 h-[22vh] z-20 bg-[#02040a] border-b border-indigo-500/40 shadow-2xl"
          >
            {/* Top Glowing Laser Seam */}
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
                    transition: { duration: 0.35, ease: [0.75, 0, 0.2, 1] },
                  }
            }
            transition={{ duration: 0.28, ease: [0.12, 0.95, 0.2, 1.0] }}
            className="absolute bottom-0 left-0 right-0 h-[22vh] z-20 bg-[#02040a] border-t border-amber-500/40 shadow-2xl"
          >
            {/* Bottom Glowing Laser Seam */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-white to-amber-500 shadow-[0_0_15px_#fbbf24]" />
          </motion.div>

          {/* ═══════════ 3. CENTRAL CINEMATIC MATCHUP STAGE (z-30) ═══════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 1.08,
              filter: 'blur(8px)',
              transition: { duration: 0.25, ease: [0.7, 0, 0.2, 1] },
            }}
            transition={{ delay: 0.06, duration: 0.28, ease: 'easeOut' }}
            className="relative z-30 w-full max-w-5xl px-4 sm:px-6 flex flex-col items-center justify-center"
          >
            {/* 3-Column Matchup Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-center">
              
              {/* ── LEFT: AGENT A (AFFIRMATIVE) ── */}
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.12, duration: 0.28 }}
                className="flex flex-col items-start space-y-2 p-4 sm:p-5 rounded-2xl bg-[#090d24] border-2 border-indigo-500/60 shadow-[0_12px_32px_rgba(0,0,0,0.6)] relative overflow-hidden"
              >
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-900/90 border border-indigo-400 text-indigo-200 text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-md">
                  <Zap className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                  <span>{mode === 'factcheck' ? 'EVIDENCE BASE' : 'AGENT A • PRO'}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-white tracking-tight leading-tight drop-shadow-md">
                  {mode === 'factcheck' ? 'SUPPORT' : 'PRO POSITION'}
                </h2>

                <p className="text-xs font-mono font-semibold text-indigo-300">
                  Temp 0.6 &bull; Strict Logical Axioms
                </p>
              </motion.div>

              {/* ── CENTER: "VS" EMBLEM & CONTESTED TOPIC ── */}
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                
                {/* Glowing Hexagonal VS Emblem */}
                <motion.div
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3, ease: [0.15, 1.25, 0.3, 1.0] }}
                  className="relative flex items-center justify-center"
                >
                  <div className="absolute -inset-5 rounded-full bg-gradient-to-r from-indigo-500/50 via-amber-500/50 to-indigo-500/50 blur-2xl animate-pulse" />
                  
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-[#0a0e27] border-2 border-amber-400 shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center p-2">
                    <img
                      src={logo}
                      className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-md mb-0.5"
                      alt="Logo"
                    />
                    <span className="text-lg sm:text-xl font-black italic tracking-tighter text-amber-300 font-sans leading-none drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]">
                      VS
                    </span>

                    {/* Corner Sparkle */}
                    <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black p-1 rounded-full shadow-lg border border-amber-200">
                      <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                  </div>
                </motion.div>

                {/* Contested Motion Card (High-Contrast Solid Surface) */}
                {topic && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, duration: 0.22 }}
                    className="w-full max-w-sm sm:max-w-md bg-[#090d24] border-2 border-white/25 rounded-2xl p-3.5 sm:p-4 shadow-2xl"
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center justify-center space-x-1.5 mb-1">
                      <Swords className="w-3.5 h-3.5" />
                      <span>CONTESTED MOTION</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-serif font-extrabold text-white line-clamp-2 leading-relaxed drop-shadow">
                      "{topic}"
                    </h3>
                  </motion.div>
                )}

                {/* Live Status Pill */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.24, duration: 0.2 }}
                  className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#050716] border-2 border-amber-400/60 shadow-xl text-amber-300 text-xs font-mono font-bold uppercase tracking-wider"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" style={{ animationDuration: '1s' }} />
                  <span>{statusMessage}</span>
                </motion.div>
              </div>

              {/* ── RIGHT: AGENT B (NEGATIVE) ── */}
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.12, duration: 0.28 }}
                className="flex flex-col items-end text-right space-y-2 p-4 sm:p-5 rounded-2xl bg-[#241305] border-2 border-amber-500/60 shadow-[0_12px_32px_rgba(0,0,0,0.6)] relative overflow-hidden"
              >
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-900/90 border border-amber-400 text-amber-200 text-[11px] sm:text-xs font-black uppercase tracking-wider ml-auto shadow-md">
                  <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                  <span>{mode === 'factcheck' ? 'COUNTER ANALYSIS' : 'AGENT B • CONTRA'}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-white tracking-tight leading-tight drop-shadow-md">
                  {mode === 'factcheck' ? 'COUNTER' : 'CONTRA STANCE'}
                </h2>

                <p className="text-xs font-mono font-semibold text-amber-300">
                  Temp 0.8 &bull; Adversarial Rebuttals
                </p>
              </motion.div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
