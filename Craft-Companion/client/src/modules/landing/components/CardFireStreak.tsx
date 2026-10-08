import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  type: 'ember' | 'spark' | 'glow';
  colorCore: string;
  colorOuter: string;
  baseAlpha: number;
  swayFreq: number;
  swayAmp: number;
  phase: number;
}

export const CardFireStreak: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Handle high DPI
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    // Fire palette definitions
    const emberColors = [
      { core: '#ffe066', outer: '#f97316' }, // bright gold to orange
      { core: '#ffd000', outer: '#ea580c' }, // gold to fiery amber
      { core: '#ffedd5', outer: '#f59e0b' }, // white-hot to amber
      { core: '#f97316', outer: '#ef4444' }, // orange to fire red
      { core: '#fbbf24', outer: '#dc2626' }, // warm gold to ruby flame
    ];

    const sparkColors = [
      { core: '#ffffff', outer: '#fef08a' }, // pure white spark
      { core: '#fffbeb', outer: '#fde047' }, // hot yellow spark
      { core: '#fef08a', outer: '#f97316' }, // golden spark
    ];

    // Create a particle
    const createParticle = (isInitial = false): Particle => {
      const rand = Math.random();
      let type: 'ember' | 'spark' | 'glow';
      let size: number;
      let vy: number;
      let vx: number;
      let maxLife: number;
      let baseAlpha: number;
      let colorCore: string;
      let colorOuter: string;

      if (rand < 0.5) {
        // Ember: floating glowing fire cinder
        type = 'ember';
        size = 2.2 + Math.random() * 2.8;
        vy = -(1.2 + Math.random() * 1.6);
        vx = (Math.random() - 0.5) * 0.7;
        maxLife = 110 + Math.random() * 110;
        baseAlpha = 0.75 + Math.random() * 0.25;
        const c = emberColors[Math.floor(Math.random() * emberColors.length)];
        colorCore = c.core;
        colorOuter = c.outer;
      } else if (rand < 0.8) {
        // Spark: fast shooting micro spark with trajectory streak
        type = 'spark';
        size = 1.0 + Math.random() * 1.6;
        vy = -(2.8 + Math.random() * 3.2);
        vx = (Math.random() - 0.5) * 1.2;
        maxLife = 70 + Math.random() * 70;
        baseAlpha = 0.85 + Math.random() * 0.15;
        const c = sparkColors[Math.floor(Math.random() * sparkColors.length)];
        colorCore = c.core;
        colorOuter = c.outer;
      } else {
        // Glow: soft ambient heat cloud providing body & atmosphere
        type = 'glow';
        size = 7.0 + Math.random() * 9.0;
        vy = -(0.7 + Math.random() * 0.9);
        vx = (Math.random() - 0.5) * 0.5;
        maxLife = 130 + Math.random() * 90;
        baseAlpha = 0.18 + Math.random() * 0.14;
        colorCore = '#ff7700';
        colorOuter = '#ef4444';
      }

      // X distributed across bottom, with natural grouping near center and sides
      const spawnX = width * (0.12 + Math.random() * 0.76);
      // Y near the bottom edge
      let spawnY = height - (Math.random() * 38);
      let life = 0;

      if (isInitial) {
        // Scatter existing particles across full height on first mount
        spawnY = height - Math.random() * (height * 0.95);
        life = Math.random() * maxLife;
      }

      return {
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        size,
        life,
        maxLife,
        type,
        colorCore,
        colorOuter,
        baseAlpha,
        swayFreq: 0.025 + Math.random() * 0.035,
        swayAmp: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
      };
    };

    // Initialize particle pool (55 active particles)
    const particleCount = 55;
    const particles: Particle[] = Array.from({ length: particleCount }, () =>
      createParticle(true)
    );

    // Animation frame render loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 2.5); // normalized frame step
      lastTime = time;

      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Use additive screen blending for true video game fiery luminance
      ctx.globalCompositeOperation = 'screen';

      // 1. Base Hearth Warmth Glow behind bottom of the card
      const baseGradient = ctx.createRadialGradient(
        width * 0.5,
        height - 10,
        0,
        width * 0.5,
        height - 10,
        width * 0.45
      );
      baseGradient.addColorStop(0, 'rgba(255, 115, 0, 0.28)');
      baseGradient.addColorStop(0.35, 'rgba(234, 88, 12, 0.14)');
      baseGradient.addColorStop(0.75, 'rgba(239, 68, 68, 0.04)');
      baseGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = baseGradient;
      ctx.beginPath();
      ctx.ellipse(width * 0.5, height - 10, width * 0.45, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Render and update each fire particle
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Physics update
        p.life += dt;
        p.x += (p.vx + Math.sin(p.life * p.swayFreq + p.phase) * p.swayAmp) * dt;
        p.y += p.vy * dt;

        // Reset particle if expired or flew past top
        if (p.life >= p.maxLife || p.y < -15) {
          particles[i] = createParticle(false);
          continue;
        }

        // Alpha calculation: smooth ignition, steady burn with flicker, dissipation
        const progress = p.life / p.maxLife;
        const fadeIn = Math.min(1, progress / 0.12);
        const fadeOut = Math.min(1, (1 - progress) / 0.32);
        const flicker = 0.82 + 0.18 * Math.sin(p.life * 0.4 + p.phase);
        const alpha = Math.max(0, p.baseAlpha * fadeIn * fadeOut * flicker);

        if (alpha <= 0.01) continue;

        if (p.type === 'spark') {
          // Fast streak spark: line connecting recent path + hot point
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
          ctx.strokeStyle = p.colorCore;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Hot head point
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = Math.min(1, alpha * 1.2);
          ctx.fill();
        } else if (p.type === 'ember') {
          // Fiery ember with glowing radial halo
          const grad = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.size * 2.2
          );
          grad.addColorStop(0, p.colorCore);
          grad.addColorStop(0.45, p.colorOuter);
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

          ctx.fillStyle = grad;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Soft heat wisp / smoke cloud
          const grad = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.size
          );
          grad.addColorStop(0, p.colorCore);
          grad.addColorStop(0.5, p.colorOuter);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Pause when scrolled offscreen to conserve CPU / battery
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Resize observer to keep canvas sharp on window resize
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute -inset-x-8 -top-16 -bottom-10 pointer-events-none z-0 overflow-visible select-none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
