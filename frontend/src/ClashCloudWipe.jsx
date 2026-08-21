import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Shield, Swords, Sparkles } from 'lucide-react';
import logo from './assets/logo.png';

/**
 * Cartoon Puffy Cloud SVG Cluster (Left Bank)
 * Made of layered overlapping circular lobes for the iconic Clash of Clans cumulus silhouette
 */
const LeftCloudCluster = ({ layer = 'front' }) => {
  const isBack = layer === 'back';
  const isMid = layer === 'mid';

  // Gradient IDs
  const gradId = `cloud-grad-left-${layer}`;
  const shadowId = `cloud-shadow-left-${layer}`;

  return (
    <svg
      viewBox="0 0 800 1000"
      preserveAspectRatio="none"
      className="w-full h-full pointer-events-none select-none"
      style={{
        filter: isBack
          ? 'drop-shadow(8px 12px 16px rgba(0,0,0,0.10))'
          : isMid
          ? 'drop-shadow(14px 18px 24px rgba(0,0,0,0.15))'
          : 'drop-shadow(20px 24px 36px rgba(0,0,0,0.22))',
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          {isBack ? (
            <>
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="60%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </>
          ) : isMid ? (
            <>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#ffffff" />
              <stop offset="80%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </>
          )}
        </linearGradient>

        <filter id={shadowId} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="4" dy="10" stdDeviation="8" floodColor="#0f172a" floodOpacity={isBack ? "0.12" : "0.20"} />
        </filter>
      </defs>

      <g fill={`url(#${gradId})`}>
        {/* Solid base rectangle covering left edge */}
        <rect x="0" y="0" width="450" height="1000" />

        {/* Overlapping organic circular cloud lobes protruding into center */}
        {/* Top Tier */}
        <circle cx="420" cy="120" r="140" />
        <circle cx="530" cy="80" r="120" />
        <circle cx="630" cy="160" r="110" />
        <circle cx="540" cy="240" r="150" />

        {/* Middle Tier (Main Central Bulge) */}
        <circle cx="480" cy="380" r="160" />
        <circle cx="620" cy="360" r="140" />
        <circle cx="720" cy="450" r="135" />
        <circle cx="640" cy="560" r="165" />
        <circle cx="500" cy="540" r="150" />

        {/* Bottom Tier */}
        <circle cx="480" cy="700" r="160" />
        <circle cx="620" cy="720" r="140" />
        <circle cx="700" cy="820" r="130" />
        <circle cx="580" cy="910" r="160" />
        <circle cx="440" cy="920" r="150" />
      </g>

      {/* Subtle puffy cartoon highlight arcs */}
      {!isBack && (
        <g fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.6">
          <path d="M 440 30 A 110 110 0 0 1 580 80" />
          <path d="M 530 310 A 130 130 0 0 1 690 380" />
          <path d="M 540 680 A 130 130 0 0 1 680 750" />
        </g>
      )}
    </svg>
  );
};

/**
 * Cartoon Puffy Cloud SVG Cluster (Right Bank)
 */
const RightCloudCluster = ({ layer = 'front' }) => {
  const isBack = layer === 'back';
  const isMid = layer === 'mid';

  const gradId = `cloud-grad-right-${layer}`;

  return (
    <svg
      viewBox="0 0 800 1000"
      preserveAspectRatio="none"
      className="w-full h-full pointer-events-none select-none"
      style={{
        filter: isBack
          ? 'drop-shadow(-8px 12px 16px rgba(0,0,0,0.10))'
          : isMid
          ? 'drop-shadow(-14px 18px 24px rgba(0,0,0,0.15))'
          : 'drop-shadow(-20px 24px 36px rgba(0,0,0,0.22))',
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="100%" y1="0%" x2="0%" y2="100%">
          {isBack ? (
            <>
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="60%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </>
          ) : isMid ? (
            <>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#ffffff" />
              <stop offset="80%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </>
          )}
        </linearGradient>
      </defs>

      <g fill={`url(#${gradId})`}>
        {/* Solid base rectangle covering right edge */}
        <rect x="350" y="0" width="450" height="1000" />

        {/* Overlapping organic circular cloud lobes protruding into center */}
        {/* Top Tier */}
        <circle cx="380" cy="110" r="145" />
        <circle cx="270" cy="90" r="125" />
        <circle cx="160" cy="180" r="115" />
        <circle cx="260" cy="250" r="155" />

        {/* Middle Tier (Main Central Bulge) */}
        <circle cx="320" cy="390" r="165" />
        <circle cx="180" cy="370" r="145" />
        <circle cx="80" cy="460" r="140" />
        <circle cx="160" cy="570" r="170" />
        <circle cx="300" cy="550" r="155" />

        {/* Bottom Tier */}
        <circle cx="320" cy="710" r="165" />
        <circle cx="180" cy="730" r="145" />
        <circle cx="90" cy="830" r="135" />
        <circle cx="220" cy="920" r="165" />
        <circle cx="360" cy="930" r="155" />
      </g>

      {/* Subtle puffy cartoon highlight arcs */}
      {!isBack && (
        <g fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.6">
          <path d="M 360 30 A 110 110 0 0 0 220 80" />
          <path d="M 270 310 A 130 130 0 0 0 110 380" />
          <path d="M 260 680 A 130 130 0 0 0 120 750" />
        </g>
      )}
    </svg>
  );
};

export default function ClashCloudWipe({
  isActive = false,
  topic = '',
  mode = 'debate',
  statusMessage = 'Summoning AI Debaters...',
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
          key="clash-cloud-wipe-overlay"
          initial={{ opacity: reduceMotion ? 0 : 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center overflow-hidden"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Subtle Ambient Sky Tint during collision */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-[#0f172a] backdrop-blur-[2px]"
          />

          {/* ═══════════ DEPTH LAYER 1: BACK CLOUDS (Parallax Slower) ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '-105%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['-105%', '0%', '0%'],
                    y: [0, -6, 0, 4, 0],
                  }
            }
            exit={reduceMotion ? { opacity: 0 } : { x: '-110%' }}
            transition={{
              x: {
                duration: 0.58,
                ease: [0.16, 1, 0.3, 1], // snappy ease-out with soft settle
              },
              y: {
                repeat: Infinity,
                duration: 3.2,
                ease: 'easeInOut',
              },
              exit: {
                duration: 0.55,
                ease: [0.7, 0, 0.84, 0], // ease-in exit acceleration
              },
            }}
            className="absolute top-0 bottom-0 left-0 w-[65vw] h-full z-10"
          >
            <LeftCloudCluster layer="back" />
          </motion.div>

          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '105%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['105%', '0%', '0%'],
                    y: [0, 6, 0, -4, 0],
                  }
            }
            exit={reduceMotion ? { opacity: 0 } : { x: '110%' }}
            transition={{
              x: {
                duration: 0.58,
                ease: [0.16, 1, 0.3, 1],
              },
              y: {
                repeat: Infinity,
                duration: 3.4,
                ease: 'easeInOut',
              },
              exit: {
                duration: 0.55,
                ease: [0.7, 0, 0.84, 0],
              },
            }}
            className="absolute top-0 bottom-0 right-0 w-[65vw] h-full z-10"
          >
            <RightCloudCluster layer="back" />
          </motion.div>

          {/* ═══════════ DEPTH LAYER 2: MID CLOUDS ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '-105%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['-105%', '0%', '0%'],
                    y: [0, 4, 0, -5, 0],
                  }
            }
            exit={reduceMotion ? { opacity: 0 } : { x: '-112%' }}
            transition={{
              x: {
                duration: 0.50,
                ease: [0.16, 1, 0.3, 1],
              },
              y: {
                repeat: Infinity,
                duration: 2.8,
                ease: 'easeInOut',
              },
              exit: {
                duration: 0.52,
                ease: [0.7, 0, 0.84, 0],
              },
            }}
            className="absolute top-0 bottom-0 left-0 w-[65vw] h-full z-20"
          >
            <LeftCloudCluster layer="mid" />
          </motion.div>

          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '105%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['105%', '0%', '0%'],
                    y: [0, -5, 0, 4, 0],
                  }
            }
            exit={reduceMotion ? { opacity: 0 } : { x: '112%' }}
            transition={{
              x: {
                duration: 0.50,
                ease: [0.16, 1, 0.3, 1],
              },
              y: {
                repeat: Infinity,
                duration: 2.9,
                ease: 'easeInOut',
              },
              exit: {
                duration: 0.52,
                ease: [0.7, 0, 0.84, 0],
              },
            }}
            className="absolute top-0 bottom-0 right-0 w-[65vw] h-full z-20"
          >
            <RightCloudCluster layer="mid" />
          </motion.div>

          {/* ═══════════ DEPTH LAYER 3: FRONT HERO CLOUDS ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '-105%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['-105%', '2%', '0%'],
                    y: [0, -3, 0, 3, 0],
                  }
            }
            exit={reduceMotion ? { opacity: 0 } : { x: '-115%' }}
            transition={{
              x: {
                duration: 0.44,
                ease: [0.22, 1, 0.36, 1], // slightly bouncy collision
              },
              y: {
                repeat: Infinity,
                duration: 2.4,
                ease: 'easeInOut',
              },
              exit: {
                duration: 0.50,
                ease: [0.65, 0, 0.85, 0],
              },
            }}
            className="absolute top-0 bottom-0 left-0 w-[66vw] h-full z-30"
          >
            <LeftCloudCluster layer="front" />
          </motion.div>

          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '105%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['105%', '-2%', '0%'],
                    y: [0, 3, 0, -3, 0],
                  }
            }
            exit={reduceMotion ? { opacity: 0 } : { x: '115%' }}
            transition={{
              x: {
                duration: 0.44,
                ease: [0.22, 1, 0.36, 1],
              },
              y: {
                repeat: Infinity,
                duration: 2.5,
                ease: 'easeInOut',
              },
              exit: {
                duration: 0.50,
                ease: [0.65, 0, 0.85, 0],
              },
            }}
            className="absolute top-0 bottom-0 right-0 w-[66vw] h-full z-30"
          >
            <RightCloudCluster layer="front" />
          </motion.div>

          {/* ═══════════ CENTER BATTLE CREST & LOADING DISPLAY (z-40) ═══════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -10 }}
            transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
            className="relative z-40 flex flex-col items-center justify-center text-center px-4 max-w-lg select-none"
          >
            {/* Clash Style Emblem Crest */}
            <div className="relative mb-4 flex items-center justify-center">
              {/* Outer Golden/Indigo Energy Pulse */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500/30 via-amber-500/30 to-indigo-500/30 blur-xl animate-pulse" />
              
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-900/90 border-2 border-amber-400/80 shadow-[0_12px_32px_rgba(0,0,0,0.4)] flex items-center justify-center p-3">
                <img src={logo} className="w-14 h-14 sm:w-16 sm:h-16 object-contain animate-bounce" alt="ArguForge Logo" style={{ animationDuration: '2s' }} />
                
                {/* Floating Clash Sparks */}
                <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black p-1 rounded-full shadow-lg border border-amber-300">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              </div>
            </div>

            {/* Badge Title */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-amber-400/60 shadow-lg mb-2">
              <Swords className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-amber-300 font-sans">
                {mode === 'factcheck' ? 'INITIALIZING FACT AUDIT' : 'FORGING BATTLE ARENA'}
              </span>
            </div>

            {/* Topic preview during transition */}
            {topic && (
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 max-w-sm line-clamp-2 leading-snug drop-shadow-sm font-sans mb-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                "{topic}"
              </h3>
            )}

            {/* Dynamic Status / Loading Dots */}
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-mono tracking-wide">{statusMessage}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
