import { Guess, DeckType } from '../types';
import { getDatabase } from './db';

interface GuessRow {
  id: string;
  timestamp: number;
  deck_type: string;
  guessed_suit: string;
  guessed_number: string | null;
  actual_suit: string;
  actual_number: string | null;
  suit_match: number;
  number_match: number;
  exact_match: number;
}

/**
 * Convert database row to Guess object
 */
function rowToGuess(row: GuessRow): Guess {
  return {
    id: row.id,
    timestamp: row.timestamp,
    deckType: row.deck_type as DeckType,
    guessedSuit: row.guessed_suit,
    guessedNumber: row.guessed_number || undefined,
    actualSuit: row.actual_suit,
    actualNumber: row.actual_number || undefined,
    suitMatch: Boolean(row.suit_match),
    numberMatch: Boolean(row.number_match),
    exactMatch: Boolean(row.exact_match),
  };
}

/**
 * Save a guess to the database
 */
export async function saveGuess(guess: Guess): Promise<void> {
  const db = getDatabase();

  await db.runAsync(
    `INSERT INTO guesses (
      id, timestamp, deck_type, guessed_suit, guessed_number,
      actual_suit, actual_number, suit_match, number_match, exact_match
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      guess.id,
      guess.timestamp,
      guess.deckType,
      guess.guessedSuit,
      guess.guessedNumber || null,
      guess.actualSuit,
      guess.actualNumber || null,
      guess.suitMatch ? 1 : 0,
      guess.numberMatch ? 1 : 0,
      guess.exactMatch ? 1 : 0,
    ]
  );
}

/**
 * Get all guesses, optionally filtered by deck type
 */
export async function getAllGuesses(deckType?: DeckType): Promise<Guess[]> {
  const db = getDatabase();

  let query = 'SELECT * FROM guesses';
  const params: string[] = [];

  if (deckType) {
    query += ' WHERE deck_type = ?';
    params.push(deckType);
  }

  query += ' ORDER BY timestamp DESC';

  const rows = await db.getAllAsync<GuessRow>(query, params);
  return rows.map(rowToGuess);
}

/**
 * Get guesses for a specific deck type
 */
export async function getGuessesByDeck(deckType: DeckType): Promise<Guess[]> {
  return getAllGuesses(deckType);
}

/**
 * Get guesses within a date range
 */
export async function getGuessesByDateRange(
  startTimestamp: number,
  endTimestamp: number,
  deckType?: DeckType
): Promise<Guess[]> {
  const db = getDatabase();

  let query = 'SELECT * FROM guesses WHERE timestamp >= ? AND timestamp <= ?';
  const params: (string | number)[] = [startTimestamp, endTimestamp];

  if (deckType) {
    query += ' AND deck_type = ?';
    params.push(deckType);
  }

  query += ' ORDER BY timestamp DESC';

  const rows = await db.getAllAsync<GuessRow>(query, params);
  return rows.map(rowToGuess);
}

/**
 * Get total guess count
 */
export async function getTotalGuessCount(deckType?: DeckType): Promise<number> {
  const db = getDatabase();

  let query = 'SELECT COUNT(*) as count FROM guesses';
  const params: string[] = [];

  if (deckType) {
    query += ' WHERE deck_type = ?';
    params.push(deckType);
  }

  const result = await db.getFirstAsync<{ count: number }>(query, params);
  return result?.count || 0;
}

/**
 * Get exact match count
 */
export async function getExactMatchCount(deckType?: DeckType): Promise<number> {
  const db = getDatabase();

  let query = 'SELECT COUNT(*) as count FROM guesses WHERE exact_match = 1';
  const params: string[] = [];

  if (deckType) {
    query += ' AND deck_type = ?';
    params.push(deckType);
  }

  const result = await db.getFirstAsync<{ count: number }>(query, params);
  return result?.count || 0;
}

/**
 * Get most recent guesses (for calculating current streak)
 */
export async function getRecentGuesses(
  limit: number,
  deckType?: DeckType
): Promise<Guess[]> {
  const db = getDatabase();

  let query = 'SELECT * FROM guesses';
  const params: (string | number)[] = [];

  if (deckType) {
    query += ' WHERE deck_type = ?';
    params.push(deckType);
  }

  query += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(limit);

  const rows = await db.getAllAsync<GuessRow>(query, params);
  return rows.map(rowToGuess);
}

/**
 * Delete guesses older than a certain date
 * Returns number of deleted rows
 */
export async function deleteOldGuesses(
  beforeTimestamp: number
): Promise<number> {
  const db = getDatabase();

  const result = await db.runAsync('DELETE FROM guesses WHERE timestamp < ?', [
    beforeTimestamp,
  ]);

  return result.changes;
}

/**
 * Get guesses grouped by card (for card-specific accuracy)
 */
export async function getGuessesGroupedByCard(
  deckType?: DeckType
): Promise<Guess[]> {
  return getAllGuesses(deckType);
}

/**
 * Get guess count by hour of day and day of week (for heatmap)
 */
export async function getGuessesForHeatMap(
  deckType?: DeckType
): Promise<Guess[]> {
  return getAllGuesses(deckType);
}
