import { Link } from 'react-router-dom';
import { AltArrowLeftLinear } from 'solar-icon-set';

interface SignInHeaderProps {
  language: string;
}

export const SignInHeader = ({ language }: SignInHeaderProps) => {
  return (
    <>
      {/* Enlace sutil para volver a la Landing */}
      <div className="w-full flex items-center justify-start mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <AltArrowLeftLinear className="w-4 h-4 shrink-0" />
          <span>{language === 'es' ? 'Volver al Inicio' : 'Back to Home'}</span>
        </Link>
      </div>

      {/* Logo y Nombre: Craft World Companion */}
      <div className="flex items-center gap-2.5 mb-7">
        <div className="w-7 h-7 bg-white radius-logo flex items-center justify-center flex-shrink-0 p-1 shadow-sm">
          <img
            src="/assets/logo.png"
            className="w-full h-full object-contain"
            alt="Craft World"
          />
        </div>
        <span className="text-base font-bold text-white tracking-tight">
          Craft World Companion
        </span>
      </div>

      {/* Título de la pantalla */}
      <h1 className="text-2xl sm:text-[27px] font-bold text-white tracking-tight text-center mb-6">
        {language === 'es'
          ? 'Inicia sesión en tu cuenta'
          : 'Sign in to your account'}
      </h1>
    </>
  );
};
