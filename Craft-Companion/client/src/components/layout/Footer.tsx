import React from 'react';
import { useTranslation } from '../../utils/i18n';

export const Footer: React.FC = () => {
  const { language } = useTranslation();

  return (
    <footer className="mt-12 py-8 text-center text-xs text-slate-400 border-none">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>Craft World Companion © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>
            {language === 'es'
              ? 'Herramienta comunitaria no oficial'
              : 'Unofficial Community Companion Tool'}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
