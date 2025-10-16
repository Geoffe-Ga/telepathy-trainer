import * as Crypto from 'expo-crypto';
import { Card } from '../types';

/**
 * CRITICAL: Use cryptographically secure random number generation
 * to ensure the card draw is truly random and not influenced by
 * the user's guess in any way.
 *
 * This function:
 * 1. Uses expo-crypto (crypto.getRandomValues under the hood)
 * 2. Generates random bytes and converts to index
 * 3. Ensures uniform distribution across all cards using modulo
 *
 * @param cards Array of cards to select from
 * @returns A randomly selected card
 * @throws Error if cards array is empty
 */
export async function getSecureRandomCard(cards: Card[]): Promise<Card> {
  if (cards.length === 0) {
    throw new Error('Cards array cannot be empty');
  }

  // Generate 4 bytes (32 bits) of cryptographically secure random data
  const randomBytes = await Crypto.getRandomBytesAsync(4);

  // Convert bytes to a 32-bit unsigned integer
  const randomValue = new Uint32Array(randomBytes.buffer)[0];

  // Use modulo to map to array index
  // This provides uniform distribution across all cards
  const index = randomValue % cards.length;

  return cards[index];
}
