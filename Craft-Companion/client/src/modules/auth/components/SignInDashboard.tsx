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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 select-none bg-[#08080a] text-white">
      {/* Contenedor central simétrico y responsive */}
      <main className="w-full max-w-[430px] mx-auto flex flex-col items-center">
        {/* Cabecera: Navegación, Logo y Título */}
        <SignInHeader language={language} />

        {/* Botones de Proveedores / Acceso Rápido */}
        <SignInProviderGrid
          language={language}
          isLoading={isLoading}
          onOAuthClick={handleConnectOAuth}
          onGuestClick={handleGuestLogin}
        />

        {/* Divisor plano sutil */}
        <div className="w-full h-[1px] bg-[#16161a] mb-5" />

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
        <div className="w-full mt-8">
          <SignInFooter language={language} />
        </div>
      </main>

      {/* Notificación flotante elegante */}
      <SignInToast message={toastMessage} />
    </div>
  );
};
