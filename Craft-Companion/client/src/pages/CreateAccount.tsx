import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAccount } from '../services/api';
import { useTranslation } from '../utils/i18n';

export default function CreateAccount() {
  const nav = useNavigate();
  const { language } = useTranslation();
  const [f, setF] = useState({
    craftWorldUserId: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [e, setE] = useState('');

  const handleSubmit = async (ev: any) => {
    ev.preventDefault();
    if (!f.craftWorldUserId || !f.username || !f.password || !f.confirmPassword) {
      return setE(language === 'es' ? 'Todos los campos son obligatorios.' : 'All fields are required.');
    }
    if (f.password !== f.confirmPassword) {
      return setE(language === 'es' ? 'Las contraseñas no coinciden.' : 'Passwords do not match.');
    }
    try {
      await registerAccount({
        craftWorldUserId: f.craftWorldUserId,
        username: f.username,
        password: f.password,
      });
      nav('/signin');
    } catch (err: any) {
      setE(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative z-10 py-12">
      <div className="bg-slate-900/65 backdrop-blur-lg border border-slate-800/80 rounded-[24px] shadow-2xl p-6 md:p-8 max-w-md w-full space-y-6 transform hover:scale-[1.005] transition-transform duration-300">
        
        {/* Back Link & Header */}
        <div className="space-y-2">
          <Link to="/signin" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
            ← {language === 'es' ? 'Volver a Iniciar Sesión' : 'Back to Sign In'}
          </Link>
          <h1 className="text-2xl font-black text-white mt-2">
            {language === 'es' ? 'Crear una Cuenta' : 'Create Account'}
          </h1>
          <p className="text-xs text-slate-400">
            {language === 'es' 
              ? 'Regístrate para gestionar tus fábricas y calcular el valor de tus recursos.'
              : 'Register to manage your factories and calculate your resources.'}
          </p>
        </div>

        <hr className="border-slate-800/60 my-2" />

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-455 font-bold block ml-1">
              {language === 'es' ? 'ID de Usuario de Craft World' : 'Craft World User ID'}
            </label>
            <input
              className="w-full rounded-[12px] border border-slate-800 bg-slate-950/80 p-3 text-sm text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500/80 transition-colors"
              placeholder="e.g. 12345"
              value={f.craftWorldUserId}
              onChange={(e) => setF({ ...f, craftWorldUserId: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-455 font-bold block ml-1">
              {language === 'es' ? 'Nombre de Usuario' : 'Username'}
            </label>
            <input
              className="w-full rounded-[12px] border border-slate-800 bg-slate-950/80 p-3 text-sm text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500/80 transition-colors"
              placeholder="e.g. jonas123"
              value={f.username}
              onChange={(e) => setF({ ...f, username: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-455 font-bold block ml-1">
              {language === 'es' ? 'Contraseña' : 'Password'}
            </label>
            <input
              type="password"
              className="w-full rounded-[12px] border border-slate-800 bg-slate-950/80 p-3 text-sm text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500/80 transition-colors"
              placeholder="••••••••"
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-455 font-bold block ml-1">
              {language === 'es' ? 'Confirmar Contraseña' : 'Confirm Password'}
            </label>
            <input
              type="password"
              className="w-full rounded-[12px] border border-slate-800 bg-slate-950/80 p-3 text-sm text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500/80 transition-colors"
              placeholder="••••••••"
              value={f.confirmPassword}
              onChange={(e) => setF({ ...f, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button className="w-full py-3 px-4 rounded-[12px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 font-bold text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.99] transition-all duration-150 cursor-pointer text-sm">
            {language === 'es' ? 'Crear Cuenta' : 'Create Account'}
          </button>
        </form>

        {e && (
          <div className="text-xs text-center bg-red-950/40 border border-red-900/60 rounded-[8px] p-2 text-red-400">
            ⚠️ {e}
          </div>
        )}

        {/* Footer Link */}
        <p className="text-xs text-center text-slate-400">
          {language === 'es' ? '¿Ya tienes una cuenta?' : 'Already have an account?'}{' '}
          <Link to="/signin" className="text-emerald-400 hover:text-emerald-350 font-bold underline transition-colors">
            {language === 'es' ? 'Inicia sesión aquí' : 'Sign in here'}
          </Link>
        </p>
      </div>
    </div>
  );
}
