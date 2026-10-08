import React, { useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMeQuery } from '../../../services/queries/useCraftworldQueries';
import { isUserAuthenticated } from '../../auth/services/authService';
import { resolveSplashRedirect } from '../services/splashService';
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

  const [isExiting, setIsExiting] = React.useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const targetPath = resolveSplashRedirect(
    isUserAuthenticated(me),
    redirectTo || searchParams.get('to') || searchParams.get('redirect'),
  );

  const finishSplash = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch {}
    }

    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate(targetPath, { replace: true });
      }
    }, 350);
  }, [isExiting, onComplete, navigate, targetPath]);

  // Audio: Web Audio API (in-memory buffer decoding)
  // Completely invisible to browser download interceptors (e.g. IDM)
  useEffect(() => {
    let isMounted = true;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    audioContextRef.current = ctx;

    fetch('/assets/splash.mp3')
      .then((res) => res.arrayBuffer())
      .then((buffer) => ctx.decodeAudioData(buffer))
      .then((decodedAudio) => {
        if (!isMounted) return;
        const source = ctx.createBufferSource();
        source.buffer = decodedAudio;
        source.connect(ctx.destination);
        source.start(0);
        audioSourceRef.current = source;

        // Auto-resume if browser autoplay policy initially suspended the context
        if (ctx.state === 'suspended') {
          const resumeAudio = () => {
            if (ctx.state === 'suspended') {
              ctx.resume();
            }
            window.removeEventListener('pointerdown', resumeAudio);
            window.removeEventListener('keydown', resumeAudio);
          };
          window.addEventListener('pointerdown', resumeAudio, { once: true });
          window.addEventListener('keydown', resumeAudio, { once: true });
        }
      })
      .catch(() => {
        // Fallback: silent proceed
      });

    return () => {
      isMounted = false;
      try {
        if (audioSourceRef.current) {
          audioSourceRef.current.stop();
        }
        if (ctx.state !== 'closed') {
          ctx.close();
        }
      } catch {}
    };
  }, []);

  // Safe fallback to guarantee navigation if animation completion does not fire
  useEffect(() => {
    fallbackTimerRef.current = setTimeout(() => {
      finishSplash();
    }, 6200);

    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [finishSplash]);

  return (
    <div
      role="region"
      aria-label="Splash Screen"
      onClick={finishSplash}
      className={`fixed inset-0 z-[99999] bg-[#141415] flex items-center justify-center cursor-pointer select-none overflow-hidden transition-opacity duration-300 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative w-full max-w-[500px] sm:max-w-[540px] aspect-[16/9] flex items-center justify-center px-6">
        <LottieSplash
          onComplete={finishSplash}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
