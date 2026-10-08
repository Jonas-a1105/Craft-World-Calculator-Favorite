import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import { FloatingDock } from './layout/nav';
import { useTranslation } from '../utils/i18n';
import { useFactoryNotifications } from '../hooks/useFactoryNotifications';

export interface LayoutProps {
  children: React.ReactNode;
  fluid?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, fluid = false }) => {
  const { language } = useTranslation();
  const location = useLocation();

  // Run background factory notifications safely in custom hook
  useFactoryNotifications(language);

  return (
    <div className="min-h-screen flex flex-col font-main selection:bg-game-blue/30 selection:text-white relative">
      <Navbar />
      <div className={`${fluid ? 'w-full px-2 sm:px-4' : 'app-container px-3 md:px-6'} flex-grow w-full pt-[64px] sm:pt-[72px]`}>
        <main key={location.pathname} className="w-full pb-28 sm:pb-32 route-view">{children}</main>
      </div>
      <Footer />
      <FloatingDock />
    </div>
  );
};


export default Layout;
