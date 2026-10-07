import { useSignIn } from '../hooks/useSignIn';
import { SignInHeader } from './SignInHeader';
import { SignInButton } from './SignInButton';
import { SignInErrorAlert } from './SignInErrorAlert';
import { SignInFooter } from './SignInFooter';

export const SignInDashboard = () => {
  const {
    t,
    language,
    errorMessage,
    isLoading,
    handleConnectOAuth,
    handleQuickLogin,
  } = useSignIn();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative z-10 py-12">
      <div className="bg-[#1c1c20] rounded-3xl border-none shadow-2xl p-6 md:p-8 max-w-md w-full space-y-6 transform hover:scale-[1.005] transition-transform duration-300">
        <SignInHeader language={language} title={t('signin.title')} />

        <div className="space-y-3">
          <SignInButton
            label={t('signin.connectOAuth')}
            onClick={handleConnectOAuth}
            isLoading={isLoading}
          />

          <button
            type="button"
            onClick={() => handleQuickLogin()}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-[12px] bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer border-none flex items-center justify-center gap-2"
          >
            {language === 'es'
              ? 'Acceso Rápido / Modo Invitado'
              : 'Quick Access / Guest Demo'}
          </button>
        </div>

        <SignInErrorAlert message={errorMessage} />

        <SignInFooter language={language} />
      </div>
    </div>
  );
};
