import {
  saveGuess,
  getAllGuesses,
  getGuessesByDeck,
  getGuessesByDateRange,
  getTotalGuessCount,
  getExactMatchCount,
  getRecentGuesses,
  deleteOldGuesses,
} from './queries';
import { Guess } from '../types';
import { initDatabase, closeDatabase } from './db';

// Use in-memory database for testing
jest.mock('./db', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any = null;

  return {
    initDatabase: jest.fn(async () => {
      if (mockDb) return mockDb;

      // Create in-memory database
      mockDb = {
        execAsync: jest.fn(async () => {}),
        runAsync: jest.fn(async () => ({ changes: 0 })),
        getAllAsync: jest.fn(async () => []),
        getFirstAsync: jest.fn(async () => null),
      };

      return mockDb;
    }),
    getDatabase: jest.fn(() => {
      if (!mockDb) {
        throw new Error('Database not initialized');
      }
      return mockDb;
    }),
    closeDatabase: jest.fn(async () => {
      mockDb = null;
    }),
  };
});

describe('Database Queries', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Initialize database
    mockDb = await initDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  const createTestGuess = (overrides: Partial<Guess> = {}): Guess => ({
    id: `test-${Math.random()}`,
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

  describe('saveGuess', () => {
    it('should save a guess with all fields', async () => {
      const guess = createTestGuess();

      await saveGuess(guess);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO guesses'),
        [
          guess.id,
          guess.timestamp,
          guess.deckType,
          guess.guessedSuit,
          guess.guessedNumber,
          guess.actualSuit,
          guess.actualNumber,
          1, // suitMatch
          1, // numberMatch
          1, // exactMatch
        ]
      );
    });

    it('should handle Zener cards with undefined numbers', async () => {
      const guess = createTestGuess({
        deckType: 'zener',
        guessedNumber: undefined,
        actualNumber: undefined,
      });

      await saveGuess(guess);

      const callArgs = mockDb.runAsync.mock.calls[0][1];
      expect(callArgs[4]).toBeNull(); // guessedNumber
      expect(callArgs[6]).toBeNull(); // actualNumber
    });

    it('should convert boolean matches to integers', async () => {
      const guess = createTestGuess({
        suitMatch: false,
        numberMatch: false,
        exactMatch: false,
      });

      await saveGuess(guess);

      const callArgs = mockDb.runAsync.mock.calls[0][1];
      expect(callArgs[7]).toBe(0); // suitMatch
      expect(callArgs[8]).toBe(0); // numberMatch
      expect(callArgs[9]).toBe(0); // exactMatch
    });

    it('should throw error if database not initialized', async () => {
      await closeDatabase();

      const guess = createTestGuess();
      await expect(saveGuess(guess)).rejects.toThrow(
        'Database not initialized'
      );
    });
  });

  describe('getAllGuesses', () => {
    it('should return all guesses ordered by timestamp DESC', async () => {
      const mockRows = [
        {
          id: '1',
          timestamp: 3000,
          deck_type: 'playing',
          guessed_suit: 'hearts',
          guessed_number: 'Ace',
          actual_suit: 'hearts',
          actual_number: 'Ace',
          suit_match: 1,
          number_match: 1,
          exact_match: 1,
        },
        {
          id: '2',
          timestamp: 2000,
          deck_type: 'zener',
          guessed_suit: 'circle',
          guessed_number: null,
          actual_suit: 'circle',
          actual_number: null,
          suit_match: 1,
          number_match: 1,
          exact_match: 1,
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const guesses = await getAllGuesses();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY timestamp DESC'),
        []
      );
      expect(guesses).toHaveLength(2);
      expect(guesses[0].id).toBe('1');
      expect(guesses[0].timestamp).toBe(3000);
    });

    it('should filter by deck type when provided', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await getAllGuesses('zener');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE deck_type = ?'),
        ['zener']
      );
    });

    it('should convert database rows to Guess objects correctly', async () => {
      const mockRows = [
        {
          id: '1',
          timestamp: 1000,
          deck_type: 'playing',
          guessed_suit: 'hearts',
          guessed_number: 'Ace',
          actual_suit: 'spades',
          actual_number: 'King',
          suit_match: 0,
          number_match: 0,
          exact_match: 0,
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const guesses = await getAllGuesses();

      expect(guesses[0]).toEqual({
        id: '1',
        timestamp: 1000,
        deckType: 'playing',
        guessedSuit: 'hearts',
        guessedNumber: 'Ace',
        actualSuit: 'spades',
        actualNumber: 'King',
        suitMatch: false,
        numberMatch: false,
        exactMatch: false,
      });
    });

    it('should handle null numbers as undefined', async () => {
      const mockRows = [
        {
          id: '1',
          timestamp: 1000,
          deck_type: 'zener',
          guessed_suit: 'circle',
          guessed_number: null,
          actual_suit: 'circle',
          actual_number: null,
          suit_match: 1,
          number_match: 1,
          exact_match: 1,
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const guesses = await getAllGuesses();

      expect(guesses[0].guessedNumber).toBeUndefined();
      expect(guesses[0].actualNumber).toBeUndefined();
    });
  });

  describe('getGuessesByDeck', () => {
    it('should call getAllGuesses with deck type', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await getGuessesByDeck('rws');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE deck_type = ?'),
        ['rws']
      );
    });
  });

  describe('getGuessesByDateRange', () => {
    it('should filter by date range', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await getGuessesByDateRange(1000, 5000);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('timestamp >= ? AND timestamp <= ?'),
        [1000, 5000]
      );
    });

    it('should filter by deck type and date range', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await getGuessesByDateRange(1000, 5000, 'playing');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('AND deck_type = ?'),
        [1000, 5000, 'playing']
      );
    });
  });

  describe('getTotalGuessCount', () => {
    it('should return total count for all guesses', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 42 });

      const count = await getTotalGuessCount();

      expect(count).toBe(42);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM guesses'),
        []
      );
    });

    it('should filter by deck type', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 10 });

      const count = await getTotalGuessCount('zener');

      expect(count).toBe(10);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE deck_type = ?'),
        ['zener']
      );
    });

    it('should return 0 if no results', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const count = await getTotalGuessCount();

      expect(count).toBe(0);
    });
  });

  describe('getExactMatchCount', () => {
    it('should return count of exact matches', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 15 });

      const count = await getExactMatchCount();

      expect(count).toBe(15);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE exact_match = 1'),
        []
      );
    });

    it('should filter by deck type', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 5 });

      const count = await getExactMatchCount('playing');

      expect(count).toBe(5);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('AND deck_type = ?'),
        ['playing']
      );
    });
  });

  describe('getRecentGuesses', () => {
    it('should return limited recent guesses', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await getRecentGuesses(10);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY timestamp DESC LIMIT ?'),
        [10]
      );
    });

    it('should filter by deck type', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await getRecentGuesses(10, 'thoth');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE deck_type = ?'),
        ['thoth', 10]
      );
    });

    it('should handle large limits', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await getRecentGuesses(1000);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        [1000]
      );
    });
  });

  describe('deleteOldGuesses', () => {
    it('should delete guesses older than cutoff timestamp', async () => {
      const cutoffTimestamp = Date.now() - 365 * 24 * 60 * 60 * 1000; // 1 year ago
      mockDb.runAsync.mockResolvedValue({ changes: 5 });

      const deleted = await deleteOldGuesses(cutoffTimestamp);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM guesses WHERE timestamp < ?'),
        [cutoffTimestamp]
      );
      expect(deleted).toBe(5);
    });

    it('should return 0 if nothing deleted', async () => {
      const cutoffTimestamp = 0;
      mockDb.runAsync.mockResolvedValue({ changes: 0 });

      const deleted = await deleteOldGuesses(cutoffTimestamp);

      expect(mockDb.runAsync).toHaveBeenCalledWith(expect.anything(), [0]);
      expect(deleted).toBe(0);
    });
  });

  describe('Integration: Full workflow', () => {
    it('should save and retrieve guesses correctly', async () => {
      const guess1 = createTestGuess({ id: '1', timestamp: 1000 });
      const guess2 = createTestGuess({ id: '2', timestamp: 2000 });
      const guess3 = createTestGuess({
        id: '3',
        timestamp: 3000,
        deckType: 'zener',
      });

      // Mock the save operations
      await saveGuess(guess1);
      await saveGuess(guess2);
      await saveGuess(guess3);

      expect(mockDb.runAsync).toHaveBeenCalledTimes(3);

      // Mock retrieval with sorted results
      mockDb.getAllAsync.mockResolvedValue([
        {
          id: '3',
          timestamp: 3000,
          deck_type: 'zener',
          guessed_suit: guess3.guessedSuit,
          guessed_number: null,
          actual_suit: guess3.actualSuit,
          actual_number: null,
          suit_match: 1,
          number_match: 1,
          exact_match: 1,
        },
        {
          id: '2',
          timestamp: 2000,
          deck_type: 'playing',
          guessed_suit: guess2.guessedSuit,
          guessed_number: guess2.guessedNumber,
          actual_suit: guess2.actualSuit,
          actual_number: guess2.actualNumber,
          suit_match: 1,
          number_match: 1,
          exact_match: 1,
        },
        {
          id: '1',
          timestamp: 1000,
          deck_type: 'playing',
          guessed_suit: guess1.guessedSuit,
          guessed_number: guess1.guessedNumber,
          actual_suit: guess1.actualSuit,
          actual_number: guess1.actualNumber,
          suit_match: 1,
          number_match: 1,
          exact_match: 1,
        },
      ]);

      const allGuesses = await getAllGuesses();
      expect(allGuesses).toHaveLength(3);
      expect(allGuesses[0].id).toBe('3'); // Most recent first
    });

    it('should handle errors gracefully', async () => {
      mockDb.runAsync.mockRejectedValue(new Error('Database error'));

      const guess = createTestGuess();

      await expect(saveGuess(guess)).rejects.toThrow('Database error');
    });
  });

  describe('Edge cases and data integrity', () => {
    it('should handle very large timestamps', async () => {
      const guess = createTestGuess({
        timestamp: Number.MAX_SAFE_INTEGER,
      });

      await saveGuess(guess);

      const callArgs = mockDb.runAsync.mock.calls[0][1];
      expect(callArgs[1]).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle special characters in suit names', async () => {
      const guess = createTestGuess({
        actualSuit: "Test'Suit",
      });

      await saveGuess(guess);

      const callArgs = mockDb.runAsync.mock.calls[0][1];
      expect(callArgs[5]).toBe("Test'Suit");
    });

    it('should handle all deck types', async () => {
      const deckTypes: Array<'zener' | 'playing' | 'rws' | 'thoth'> = [
        'zener',
        'playing',
        'rws',
        'thoth',
      ];

      for (const deckType of deckTypes) {
        const guess = createTestGuess({ deckType });
        await saveGuess(guess);
      }

      expect(mockDb.runAsync).toHaveBeenCalledTimes(4);
    });
  });
});
