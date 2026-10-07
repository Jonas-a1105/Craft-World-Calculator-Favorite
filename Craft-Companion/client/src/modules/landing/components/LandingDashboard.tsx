import React from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingDeveloperSuite } from './LandingDeveloperSuite';
import { LandingImpact } from './LandingImpact';
import { LandingPricing } from './LandingPricing';
import { LandingFaq } from './LandingFaq';
import { LandingFooter } from './LandingFooter';
import { CookiePreferencesModal } from './CookiePreferencesModal';
import { LANDING_CONTENT } from '../landingContent';

export const LandingDashboard: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const currentLang = language === 'es' ? 'es' : 'en';
  const content = LANDING_CONTENT[currentLang];
  const [isCookieModalOpen, setIsCookieModalOpen] = React.useState(false);

  useDocumentTitle(
    currentLang === 'es'
      ? 'Calculadora de Economía y Producción para CraftWorld'
      : 'CraftWorld Economy & Factory Calculator'
  );

  return (
    <div className="min-h-screen w-full bg-[#141415] text-white flex flex-col font-main selection:bg-amber-400/20 selection:text-amber-300 relative overflow-x-hidden">
      {/* Top Floating Navbar */}
      <LandingNavbar
        content={content}
        language={currentLang}
        onToggleLanguage={(newLang) => setLanguage(newLang)}
      />

      {/* Main Content Sections */}
      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <LandingHero content={content} />

        {/* Developer Suite Section */}
        <LandingDeveloperSuite suite={content.suite} />

        {/* Impact & Testimonials Infinite Scroll Section */}
        <LandingImpact impact={content.impact} />

        {/* Simple Predictable Pricing Section */}
        <LandingPricing pricing={content.pricing} />

        {/* Frequently Asked Questions Section */}
        <LandingFaq faq={content.faq} />
      </main>

      {/* Final Call to Action & Footer */}
      <LandingFooter
        footer={content.footer}
        onOpenCookieModal={() => setIsCookieModalOpen(true)}
      />

      {/* Floating Quick-Access Cookie Preferences Button */}
      <button
        type="button"
        aria-label="Privacy and Cookie Preferences"
        onClick={() => setIsCookieModalOpen(true)}
        className="fixed bottom-5 left-5 z-40 bg-[#1c1c20] hover:bg-[#24252e] text-zinc-300 hover:text-white border-0 outline-none px-3.5 py-2 rounded-full shadow-lg backdrop-blur-md text-xs font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        style={{ border: 'none', outline: 'none' }}
      >
        <svg
          className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span className="hidden sm:inline">Cookies</span>
      </button>

      {/* Privacy Preferences Modal */}
      <CookiePreferencesModal
        cookies={content.cookies}
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
      />
    </div>
  );
};

export default LandingDashboard;
