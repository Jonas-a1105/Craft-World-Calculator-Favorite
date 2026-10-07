import { Link } from 'react-router-dom';

interface SignInHeaderProps {
  language: string;
  title: string;
}

export const SignInHeader = ({ language, title }: SignInHeaderProps) => {
  return (
    <div className="space-y-2">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
      >
        ← {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
      </Link>
      <h1 className="text-2xl font-black text-white mt-2">{title}</h1>
      <p className="text-xs text-slate-400">
        {language === 'es'
          ? 'Conéctate con tu cuenta de Craft World usando OAuth.'
          : 'Connect with your Craft World account using OAuth.'}
      </p>
    </div>
  );
};
