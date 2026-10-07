interface SignInFooterProps {
  language: string;
}

export const SignInFooter = ({ language }: SignInFooterProps) => {
  return (
    <div className="space-y-2 pt-2 border-t border-white/[0.06] text-center">
      <p className="text-xs text-slate-400">
        {language === 'es'
          ? '¿Aún no tienes una cuenta de juego en Craft World?'
          : "Don't have a Craft World game account yet?"}
      </p>
      <a
        href="https://craftworld.game"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <span>{language === 'es' ? 'Regístrate y juega en craftworld.game' : 'Register and play on craftworld.game'}</span>
        <span>↗</span>
      </a>
    </div>
  );
};
