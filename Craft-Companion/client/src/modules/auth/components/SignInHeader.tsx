import { Link } from 'react-router-dom';
import { AltArrowLeftLinear } from 'solar-icon-set';

interface SignInHeaderProps {
  language: string;
}

export const SignInHeader = ({ language }: SignInHeaderProps) => {
  return (
    <div className="w-full flex flex-col items-center">
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

      {/* Logo oficial de Craft World centrado directamente encima del título */}
      <div className="flex items-center justify-center mb-6">
        <img
          src="/assets/logo.png"
          className="h-24 sm:h-28 w-auto object-contain drop-shadow-md select-none"
          alt="Craft World"
        />
      </div>

      {/* Título de la pantalla en blanco puro */}
      <h1 className="text-2xl sm:text-[27px] font-bold text-white tracking-tight text-center mb-6">
        {language === 'es'
          ? 'Inicia sesión en tu cuenta'
          : 'Sign in to your account'}
      </h1>
    </div>
  );
};
