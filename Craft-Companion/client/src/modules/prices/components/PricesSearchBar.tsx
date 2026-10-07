import React from 'react';
import Card from '../../../components/Card';
import { Input } from '../../../components/ui';

interface PricesSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  baseSymbol: string;
  language: string;
}

export const PricesSearchBar: React.FC<PricesSearchBarProps> = ({
  search,
  onSearchChange,
  baseSymbol,
  language,
}) => {
  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder={language === 'es' ? 'Buscar recurso...' : 'Search resource...'}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z"
                />
              </svg>
            }
          />
        </div>
        <div className="text-xs text-slate-400 font-bold self-end sm:self-center">
          {language === 'es' ? 'Moneda base:' : 'Base currency:'}{' '}
          <strong className="text-amber-400">{baseSymbol}</strong>
        </div>
      </div>
    </Card>
  );
};
