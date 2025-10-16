import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables if they don't exist
 * This must be called before any database operations
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('telepathy.db');

  // Create guesses table with proper indexes
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS guesses (
      id TEXT PRIMARY KEY,
      timestamp INTEGER NOT NULL,
      deck_type TEXT NOT NULL,
      guessed_suit TEXT NOT NULL,
      guessed_number TEXT,
      actual_suit TEXT NOT NULL,
      actual_number TEXT,
      suit_match INTEGER NOT NULL,
      number_match INTEGER NOT NULL,
      exact_match INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_timestamp ON guesses(timestamp);
    CREATE INDEX IF NOT EXISTS idx_deck_type ON guesses(deck_type);
    CREATE INDEX IF NOT EXISTS idx_exact_match ON guesses(exact_match);
    CREATE INDEX IF NOT EXISTS idx_deck_timestamp ON guesses(deck_type, timestamp);
  `);

  return db;
}

/**
 * Get the database instance
 * Throws error if database hasn't been initialized
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 * Useful for testing
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    try {
      await db.closeAsync();
    } finally {
      // Always set db to null, even if close fails
      db = null;
    }
  }
}

/**
 * Clear all data from the database
 * WARNING: This is destructive and cannot be undone
 */
export async function clearAllData(): Promise<void> {
  const database = getDatabase();
  await database.execAsync('DELETE FROM guesses;');
}

/**
 * Vacuum the database to reclaim space
 * Should be run periodically (e.g., on app startup if needed)
 */
export async function vacuumDatabase(): Promise<void> {
  const database = getDatabase();
  await database.execAsync('VACUUM;');
}
