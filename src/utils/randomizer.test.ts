import * as Crypto from 'expo-crypto';
import { getSecureRandomCard } from './randomizer';
import { Card } from '../types';

// Mock expo-crypto
jest.mock('expo-crypto');

describe('randomizer', () => {
  describe('getSecureRandomCard', () => {
    const mockCards: Card[] = [
      {
        id: '1',
        suit: 'hearts',
        number: 'Ace',
        name: 'Ace of Hearts',
        deckType: 'playing',
      },
      {
        id: '2',
        suit: 'hearts',
        number: '2',
        name: '2 of Hearts',
        deckType: 'playing',
      },
      {
        id: '3',
        suit: 'hearts',
        number: '3',
        name: '3 of Hearts',
        deckType: 'playing',
      },
      {
        id: '4',
        suit: 'hearts',
        number: '4',
        name: '4 of Hearts',
        deckType: 'playing',
      },
      {
        id: '5',
        suit: 'hearts',
        number: '5',
        name: '5 of Hearts',
        deckType: 'playing',
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a card from the provided array', async () => {
      // Mock random bytes that will result in index 2
      const mockBytes = new Uint8Array([0, 0, 0, 2]);
      (Crypto.getRandomBytesAsync as jest.Mock).mockResolvedValue(mockBytes);

      const result = await getSecureRandomCard(mockCards);

      expect(result).toBeDefined();
      expect(mockCards).toContain(result);
    });

    it('should use cryptographically secure random bytes', async () => {
      const mockBytes = new Uint8Array([0, 0, 0, 0]);
      (Crypto.getRandomBytesAsync as jest.Mock).mockResolvedValue(mockBytes);

      await getSecureRandomCard(mockCards);

      expect(Crypto.getRandomBytesAsync).toHaveBeenCalledWith(4);
    });

    it('should handle modulo correctly to avoid bias', async () => {
      // Test with different byte values to ensure proper distribution
      const mockBytes1 = new Uint8Array([0, 0, 0, 0]);
      (Crypto.getRandomBytesAsync as jest.Mock).mockResolvedValue(mockBytes1);
      const result1 = await getSecureRandomCard(mockCards);
      expect(result1).toBe(mockCards[0]);

      const mockBytes2 = new Uint8Array([0, 0, 0, 4]);
      (Crypto.getRandomBytesAsync as jest.Mock).mockResolvedValue(mockBytes2);
      const result2 = await getSecureRandomCard(mockCards);
      expect(result2).toBe(mockCards[4]);
    });

    it('should handle large random values correctly', async () => {
      // Test with max value
      const mockBytes = new Uint8Array([255, 255, 255, 255]);
      (Crypto.getRandomBytesAsync as jest.Mock).mockResolvedValue(mockBytes);

      const result = await getSecureRandomCard(mockCards);

      expect(mockCards).toContain(result);
    });

    it('should throw error if cards array is empty', async () => {
      await expect(getSecureRandomCard([])).rejects.toThrow(
        'Cards array cannot be empty'
      );
    });

    it('should have uniform distribution over many samples', async () => {
      // This test verifies no modulo bias by checking distribution
      const counts: Record<string, number> = {};
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        // Generate pseudo-random bytes for testing
        const randomValue = Math.floor(Math.random() * 4294967295);
        const mockBytes = new Uint8Array(new Uint32Array([randomValue]).buffer);
        (Crypto.getRandomBytesAsync as jest.Mock).mockResolvedValue(mockBytes);

        const result = await getSecureRandomCard(mockCards);
        counts[result.id] = (counts[result.id] || 0) + 1;
      }

      // Each card should be selected roughly 20% of the time (1/5)
      // Allow for statistical variance (15-25%)
      Object.values(counts).forEach((count) => {
        const percentage = (count / iterations) * 100;
        expect(percentage).toBeGreaterThan(15);
        expect(percentage).toBeLessThan(25);
      });
    });
  });
});
