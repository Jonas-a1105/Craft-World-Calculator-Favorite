import React from 'react';
import { RefreshLinear, CheckCircleBold } from 'solar-icon-set';
import type { UserProfile } from '../types';
import { oauthAuthorize } from '../../../services/api';

export interface SettingsUserProfileCardProps {
  user: UserProfile | null;
  language: 'es' | 'en';
}

export const SettingsUserProfileCard: React.FC<SettingsUserProfileCardProps> = ({
  user,
  language,
}) => {
  return (
    <div className="bg-[#18181b] rounded-[32px] p-5 shadow-xl flex items-center justify-between gap-3 relative overflow-hidden">
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full overflow-hidden bg-black/60 ring-2 ring-white/10 flex-shrink-0 flex items-center justify-center">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="/assets/resources/Coin.png"
              alt="Avatar"
              className="w-8 h-8 object-contain"
            />
          )}
        </div>

        {/* User Meta */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white truncate">
              {user?.displayName || 'Player'}
            </span>
            <CheckCircleBold className="w-4 h-4 text-blue-400 shrink-0" />
          </div>
          <p className="text-xs text-zinc-400 truncate mt-0.5">
            {user?.level !== undefined
              ? `Nivel ${user.level} • @craftworld`
              : '@craftworld'}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">
              OAuth Conectado (5 Scopes)
            </span>
          </div>
        </div>
      </div>

      {/* Quick Re-link Button */}
      <button
        type="button"
        onClick={oauthAuthorize}
        title={language === 'es' ? 'Revincular Cuenta' : 'Re-link Account'}
        className="w-10 h-10 rounded-full bg-[#24242a] hover:bg-[#2e2e36] text-zinc-200 hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0 group border-none p-0"
      >
        <RefreshLinear className="w-5 h-5 transition-transform duration-500 group-hover:rotate-180 text-zinc-300 group-hover:text-white shrink-0" />
      </button>
    </div>
  );
};
