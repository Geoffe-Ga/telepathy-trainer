import { renderHook, waitFor } from '@testing-library/react-native';
import { useStats, useProgressData } from './useStats';
import { getAllGuesses } from '../database/queries';
import { Guess, DeckType } from '../types';
import {
  calculateDeckStats,
  calculateHeatMapData,
  calculateCardAccuracy,
  calculateSuitAccuracy,
  calculateNumberAccuracy,
  calculateProgressData,
} from '../utils/statsCalculator';

jest.mock('../database/queries');
jest.mock('../utils/statsCalculator');

describe('useStats', () => {
  const createMockGuess = (overrides: Partial<Guess> = {}): Guess => ({
    id: '1',
    timestamp: Date.now(),
    deckType: 'playing',
    guessedSuit: 'hearts',
    guessedNumber: 'Ace',
    actualSuit: 'hearts',
    actualNumber: 'Ace',
    suitMatch: true,
    numberMatch: true,
    exactMatch: true,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    (getAllGuesses as jest.Mock).mockResolvedValue([]);
    (calculateDeckStats as jest.Mock).mockReturnValue({
      deckType: 'playing',
      totalGuesses: 0,
      exactMatches: 0,
      suitMatches: 0,
      numberMatches: 0,
      accuracy: 0,
      suitAccuracy: 0,
      numberAccuracy: 0,
      bestStreak: 0,
      currentStreak: 0,
    });
    (calculateHeatMapData as jest.Mock).mockReturnValue([]);
    (calculateCardAccuracy as jest.Mock).mockReturnValue([]);
    (calculateSuitAccuracy as jest.Mock).mockReturnValue([]);
    (calculateNumberAccuracy as jest.Mock).mockReturnValue([]);
    (calculateProgressData as jest.Mock).mockReturnValue([]);
  });

  describe('Initial state', () => {
    it('should start with isLoading true', () => {
      const { result } = renderHook(() => useStats('playing'));

      expect(result.current.isLoading).toBe(true);
    });

    it('should initialize with empty arrays and null stats', () => {
      (getAllGuesses as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolve
      );

      const { result } = renderHook(() => useStats('playing'));

      expect(result.current.guesses).toEqual([]);
      expect(result.current.stats).toBeNull();
      expect(result.current.heatMapData).toEqual([]);
      expect(result.current.cardAccuracy).toEqual([]);
      expect(result.current.suitAccuracy).toEqual([]);
      expect(result.current.numberAccuracy).toEqual([]);
      expect(result.current.progressData).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Loading guesses', () => {
    it('should fetch all guesses when no deck type specified', async () => {
      (getAllGuesses as jest.Mock).mockResolvedValue([]);

      renderHook(() => useStats());

      await waitFor(() => {
        expect(getAllGuesses).toHaveBeenCalledWith(undefined);
      });
    });

    it('should fetch guesses for specific deck type', async () => {
      (getAllGuesses as jest.Mock).mockResolvedValue([]);

      renderHook(() => useStats('zener'));

      await waitFor(() => {
        expect(getAllGuesses).toHaveBeenCalledWith('zener');
      });
    });

    it('should set guesses in state after loading', async () => {
      const mockGuesses = [createMockGuess(), createMockGuess({ id: '2' })];
      (getAllGuesses as jest.Mock).mockResolvedValue(mockGuesses);

      const { result } = renderHook(() => useStats('playing'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.guesses).toEqual(mockGuesses);
    });
  });

  describe('Calculating stats', () => {
    it('should calculate deck stats when deck type is provided', async () => {
      const mockGuesses = [createMockGuess()];
      (getAllGuesses as jest.Mock).mockResolvedValue(mockGuesses);

      renderHook(() => useStats('playing'));

      await waitFor(() => {
        expect(calculateDeckStats).toHaveBeenCalledWith(mockGuesses, 'playing');
      });
    });

    it('should not calculate deck stats when no deck type provided', async () => {
      const mockGuesses = [createMockGuess()];
      (getAllGuesses as jest.Mock).mockResolvedValue(mockGuesses);

      const { result } = renderHook(() => useStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(calculateDeckStats).not.toHaveBeenCalled();
      expect(result.current.stats).toBeNull();
    });

    it('should calculate all stat types', async () => {
      const mockGuesses = [createMockGuess()];
      (getAllGuesses as jest.Mock).mockResolvedValue(mockGuesses);

      renderHook(() => useStats('playing'));

      await waitFor(() => {
        expect(calculateHeatMapData).toHaveBeenCalledWith(mockGuesses);
        expect(calculateCardAccuracy).toHaveBeenCalledWith(mockGuesses);
        expect(calculateSuitAccuracy).toHaveBeenCalledWith(mockGuesses);
        expect(calculateNumberAccuracy).toHaveBeenCalledWith(mockGuesses);
        expect(calculateProgressData).toHaveBeenCalledWith(mockGuesses);
      });
    });

    it('should store calculated stats in state', async () => {
      const mockGuesses = [createMockGuess()];
      const mockDeckStats = {
        deckType: 'playing' as DeckType,
        totalGuesses: 10,
        exactMatches: 5,
        suitMatches: 7,
        numberMatches: 6,
        accuracy: 50,
        suitAccuracy: 70,
        numberAccuracy: 60,
        bestStreak: 3,
        currentStreak: 2,
      };
      const mockHeatMap = [{ day: 0, hour: 12, count: 5, accuracy: 80 }];
      const mockCardAcc = [
        {
          cardId: 'hearts-Ace',
          cardName: 'Ace of hearts',
          attempts: 5,
          successes: 4,
          accuracy: 80,
        },
      ];

      (getAllGuesses as jest.Mock).mockResolvedValue(mockGuesses);
      (calculateDeckStats as jest.Mock).mockReturnValue(mockDeckStats);
      (calculateHeatMapData as jest.Mock).mockReturnValue(mockHeatMap);
      (calculateCardAccuracy as jest.Mock).mockReturnValue(mockCardAcc);

      const { result } = renderHook(() => useStats('playing'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats).toEqual(mockDeckStats);
      expect(result.current.heatMapData).toEqual(mockHeatMap);
      expect(result.current.cardAccuracy).toEqual(mockCardAcc);
    });
  });

  describe('Deck type changes', () => {
    it('should reload stats when deck type changes', async () => {
      (getAllGuesses as jest.Mock).mockResolvedValue([]);

      const { rerender } = renderHook(({ deckType }) => useStats(deckType), {
        initialProps: { deckType: 'playing' as DeckType },
      });

      await waitFor(() => {
        expect(getAllGuesses).toHaveBeenCalledWith('playing');
      });

      rerender({ deckType: 'zener' as DeckType });

      await waitFor(() => {
        expect(getAllGuesses).toHaveBeenCalledWith('zener');
      });

      expect(getAllGuesses).toHaveBeenCalledTimes(2);
    });

    it('should recalculate stats for new deck type', async () => {
      const playingGuesses = [createMockGuess({ deckType: 'playing' })];
      const zenerGuesses = [createMockGuess({ deckType: 'zener' })];

      (getAllGuesses as jest.Mock)
        .mockResolvedValueOnce(playingGuesses)
        .mockResolvedValueOnce(zenerGuesses);

      const { rerender } = renderHook(({ deckType }) => useStats(deckType), {
        initialProps: { deckType: 'playing' as DeckType },
      });

      await waitFor(() => {
        expect(calculateDeckStats).toHaveBeenCalledWith(
          playingGuesses,
          'playing'
        );
      });

      rerender({ deckType: 'zener' as DeckType });

      await waitFor(() => {
        expect(calculateDeckStats).toHaveBeenCalledWith(zenerGuesses, 'zener');
      });
    });
  });

  describe('Refresh functionality', () => {
    it('should provide a refresh function', async () => {
      (getAllGuesses as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useStats('playing'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refresh).toBe('function');
    });

    it('should reload stats when refresh is called', async () => {
      const initialGuesses = [createMockGuess({ id: '1' })];
      const refreshedGuesses = [
        createMockGuess({ id: '1' }),
        createMockGuess({ id: '2' }),
      ];

      (getAllGuesses as jest.Mock)
        .mockResolvedValueOnce(initialGuesses)
        .mockResolvedValueOnce(refreshedGuesses);

      const { result } = renderHook(() => useStats('playing'));

      await waitFor(() => {
        expect(result.current.guesses).toHaveLength(1);
      });

      // Call refresh
      await result.current.refresh();

      await waitFor(() => {
        expect(result.current.guesses).toHaveLength(2);
      });

      expect(getAllGuesses).toHaveBeenCalledTimes(2);
    });

    it('should set loading state during refresh', async () => {
      // Create a slow mock to observe loading state
      let resolveGuesses: (value: Guess[]) => void;
      const slowPromise = new Promise<Guess[]>((resolve) => {
        resolveGuesses = resolve;
      });
      (getAllGuesses as jest.Mock).mockReturnValue(slowPromise);

      const { result } = renderHook(() => useStats('playing'));

      // Wait for initial load
      resolveGuesses!([]);
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Setup new slow promise for refresh
      const slowPromise2 = new Promise<Guess[]>((resolve) => {
        resolveGuesses = resolve;
      });
      (getAllGuesses as jest.Mock).mockReturnValue(slowPromise2);

      // Start refresh
      const refreshPromise = result.current.refresh();

      // Should be loading during refresh
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Complete the refresh
      resolveGuesses!([]);
      await refreshPromise;

      // Should be done loading after refresh
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Error handling', () => {
    it('should handle database errors', async () => {
      const error = new Error('Database error');
      (getAllGuesses as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useStats('playing'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should set isLoading false even on error', async () => {
      (getAllGuesses as jest.Mock).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useStats('playing'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear error on successful refresh', async () => {
      const error = new Error('Initial error');
      (getAllGuesses as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce([]);

      const { result } = renderHook(() => useStats('playing'));

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });

      await result.current.refresh();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });
});

describe('useProgressData', () => {
  const createMockGuess = (timestamp: number): Guess => ({
    id: String(timestamp),
    timestamp,
    deckType: 'playing',
    guessedSuit: 'hearts',
    guessedNumber: 'Ace',
    actualSuit: 'hearts',
    actualNumber: 'Ace',
    suitMatch: true,
    numberMatch: true,
    exactMatch: true,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getAllGuesses as jest.Mock).mockResolvedValue([]);
    (calculateProgressData as jest.Mock).mockReturnValue([]);
  });

  describe('Time range filtering', () => {
    it('should default to "all" time range', async () => {
      renderHook(() => useProgressData());

      await waitFor(() => {
        expect(calculateProgressData).toHaveBeenCalledWith([], 20, 0);
      });
    });

    it('should convert "7d" to 7 days', async () => {
      renderHook(() => useProgressData(undefined, '7d'));

      await waitFor(() => {
        expect(calculateProgressData).toHaveBeenCalledWith([], 20, 7);
      });
    });

    it('should convert "30d" to 30 days', async () => {
      renderHook(() => useProgressData(undefined, '30d'));

      await waitFor(() => {
        expect(calculateProgressData).toHaveBeenCalledWith([], 20, 30);
      });
    });

    it('should convert "90d" to 90 days', async () => {
      renderHook(() => useProgressData(undefined, '90d'));

      await waitFor(() => {
        expect(calculateProgressData).toHaveBeenCalledWith([], 20, 90);
      });
    });

    it('should filter by deck type when provided', async () => {
      renderHook(() => useProgressData('zener', '30d'));

      await waitFor(() => {
        expect(getAllGuesses).toHaveBeenCalledWith('zener');
      });
    });
  });

  describe('Time range changes', () => {
    it('should reload data when time range changes', async () => {
      type TimeRangeProps = { timeRange: '7d' | '30d' | '90d' | 'all' };
      const { rerender } = renderHook(
        ({ timeRange }: TimeRangeProps) =>
          useProgressData(undefined, timeRange),
        { initialProps: { timeRange: '7d' as TimeRangeProps['timeRange'] } }
      );

      await waitFor(() => {
        expect(calculateProgressData).toHaveBeenCalledWith([], 20, 7);
      });

      rerender({ timeRange: '30d' });

      await waitFor(() => {
        expect(calculateProgressData).toHaveBeenCalledWith([], 20, 30);
      });

      expect(calculateProgressData).toHaveBeenCalledTimes(2);
    });

    it('should reload data when deck type changes', async () => {
      const { rerender } = renderHook(
        ({ deckType }) => useProgressData(deckType, '7d'),
        { initialProps: { deckType: 'playing' as DeckType | undefined } }
      );

      await waitFor(() => {
        expect(getAllGuesses).toHaveBeenCalledWith('playing');
      });

      rerender({ deckType: 'zener' as DeckType | undefined });

      await waitFor(() => {
        expect(getAllGuesses).toHaveBeenCalledWith('zener');
      });

      expect(getAllGuesses).toHaveBeenCalledTimes(2);
    });
  });

  describe('Loading state', () => {
    it('should start with isLoading true', () => {
      (getAllGuesses as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolve
      );

      const { result } = renderHook(() => useProgressData());

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isLoading false after loading', async () => {
      (getAllGuesses as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useProgressData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Data handling', () => {
    it('should return calculated progress data', async () => {
      const mockProgressData = [
        { date: '2024-01-01', accuracy: 50, guessCount: 10 },
        { date: '2024-01-02', accuracy: 60, guessCount: 20 },
      ];

      (getAllGuesses as jest.Mock).mockResolvedValue([
        createMockGuess(Date.now()),
      ]);
      (calculateProgressData as jest.Mock).mockReturnValue(mockProgressData);

      const { result } = renderHook(() => useProgressData());

      await waitFor(() => {
        expect(result.current.progressData).toEqual(mockProgressData);
      });
    });

    it('should handle empty guesses gracefully', async () => {
      (getAllGuesses as jest.Mock).mockResolvedValue([]);
      (calculateProgressData as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useProgressData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.progressData).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      (getAllGuesses as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useProgressData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not crash, should set loading to false
      expect(result.current.progressData).toEqual([]);
    });

    it('should log errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      (getAllGuesses as jest.Mock).mockRejectedValue(error);

      renderHook(() => useProgressData());

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error loading progress data:',
          error
        );
      });

      consoleSpy.mockRestore();
    });
  });
});
