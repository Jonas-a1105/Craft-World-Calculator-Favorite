import React from 'react';
import { FactoryIcon } from '../../../components/GameIcon';
import { Combobox } from '../../../components/ui/Combobox';

export interface FactorySelectorCardProps {
  optionLabel: 'A' | 'B';
  token: string;
  setToken: (tok: string) => void;
  level: number;
  setLevel: (lvl: number | ((prev: number) => number)) => void;
  tokenOptions: Array<{ value: string; label: string; icon: React.ReactNode }>;
  availableLevels: number[];
  levelOptions: Array<{ value: number; label: string }>;
  userOwnedLevel?: number;
  language: 'es' | 'en';
}

export const FactorySelectorCard: React.FC<FactorySelectorCardProps> = ({
  optionLabel,
  token,
  setToken,
  level,
  setLevel,
  tokenOptions,
  availableLevels,
  levelOptions,
  userOwnedLevel,
  language,
}) => {
  const isA = optionLabel === 'A';
  const badgeColor = isA
    ? 'bg-sky-500/15 text-sky-400'
    : 'bg-amber-500/15 text-amber-400';
  const optionTitle =
    language === 'es' ? `Opción ${optionLabel}` : `Option ${optionLabel}`;

  const minLevel = availableLevels[0] ?? 1;
  const maxLevel = Math.max(...availableLevels, 1);

  return (
    <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#141416] flex items-center justify-center shadow-inner">
            <FactoryIcon symbol={token} size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${badgeColor}`}
              >
                {optionTitle}
              </span>
              <h3 className="font-extrabold text-white text-base tracking-wide uppercase">
                {token}
              </h3>
            </div>
          </div>
        </div>

        {userOwnedLevel && (
          <button
            type="button"
            onClick={() => setLevel(userOwnedLevel)}
            className="px-2.5 py-1 rounded-full bg-[#141416] hover:bg-[#202024] text-[11px] font-bold text-emerald-400 cursor-pointer border-none transition-colors"
          >
            {language === 'es'
              ? `Tu Nv: ${userOwnedLevel}`
              : `Owned: ${userOwnedLevel}`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-7 space-y-1.5">
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            {language === 'es' ? 'Fábrica' : 'Factory'}
          </label>
          <Combobox
            value={token}
            onChange={(val) => setToken(val as string)}
            options={tokenOptions}
            className="w-full !py-2.5 !px-3.5 bg-[#141416] hover:bg-[#19191d] rounded-full text-xs font-bold text-white shadow-inner"
            menuClassName="w-full max-h-60"
            align="full"
          />
        </div>

        <div className="sm:col-span-5 space-y-1.5">
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            {language === 'es' ? 'Nivel' : 'Level'}
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLevel((prev) => Math.max(1, prev - 1))}
              disabled={level <= minLevel}
              className="w-9 h-9 flex-shrink-0 rounded-full bg-[#141416] hover:bg-[#202024] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 hover:text-white font-bold transition-all cursor-pointer border-none flex items-center justify-center text-sm shadow-inner"
              title={language === 'es' ? 'Reducir nivel' : 'Decrease level'}
            >
              -
            </button>
            <div className="flex-1 min-w-0">
              <Combobox
                value={level}
                onChange={(val) => setLevel(Number(val))}
                options={levelOptions}
                className="w-full !py-2.5 !px-3 bg-[#141416] hover:bg-[#19191d] rounded-full text-xs font-mono font-bold text-white shadow-inner justify-between"
                menuClassName="w-full min-w-[100px] max-h-60"
                align="full"
                searchPlaceholder={
                  language === 'es' ? 'Nivel...' : 'Level...'
                }
              />
            </div>
            <button
              type="button"
              onClick={() => setLevel((prev) => Math.min(maxLevel, prev + 1))}
              disabled={level >= maxLevel}
              className="w-9 h-9 flex-shrink-0 rounded-full bg-[#141416] hover:bg-[#202024] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 hover:text-white font-bold transition-all cursor-pointer border-none flex items-center justify-center text-sm shadow-inner"
              title={language === 'es' ? 'Aumentar nivel' : 'Increase level'}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
