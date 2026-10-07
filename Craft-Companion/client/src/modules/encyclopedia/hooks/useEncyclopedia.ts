import { useState, useEffect, useMemo } from 'react';
import { CatalogItem, LevelProgression, SummaryStats, TableViewMode, EncyclopediaCategory } from '../types';
import { RESOURCE_ITEMS, BUILDING_ITEMS } from '../data/catalog';
import { fetchProgressionForItem, computeSummaryStats } from '../services/progressionGenerator';

export function useEncyclopedia() {
  const [category, setCategory] = useState<EncyclopediaCategory>('resources');
  const [selectedItemId, setSelectedItemId] = useState<string>('EARTH');
  const [viewMode, setViewMode] = useState<TableViewMode>('essential');
  const [search, setSearch] = useState<string>('');
  const [levels, setLevels] = useState<LevelProgression[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const allItems = useMemo(() => [...RESOURCE_ITEMS, ...BUILDING_ITEMS], []);

  const selectedItem = useMemo(() => {
    return allItems.find((i) => i.id === selectedItemId) || RESOURCE_ITEMS[0];
  }, [allItems, selectedItemId]);

  const filteredResources = useMemo(() => {
    if (!search.trim()) return RESOURCE_ITEMS;
    const q = search.toLowerCase();
    return RESOURCE_ITEMS.filter((i) => i.name.toLowerCase().includes(q) || i.nameEs.toLowerCase().includes(q));
  }, [search]);

  const filteredBuildings = useMemo(() => {
    if (!search.trim()) return BUILDING_ITEMS;
    const q = search.toLowerCase();
    return BUILDING_ITEMS.filter((i) => i.name.toLowerCase().includes(q) || i.nameEs.toLowerCase().includes(q));
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchProgressionForItem(selectedItem)
      .then((data) => {
        if (active) {
          setLevels(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load encyclopedia progression', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedItem]);

  const summaryStats: SummaryStats = useMemo(() => {
    return computeSummaryStats(levels);
  }, [levels]);

  const selectItem = (item: CatalogItem) => {
    setSelectedItemId(item.id);
    setCategory(item.category);
  };

  return {
    category,
    selectedItem,
    selectedItemId,
    viewMode,
    search,
    levels,
    loading,
    summaryStats,
    filteredResources,
    filteredBuildings,
    setViewMode,
    setSearch,
    selectItem,
  };
}
