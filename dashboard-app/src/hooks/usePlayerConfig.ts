import { useState, useCallback, useEffect } from 'react';

export interface ResourceConfig {
  factories: number;
  level: number;
  mastery: number;
  workers: number;
  workshop: number;
  boost: number; // 1 = None, 2 = x2
}

export type PlayerConfig = Record<string, ResourceConfig>;

const STORAGE_KEY = 'cw-player-config';

const DEFAULT_CONFIG: ResourceConfig = {
  factories: 0,
  level: 1,
  mastery: 0,
  workers: 0,
  workshop: 0,
  boost: 1
};

function loadFromStorage(): PlayerConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load player config from localStorage:', e);
  }
  return {};
}

function saveToStorage(config: PlayerConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save player config to localStorage:', e);
  }
}

export interface UsePlayerConfigReturn {
  getConfig: (resource: string) => ResourceConfig;
  updateField: (resource: string, field: keyof ResourceConfig, value: number) => void;
  updateBulkConfig: (updates: Record<string, Partial<ResourceConfig>>) => void;
  incrementField: (resource: string, field: keyof ResourceConfig, maxValue?: number) => void;
  decrementField: (resource: string, field: keyof ResourceConfig, minValue?: number) => void;
  resetAll: () => void;
  config: PlayerConfig;
}

export function usePlayerConfig(): UsePlayerConfigReturn {
  const [config, setConfig] = useState<PlayerConfig>(() => loadFromStorage());

  // Persist to localStorage whenever config changes
  useEffect(() => {
    saveToStorage(config);
  }, [config]);

  const getConfig = useCallback((resource: string): ResourceConfig => {
    return config[resource] || { ...DEFAULT_CONFIG };
  }, [config]);

  const updateField = useCallback((resource: string, field: keyof ResourceConfig, value: number) => {
    setConfig(prev => {
      const current = prev[resource] || { ...DEFAULT_CONFIG };
      return {
        ...prev,
        [resource]: {
          ...current,
          [field]: value
        }
      };
    });
  }, []);

  const updateBulkConfig = useCallback((updates: Record<string, Partial<ResourceConfig>>) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      Object.keys(updates).forEach(resource => {
        const current = newConfig[resource] || { ...DEFAULT_CONFIG };
        newConfig[resource] = {
          ...current,
          ...updates[resource]
        };
      });
      return newConfig;
    });
  }, []);

  const incrementField = useCallback((resource: string, field: keyof ResourceConfig, maxValue?: number) => {
    setConfig(prev => {
      const current = prev[resource] || { ...DEFAULT_CONFIG };
      const newVal = current[field] + 1;
      if (maxValue !== undefined && newVal > maxValue) return prev;
      return {
        ...prev,
        [resource]: {
          ...current,
          [field]: newVal
        }
      };
    });
  }, []);

  const decrementField = useCallback((resource: string, field: keyof ResourceConfig, minValue: number = 0) => {
    setConfig(prev => {
      const current = prev[resource] || { ...DEFAULT_CONFIG };
      const newVal = current[field] - 1;
      if (newVal < minValue) return prev;
      return {
        ...prev,
        [resource]: {
          ...current,
          [field]: newVal
        }
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    setConfig({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    getConfig,
    updateField,
    updateBulkConfig,
    incrementField,
    decrementField,
    resetAll,
    config
  };
}
