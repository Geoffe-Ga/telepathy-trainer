import {
  calculateDeckStats,
  calculateBestStreak,
  calculateCurrentStreak,
  calculateHeatMapData,
  calculateCardAccuracy,
  calculateSuitAccuracy,
  calculateNumberAccuracy,
  calculateProgressData,
  getBestTimeSlot,
  formatDayName,
  formatTimeSlot,
} from './statsCalculator';
import { Guess, DeckType } from '../types';

// Helper to create test guesses
function createGuess(overrides: Partial<Guess> & { timestamp: number }): Guess {
  return {
    id: Math.random().toString(),
    deckType: 'playing' as DeckType,
    guessedSuit: 'hearts',
    guessedNumber: 'Ace',
    actualSuit: 'hearts',
    actualNumber: 'Ace',
    suitMatch: true,
    numberMatch: true,
    exactMatch: true,
    ...overrides,
  };
}

describe('Stats Calculator', () => {
  describe('calculateDeckStats', () => {
    it('should return zero stats for empty guess array', () => {
      const stats = calculateDeckStats([], 'playing');
      expect(stats).toEqual({
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
    });

    it('should calculate 100% accuracy for all correct guesses', () => {
      const guesses: Guess[] = [
        createGuess({ timestamp: 1000 }),
        createGuess({ timestamp: 2000 }),
        createGuess({ timestamp: 3000 }),
      ];

      const stats = calculateDeckStats(guesses, 'playing');
      expect(stats.totalGuesses).toBe(3);
      expect(stats.exactMatches).toBe(3);
      expect(stats.accuracy).toBe(100);
      expect(stats.suitAccuracy).toBe(100);
      expect(stats.numberAccuracy).toBe(100);
    });

    it('should calculate 0% accuracy for all incorrect guesses', () => {
      const guesses: Guess[] = [
        createGuess({
          timestamp: 1000,
          exactMatch: false,
          suitMatch: false,
          numberMatch: false,
        }),
        createGuess({
          timestamp: 2000,
          exactMatch: false,
          suitMatch: false,
          numberMatch: false,
        }),
      ];

      const stats = calculateDeckStats(guesses, 'playing');
      expect(stats.exactMatches).toBe(0);
      expect(stats.accuracy).toBe(0);
      expect(stats.suitAccuracy).toBe(0);
      expect(stats.numberAccuracy).toBe(0);
    });

    it('should calculate partial match accuracy correctly', () => {
      const guesses: Guess[] = [
        createGuess({ timestamp: 1000, exactMatch: true }), // All match
        createGuess({
          timestamp: 2000,
          exactMatch: false,
          suitMatch: true,
          numberMatch: false,
        }), // Only suit
        createGuess({
          timestamp: 3000,
          exactMatch: false,
          suitMatch: false,
          numberMatch: true,
        }), // Only number
        createGuess({
          timestamp: 4000,
          exactMatch: false,
          suitMatch: false,
          numberMatch: false,
        }), // None
      ];

      const stats = calculateDeckStats(guesses, 'playing');
      expect(stats.totalGuesses).toBe(4);
      expect(stats.exactMatches).toBe(1);
      expect(stats.suitMatches).toBe(2);
      expect(stats.numberMatches).toBe(2);
      expect(stats.accuracy).toBe(25); // 1/4
      expect(stats.suitAccuracy).toBe(50); // 2/4
      expect(stats.numberAccuracy).toBe(50); // 2/4
    });

    it('should filter guesses by deck type', () => {
      const guesses: Guess[] = [
        createGuess({ timestamp: 1000, deckType: 'playing' }),
        createGuess({ timestamp: 2000, deckType: 'zener' }),
        createGuess({ timestamp: 3000, deckType: 'playing' }),
      ];

      const stats = calculateDeckStats(guesses, 'playing');
      expect(stats.totalGuesses).toBe(2);
    });

    it('should round accuracy to 2 decimal places', () => {
      const guesses: Guess[] = [
        createGuess({ timestamp: 1000, exactMatch: true }),
        createGuess({ timestamp: 2000, exactMatch: false }),
        createGuess({ timestamp: 3000, exactMatch: false }),
      ];

      const stats = calculateDeckStats(guesses, 'playing');
      expect(stats.accuracy).toBe(33.33); // 1/3 = 33.333...
    });
  });

  describe('calculateBestStreak', () => {
    it('should return 0 for empty array', () => {
      expect(calculateBestStreak([])).toBe(0);
    });

    it('should return 1 for single correct guess', () => {
      const guesses = [createGuess({ timestamp: 1000, exactMatch: true })];
      expect(calculateBestStreak(guesses)).toBe(1);
    });

    it('should return 0 for all incorrect guesses', () => {
      const guesses = [
        createGuess({ timestamp: 1000, exactMatch: false }),
        createGuess({ timestamp: 2000, exactMatch: false }),
      ];
      expect(calculateBestStreak(guesses)).toBe(0);
    });

    it('should calculate longest consecutive streak', () => {
      const guesses = [
        createGuess({ timestamp: 1000, exactMatch: true }),
        createGuess({ timestamp: 2000, exactMatch: true }),
        createGuess({ timestamp: 3000, exactMatch: false }),
        createGuess({ timestamp: 4000, exactMatch: true }),
        createGuess({ timestamp: 5000, exactMatch: true }),
        createGuess({ timestamp: 6000, exactMatch: true }),
        createGuess({ timestamp: 7000, exactMatch: false }),
      ];
      expect(calculateBestStreak(guesses)).toBe(3); // Longest is 3
    });

    it('should handle unsorted timestamps correctly', () => {
      const guesses = [
        createGuess({ timestamp: 5000, exactMatch: true }),
        createGuess({ timestamp: 1000, exactMatch: true }),
        createGuess({ timestamp: 3000, exactMatch: true }),
        createGuess({ timestamp: 2000, exactMatch: false }),
      ];
      // When sorted: 1000(T), 2000(F), 3000(T), 5000(T)
      // Best streak should be 2
      expect(calculateBestStreak(guesses)).toBe(2);
    });

    it('should count streak that ends at the last guess', () => {
      const guesses = [
        createGuess({ timestamp: 1000, exactMatch: false }),
        createGuess({ timestamp: 2000, exactMatch: true }),
        createGuess({ timestamp: 3000, exactMatch: true }),
        createGuess({ timestamp: 4000, exactMatch: true }),
      ];
      expect(calculateBestStreak(guesses)).toBe(3);
    });
  });

  describe('calculateCurrentStreak', () => {
    it('should return 0 for empty array', () => {
      expect(calculateCurrentStreak([])).toBe(0);
    });

    it('should return 0 if most recent guess is incorrect', () => {
      const guesses = [
        createGuess({ timestamp: 1000, exactMatch: true }),
        createGuess({ timestamp: 2000, exactMatch: true }),
        createGuess({ timestamp: 3000, exactMatch: false }),
      ];
      expect(calculateCurrentStreak(guesses)).toBe(0);
    });

    it('should count consecutive recent correct guesses', () => {
      const guesses = [
        createGuess({ timestamp: 1000, exactMatch: false }),
        createGuess({ timestamp: 2000, exactMatch: true }),
        createGuess({ timestamp: 3000, exactMatch: true }),
        createGuess({ timestamp: 4000, exactMatch: true }),
      ];
      expect(calculateCurrentStreak(guesses)).toBe(3);
    });

    it('should handle unsorted timestamps correctly', () => {
      const guesses = [
        createGuess({ timestamp: 4000, exactMatch: true }),
        createGuess({ timestamp: 1000, exactMatch: false }),
        createGuess({ timestamp: 3000, exactMatch: true }),
        createGuess({ timestamp: 2000, exactMatch: true }),
      ];
      // Most recent should be 4000(T), then 3000(T), then 2000(T), then 1000(F)
      // Current streak should be 3
      expect(calculateCurrentStreak(guesses)).toBe(3);
    });

    it('should return all guesses count if all are correct', () => {
      const guesses = [
        createGuess({ timestamp: 1000, exactMatch: true }),
        createGuess({ timestamp: 2000, exactMatch: true }),
        createGuess({ timestamp: 3000, exactMatch: true }),
      ];
      expect(calculateCurrentStreak(guesses)).toBe(3);
    });
  });

  describe('calculateHeatMapData', () => {
    it('should return empty array for no guesses', () => {
      expect(calculateHeatMapData([])).toEqual([]);
    });

    it('should exclude slots with fewer than minimum data points', () => {
      const guesses = [
        createGuess({
          timestamp: new Date('2025-01-13T10:00:00').getTime(),
          exactMatch: true,
        }),
        createGuess({
          timestamp: new Date('2025-01-13T10:30:00').getTime(),
          exactMatch: false,
        }),
      ];
      // Only 2 guesses in Monday 10AM slot, default minDataPoints is 3
      expect(calculateHeatMapData(guesses)).toEqual([]);
    });

    it('should include slots with minimum data points', () => {
      const guesses = [
        createGuess({
          timestamp: new Date('2025-01-13T10:00:00').getTime(),
          exactMatch: true,
        }),
        createGuess({
          timestamp: new Date('2025-01-13T10:30:00').getTime(),
          exactMatch: true,
        }),
        createGuess({
          timestamp: new Date('2025-01-13T10:45:00').getTime(),
          exactMatch: false,
        }),
      ];
      const heatMap = calculateHeatMapData(guesses, 3);
      expect(heatMap).toHaveLength(1);
      expect(heatMap[0].day).toBe(1); // Monday
      expect(heatMap[0].hour).toBe(10);
      expect(heatMap[0].count).toBe(3);
      expect(heatMap[0].accuracy).toBe(66.67); // 2/3
    });

    it('should calculate accuracy per time slot correctly', () => {
      const guesses = [
        // Monday 10AM: 3/4 correct = 75%
        createGuess({
          timestamp: new Date('2025-01-13T10:00:00').getTime(),
          exactMatch: true,
        }),
        createGuess({
          timestamp: new Date('2025-01-13T10:15:00').getTime(),
          exactMatch: true,
        }),
        createGuess({
          timestamp: new Date('2025-01-13T10:30:00').getTime(),
          exactMatch: true,
        }),
        createGuess({
          timestamp: new Date('2025-01-13T10:45:00').getTime(),
          exactMatch: false,
        }),
        // Tuesday 14PM: 1/3 correct = 33.33%
        createGuess({
          timestamp: new Date('2025-01-14T14:00:00').getTime(),
          exactMatch: true,
        }),
        createGuess({
          timestamp: new Date('2025-01-14T14:30:00').getTime(),
          exactMatch: false,
        }),
        createGuess({
          timestamp: new Date('2025-01-14T14:45:00').getTime(),
          exactMatch: false,
        }),
      ];

      const heatMap = calculateHeatMapData(guesses, 3);
      expect(heatMap).toHaveLength(2);

      const mondaySlot = heatMap.find((h) => h.day === 1 && h.hour === 10);
      expect(mondaySlot).toBeDefined();
      expect(mondaySlot?.accuracy).toBe(75);

      const tuesdaySlot = heatMap.find((h) => h.day === 2 && h.hour === 14);
      expect(tuesdaySlot).toBeDefined();
      expect(tuesdaySlot?.accuracy).toBe(33.33);
    });

    it('should respect custom minDataPoints parameter', () => {
      const guesses = [
        createGuess({
          timestamp: new Date('2025-01-13T10:00:00').getTime(),
          exactMatch: true,
        }),
      ];
      expect(calculateHeatMapData(guesses, 1)).toHaveLength(1);
      expect(calculateHeatMapData(guesses, 2)).toHaveLength(0);
    });

    it('should group by hour correctly across different minutes', () => {
      const guesses = [
        createGuess({
          timestamp: new Date('2025-01-13T10:05:00').getTime(),
          exactMatch: true,
        }),
        createGuess({
          timestamp: new Date('2025-01-13T10:25:00').getTime(),
          exactMatch: true,
        }),
        createGuess({
          timestamp: new Date('2025-01-13T10:55:00').getTime(),
          exactMatch: true,
        }),
      ];
      const heatMap = calculateHeatMapData(guesses, 3);
      expect(heatMap).toHaveLength(1);
      expect(heatMap[0].count).toBe(3);
    });
  });

  describe('calculateCardAccuracy', () => {
    it('should return empty array for no guesses', () => {
      expect(calculateCardAccuracy([])).toEqual([]);
    });

    it('should calculate accuracy per card', () => {
      const guesses = [
        createGuess({
          timestamp: 1000,
          actualSuit: 'hearts',
          actualNumber: 'Ace',
          exactMatch: true,
        }),
        createGuess({
          timestamp: 2000,
          actualSuit: 'hearts',
          actualNumber: 'Ace',
          exactMatch: false,
        }),
        createGuess({
          timestamp: 3000,
          actualSuit: 'spades',
          actualNumber: 'King',
          exactMatch: true,
        }),
      ];

      const cardAcc = calculateCardAccuracy(guesses);
      expect(cardAcc).toHaveLength(2);

      const heartsAce = cardAcc.find((c) => c.cardId === 'hearts-Ace');
      expect(heartsAce).toBeDefined();
      expect(heartsAce?.attempts).toBe(2);
      expect(heartsAce?.successes).toBe(1);
      expect(heartsAce?.accuracy).toBe(50);

      const spadesKing = cardAcc.find((c) => c.cardId === 'spades-King');
      expect(spadesKing?.accuracy).toBe(100);
    });

    it('should handle Zener cards (suit-only) correctly', () => {
      const guesses = [
        createGuess({
          timestamp: 1000,
          actualSuit: 'circle',
          actualNumber: undefined,
          exactMatch: true,
        }),
        createGuess({
          timestamp: 2000,
          actualSuit: 'circle',
          actualNumber: undefined,
          exactMatch: true,
        }),
      ];

      const cardAcc = calculateCardAccuracy(guesses);
      expect(cardAcc).toHaveLength(1);
      expect(cardAcc[0].cardId).toBe('circle-suit-only');
      expect(cardAcc[0].cardName).toBe('circle');
      expect(cardAcc[0].attempts).toBe(2);
      expect(cardAcc[0].accuracy).toBe(100);
    });

    it('should sort cards by accuracy descending', () => {
      const guesses = [
        createGuess({
          timestamp: 1000,
          actualSuit: 'hearts',
          actualNumber: 'Ace',
          exactMatch: true,
        }),
        createGuess({
          timestamp: 2000,
          actualSuit: 'spades',
          actualNumber: 'King',
          exactMatch: false,
        }),
        createGuess({
          timestamp: 3000,
          actualSuit: 'spades',
          actualNumber: 'King',
          exactMatch: false,
        }),
      ];

      const cardAcc = calculateCardAccuracy(guesses);
      expect(cardAcc[0].accuracy).toBeGreaterThanOrEqual(cardAcc[1].accuracy);
      expect(cardAcc[0].cardId).toBe('hearts-Ace'); // 100%
      expect(cardAcc[1].cardId).toBe('spades-King'); // 0%
    });

    it('should format card names correctly', () => {
      const guesses = [
        createGuess({
          timestamp: 1000,
          actualSuit: 'hearts',
          actualNumber: 'Queen',
          exactMatch: true,
        }),
      ];

      const cardAcc = calculateCardAccuracy(guesses);
      expect(cardAcc[0].cardName).toBe('Queen of hearts');
    });
  });

  describe('calculateSuitAccuracy', () => {
    it('should return empty array for no guesses', () => {
      expect(calculateSuitAccuracy([])).toEqual([]);
    });

    it('should calculate accuracy per suit', () => {
      const guesses = [
        createGuess({
          timestamp: 1000,
          actualSuit: 'hearts',
          suitMatch: true,
        }),
        createGuess({
          timestamp: 2000,
          actualSuit: 'hearts',
          suitMatch: false,
        }),
        createGuess({
          timestamp: 3000,
          actualSuit: 'spades',
          suitMatch: true,
        }),
        createGuess({
          timestamp: 4000,
          actualSuit: 'spades',
          suitMatch: true,
        }),
      ];

      const suitAcc = calculateSuitAccuracy(guesses);
      expect(suitAcc).toHaveLength(2);

      const hearts = suitAcc.find((s) => s.suit === 'hearts');
      expect(hearts?.attempts).toBe(2);
      expect(hearts?.successes).toBe(1);
      expect(hearts?.accuracy).toBe(50);

      const spades = suitAcc.find((s) => s.suit === 'spades');
      expect(spades?.accuracy).toBe(100);
    });

    it('should sort suits by accuracy descending', () => {
      const guesses = [
        createGuess({
          timestamp: 1000,
          actualSuit: 'hearts',
          suitMatch: true,
        }),
        createGuess({
          timestamp: 2000,
          actualSuit: 'spades',
          suitMatch: false,
        }),
      ];

      const suitAcc = calculateSuitAccuracy(guesses);
      expect(suitAcc[0].accuracy).toBeGreaterThanOrEqual(suitAcc[1].accuracy);
    });
  });

  describe('calculateNumberAccuracy', () => {
    it('should return empty array for no guesses', () => {
      expect(calculateNumberAccuracy([])).toEqual([]);
    });

    it('should skip Zener cards (no number)', () => {
      const guesses = [
        createGuess({
          timestamp: 1000,
          actualNumber: undefined,
          numberMatch: false,
        }),
      ];
      expect(calculateNumberAccuracy(guesses)).toEqual([]);
    });

    it('should calculate accuracy per number', () => {
      const guesses = [
        createGuess({
          timestamp: 1000,
          actualNumber: 'Ace',
          numberMatch: true,
        }),
        createGuess({
          timestamp: 2000,
          actualNumber: 'Ace',
          numberMatch: false,
        }),
        createGuess({
          timestamp: 3000,
          actualNumber: 'King',
          numberMatch: true,
        }),
      ];

      const numAcc = calculateNumberAccuracy(guesses);
      expect(numAcc).toHaveLength(2);

      const ace = numAcc.find((n) => n.number === 'Ace');
      expect(ace?.attempts).toBe(2);
      expect(ace?.successes).toBe(1);
      expect(ace?.accuracy).toBe(50);
    });

    it('should sort numbers by accuracy descending', () => {
      const guesses = [
        createGuess({
          timestamp: 1000,
          actualNumber: 'Ace',
          numberMatch: true,
        }),
        createGuess({
          timestamp: 2000,
          actualNumber: 'King',
          numberMatch: false,
        }),
      ];

      const numAcc = calculateNumberAccuracy(guesses);
      expect(numAcc[0].accuracy).toBeGreaterThanOrEqual(numAcc[1].accuracy);
    });
  });

  describe('calculateProgressData', () => {
    it('should return empty array for no guesses', () => {
      expect(calculateProgressData([])).toEqual([]);
    });

    it('should return single point if fewer guesses than window size', () => {
      const guesses = [
        createGuess({ timestamp: 1000, exactMatch: true }),
        createGuess({ timestamp: 2000, exactMatch: false }),
      ];

      const progress = calculateProgressData(guesses, 20);
      expect(progress).toHaveLength(1);
      expect(progress[0].accuracy).toBe(50); // 1/2
      expect(progress[0].guessCount).toBe(2);
    });

    it('should calculate rolling average with correct window size', () => {
      const guesses = Array.from({ length: 25 }, (_, i) =>
        createGuess({
          timestamp: (i + 1) * 1000,
          exactMatch: i < 15, // First 15 correct, last 10 incorrect
        })
      );

      const progress = calculateProgressData(guesses, 10);
      expect(progress.length).toBeGreaterThan(0);

      // First window (guesses 0-9): 10/10 = 100%
      expect(progress[0].accuracy).toBe(100);

      // Last window (guesses 15-24): 0/10 = 0%
      expect(progress[progress.length - 1].accuracy).toBe(0);
    });

    it('should filter by days parameter', () => {
      const now = Date.now();
      const guesses = [
        createGuess({
          timestamp: now - 10 * 24 * 60 * 60 * 1000,
          exactMatch: true,
        }), // 10 days ago
        createGuess({
          timestamp: now - 5 * 24 * 60 * 60 * 1000,
          exactMatch: true,
        }), // 5 days ago
        createGuess({
          timestamp: now - 1 * 24 * 60 * 60 * 1000,
          exactMatch: true,
        }), // 1 day ago
      ];

      const progress7Days = calculateProgressData(guesses, 1, 7);
      // guessCount is the index+1 in the filtered array
      expect(progress7Days.length).toBe(2); // Only last 2 guesses in range
      expect(progress7Days[1].guessCount).toBe(2); // Second point has 2 guesses total

      const progressAll = calculateProgressData(guesses, 1, 0);
      expect(progressAll.length).toBe(3); // All guesses
      expect(progressAll[2].guessCount).toBe(3); // Last point has all 3 guesses
    });

    it('should format dates as yyyy-MM-dd', () => {
      const guesses = [
        createGuess({
          timestamp: new Date('2025-01-15T10:00:00').getTime(),
          exactMatch: true,
        }),
      ];

      const progress = calculateProgressData(guesses, 1);
      expect(progress[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(progress[0].date).toBe('2025-01-15');
    });

    it('should handle unsorted guesses correctly', () => {
      const guesses = [
        createGuess({ timestamp: 3000, exactMatch: false }),
        createGuess({ timestamp: 1000, exactMatch: true }),
        createGuess({ timestamp: 2000, exactMatch: true }),
      ];

      const progress = calculateProgressData(guesses, 2);
      // Should process in order: 1000, 2000, 3000
      expect(progress).toHaveLength(2);
      // First window (1000-2000): 2/2 = 100%
      expect(progress[0].accuracy).toBe(100);
      // Second window (2000-3000): 1/2 = 50%
      expect(progress[1].accuracy).toBe(50);
    });
  });

  describe('getBestTimeSlot', () => {
    it('should return null for empty heatmap', () => {
      expect(getBestTimeSlot([])).toBeNull();
    });

    it('should return slot with highest accuracy', () => {
      const heatMap = [
        { day: 1, hour: 10, count: 5, accuracy: 75 },
        { day: 2, hour: 14, count: 5, accuracy: 90 },
        { day: 3, hour: 18, count: 5, accuracy: 60 },
      ];

      const best = getBestTimeSlot(heatMap);
      expect(best).toEqual({ day: 2, hour: 14, accuracy: 90 });
    });

    it('should handle single slot', () => {
      const heatMap = [{ day: 0, hour: 9, count: 3, accuracy: 50 }];
      const best = getBestTimeSlot(heatMap);
      expect(best).toEqual({ day: 0, hour: 9, accuracy: 50 });
    });
  });

  describe('formatDayName', () => {
    it('should format days correctly', () => {
      expect(formatDayName(0)).toBe('Sunday');
      expect(formatDayName(1)).toBe('Monday');
      expect(formatDayName(2)).toBe('Tuesday');
      expect(formatDayName(3)).toBe('Wednesday');
      expect(formatDayName(4)).toBe('Thursday');
      expect(formatDayName(5)).toBe('Friday');
      expect(formatDayName(6)).toBe('Saturday');
    });

    it('should return "Unknown" for invalid day numbers', () => {
      expect(formatDayName(7)).toBe('Unknown');
      expect(formatDayName(-1)).toBe('Unknown');
      expect(formatDayName(100)).toBe('Unknown');
    });
  });

  describe('formatTimeSlot', () => {
    it('should format AM hours correctly', () => {
      expect(formatTimeSlot(0)).toBe('12:00 AM');
      expect(formatTimeSlot(1)).toBe('1:00 AM');
      expect(formatTimeSlot(11)).toBe('11:00 AM');
    });

    it('should format PM hours correctly', () => {
      expect(formatTimeSlot(12)).toBe('12:00 PM');
      expect(formatTimeSlot(13)).toBe('1:00 PM');
      expect(formatTimeSlot(23)).toBe('11:00 PM');
    });

    it('should handle edge cases', () => {
      expect(formatTimeSlot(0)).toBe('12:00 AM'); // Midnight
      expect(formatTimeSlot(12)).toBe('12:00 PM'); // Noon
    });
  });

  describe('Integration: Complex real-world scenarios', () => {
    it('should handle mixed deck types correctly', () => {
      const guesses = [
        createGuess({ timestamp: 1000, deckType: 'zener', exactMatch: true }),
        createGuess({
          timestamp: 2000,
          deckType: 'playing',
          exactMatch: false,
        }),
        createGuess({ timestamp: 3000, deckType: 'zener', exactMatch: true }),
      ];

      const zenerStats = calculateDeckStats(guesses, 'zener');
      const playingStats = calculateDeckStats(guesses, 'playing');

      expect(zenerStats.totalGuesses).toBe(2);
      expect(zenerStats.accuracy).toBe(100);
      expect(playingStats.totalGuesses).toBe(1);
      expect(playingStats.accuracy).toBe(0);
    });

    it('should maintain accuracy with large datasets', () => {
      // Create 1000 guesses with known distribution
      const guesses = Array.from({ length: 1000 }, (_, i) =>
        createGuess({
          timestamp: i * 1000,
          exactMatch: i % 5 === 0, // 20% accuracy
        })
      );

      const stats = calculateDeckStats(guesses, 'playing');
      expect(stats.accuracy).toBe(20);
    });

    it('should handle timezone boundaries correctly in heatmap', () => {
      // Create guesses at 23:59 and 00:01 - should be different hours
      const guesses = [
        createGuess({
          timestamp: new Date('2025-01-13T23:59:00').getTime(),
          exactMatch: true,
        }),
        createGuess({
          timestamp: new Date('2025-01-13T23:58:00').getTime(),
          exactMatch: true,
        }),
        createGuess({
          timestamp: new Date('2025-01-13T23:57:00').getTime(),
          exactMatch: true,
        }),
        createGuess({
          timestamp: new Date('2025-01-14T00:01:00').getTime(),
          exactMatch: false,
        }),
        createGuess({
          timestamp: new Date('2025-01-14T00:02:00').getTime(),
          exactMatch: false,
        }),
        createGuess({
          timestamp: new Date('2025-01-14T00:03:00').getTime(),
          exactMatch: false,
        }),
      ];

      const heatMap = calculateHeatMapData(guesses, 3);
      expect(heatMap).toHaveLength(2); // Should be 2 different slots
      expect(heatMap.some((h) => h.hour === 23)).toBe(true);
      expect(heatMap.some((h) => h.hour === 0)).toBe(true);
    });
  });
});
