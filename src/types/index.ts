// Core deck types
export type DeckType = 'zener' | 'rws' | 'thoth' | 'playing';

// Card suit definition
export interface Suit {
  id: string;
  name: string;
  deckType: DeckType;
}

// Individual card definition
export interface Card {
  id: string;
  suit: string;
  number?: string; // undefined for Zener cards (they only have suits)
  name: string;
  deckType: DeckType;
}

// User's guess record
export interface Guess {
  id: string;
  timestamp: number;
  deckType: DeckType;
  guessedSuit: string;
  guessedNumber?: string;
  actualSuit: string;
  actualNumber?: string;
  suitMatch: boolean;
  numberMatch: boolean;
  exactMatch: boolean;
}

// Aggregated statistics for a deck
export interface DeckStats {
  deckType: DeckType;
  totalGuesses: number;
  exactMatches: number;
  suitMatches: number;
  numberMatches: number;
  accuracy: number;
  suitAccuracy: number;
  numberAccuracy: number;
  bestStreak: number;
  currentStreak: number;
}

// Heatmap data for time-based performance analysis
export interface HeatMapData {
  hour: number; // 0-23
  day: number; // 0-6 (Sunday-Saturday)
  count: number;
  accuracy: number;
}

// Card-specific accuracy data
export interface CardAccuracy {
  cardId: string;
  cardName: string;
  attempts: number;
  successes: number;
  accuracy: number;
}

// Suit-specific accuracy data
export interface SuitAccuracy {
  suit: string;
  attempts: number;
  successes: number;
  accuracy: number;
}

// Number-specific accuracy data
export interface NumberAccuracy {
  number: string;
  attempts: number;
  successes: number;
  accuracy: number;
}

// Progress over time data point
export interface ProgressDataPoint {
  date: string; // ISO date string
  accuracy: number;
  guessCount: number;
}

// Time range filter for stats
export type TimeRange = '7d' | '30d' | '90d' | 'all';
