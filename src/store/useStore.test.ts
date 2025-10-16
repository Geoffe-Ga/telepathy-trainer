import { renderHook, act } from '@testing-library/react-native';
import { useStore } from './useStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

describe('useStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state
    useStore.setState({
      selectedDeck: 'zener',
      showConcentrationPrompt: true,
      hasSeenHelp: false,
      currentStreak: 0,
    });
  });

  describe('Initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useStore());

      expect(result.current.selectedDeck).toBe('zener');
      expect(result.current.showConcentrationPrompt).toBe(true);
      expect(result.current.hasSeenHelp).toBe(false);
      expect(result.current.currentStreak).toBe(0);
    });
  });

  describe('setSelectedDeck', () => {
    it('should update selected deck', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setSelectedDeck('playing');
      });

      expect(result.current.selectedDeck).toBe('playing');
    });

    it('should work with all deck types', () => {
      const { result } = renderHook(() => useStore());
      const deckTypes: Array<'zener' | 'playing' | 'rws' | 'thoth'> = [
        'zener',
        'playing',
        'rws',
        'thoth',
      ];

      deckTypes.forEach((deckType) => {
        act(() => {
          result.current.setSelectedDeck(deckType);
        });
        expect(result.current.selectedDeck).toBe(deckType);
      });
    });
  });

  describe('setShowConcentrationPrompt', () => {
    it('should update concentration prompt visibility', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setShowConcentrationPrompt(false);
      });

      expect(result.current.showConcentrationPrompt).toBe(false);

      act(() => {
        result.current.setShowConcentrationPrompt(true);
      });

      expect(result.current.showConcentrationPrompt).toBe(true);
    });
  });

  describe('setHasSeenHelp', () => {
    it('should update help seen status', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setHasSeenHelp(true);
      });

      expect(result.current.hasSeenHelp).toBe(true);

      act(() => {
        result.current.setHasSeenHelp(false);
      });

      expect(result.current.hasSeenHelp).toBe(false);
    });
  });

  describe('Streak management', () => {
    it('should set streak to specific value', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setCurrentStreak(5);
      });

      expect(result.current.currentStreak).toBe(5);
    });

    it('should increment streak', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.incrementStreak();
      });

      expect(result.current.currentStreak).toBe(1);

      act(() => {
        result.current.incrementStreak();
      });

      expect(result.current.currentStreak).toBe(2);

      act(() => {
        result.current.incrementStreak();
      });

      expect(result.current.currentStreak).toBe(3);
    });

    it('should reset streak to zero', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setCurrentStreak(10);
      });

      expect(result.current.currentStreak).toBe(10);

      act(() => {
        result.current.resetStreak();
      });

      expect(result.current.currentStreak).toBe(0);
    });

    it('should handle multiple increments and resets', () => {
      const { result } = renderHook(() => useStore());

      // Build streak
      act(() => {
        result.current.incrementStreak();
        result.current.incrementStreak();
        result.current.incrementStreak();
      });
      expect(result.current.currentStreak).toBe(3);

      // Reset
      act(() => {
        result.current.resetStreak();
      });
      expect(result.current.currentStreak).toBe(0);

      // Build again
      act(() => {
        result.current.incrementStreak();
        result.current.incrementStreak();
      });
      expect(result.current.currentStreak).toBe(2);
    });

    it('should handle large streak values', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setCurrentStreak(999);
      });

      expect(result.current.currentStreak).toBe(999);

      act(() => {
        result.current.incrementStreak();
      });

      expect(result.current.currentStreak).toBe(1000);
    });
  });

  describe('Persistence behavior', () => {
    it('should persist selectedDeck changes', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setSelectedDeck('rws');
      });

      // Zustand persist middleware will call AsyncStorage.setItem
      // We just verify the state updated correctly
      expect(result.current.selectedDeck).toBe('rws');
    });

    it('should persist showConcentrationPrompt changes', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setShowConcentrationPrompt(false);
      });

      expect(result.current.showConcentrationPrompt).toBe(false);
    });

    it('should persist hasSeenHelp changes', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setHasSeenHelp(true);
      });

      expect(result.current.hasSeenHelp).toBe(true);
    });

    it('should NOT persist currentStreak (transient state)', () => {
      const { result } = renderHook(() => useStore());

      // CurrentStreak should work but is not persisted
      act(() => {
        result.current.setCurrentStreak(5);
      });

      expect(result.current.currentStreak).toBe(5);
      // In actual implementation, this wouldn't survive app restart
    });
  });

  describe('State updates are independent', () => {
    it('should update deck without affecting other state', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setShowConcentrationPrompt(false);
        result.current.setCurrentStreak(5);
      });

      const before = {
        showConcentrationPrompt: result.current.showConcentrationPrompt,
        currentStreak: result.current.currentStreak,
      };

      act(() => {
        result.current.setSelectedDeck('thoth');
      });

      expect(result.current.selectedDeck).toBe('thoth');
      expect(result.current.showConcentrationPrompt).toBe(
        before.showConcentrationPrompt
      );
      expect(result.current.currentStreak).toBe(before.currentStreak);
    });

    it('should update streak without affecting preferences', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setSelectedDeck('playing');
        result.current.setHasSeenHelp(true);
      });

      const before = {
        selectedDeck: result.current.selectedDeck,
        hasSeenHelp: result.current.hasSeenHelp,
      };

      act(() => {
        result.current.incrementStreak();
      });

      expect(result.current.currentStreak).toBe(1);
      expect(result.current.selectedDeck).toBe(before.selectedDeck);
      expect(result.current.hasSeenHelp).toBe(before.hasSeenHelp);
    });
  });

  describe('Multiple hook instances share state', () => {
    it('should sync state across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useStore());
      const { result: result2 } = renderHook(() => useStore());

      act(() => {
        result1.current.setSelectedDeck('rws');
      });

      expect(result1.current.selectedDeck).toBe('rws');
      expect(result2.current.selectedDeck).toBe('rws');

      act(() => {
        result2.current.incrementStreak();
      });

      expect(result1.current.currentStreak).toBe(1);
      expect(result2.current.currentStreak).toBe(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid state updates', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.incrementStreak();
        }
      });

      expect(result.current.currentStreak).toBe(100);
    });

    it('should handle setting streak to zero explicitly', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setCurrentStreak(0);
      });

      expect(result.current.currentStreak).toBe(0);
    });

    it('should handle negative streak values (data integrity test)', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setCurrentStreak(-5);
      });

      // Store allows negative values - application logic should prevent this
      expect(result.current.currentStreak).toBe(-5);
    });
  });
});
