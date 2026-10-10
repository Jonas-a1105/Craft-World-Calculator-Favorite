import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { LandingRollingBentoSection as LandingRollingBentoType, RollingBentoCardItem } from '../types';

interface LandingRollingBentoSectionProps {
  bento?: LandingRollingBentoType;
  language: 'es' | 'en';
}

const DEFAULT_CARDS: RollingBentoCardItem[] = [
  {
    title: 'Fishing Frenzy Grand Prix',
    subtitle: 'Eventos masivos de pesca y premios acumulados',
    tag: 'Evento Oficial',
    img: '/assets/events/banner_fishing_frenzy.png',
  },
  {
    title: 'Imperio y Cuadrilla de Obreros',
    subtitle: 'Asignación de trabajadores y multiplicadores de ciclo',
    tag: 'Producción',
    img: '/assets/events/FFWorkers.png',
  },
  {
    title: 'Pools de Liquidez y Premios COIN',
    subtitle: 'Auditoría patrimonial y tesorería en tiempo real',
    tag: 'Economía',
    img: '/assets/events/prizepool_overview.png',
  },
  {
    title: 'Evolución de Fábricas 1-50',
    subtitle: 'Fórmulas verificadas para las 49 instalaciones del juego',
    tag: 'Industrial',
    img: '/assets/events/flow_fishing_frenzy.png',
  },
];

const FALLBACK_UNSPLASH = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=85',
];

export const LandingRollingBentoSection: React.FC<LandingRollingBentoSectionProps> = ({
  bento,
  language,
}) => {
  const isEs = language === 'es';
  const cards = bento?.cards || DEFAULT_CARDS;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [photoOffset, setPhotoOffset] = useState<number>(0);
  const [progressPct, setProgressPct] = useState<number>(0);

  const cardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const stepDuration = 3800; // ms por estado
  const elapsedTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const goToStep = useCallback((stepNumber: number) => {
    let next = stepNumber;
    if (next < 1) next = 4;
    if (next > 4) next = 1;

    if (currentStep === 4 && next === 1) {
      setPhotoOffset((prev) => (prev + 1) % cards.length);
    }

    setCurrentStep(next);
    elapsedTimeRef.current = 0;
    setProgressPct(0);
  }, [currentStep, cards.length]);

  const advanceManual = useCallback(() => {
    const next = (currentStep % 4) + 1;
    goToStep(next);
  }, [currentStep, goToStep]);

  // requestAnimationFrame Loop for continuous auto-cycling
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      elapsedTimeRef.current += delta;
      const pct = Math.min(100, (elapsedTimeRef.current / stepDuration) * 100);
      setProgressPct(pct);

      if (elapsedTimeRef.current >= stepDuration) {
        elapsedTimeRef.current = 0;
        setProgressPct(0);
        setCurrentStep((prev) => {
          const next = (prev % 4) + 1;
          if (prev === 4 && next === 1) {
            setPhotoOffset((p) => (p + 1) % cards.length);
          }
          return next;
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [stepDuration, cards.length]);

  // Card Mouse Parallax & Specular Reflection
  const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>, cardIdx: number) => {
    const el = cardRefs[cardIdx]?.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);
    el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
  };

  const handleMouseLeaveCard = (cardIdx: number) => {
    const el = cardRefs[cardIdx]?.current;
    if (el) {
      el.style.transform = '';
    }
  };

  return (
    <section id="bento-showcase" className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-20 text-center relative z-20">
      {/* Top Pill Badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1c1c20] text-xs font-medium text-zinc-300 mb-6 backdrop-blur-sm shadow-inner transition-transform hover:scale-105 border-0">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>{bento?.badge || (isEs ? 'Arquitectura Modular • Rolling Bento' : 'Modular Architecture • Rolling Bento')}</span>
      </div>

      {/* Main Headline */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight sm:leading-snug mb-3 max-w-2xl mx-auto">
        {bento?.title || (isEs ? 'Tu Imperio Industrial en una Sola Vista' : 'Your Industrial Empire in a Single View')}
      </h2>

      {/* Subtitle */}
      <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed mb-8">
        {bento?.subtitle || (isEs ? 'Visualizador adaptativo bento con transiciones fluidas FLIP y sincronización en tiempo real.' : 'Adaptive bento showcase with fluid FLIP transitions and real-time synchronization.')}
      </p>

      {/* CONTENEDOR SHELL DE LA VENTANA BENTO (Sin borde, fondo oscuro limpio) */}
      <div className="bento-shell border-0 border-none w-full max-w-4xl mx-auto rounded-[26px] p-3 sm:p-4.5 flex flex-col gap-3 select-none relative overflow-hidden shadow-2xl">
        {/* Header Bar: Título limpio "Rolling Bento" (sin "Pro" ni botón refresh) */}
        <div className="w-full flex items-center justify-between px-2 pt-1 pb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-base sm:text-lg font-bold tracking-tight">
              Rolling Bento
            </h3>
          </div>
        </div>

        {/* LIENZO INTERIOR CON LOS 4 PANELES MORPHING (FLIP 60/120 FPS, Sin bordes) */}
        <div
          className={`bento-canvas border-0 border-none state-${currentStep} w-full h-[330px] sm:h-[440px] md:h-[480px] rounded-[22px] p-3 sm:p-4 overflow-hidden relative transition-colors duration-500`}
        >
          {cardRefs.map((ref, idx) => {
            const cardData = cards[(photoOffset + idx) % cards.length];
            const fallbackSrc = FALLBACK_UNSPLASH[idx % FALLBACK_UNSPLASH.length];

            return (
              <div
                key={idx}
                ref={ref}
                className={`morph-card card-${idx + 1} rounded-[20px] overflow-hidden shadow-2xl cursor-pointer group bg-zinc-900 border-0 border-none`}
                title={cardData.title}
                onClick={advanceManual}
                onMouseMove={(e) => handleMouseMoveCard(e, idx)}
                onMouseLeave={() => handleMouseLeaveCard(idx)}
              >
                {/* Image Background */}
                <img
                  src={cardData.img}
                  alt={cardData.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== fallbackSrc) {
                      target.src = fallbackSrc;
                    }
                  }}
                  loading="lazy"
                />

                {/* Subtle dark gradient overlay on bottom for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Specular Radial Reflection on Mouse Hover */}
                <div className="card-reflection" />

                {/* Bottom Card Title Overlay */}
                <div className="absolute bottom-2.5 sm:bottom-3.5 left-2.5 sm:left-3.5 right-2.5 sm:right-3.5 flex flex-col items-start gap-1 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-amber-400 border border-amber-400/20 shadow-sm">
                    {cardData.tag}
                  </span>
                  <div className="text-left">
                    <h4 className="text-white text-xs sm:text-sm font-bold tracking-tight drop-shadow leading-snug line-clamp-1">
                      {cardData.title}
                    </h4>
                    <p className="text-zinc-300 text-[10px] sm:text-[11px] font-medium drop-shadow line-clamp-1 hidden sm:block">
                      {cardData.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BARRA DE PROGRESO SEGMENTADA SEGÚN LA CANTIDAD DE IMÁGENES */}
        <div className="w-full px-2 pt-2">
          <div className="flex items-center gap-2 sm:gap-2.5 w-full">
            {[1, 2, 3, 4].map((stepIdx) => {
              let fillWidth = 0;
              if (stepIdx < currentStep) {
                fillWidth = 100;
              } else if (stepIdx === currentStep) {
                fillWidth = progressPct;
              } else {
                fillWidth = 0;
              }

              return (
                <div
                  key={stepIdx}
                  onClick={() => goToStep(stepIdx)}
                  className="h-1.5 sm:h-2 bg-white/10 hover:bg-white/15 rounded-full overflow-hidden flex-1 cursor-pointer transition-colors"
                  title={isEs ? `Ir a imagen ${stepIdx}` : `Go to image ${stepIdx}`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-[width] duration-75 ease-linear"
                    style={{ width: `${fillWidth.toFixed(1)}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
