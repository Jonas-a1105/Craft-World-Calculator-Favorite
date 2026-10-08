import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

export const LightningCanvas: React.FC<{ className?: string }> = ({ className }) => {
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

    const createLightningBolt = (start: Point, end: Point, roughness = 1.8, iterations = 5): Point[] => {
      let points: Point[] = [start, end];

      for (let i = 0; i < iterations; i++) {
        const nextPoints: Point[] = [];
        for (let j = 0; j < points.length - 1; j++) {
          const p1 = points[j];
          const p2 = points[j + 1];
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const length = Math.sqrt(dx * dx + dy * dy);

          const normalX = -dy / (length || 1);
          const normalY = dx / (length || 1);

          const offset = (Math.random() - 0.5) * length * (roughness / (i + 1));

          nextPoints.push(p1);
          nextPoints.push({
            x: midX + normalX * offset,
            y: midY + normalY * offset,
          });
        }
        nextPoints.push(points[points.length - 1]);
        points = nextPoints;
      }

      return points;
    };

    let nextStrikeTime = performance.now() + 600;
    let strikeEndTime = 0;
    let currentBolt: Point[] = [];
    let currentBranch: Point[] = [];

    const render = (time: number) => {
      if (isDestroyed) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Trigger new lightning strike periodically (every 800 - 1600ms)
      if (time >= nextStrikeTime) {
        // Strike across horizontal text area (CRAFT WORLD letters)
        const startY = h * (0.55 + (Math.random() * 0.2 - 0.1));
        const endY = h * (0.65 + (Math.random() * 0.2 - 0.1));
        const startX = w * (0.15 + Math.random() * 0.1);
        const endX = w * (0.85 - Math.random() * 0.1);

        currentBolt = createLightningBolt({ x: startX, y: startY }, { x: endX, y: endY });

        // Branch bolt
        if (currentBolt.length > 10 && Math.random() > 0.3) {
          const forkIndex = Math.floor(currentBolt.length * (0.4 + Math.random() * 0.3));
          const forkOrigin = currentBolt[forkIndex];
          const branchEnd = {
            x: forkOrigin.x + (Math.random() - 0.5) * w * 0.25,
            y: forkOrigin.y + (Math.random() * 0.2 + 0.05) * h,
          };
          currentBranch = createLightningBolt(forkOrigin, branchEnd, 1.4, 4);
        } else {
          currentBranch = [];
        }

        strikeEndTime = time + 140; // bolt visible for 140ms
        nextStrikeTime = time + 700 + Math.random() * 900;
      }

      // Draw current bolt if within strike duration
      if (time < strikeEndTime && currentBolt.length > 0) {
        const alpha = Math.max(0, (strikeEndTime - time) / 140);

        const drawSegments = (pts: Point[], lineWidth: number, color: string, glowColor: string, blur: number) => {
          if (pts.length < 2) return;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.lineWidth = lineWidth * dpr;
          ctx.strokeStyle = color;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = blur * dpr;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.stroke();
          ctx.restore();
        };

        // Outer glow
        drawSegments(currentBolt, 4, 'rgba(56, 189, 248, 0.4)', '#38bdf8', 18);
        drawSegments(currentBranch, 3, 'rgba(56, 189, 248, 0.3)', '#38bdf8', 14);

        // Core bright white bolt
        drawSegments(currentBolt, 2, '#ffffff', '#60a5fa', 8);
        drawSegments(currentBranch, 1.5, '#ffffff', '#60a5fa', 6);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className || ''}`}
    />
  );
};
