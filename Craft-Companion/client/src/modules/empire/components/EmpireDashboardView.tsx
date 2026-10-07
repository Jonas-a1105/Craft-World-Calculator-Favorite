import React from 'react';
import Layout from '../../../components/Layout';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useEmpireDashboard } from '../hooks/useEmpireDashboard';
import { EmpireHeader } from './EmpireHeader';
import { EmpireOverviewBar } from './EmpireOverviewBar';
import { EmpireLandPlotsList } from './EmpireLandPlotsList';
import { EmpireWorkersRoster } from './EmpireWorkersRoster';
import { EmpireBaseStructures } from './EmpireBaseStructures';

export const EmpireDashboardView: React.FC = () => {
  const {
    language,
    loading,
    stats,
    buildingSummary,
    landPlots,
    workers,
    playerBase,
  } = useEmpireDashboard();

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[1200px] mx-auto space-y-6">
        <EmpireHeader language={language} />

        <EmpireOverviewBar stats={stats} language={language} />

        <EmpireLandPlotsList landPlots={landPlots} language={language} />

        <EmpireWorkersRoster workers={workers} language={language} />

        <EmpireBaseStructures
          buildingSummary={buildingSummary}
          totalStructures={playerBase.length}
          language={language}
        />
      </div>
    </Layout>
  );
};
