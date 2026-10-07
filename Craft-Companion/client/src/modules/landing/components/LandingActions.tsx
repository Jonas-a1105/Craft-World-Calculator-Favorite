import { Link } from 'react-router-dom';

interface LandingActionsProps {
  language: string;
}

export const LandingActions = ({ language }: LandingActionsProps) => {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <Link
        to="/signin"
        className="w-full py-3.5 px-4 rounded-[12px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 font-bold text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm"
      >
        {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
      </Link>
    </div>
  );
};
