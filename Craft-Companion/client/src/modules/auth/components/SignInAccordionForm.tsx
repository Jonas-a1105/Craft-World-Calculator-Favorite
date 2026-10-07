import type { RefObject } from 'react';
import { SignInCornerBrackets } from './SignInCornerBrackets';

interface SignInAccordionFormProps {
  language: string;
  isAccordionOpen: boolean;
  accountInput: string;
  setAccountInput: (val: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  isLoading: boolean;
  onMainButtonClick: () => void;
  onSubmit: () => void;
}

export const SignInAccordionForm = ({
  language,
  isAccordionOpen,
  accountInput,
  setAccountInput,
  inputRef,
  isLoading,
  onMainButtonClick,
  onSubmit,
}: SignInAccordionFormProps) => {
  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {/* Campo de entrada deslizante hacia arriba que desplaza fluidamente el botón */}
      <div
        className={`collapsible-grid w-full ${isAccordionOpen ? 'is-open' : ''}`}
      >
        <div className="collapsible-inner w-full">
          <input
            ref={inputRef}
            type="text"
            value={accountInput}
            onChange={(e) => setAccountInput(e.target.value)}
            placeholder={
              language === 'es'
                ? 'Ingresa tu UID o usuario (ej: jugador)'
                : 'Enter your UID or username (e.g. player)'
            }
            autoComplete="username"
            className="w-full h-11 px-4 bg-[#151518] radius-moderado text-sm text-white placeholder-zinc-500 font-normal border border-white/[0.08] focus:border-emerald-500/60 focus:bg-[#1a1a1f] focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
          />
        </div>
      </div>

      {/* Contenedor del Botón con Corchetes Angulares en Hover */}
      <div className="bracket-container">
        <SignInCornerBrackets />

        {/* Botón Principal Blanco Mate */}
        <button
          type="button"
          onClick={onMainButtonClick}
          disabled={isLoading}
          className="btn-main-auth w-full h-11 radius-moderado text-xs sm:text-[13px] font-bold tracking-tight flex items-center justify-center cursor-pointer select-none border-none shadow-md"
        >
          <span>
            {isAccordionOpen
              ? language === 'es'
                ? 'Continuar con este UID'
                : 'Continue with this UID'
              : language === 'es'
                ? 'Continuar con UID / Correo'
                : 'Continue with UID / Email'}
          </span>
        </button>
      </div>
    </form>
  );
};
