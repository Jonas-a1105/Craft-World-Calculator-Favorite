import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { LandingCookiesSection } from '../types';

export interface CookiePreferencesState {
  strictlyNecessary: boolean;
  performance: boolean;
  targeting: boolean;
  savedAt?: string;
}

const STORAGE_KEY = 'craft_cookie_preferences';

export interface CookiePreferencesModalProps {
  cookies: LandingCookiesSection;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (preferences: CookiePreferencesState) => void;
}

export const CookiePreferencesModal: React.FC<CookiePreferencesModalProps> = ({
  cookies,
  isOpen,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'strictly_necessary' | 'performance' | 'targeting'>('strictly_necessary');
  const [performanceEnabled, setPerformanceEnabled] = useState(false);
  const [targetingEnabled, setTargetingEnabled] = useState(false);

  // Load persisted preferences
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: CookiePreferencesState = JSON.parse(stored);
        setPerformanceEnabled(Boolean(parsed.performance));
        setTargetingEnabled(Boolean(parsed.targeting));
      }
    } catch {
      // ignore JSON parse error
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSavePreferences = () => {
    const preferences: CookiePreferencesState = {
      strictlyNecessary: true,
      performance: performanceEnabled,
      targeting: targetingEnabled,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // storage unavailable
    }
    if (onSave) onSave(preferences);
    onClose();
  };

  const handleAcceptAll = () => {
    const preferences: CookiePreferencesState = {
      strictlyNecessary: true,
      performance: true,
      targeting: true,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // storage unavailable
    }
    setPerformanceEnabled(true);
    setTargetingEnabled(true);
    if (onSave) onSave(preferences);
    onClose();
  };

  // Determine active category content
  const activeCategory =
    activeTab === 'strictly_necessary'
      ? cookies.strictlyNecessary
      : activeTab === 'performance'
      ? cookies.performance
      : cookies.targeting;

  const isCurrentEnabled =
    activeTab === 'strictly_necessary'
      ? true
      : activeTab === 'performance'
      ? performanceEnabled
      : targetingEnabled;

  const toggleCurrent = () => {
    if (activeTab === 'performance') {
      setPerformanceEnabled((prev) => !prev);
    } else if (activeTab === 'targeting') {
      setTargetingEnabled((prev) => !prev);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[620px] bg-[#1c1c20] rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden border-0">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2
            id="cookie-modal-title"
            className="text-xl sm:text-2xl font-bold tracking-tight text-white"
          >
            {cookies.title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border-0 outline-none"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
          {cookies.subtitle}
        </p>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-stretch mb-6">
          {/* Left Tabs List */}
          <div className="sm:col-span-5 flex flex-col gap-2">
            {/* Tab 1: Strictly Necessary */}
            <button
              type="button"
              onClick={() => setActiveTab('strictly_necessary')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all text-left cursor-pointer border-0 outline-none ${
                activeTab === 'strictly_necessary'
                  ? 'bg-[#24252e] text-amber-400 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#202024] font-medium'
              }`}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="truncate">{cookies.strictlyNecessary.tabLabel}</span>
            </button>

            {/* Tab 2: Performance */}
            <button
              type="button"
              onClick={() => setActiveTab('performance')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all text-left cursor-pointer border-0 outline-none ${
                activeTab === 'performance'
                  ? 'bg-[#24252e] text-amber-400 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#202024] font-medium'
              }`}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span className="truncate">{cookies.performance.tabLabel}</span>
            </button>

            {/* Tab 3: Targeting */}
            <button
              type="button"
              onClick={() => setActiveTab('targeting')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all text-left cursor-pointer border-0 outline-none ${
                activeTab === 'targeting'
                  ? 'bg-[#24252e] text-amber-400 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#202024] font-medium'
              }`}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span className="truncate">{cookies.targeting.tabLabel}</span>
            </button>
          </div>

          {/* Right Detail Card */}
          <div className="sm:col-span-7 bg-[#151518] rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[160px] border-0">
            <div>
              {/* Category Header Row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {activeCategory.title}
                  </span>
                  {activeCategory.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#24252e] text-amber-400 border-0">
                      {activeCategory.badge}
                    </span>
                  )}
                </div>

                {/* Switch Toggle */}
                {activeTab === 'strictly_necessary' ? (
                  <div
                    aria-label="Always active"
                    className="w-10 h-5 bg-[#2a2a2e] rounded-full p-0.5 flex items-center justify-end opacity-85 cursor-not-allowed border-0"
                  >
                    <div className="w-4 h-4 rounded-full bg-zinc-400" />
                  </div>
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isCurrentEnabled}
                    onClick={toggleCurrent}
                    className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors duration-200 cursor-pointer border-0 outline-none ${
                      isCurrentEnabled ? 'bg-amber-400 justify-end' : 'bg-zinc-800 justify-start'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full transition-colors duration-200 ${
                        isCurrentEnabled ? 'bg-zinc-950' : 'bg-zinc-500'
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {activeCategory.description}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-0">
          <Link
            to="/privacy"
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-amber-400 transition-colors underline-offset-4 hover:underline order-2 sm:order-1"
          >
            {activeTab === 'strictly_necessary' ? 'Política de Privacidad completa' : 'Full Privacy Policy'}
          </Link>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end order-1 sm:order-2">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#24252e] hover:bg-[#2e303a] active:scale-95 transition-all cursor-pointer border-0 outline-none"
            >
              {cookies.savePreferences}
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-md cursor-pointer border-0 outline-none"
            >
              {cookies.acceptAll}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
