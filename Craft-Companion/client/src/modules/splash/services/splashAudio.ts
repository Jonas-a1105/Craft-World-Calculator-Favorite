/**
 * Audio manager for Splash Screen using Web Audio API.
 * Solves browser autoplay restrictions by:
 * 1. Preloading & decoding audio in memory
 * 2. Allowing synchronous user-gesture priming on login/settings clicks
 * 3. Bypassing download extensions like IDM (raw buffer decode)
 */

let audioCtx: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;
let activeSource: AudioBufferSourceNode | null = null;
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

  if (audioBuffer && ctx.state === 'running') {
    stopSplashAudio();
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start(0);
    activeSource = source;
    return true;
  }

  // If buffer not decoded yet, load and start as soon as ready
  fetch('/assets/splash.mp3')
    .then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => {
      audioBuffer = decoded;
      if (ctx.state === 'running' && !activeSource) {
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.connect(ctx.destination);
        source.start(0);
        activeSource = source;
      }
    })
    .catch(() => {});

  return false;
}

export function stopSplashAudio() {
  if (activeSource) {
    try {
      activeSource.stop();
      activeSource.disconnect();
    } catch {}
    activeSource = null;
  }
}
