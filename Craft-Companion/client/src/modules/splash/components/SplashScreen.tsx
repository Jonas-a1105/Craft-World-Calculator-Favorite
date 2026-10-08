import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../../utils/i18n';
import { useMeQuery } from '../../../services/queries/useCraftworldQueries';
import { isUserAuthenticated } from '../../auth/services/authService';
import { getSplashStatusText, resolveSplashRedirect } from '../services/splashService';
import { AnimatedLogo } from './AnimatedLogo';
import { EmberParticles } from './EmberParticles';

export interface SplashScreenProps {
  onComplete?: () => void;
  redirectTo?: string;
  allowSkip?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  redirectTo,
  allowSkip = true,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useTranslation();
  const { data: me } = useMeQuery();

  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const targetPath = resolveSplashRedirect(
    isUserAuthenticated(me),
    redirectTo || searchParams.get('to') || searchParams.get('redirect'),
  );

  const finishSplash = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate(targetPath, { replace: true });
      }
    }, 320);
  }, [isExiting, onComplete, navigate, targetPath]);

  // Audio initialization and cleanup
  useEffect(() => {
    const audio = new Audio('/assets/splash.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Smooth timer progress (6.0s duration)
  useEffect(() => {
    const totalDuration = 6000; // 6 seconds

    const updateProgress = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const currentProgress = Math.min(1, elapsed / totalDuration);
      setProgress(currentProgress);

      if (currentProgress < 1) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        finishSplash();
      }
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [finishSplash]);

  // Toggle audio
  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (audioRef.current) {
      if (!nextMuted) {
        audioRef.current.currentTime = progress * 6;
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Screen click unmute / advance
  const handleScreenClick = () => {
    if (isMuted && audioRef.current) {
      setIsMuted(false);
      audioRef.current.currentTime = progress * 6;
      audioRef.current.play().catch(() => {});
    }
  };

  const statusText = getSplashStatusText(progress, language);
  const percentNumber = Math.min(100, Math.round(progress * 100));

  return (
    <div
      role="region"
      aria-label="Splash Screen"
      onClick={handleScreenClick}
      className={`fixed inset-0 z-[99999] bg-[#141415] text-white flex flex-col items-center justify-center select-none transition-all duration-300 ease-out cursor-pointer overflow-hidden ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 1. Atmospheric Ambient Particles (Embers & Sparks) */}
      <EmberParticles count={26} className="z-0 opacity-60" />

      {/* 2. Top HUD Controls */}
      <div className="fixed top-4 sm:top-6 left-4 sm:left-6 z-50 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">
          Craft World
        </span>
      </div>

      <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggleSound}
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-amber-400 transition-colors backdrop-blur-md cursor-pointer"
        >
          {isMuted ? (
            <>
              <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
              <span className="hidden sm:inline">{language === 'es' ? 'Activar Sonido' : 'Enable Audio'}</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              <span className="hidden sm:inline text-amber-400">{language === 'es' ? 'Sonido Activado' : 'Audio On'}</span>
            </>
          )}
        </button>

        {allowSkip && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              finishSplash();
            }}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/30 text-xs font-mono text-zinc-300 hover:text-amber-300 transition-all backdrop-blur-md cursor-pointer active:scale-95"
          >
            <span>{language === 'es' ? 'Saltar' : 'Skip'}</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* 3. Center Native Animated Logo (NO VIDEO TAG - NO IDM DOWNLOAD BARS) */}
      <main className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 z-10 pointer-events-none">
        <AnimatedLogo className="w-full" />
      </main>

      {/* 4. Bottom Status & Progress HUD */}
      <footer className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 w-full max-w-md px-6 pointer-events-none">
        <div className="flex items-center justify-between w-full text-[11px] sm:text-xs font-mono text-zinc-400 px-1">
          <span className="truncate pr-3 text-zinc-300">{statusText}</span>
          <span className="text-amber-400 font-bold tracking-wider">{percentNumber}%</span>
        </div>

        <p className="text-[10px] font-mono text-zinc-500 tracking-wider text-center">
          {language === 'es'
            ? 'Toca en cualquier parte para saltar o activar audio'
            : 'Tap anywhere to skip or enable audio'}
        </p>
      </footer>

      {/* Ultra-thin gradient progress track on screen bottom edge */}
      <div className="fixed bottom-0 left-0 right-0 h-[3px] bg-zinc-900 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400 transition-all duration-150 ease-out shadow-[0_0_8px_rgba(251,191,36,0.6)]"
          style={{ width: `${percentNumber}%` }}
        />
      </div>
    </div>
  );
};
