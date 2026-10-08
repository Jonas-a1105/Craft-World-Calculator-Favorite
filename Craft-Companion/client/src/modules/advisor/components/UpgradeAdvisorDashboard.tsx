import React from 'react';
import Layout from '../../../components/Layout';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useUpgradeAdvisor } from '../hooks/useUpgradeAdvisor';
import { AdvisorHeader } from './AdvisorHeader';
import { AdvisorFilterBar } from './AdvisorFilterBar';
import { AdvisorList } from './AdvisorList';

export const UpgradeAdvisorDashboard: React.FC = () => {
  const {
    language,
    loading,
    searchTerm,
    setSearchTerm,
    filterMode,
    setFilterMode,
    ownedCount,
    allRecommendations,
    filteredRecommendations,
  } = useUpgradeAdvisor();

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[1100px] mx-auto space-y-6 pb-12">
        <AdvisorHeader language={language} />

        <AdvisorFilterBar
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          totalCount={allRecommendations.length}
          ownedCount={ownedCount}
          language={language}
        />

        <AdvisorList
          recommendations={filteredRecommendations}
          language={language}
        />
      </div>
    </Layout>
  );
};
