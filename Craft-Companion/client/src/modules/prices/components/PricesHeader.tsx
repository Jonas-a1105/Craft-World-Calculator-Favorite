import React from 'react';

interface PricesHeaderProps {
  language: string;
}

export const PricesHeader: React.FC<PricesHeaderProps> = ({ language }) => {
  return (
    <div className="text-center mt-4 mb-2">
      <h1
        className="text-3xl font-extrabold text-white tracking-wider font-main"
        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
      >
        {language === 'es' ? 'Precios del Mercado' : 'Market Prices'}
      </h1>
      <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
        {language === 'es'
          ? 'Lista oficial de precios en vivo del juego con recomendación de mercado.'
          : 'Official live game price list with market recommendations.'}
      </p>
    </div>
  );
};
