import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMeQuery } from '../../../services/queries/useCraftworldQueries';
import { isUserAuthenticated } from '../../auth/services/authService';
import { resolveSplashRedirect } from '../services/splashService';
import { playSplashAudio, fadeOutSplashAudio, stopSplashAudio } from '../services/splashAudio';
import { LottieSplash } from './LottieSplash';

export interface SplashScreenProps {
  onComplete?: () => void;
  redirectTo?: string;
  allowSkip?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  redirectTo,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: me } = useMeQuery();

  const [isExiting, setIsExiting] = useState(false);
  const hasFinishedRef = useRef(false);

  const targetPath = resolveSplashRedirect(
    isUserAuthenticated(me),
    redirectTo || searchParams.get('to') || searchParams.get('redirect'),
  );

  const finishSplash = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsExiting(true);

    // Smooth organic volume fade-out instead of abrupt sound cut
    fadeOutSplashAudio(600);

    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate(targetPath, { replace: true });
      }
    }, 450);
  }, [onComplete, navigate, targetPath]);

  const finishSplashRef = useRef(finishSplash);
  finishSplashRef.current = finishSplash;

  // Audio setup: attempt play immediately on mount, and unlock on any user interaction if suspended
  useEffect(() => {
    playSplashAudio();

    const handleInteraction = () => {
      playSplashAudio();
    };

    window.addEventListener('pointerdown', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      // Only forcibly stop if unmounted unexpectedly before natural finish
      if (!hasFinishedRef.current) {
        stopSplashAudio();
      }
    };
  }, []);

  // Guaranteed fallback timer: exactly one timer on mount to prevent any infinite stall
  useEffect(() => {
    const timer = setTimeout(() => {
      finishSplashRef.current();
    }, 6100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="region"
      aria-label="Splash Screen"
      onClick={() => playSplashAudio()}
      className={`fixed inset-0 z-[99999] bg-[#141415] flex items-center justify-center select-none overflow-hidden transition-opacity duration-500 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-[16/9] flex items-center justify-center px-4">
        <LottieSplash
          onComplete={finishSplash}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
