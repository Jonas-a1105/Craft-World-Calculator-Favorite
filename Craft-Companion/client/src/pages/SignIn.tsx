import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import { oauthAuthorize } from '../services/api';

export default function SignIn() {
  const nav = useNavigate();
  const { t, language } = useTranslation();
  const [e, setE] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'access_denied') setE(t('signin.error.denied'));
    else if (params.get('error')) setE(t('signin.error.server'));
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative z-10 py-12">
      <div className="bg-slate-900/65 backdrop-blur-lg border border-slate-800/80 rounded-[24px] shadow-2xl p-6 md:p-8 max-w-md w-full space-y-6 transform hover:scale-[1.005] transition-transform duration-300">
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
              ? 'Conéctate con tu cuenta de Craft World usando OAuth.'
              : 'Connect with your Craft World account using OAuth.'}
          </p>
        </div>

        <button
          onClick={oauthAuthorize}
          className="w-full py-3 px-4 rounded-[12px] bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          {t('signin.connectOAuth')}
        </button>

        {e && (
          <div className="text-xs text-center bg-red-950/40 border border-red-900/60 rounded-[8px] p-2 text-red-400">
            ⚠️ {e}
          </div>
        )}

        <p className="text-xs text-center text-slate-400">
          {language === 'es'
            ? '¿No tienes cuenta? Se creará automáticamente al conectar.'
            : "Don't have an account? One will be created when you connect."}
        </p>
      </div>
    </div>
  );
}
