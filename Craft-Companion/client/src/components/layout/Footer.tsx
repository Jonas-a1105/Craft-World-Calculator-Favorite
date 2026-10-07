import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../utils/i18n';

export const Footer: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  return (
    <footer className="mt-12 py-8 text-center text-xs text-slate-400 border-none">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>Craft World Companion © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Link to="/privacy" className="hover:text-white transition-colors">
            {isEs ? 'Privacidad' : 'Privacy'}
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-white transition-colors">
            {isEs ? 'Términos' : 'Terms'}
          </Link>
          <span>•</span>
          <span>
            {isEs
              ? 'Herramienta comunitaria no oficial'
              : 'Unofficial Community Companion Tool'}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
