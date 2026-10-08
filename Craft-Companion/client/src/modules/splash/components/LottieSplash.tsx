import React, { useEffect, useRef } from 'react';
import lottie, { type AnimationItem } from 'lottie-web/build/player/lottie_light';

export interface LottieSplashProps {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  className?: string;
}

export const LottieSplash: React.FC<LottieSplashProps> = ({
  onProgress,
  onComplete,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/assets/splash1.json?v=3',
    });

    animRef.current = anim;

    const handleEnterFrame = () => {
      const current = anim.currentFrame;
      const total = anim.totalFrames;
      if (total > 0 && onProgress) {
        onProgress(Math.min(1, current / total));
      }
    };

    const handleComplete = () => {
      if (onProgress) onProgress(1);
      if (onComplete) onComplete();
    };

    anim.addEventListener('enterFrame', handleEnterFrame);
    anim.addEventListener('complete', handleComplete);

    return () => {
      anim.removeEventListener('enterFrame', handleEnterFrame);
      anim.removeEventListener('complete', handleComplete);
      anim.destroy();
      animRef.current = null;
    };
  }, [onProgress, onComplete]);

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-[500px] sm:max-w-[540px] aspect-[16/9] flex items-center justify-center select-none pointer-events-none ${
        className || ''
      }`}
    />
  );
};
