import React from 'react';
import { SettingsBoldDuotone } from 'solar-icon-set';
import Card from '../../../components/Card';
import Select from '../../../components/ui/Select';
import type { SimulationMode } from '../../profitability/types';
import type { PlotFactoryInstanceDetail } from '../../profitability/services/cycleAdjuster';

interface CalculatorSelectionCardProps {
  language: string;
  selectedToken: string;
  selectedLevel: number;
  uniqueTokens: string[];
  availableLevels: number[];
  simulationMode: SimulationMode;
  activePlotDetail?: PlotFactoryInstanceDetail;
  onSelectToken: (token: string) => void;
  onSelectLevel: (level: number) => void;
  onSelectSimulationMode: (mode: SimulationMode) => void;
}

export const CalculatorSelectionCard: React.FC<CalculatorSelectionCardProps> = ({
  language,
  selectedToken,
  selectedLevel,
  uniqueTokens,
  availableLevels,
  simulationMode,
  activePlotDetail,
  onSelectToken,
  onSelectLevel,
  onSelectSimulationMode,
}) => {
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <SettingsBoldDuotone size={18} className="text-amber-400" />
          {language === 'es' ? 'Seleccionar Fábrica y Nivel' : 'Select Factory & Level'}
        </span>
      }
    >
      <div className="space-y-4">
        {/* Simulation Mode Toggle */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#141416] rounded-xl text-xs">
          <button
            type="button"
            onClick={() => onSelectSimulationMode('base')}
            className={`py-2 px-2.5 rounded-lg font-bold text-center transition-all cursor-pointer truncate ${
              simulationMode === 'base'
                ? 'bg-[#222227] text-white shadow ring-1 ring-emerald-400/80'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🏛️ {language === 'es' ? 'Base (1x)' : 'Base (1x)'}
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectSimulationMode('active_owned');
              if (activePlotDetail) onSelectLevel(activePlotDetail.level);
            }}
            className={`py-2 px-2.5 rounded-lg font-bold text-center transition-all cursor-pointer truncate ${
              simulationMode === 'active_owned'
                ? 'bg-[#222227] text-white shadow ring-1 ring-emerald-400/80'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🚜 {language === 'es' ? 'Mi Parcela' : 'My Plot'}
          </button>
          <button
            type="button"
            onClick={() => onSelectSimulationMode('projected')}
            className={`py-2 px-2.5 rounded-lg font-bold text-center transition-all cursor-pointer truncate ${
              simulationMode === 'projected'
                ? 'bg-[#222227] text-white shadow ring-1 ring-emerald-400/80'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🚀 {language === 'es' ? 'Proyección' : 'Projected'}
          </button>
        </div>

        {/* Owned Plot Notification Banner */}
        {activePlotDetail && (
          <div className="flex items-center justify-between p-2.5 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-medium">
                {language === 'es'
                  ? `Tienes ${selectedToken} Nivel ${activePlotDetail.level} en tu parcela`
                  : `You own ${selectedToken} Lv. ${activePlotDetail.level} on your plot`}
              </span>
            </div>
            {selectedLevel !== activePlotDetail.level && (
              <button
                type="button"
                onClick={() => onSelectLevel(activePlotDetail.level)}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                {language === 'es' ? 'Usar mi nivel' : 'Use my level'}
              </button>
            )}
          </div>
        )}

        {/* Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={language === 'es' ? 'Recurso / Fábrica:' : 'Resource / Factory:'}
            value={selectedToken}
            onChange={(e) => onSelectToken(e.target.value)}
          >
            {uniqueTokens.map((token) => (
              <option key={token} value={token}>
                {token}
              </option>
            ))}
          </Select>

          <Select
            label={language === 'es' ? 'Nivel de Fábrica:' : 'Factory Level:'}
            value={selectedLevel}
            onChange={(e) => onSelectLevel(Number(e.target.value))}
          >
            {availableLevels.map((lvl) => (
              <option key={lvl} value={lvl}>
                Nivel {lvl} {activePlotDetail?.level === lvl ? '★ (Tu Nivel)' : ''}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </Card>
  );
};
