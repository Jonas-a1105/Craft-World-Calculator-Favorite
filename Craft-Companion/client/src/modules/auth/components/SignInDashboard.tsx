import { useSignIn } from '../hooks/useSignIn';
import { SignInHeader } from './SignInHeader';
import { SignInProviderGrid } from './SignInProviderGrid';
import { SignInAccordionForm } from './SignInAccordionForm';
import { SignInErrorAlert } from './SignInErrorAlert';
import { SignInFooter } from './SignInFooter';
import { SignInToast } from './SignInToast';

export const SignInDashboard = () => {
  const {
    language,
    errorMessage,
    isLoading,
    isAccordionOpen,
    accountInput,
    setAccountInput,
    toastMessage,
    inputRef,
    handleConnectOAuth,
    handleGuestLogin,
    handleFormSubmit,
    handleMainButtonClick,
  } = useSignIn();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 select-none bg-[#141415] text-white relative overflow-hidden">
      {/* Luces difuminadas ambientales con la paleta de Craft World */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Tarjeta central con la paleta oficial de la app (#1c1c20) */}
      <main className="w-full max-w-[440px] mx-auto bg-[#1c1c20] rounded-[32px] p-6 sm:p-8 border border-white/[0.06] shadow-2xl relative z-10 flex flex-col items-center">
        {/* Cabecera: Navegación, Logo de Craft World centrado arriba y Títulos */}
        <SignInHeader language={language} />

        {/* Botones de Proveedores / Acceso Rápido */}
        <SignInProviderGrid
          language={language}
          isLoading={isLoading}
          onOAuthClick={handleConnectOAuth}
          onGuestClick={handleGuestLogin}
        />

        {/* Divisor plano sutil con la paleta de la app */}
        <div className="w-full h-[1px] bg-white/[0.06] mb-5" />

        {/* Formulario con Acordeón Elástico y Botón con Corchetes */}
        <SignInAccordionForm
          language={language}
          isAccordionOpen={isAccordionOpen}
          accountInput={accountInput}
          setAccountInput={setAccountInput}
          inputRef={inputRef}
          isLoading={isLoading}
          onMainButtonClick={handleMainButtonClick}
          onSubmit={handleFormSubmit}
        />

        {/* Alerta de Error si ocurre */}
        <SignInErrorAlert message={errorMessage} />

        {/* Enlace de Registro externo en Craft World */}
        <div className="w-full mt-6">
          <SignInFooter language={language} />
        </div>
      </main>

      {/* Notificación flotante elegante */}
      <SignInToast message={toastMessage} />
    </div>
  );
};
