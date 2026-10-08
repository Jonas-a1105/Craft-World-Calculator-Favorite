import React, { useRef, useEffect, useCallback, useState } from 'react';
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

  const [isExiting, setIsExiting] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isAudioPlayingRef = useRef(false);
  const hasFinishedRef = useRef(false);

  const targetPath = resolveSplashRedirect(
    isUserAuthenticated(me),
    redirectTo || searchParams.get('to') || searchParams.get('redirect'),
  );

  const finishSplash = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsExiting(true);

    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch {}
    }
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
      } catch {}
    }

    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate(targetPath, { replace: true });
      }
    }, 350);
  }, [onComplete, navigate, targetPath]);

  const finishSplashRef = useRef(finishSplash);
  finishSplashRef.current = finishSplash;

  // Audio playback manager: tries Web Audio API first, then HTML5 Audio
  const startPlayback = useCallback(() => {
    if (isAudioPlayingRef.current) return;

    // 1. Web Audio API
    if (audioContextRef.current && audioBufferRef.current) {
      try {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
        if (audioContextRef.current.state === 'running' && !audioSourceRef.current) {
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBufferRef.current;
          source.connect(audioContextRef.current.destination);
          source.start(0);
          audioSourceRef.current = source;
          isAudioPlayingRef.current = true;
          return;
        }
      } catch {}
    }

    // 2. HTMLAudioElement fallback
    if (!audioElementRef.current) {
      const audio = new Audio('/assets/splash.mp3');
      audio.volume = 1.0;
      audioElementRef.current = audio;
    }
    audioElementRef.current
      .play()
      .then(() => {
        isAudioPlayingRef.current = true;
      })
      .catch(() => {
        // Autoplay requires user interaction
      });
  }, []);

  // Unlock audio on any interaction without interrupting or skipping the splash animation
  const unlockAudio = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current
        .resume()
        .then(() => {
          startPlayback();
        })
        .catch(() => {
          startPlayback();
        });
    } else {
      startPlayback();
    }
  }, [startPlayback]);

  // Audio setup: preload buffer and attempt immediate autoplay
  useEffect(() => {
    let isMounted = true;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioCtx) {
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      fetch('/assets/splash.mp3')
        .then((res) => res.arrayBuffer())
        .then((buf) => ctx.decodeAudioData(buf))
        .then((decoded) => {
          if (!isMounted) return;
          audioBufferRef.current = decoded;
          startPlayback();
        })
        .catch(() => {
          // If fetch/decode fails, try HTML Audio directly
          if (isMounted) startPlayback();
        });
    } else {
      startPlayback();
    }

    // Listeners to unlock audio on first interaction if autoplay policy suspended context
    const handleGesture = () => unlockAudio();
    window.addEventListener('pointerdown', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });

    return () => {
      isMounted = false;
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      try {
        if (audioSourceRef.current) audioSourceRef.current.stop();
        if (audioElementRef.current) audioElementRef.current.pause();
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      } catch {}
    };
  }, [startPlayback, unlockAudio]);

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
      onClick={unlockAudio}
      className={`fixed inset-0 z-[99999] bg-[#141415] flex items-center justify-center select-none overflow-hidden transition-opacity duration-300 ease-out ${
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
