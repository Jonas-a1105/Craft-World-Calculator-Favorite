import React from 'react';
import Layout from '../../../components/Layout';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useCalculator } from '../hooks/useCalculator';
import { CalculatorHeader } from './CalculatorHeader';
import { CalculatorSelectionCard } from './CalculatorSelectionCard';
import { CalculatorOutputCard } from './CalculatorOutputCard';
import { CalculatorFinancialCard } from './CalculatorFinancialCard';

export const CalculatorDashboard: React.FC = () => {
  const {
    language,
    loading,
    selectedToken,
    selectedLevel,
    uniqueTokens,
    availableLevels,
    cycle,
    handleTokenChange,
    handleLevelChange,
  } = useCalculator();

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[1000px] mx-auto space-y-6">
        <CalculatorHeader language={language} />

        <CalculatorSelectionCard
          language={language}
          selectedToken={selectedToken}
          selectedLevel={selectedLevel}
          uniqueTokens={uniqueTokens}
          availableLevels={availableLevels}
          onSelectToken={handleTokenChange}
          onSelectLevel={handleLevelChange}
        />

        {cycle && (
          <div className="grid gap-4 md:grid-cols-2">
            <CalculatorOutputCard language={language} cycle={cycle} />
            <CalculatorFinancialCard language={language} cycle={cycle} />
          </div>
        )}
      </div>
    </Layout>
  );
};
