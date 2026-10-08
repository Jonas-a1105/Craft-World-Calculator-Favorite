import React, { useEffect, useRef } from 'react';

interface Ember {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  color: string;
}

const EMBER_COLORS = [
  '#f59e0b', // amber-500
  '#fbbf24', // amber-400
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#c084fc', // purple-400
  '#38bdf8', // sky-400
];

export const EmberParticles: React.FC<{ count?: number; className?: string }> = ({
  count = 28,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isDestroyed = false;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
    };

    resize();
    window.addEventListener('resize', resize);

    const createEmber = (bottomOnly = false): Ember => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width;
      const h = canvas.height;
      return {
        x: Math.random() * w,
        y: bottomOnly ? h * (0.6 + Math.random() * 0.4) : Math.random() * h,
        size: (Math.random() * 2.5 + 1) * dpr,
        speedY: -(Math.random() * 0.8 + 0.4) * dpr,
        speedX: (Math.random() - 0.5) * 0.5 * dpr,
        opacity: Math.random() * 0.8 + 0.2,
        fadeSpeed: Math.random() * 0.005 + 0.002,
        color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
      };
    };

    const embers: Ember[] = Array.from({ length: count }, () => createEmber(false));

    const render = () => {
      if (isDestroyed) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < embers.length; i++) {
        const ember = embers[i];
        ember.y += ember.speedY;
        ember.x += ember.speedX + Math.sin(ember.y * 0.01) * 0.2;
        ember.opacity -= ember.fadeSpeed;

        if (ember.y < 0 || ember.opacity <= 0) {
          embers[i] = createEmber(true);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ember.opacity;
        ctx.fillStyle = ember.color;
        ctx.shadowColor = ember.color;
        ctx.shadowBlur = 6 * (window.devicePixelRatio || 1);
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className || ''}`}
    />
  );
};
