import React, { useState } from 'react';
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

  const navLinks = [
    { label: content.nav.features || content.nav.platform, href: '#features' },
    { label: content.nav.impact || content.nav.caseStudies, href: '#impact' },
    { label: content.nav.pricing, href: '#pricing' },
    { label: content.nav.faq || 'FAQ', href: '#faq' },
  ];

  return (
    <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 relative z-30">
      <nav className="bg-[#1c1c20]/95 backdrop-blur-md rounded-2xl px-5 sm:px-6 py-3.5 flex items-center justify-between shadow-2xl border-0">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/assets/logo.png"
            alt="Craft World Logo"
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-bold text-base sm:text-lg text-white tracking-tight">
            {content.brandName}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Actions: Language Switcher & Schedule a Demo Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Bilingual Switcher (ES / EN) */}
          <button
            type="button"
            onClick={() => onToggleLanguage(language === 'es' ? 'en' : 'es')}
            className="flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#24252e] hover:bg-[#2e303a] text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm border-0 outline-none"
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <span className={language === 'es' ? 'text-amber-400 font-bold' : 'text-zinc-500'}>ES</span>
            <span className="mx-1 text-zinc-600">/</span>
            <span className={language === 'en' ? 'text-amber-400 font-bold' : 'text-zinc-500'}>EN</span>
          </button>

          {/* Schedule a Demo Button */}
          <Link
            to="/signin"
            className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all shadow-sm active:scale-95 border-0 outline-none"
          >
            {content.nav.scheduleDemo}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border-0 outline-none"
            aria-label="Toggle Menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-[#1c1c20]/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex flex-col gap-3 border-0">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-300 hover:text-white text-sm font-medium py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
