import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useCraftworldHomeQuery } from '../../../services/queries/useCraftworldQueries';
import { filterMarketPrices } from '../services/pricesService';
import { fetchRoninPoolsData, type RoninPoolsDataset } from '../../../services/roninPoolsService';
import { DEFAULT_MARKET_PRICES } from '../../../services/priceService';
import type { MarketPriceItem } from '../types';

export function useMarketPrices() {
  const { language } = useTranslation();
  const { data: home, isLoading: loading } = useCraftworldHomeQuery();
  const [poolsDataset, setPoolsDataset] = useState<RoninPoolsDataset | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    fetchRoninPoolsData().then((data) => {
      if (mounted && data) setPoolsDataset(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const prices: MarketPriceItem[] = useMemo(() => {
    const map = new Map<string, MarketPriceItem>();

    // 1. Base Katana V3 benchmark
    for (const [sym, amt] of Object.entries(DEFAULT_MARKET_PRICES)) {
      if (sym !== 'COIN') {
        map.set(sym, { referenceSymbol: sym, amount: amt, recommendation: 'NEUTRAL' });
      }
    }

    // 2. Katana V3 live pool dataset
    if (poolsDataset?.resources) {
      for (const [sym, item] of Object.entries(poolsDataset.resources)) {
        const h = item.price1d?.history;
        const price = h && h.length > 0 ? h[h.length - 1].price : (item.price1d?.average || 0);
        if (price > 0) {
          map.set(sym.toUpperCase(), {
            referenceSymbol: sym.toUpperCase(),
            amount: price,
            recommendation: 'NEUTRAL',
          });
        }
      }
    }

    // 3. Game API priceList (if available)
    if (home?.priceList?.prices && Array.isArray(home.priceList.prices)) {
      for (const p of home.priceList.prices) {
        if (p.referenceSymbol && typeof p.amount === 'number' && p.amount > 0) {
          map.set(p.referenceSymbol.toUpperCase(), {
            referenceSymbol: p.referenceSymbol.toUpperCase(),
            amount: p.amount,
            recommendation: p.recommendation || 'NEUTRAL',
          });
        }
      }
    }

    return Array.from(map.values());
  }, [home, poolsDataset]);

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
