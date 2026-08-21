import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Shield, Swords, Sparkles, Flame } from 'lucide-react';
import logo from './assets/logo.png';

/**
 * High-Impact Cartoon Cumulus Cloud SVG (Left Bank)
 * Overlapping spherical cloud lobes with heavy drop-shadows & cartoon top rim highlights
 */
const LeftCloudCluster = ({ layer = 'front' }) => {
  const isBack = layer === 'back';
  const isMid = layer === 'mid';

  const gradId = `clash-grad-l-${layer}`;
  const strokeColor = isBack ? '#93c5fd' : isMid ? '#e0e7ff' : '#ffffff';

  return (
    <svg
      viewBox="0 0 900 1000"
      preserveAspectRatio="none"
      className="w-full h-full pointer-events-none select-none"
      style={{
        filter: isBack
          ? 'drop-shadow(10px 14px 20px rgba(15,23,42,0.18))'
          : isMid
          ? 'drop-shadow(18px 22px 32px rgba(15,23,42,0.25))'
          : 'drop-shadow(26px 30px 45px rgba(15,23,42,0.35))',
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="20%" x2="100%" y2="80%">
          {isBack ? (
            <>
              <stop offset="0%" stopColor="#bfdbfe" />
              <stop offset="40%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#64748b" />
            </>
          ) : isMid ? (
            <>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </>
          )}
        </linearGradient>
      </defs>

      <g fill={`url(#${gradId})`}>
        {/* Solid Anchor Block */}
        <rect x="0" y="0" width="480" height="1000" />

        {/* Aggressive overlapping cumulus lobes protruding into center */}
        {/* Top Header Canopy */}
        <circle cx="460" cy="80" r="160" />
        <circle cx="590" cy="50" r="140" />
        <circle cx="720" cy="130" r="130" />
        <circle cx="610" cy="220" r="170" />

        {/* Upper-Mid Power Bulge */}
        <circle cx="520" cy="360" r="180" />
        <circle cx="690" cy="330" r="160" />
        <circle cx="830" cy="430" r="150" />
        
        {/* Core Collision Center */}
        <circle cx="740" cy="540" r="185" />
        <circle cx="560" cy="530" r="170" />

        {/* Lower-Mid Bulge */}
        <circle cx="530" cy="700" r="180" />
        <circle cx="700" cy="690" r="160" />
        <circle cx="810" cy="790" r="145" />

        {/* Bottom Base */}
        <circle cx="640" cy="900" r="180" />
        <circle cx="480" cy="920" r="170" />
      </g>

      {/* Chunky Cartoon Highlights */}
      {!isBack && (
        <g fill="none" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" opacity={isMid ? "0.5" : "0.75"}>
          <path d="M 460 20 A 130 130 0 0 1 630 60" />
          <path d="M 570 270 A 150 150 0 0 1 770 350" />
          <path d="M 590 640 A 150 150 0 0 1 780 710" />
          <path d="M 520 840 A 140 140 0 0 1 680 890" />
        </g>
      )}
    </svg>
  );
};

/**
 * High-Impact Cartoon Cumulus Cloud SVG (Right Bank)
 */
const RightCloudCluster = ({ layer = 'front' }) => {
  const isBack = layer === 'back';
  const isMid = layer === 'mid';

  const gradId = `clash-grad-r-${layer}`;
  const strokeColor = isBack ? '#93c5fd' : isMid ? '#e0e7ff' : '#ffffff';

  return (
    <svg
      viewBox="0 0 900 1000"
      preserveAspectRatio="none"
      className="w-full h-full pointer-events-none select-none"
      style={{
        filter: isBack
          ? 'drop-shadow(-10px 14px 20px rgba(15,23,42,0.18))'
          : isMid
          ? 'drop-shadow(-18px 22px 32px rgba(15,23,42,0.25))'
          : 'drop-shadow(-26px 30px 45px rgba(15,23,42,0.35))',
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="100%" y1="20%" x2="0%" y2="80%">
          {isBack ? (
            <>
              <stop offset="0%" stopColor="#bfdbfe" />
              <stop offset="40%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#64748b" />
            </>
          ) : isMid ? (
            <>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </>
          )}
        </linearGradient>
      </defs>

      <g fill={`url(#${gradId})`}>
        {/* Solid Anchor Block */}
        <rect x="420" y="0" width="480" height="1000" />

        {/* Aggressive overlapping cumulus lobes protruding into center */}
        {/* Top Header Canopy */}
        <circle cx="440" cy="80" r="160" />
        <circle cx="310" cy="50" r="140" />
        <circle cx="180" cy="130" r="130" />
        <circle cx="290" cy="220" r="170" />

        {/* Upper-Mid Power Bulge */}
        <circle cx="380" cy="360" r="180" />
        <circle cx="210" cy="330" r="160" />
        <circle cx="70" cy="430" r="150" />
        
        {/* Core Collision Center */}
        <circle cx="160" cy="540" r="185" />
        <circle cx="340" cy="530" r="170" />

        {/* Lower-Mid Bulge */}
        <circle cx="370" cy="700" r="180" />
        <circle cx="200" cy="690" r="160" />
        <circle cx="90" cy="790" r="145" />

        {/* Bottom Base */}
        <circle cx="260" cy="900" r="180" />
        <circle cx="420" cy="920" r="170" />
      </g>

      {/* Chunky Cartoon Highlights */}
      {!isBack && (
        <g fill="none" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" opacity={isMid ? "0.5" : "0.75"}>
          <path d="M 440 20 A 130 130 0 0 0 270 60" />
          <path d="M 330 270 A 150 150 0 0 0 130 350" />
          <path d="M 310 640 A 150 150 0 0 0 120 710" />
          <path d="M 380 840 A 140 140 0 0 0 220 890" />
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
  const [hasImpacted, setHasImpacted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Trigger visceral micro-impact shake & flash right at collision point (t = 280ms)
  useEffect(() => {
    if (isActive) {
      setHasImpacted(false);
      const timer = setTimeout(() => {
        setHasImpacted(true);
      }, 280);
      return () => clearTimeout(timer);
    } else {
      setHasImpacted(false);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="clash-cloud-wipe-overlay"
          initial={{ opacity: 1 }}
          animate={{
            opacity: 1,
            x: hasImpacted ? [0, -4, 4, -3, 3, -1, 0] : 0,
            y: hasImpacted ? [0, 3, -3, 2, -1, 0] : 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.25 },
            x: { duration: 0.22, ease: 'easeOut' },
            y: { duration: 0.22, ease: 'easeOut' },
          }}
          className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center overflow-hidden"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Dynamic Sky Dimmer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-[#060813] backdrop-blur-[4px]"
          />

          {/* ═══════════ IMPACT LIGHTNING / CLASH SHOCKWAVE FLASH ═══════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              hasImpacted
                ? { opacity: [0, 0.85, 0], scale: [0.9, 1.25, 1.5] }
                : { opacity: 0 }
            }
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="absolute inset-0 z-45 pointer-events-none flex items-center justify-center bg-gradient-to-r from-transparent via-amber-300/30 to-transparent"
          />

          {/* Vertical Clash Seam Lightning Streak */}
          {hasImpacted && (
            <motion.div
              initial={{ scaleY: 0, opacity: 1 }}
              animate={{ scaleY: [0, 1.2, 1], opacity: [1, 0.8, 0] }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-y-0 w-3 bg-gradient-to-b from-amber-300 via-white to-amber-300 blur-[2px] z-45"
            />
          )}

          {/* ═══════════ DEPTH LAYER 1: BACK SMOKE CLOUDS (Fast Follower) ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '-125%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['-125%', '0%', '0%'],
                    y: [0, -8, 0, 6, 0],
                  }
            }
            exit={reduceMotion ? { opacity: 0 } : { x: '-135%' }}
            transition={{
              x: {
                duration: 0.38,
                ease: [0.12, 0.95, 0.2, 1.0], // explosive snap
              },
              y: {
                repeat: Infinity,
                duration: 2.8,
                ease: 'easeInOut',
              },
              exit: {
                duration: 0.36,
                ease: [0.75, 0, 0.2, 1.0], // violent rip-out
              },
            }}
            className="absolute top-0 bottom-0 left-0 w-[68vw] h-full z-10"
          >
            <LeftCloudCluster layer="back" />
          </motion.div>

          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '125%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['125%', '0%', '0%'],
                    y: [0, 8, 0, -6, 0],
                  }
            }
            exit={reduceMotion ? { opacity: 0 } : { x: '135%' }}
            transition={{
              x: {
                duration: 0.38,
                ease: [0.12, 0.95, 0.2, 1.0],
              },
              y: {
                repeat: Infinity,
                duration: 3.0,
                ease: 'easeInOut',
              },
              exit: {
                duration: 0.36,
                ease: [0.75, 0, 0.2, 1.0],
              },
            }}
            className="absolute top-0 bottom-0 right-0 w-[68vw] h-full z-10"
          >
            <RightCloudCluster layer="back" />
          </motion.div>

          {/* ═══════════ DEPTH LAYER 2: MID THUNDER CLOUDS ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '-125%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['-125%', '0%', '0%'],
                    y: [0, 6, 0, -6, 0],
                  }
            }
            exit={reduceMotion ? { opacity: 0 } : { x: '-138%' }}
            transition={{
              x: {
                duration: 0.34,
                ease: [0.10, 0.98, 0.18, 1.0],
              },
              y: {
                repeat: Infinity,
                duration: 2.4,
                ease: 'easeInOut',
              },
              exit: {
                duration: 0.34,
                ease: [0.75, 0, 0.2, 1.0],
              },
            }}
            className="absolute top-0 bottom-0 left-0 w-[68vw] h-full z-20"
          >
            <LeftCloudCluster layer="mid" />
          </motion.div>

          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '125%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['125%', '0%', '0%'],
                    y: [0, -6, 0, 6, 0],
                  }
            }
            exit={reduceMotion ? { opacity: 0 } : { x: '138%' }}
            transition={{
              x: {
                duration: 0.34,
                ease: [0.10, 0.98, 0.18, 1.0],
              },
              y: {
                repeat: Infinity,
                duration: 2.5,
                ease: 'easeInOut',
              },
              exit: {
                duration: 0.34,
                ease: [0.75, 0, 0.2, 1.0],
              },
            }}
            className="absolute top-0 bottom-0 right-0 w-[68vw] h-full z-20"
          >
            <RightCloudCluster layer="mid" />
          </motion.div>

          {/* ═══════════ DEPTH LAYER 3: FRONT HERO BATTLE CLOUDS (Aggressive Smash) ═══════════ */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '-125%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['-125%', '3%', '0%'],
                    y: [0, -4, 0, 4, 0],
                  }
            }
            exit={reduceMotion ? { opacity: 0 } : { x: '-140%' }}
            transition={{
              x: {
                duration: 0.30,
                ease: [0.08, 0.99, 0.16, 1.0], // ultra-aggressive smash
              },
              y: {
                repeat: Infinity,
                duration: 2.0,
                ease: 'easeInOut',
              },
              exit: {
                duration: 0.32,
                ease: [0.8, 0, 0.15, 1.0], // explosive burst out
              },
            }}
            className="absolute top-0 bottom-0 left-0 w-[70vw] h-full z-30"
          >
            <LeftCloudCluster layer="front" />
          </motion.div>

          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { x: '125%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    x: ['125%', '-3%', '0%'],
                    y: [0, 4, 0, -4, 0],
                  }
            }
            exit={reduceMotion ? { opacity: 0 } : { x: '140%' }}
            transition={{
              x: {
                duration: 0.30,
                ease: [0.08, 0.99, 0.16, 1.0],
              },
              y: {
                repeat: Infinity,
                duration: 2.1,
                ease: 'easeInOut',
              },
              exit: {
                duration: 0.32,
                ease: [0.8, 0, 0.15, 1.0],
              },
            }}
            className="absolute top-0 bottom-0 right-0 w-[70vw] h-full z-30"
          >
            <RightCloudCluster layer="front" />
          </motion.div>

          {/* ═══════════ SLAM IMPACT CREST & BATTLE BANNER (z-50) ═══════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 1.8, rotate: -4 }}
            animate={{
              opacity: 1,
              scale: [1.8, 0.92, 1.0],
              rotate: [-4, 2, 0],
            }}
            exit={{
              opacity: 0,
              scale: 1.25,
              filter: 'blur(8px)',
              transition: { duration: 0.22, ease: 'easeIn' }
            }}
            transition={{
              duration: 0.28,
              delay: 0.12,
              ease: [0.15, 1.15, 0.3, 1.0], // heavy impact spring
            }}
            className="relative z-50 flex flex-col items-center justify-center text-center px-4 max-w-md select-none"
          >
            {/* Supercell Clash Crest */}
            <div className="relative mb-3 flex items-center justify-center">
              {/* Explosive Impact Glow Ring */}
              <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-amber-500/50 via-indigo-500/50 to-amber-500/50 blur-2xl animate-pulse" />
              
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0b0f24] border-2 border-amber-400 shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex items-center justify-center p-3">
                <img
                  src={logo}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]"
                  alt="ArguForge Logo"
                />
                
                {/* Clash Sparks */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-amber-600 text-black p-1.5 rounded-full shadow-xl border border-amber-200 animate-spin" style={{ animationDuration: '3s' }}>
                  <Flame className="w-3.5 h-3.5 fill-black text-black" />
                </div>
              </div>
            </div>

            {/* Battle Ready Pill */}
            <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-[#0b0f24]/95 border border-amber-400/80 shadow-2xl mb-2">
              <Swords className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="text-xs font-black uppercase tracking-widest text-amber-300 font-sans">
                {mode === 'factcheck' ? 'FACT AUDIT INITIALIZING' : 'BATTLE ARENA FORGING'}
              </span>
            </div>

            {/* Dynamic Status / Progress */}
            <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-5 py-2 rounded-full border border-slate-200 dark:border-white/15 shadow-xl">
              <div className="flex space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" style={{ animationDuration: '1s' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              </div>
              <span className="font-mono uppercase tracking-wider text-[11px] sm:text-xs text-slate-900 dark:text-white">
                {statusMessage}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
