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
  const hasTriggeredCompleteRef = useRef<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;

    hasTriggeredCompleteRef.current = false;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/assets/splash1.json?v=4',
    });

    animRef.current = anim;

    const triggerComplete = () => {
      if (!hasTriggeredCompleteRef.current) {
        hasTriggeredCompleteRef.current = true;
        if (onProgress) onProgress(1);
        if (onComplete) onComplete();
      }
    };

    const handleEnterFrame = () => {
      const current = anim.currentFrame;
      const total = anim.totalFrames;
      if (total > 0) {
        if (onProgress) {
          onProgress(Math.min(1, current / total));
        }
        // When approaching the final frame of the 144-frame animation, trigger complete
        if (current >= total - 1.5) {
          triggerComplete();
        }
      }
    };

    anim.addEventListener('enterFrame', handleEnterFrame);
    anim.addEventListener('complete', triggerComplete);

    return () => {
      anim.removeEventListener('enterFrame', handleEnterFrame);
      anim.removeEventListener('complete', triggerComplete);
      anim.destroy();
      animRef.current = null;
    };
  }, [onProgress, onComplete]);

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-[320px] sm:max-w-[360px] aspect-[16/9] flex items-center justify-center select-none pointer-events-none ${
        className || ''
      }`}
    />
  );
};
