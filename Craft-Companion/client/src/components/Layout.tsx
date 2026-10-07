import React from 'react';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import { useTranslation } from '../utils/i18n';
import { useFactoryNotifications } from '../hooks/useFactoryNotifications';

export interface LayoutProps {
  children: React.ReactNode;
  fluid?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, fluid = false }) => {
  const { language } = useTranslation();

  // Run background factory notifications safely in custom hook
  useFactoryNotifications(language);

  return (
    <div className="min-h-screen flex flex-col font-main selection:bg-game-blue/30 selection:text-white">
      <Navbar />
      <div className={`${fluid ? 'w-full px-2 sm:px-4' : 'app-container px-3 md:px-6'} flex-grow w-full`}>
        <main className="w-full pb-8">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
