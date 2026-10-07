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
      <nav className="bg-[#141416]/95 backdrop-blur-md border border-white/[0.08] rounded-2xl px-5 sm:px-6 py-3.5 flex items-center justify-between shadow-2xl">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-105">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
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
            className="flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#202024] hover:bg-[#28282e] border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <span className={language === 'es' ? 'text-white font-bold' : 'text-zinc-500'}>ES</span>
            <span className="mx-1 text-zinc-600">/</span>
            <span className={language === 'en' ? 'text-white font-bold' : 'text-zinc-500'}>EN</span>
          </button>

          {/* Schedule a Demo Button */}
          <Link
            to="/signin"
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            {content.nav.scheduleDemo}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
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
        <div className="md:hidden mt-2 bg-[#141416]/95 backdrop-blur-md border border-white/[0.08] rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
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
