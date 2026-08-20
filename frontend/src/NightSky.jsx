import React, { useEffect, useRef } from 'react';

/**
 * NightSky – An ultra-smooth, atmospheric animated night sky canvas.
 * Features:
 *  - Deep midnight gradient with soft cosmic nebula dust (indigo & amber hints)
 *  - Multi-depth twinkling stars with realistic luminance variation
 *  - Occasional shooting stars (meteors) trailing across the sky
 *  - Ultra-performant 60fps canvas loop with ResizeObserver
 */
export default function NightSky({
  className = '',
  starCount = 180,
  speed = 0.5,
  enableShootingStars = true,
  paused = false,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId;
    let isRunning = true;

    // Stars array
    let stars = [];
    let shootingStars = [];

    // Color palettes for stars
    const starColors = [
      '#ffffff',
      '#e0e7ff', // soft indigo
      '#fef3c7', // warm amber tint
      '#bae6fd', // icy blue
      '#f5d0fe', // violet
    ];

    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() < 0.85 ? Math.random() * 1.2 + 0.3 : Math.random() * 1.8 + 1.2,
          baseAlpha: Math.random() * 0.6 + 0.2,
          alpha: Math.random() * 0.8 + 0.2,
          twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
          color: starColors[Math.floor(Math.random() * starColors.length)],
          vx: (Math.random() - 0.5) * 0.05 * speed,
          vy: (Math.random() - 0.5) * 0.03 * speed,
        });
      }
    };

    const spawnShootingStar = () => {
      if (!enableShootingStars || paused) return;
      const startX = Math.random() * (width * 0.8) + width * 0.1;
      const startY = Math.random() * (height * 0.4);
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3; // roughly 45 degrees down-right
      const velocity = Math.random() * 6 + 7;
      const length = Math.random() * 80 + 60;

      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        length,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.012,
        color: Math.random() < 0.5 ? '#ffffff' : '#c7d2fe',
      });
    };

    let lastSpawnTime = performance.now();
    let nextSpawnDelay = Math.random() * 3000 + 3500;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const rect = canvas.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      initStars();
      renderFrame(performance.now());
    };

    const renderFrame = (now) => {
      if (!width || !height) return;

      ctx.clearRect(0, 0, width, height);

      // Deep celestial midnight gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#060813');
      bgGrad.addColorStop(0.5, '#0b0f24');
      bgGrad.addColorStop(1, '#080a18');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Cosmic ambient nebula dust (electric indigo & warm golden amber)
      const nebula1 = ctx.createRadialGradient(
        width * 0.25, height * 0.35, 0,
        width * 0.25, height * 0.35, width * 0.5
      );
      nebula1.addColorStop(0, 'rgba(79, 70, 229, 0.09)');
      nebula1.addColorStop(0.5, 'rgba(99, 102, 241, 0.03)');
      nebula1.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(
        width * 0.75, height * 0.45, 0,
        width * 0.75, height * 0.45, width * 0.45
      );
      nebula2.addColorStop(0, 'rgba(217, 119, 6, 0.06)');
      nebula2.addColorStop(0.5, 'rgba(245, 158, 11, 0.02)');
      nebula2.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      for (let star of stars) {
        if (!paused) {
          star.alpha += star.twinkleSpeed;
          if (star.alpha > 0.95 || star.alpha < 0.2) {
            star.twinkleSpeed = -star.twinkleSpeed;
          }
          star.x += star.vx;
          star.y += star.vy;
          if (star.x < 0) star.x = width;
          if (star.x > width) star.x = 0;
          if (star.y < 0) star.y = height;
          if (star.y > height) star.y = 0;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.15, Math.min(1.0, star.alpha));
        ctx.fill();
      }

      if (!paused && enableShootingStars) {
        if (now - lastSpawnTime > nextSpawnDelay) {
          spawnShootingStar();
          lastSpawnTime = now;
          nextSpawnDelay = Math.random() * 4000 + 4000;
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const s = shootingStars[i];
          s.x += s.vx;
          s.y += s.vy;
          s.life -= s.decay;

          if (s.life <= 0 || s.x > width + 100 || s.y > height + 100) {
            shootingStars.splice(i, 1);
            continue;
          }

          const tailX = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.length;
          const tailY = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.length;

          const trailGrad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
          trailGrad.addColorStop(0, s.color);
          trailGrad.addColorStop(0.3, 'rgba(199, 210, 254, 0.6)');
          trailGrad.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = 1.6;
          ctx.globalAlpha = Math.max(0, s.life * 0.85);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = Math.max(0, s.life);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(canvas);
    handleResize();

    const render = (now) => {
      if (!isRunning) return;
      renderFrame(now);
      if (!paused) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (!paused) {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [starCount, speed, enableShootingStars, paused]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ display: 'block' }}
    />
  );
}
