/**
 * Audio manager for Splash Screen using Web Audio API.
 * Solves browser autoplay restrictions by:
 * 1. Preloading raw audio bytes in memory on app startup without touching AudioContext
 * 2. Creating / resuming AudioContext strictly on user gesture (login / settings click)
 * 3. Avoiding console Autoplay warnings via navigator.userActivation checks
 * 4. Smooth organic exponential fade-out on completion (GainNode ramp)
 * 5. Bypassing external download managers (IDM) via in-memory buffer playback
 */

let audioCtx: AudioContext | null = null;
let rawAudioBytes: ArrayBuffer | null = null;
let audioBuffer: AudioBuffer | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;
let isPreloading = false;
let isDecoding = false;

export function hasUserGesture(): boolean {
  if (typeof navigator !== 'undefined' && 'userActivation' in navigator) {
    return Boolean(navigator.userActivation.hasBeenActive);
  }
  return true;
}

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
  if (rawAudioBytes || audioBuffer || isPreloading) return;
  isPreloading = true;

  fetch('/assets/splash.mp3')
    .then((res) => res.arrayBuffer())
    .then((buf) => {
      rawAudioBytes = buf;
    })
    .catch(() => {})
    .finally(() => {
      isPreloading = false;
    });
}

export function primeSplashAudio() {
  preloadSplashAudio();
  if (hasUserGesture()) {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }
}

export function playSplashAudio(): boolean {
  // If already actively playing, keep it playing
  if (activeSource) {
    return true;
  }

  // If the browser hasn't had any user gesture yet (e.g. direct page refresh),
  // Chrome will block AudioContext and log an autoplay warning.
  // Instead of triggering browser console warnings, listen for the first user interaction.
  if (!hasUserGesture()) {
    const unlockOnGesture = () => {
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
      playSplashAudio();
    };
    window.addEventListener('pointerdown', unlockOnGesture, { once: true });
    window.addEventListener('keydown', unlockOnGesture, { once: true });
    return false;
  }

  const ctx = getAudioContext();
  if (!ctx) return false;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
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

  if (rawAudioBytes && !isDecoding) {
    isDecoding = true;
    ctx.decodeAudioData(rawAudioBytes.slice(0))
      .then((decoded) => {
        audioBuffer = decoded;
        if (!activeSource && gainNode) {
          startSource(decoded);
        }
      })
      .catch(() => {})
      .finally(() => {
        isDecoding = false;
      });
    return false;
  }

  if (!isPreloading && !rawAudioBytes) {
    isPreloading = true;
    fetch('/assets/splash.mp3')
      .then((res) => res.arrayBuffer())
      .then((buf) => {
        rawAudioBytes = buf;
        return ctx.decodeAudioData(buf.slice(0));
      })
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
      // Exponential ramp down to near-zero for natural sound dissipation
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
