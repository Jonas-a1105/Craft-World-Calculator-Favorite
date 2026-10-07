import React from 'react';
import { COLOR_PRESETS } from '../services/settingsService';
import { MoonBold, PaletteBold, GlobalBold } from 'solar-icon-set';

export interface SettingsAppearanceCardProps {
  isDarkMode: boolean;
  onToggleTheme: (nextDark: boolean) => void;
  solidBg: boolean;
  onToggleSolidBg: (val: boolean) => void;
  solidColor: string;
  onColorChange: (val: string) => void;
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;
}

export const SettingsAppearanceCard: React.FC<SettingsAppearanceCardProps> = ({
  isDarkMode,
  onToggleTheme,
  solidBg,
  onToggleSolidBg,
  solidColor,
  onColorChange,
  language,
  setLanguage,
}) => {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase px-4 block">
        {language === 'es' ? 'Apariencia y Pantalla' : 'Appearance & Display'}
      </span>

      <div className="bg-[#18181b] rounded-[32px] shadow-xl overflow-hidden">
        {/* Row 0: Modo Oscuro (Dark Mode) Toggle */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <MoonBold className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {language === 'es' ? 'Modo Oscuro' : 'Dark Mode'}
              </span>
              <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                {language === 'es'
                  ? 'Tema visual de la interfaz'
                  : 'Interface visual theme'}
              </span>
            </div>
          </div>

          {/* iOS Switch */}
          <button
            type="button"
            onClick={() => onToggleTheme(!isDarkMode)}
            className={`w-12 h-7 rounded-full transition-colors duration-200 p-0.5 flex items-center cursor-pointer flex-shrink-0 ${
              isDarkMode ? 'bg-emerald-500' : 'bg-[#27272a]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                isDarkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Subtle Divider */}
        <div className="h-px bg-white/[0.04]" />

        {/* Row 1: Solid Background Toggle */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
              <PaletteBold className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {language === 'es'
                  ? 'Fondo Sólido OLED'
                  : 'Solid OLED Background'}
              </span>
              <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                {language === 'es'
                  ? 'Alto contraste y ahorro energético'
                  : 'High contrast & eco power'}
              </span>
            </div>
          </div>

          {/* Mobile iOS Switch */}
          <button
            type="button"
            onClick={() => onToggleSolidBg(!solidBg)}
            className={`w-12 h-7 rounded-full transition-colors duration-200 p-0.5 flex items-center cursor-pointer flex-shrink-0 ${
              solidBg ? 'bg-emerald-500' : 'bg-[#27272a]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                solidBg ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Row 2: Pure Color Circles Only */}
        {solidBg && (
          <div className="px-5 pb-5 pt-1 flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
            {COLOR_PRESETS.map((preset) => {
              const isSelected =
                solidColor.toLowerCase() === preset.value.toLowerCase();
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => onColorChange(preset.value)}
                  title={preset.label}
                  className={`w-8 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#18181b] scale-110 shadow-lg'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.value }}
                >
                  {isSelected && (
                    <svg
                      className="w-3.5 h-3.5 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Subtle Divider */}
        <div className="h-px bg-white/[0.04]" />

        {/* Row 3: Language Selector */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0">
              <GlobalBold className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {language === 'es' ? 'Idioma de la App' : 'App Language'}
              </span>
              <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                {language === 'es'
                  ? 'Español / English'
                  : 'English / Spanish'}
              </span>
            </div>
          </div>

          {/* Segmented Pill Selector */}
          <div className="flex items-center bg-[#222228] p-1 rounded-full gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                language === 'es'
                  ? 'bg-emerald-500 text-black shadow-sm font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-emerald-500 text-black shadow-sm font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
