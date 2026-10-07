import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BoltBoldDuotone, UserBold, AltArrowLeftLinear } from 'solar-icon-set';
import { useSignIn } from '../hooks/useSignIn';

export const SignInDashboard = () => {
  const {
    language,
    errorMessage,
    isLoading,
    handleConnectOAuth,
    handleQuickLogin,
  } = useSignIn();

  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  const [accountInput, setAccountInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const handleGuestLogin = useCallback(async () => {
    showToast(
      language === 'es'
        ? 'Iniciando en Modo Invitado...'
        : 'Connecting in Guest Mode...'
    );
    await handleQuickLogin('craft_guest', 'Guest Player');
  }, [handleQuickLogin, language, showToast]);

  const handleOAuthClick = useCallback(() => {
    showToast(
      language === 'es'
        ? 'Redirigiendo a Craft World OAuth...'
        : 'Redirecting to Craft World OAuth...'
    );
    handleConnectOAuth();
  }, [handleConnectOAuth, language, showToast]);

  const handleFormSubmit = useCallback(async () => {
    const val = accountInput.trim();
    if (!val) {
      inputRef.current?.focus();
      showToast(
        language === 'es'
          ? 'Por favor, ingresa tu UID o usuario'
          : 'Please enter your UID or username'
      );
      return;
    }

    showToast(
      language === 'es'
        ? `Accediendo con cuenta: ${val}...`
        : `Connecting with account: ${val}...`
    );
    await handleQuickLogin(val, val);
  }, [accountInput, handleQuickLogin, language, showToast]);

  const handleMainButtonClick = useCallback(() => {
    if (!isAccordionOpen) {
      setIsAccordionOpen(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
    } else {
      handleFormSubmit();
    }
  }, [isAccordionOpen, handleFormSubmit]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 select-none bg-[#08080a] text-white">
      {/* Contenedor central simétrico y responsive */}
      <main className="w-full max-w-[430px] mx-auto flex flex-col items-center">
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

        {/* Botones de Proveedores / Acceso */}
        <div className="w-full grid grid-cols-2 gap-3 mb-5">
          {/* Botón Craft World OAuth */}
          <button
            type="button"
            onClick={handleOAuthClick}
            disabled={isLoading}
            className="h-11 w-full bg-auth-surface radius-moderado flex items-center justify-center gap-2 text-xs font-semibold text-zinc-100 cursor-pointer border-none"
          >
            <BoltBoldDuotone className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">Craft World OAuth</span>
          </button>

          {/* Botón Modo Invitado / Demo */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="h-11 w-full bg-auth-surface radius-moderado flex items-center justify-center gap-2 text-xs font-semibold text-zinc-100 cursor-pointer border-none"
          >
            <UserBold className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              {language === 'es' ? 'Modo Invitado' : 'Guest Demo'}
            </span>
          </button>
        </div>

        {/* Divisor plano sutil */}
        <div className="w-full h-[1px] bg-[#16161a] mb-5" />

        {/* Formulario / Bloque interactivo de UID o Correo */}
        <form
          className="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit();
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
                className="w-full h-11 px-4 bg-auth-surface radius-moderado text-sm text-white placeholder-zinc-500 font-normal border-none focus:bg-[#202025] transition-colors outline-none"
              />
            </div>
          </div>

          {/* Contenedor del Botón con Corchetes Angulares en Hover */}
          <div className="bracket-container">
            {/* Corchete Superior Izquierdo ┌ */}
            <svg className="corner-bracket corner-tl" viewBox="0 0 16 16" fill="none">
              <path
                d="M15 2H6C3.79 2 2 3.79 2 6V15"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>

            {/* Corchete Superior Derecho ┐ */}
            <svg className="corner-bracket corner-tr" viewBox="0 0 16 16" fill="none">
              <path
                d="M1 2H10C12.21 2 14 3.79 14 6V15"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>

            {/* Corchete Inferior Izquierdo └ */}
            <svg className="corner-bracket corner-bl" viewBox="0 0 16 16" fill="none">
              <path
                d="M15 14H6C3.79 14 2 12.21 2 10V1"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>

            {/* Corchete Inferior Derecho ┘ */}
            <svg className="corner-bracket corner-br" viewBox="0 0 16 16" fill="none">
              <path
                d="M1 14H10C12.21 14 14 12.21 14 10V1"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>

            {/* Botón Principal Blanco Mate */}
            <button
              type="button"
              onClick={handleMainButtonClick}
              disabled={isLoading}
              className="btn-main-auth w-full h-11 radius-moderado text-xs sm:text-[13px] font-bold tracking-tight flex items-center justify-center cursor-pointer select-none border-none"
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

        {/* Alerta de Error si ocurre */}
        {errorMessage && (
          <div className="w-full mt-4 p-3 radius-moderado bg-rose-500/10 border-none text-rose-400 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Enlace para registrarse en Craft World */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-zinc-500">
            {language === 'es'
              ? '¿Aún no tienes una cuenta de juego en Craft World?'
              : "Don't have a Craft World game account yet?"}
          </p>
          <a
            href="https://craftworld.game"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>
              {language === 'es'
                ? 'Regístrate y juega en craftworld.game'
                : 'Register and play on craftworld.game'}
            </span>
            <span>↗</span>
          </a>
        </div>
      </main>

      {/* Notificación flotante elegante (Toast) */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#18181c] text-zinc-100 text-xs font-medium px-4 py-2.5 radius-moderado flex items-center gap-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 border-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
