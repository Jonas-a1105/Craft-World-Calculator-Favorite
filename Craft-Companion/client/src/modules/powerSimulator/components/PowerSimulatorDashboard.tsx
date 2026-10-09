import React from 'react';
import Layout from '../../../components/Layout';
import { usePowerSimulator } from '../hooks/usePowerSimulator';
import { PowerSimulatorHeader } from './PowerSimulatorHeader';
import { PassiveProductionSection } from './PassiveProductionSection';
import { FreeOutputSection } from './FreeOutputSection';
import { DisabledPowerPlantsSection } from './DisabledPowerPlantsSection';
import { PowerPacksSection } from './PowerPacksSection';
import { TotalEffectiveCostSection } from './TotalEffectiveCostSection';
import { CostComparisonTable } from './CostComparisonTable';

export const PowerSimulatorDashboard: React.FC = () => {
  const {
    language,
    coinUsdPrice,
    airstream,
    sunforge,
    packState,
    updateAirstreamLevel,
    updateAirstreamCount,
    updateSunforgeLevel,
    updateSunforgeCount,
    updateCapacity,
    updatePacks25,
    updatePacks50,
    updatePacks100,
    toggleCrystalPass,
    airstreamHourly,
    sunforgeHourly,
    summary,
    comparisonRows,
  } = usePowerSimulator();

  return (
    <Layout>
      <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-16">
        {/* Module Header */}
        <PowerSimulatorHeader language={language} />

        {/* 1. Passive Production */}
        <PassiveProductionSection
          airstream={airstream}
          sunforge={sunforge}
          airstreamHourly={airstreamHourly}
          sunforgeHourly={sunforgeHourly}
          onAirstreamLevelChange={updateAirstreamLevel}
          onAirstreamCountChange={updateAirstreamCount}
          onSunforgeLevelChange={updateSunforgeLevel}
          onSunforgeCountChange={updateSunforgeCount}
          language={language}
        />

        {/* 1.1 Free Output Bars & Totals */}
        <FreeOutputSection
          airstreamHourly={airstreamHourly}
          sunforgeHourly={sunforgeHourly}
          freePowerDaily={summary.freePowerDaily}
          language={language}
        />

        {/* Separator */}
        <div className="h-px w-full bg-white/5 my-2" />

        {/* 2. Disabled Power Plants (Steamforge & Reactor) */}
        <DisabledPowerPlantsSection language={language} />

        {/* Separator */}
        <div className="h-px w-full bg-white/5 my-2" />

        {/* 3. Power Packs Configuration */}
        <PowerPacksSection
          packState={packState}
          onCapacityChange={updateCapacity}
          onPacks25Change={updatePacks25}
          onPacks50Change={updatePacks50}
          onPacks100Change={updatePacks100}
          language={language}
        />

        {/* Separator */}
        <div className="h-px w-full bg-white/5 my-2" />

        {/* 4. Total Effective Cost / 100k */}
        <TotalEffectiveCostSection
          summary={summary}
          activateCrystalPass={packState.activateCrystalPass}
          onToggleCrystalPass={toggleCrystalPass}
          language={language}
        />

        {/* Separator */}
        <div className="h-px w-full bg-white/5 my-2" />

        {/* 5. Cost Comparison Table */}
        <CostComparisonTable
          rows={comparisonRows}
          coinUsdPrice={coinUsdPrice}
          language={language}
        />
      </div>
    </Layout>
  );
};
