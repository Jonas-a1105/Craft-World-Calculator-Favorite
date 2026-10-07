import { useState, useCallback } from 'react';
import type { HomeTabId, UseHomeDataReturn } from '../types';
import { useTranslation } from '../../../utils/i18n';
import { useCraftworldHomeQuery, useMeQuery } from '../../../services/queries/useCraftworldQueries';

export function useHomeData(): UseHomeDataReturn {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<HomeTabId>('overview');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const { data: me } = useMeQuery();
  const {
    data: homeData,
    isLoading: loading,
    isError,
    refetch,
  } = useCraftworldHomeQuery();

  const error = isError
    ? language === 'es'
      ? 'Error al cargar los datos del panel.'
      : 'Failed to load panel data.'
    : '';

  const copyAddress = useCallback((address: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 1500);
  }, []);

  const craft = homeData?.craft;
  const exchange = homeData?.exchange;
  const onchain = homeData?.onchain;
  const inventory = homeData?.inventory;
  const purchases = homeData?.purchases;

  const isMissingScopes =
    !craft || !exchange || !onchain || !inventory || !purchases;

  return {
    me: me || undefined,
    homeData: homeData || null,
    loading,
    error,
    activeTab,
    setActiveTab,
    copiedAddress,
    copyAddress,
    reload: async () => {
      await refetch();
    },
    isMissingScopes,
  };
}
