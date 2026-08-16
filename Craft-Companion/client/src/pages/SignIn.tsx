import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import { oauthAuthorize, getMe, quickLogin } from '../services/api';

export default function SignIn() {
  const nav = useNavigate();
  const { t, language } = useTranslation();
  const [e, setE] = useState('');
  const [playerUid, setPlayerUid] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMe()
      .then((me: any) => {
        if (me && me.id) {
          nav('/home', { replace: true });
        }
      })
      .catch(() => {});
  }, [nav]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('oauth_error') || params.get('error_description') || params.get('error');
    if (err) {
      if (err === 'access_denied') setE(t('signin.error.denied'));
      else setE(decodeURIComponent(err));
    }
  }, [t]);

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setE('');
    try {
      await quickLogin(playerUid.trim() || 'Coquerokli', playerUid.trim() || 'Coquerokli');
      nav('/home', { replace: true });
    } catch (err: any) {
      setE(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative z-10 py-12">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-[24px] shadow-2xl p-6 md:p-8 max-w-md w-full space-y-6 transform hover:scale-[1.005] transition-transform duration-300">
        <div className="space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
          </Link>
          <h1 className="text-2xl font-black text-white mt-2">{t('signin.title')}</h1>
          <p className="text-xs text-slate-400">
            {language === 'es'
              ? 'Conéctate a tu calculadora y panel de control de Craft World.'
              : 'Connect to your Craft World calculator and dashboard.'}
          </p>
        </div>

        {/* Método 1: OAuth de Craft World */}
        <div className="space-y-3">
          <button
            onClick={oauthAuthorize}
            className="w-full py-3.5 px-4 rounded-[12px] bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            {t('signin.connectOAuth')}
          </button>
        </div>

        <div className="flex items-center gap-3 my-2">
          <div className="h-[1px] bg-slate-800 flex-1" />
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            {language === 'es' ? 'O acceso directo' : 'Or direct access'}
          </span>
          <div className="h-[1px] bg-slate-800 flex-1" />
        </div>

        {/* Método 2: Acceso Directo por UID / Nombre */}
        <form onSubmit={handleQuickLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'es' ? 'Tu UID o Nombre en Craft World:' : 'Your Craft World UID or Name:'}
            </label>
            <input
              type="text"
              value={playerUid}
              onChange={(e) => setPlayerUid(e.target.value)}
              placeholder="Ej: Coquerokli o 0x..."
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/60 rounded-[12px] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-[12px] bg-slate-800 hover:bg-slate-700 font-bold text-white shadow-md active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
          >
            {loading
              ? language === 'es'
                ? 'Accediendo...'
                : 'Signing in...'
              : language === 'es'
                ? 'Entrar al Panel y Calculadora →'
                : 'Enter Dashboard & Calculator →'}
          </button>
        </form>

        {e && (
          <div className="text-xs text-center bg-red-950/40 border border-red-900/60 rounded-[8px] p-2.5 text-red-400 leading-relaxed">
            ⚠️ {e}
          </div>
        )}

        <p className="text-[11px] text-center text-slate-400">
          {language === 'es'
            ? 'Acceso instantáneo con almacenamiento seguro y cálculo en tiempo real.'
            : 'Instant access with secure local storage and real-time calculation.'}
        </p>
      </div>
    </div>
  );
}
