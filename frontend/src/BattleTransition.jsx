import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Shield, Swords, Sparkles, Flame, Trophy, Cpu } from 'lucide-react';
import logo from './assets/logo.png';

/**
 * ⚔️ EPIC VERSUS BATTLE TRANSITION (Esports / Fighting Game Style)
 * - Dynamic 35° diagonal split screen
 * - Agent A (Electric Indigo / Affirmative) slams from Top-Left
 * - Agent B (Blazing Amber / Negative) slams from Bottom-Right
 * - Massive Metallic "VS" Emblem with shockwave flash & clash sparks
 * - Dynamic async hold & explosive shatter blade exit
 */
export default function BattleTransition({
  isActive = false,
  topic = '',
  mode = 'debate',
  statusMessage = 'Summoning AI Debaters...',
}) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hasClashed, setHasClashed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Clash impact trigger at t = 220ms
  useEffect(() => {
    if (isActive) {
      setHasClashed(false);
      const timer = setTimeout(() => setHasClashed(true), 220);
      return () => clearTimeout(timer);
    } else {
      setHasClashed(false);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="battle-transition-overlay"
          initial={{ opacity: 1 }}
          animate={{
            opacity: 1,
            x: hasClashed ? [0, -6, 6, -4, 4, -1, 0] : 0,
            y: hasClashed ? [0, 4, -4, 3, -2, 0] : 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.25 },
            x: { duration: 0.25, ease: 'easeOut' },
            y: { duration: 0.25, ease: 'easeOut' },
          }}
          className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center overflow-hidden bg-[#030612] select-none"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* ═══════════ LEFT/TOP-LEFT SHARD: AGENT A (AFFIRMATIVE) ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '-120%', y: '-40%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['-120%', '0%'],
                    y: ['-40%', '0%'],
                  }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    x: '-130%',
                    y: '-45%',
                    transition: { duration: 0.32, ease: [0.75, 0, 0.2, 1] },
                  }
            }
            transition={{
              duration: 0.26,
              ease: [0.08, 0.95, 0.18, 1.0],
            }}
            className="absolute inset-0 z-10 overflow-hidden"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 42% 100%, 0 100%)',
            }}
          >
            {/* Deep Indigo/Cyan Energy Field */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#020617] border-r-4 border-indigo-500/80 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
              {/* Electric Background Grid Lines */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />

              {/* Glowing Aura Ring */}
              <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-indigo-600/30 blur-3xl animate-pulse" />

              {/* Left Agent Branding */}
              <div className="absolute top-1/4 left-6 sm:left-14 max-w-xs sm:max-w-sm space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/50 shadow-lg">
                  <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-indigo-300">
                    {mode === 'factcheck' ? 'FOR EVIDENCE' : 'AGENT A • AFFIRMATIVE'}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 drop-shadow-[0_4px_16px_rgba(99,102,241,0.6)]">
                  {mode === 'factcheck' ? 'SUPPORT' : 'PRO POSITION'}
                </h2>
                <p className="text-xs font-mono text-indigo-300/80 hidden sm:block">
                  Temp: 0.6 &bull; Strict Logical Axioms &bull; Evidence Weight
                </p>
              </div>

              {/* Slash Energy Blade Streak */}
              <div className="absolute top-0 right-0 bottom-0 w-2 bg-gradient-to-b from-indigo-300 via-cyan-200 to-indigo-500 blur-[1px] shadow-[0_0_20px_#818cf8]" />
            </div>
          </motion.div>

          {/* ═══════════ RIGHT/BOTTOM-RIGHT SHARD: AGENT B (NEGATIVE) ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '120%', y: '40%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['120%', '0%'],
                    y: ['40%', '0%'],
                  }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    x: '130%',
                    y: '45%',
                    transition: { duration: 0.32, ease: [0.75, 0, 0.2, 1] },
                  }
            }
            transition={{
              duration: 0.26,
              ease: [0.08, 0.95, 0.18, 1.0],
            }}
            className="absolute inset-0 z-10 overflow-hidden"
            style={{
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 58% 0)',
            }}
          >
            {/* Blazing Amber/Crimson Energy Field */}
            <div className="absolute inset-0 bg-gradient-to-tl from-[#451a03] via-[#1c1917] to-[#0c0a09] border-l-4 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.5)]">
              {/* Embers Background Pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

              {/* Glowing Aura Ring */}
              <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-amber-600/30 blur-3xl animate-pulse" />

              {/* Right Agent Branding */}
              <div className="absolute bottom-1/4 right-6 sm:right-14 max-w-xs sm:max-w-sm text-right space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-500/50 shadow-lg ml-auto">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-300">
                    {mode === 'factcheck' ? 'AGAINST EVIDENCE' : 'AGENT B • NEGATIVE'}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-l from-white via-amber-200 to-amber-400 drop-shadow-[0_4px_16px_rgba(245,158,11,0.6)]">
                  {mode === 'factcheck' ? 'COUNTER' : 'CONTRA STANCE'}
                </h2>
                <p className="text-xs font-mono text-amber-300/80 hidden sm:block">
                  Temp: 0.8 &bull; Adversarial Rebuttals &bull; Bias Audit
                </p>
              </div>

              {/* Slash Energy Blade Streak */}
              <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-500 blur-[1px] shadow-[0_0_20px_#fbbf24]" />
            </div>
          </motion.div>

          {/* ═══════════ IMPACT FLASH / CLASH SHOCKWAVE ═══════════ */}
          {hasClashed && (
            <motion.div
              initial={{ opacity: 1, scale: 0.7 }}
              animate={{ opacity: 0, scale: 1.6 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-r from-indigo-500/40 via-white/80 to-amber-500/40"
            />
          )}

          {/* Diagonal Clash Lightning Slice Line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={
              hasClashed
                ? { scaleX: [0, 1.2, 1], opacity: [0, 1, 0.8] }
                : { scaleX: 0, opacity: 0 }
            }
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 z-25 pointer-events-none flex items-center justify-center"
          >
            <div
              className="w-[140vw] h-1.5 bg-gradient-to-r from-indigo-400 via-white to-amber-400 shadow-[0_0_30px_#ffffff] transform -rotate-[35deg]"
            />
          </motion.div>

          {/* ═══════════ CENTER SLAM: "VS" EMBLEM & BATTLE DATA (z-40) ═══════════ */}
          <motion.div
            initial={{ scale: 2.2, opacity: 0, rotate: -8 }}
            animate={{
              scale: [2.2, 0.9, 1.0],
              opacity: 1,
              rotate: [-8, 2, 0],
            }}
            exit={{
              scale: 1.4,
              opacity: 0,
              filter: 'blur(10px)',
              transition: { duration: 0.22, ease: 'easeIn' },
            }}
            transition={{
              duration: 0.30,
              delay: 0.15,
              ease: [0.15, 1.25, 0.3, 1.0],
            }}
            className="relative z-40 flex flex-col items-center justify-center text-center px-4 max-w-lg select-none"
          >
            {/* The Iconic Metallic "VS" Badge */}
            <div className="relative mb-3 flex items-center justify-center">
              {/* Radiant Clash Glow */}
              <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-indigo-500/60 via-amber-500/60 to-indigo-500/60 blur-3xl animate-pulse" />

              {/* Chrome Hexagonal Emblem */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#090d21] border-2 border-amber-400/90 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center p-2 transform hover:scale-105 transition-transform">
                <img
                  src={logo}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)] mb-0.5"
                  alt="Logo"
                />
                <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-white to-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)] font-sans leading-none">
                  VS
                </span>

                {/* Floating Corner Energy Sparks */}
                <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-amber-400 to-amber-600 text-black p-1 rounded-full shadow-lg border border-amber-200">
                  <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div className="absolute -bottom-1.5 -left-1.5 bg-gradient-to-br from-indigo-400 to-indigo-600 text-white p-1 rounded-full shadow-lg border border-indigo-200">
                  <Zap className="w-3 h-3 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Central Motion Banner */}
            {topic && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.25 }}
                className="w-full max-w-sm sm:max-w-md bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-3 sm:p-4 shadow-2xl mb-3"
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center justify-center space-x-1.5 mb-1">
                  <Swords className="w-3 h-3" />
                  <span>CONTESTED MOTION</span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white line-clamp-2 leading-snug drop-shadow-sm font-sans">
                  "{topic}"
                </h3>
              </motion.div>
            )}

            {/* Live Orchestrator Status Pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.2 }}
              className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#060813]/90 border border-indigo-400/50 shadow-xl"
            >
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" style={{ animationDuration: '1s' }} />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                {statusMessage}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
