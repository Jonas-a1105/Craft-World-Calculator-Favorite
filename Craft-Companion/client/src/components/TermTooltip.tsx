import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../utils/i18n';

/**
 * Glosario in-situ (QW8): micro-explicaciones bilingües en el punto exacto
 * donde aparece el término. Touch-friendly (tap), teclado (focus+Escape) y
 * desktop (hover). Evita que el usuario tenga que ir a un wiki externo para
 * entender el vocabulario del juego.
 */
export type GlossaryTerm =
  | 'mastery'
  | 'cycle'
  | 'slippage'
  | 'arbitrage'
  | 'hatch'
  | 'roi'
  | 'payback'
  | 'valueChain'
  | 'boost';

interface GlossaryEntry {
  title: string;
  body: string;
}

const GLOSSARY: Record<GlossaryTerm, { es: GlossaryEntry; en: GlossaryEntry }> = {
  mastery: {
    es: {
      title: 'Maestría',
      body: 'Bonificación por especialización de la fábrica. Cada nivel de maestría aumenta el rendimiento de producción; se gana al subir niveles y completar ciclos en el juego.',
    },
    en: {
      title: 'Mastery',
      body: 'Specialization bonus for a factory. Each mastery level increases production yield; it is earned by leveling up and completing cycles in the game.',
    },
  },
  cycle: {
    es: {
      title: 'Ciclo',
      body: 'Una producción completa de una fábrica: consume los insumos, espera el tiempo de producción y entrega la salida. Todas las cifras /h y /día se derivan de la duración del ciclo.',
    },
    en: {
      title: 'Cycle',
      body: 'One full production run of a factory: it consumes the inputs, waits the production time and yields the output. All /h and /day figures derive from the cycle duration.',
    },
  },
  slippage: {
    es: {
      title: 'Slippage (deslizamiento)',
      body: 'Diferencia entre el precio esperado y el precio real al operar en el mercado DEX. En pools con poca liquidez el deslizamiento puede comerse el margen del arbitraje.',
    },
    en: {
      title: 'Slippage',
      body: 'Difference between the expected price and the actual execution price on the DEX market. In low-liquidity pools slippage can eat the arbitrage margin.',
    },
  },
  arbitrage: {
    es: {
      title: 'Arbitraje',
      body: 'Ganar con la diferencia de precio entre dos vías: comprar el recurso más barato de lo que cuesta fabricarlo (o al revés) y vender con margen. El Trading Bot puntúa estas oportunidades.',
    },
    en: {
      title: 'Arbitrage',
      body: 'Profit from the price gap between two paths: buying a resource for less than it costs to craft it (or vice versa) and selling with margin. The Trading Bot scores these opportunities.',
    },
  },
  hatch: {
    es: {
      title: 'Hatch (barras rayadas)',
      body: 'Las líneas punteadas del gráfico son la rejilla de referencia (cada 25%). La altura de cada barra muestra el valor normalizado de esa métrica, y la mayor barra indica la opción ganadora (salvo en "Costo Insumo", donde gana la menor).',
    },
    en: {
      title: 'Hatch (striped bars)',
      body: 'The dashed lines on the chart are the reference grid (every 25%). Each bar height shows the normalized value of that metric; the taller bar wins, except for "Input Cost" where lower is better.',
    },
  },
  roi: {
    es: {
      title: 'ROI (retorno)',
      body: 'Cuánto ganas en proporción a lo que invertiste. Un ROI del 20% significa que recuperas tu inversión y además un 20% de ganancia.',
    },
    en: {
      title: 'ROI',
      body: 'How much you gain relative to what you invested. A 20% ROI means you recover your investment plus 20% profit.',
    },
  },
  payback: {
    es: {
      title: 'Payback (recuperación)',
      body: 'Tiempo que tarda una mejora en pagarse a sí misma con el beneficio extra que genera. Cuanto menor, antes empiezas a "ganar de verdad".',
    },
    en: {
      title: 'Payback',
      body: 'Time an upgrade takes to pay for itself through the extra profit it generates. The lower, the sooner you start earning "for real".',
    },
  },
  valueChain: {
    es: {
      title: 'Cadena de valor',
      body: 'El coste real de fabricar algo desglosado hasta las materias primas elementales (Tierra, Agua, Fuego, Polvo, Madera). Permite ver dónde se encarece la producción.',
    },
    en: {
      title: 'Value chain',
      body: 'The true cost of crafting something broken down to the elemental raw materials (Earth, Water, Fire, Dust, Lumber). It shows where production gets expensive.',
    },
  },
  boost: {
    es: {
      title: 'Boost x2',
      body: 'Multiplicador de producción (típicamente por anuncios o pases). Duplica la salida por ciclo; afecta al beneficio/hora pero no al coste de insumos.',
    },
    en: {
      title: 'x2 Boost',
      body: 'Production multiplier (usually from ads or passes). It doubles output per cycle; it boosts profit/hour but not input cost.',
    },
  },
};

interface TermTooltipProps {
  term: GlossaryTerm;
  /** Texto visible; por defecto el título traducido del término. */
  children?: React.ReactNode;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({ term, children }) => {
  const { language } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const isEs = language === 'es';
  const entry = GLOSSARY[term]?.[isEs ? 'es' : 'en'] ?? GLOSSARY[term]?.es;
  if (!entry) return <>{children}</>;

  // Cerrar con click fuera / Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span ref={wrapperRef} className="relative inline-flex items-baseline">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        aria-expanded={open}
        aria-label={`${isEs ? '¿Qué es' : 'What is'} ${entry.title}?`}
        className="inline-flex items-baseline gap-0.5 font-inherit text-inherit border-0 bg-transparent p-0 cursor-help underline decoration-dotted decoration-zinc-500 underline-offset-4 hover:decoration-amber-400 hover:text-amber-200 transition-colors"
      >
        {children ?? entry.title}
        <span className="text-[11px] text-amber-400/80 not-italic" aria-hidden="true">
          ⓘ
        </span>
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-0 mb-2 z-50 w-56 sm:w-64 rounded-2xl bg-oled-850 shadow-2xl p-3 text-left normal-case tracking-normal no-underline"
          style={{ textDecoration: 'none' }}
        >
          <span className="block text-[11px] font-bold text-amber-300 mb-1">{entry.title}</span>
          <span className="block text-[11px] leading-relaxed text-zinc-300">{entry.body}</span>
        </span>
      )}
    </span>
  );
};

export default TermTooltip;
