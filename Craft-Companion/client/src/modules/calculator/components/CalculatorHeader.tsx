import React from 'react';

interface CalculatorHeaderProps {
  language: string;
}

export const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({ language }) => {
  return (
    <div className="text-center mt-4 mb-2">
      <h1
        className="text-3xl font-extrabold text-white tracking-wider"
        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
      >
        {language === 'es'
          ? 'Calculadora de Crafteo y Producción'
          : 'Craft & Production Calculator'}
      </h1>
      <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
        {language === 'es'
          ? 'Calcula la producción, requerimientos de insumos, tiempo de ciclo y ganancias.'
          : 'Calculate production, input requirements, cycle time, and profits.'}
      </p>
    </div>
  );
};
