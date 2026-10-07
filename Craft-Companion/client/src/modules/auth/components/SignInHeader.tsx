import { Link } from 'react-router-dom';

interface SignInHeaderProps {
  language: string;
  title: string;
}

export const SignInHeader = ({ language, title }: SignInHeaderProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          ← {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
        </Link>
        <img
          src="/assets/logo.png"
          className="h-8 w-auto object-contain"
          alt="Craft World Logo"
        />
      </div>
      <div>
        <h1 className="text-2xl font-black text-white">{title}</h1>
        <p className="text-xs text-slate-400 mt-1">
          {language === 'es'
            ? 'Conéctate con tu cuenta de Craft World usando OAuth.'
            : 'Connect with your Craft World account using OAuth.'}
        </p>
      </div>
    </div>
  );
};
