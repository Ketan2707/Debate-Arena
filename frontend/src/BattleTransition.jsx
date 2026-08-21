import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Cpu, Orbit, Zap } from 'lucide-react';
import logo from './assets/logo.png';

/**
 * 🌟 FINAL TRANSITION — CONCEPT 1: THE GLASS WARP & NEURAL GYROSCOPE (Apple / Linear Style)
 * - Heavy frosted glass depth-of-field overlay (No background bleed-through)
 * - 3D Nested Concentric Gyroscope Rings spinning on multi-axis orbits
 * - Radial neural warp particle rays pulling inward toward center
 * - Neural frequency equalizer audio bars
 * - High-contrast contested motion card (Theme-adaptive)
 * - Silky smooth luxury expansion dissolve reveal
 */
export default function BattleTransition({
  isActive = false,
  topic = '',
  mode = 'debate',
  statusMessage = 'Synthesizing Dual-Agent Stances...',
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
          key="neural-gyroscope-transition-final"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center overflow-hidden select-none"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* ═══════════ 1. HEAVY FROSTED BACKDROP (ZERO BLEED) ═══════════ */}
          <div
            className={`absolute inset-0 backdrop-blur-3xl transition-colors duration-500 ${
              darkMode
                ? 'bg-[#060813]/95'
                : 'bg-gradient-to-b from-[#2a62a0]/95 via-[#4a85c8]/95 to-[#7cb0dc]/95'
            }`}
          />

          {/* Ambient Glow Orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-indigo-500/30 via-blue-400/25 to-amber-400/25 blur-[120px] pointer-events-none animate-pulse" />

          {/* ═══════════ 2. RADIAL NEURAL WARP RAYS ═══════════ */}
          {!reduceMotion && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={`ray-${i}`}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{
                    scaleY: [0.2, 1.4, 0.4],
                    opacity: [0.1, 0.45, 0.1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2 + (i % 4) * 0.3,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                  className={`absolute w-[1.5px] h-[45vh] origin-bottom ${
                    i % 2 === 0
                      ? 'bg-gradient-to-t from-indigo-400/80 via-blue-300/40 to-transparent'
                      : 'bg-gradient-to-t from-amber-400/80 via-amber-200/40 to-transparent'
                  }`}
                  style={{
                    transform: `rotate(${i * 22.5}deg) translateY(-20px)`,
                  }}
                />
              ))}
            </div>
          )}

          {/* ═══════════ 3. 3D GYROSCOPE ORBITAL RINGS & CORE ═══════════ */}
          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 1.75,
              opacity: 0,
              filter: 'blur(12px)',
              transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
            }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-lg"
          >
            {/* The Gyroscope Mechanism */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 mb-6 flex items-center justify-center">
              
              {/* Outer Ring 1 (Cobalt Indigo Orbit) */}
              <motion.div
                animate={
                  reduceMotion
                    ? {}
                    : {
                        rotate: 360,
                        rotateX: [0, 45, 0],
                      }
                }
                transition={{
                  rotate: { repeat: Infinity, duration: 8, ease: 'linear' },
                  rotateX: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                }}
                className="absolute inset-0 rounded-full border-2 border-indigo-400/50 shadow-[0_0_24px_rgba(99,102,241,0.3)]"
                style={{ borderDasharray: '6 4' }}
              >
                {/* Orbiting Spark 1 */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-300 shadow-[0_0_12px_#818cf8]" />
              </motion.div>

              {/* Middle Ring 2 (Amber Gold Counter-Orbit) */}
              <motion.div
                animate={
                  reduceMotion
                    ? {}
                    : {
                        rotate: -360,
                        rotateY: [0, 55, 0],
                      }
                }
                transition={{
                  rotate: { repeat: Infinity, duration: 6, ease: 'linear' },
                  rotateY: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' },
                }}
                className="absolute inset-3 rounded-full border-2 border-amber-400/60 shadow-[0_0_24px_rgba(245,158,11,0.3)]"
              >
                {/* Orbiting Spark 2 */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_12px_#fbbf24]" />
              </motion.div>

              {/* Inner Ring 3 (High-Speed Gyro) */}
              <motion.div
                animate={
                  reduceMotion
                    ? {}
                    : {
                        rotate: 360,
                        scale: [1, 1.05, 1],
                      }
                }
                transition={{
                  rotate: { repeat: Infinity, duration: 4, ease: 'linear' },
                  scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                }}
                className="absolute inset-7 rounded-full border-2 border-dashed border-white/70"
              />

              {/* Central Glowing Core with ArguForge Logo */}
              <motion.div
                animate={{
                  scale: [1, 1.06, 1],
                }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-3 flex items-center justify-center border-2 shadow-2xl backdrop-blur-2xl ${
                  darkMode
                    ? 'bg-[#090d24] border-white/20 shadow-[0_0_35px_rgba(99,102,241,0.4)]'
                    : 'bg-white/95 border-white shadow-[0_16px_40px_rgba(30,58,138,0.35)]'
                }`}
              >
                <img
                  src={logo}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md"
                  alt="ArguForge AI Logo"
                />
              </motion.div>
            </div>

            {/* ═══════════ 4. HUD STATUS & TOPIC CARD ═══════════ */}
            <div className="w-full space-y-3.5">
              
              {/* Minimalist Top Badge */}
              <div className={`inline-flex items-center space-x-2 px-4 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest border backdrop-blur-xl shadow-lg ${
                darkMode
                  ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                  : 'bg-white/95 border-white text-indigo-950 shadow-md'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '4s' }} />
                <span>{mode === 'factcheck' ? 'FACT AUDIT MATRIX' : 'NEURAL DEBATE SYNTHESIS'}</span>
              </div>

              {/* Contested Topic Glass Panel (High Contrast & Crisp) */}
              {topic && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border-2 shadow-2xl backdrop-blur-2xl ${
                    darkMode
                      ? 'bg-[#090d24]/95 border-white/20 text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)]'
                      : 'bg-white/95 border-white text-slate-900 shadow-[0_20px_45px_rgba(0,0,0,0.15)]'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${
                    darkMode ? 'text-indigo-300' : 'text-indigo-600'
                  }`}>
                    Contested Motion
                  </span>
                  <h3 className="text-sm sm:text-base font-serif font-extrabold line-clamp-2 leading-relaxed">
                    "{topic}"
                  </h3>
                </div>
              )}

              {/* Neural Frequency Equalizer & Live Status */}
              <div
                className={`inline-flex items-center space-x-3 px-5 py-2 rounded-full border-2 shadow-xl backdrop-blur-xl ${
                  darkMode
                    ? 'bg-[#090d24]/95 border-amber-400/50 text-amber-300'
                    : 'bg-white/95 border-white text-slate-900 shadow-md'
                }`}
              >
                {/* 5 Equalizer Frequency Bars */}
                <div className="flex items-center space-x-1 h-3.5">
                  {[0.4, 0.9, 0.6, 1.0, 0.5].map((h, idx) => (
                    <motion.span
                      key={idx}
                      animate={{
                        scaleY: [h * 0.3, h, h * 0.4],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8 + idx * 0.15,
                        ease: 'easeInOut',
                      }}
                      className={`w-1 rounded-full origin-bottom ${
                        idx % 2 === 0 ? 'bg-indigo-500' : 'bg-amber-400'
                      }`}
                      style={{ height: '100%' }}
                    />
                  ))}
                </div>

                <span className="text-xs font-mono font-bold tracking-wide">
                  {statusMessage}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
