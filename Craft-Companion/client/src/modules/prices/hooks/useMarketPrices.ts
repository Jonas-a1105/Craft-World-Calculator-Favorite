import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { getCraftworldHome } from '../../../services/api';
import { filterMarketPrices } from '../services/pricesService';
import type { PriceListData, MarketPriceItem } from '../types';

export function useMarketPrices() {
  const { language } = useTranslation();
  const [priceData, setPriceData] = useState<PriceListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    getCraftworldHome()
      .then((home) => {
        if (!mounted) return;
        setPriceData(home?.priceList || null);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const prices: MarketPriceItem[] = useMemo(() => {
    return priceData?.prices || [];
  }, [priceData]);

  const filteredPrices: MarketPriceItem[] = useMemo(() => {
    return filterMarketPrices(prices, search);
  }, [prices, search]);

  const baseSymbol = priceData?.baseSymbol || 'COIN';

  return {
    language,
    loading,
    search,
    setSearch,
    baseSymbol,
    filteredPrices,
  };
}
