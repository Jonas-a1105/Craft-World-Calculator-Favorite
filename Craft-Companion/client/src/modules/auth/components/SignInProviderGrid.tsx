import { BoltBoldDuotone, UserBold } from 'solar-icon-set';

interface SignInProviderGridProps {
  language: string;
  isLoading: boolean;
  onOAuthClick: () => void;
  onGuestClick: () => void;
}

export const SignInProviderGrid = ({
  language,
  isLoading,
  onOAuthClick,
  onGuestClick,
}: SignInProviderGridProps) => {
  return (
    <div className="w-full grid grid-cols-2 gap-3 mb-5">
      {/* Botón Craft World OAuth */}
      <button
        type="button"
        onClick={onOAuthClick}
        disabled={isLoading}
        className="h-11 w-full bg-[#202024] hover:bg-[#28282e] active:scale-[0.985] radius-moderado flex items-center justify-center gap-2 text-xs font-bold text-zinc-100 hover:text-white cursor-pointer border border-white/[0.06] hover:border-amber-500/30 transition-all shadow-sm group"
      >
        <BoltBoldDuotone className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
        <span className="truncate">Craft World OAuth</span>
      </button>

      {/* Botón Modo Invitado / Demo */}
      <button
        type="button"
        onClick={onGuestClick}
        disabled={isLoading}
        className="h-11 w-full bg-[#202024] hover:bg-[#28282e] active:scale-[0.985] radius-moderado flex items-center justify-center gap-2 text-xs font-bold text-zinc-100 hover:text-white cursor-pointer border border-white/[0.06] hover:border-emerald-500/30 transition-all shadow-sm group"
      >
        <UserBold className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
        <span className="truncate">
          {language === 'es' ? 'Modo Invitado' : 'Guest Demo'}
        </span>
      </button>
    </div>
  );
};
