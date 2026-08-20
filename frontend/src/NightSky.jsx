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
      if (!enableShootingStars) return;
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
    let nextSpawnDelay = Math.random() * 3000 + 3500; // between 3.5s and 6.5s

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      initStars();
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(canvas);
    handleResize();

    const render = (time) => {
      if (!isRunning) return;

      // 1. Draw Deep Midnight Space Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#04060d');
      grad.addColorStop(0.5, '#070b16');
      grad.addColorStop(1, '#0c1222');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Soft Ambient Cosmic Nebula Dust (Two-Agent Energy)
      // Agent A (Indigo) Nebula Glow - Top Left
      const nebulaA = ctx.createRadialGradient(
        width * 0.15,
        height * 0.25,
        0,
        width * 0.15,
        height * 0.25,
        width * 0.45
      );
      nebulaA.addColorStop(0, 'rgba(99, 102, 241, 0.14)');
      nebulaA.addColorStop(0.5, 'rgba(79, 70, 229, 0.04)');
      nebulaA.addColorStop(1, 'transparent');
      ctx.fillStyle = nebulaA;
      ctx.fillRect(0, 0, width, height);

      // Agent B (Amber) Nebula Glow - Bottom Right
      const nebulaB = ctx.createRadialGradient(
        width * 0.85,
        height * 0.75,
        0,
        width * 0.85,
        height * 0.75,
        width * 0.40
      );
      nebulaB.addColorStop(0, 'rgba(245, 158, 11, 0.09)');
      nebulaB.addColorStop(0.5, 'rgba(217, 119, 6, 0.02)');
      nebulaB.addColorStop(1, 'transparent');
      ctx.fillStyle = nebulaB;
      ctx.fillRect(0, 0, width, height);

      // 3. Draw & Animate Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Animate twinkle
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.95) {
          star.alpha = 0.95;
          star.twinkleSpeed = -Math.abs(star.twinkleSpeed);
        } else if (star.alpha < 0.15) {
          star.alpha = 0.15;
          star.twinkleSpeed = Math.abs(star.twinkleSpeed);
        }

        // Slight drift
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fill();

        // 4-point glow on brighter large stars
        if (star.radius > 1.4 && star.alpha > 0.6) {
          ctx.beginPath();
          ctx.strokeStyle = star.color;
          ctx.globalAlpha = star.alpha * 0.35;
          ctx.lineWidth = 0.5;
          const crossSize = star.radius * 2.8;
          ctx.moveTo(star.x - crossSize, star.y);
          ctx.lineTo(star.x + crossSize, star.y);
          ctx.moveTo(star.x, star.y - crossSize);
          ctx.lineTo(star.x, star.y + crossSize);
          ctx.stroke();
        }
      }

      // 4. Spawn & Draw Shooting Stars
      if (time - lastSpawnTime > nextSpawnDelay) {
        spawnShootingStar();
        lastSpawnTime = time;
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

        // Head glow point
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [starCount, speed, enableShootingStars]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ display: 'block' }}
    />
  );
}
