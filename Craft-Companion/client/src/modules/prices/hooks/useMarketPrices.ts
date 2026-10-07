import { useState, useMemo } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useCraftworldHomeQuery } from '../../../services/queries/useCraftworldQueries';
import { filterMarketPrices } from '../services/pricesService';
import type { PriceListData, MarketPriceItem } from '../types';

export function useMarketPrices() {
  const { language } = useTranslation();
  const { data: home, isLoading: loading } = useCraftworldHomeQuery();
  const [search, setSearch] = useState('');

  const prices: MarketPriceItem[] = useMemo(() => {
    return (home?.priceList?.prices || []).map((p) => ({
      referenceSymbol: p.referenceSymbol || '',
      amount: p.amount ?? 0,
      recommendation: p.recommendation || '',
    }));
  }, [home]);

  const filteredPrices: MarketPriceItem[] = useMemo(() => {
    return filterMarketPrices(prices, search);
  }, [prices, search]);

  const baseSymbol = home?.priceList?.baseSymbol || 'COIN';

  return {
    language,
    loading,
    search,
    setSearch,
    baseSymbol,
    filteredPrices,
  };
}
