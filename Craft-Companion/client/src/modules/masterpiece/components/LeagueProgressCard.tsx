import React from 'react';
import { StopwatchLinear, CupFirstBoldDuotone } from 'solar-icon-set';
import type { MasterpieceLeagueId, MasterpieceLeagueInfo } from '../types';
import { formatCompactNumber } from '../../../utils/formatters';

interface LeagueProgressCardProps {
  leagues: MasterpieceLeagueInfo[];
  activeLeague: MasterpieceLeagueId;
  onSelectLeague: (leagueId: MasterpieceLeagueId) => void;
  currentLeagueInfo: MasterpieceLeagueInfo;
  language: string;
}

export const LeagueProgressCard: React.FC<LeagueProgressCardProps> = ({
  leagues,
  activeLeague,
  onSelectLeague,
  currentLeagueInfo,
  language,
}) => {
  const isEs = language === 'es';
  const progressPercent = Math.min(
    100,
    Math.round(
      (currentLeagueInfo.pointsCurrent / currentLeagueInfo.pointsTotal) * 1000,
    ) / 10,
  );

  return (
    <div className="w-full space-y-3">
      {/* League Selection Pills - directly on canvas background with distinct contrast */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
          {isEs ? 'Masterpiece por Liga' : 'Masterpiece by League'}
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {leagues.map((league) => {
            const isSelected = league.id === activeLeague;
            return (
              <button
                key={league.id}
                type="button"
                onClick={() => onSelectLeague(league.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border-none ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-[#22222a] text-slate-300 hover:text-white hover:bg-[#2c2c36]'
                }`}
              >
                {isEs ? league.labelEs : league.labelEn}
                {league.isUserLeague && (
                  <span className="ml-1 opacity-90 text-[10px]">
                    • {isEs ? 'tú' : 'you'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Match Overview & Progress Card - elevated distinct surface */}
      <div className="p-5 rounded-3xl bg-[#1c1c22] shadow-xl shadow-black/30 space-y-4 border-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <CupFirstBoldDuotone size={22} />
            </div>
            <div>
              <h2
                className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase"
                style={{ fontFamily: "'Press Start 2P', monospace" }}
              >
                {currentLeagueInfo.matchLabel}
              </h2>
              <span className="text-xs font-mono text-slate-300 font-medium">
                {formatCompactNumber(currentLeagueInfo.pointsCurrent)} /{' '}
                {formatCompactNumber(currentLeagueInfo.pointsTotal)} pts
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-[#131316] text-white text-xs font-mono font-bold">
              {progressPercent.toFixed(1)}%
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 text-amber-300 text-xs font-mono font-bold">
              <StopwatchLinear size={15} />
              <span>{currentLeagueInfo.timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar with deep track */}
        <div className="w-full h-2.5 rounded-full bg-[#131316] overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm shadow-amber-500/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
