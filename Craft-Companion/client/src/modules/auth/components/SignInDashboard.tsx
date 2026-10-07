import { useSignIn } from '../hooks/useSignIn';
import { SignInHeader } from './SignInHeader';
import { SignInButton } from './SignInButton';
import { SignInErrorAlert } from './SignInErrorAlert';
import { SignInFooter } from './SignInFooter';

export const SignInDashboard = () => {
  const { t, language, errorMessage, handleConnectOAuth } = useSignIn();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative z-10 py-12">
      <div className="bg-[#1c1c20] rounded-3xl border-none shadow-2xl p-6 md:p-8 max-w-md w-full space-y-6 transform hover:scale-[1.005] transition-transform duration-300">
        <SignInHeader language={language} title={t('signin.title')} />

        <SignInButton
          label={t('signin.connectOAuth')}
          onClick={handleConnectOAuth}
        />

        <SignInErrorAlert message={errorMessage} />

        <SignInFooter language={language} />
      </div>
    </div>
  );
};
