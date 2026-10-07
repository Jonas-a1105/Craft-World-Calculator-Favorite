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
        className="h-11 w-full bg-auth-surface radius-moderado flex items-center justify-center gap-2 text-xs font-semibold text-zinc-100 cursor-pointer border-none"
      >
        <BoltBoldDuotone className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="truncate">Craft World OAuth</span>
      </button>

      {/* Botón Modo Invitado / Demo */}
      <button
        type="button"
        onClick={onGuestClick}
        disabled={isLoading}
        className="h-11 w-full bg-auth-surface radius-moderado flex items-center justify-center gap-2 text-xs font-semibold text-zinc-100 cursor-pointer border-none"
      >
        <UserBold className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="truncate">
          {language === 'es' ? 'Modo Invitado' : 'Guest Demo'}
        </span>
      </button>
    </div>
  );
};
