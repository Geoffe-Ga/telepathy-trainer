import { Card, DeckType, Suit } from '../types';

// Zener Cards (5 cards, suit-only)
export const ZENER_SUITS: Suit[] = [
  { id: 'circle', name: 'Circle', deckType: 'zener' },
  { id: 'cross', name: 'Cross', deckType: 'zener' },
  { id: 'waves', name: 'Waves', deckType: 'zener' },
  { id: 'square', name: 'Square', deckType: 'zener' },
  { id: 'star', name: 'Star', deckType: 'zener' },
];

export const ZENER_CARDS: Card[] = ZENER_SUITS.map((suit) => ({
  id: `zener-${suit.id}`,
  suit: suit.id,
  number: undefined,
  name: suit.name,
  deckType: 'zener',
}));

// Rider-Waite-Smith Tarot Suits
export const RWS_SUITS: Suit[] = [
  { id: 'major', name: 'Major Arcana', deckType: 'rws' },
  { id: 'wands', name: 'Wands', deckType: 'rws' },
  { id: 'cups', name: 'Cups', deckType: 'rws' },
  { id: 'swords', name: 'Swords', deckType: 'rws' },
  { id: 'pentacles', name: 'Pentacles', deckType: 'rws' },
];

// Major Arcana cards (0-21)
const RWS_MAJOR_ARCANA: Card[] = [
  {
    id: 'rws-major-0',
    suit: 'major',
    number: '0',
    name: '0. The Fool',
    deckType: 'rws',
  },
  {
    id: 'rws-major-1',
    suit: 'major',
    number: '1',
    name: 'I. The Magician',
    deckType: 'rws',
  },
  {
    id: 'rws-major-2',
    suit: 'major',
    number: '2',
    name: 'II. The High Priestess',
    deckType: 'rws',
  },
  {
    id: 'rws-major-3',
    suit: 'major',
    number: '3',
    name: 'III. The Empress',
    deckType: 'rws',
  },
  {
    id: 'rws-major-4',
    suit: 'major',
    number: '4',
    name: 'IV. The Emperor',
    deckType: 'rws',
  },
  {
    id: 'rws-major-5',
    suit: 'major',
    number: '5',
    name: 'V. The Hierophant',
    deckType: 'rws',
  },
  {
    id: 'rws-major-6',
    suit: 'major',
    number: '6',
    name: 'VI. The Lovers',
    deckType: 'rws',
  },
  {
    id: 'rws-major-7',
    suit: 'major',
    number: '7',
    name: 'VII. The Chariot',
    deckType: 'rws',
  },
  {
    id: 'rws-major-8',
    suit: 'major',
    number: '8',
    name: 'VIII. Strength',
    deckType: 'rws',
  },
  {
    id: 'rws-major-9',
    suit: 'major',
    number: '9',
    name: 'IX. The Hermit',
    deckType: 'rws',
  },
  {
    id: 'rws-major-10',
    suit: 'major',
    number: '10',
    name: 'X. Wheel of Fortune',
    deckType: 'rws',
  },
  {
    id: 'rws-major-11',
    suit: 'major',
    number: '11',
    name: 'XI. Justice',
    deckType: 'rws',
  },
  {
    id: 'rws-major-12',
    suit: 'major',
    number: '12',
    name: 'XII. The Hanged Man',
    deckType: 'rws',
  },
  {
    id: 'rws-major-13',
    suit: 'major',
    number: '13',
    name: 'XIII. Death',
    deckType: 'rws',
  },
  {
    id: 'rws-major-14',
    suit: 'major',
    number: '14',
    name: 'XIV. Temperance',
    deckType: 'rws',
  },
  {
    id: 'rws-major-15',
    suit: 'major',
    number: '15',
    name: 'XV. The Devil',
    deckType: 'rws',
  },
  {
    id: 'rws-major-16',
    suit: 'major',
    number: '16',
    name: 'XVI. The Tower',
    deckType: 'rws',
  },
  {
    id: 'rws-major-17',
    suit: 'major',
    number: '17',
    name: 'XVII. The Star',
    deckType: 'rws',
  },
  {
    id: 'rws-major-18',
    suit: 'major',
    number: '18',
    name: 'XVIII. The Moon',
    deckType: 'rws',
  },
  {
    id: 'rws-major-19',
    suit: 'major',
    number: '19',
    name: 'XIX. The Sun',
    deckType: 'rws',
  },
  {
    id: 'rws-major-20',
    suit: 'major',
    number: '20',
    name: 'XX. Judgement',
    deckType: 'rws',
  },
  {
    id: 'rws-major-21',
    suit: 'major',
    number: '21',
    name: 'XXI. The World',
    deckType: 'rws',
  },
];

// Minor Arcana numbers for RWS
const RWS_MINOR_NUMBERS = [
  'Ace',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Page',
  'Knight',
  'Queen',
  'King',
];

// Generate Minor Arcana for RWS
const RWS_MINOR_SUITS = ['wands', 'cups', 'swords', 'pentacles'];
const RWS_MINOR_ARCANA: Card[] = RWS_MINOR_SUITS.flatMap((suit) =>
  RWS_MINOR_NUMBERS.map((number) => ({
    id: `rws-${suit}-${number.toLowerCase()}`,
    suit,
    number,
    name: `${number} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
    deckType: 'rws' as DeckType,
  }))
);

export const RWS_CARDS: Card[] = [...RWS_MAJOR_ARCANA, ...RWS_MINOR_ARCANA];

// Thoth Tarot Suits
export const THOTH_SUITS: Suit[] = [
  { id: 'major', name: 'Major Arcana', deckType: 'thoth' },
  { id: 'wands', name: 'Wands', deckType: 'thoth' },
  { id: 'cups', name: 'Cups', deckType: 'thoth' },
  { id: 'swords', name: 'Swords', deckType: 'thoth' },
  { id: 'disks', name: 'Disks', deckType: 'thoth' },
];

// Thoth Major Arcana (slightly different names)
const THOTH_MAJOR_ARCANA: Card[] = [
  {
    id: 'thoth-major-0',
    suit: 'major',
    number: '0',
    name: '0. The Fool',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-1',
    suit: 'major',
    number: '1',
    name: 'I. The Magus',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-2',
    suit: 'major',
    number: '2',
    name: 'II. The Priestess',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-3',
    suit: 'major',
    number: '3',
    name: 'III. The Empress',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-4',
    suit: 'major',
    number: '4',
    name: 'IV. The Emperor',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-5',
    suit: 'major',
    number: '5',
    name: 'V. The Hierophant',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-6',
    suit: 'major',
    number: '6',
    name: 'VI. The Lovers',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-7',
    suit: 'major',
    number: '7',
    name: 'VII. The Chariot',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-8',
    suit: 'major',
    number: '8',
    name: 'VIII. Adjustment',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-9',
    suit: 'major',
    number: '9',
    name: 'IX. The Hermit',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-10',
    suit: 'major',
    number: '10',
    name: 'X. Fortune',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-11',
    suit: 'major',
    number: '11',
    name: 'XI. Lust',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-12',
    suit: 'major',
    number: '12',
    name: 'XII. The Hanged Man',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-13',
    suit: 'major',
    number: '13',
    name: 'XIII. Death',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-14',
    suit: 'major',
    number: '14',
    name: 'XIV. Art',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-15',
    suit: 'major',
    number: '15',
    name: 'XV. The Devil',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-16',
    suit: 'major',
    number: '16',
    name: 'XVI. The Tower',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-17',
    suit: 'major',
    number: '17',
    name: 'XVII. The Star',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-18',
    suit: 'major',
    number: '18',
    name: 'XVIII. The Moon',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-19',
    suit: 'major',
    number: '19',
    name: 'XIX. The Sun',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-20',
    suit: 'major',
    number: '20',
    name: 'XX. The Aeon',
    deckType: 'thoth',
  },
  {
    id: 'thoth-major-21',
    suit: 'major',
    number: '21',
    name: 'XXI. The Universe',
    deckType: 'thoth',
  },
];

// Minor Arcana numbers for Thoth (different court cards)
const THOTH_MINOR_NUMBERS = [
  'Ace',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Princess',
  'Prince',
  'Queen',
  'Knight',
];

// Generate Minor Arcana for Thoth
const THOTH_MINOR_SUITS = ['wands', 'cups', 'swords', 'disks'];
const THOTH_MINOR_ARCANA: Card[] = THOTH_MINOR_SUITS.flatMap((suit) =>
  THOTH_MINOR_NUMBERS.map((number) => ({
    id: `thoth-${suit}-${number.toLowerCase()}`,
    suit,
    number,
    name: `${number} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
    deckType: 'thoth' as DeckType,
  }))
);

export const THOTH_CARDS: Card[] = [
  ...THOTH_MAJOR_ARCANA,
  ...THOTH_MINOR_ARCANA,
];

// Playing Cards Suits
export const PLAYING_SUITS: Suit[] = [
  { id: 'hearts', name: 'Hearts', deckType: 'playing' },
  { id: 'diamonds', name: 'Diamonds', deckType: 'playing' },
  { id: 'clubs', name: 'Clubs', deckType: 'playing' },
  { id: 'spades', name: 'Spades', deckType: 'playing' },
];

// Playing card numbers
const PLAYING_NUMBERS = [
  'Ace',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'Jack',
  'Queen',
  'King',
];

// Generate all playing cards
export const PLAYING_CARDS: Card[] = PLAYING_SUITS.flatMap((suit) =>
  PLAYING_NUMBERS.map((number) => ({
    id: `playing-${suit.id}-${number.toLowerCase()}`,
    suit: suit.id,
    number,
    name: `${number} of ${suit.name}`,
    deckType: 'playing' as DeckType,
  }))
);

// Helper functions
export function getCardsForDeck(deckType: DeckType): Card[] {
  switch (deckType) {
    case 'zener':
      return ZENER_CARDS;
    case 'rws':
      return RWS_CARDS;
    case 'thoth':
      return THOTH_CARDS;
    case 'playing':
      return PLAYING_CARDS;
  }
}

export function getSuitsForDeck(deckType: DeckType): Suit[] {
  switch (deckType) {
    case 'zener':
      return ZENER_SUITS;
    case 'rws':
      return RWS_SUITS;
    case 'thoth':
      return THOTH_SUITS;
    case 'playing':
      return PLAYING_SUITS;
  }
}

export function getNumbersForSuit(deckType: DeckType, suit: string): string[] {
  const cards = getCardsForDeck(deckType).filter((card) => card.suit === suit);
  return cards
    .map((card) => card.number)
    .filter((num): num is string => num !== undefined);
}

export function getDeckChanceAccuracy(deckType: DeckType): number {
  const cards = getCardsForDeck(deckType);
  return (1 / cards.length) * 100;
}
