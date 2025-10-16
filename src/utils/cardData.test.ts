import {
  findCard,
  getCardsForSuit,
  deckRequiresNumber,
  getCardsForDeck,
  getSuitsForDeck,
  getNumbersForSuit,
} from './cardData';
import { getDeckChanceAccuracy } from '../constants/decks';

describe('Card Data Utils', () => {
  describe('getCardsForDeck', () => {
    it('should return 5 cards for Zener deck', () => {
      const cards = getCardsForDeck('zener');
      expect(cards).toHaveLength(5);
      expect(cards.every((c) => c.deckType === 'zener')).toBe(true);
    });

    it('should return 78 cards for RWS tarot deck', () => {
      const cards = getCardsForDeck('rws');
      expect(cards).toHaveLength(78);
      expect(cards.every((c) => c.deckType === 'rws')).toBe(true);
    });

    it('should return 78 cards for Thoth tarot deck', () => {
      const cards = getCardsForDeck('thoth');
      expect(cards).toHaveLength(78);
      expect(cards.every((c) => c.deckType === 'thoth')).toBe(true);
    });

    it('should return 52 cards for playing cards deck', () => {
      const cards = getCardsForDeck('playing');
      expect(cards).toHaveLength(52);
      expect(cards.every((c) => c.deckType === 'playing')).toBe(true);
    });

    it('should return unique card IDs', () => {
      const cards = getCardsForDeck('playing');
      const ids = cards.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(cards.length);
    });
  });

  describe('getSuitsForDeck', () => {
    it('should return 5 suit objects for Zener deck', () => {
      const suits = getSuitsForDeck('zener');
      expect(suits).toHaveLength(5);
      expect(suits[0]).toHaveProperty('id');
      expect(suits[0]).toHaveProperty('name');
      expect(suits.map((s) => s.name)).toContain('Circle');
      expect(suits.map((s) => s.name)).toContain('Cross');
    });

    it('should return 5 suit objects for tarot decks (4 minor + Major Arcana)', () => {
      const rwsSuits = getSuitsForDeck('rws');
      const thothSuits = getSuitsForDeck('thoth');
      expect(rwsSuits).toHaveLength(5);
      expect(thothSuits).toHaveLength(5);
      expect(rwsSuits.map((s) => s.name)).toContain('Major Arcana');
      expect(thothSuits.map((s) => s.name)).toContain('Major Arcana');
    });

    it('should return 4 suit objects for playing cards', () => {
      const suits = getSuitsForDeck('playing');
      expect(suits).toHaveLength(4);
      const suitNames = suits.map((s) => s.name);
      expect(suitNames).toContain('Hearts');
      expect(suitNames).toContain('Diamonds');
      expect(suitNames).toContain('Clubs');
      expect(suitNames).toContain('Spades');
    });
  });

  describe('getNumbersForSuit', () => {
    it('should return empty array for Zener suits', () => {
      const numbers = getNumbersForSuit('zener', 'circle');
      expect(numbers).toHaveLength(0);
    });

    it('should return 22 cards for Major Arcana', () => {
      const rwsNumbers = getNumbersForSuit('rws', 'major');
      const thothNumbers = getNumbersForSuit('thoth', 'major');
      expect(rwsNumbers).toHaveLength(22);
      expect(thothNumbers).toHaveLength(22);
    });

    it('should return 14 cards for tarot minor arcana suits', () => {
      const numbers = getNumbersForSuit('rws', 'cups');
      expect(numbers).toHaveLength(14);
    });

    it('should return 13 cards for playing card suits', () => {
      const numbers = getNumbersForSuit('playing', 'hearts');
      expect(numbers).toHaveLength(13);
      expect(numbers).toContain('Ace');
      expect(numbers).toContain('King');
    });
  });

  describe('findCard', () => {
    it('should find a specific Zener card by suit ID', () => {
      const card = findCard('zener', 'circle', undefined);
      expect(card).toBeDefined();
      expect(card?.suit).toBe('circle');
      expect(card?.deckType).toBe('zener');
      expect(card?.number).toBeUndefined();
    });

    it('should find a specific playing card by suit ID and number', () => {
      const card = findCard('playing', 'hearts', 'Ace');
      expect(card).toBeDefined();
      expect(card?.suit).toBe('hearts');
      expect(card?.number).toBe('Ace');
    });

    it('should find a specific tarot card', () => {
      const card = findCard('rws', 'major', '0');
      expect(card).toBeDefined();
      expect(card?.suit).toBe('major');
      expect(card?.number).toBe('0');
    });

    it('should return undefined for non-existent card', () => {
      const card = findCard('playing', 'hearts', 'nonexistent');
      expect(card).toBeUndefined();
    });

    it('should handle undefined number parameter', () => {
      const card = findCard('zener', 'circle', undefined);
      expect(card).toBeDefined();
    });
  });

  describe('getCardsForSuit', () => {
    it('should return all cards for a specific suit', () => {
      const hearts = getCardsForSuit('playing', 'hearts');
      expect(hearts).toHaveLength(13);
      expect(hearts.every((c) => c.suit === 'hearts')).toBe(true);
    });

    it('should return 1 card for Zener suits', () => {
      const circles = getCardsForSuit('zener', 'circle');
      expect(circles).toHaveLength(1);
      expect(circles[0].suit).toBe('circle');
    });

    it('should return 22 cards for Major Arcana', () => {
      const majorArcana = getCardsForSuit('rws', 'major');
      expect(majorArcana).toHaveLength(22);
    });

    it('should return empty array for invalid suit', () => {
      const cards = getCardsForSuit('playing', 'InvalidSuit');
      expect(cards).toHaveLength(0);
    });
  });

  describe('deckRequiresNumber', () => {
    it('should return false for Zener deck', () => {
      expect(deckRequiresNumber('zener')).toBe(false);
    });

    it('should return true for playing cards', () => {
      expect(deckRequiresNumber('playing')).toBe(true);
    });

    it('should return true for RWS tarot', () => {
      expect(deckRequiresNumber('rws')).toBe(true);
    });

    it('should return true for Thoth tarot', () => {
      expect(deckRequiresNumber('thoth')).toBe(true);
    });
  });

  describe('getDeckChanceAccuracy', () => {
    it('should return 20% for Zener deck (1/5)', () => {
      expect(getDeckChanceAccuracy('zener')).toBe(20);
    });

    it('should return ~1.28% for tarot decks (1/78)', () => {
      const rwsAccuracy = getDeckChanceAccuracy('rws');
      const thothAccuracy = getDeckChanceAccuracy('thoth');
      expect(rwsAccuracy).toBeCloseTo(1.28, 2);
      expect(thothAccuracy).toBeCloseTo(1.28, 2);
    });

    it('should return ~1.92% for playing cards (1/52)', () => {
      expect(getDeckChanceAccuracy('playing')).toBeCloseTo(1.92, 2);
    });
  });

  describe('Card data integrity', () => {
    it('should have consistent suit IDs across deck', () => {
      const cards = getCardsForDeck('playing');
      const suits = new Set(cards.map((c) => c.suit));
      expect(suits.size).toBe(4);
    });

    it('should have properly formatted card names', () => {
      const card = findCard('playing', 'hearts', 'Ace');
      expect(card).toBeDefined();
      expect(card?.name).toBeTruthy();
      expect(card?.name.toLowerCase()).toContain('hearts');
      expect(card?.name.toLowerCase()).toContain('ace');
    });

    it('should have no null or undefined values in required fields', () => {
      const cards = getCardsForDeck('rws');
      cards.forEach((card) => {
        expect(card.id).toBeDefined();
        expect(card.suit).toBeDefined();
        expect(card.name).toBeDefined();
        expect(card.deckType).toBe('rws');
      });
    });

    it('should have undefined number only for Zener cards', () => {
      const zenerCards = getCardsForDeck('zener');
      const playingCards = getCardsForDeck('playing');

      zenerCards.forEach((card) => {
        expect(card.number).toBeUndefined();
      });

      playingCards.forEach((card) => {
        expect(card.number).toBeDefined();
      });
    });

    it('should have all cards with unique IDs within a deck', () => {
      ['zener', 'rws', 'thoth', 'playing'].forEach((deckType) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cards = getCardsForDeck(deckType as any);
        const ids = cards.map((c) => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(cards.length);
      });
    });
  });
});
