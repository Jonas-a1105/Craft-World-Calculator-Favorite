import React from 'react';
import { LevelProgression, TableViewMode } from '../types';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatCompact, formatWithCommas } from '../utils/formatters';

interface Props {
  row: LevelProgression;
  viewMode: TableViewMode;
}

export const ProgressionTableRow: React.FC<Props> = ({ row, viewMode }) => {
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
          <span>{row.durationFormatted}</span>
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
          <span>{row.power}</span>
          {row.powerDiff !== undefined && (
            <span className="text-emerald-400 text-[11px] font-normal">
              +{row.powerDiff}
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

      {/* ALL COLUMNS: INPUTS */}
      {viewMode === 'all' && (
        <td className="px-4 py-3 border-none">
          {row.input1Token && row.input1Amount ? (
            <div className="inline-flex items-center gap-1">
              <ResourceIcon symbol={row.input1Token} size={13} />
              <span>{row.input1Amount}</span>
              {row.input2Token && row.input2Amount ? (
                <>
                  <span className="text-slate-600 mx-1">+</span>
                  <ResourceIcon symbol={row.input2Token} size={13} />
                  <span>{row.input2Amount}</span>
                </>
              ) : null}
            </div>
          ) : (
            <span className="text-slate-600">—</span>
          )}
        </td>
      )}
    </tr>
  );
};
