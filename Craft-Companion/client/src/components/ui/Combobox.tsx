import React, { useEffect, useRef, useState } from 'react';

export interface ComboboxOption<T extends string | number = string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface ComboboxProps<T extends string | number = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: ComboboxOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  menuClassName?: string;
  wrapperClassName?: string;
  align?: 'left' | 'right' | 'full';
  showSearch?: boolean;
}

export function Combobox<T extends string | number = string | number>({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  className = '',
  menuClassName = '',
  wrapperClassName = '',
  align = 'full',
  showSearch,
}: ComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const selectedOption = options.find((opt) => opt.value === value) || null;

  useEffect(() => {
    if (!isOpen) setSearch('');
  }, [isOpen]);

  const filteredOptions = search.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.trim().toLowerCase())
      )
    : options;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const alignClasses =
    align === 'right'
      ? 'right-0 min-w-full sm:min-w-[180px]'
      : align === 'left'
      ? 'left-0 min-w-full sm:min-w-[180px]'
      : 'left-0 right-0 w-full';

  return (
    <div
      ref={containerRef}
      className={`relative text-left ${isOpen ? 'z-50' : 'z-10'} ${wrapperClassName || 'w-full'}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 bg-[#202024] hover:bg-[#28282e] text-white text-xs font-bold px-4 py-2.5 rounded-full border-none cursor-pointer transition-all focus:outline-none ${className}`}
      >
        <span className="truncate flex items-center gap-1.5">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Menu Popup */}
      {isOpen && (
        <div
          className={`absolute top-full z-50 mt-1.5 bg-[#18181b] rounded-2xl shadow-2xl p-1.5 border border-white/[0.08] animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-64 overflow-hidden ${alignClasses} ${menuClassName}`}
          style={{
            boxShadow: '0 16px 40px -6px rgba(0, 0, 0, 0.85)',
          }}
        >
          {(showSearch !== undefined ? showSearch : options.length > 6) && (
            <div className="p-1 pb-1.5 border-b border-white/[0.05] mb-1 flex-shrink-0">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredOptions.length > 0) {
                    e.preventDefault();
                    onChange(filteredOptions[0].value);
                    setIsOpen(false);
                  }
                }}
                placeholder={searchPlaceholder}
                className="w-full bg-[#121214] text-white text-xs px-3 py-1.5 rounded-xl border-none outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-sky-500/50"
                autoFocus
              />
            </div>
          )}
          <div className="space-y-0.5 overflow-y-auto modal-custom-scroll flex-1 min-h-0">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-zinc-500">
                Sin resultados
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full !bg-transparent flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer text-left transition-colors ${
                      isSelected
                        ? '!text-emerald-400 font-bold hover:!bg-white/[0.04]'
                        : '!text-zinc-300 hover:!text-white hover:!bg-white/[0.05]'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon}
                      {opt.label}
                    </span>
                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Combobox;
