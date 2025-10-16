import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeckType } from '../types';

interface AppState {
  // User preferences (persisted)
  selectedDeck: DeckType;
  showConcentrationPrompt: boolean;
  hasSeenHelp: boolean;

  // Transient UI state (not persisted)
  currentStreak: number;

  // Actions
  setSelectedDeck: (deck: DeckType) => void;
  setShowConcentrationPrompt: (show: boolean) => void;
  setHasSeenHelp: (seen: boolean) => void;
  setCurrentStreak: (streak: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      selectedDeck: 'zener',
      showConcentrationPrompt: true,
      hasSeenHelp: false,
      currentStreak: 0,

      // Actions
      setSelectedDeck: (deck: DeckType) => set({ selectedDeck: deck }),

      setShowConcentrationPrompt: (show: boolean) =>
        set({ showConcentrationPrompt: show }),

      setHasSeenHelp: (seen: boolean) => set({ hasSeenHelp: seen }),

      setCurrentStreak: (streak: number) => set({ currentStreak: streak }),

      incrementStreak: () =>
        set((state) => ({ currentStreak: state.currentStreak + 1 })),

      resetStreak: () => set({ currentStreak: 0 }),
    }),
    {
      name: 'telepathy-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user preferences, not transient state
      partialize: (state) => ({
        selectedDeck: state.selectedDeck,
        showConcentrationPrompt: state.showConcentrationPrompt,
        hasSeenHelp: state.hasSeenHelp,
      }),
    }
  )
);
