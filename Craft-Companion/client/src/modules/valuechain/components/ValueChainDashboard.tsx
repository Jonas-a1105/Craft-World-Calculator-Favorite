import React from 'react';
import Layout from '../../../components/Layout';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useValueChain } from '../hooks/useValueChain';
import { ValueChainHero } from './ValueChainHero';
import { ValueChainTargetSelector } from './ValueChainTargetSelector';
import { ValueChainKpiGrid } from './ValueChainKpiGrid';
import { ValueChainStepFlow } from './ValueChainStepFlow';
import { ValueChainBreakdownTable } from './ValueChainBreakdownTable';

export const ValueChainDashboard: React.FC = () => {
  const {
    language,
    loading,
    selectedToken,
    setSelectedToken,
    selectedLevel,
    handleLevelChange,
    mode,
    setMode,
    analysis,
  } = useValueChain();

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <ValueChainHero
          mode={mode}
          selectedLevel={selectedLevel}
          onModeChange={setMode}
          onLevelChange={handleLevelChange}
          language={language}
        />

        <ValueChainTargetSelector
          selectedToken={selectedToken}
          onSelectToken={setSelectedToken}
          language={language}
        />

        {analysis && (
          <>
            <ValueChainKpiGrid
              analysis={analysis}
              selectedToken={selectedToken}
              selectedLevel={selectedLevel}
              language={language}
            />

            <ValueChainStepFlow
              analysis={analysis}
              language={language}
            />

            <ValueChainBreakdownTable
              steps={analysis.steps}
              language={language}
            />
          </>
        )}
      </div>
    </Layout>
  );
};
