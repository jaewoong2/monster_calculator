import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const HISTORY_LIMIT = 50;

export type CalculationHistoryEntry = {
  id: string;
  expression: string;
  result: string;
  createdAt: string;
};

type CalculationHistoryState = {
  entries: CalculationHistoryEntry[];
  addEntry: (entry: Omit<CalculationHistoryEntry, 'id' | 'createdAt'>) => void;
  clearEntries: () => void;
};

function createHistoryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useCalculationHistoryStore = create<CalculationHistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: ({ expression, result }) =>
        set((state) => ({
          entries: [
            {
              id: createHistoryId(),
              expression,
              result,
              createdAt: new Date().toISOString(),
            },
            ...state.entries,
          ].slice(0, HISTORY_LIMIT),
        })),
      clearEntries: () => set({ entries: [] }),
    }),
    {
      name: 'calculation-history-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
);
