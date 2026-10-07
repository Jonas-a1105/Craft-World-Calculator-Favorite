import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStoreState {
  favorites: string[];
  activeCurrency: 'COIN' | 'USD';
  filterQuery: string;

  toggleFavorite: (token: string) => void;
  isFavorite: (token: string) => boolean;
  setActiveCurrency: (currency: 'COIN' | 'USD') => void;
  setFilterQuery: (query: string) => void;
  clearFavorites: () => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      favorites: ['STEEL', 'ALUMINIUM', 'FABRIC', 'COPPER'],
      activeCurrency: 'COIN',
      filterQuery: '',

      toggleFavorite: (token: string) => {
        const upper = token.toUpperCase().trim();
        const current = get().favorites;
        if (current.includes(upper)) {
          set({ favorites: current.filter((f) => f !== upper) });
        } else {
          set({ favorites: [...current, upper] });
        }
      },

      isFavorite: (token: string) => {
        return get().favorites.includes(token.toUpperCase().trim());
      },

      setActiveCurrency: (currency: 'COIN' | 'USD') => {
        set({ activeCurrency: currency });
      },

      setFilterQuery: (query: string) => {
        set({ filterQuery: query });
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'craftcompanion.client_store',
      partialize: (state) => ({
        favorites: state.favorites,
        activeCurrency: state.activeCurrency,
      }),
    },
  ),
);
