import * as SQLite from 'expo-sqlite';
import {
  initDatabase,
  getDatabase,
  closeDatabase,
  clearAllData,
  vacuumDatabase,
} from './db';

// Mock expo-sqlite before importing db module
jest.mock('expo-sqlite');

describe('Database Initialization', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any;

  beforeEach(async () => {
    // Ensure clean state by closing any existing db FIRST
    try {
      await closeDatabase();
    } catch (e) {
      // Database might not be initialized, that's fine
    }

    jest.clearAllMocks();

    // Create mock database
    mockDb = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      closeAsync: jest.fn().mockResolvedValue(undefined),
    };

    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);
  });

  afterEach(async () => {
    // Clean up - force close even if it errors
    try {
      await closeDatabase();
    } catch (e) {
      // Ignore errors - database might be in error state from test
    }

    // Reset the mock to avoid error states leaking between tests
    mockDb = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      closeAsync: jest.fn().mockResolvedValue(undefined),
    };
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('initDatabase', () => {
    it('should open database and create tables', async () => {
      const db = await initDatabase();

      expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('telepathy.db');
      expect(db).toBe(mockDb);
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS guesses')
      );
    });

    it('should create all required indexes', async () => {
      await initDatabase();

      const sqlCall = mockDb.execAsync.mock.calls[0][0];
      expect(sqlCall).toContain('CREATE INDEX IF NOT EXISTS idx_timestamp');
      expect(sqlCall).toContain('CREATE INDEX IF NOT EXISTS idx_deck_type');
      expect(sqlCall).toContain('CREATE INDEX IF NOT EXISTS idx_exact_match');
      expect(sqlCall).toContain(
        'CREATE INDEX IF NOT EXISTS idx_deck_timestamp'
      );
    });

    it('should define all required columns', async () => {
      await initDatabase();

      const sqlCall = mockDb.execAsync.mock.calls[0][0];
      expect(sqlCall).toContain('id TEXT PRIMARY KEY');
      expect(sqlCall).toContain('timestamp INTEGER NOT NULL');
      expect(sqlCall).toContain('deck_type TEXT NOT NULL');
      expect(sqlCall).toContain('guessed_suit TEXT NOT NULL');
      expect(sqlCall).toContain('guessed_number TEXT');
      expect(sqlCall).toContain('actual_suit TEXT NOT NULL');
      expect(sqlCall).toContain('actual_number TEXT');
      expect(sqlCall).toContain('suit_match INTEGER NOT NULL');
      expect(sqlCall).toContain('number_match INTEGER NOT NULL');
      expect(sqlCall).toContain('exact_match INTEGER NOT NULL');
    });

    it('should return same instance on subsequent calls', async () => {
      const db1 = await initDatabase();
      const db2 = await initDatabase();

      expect(db1).toBe(db2);
      expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle database creation errors', async () => {
      const error = new Error('Database creation failed');
      (SQLite.openDatabaseAsync as jest.Mock).mockRejectedValue(error);

      await expect(initDatabase()).rejects.toThrow('Database creation failed');
    });

    it('should handle table creation errors', async () => {
      const error = new Error('Table creation failed');
      mockDb.execAsync.mockRejectedValue(error);

      await expect(initDatabase()).rejects.toThrow('Table creation failed');
    });
  });

  describe('getDatabase', () => {
    it('should return database instance after initialization', async () => {
      await initDatabase();
      const db = getDatabase();

      expect(db).toBe(mockDb);
    });

    it('should throw error if database not initialized', () => {
      expect(() => getDatabase()).toThrow(
        'Database not initialized. Call initDatabase() first.'
      );
    });

    it('should throw error after database is closed', async () => {
      await initDatabase();
      await closeDatabase();

      expect(() => getDatabase()).toThrow('Database not initialized');
    });
  });

  describe('closeDatabase', () => {
    it('should close database connection', async () => {
      await initDatabase();
      await closeDatabase();

      expect(mockDb.closeAsync).toHaveBeenCalled();
      expect(() => getDatabase()).toThrow('Database not initialized');
    });

    it('should handle closing when database not initialized', async () => {
      await expect(closeDatabase()).resolves.not.toThrow();
      expect(mockDb.closeAsync).not.toHaveBeenCalled();
    });

    it('should handle close errors gracefully', async () => {
      await initDatabase();
      const error = new Error('Close failed');
      mockDb.closeAsync.mockRejectedValue(error);

      await expect(closeDatabase()).rejects.toThrow('Close failed');
    });

    it('should allow re-initialization after close', async () => {
      await initDatabase();
      await closeDatabase();

      // Reset mock for new database instance
      const newMockDb = {
        execAsync: jest.fn().mockResolvedValue(undefined),
        closeAsync: jest.fn().mockResolvedValue(undefined),
      };
      (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(newMockDb);

      const db = await initDatabase();
      expect(db).toBe(newMockDb);
    });
  });

  describe('clearAllData', () => {
    it('should delete all guesses', async () => {
      await initDatabase();
      // After init, execAsync should have been called once for CREATE TABLE
      expect(mockDb.execAsync).toHaveBeenCalledTimes(1);

      await clearAllData();

      // Now it should have been called twice (CREATE TABLE + DELETE)
      expect(mockDb.execAsync).toHaveBeenCalledTimes(2);
      expect(mockDb.execAsync).toHaveBeenCalledWith('DELETE FROM guesses;');
    });

    it('should throw error if database not initialized', async () => {
      await expect(clearAllData()).rejects.toThrow('Database not initialized');
    });

    it('should handle deletion errors', async () => {
      await initDatabase();
      const error = new Error('Delete failed');
      mockDb.execAsync.mockRejectedValue(error);

      await expect(clearAllData()).rejects.toThrow('Delete failed');
    });
  });

  describe('vacuumDatabase', () => {
    it('should run VACUUM command', async () => {
      await initDatabase();
      await vacuumDatabase();

      expect(mockDb.execAsync).toHaveBeenCalledWith('VACUUM;');
    });

    it('should throw error if database not initialized', async () => {
      await expect(vacuumDatabase()).rejects.toThrow(
        'Database not initialized'
      );
    });

    it('should handle vacuum errors', async () => {
      await initDatabase();
      const error = new Error('Vacuum failed');
      mockDb.execAsync.mockRejectedValue(error);

      await expect(vacuumDatabase()).rejects.toThrow('Vacuum failed');
    });
  });

  describe('Integration: Database lifecycle', () => {
    it('should support full lifecycle: init -> use -> close -> re-init', async () => {
      // Initialize
      const db1 = await initDatabase();
      expect(db1).toBe(mockDb);
      expect(getDatabase()).toBe(mockDb);

      // Close
      await closeDatabase();
      expect(() => getDatabase()).toThrow();

      // Re-initialize
      const newMockDb = {
        execAsync: jest.fn().mockResolvedValue(undefined),
        closeAsync: jest.fn().mockResolvedValue(undefined),
      };
      (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(newMockDb);

      const db2 = await initDatabase();
      expect(db2).toBe(newMockDb);
      expect(getDatabase()).toBe(newMockDb);
    });

    it('should support clear and vacuum operations', async () => {
      await initDatabase();

      await clearAllData();
      expect(mockDb.execAsync).toHaveBeenCalledWith('DELETE FROM guesses;');

      await vacuumDatabase();
      expect(mockDb.execAsync).toHaveBeenCalledWith('VACUUM;');
    });
  });
});
