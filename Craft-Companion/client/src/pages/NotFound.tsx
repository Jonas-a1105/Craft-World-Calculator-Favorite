import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTranslation } from '../utils/i18n';
import { notifyWarning } from '../utils/sileoNotifications';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  Home2BoldDuotone,
  Buildings2BoldDuotone,
  Book2BoldDuotone,
  RestartLinear,
  CompassBold,
  ShieldWarningBold,
} from 'solar-icon-set';

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useTranslation();

  useDocumentTitle(language === 'es' ? '404 - Coordenada Inexistente' : '404 - Page Not Found');

  useEffect(() => {
    notifyWarning(
      language === 'es' ? 'Ruta no encontrada (404)' : 'Page Not Found (404)',
      language === 'es'
        ? `La coordenada "${location.pathname}" no existe en el sistema.`
        : `The path "${location.pathname}" does not exist in Craft World.`
    );
  }, [location.pathname, language]);

  return (
    <Layout>
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12 relative overflow-hidden">
        {/* Ambient background glow circles */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Hero Visual Badge */}
        <div className="relative mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase mb-4 shadow-lg shadow-amber-500/10">
            <ShieldWarningBold className="w-4 h-4 animate-pulse" />
            <span>404 • {language === 'es' ? 'COORDENADA INEXISTENTE' : 'PAGE NOT FOUND'}</span>
          </div>

          <div className="flex items-center justify-center gap-2 select-none">
            <span className="text-8xl sm:text-9xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-2xl">
              4
            </span>
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-zinc-900/90 border border-white/10 flex items-center justify-center text-emerald-400 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-amber-500/15 opacity-60" />
              <CompassBold className="w-12 h-12 sm:w-16 sm:h-16 transform transition-transform duration-700 group-hover:rotate-180" />
            </div>
            <span className="text-8xl sm:text-9xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-2xl">
              4
            </span>
          </div>
        </div>

        {/* Headline & Description */}
        <div className="max-w-md mx-auto space-y-3 mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {language === 'es'
              ? '¡Te has adentrado en territorio desconocido!'
              : 'You have entered uncharted territory!'}
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {language === 'es'
              ? 'La ruta a la que intentas acceder no existe, ha sido trasladada o aún no ha sido construida en Craft World.'
              : 'The destination you are trying to visit does not exist, was relocated, or has not been built in Craft World yet.'}
          </p>

          {/* Invalid Path Pill */}
          <div className="inline-block mt-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-900/80 border border-white/10 text-xs font-mono text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-zinc-500">path:</span>
              <span className="text-rose-400 font-semibold">{location.pathname}</span>
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg mb-10">
          <Link
            to="/home"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/25"
          >
            <Home2BoldDuotone className="w-4 h-4" />
            <span>{language === 'es' ? 'Volver al Inicio' : 'Return to Home'}</span>
          </Link>

          <Link
            to="/empire-dashboard"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 active:scale-95 text-white font-semibold text-xs transition-all shadow-md"
          >
            <Buildings2BoldDuotone className="w-4 h-4 text-purple-400" />
            <span>{language === 'es' ? 'Ver Imperio' : 'View Empire'}</span>
          </Link>

          <Link
            to="/encyclopedia"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 active:scale-95 text-white font-semibold text-xs transition-all shadow-md"
          >
            <Book2BoldDuotone className="w-4 h-4 text-indigo-400" />
            <span>{language === 'es' ? 'Enciclopedia' : 'Encyclopedia'}</span>
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 active:scale-95 text-zinc-400 hover:text-white font-medium text-xs transition-all"
          >
            <RestartLinear className="w-4 h-4" />
            <span>{language === 'es' ? 'Página Anterior' : 'Go Back'}</span>
          </button>
        </div>

        {/* Quick Hub Navigation Cards */}
        <div className="w-full max-w-xl bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-5 text-left">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-3">
            {language === 'es' ? 'Destinos Frecuentes' : 'Frequent Destinations'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { to: '/resource-planner', labelEs: 'Planificador', labelEn: 'Planner' },
              { to: '/profitability', labelEs: 'Rentabilidad', labelEn: 'Profitability' },
              { to: '/inventory-value', labelEs: 'Inventario', labelEn: 'Inventory' },
              { to: '/settings', labelEs: 'Ajustes', labelEn: 'Settings' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 hover:text-white border border-white/5 text-xs text-zinc-300 font-medium text-center transition-all block truncate"
              >
                {language === 'es' ? link.labelEs : link.labelEn}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
