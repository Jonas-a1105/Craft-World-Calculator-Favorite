import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Me, HomePayload, HomeTabId, UseHomeDataReturn } from '../types';
import { getMe, getCraftworldHome } from '../../../services/api';
import { useTranslation } from '../../../utils/i18n';

export function useHomeData(): UseHomeDataReturn {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const [me, setMe] = useState<Me | undefined>();
  const [homeData, setHomeData] = useState<HomePayload | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<HomeTabId>('overview');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const meData = await getMe();
      setMe(meData);

      const data = await getCraftworldHome();
      setHomeData(data);
    } catch (err: any) {
      console.error('Failed to load home data', err);
      setError(
        language === 'es'
          ? 'Error al cargar los datos del panel.'
          : 'Failed to load panel data.',
      );
      const msg = String(err?.message || '').toLowerCase();
      if (
        msg.includes('unauthorized') ||
        msg.includes('token') ||
        msg.includes('auth')
      ) {
        document.cookie = 'cc_logged_in=; Path=/; Max-Age=0; SameSite=Lax';
        localStorage.removeItem('token');
        localStorage.removeItem('me');
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  }, [language, navigate]);

  useEffect(() => {
    load();
  }, [load]);

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
    me,
    homeData,
    loading,
    error,
    activeTab,
    setActiveTab,
    copiedAddress,
    copyAddress,
    reload: load,
    isMissingScopes,
  };
}
