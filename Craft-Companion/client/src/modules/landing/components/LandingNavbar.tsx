import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { LandingTranslations } from '../types';

interface LandingNavbarProps {
  content: LandingTranslations;
  language: 'es' | 'en';
  onToggleLanguage: (lang: 'es' | 'en') => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  content,
  language,
  onToggleLanguage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: language === 'es' ? 'Inicio' : 'Home', href: '#' },
    { label: content.nav.features || content.nav.platform, href: '#features' },
    { label: content.nav.impact || content.nav.caseStudies, href: '#impact' },
    { label: content.nav.pricing, href: '#pricing' },
    { label: content.nav.faq || 'FAQ', href: '#faq' },
  ];

  return (
    <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between relative z-30">
      {/* Brand Logo & Name placed directly on the background */}
      <Link to="/" className="flex items-center gap-3 group">
        <img
          src="/assets/logo.png"
          alt="Craft World Logo"
          className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
        />
        <span className="font-bold text-base sm:text-lg text-white tracking-tight">
          {content.brandName}
        </span>
      </Link>

      {/* Desktop Navigation Links directly on the background */}
      <nav className="hidden md:flex items-center gap-7 lg:gap-8">
        {navLinks.slice(1).map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Right Actions: Language Switcher, Launch Companion Button & Mobile Toggle */}
      <div className="flex items-center gap-3">
        {/* Bilingual Switcher (ES / EN) */}
        <button
          type="button"
          onClick={() => onToggleLanguage(language === 'es' ? 'en' : 'es')}
          className="flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#202024] hover:bg-[#28282e] text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm border-0 outline-none"
          title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        >
          <span className={language === 'es' ? 'text-amber-400 font-bold' : 'text-zinc-500'}>ES</span>
          <span className="mx-1 text-zinc-600">/</span>
          <span className={language === 'en' ? 'text-amber-400 font-bold' : 'text-zinc-500'}>EN</span>
        </button>

        {/* Launch Companion Button (Rounded pill in amber-400) */}
        <Link
          to="/signin"
          className="hidden sm:inline-flex items-center justify-center bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all shadow-md active:scale-95 border-0 outline-none"
        >
          {content.nav.scheduleDemo}
        </Link>

        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#202024] transition-colors border-0 outline-none cursor-pointer"
          aria-label="Open Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer/Modal Menu placed at top with minimal separation and fast smooth transition */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-3 pt-3 sm:pt-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div
            className="w-full max-w-[340px] bg-[#1c1c20] rounded-[28px] p-6 shadow-2xl flex flex-col items-center relative border-0 outline-none route-view"
            style={{
              animation: 'routeFadeSlide 180ms cubic-bezier(0.16, 1, 0.3, 1) both',
              willChange: 'opacity, transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translate3d(0, 0, 0)',
            }}
          >
            {/* Modal Header: Logo + Brand Name on left, Circular (X) close button on right */}
            <div className="w-full flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/logo.png"
                  alt="Craft World Logo"
                  className="h-7 w-auto object-contain"
                />
                <span className="font-bold text-base text-white tracking-tight">
                  {content.brandName}
                </span>
              </div>

              {/* Circular Close Button (X) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-[#24252e] hover:bg-[#2e303a] text-zinc-400 hover:text-white flex items-center justify-center transition-colors border-0 outline-none cursor-pointer"
                aria-label="Close menu"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Vertical Navigation Links - Completely transparent without any background box */}
            <div
              className="w-full flex flex-col items-center gap-1 mb-5"
              style={{ background: 'transparent' }}
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-zinc-300 hover:text-white text-base font-semibold py-2 transition-colors tracking-tight text-center w-full"
                  style={{ background: 'transparent' }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Primary Action Button (Launch Companion) */}
            <Link
              to="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold py-3.5 px-6 rounded-full text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border-0 outline-none"
            >
              <span>{content.nav.scheduleDemo}</span>
            </Link>

            {/* Language Switcher Button in Modal */}
            <button
              type="button"
              onClick={() => onToggleLanguage(language === 'es' ? 'en' : 'es')}
              className="mt-3 flex items-center justify-center text-xs font-semibold px-4 py-1.5 rounded-full bg-[#24252e] hover:bg-[#2e303a] text-zinc-300 transition-colors border-0 outline-none cursor-pointer"
            >
              <span className={language === 'es' ? 'text-amber-400 font-bold' : 'text-zinc-500'}>ES</span>
              <span className="mx-1.5 text-zinc-600">/</span>
              <span className={language === 'en' ? 'text-amber-400 font-bold' : 'text-zinc-500'}>EN</span>
            </button>

            {/* Subtle Divider */}
            <div className="w-full border-t border-white/[0.06] my-5" />

            {/* Bottom Row of 4 Social / Ecosystem Icon Buttons */}
            <div className="flex items-center justify-center gap-3 w-full">
              {/* Official Game Website */}
              <a
                href="https://craftworld.game"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Craft World Official Website"
                className="w-10 h-10 rounded-xl bg-[#24252e] hover:bg-[#2e303a] text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors border-0 outline-none"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-10 h-10 rounded-xl bg-[#24252e] hover:bg-[#2e303a] text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors border-0 outline-none"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Discord */}
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord Community"
                className="w-10 h-10 rounded-xl bg-[#24252e] hover:bg-[#2e303a] text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors border-0 outline-none"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="w-10 h-10 rounded-xl bg-[#24252e] hover:bg-[#2e303a] text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors border-0 outline-none"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
