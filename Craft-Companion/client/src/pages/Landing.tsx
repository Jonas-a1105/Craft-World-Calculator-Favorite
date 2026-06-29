import { Link } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';

export default function Landing() {
  const { language } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative z-10">
      <div className="bg-slate-900/65 backdrop-blur-lg border border-slate-800/80 rounded-[24px] shadow-2xl p-8 md:p-10 max-w-lg w-full text-center space-y-6 transform hover:scale-[1.01] transition-transform duration-300">
        
        {/* Logo / App Name */}
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-[18px] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white text-3xl font-black font-mono">C</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-sans mt-3">
            Craft World <span className="bg-gradient-to-r from-emerald-400 to-teal-450 bg-clip-text text-transparent">Companion</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            {language === 'es' 
              ? 'Tus fábricas, tu inventario y el cálculo del valor de tus recursos en un solo lugar y en tiempo real.'
              : 'Your factories, your inventory, and real-time calculations of resource values all in one place.'}
          </p>
        </div>

        <hr className="border-slate-800/60 my-2" />

        {/* Call to Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Link 
            to="/signin" 
            className="w-full py-3.5 px-4 rounded-[12px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 font-bold text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm"
          >
            {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
          </Link>
          
          <Link 
            to="/register" 
            className="w-full py-3.5 px-4 rounded-[12px] bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 font-bold hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm"
          >
            {language === 'es' ? 'Crear una Cuenta' : 'Create Account'}
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-400 mt-4">
          Craft World Companion v0.1.0 • 100% Local Storage
        </p>
      </div>
    </div>
  );
}
