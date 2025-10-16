import { Card, DeckType } from '../types';
import {
  getCardsForDeck,
  getSuitsForDeck,
  getNumbersForSuit,
} from '../constants/decks';

/**
 * Get a specific card by its properties
 */
export function findCard(
  deckType: DeckType,
  suit: string,
  number?: string
): Card | undefined {
  const cards = getCardsForDeck(deckType);
  return cards.find((card) => card.suit === suit && card.number === number);
}

/**
 * Get all cards for a specific suit in a deck
 */
export function getCardsForSuit(deckType: DeckType, suit: string): Card[] {
  const cards = getCardsForDeck(deckType);
  return cards.filter((card) => card.suit === suit);
}

/**
 * Check if a deck requires number selection (Zener doesn't)
 */
export function deckRequiresNumber(deckType: DeckType): boolean {
  return deckType !== 'zener';
}

/**
 * Format card name for display
 */
export function formatCardName(card: Card): string {
  return card.name;
}

/**
 * Export all deck utility functions for convenience
 */
export { getCardsForDeck, getSuitsForDeck, getNumbersForSuit };
