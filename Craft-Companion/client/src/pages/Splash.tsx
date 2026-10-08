import React from 'react';
import { SplashScreen } from '../modules/splash/components/SplashScreen';
import { useTranslation } from '../utils/i18n';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Splash() {
  const { language } = useTranslation();

  useDocumentTitle(
    language === 'es'
      ? 'Craft World - Iniciando Ecosistema'
      : 'Craft World - Launching Ecosystem',
  );

  return <SplashScreen />;
}
