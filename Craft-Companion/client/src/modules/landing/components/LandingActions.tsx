import { Link } from 'react-router-dom';
import { ArrowRightUpLinear } from 'solar-icon-set';
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
            className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 font-bold text-zinc-950 shadow-lg shadow-amber-400/10 hover:shadow-amber-400/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm border-0 outline-none"
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
            className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 font-bold text-zinc-950 shadow-lg shadow-amber-400/10 hover:shadow-amber-400/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm border-0 outline-none"
          >
            {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
          </Link>
          <a
            href="https://craftworld.game"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center justify-center gap-1 group"
          >
            <span>{language === 'es' ? '¿Aún no juegas? Regístrate en Craft World' : "Don't have an account? Register on Craft World"}</span>
            <ArrowRightUpLinear className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </>
      )}
    </div>
  );
};
