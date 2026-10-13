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

const SPLASH_SEEN_KEY = 'craftworld.splashSeen';

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  redirectTo,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: me } = useMeQuery();

  const [isExiting, setIsExiting] = useState(false);
  const hasFinishedRef = useRef(false);
  // QW7: el usuario recurrente no paga el coste completo del show de arranque.
  const [isReturningUser] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SPLASH_SEEN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const targetPath = resolveSplashRedirect(
    isUserAuthenticated(me),
    redirectTo || searchParams.get('to') || searchParams.get('redirect'),
  );

  const finishSplash = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsExiting(true);
    try {
      localStorage.setItem(SPLASH_SEEN_KEY, 'true');
    } catch {}

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

  // Audio setup: full show with sound only on the first splash; returning
  // users get a fast, silent transition and a click/Enter-to-skip affordance.
  useEffect(() => {
    if (isReturningUser) return;

    playSplashAudio();

    const handleInteraction = () => {
      playSplashAudio();
    };

    window.addEventListener('pointerdown', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [isReturningUser]);

  // Guaranteed fallback timer: short for returning users, full animation
  // otherwise. One timer on mount prevents any infinite stall either way.
  useEffect(() => {
    const timer = setTimeout(() => {
      finishSplashRef.current();
    }, isReturningUser ? 1100 : 6100);

    return () => clearTimeout(timer);
  }, [isReturningUser]);

  const handleSkip = useCallback(() => {
    if (isReturningUser) {
      finishSplash();
    } else {
      playSplashAudio();
    }
  }, [isReturningUser, finishSplash]);

  return (
    <div
      role="region"
      aria-label={isReturningUser ? 'Cargando — pulsa para continuar' : 'Splash Screen'}
      onClick={handleSkip}
      onKeyDown={(e) => {
        if (isReturningUser && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleSkip();
        }
      }}
      tabIndex={isReturningUser ? 0 : undefined}
      className={`fixed inset-0 z-[99999] bg-oled-canvas flex items-center justify-center select-none overflow-hidden transition-opacity duration-500 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${isReturningUser ? 'cursor-pointer' : ''}`}
    >
      <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-[16/9] flex items-center justify-center px-4">
        <LottieSplash
          onComplete={finishSplash}
          className="w-full h-full"
        />
      </div>

      {/* Returning users: visible skip affordance */}
      {isReturningUser && (
        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[11px] font-mono text-zinc-400 animate-pulse whitespace-nowrap">
          Click o Enter para continuar
        </p>
      )}
    </div>
  );
};
