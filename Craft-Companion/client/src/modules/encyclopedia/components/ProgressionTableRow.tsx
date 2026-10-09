import React from 'react';
import { LevelProgression } from '../types';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatCompact, formatWithCommas } from '../utils/formatters';

interface Props {
  row: LevelProgression;
}

export const ProgressionTableRow: React.FC<Props> = ({ row }) => {
  const isSwitch = row.isMaterialSwitch;

  return (
    <tr
      className={`transition-colors duration-150 select-none border-none text-xs font-mono ${
        isSwitch
          ? 'bg-indigo-950/40 hover:bg-indigo-900/45 text-white font-medium'
          : 'hover:bg-white/[0.03] text-slate-300'
      }`}
    >
      {/* LV */}
      <td className="px-4 py-3 font-semibold text-slate-400 border-none">
        {row.level}
      </td>

      {/* UPGRADE COST */}
      <td className="px-4 py-3 border-none">
        {row.upgradeCostToken && row.upgradeCostAmount > 0 ? (
          <div className="inline-flex items-center gap-1.5">
            <ResourceIcon symbol={row.upgradeCostToken} size={15} />
            <span className="font-medium text-slate-200">
              {formatWithCommas(row.upgradeCostAmount)}
            </span>
          </div>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>

      {/* DURATION */}
      <td className="px-4 py-3 border-none">
        <div className="inline-flex items-center gap-1.5">
          <span>{row.durationRaw || row.durationFormatted}</span>
          {row.durationDiffFormatted && (
            <span className="text-emerald-400 text-[11px] font-normal">
              {row.durationDiffFormatted}
            </span>
          )}
        </div>
      </td>

      {/* OUTPUT */}
      <td className="px-4 py-3 border-none">
        <div className="inline-flex items-center gap-1.5">
          <span>{formatWithCommas(row.outputAmount)}</span>
          {row.outputDiff !== undefined && (
            <span className="text-emerald-400 text-[11px] font-normal">
              +{formatWithCommas(row.outputDiff)}
            </span>
          )}
        </div>
      </td>

      {/* POWER */}
      <td className="px-4 py-3 border-none">
        <div className="inline-flex items-center gap-1.5">
          <span className="text-amber-400 font-bold">
            {row.power >= 1000 ? formatCompact(row.power) : row.power}
          </span>
          {row.powerDiff !== undefined && row.powerDiff !== 0 && (
            <span className="text-emerald-400 text-[11px] font-normal">
              +{row.powerDiff >= 1000 ? formatCompact(row.powerDiff) : row.powerDiff}
            </span>
          )}
        </div>
      </td>

      {/* PROD/DAY */}
      <td className="px-4 py-3 border-none">
        <div className="inline-flex items-center gap-1.5">
          <span>{formatCompact(row.prodPerDay)}</span>
          {row.prodPerDayDiff !== undefined && (
            <span className="text-emerald-400 text-[11px] font-normal">
              +{formatCompact(row.prodPerDayDiff)}
            </span>
          )}
        </div>
      </td>

      {/* INPUTS */}
      <td className="px-4 py-3 border-none">
        {row.input1Token && row.input1Amount ? (
          <div className="inline-flex items-center gap-1">
            <ResourceIcon symbol={row.input1Token} size={13} />
            <span>{formatWithCommas(row.input1Amount)}</span>
            {row.input2Token && row.input2Amount ? (
              <>
                <span className="text-slate-600 mx-1">+</span>
                <ResourceIcon symbol={row.input2Token} size={13} />
                <span>{formatWithCommas(row.input2Amount)}</span>
              </>
            ) : null}
          </div>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>

      {/* INPUT DAILY CONSUMPTION */}
      <td className="px-4 py-3 border-none text-slate-400">
        {row.input1DailyConsumption && row.input1DailyConsumption > 0 ? (
          <div className="inline-flex items-center gap-1">
            <span>{formatCompact(row.input1DailyConsumption)}</span>
            {row.input2DailyConsumption && row.input2DailyConsumption > 0 ? (
              <>
                <span className="text-slate-600">/</span>
                <span>{formatCompact(row.input2DailyConsumption)}</span>
              </>
            ) : null}
          </div>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>

      {/* XP / DAY */}
      <td className="px-4 py-3 border-none text-purple-300">
        {row.xpPerDay && row.xpPerDay > 0 ? formatCompact(row.xpPerDay) : '—'}
      </td>

      {/* YIELD PERCENT */}
      <td className="px-4 py-3 border-none text-slate-300">
        {row.yieldPercent ? `${row.yieldPercent}%` : '100%'}
      </td>

      {/* GROWTH PERCENT */}
      <td className="px-4 py-3 border-none">
        {row.productionChange && row.productionChange > 0 ? (
          <span className="text-emerald-400 font-semibold">
            +{row.productionChange.toFixed(1)}%
          </span>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>
    </tr>
  );
};
