import React from 'react';
import { CheckCircleBold, BoxBold, BellBingBold, BellOffBold } from 'solar-icon-set';
import { FactoryIcon, ResourceIcon } from '../../../components/GameIcon';
import type { ActiveRun } from '../types';
import { calculateRunTimerMetrics } from '../services/factoryTimersService';
import {
  useNotificationPrefs,
  toggleFactoryMute,
  isFactoryMuted,
} from '../../../services/notificationPrefs';

interface FactoryTimerCardProps {
  run: ActiveRun;
  nowSyncedMs: number;
  language: string;
}

const DONUT_SIZE = 44;
const STROKE_WIDTH = 3.8;
const RADIUS = (DONUT_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const FactoryTimerCard: React.FC<FactoryTimerCardProps> = ({
  run,
  nowSyncedMs,
  language,
}) => {
  const {
    formattedTime,
    isFinished,
    clampedPercent,
    strokeDashoffset,
  } = calculateRunTimerMetrics(run, nowSyncedMs, CIRCUMFERENCE);

  // LP5: silencio por fábrica (persistente, por token).
  const notifPrefs = useNotificationPrefs();
  const muted = isFactoryMuted(run.token, notifPrefs);
  const isEs = language === 'es';
  const muteLabel = muted
    ? isEs
      ? `Avisos de ${run.outputToken} silenciados — toca para reactivar`
      : `Alerts for ${run.outputToken} muted — tap to resume`
    : isEs
      ? `Silenciar avisos de ${run.outputToken}`
      : `Mute alerts for ${run.outputToken}`;

  return (
    <div className="bg-oled-card hover:bg-oled-850 rounded-[32px] sm:rounded-[36px] p-4 sm:p-5 transition-all duration-200 shadow-lg group border-none flex flex-col justify-between gap-3">
      {/* TOP ROW: Thumbnail + Info + Multiplier Tag */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Rounded square thumbnail container */}
          <div className="w-11 h-11 rounded-[16px] bg-oled-pill flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <FactoryIcon symbol={run.token} size={26} />
          </div>

          <div className="min-w-0">
            {/* Title */}
            <h4 className="font-bold text-white text-xs sm:text-sm leading-snug truncate">
              {run.title}
            </h4>
            {/* Level & Resource */}
            <div className="text-[11px] text-zinc-400 font-medium mt-0.5 truncate flex items-center gap-1.5">
              <span>Nv. {run.level}</span>
              <span>•</span>
              <span className="text-zinc-300 flex items-center gap-1">
                <ResourceIcon symbol={run.outputToken} size={12} />
                {run.outputToken}
              </span>
            </div>
            {/* Remaining Time */}
            <div className="text-xs sm:text-sm font-extrabold text-white font-mono mt-0.5 tracking-tight">
              {isFinished ? '0m 0s' : formattedTime}
            </div>
          </div>
        </div>

        {/* Right multiplier badge */}
        <div
          className="text-[11px] font-mono font-bold text-amber-400 bg-white/5 px-2 py-0.5 rounded-full shrink-0"
          style={{ textShadow: '0 1px 4px rgba(245, 158, 11, 0.4)' }}
        >
          x{run.outputAmount}
        </div>
      </div>

      {/* BOTTOM ROW: Actions on the LEFT, Donut Progress Ring on the RIGHT */}
      <div className="flex items-center justify-between pt-1">
        {/* Action buttons (LEFT) */}
        <div className="flex items-center gap-1.5">
          {/* Main capsule button */}
          <div
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 select-none ${
              isFinished
                ? 'bg-[#a3e635] text-black shadow-lg shadow-[#a3e635]/20 cursor-pointer hover:bg-[#bef264]'
                : 'bg-oled-pill text-zinc-300'
            }`}
          >
            {isFinished ? (
              <>
                <CheckCircleBold className="w-3.5 h-3.5 shrink-0 text-black" />
                <span>{language === 'es' ? 'Listo' : 'Ready'}</span>
              </>
            ) : (
              <span>{language === 'es' ? 'En Producción' : 'In Production'}</span>
            )}
          </div>

          {/* Per-factory notification mute toggle (LP5) */}
          <button
            type="button"
            onClick={() => toggleFactoryMute(run.token)}
            title={muteLabel}
            aria-label={muteLabel}
            aria-pressed={muted}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 border-0 outline-none ${
              muted
                ? 'bg-rose-500/15 text-rose-400'
                : 'bg-oled-pill hover:bg-[#28282e] text-zinc-400'
            }`}
          >
            {muted ? (
              <BellOffBold className="w-4 h-4 shrink-0" />
            ) : (
              <BellBingBold className="w-4 h-4 shrink-0" />
            )}
          </button>

          {/* Output amount badge */}
          <div
            className="w-8 h-8 rounded-full bg-oled-pill text-zinc-300 flex items-center justify-center shrink-0"
            title={`Produciendo ${run.outputAmount} ${run.outputToken}`}
          >
            <BoxBold className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          </div>
        </div>

        {/* Donut Progress Ring with percentage text inside (RIGHT) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline">
            {isFinished
              ? language === 'es'
                ? 'Completado'
                : 'Completed'
              : language === 'es'
                ? 'Progreso'
                : 'Progress'}
          </span>
          <div className="relative flex items-center justify-center w-[44px] h-[44px] shrink-0">
            <svg
              width={DONUT_SIZE}
              height={DONUT_SIZE}
              className="transform -rotate-90 origin-center"
            >
              <circle
                cx={DONUT_SIZE / 2}
                cy={DONUT_SIZE / 2}
                r={RADIUS}
                fill="transparent"
                stroke="#27272a"
                strokeWidth={STROKE_WIDTH}
              />
              <circle
                cx={DONUT_SIZE / 2}
                cy={DONUT_SIZE / 2}
                r={RADIUS}
                fill="transparent"
                stroke={isFinished ? '#a3e635' : '#06b6d4'}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-black text-white">
              {Math.round(clampedPercent)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
