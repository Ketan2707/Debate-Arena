import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Shield, Swords, Sparkles, Flame, Trophy, Cpu } from 'lucide-react';
import logo from './assets/logo.png';

/**
 * ⚔️ THEME-HARMONIZED VERSUS BATTLE TRANSITION
 * - Seamlessly styled to match the ArguForge AI Sky/Clouds (Light Mode) or Cosmic Starry Arena (Dark Mode)
 * - 35° Dynamic diagonal split screen with frosted glassmorphism & dual-agent energy
 * - Agent A: Cobalt / Cerulean Blue Affirmative Wing with electric pulses
 * - Agent B: Sunlit Amber / Gold Negative Wing with glowing embers
 * - Frosted Glass "VS" Emblem with ArguForge Logo & Contested Motion Banner
 * - High-speed entrance (0.28s) & explosive blade-slice reveal
 */
export default function BattleTransition({
  isActive = false,
  topic = '',
  mode = 'debate',
  statusMessage = 'Summoning AI Debaters...',
  darkMode = false,
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

  // Micro impact timing
  useEffect(() => {
    if (isActive) {
      setHasClashed(false);
      const timer = setTimeout(() => setHasClashed(true), 200);
      return () => clearTimeout(timer);
    } else {
      setHasClashed(false);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="theme-battle-transition-overlay"
          initial={{ opacity: 1 }}
          animate={{
            opacity: 1,
            x: hasClashed ? [0, -4, 4, -2, 2, 0] : 0,
            y: hasClashed ? [0, 3, -3, 2, -1, 0] : 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.25 },
            x: { duration: 0.22, ease: 'easeOut' },
            y: { duration: 0.22, ease: 'easeOut' },
          }}
          className={`fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center overflow-hidden select-none ${
            darkMode 
              ? 'bg-[#060813]' 
              : 'bg-gradient-to-b from-[#3876ba] via-[#5a96d8] to-[#8cbfe8]'
          }`}
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Subtle Ambient Sky Mist / Star grid */}
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:28px_28px]" />

          {/* ═══════════ LEFT/TOP-LEFT SHARD: AGENT A (AFFIRMATIVE) ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '-120%', y: '-35%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['-120%', '0%'],
                    y: ['-35%', '0%'],
                  }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    x: '-130%',
                    y: '-40%',
                    transition: { duration: 0.30, ease: [0.75, 0, 0.2, 1] },
                  }
            }
            transition={{
              duration: 0.26,
              ease: [0.08, 0.96, 0.16, 1.0],
            }}
            className="absolute inset-0 z-10 overflow-hidden"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 42% 100%, 0 100%)',
            }}
          >
            {/* Themed Affirmative Wing */}
            <div
              className={`absolute inset-0 border-r-4 shadow-2xl ${
                darkMode
                  ? 'bg-gradient-to-br from-[#1e1b4b]/95 via-[#0f172a]/95 to-[#020617]/95 border-indigo-500/80 shadow-[0_0_60px_rgba(99,102,241,0.4)]'
                  : 'bg-gradient-to-br from-[#1e3a8a]/90 via-[#2563eb]/85 to-[#3b82f6]/80 border-white/60 shadow-[0_0_60px_rgba(37,99,235,0.4)] backdrop-blur-xl'
              }`}
            >
              {/* Electric Aura / Sky Highlight */}
              <div className={`absolute -top-16 -left-16 w-96 h-96 rounded-full blur-3xl animate-pulse ${
                darkMode ? 'bg-indigo-600/30' : 'bg-white/25'
              }`} />

              {/* Left Agent Branding Card */}
              <div className="absolute top-1/4 left-6 sm:left-14 max-w-xs sm:max-w-md space-y-3">
                <div className={`inline-flex items-center space-x-2 px-3.5 py-1 rounded-full shadow-lg border backdrop-blur-md ${
                  darkMode 
                    ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300' 
                    : 'bg-white/90 border-white text-indigo-900 shadow-md'
                }`}>
                  <Zap className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest font-sans">
                    {mode === 'factcheck' ? 'EVIDENCE AUDIT' : 'AGENT A • AFFIRMATIVE'}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  {mode === 'factcheck' ? 'SUPPORT' : 'PRO POSITION'}
                </h2>

                <div className={`text-xs font-sans font-medium px-3 py-1.5 rounded-xl border backdrop-blur-md inline-block ${
                  darkMode
                    ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
                    : 'bg-white/20 border-white/40 text-blue-50 shadow-sm'
                }`}>
                  Temp: 0.6 &bull; Logical Axioms &bull; Evidence Weight
                </div>
              </div>

              {/* Slash Energy Streak */}
              <div className="absolute top-0 right-0 bottom-0 w-2.5 bg-gradient-to-b from-white via-cyan-200 to-indigo-400 blur-[1px] shadow-[0_0_25px_#ffffff]" />
            </div>
          </motion.div>

          {/* ═══════════ RIGHT/BOTTOM-RIGHT SHARD: AGENT B (NEGATIVE) ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '120%', y: '35%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['120%', '0%'],
                    y: ['35%', '0%'],
                  }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    x: '130%',
                    y: '40%',
                    transition: { duration: 0.30, ease: [0.75, 0, 0.2, 1] },
                  }
            }
            transition={{
              duration: 0.26,
              ease: [0.08, 0.96, 0.16, 1.0],
            }}
            className="absolute inset-0 z-10 overflow-hidden"
            style={{
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 58% 0)',
            }}
          >
            {/* Themed Negative Wing */}
            <div
              className={`absolute inset-0 border-l-4 shadow-2xl ${
                darkMode
                  ? 'bg-gradient-to-tl from-[#451a03]/95 via-[#1c1917]/95 to-[#0c0a09]/95 border-amber-500/80 shadow-[0_0_60px_rgba(245,158,11,0.4)]'
                  : 'bg-gradient-to-tl from-[#b45309]/90 via-[#d97706]/85 to-[#f59e0b]/80 border-white/60 shadow-[0_0_60px_rgba(245,158,11,0.4)] backdrop-blur-xl'
              }`}
            >
              {/* Solar Flare / Amber Aura */}
              <div className={`absolute -bottom-16 -right-16 w-96 h-96 rounded-full blur-3xl animate-pulse ${
                darkMode ? 'bg-amber-600/30' : 'bg-amber-200/30'
              }`} />

              {/* Right Agent Branding Card */}
              <div className="absolute bottom-1/4 right-6 sm:right-14 max-w-xs sm:max-w-md text-right space-y-3">
                <div className={`inline-flex items-center space-x-2 px-3.5 py-1 rounded-full shadow-lg border backdrop-blur-md ml-auto ${
                  darkMode 
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' 
                    : 'bg-white/90 border-white text-amber-900 shadow-md'
                }`}>
                  <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest font-sans">
                    {mode === 'factcheck' ? 'COUNTER ANALYSIS' : 'AGENT B • NEGATIVE'}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  {mode === 'factcheck' ? 'COUNTER' : 'CONTRA STANCE'}
                </h2>

                <div className={`text-xs font-sans font-medium px-3 py-1.5 rounded-xl border backdrop-blur-md inline-block ${
                  darkMode
                    ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                    : 'bg-white/20 border-white/40 text-amber-50 shadow-sm'
                }`}>
                  Temp: 0.8 &bull; Adversarial Rebuttals &bull; Bias Audit
                </div>
              </div>

              {/* Slash Energy Streak */}
              <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-gradient-to-b from-white via-amber-200 to-amber-500 blur-[1px] shadow-[0_0_25px_#ffffff]" />
            </div>
          </motion.div>

          {/* ═══════════ IMPACT SHOCKWAVE & DIAGONAL SLICE LINE ═══════════ */}
          {hasClashed && (
            <motion.div
              initial={{ opacity: 0.8, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-r from-blue-400/40 via-white/80 to-amber-400/40"
            />
          )}

          {/* Diagonal Clash Blade Beam */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={
              hasClashed
                ? { scaleX: [0, 1.15, 1], opacity: [0, 1, 0.9] }
                : { scaleX: 0, opacity: 0 }
            }
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute inset-0 z-25 pointer-events-none flex items-center justify-center"
          >
            <div
              className="w-[140vw] h-2 bg-gradient-to-r from-blue-200 via-white to-amber-200 shadow-[0_0_35px_#ffffff] transform -rotate-[35deg]"
            />
          </motion.div>

          {/* ═══════════ CENTER "VS" EMBLEM & THEMED CARD (z-40) ═══════════ */}
          <motion.div
            initial={{ scale: 2.0, opacity: 0, rotate: -6 }}
            animate={{
              scale: [2.0, 0.92, 1.0],
              opacity: 1,
              rotate: [-6, 2, 0],
            }}
            exit={{
              scale: 1.3,
              opacity: 0,
              filter: 'blur(8px)',
              transition: { duration: 0.2, ease: 'easeIn' },
            }}
            transition={{
              duration: 0.28,
              delay: 0.12,
              ease: [0.15, 1.2, 0.25, 1.0],
            }}
            className="relative z-40 flex flex-col items-center justify-center text-center px-4 max-w-lg select-none"
          >
            {/* Themed "VS" Glass Badge */}
            <div className="relative mb-3 flex items-center justify-center">
              {/* Outer Glow Halo */}
              <div className={`absolute -inset-8 rounded-full blur-3xl animate-pulse ${
                darkMode ? 'bg-gradient-to-r from-indigo-500/60 via-amber-500/60 to-indigo-500/60' : 'bg-gradient-to-r from-blue-400/50 via-white/80 to-amber-400/50'
              }`} />

              {/* Frosted Hex Badge */}
              <div className={`relative w-22 h-22 sm:w-26 sm:h-26 rounded-3xl border-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl flex flex-col items-center justify-center p-2.5 ${
                darkMode
                  ? 'bg-[#090d21]/95 border-amber-400/80 text-white'
                  : 'bg-white/95 border-white text-slate-900 shadow-2xl'
              }`}>
                <img
                  src={logo}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md mb-0.5"
                  alt="ArguForge AI"
                />
                <span className={`text-lg sm:text-xl font-black italic tracking-tighter font-sans leading-none ${
                  darkMode 
                    ? 'text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-white to-amber-500' 
                    : 'text-indigo-950 font-black'
                }`}>
                  VS
                </span>

                {/* Floating Corner Sparks */}
                <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white p-1 rounded-full shadow-lg border border-amber-200">
                  <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div className="absolute -bottom-1.5 -left-1.5 bg-blue-600 text-white p-1 rounded-full shadow-lg border border-blue-200">
                  <Zap className="w-3 h-3 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Contested Motion Card (Themed & Crystal Clear) */}
            {topic && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.22 }}
                className={`w-full max-w-sm sm:max-w-md rounded-2xl p-3.5 sm:p-4 shadow-2xl mb-3 border backdrop-blur-2xl ${
                  darkMode
                    ? 'bg-slate-900/95 border-white/20 text-white'
                    : 'bg-white/95 border-white/80 text-slate-900 shadow-[0_16px_36px_rgba(0,0,0,0.18)]'
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-amber-400 flex items-center justify-center space-x-1.5 mb-1">
                  <Swords className="w-3 h-3" />
                  <span>CONTESTED MOTION</span>
                </div>
                <h3 className="text-xs sm:text-sm font-serif font-extrabold line-clamp-2 leading-snug">
                  "{topic}"
                </h3>
              </motion.div>
            )}

            {/* Live Orchestrator Status Pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.28, duration: 0.2 }}
              className={`inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full shadow-xl border backdrop-blur-xl ${
                darkMode
                  ? 'bg-[#060813]/90 border-indigo-400/40 text-slate-200'
                  : 'bg-white/95 border-white text-slate-800 shadow-lg'
              }`}
            >
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" style={{ animationDuration: '1s' }} />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider">
                {statusMessage}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
