import React, { useState } from 'react';
import { LevelProgression } from '../types';
import { ExecutiveAreaChart } from './ExecutiveAreaChart';
import { ExecutiveBarChart } from './ExecutiveBarChart';
import { formatCompact, formatWithCommas } from '../utils/formatters';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  levels: LevelProgression[];
}

export const ChartsRow: React.FC<Props> = ({ levels }) => {
  const { language } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number>(
    levels.length > 0 ? levels.length - 1 : 0
  );

  const prodData = levels.map((l) => ({ level: l.level, value: l.prodPerDay }));
  const powerData = levels.map((l) => ({ level: l.level, value: l.power }));
  const outputData = levels.map((l) => ({ level: l.level, value: l.outputAmount }));

  if (levels.length === 0) return null;

  // Clamped index for safety when switching items with different max levels
  const safeIndex = Math.min(selectedIndex, levels.length - 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6 w-full min-w-0 border-none">
      {/* 1. Producción por Día - Adapted Executive Area Curve */}
      <ExecutiveAreaChart
        title={language === 'es' ? 'PRODUCCIÓN / DÍA' : 'PRODUCTION / DAY'}
        data={prodData}
        color="#22c55e"
        gradientId="grad-prod-executive"
        infoTooltip={language === 'es' ? 'Rendimiento diario proyectado a lo largo de los niveles' : 'Projected daily production across all levels'}
        valueFormatter={formatCompact}
        selectedIndex={safeIndex}
        onSelectIndex={setSelectedIndex}
        icon={
          <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        }
      />

      {/* 2. Energía - Exact Executive 30-Segment Barcode Wave Bar Chart */}
      <ExecutiveBarChart
        title={language === 'es' ? 'COSTE DE ENERGÍA' : 'POWER COST'}
        data={powerData}
        accentColor="#f59e0b"
        infoTooltip={language === 'es' ? 'Consumo de energía por ciclo escalonado por nivel' : 'Energy cost per cycle stepped across levels'}
        selectedIndex={safeIndex}
        onSelectIndex={setSelectedIndex}
      />

      {/* 3. Producción por Ciclo - Adapted Executive Area Curve */}
      <ExecutiveAreaChart
        title={language === 'es' ? 'PRODUCCIÓN / CICLO' : 'OUTPUT / CYCLE'}
        data={outputData}
        color="#ff6200"
        gradientId="grad-output-executive"
        infoTooltip={language === 'es' ? 'Cantidad obtenida por cada ciclo de producción' : 'Amount produced per production cycle'}
        valueFormatter={formatWithCommas}
        selectedIndex={safeIndex}
        onSelectIndex={setSelectedIndex}
        icon={
          <svg className="w-3.5 h-3.5 text-orange-400 shrink-0 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        }
      />
    </div>
  );
};
