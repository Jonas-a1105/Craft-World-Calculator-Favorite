import React from 'react';
import Card from '../../../components/Card';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { oauthAuthorize } from '../../../services/api';
import { useHomeData } from '../hooks/useHomeData';
import { UserProfileCard } from './UserProfileCard';
import { HomeTabsNav } from './HomeTabsNav';
import { OverviewTab } from './tabs/OverviewTab';
import { CraftTab } from './tabs/CraftTab';
import { InventoryTab } from './tabs/InventoryTab';
import { ExchangeTab } from './tabs/ExchangeTab';
import { OnchainTab } from './tabs/OnchainTab';
import { PurchasesTab } from './tabs/PurchasesTab';

export const HomeDashboard: React.FC = () => {
  const {
    me,
    homeData,
    loading,
    error,
    activeTab,
    setActiveTab,
    copiedAddress,
    copyAddress,
    isMissingScopes,
  } = useHomeData();

  if (loading || !me) {
    return <SkeletonDashboardPage />;
  }

  const profile = homeData?.profile;
  const craftWorld = homeData?.craftWorld;
  const masterpieces = homeData?.masterpieces;
  const craft = homeData?.craft;
  const exchange = homeData?.exchange;
  const onchain = homeData?.onchain;
  const inventory = homeData?.inventory;
  const purchases = homeData?.purchases;

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full min-w-0">
      {error && (
        <div className="w-full">
          <Card>{error}</Card>
        </div>
      )}

      {/* User Profile Card */}
      <UserProfileCard
        me={me}
        profile={profile}
        craftWorld={craftWorld}
        purchases={purchases}
        isMissingScopes={isMissingScopes}
        onReauthorize={oauthAuthorize}
      />

      {/* Tab Navigation */}
      <HomeTabsNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Active Tab View */}
      {activeTab === 'overview' && (
        <OverviewTab
          profile={profile}
          craftWorld={craftWorld}
          masterpieces={masterpieces}
          craft={craft}
          purchases={purchases}
        />
      )}

      {activeTab === 'craft' && (
        <CraftTab craft={craft} onReauthorize={oauthAuthorize} />
      )}

      {activeTab === 'inventory' && (
        <InventoryTab inventory={inventory} onReauthorize={oauthAuthorize} />
      )}

      {activeTab === 'exchange' && (
        <ExchangeTab exchange={exchange} onReauthorize={oauthAuthorize} />
      )}

      {activeTab === 'onchain' && (
        <OnchainTab
          onchain={onchain}
          copiedAddress={copiedAddress}
          onCopyAddress={copyAddress}
          onReauthorize={oauthAuthorize}
        />
      )}

      {activeTab === 'purchases' && (
        <PurchasesTab purchases={purchases} onReauthorize={oauthAuthorize} />
      )}
    </div>
  );
};
