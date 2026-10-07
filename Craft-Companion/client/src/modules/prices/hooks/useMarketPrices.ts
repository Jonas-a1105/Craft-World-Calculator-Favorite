import { useState, useMemo } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useCraftworldHomeQuery } from '../../../services/queries/useCraftworldQueries';
import { filterMarketPrices } from '../services/pricesService';
import type { PriceListData, MarketPriceItem } from '../types';

export function useMarketPrices() {
  const { language } = useTranslation();
  const { data: home, isLoading: loading } = useCraftworldHomeQuery();
  const [search, setSearch] = useState('');

  const priceData: PriceListData | null = useMemo(() => {
    return home?.priceList || null;
  }, [home]);

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
