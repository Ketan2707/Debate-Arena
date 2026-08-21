import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Cpu, Orbit, Zap } from 'lucide-react';
import logo from './assets/logo.png';

/**
 * 🌟 CONCEPT 1: THE GLASS WARP & NEURAL GYROSCOPE (Apple / Linear Style)
 * - Frosted ultra-glassmorphism depth-of-field overlay
 * - 3D Nested Concentric Gyroscope Rings spinning on multi-axis orbits
 * - Radial neural warp particle rays pulling toward center
 * - Equalizer audio/neural frequency waves
 * - Smooth luxury expansion reveal
 */
export default function BattleTransition({
  isActive = false,
  topic = '',
  mode = 'debate',
  statusMessage = 'Harmonizing Neural Debate Arena...',
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
          key="neural-gyroscope-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center overflow-hidden select-none"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* ═══════════ 1. FROSTED GLASS BACKGROUND ═══════════ */}
          <div
            className={`absolute inset-0 backdrop-blur-2xl transition-colors duration-500 ${
              darkMode
                ? 'bg-[#060813]/85'
                : 'bg-gradient-to-b from-[#3876ba]/70 via-[#5a96d8]/70 to-[#8cbfe8]/70 bg-white/30'
            }`}
          />

          {/* Ambient Glow Orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-500/25 via-blue-400/20 to-amber-400/20 blur-[100px] pointer-events-none animate-pulse" />

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
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 1.8,
              opacity: 0,
              filter: 'blur(12px)',
              transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
                className="absolute inset-0 rounded-full border border-indigo-400/40 dark:border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                style={{ borderDasharray: '6 4' }}
              >
                {/* Orbiting Spark 1 */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]" />
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
                className="absolute inset-3 rounded-full border border-amber-400/50 dark:border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
              >
                {/* Orbiting Spark 2 */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
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
                className="absolute inset-7 rounded-full border-2 border-dashed border-white/60 dark:border-white/40"
              />

              {/* Central Glowing Core with ArguForge Logo */}
              <motion.div
                animate={{
                  scale: [1, 1.06, 1],
                }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-3 flex items-center justify-center border shadow-2xl backdrop-blur-xl ${
                  darkMode
                    ? 'bg-slate-900/90 border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                    : 'bg-white/95 border-white shadow-[0_12px_36px_rgba(56,118,186,0.3)]'
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
              <div className={`inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest border backdrop-blur-xl shadow-md ${
                darkMode
                  ? 'bg-indigo-950/70 border-indigo-500/30 text-indigo-300'
                  : 'bg-white/90 border-white text-indigo-950 shadow-sm'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '4s' }} />
                <span>{mode === 'factcheck' ? 'FACT AUDIT MATRIX' : 'NEURAL DEBATE ARENA'}</span>
              </div>

              {/* Contested Topic Glass Panel */}
              {topic && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border shadow-xl backdrop-blur-2xl ${
                    darkMode
                      ? 'bg-slate-900/80 border-white/10 text-white'
                      : 'bg-white/90 border-white text-slate-900 shadow-[0_16px_40px_rgba(0,0,0,0.08)]'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                    Contested Motion
                  </span>
                  <h3 className="text-sm sm:text-base font-serif font-bold line-clamp-2 leading-relaxed">
                    "{topic}"
                  </h3>
                </div>
              )}

              {/* Neural Frequency Equalizer & Live Status */}
              <div
                className={`inline-flex items-center space-x-3 px-5 py-2 rounded-full border shadow-lg backdrop-blur-xl ${
                  darkMode
                    ? 'bg-slate-900/90 border-white/10 text-slate-200'
                    : 'bg-white/95 border-white text-slate-800'
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

                <span className="text-xs font-mono font-medium tracking-wide">
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
