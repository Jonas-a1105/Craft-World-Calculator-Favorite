import React from 'react';
import type { Me, CraftworldProfile, CraftWorldData, PurchasesData } from '../types';
import { useTranslation } from '../../../utils/i18n';
import { formatNumber } from '../../../utils/formatters';
import { formatUid } from '../utils/formatters';
import { ResourceIcon } from '../../../components/GameIcon';

export interface UserProfileCardProps {
  me: Me;
  profile?: CraftworldProfile;
  craftWorld?: CraftWorldData;
  purchases?: PurchasesData;
  isMissingScopes: boolean;
  onReauthorize: () => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  me,
  profile,
  craftWorld,
  purchases,
  isMissingScopes,
  onReauthorize,
}) => {
  const { language } = useTranslation();

  return (
    <div className="w-full flex justify-center py-2">
      <div className="w-full max-w-[280px] sm:max-w-[310px] bg-[#18181b] rounded-[32px] overflow-hidden shadow-2xl border-none flex flex-col items-center select-none transition-all duration-200">
        {/* Top Scenic Banner */}
        <div className="w-full p-2.5 sm:p-3 pb-0">
          <div className="relative w-full h-36 bg-[#202024] rounded-[22px] sm:rounded-[24px] overflow-hidden">
            <img
              src="/assets/fondo.jpeg"
              alt="Banner"
              className="w-full h-full object-cover brightness-[0.75]"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

            {/* Top Left Pill: ⭐ Level + XP */}
            <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-amber-300 border border-white/10 shadow-md">
              <span>⭐</span>
              <span>{profile?.level ? `Lv. ${profile.level}` : 'Lv. 200'}</span>
              {craftWorld?.experiencePoints !== undefined && (
                <span className="text-[10px] text-slate-300 font-normal">
                  ({formatNumber(craftWorld.experiencePoints).slice(0, 4)}k)
                </span>
              )}
            </div>

            {/* Top Right Relink Icon Button */}
            <button
              type="button"
              onClick={onReauthorize}
              title={language === 'es' ? 'Revincular Cuenta' : 'Re-link Account'}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 text-slate-200 hover:text-white flex items-center justify-center transition-all border border-white/10 cursor-pointer shadow-md"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Circular Avatar Cutout Overlapping the Banner Center */}
        <div className="-mt-10 mb-2 relative z-10 flex justify-center">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover shadow-2xl ring-4 ring-[#18181b] bg-[#151518]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#151518] ring-4 ring-[#18181b] shadow-2xl flex items-center justify-center text-3xl">
              <ResourceIcon symbol="Coin" size={36} />
            </div>
          )}
        </div>

        {/* Card Content: Name with Badge, Subtitle & Details */}
        <div className="w-full px-5 pb-5 pt-0.5 flex flex-col items-center text-center space-y-1">
          {/* User Name with Verified Badge */}
          <div className="flex items-center gap-1.5 justify-center">
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
              {profile?.displayName || me.craftWorldDisplayName || me.id}
            </h2>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black shadow-sm">
              ✓
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-slate-400 font-medium">
            UID: <span className="font-mono text-slate-300">{formatUid(me.craftWorldUid)}</span>
          </p>

          {/* XP & Crystal Pass pill */}
          <div className="pt-1 flex items-center gap-2">
            {craftWorld?.experiencePoints !== undefined && (
              <span className="text-[11px] text-amber-400 font-mono font-semibold">
                XP: {formatNumber(craftWorld.experiencePoints)}
              </span>
            )}
            {purchases?.crystalPass?.hasActivePass && (
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border-none">
                💎 Pass
              </span>
            )}
          </div>

          {isMissingScopes && (
            <button
              type="button"
              onClick={onReauthorize}
              className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-1 rounded-full transition-all cursor-pointer"
            >
              ⚡ {language === 'es' ? 'Re-vincular' : 'Re-link'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
