import { useState, useEffect, useMemo } from 'react';
import { CatalogItem, LevelProgression, SummaryStats, EncyclopediaCategory, OfficialEvent } from '../types';
import { RESOURCE_ITEMS, BUILDING_ITEMS, EVENT_ITEMS } from '../data/catalog';
import { OFFICIAL_EVENTS, getEventByCatalogId } from '../data/eventsCatalog';
import { fetchProgressionForItem, computeSummaryStats } from '../services/progressionGenerator';

export function useEncyclopedia(initialMode: 'encyclopedia' | 'events' = 'encyclopedia') {
  const [category, setCategory] = useState<EncyclopediaCategory>(initialMode === 'events' ? 'events' : 'resources');
  const [selectedItemId, setSelectedItemId] = useState<string>(initialMode === 'events' ? 'event-fishing-frenzy' : 'EARTH');
  const [search, setSearch] = useState<string>('');
  const [levels, setLevels] = useState<LevelProgression[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (initialMode === 'events') {
      setCategory('events');
      setSelectedItemId((prev) => (prev.startsWith('event-') ? prev : 'event-fishing-frenzy'));
    } else if (initialMode === 'encyclopedia' && category === 'events') {
      setCategory('resources');
      setSelectedItemId('EARTH');
    }
  }, [initialMode]);

  const allItems = useMemo(() => [...RESOURCE_ITEMS, ...BUILDING_ITEMS, ...EVENT_ITEMS], []);

  const selectedItem = useMemo(() => {
    return allItems.find((i) => i.id === selectedItemId) || (initialMode === 'events' ? EVENT_ITEMS[0] : RESOURCE_ITEMS[0]);
  }, [allItems, selectedItemId, initialMode]);

  const selectedEvent: OfficialEvent = useMemo(() => {
    return getEventByCatalogId(selectedItem.id) || OFFICIAL_EVENTS[0];
  }, [selectedItem]);

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

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return EVENT_ITEMS;
    const q = search.toLowerCase();
    return EVENT_ITEMS.filter((i) => i.name.toLowerCase().includes(q) || i.nameEs.toLowerCase().includes(q));
  }, [search]);

  useEffect(() => {
    if (selectedItem.category === 'events') {
      setLevels([]);
      setLoading(false);
      return;
    }

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
    selectedEvent,
    search,
    levels,
    loading,
    summaryStats,
    filteredResources,
    filteredBuildings,
    filteredEvents,
    setSearch,
    selectItem,
  };
}
