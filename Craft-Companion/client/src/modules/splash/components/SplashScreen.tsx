import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../../utils/i18n';
import { useMeQuery } from '../../../services/queries/useCraftworldQueries';
import { isUserAuthenticated } from '../../auth/services/authService';
import { getSplashStatusText, resolveSplashRedirect } from '../services/splashService';

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
  const [videoLoaded, setVideoLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const targetPath = resolveSplashRedirect(
    isUserAuthenticated(me),
    redirectTo || searchParams.get('to') || searchParams.get('redirect'),
  );

  const finishSplash = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate(targetPath, { replace: true });
      }
    }, 320);
  }, [isExiting, onComplete, navigate, targetPath]);

  // Video progress and timing handler
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 6;
    if (total > 0) {
      setProgress(Math.min(1, current / total));
    }
  };

  const handleVideoEnded = () => {
    setProgress(1);
    finishSplash();
  };

  // Toggle or unmute audio
  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Unmute on direct screen click if currently muted
  const handleScreenClick = () => {
    if (isMuted && videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play().catch(() => {});
    }
  };

  // Fallback timer: if video fails to play or load, advance after 6.5s
  useEffect(() => {
    fallbackTimerRef.current = setTimeout(() => {
      finishSplash();
    }, 6500);

    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [finishSplash]);

  const statusText = getSplashStatusText(progress, language);
  const percentNumber = Math.min(100, Math.round(progress * 100));

  return (
    <div
      role="region"
      aria-label="Splash Screen"
      onClick={handleScreenClick}
      className={`fixed inset-0 z-[99999] bg-[#121212] text-white flex flex-col items-center justify-center select-none transition-all duration-300 ease-out cursor-pointer overflow-hidden ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic ambient backglows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[260px] bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />

      {/* TOP FLOATING CONTROLS (Non-intrusive HUD) */}
      <div className="fixed top-4 sm:top-6 left-4 sm:left-6 z-50 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">
          Craft World
        </span>
      </div>

      <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 flex items-center gap-2">
        {/* Audio Mute/Unmute toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-xs font-mono text-zinc-300 hover:text-amber-400 transition-colors backdrop-blur-md cursor-pointer"
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

        {/* Skip button */}
        {allowSkip && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              finishSplash();
            }}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/30 text-xs font-mono text-zinc-300 hover:text-amber-300 transition-all backdrop-blur-md cursor-pointer active:scale-95"
          >
            <span>{language === 'es' ? 'Saltar' : 'Skip'}</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* CENTER STAGE: BORDERLESS NATIVE ANIMATION */}
      <main className="relative w-full h-full flex items-center justify-center p-2 sm:p-6 z-10 pointer-events-none">
        <video
          ref={videoRef}
          src="/assets/splash.mp4"
          autoPlay
          muted={isMuted}
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          className="w-full max-w-4xl max-h-[82vh] object-contain pointer-events-none select-none drop-shadow-[0_0_40px_rgba(251,191,36,0.18)]"
          style={{
            mixBlendMode: 'screen',
            filter: 'contrast(115%) brightness(92%)',
          }}
        />

        {!videoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </main>

      {/* BOTTOM FLOATING STATUS & ULTRA-THIN PROGRESS BAR */}
      <footer className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 w-full max-w-md px-6 pointer-events-none">
        <div className="flex items-center justify-between w-full text-[11px] sm:text-xs font-mono text-zinc-400 px-1">
          <span className="truncate pr-3 text-zinc-300">{statusText}</span>
          <span className="text-amber-400 font-bold tracking-wider">{percentNumber}%</span>
        </div>

        <p className="text-[10px] font-mono text-zinc-400 tracking-wider text-center">
          {language === 'es'
            ? 'Toca en cualquier parte para saltar o activar audio'
            : 'Tap anywhere to skip or enable audio'}
        </p>
      </footer>

      {/* Full-width hairline progress track at the bottom edge */}
      <div className="fixed bottom-0 left-0 right-0 h-[3px] bg-zinc-900 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400 transition-all duration-150 ease-out shadow-[0_0_8px_rgba(251,191,36,0.6)]"
          style={{ width: `${percentNumber}%` }}
        />
      </div>
    </div>
  );
};
