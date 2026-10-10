import React from 'react';
import type {
  CraftworldProfile,
  CraftWorldData,
  MasterpiecesData,
  CraftData,
  PurchasesData,
} from '../../types';
import { useTranslation } from '../../../../utils/i18n';
import { formatNumber } from '../../../../utils/formatters';
import { displayNumber } from '../../utils/formatters';
import { DonutRing } from '../visuals/DonutRing';
import { MiniBarChart } from '../visuals/MiniBarChart';
import { SparklineWave } from '../visuals/SparklineWave';
import { HomeWeeklySplineCard } from '../visuals/HomeWeeklySplineCard';
import { HomePlayerFinancialCard } from '../visuals/HomePlayerFinancialCard';
import { StatusBadge } from '../StatusBadge';
import {
  BoltBoldDuotone,
  CupStarBoldDuotone,
  MoonStarsBoldDuotone,
  DumbbellBoldDuotone,
  GamepadBoldDuotone,
  ArchiveBoldDuotone,
  TicketBoldDuotone,
} from 'solar-icon-set';
import { HugeiconsIcon } from '@hugeicons/react';
import { Diamond02Icon } from '@hugeicons/core-free-icons';

export interface OverviewTabProps {
  profile?: CraftworldProfile;
  craftWorld?: CraftWorldData;
  masterpieces?: MasterpiecesData;
  craft?: CraftData;
  purchases?: PurchasesData;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  craftWorld,
  masterpieces,
  craft,
  purchases,
}) => {
  const { language } = useTranslation();

  const powerTotal = craft?.power || 0;
  const powerUsed = craft?.powerUsed || 0;
  const powerAvail = craft ? Math.max(0, powerTotal - powerUsed) : 0;
  const powerPercent =
    powerTotal > 0
      ? Math.min(100, Math.max(0, Math.round((powerAvail / powerTotal) * 100)))
      : 0;

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* 1. FILA DE 4 TARJETAS CON WIDGETS GRÁFICOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Tarjeta 1: Poder & Energía (Donut Ring Cían) */}
        <div className="bg-[#18181b] hover:bg-[#1f1f23] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BoltBoldDuotone className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
              {language === 'es' ? 'Poder & Energía' : 'Power & Energy'}
            </span>
          </div>

          <div className="flex items-end justify-between gap-1 sm:gap-2 mt-3 sm:mt-4">
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-2xl font-bold font-sans text-white tracking-tight leading-tight truncate">
                {craft ? formatNumber(powerAvail) : '—'}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                {powerPercent}% {language === 'es' ? 'disp.' : 'avail.'}
              </div>
            </div>

            <div className="shrink-0">
              <DonutRing
                percent={powerPercent}
                color="#06b6d4"
                trackColor="#27272a"
                size={38}
                stroke={4.5}
              />
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Masterpieces (Donut Ring Azul Cielo) */}
        <div className="bg-[#18181b] hover:bg-[#1f1f23] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CupStarBoldDuotone className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
              {language === 'es' ? 'Masterpieces' : 'Masterpieces'}
            </span>
          </div>

          <div className="flex items-end justify-between gap-1 sm:gap-2 mt-3 sm:mt-4">
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-2xl font-bold font-sans text-white tracking-tight leading-tight truncate">
                {displayNumber(masterpieces?.claimedMasterpieceIds?.length ?? 0)}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                {language === 'es' ? 'reclamadas' : 'claimed'}
              </div>
            </div>

            <div className="shrink-0">
              <DonutRing
                percent={Math.min(
                  100,
                  Math.round(((masterpieces?.claimedMasterpieceIds?.length ?? 0) / 75) * 100),
                )}
                color="#0ea5e9"
                trackColor="#1e293b"
                size={38}
                stroke={4.5}
              />
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Temporada & Pases (Mini Bar Chart Ámbar) */}
        <div className="bg-[#18181b] hover:bg-[#1f1f23] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MoonStarsBoldDuotone className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
              {language === 'es' ? 'Temporada' : 'Season'}
            </span>
          </div>

          <div className="flex items-end justify-between gap-1 sm:gap-2 mt-3 sm:mt-4">
            <div className="min-w-0 flex-1">
              <div className="text-sm sm:text-xl font-bold font-sans text-white tracking-tight leading-tight truncate">
                {purchases?.crystalPass?.hasActivePass
                  ? 'Crystal'
                  : masterpieces?.activeBattlePasses?.length
                    ? `${masterpieces.activeBattlePasses.length} Pases`
                    : language === 'es'
                      ? 'Pase'
                      : 'Pass'}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                {purchases?.crystalPass?.hasActivePass
                  ? language === 'es'
                    ? 'Activo'
                    : 'Active'
                  : language === 'es'
                    ? 'Inactivo'
                    : 'Inactive'}
              </div>
            </div>

            <div className="shrink-0">
              <MiniBarChart
                activeIndex={purchases?.crystalPass?.hasActivePass ? 3 : 1}
                color="#eab308"
              />
            </div>
          </div>
        </div>

        {/* Tarjeta 4: Skill Points (Neon Green Sparkline Wave) */}
        <div className="bg-[#18181b] hover:bg-[#1f1f23] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <DumbbellBoldDuotone className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
              {language === 'es' ? 'Skill Points' : 'Skill Points'}
            </span>
          </div>

          <div className="flex items-end justify-between gap-1 sm:gap-2 mt-3 sm:mt-4">
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-2xl font-bold font-sans text-white tracking-tight leading-tight truncate">
                {displayNumber(craft?.skillPoints ?? 0)}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                Nv. {profile?.level ?? craftWorld?.level ?? 200}
              </div>
            </div>

            <div className="shrink-0">
              <SparklineWave color="#22c55e" width={48} height={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. GRÁFICA DE TRANSICIÓN SEMANAL (INSPIRADA EN MOCKUP DE DOCS) */}
      <HomeWeeklySplineCard language={language} basePower={craft?.power ?? 100} />

      {/* 3. PANEL DE IDENTIDAD & ANÁLISIS INTELIGENTE (MOCKUP INFO USER TRANSACCIÓN) */}
      <HomePlayerFinancialCard
        profile={profile}
        craftWorld={craftWorld}
        craft={craft}
        purchases={purchases}
        language={language}
      />

      {/* 4. TARJETAS INDEPENDIENTES SOBRE EL BODY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Tarjeta Independiente 1: Resumen General */}
        <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-6 space-y-4 shadow-xl border-none">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-title text-xs text-white tracking-wide uppercase">
              {language === 'es' ? 'Resumen General' : 'General Summary'}
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">STATUS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="bg-[#131315] hover:bg-[#1a1a1e] rounded-full px-4 py-2.5 flex items-center justify-between transition-colors">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <GamepadBoldDuotone className="w-4 h-4 text-emerald-400" />
                <span>{language === 'es' ? 'Nivel' : 'Level'}</span>
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {displayNumber(profile?.level ?? craftWorld?.level)}
              </span>
            </div>
            <div className="bg-[#131315] hover:bg-[#1a1a1e] rounded-full px-4 py-2.5 flex items-center justify-between transition-colors">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <ArchiveBoldDuotone className="w-4 h-4 text-amber-400" />
                <span>{language === 'es' ? 'Recursos' : 'Resources'}</span>
              </span>
              <span className="text-sm font-black text-amber-400 font-mono">
                {displayNumber(craftWorld?.resources?.length ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Tarjeta Independiente 2: Pases & Temporada */}
        <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-6 space-y-4 shadow-xl border-none">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-title text-xs text-white tracking-wide uppercase">
              {language === 'es' ? 'Pases & Temporada' : 'Passes & Season'}
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">SEASON</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="bg-[#131315] hover:bg-[#1a1a1e] rounded-full px-4 py-2.5 flex items-center justify-between transition-colors">
              <span className="text-slate-300 font-medium text-[11px] flex items-center gap-1.5">
                <TicketBoldDuotone className="w-4 h-4 text-amber-400" />
                <span>{language === 'es' ? 'Battle Passes' : 'Battle Passes'}:</span>
              </span>
              <strong className="text-amber-400 font-mono text-sm">
                {displayNumber(masterpieces?.activeBattlePasses?.length)}
              </strong>
            </div>
            {purchases?.crystalPass && (
              <div className="bg-[#131315] hover:bg-[#1a1a1e] rounded-full px-4 py-2.5 flex items-center justify-between transition-colors">
                <span className="text-slate-300 font-medium text-[11px] flex items-center gap-1.5">
                  <HugeiconsIcon icon={Diamond02Icon} size={16} className="text-cyan-400" />
                  <span>Crystal Pass:</span>
                </span>
                <StatusBadge
                  active={purchases.crystalPass.hasActivePass}
                  text={purchases.crystalPass.hasActivePass ? 'Activo' : 'Inactivo'}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
