import { Link } from 'react-router-dom';
import { useMeQuery } from '../../../services/queries/useCraftworldQueries';
import { isUserAuthenticated } from '../../auth/services/authService';

interface LandingActionsProps {
  language: string;
}

export const LandingActions = ({ language }: LandingActionsProps) => {
  const { data: me } = useMeQuery();
  const authenticated = isUserAuthenticated(me);

  return (
    <div className="flex flex-col gap-3 pt-2">
      {authenticated ? (
        <>
          <Link
            to="/home"
            className="w-full py-3.5 px-4 rounded-[12px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 font-bold text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm"
          >
            {language === 'es' ? 'Ir al Panel Principal' : 'Go to Dashboard'}
          </Link>
          <Link
            to="/signin"
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            {language === 'es' ? 'Cambiar o reconectar cuenta' : 'Switch or reconnect account'}
          </Link>
        </>
      ) : (
        <>
          <Link
            to="/signin"
            className="w-full py-3.5 px-4 rounded-[12px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 font-bold text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm"
          >
            {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
          </Link>
          <a
            href="https://craftworld.game"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <span>{language === 'es' ? '¿Aún no juegas? Regístrate en Craft World' : "Don't have an account? Register on Craft World"}</span>
            <span>↗</span>
          </a>
        </>
      )}
    </div>
  );
};
