import React from 'react';
import { LevelProgression } from '../types';
import { MiniMetricChart } from './MiniMetricChart';
import { formatCompact, formatWithCommas } from '../utils/formatters';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  levels: LevelProgression[];
}

export const ChartsRow: React.FC<Props> = ({ levels }) => {
  const { language } = useTranslation();

  const prodData = levels.map((l) => ({ level: l.level, value: l.prodPerDay }));
  const powerData = levels.map((l) => ({ level: l.level, value: l.power }));
  const outputData = levels.map((l) => ({ level: l.level, value: l.outputAmount }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
      <MiniMetricChart
        title={language === 'es' ? 'PRODUCCIÓN / DÍA' : 'PRODUCTION / DAY'}
        data={prodData}
        color="#22c55e"
        gradientId="grad-prod"
        valueFormatter={formatCompact}
      />

      <MiniMetricChart
        title={language === 'es' ? 'COSTE DE ENERGÍA' : 'POWER COST'}
        data={powerData}
        color="#38bdf8"
        gradientId="grad-power"
        isStepped={true}
        valueFormatter={(v) => v.toString()}
      />

      <MiniMetricChart
        title={language === 'es' ? 'PRODUCCIÓN / CICLO' : 'OUTPUT / CYCLE'}
        data={outputData}
        color="#fb923c"
        gradientId="grad-output"
        valueFormatter={formatWithCommas}
      />
    </div>
  );
};
