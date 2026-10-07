import React from 'react';
import Layout from '../../../components/Layout';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useFactoryTimers } from '../hooks/useFactoryTimers';
import { FactoryTimersHeader } from './FactoryTimersHeader';
import { FactoryTimersGrid } from './FactoryTimersGrid';

export const FactoryTimersDashboard: React.FC = () => {
  const {
    language,
    loading,
    now,
    serverOffset,
    activeRuns,
    readyCount,
    notifPermission,
    toggleNotification,
  } = useFactoryTimers();

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  const nowSyncedMs = now + serverOffset;

  return (
    <Layout>
      <div className="w-full max-w-[1000px] mx-auto space-y-6">
        <FactoryTimersHeader
          language={language}
          activeCount={activeRuns.length}
          readyCount={readyCount}
          notifPermission={notifPermission}
          onToggleNotification={toggleNotification}
        />

        <FactoryTimersGrid
          runs={activeRuns}
          nowSyncedMs={nowSyncedMs}
          language={language}
        />
      </div>
    </Layout>
  );
};
