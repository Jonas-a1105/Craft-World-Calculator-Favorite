import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../utils/i18n';

export interface DropdownOption<T extends string | number = string | number> {
  value: T;
  label: string;
  image?: string;
}

export interface DropdownProps<T extends string | number = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  placeholder?: string;
  searchable?: boolean;
}

export default function Dropdown<T extends string | number = string | number>({
  value,
  onChange,
  options,
  placeholder,
  searchable = true,
}: DropdownProps<T>) {
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || null;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selector button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 rounded border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-left text-sm text-white focus:outline-none focus:border-slate-500 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedOption?.image && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/60 p-0.5 shrink-0">
              <img
                src={selectedOption.image}
                alt={selectedOption.label}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder || 'Select...'}</span>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating menu */}
      {isOpen && (
        <div 
          className="absolute left-0 right-0 z-50 mt-1.5 flex flex-col rounded-xl shadow-2xl overflow-hidden max-h-[360px]"
          style={{
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {searchable && (
            <div className="p-2 shrink-0">
              <input
                type="text"
                placeholder={language === 'es' ? 'Buscar...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/10 transition-colors"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors cursor-pointer rounded-lg ${
                      isSelected
                        ? 'bg-white/[0.12] text-white font-bold'
                        : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {opt.image && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950/50 p-0.5 shrink-0">
                        <img src={opt.image} alt={opt.label} className="h-full w-full object-contain" />
                      </div>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-xs text-center text-slate-500">
                {language === 'es' ? 'No se encontraron resultados.' : 'No results found.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
