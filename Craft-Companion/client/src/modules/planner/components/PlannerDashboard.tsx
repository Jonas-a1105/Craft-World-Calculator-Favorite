import React from 'react';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useTranslation } from '../../../utils/i18n';
import { useResourcePlanner } from '../hooks/useResourcePlanner';
import { PlannerHeader } from './PlannerHeader';
import { GoalSelectorCard } from './GoalSelectorCard';
import { PlannerTabsNav } from './PlannerTabsNav';
import { MaterialsGrid } from './MaterialsGrid';
import { CraftingStepsList } from './CraftingStepsList';

export const PlannerDashboard: React.FC = () => {
  const { language } = useTranslation();
  const {
    loading,
    targetToken,
    setTargetToken,
    targetAmount,
    setTargetAmount,
    tokenOptions,
    userResources,
    kpiStats,
    viewTab,
    setViewTab,
    materialFilter,
    setMaterialFilter,
    craftingSteps,
    filteredMaterialEntries,
    copiedNotification,
    handleCopyMissing,
  } = useResourcePlanner();

  if (loading) {
    return <SkeletonDashboardPage />;
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-12">
      <PlannerHeader />

      <GoalSelectorCard
        targetToken={targetToken}
        setTargetToken={setTargetToken}
        targetAmount={targetAmount}
        setTargetAmount={setTargetAmount}
        tokenOptions={tokenOptions}
        userResources={userResources}
        kpiStats={kpiStats}
      />

      <div className="space-y-4">
        <PlannerTabsNav
          viewTab={viewTab}
          setViewTab={setViewTab}
          materialFilter={materialFilter}
          setMaterialFilter={setMaterialFilter}
          kpiStats={kpiStats}
          craftingStepsCount={craftingSteps.length}
          copiedNotification={copiedNotification}
          onCopyMissing={handleCopyMissing}
        />

        {viewTab === 'materials' && (
          <MaterialsGrid
            filteredMaterialEntries={filteredMaterialEntries}
            language={language}
          />
        )}

        {viewTab === 'steps' && (
          <CraftingStepsList
            craftingSteps={craftingSteps}
            language={language}
          />
        )}
      </div>
    </div>
  );
};
