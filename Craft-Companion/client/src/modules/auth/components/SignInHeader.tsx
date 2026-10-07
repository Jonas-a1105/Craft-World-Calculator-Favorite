import { Link } from 'react-router-dom';
import { AltArrowLeftLinear } from 'solar-icon-set';

interface SignInHeaderProps {
  language: string;
}

export const SignInHeader = ({ language }: SignInHeaderProps) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Enlace sutil para volver a la Landing */}
      <div className="w-full flex items-center justify-start mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <AltArrowLeftLinear className="w-4 h-4 shrink-0" />
          <span>{language === 'es' ? 'Volver al Inicio' : 'Back to Home'}</span>
        </Link>
      </div>

      {/* Logo de Craft World grande y centrado encima del título */}
      <div className="flex items-center justify-center mb-4">
        <img
          src="/assets/logo.png"
          className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform"
          alt="Craft World"
        />
      </div>

      {/* Título de la pantalla */}
      <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight text-center">
        {language === 'es'
          ? 'Inicia sesión en tu cuenta'
          : 'Sign in to your account'}
      </h1>

      {/* Subtítulo con identidad de la app */}
      <p className="text-xs sm:text-sm text-zinc-400 text-center mt-1 mb-6">
        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-semibold">
          Craft World Companion
        </span>
      </p>
    </div>
  );
};
