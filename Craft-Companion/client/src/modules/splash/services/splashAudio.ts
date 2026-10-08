/**
 * Audio manager for Splash Screen using Web Audio API.
 * Solves browser autoplay restrictions by:
 * 1. Preloading & decoding audio into memory on app startup
 * 2. Allowing synchronous user-gesture playback on login and settings clicks
 * 3. Smooth organic fade-out on completion (GainNode exponential ramp)
 * 4. Bypassing external download managers (IDM) via in-memory buffer decode
 */

let audioCtx: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;
let isPreloading = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  return audioCtx;
}

export function preloadSplashAudio() {
  const ctx = getAudioContext();
  if (!ctx || audioBuffer || isPreloading) return;
  isPreloading = true;

  fetch('/assets/splash.mp3')
    .then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => {
      audioBuffer = decoded;
    })
    .catch(() => {})
    .finally(() => {
      isPreloading = false;
    });
}

export function primeSplashAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  preloadSplashAudio();
}

export function playSplashAudio(): boolean {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  // If already actively playing, keep it playing
  if (activeSource) {
    return true;
  }

  if (!gainNode) {
    gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
  }

  const now = ctx.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(1.0, now);

  const startSource = (buffer: AudioBuffer): boolean => {
    if (activeSource) return true;
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode!);
      source.onended = () => {
        if (activeSource === source) {
          activeSource = null;
        }
      };
      source.start(0);
      activeSource = source;
      return true;
    } catch {
      return false;
    }
  };

  if (audioBuffer) {
    return startSource(audioBuffer);
  }

  // If buffer not decoded yet, load and start as soon as ready
  if (!isPreloading) {
    isPreloading = true;
    fetch('/assets/splash.mp3')
      .then((res) => res.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        audioBuffer = decoded;
        if (!activeSource && gainNode) {
          startSource(decoded);
        }
      })
      .catch(() => {})
      .finally(() => {
        isPreloading = false;
      });
  }

  return false;
}

export function fadeOutSplashAudio(durationMs: number = 600) {
  const ctx = getAudioContext();
  if (gainNode && ctx && activeSource) {
    try {
      const now = ctx.currentTime;
      const durationSec = Math.max(0.1, durationMs / 1000);
      gainNode.gain.cancelScheduledValues(now);
      const currentGain = Math.max(0.0001, gainNode.gain.value || 1.0);
      gainNode.gain.setValueAtTime(currentGain, now);
      // Exponential ramp down to near-zero for natural sound tail
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
    } catch {}

    const sourceToStop = activeSource;
    setTimeout(() => {
      try {
        sourceToStop.stop();
        sourceToStop.disconnect();
      } catch {}
      if (activeSource === sourceToStop) {
        activeSource = null;
      }
    }, durationMs + 40);
  } else {
    stopSplashAudio();
  }
}

export function stopSplashAudio() {
  const ctx = getAudioContext();
  if (gainNode && ctx) {
    try {
      gainNode.gain.cancelScheduledValues(ctx.currentTime);
    } catch {}
  }
  if (activeSource) {
    try {
      activeSource.stop();
      activeSource.disconnect();
    } catch {}
    activeSource = null;
  }
}
