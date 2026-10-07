import React from 'react';
import Card from '../../../components/Card';
import { Input } from '../../../components/ui';
import { MagniferLinear } from 'solar-icon-set';

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
            leftIcon={<MagniferLinear className="w-4 h-4 text-slate-400" />}
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
