import React from 'react';
import { render } from '@testing-library/react-native';
import { StatsSummary } from './StatsSummary';
import { DeckStats } from '../types';

describe('StatsSummary', () => {
  const mockStats: DeckStats = {
    deckType: 'playing',
    totalGuesses: 100,
    exactMatches: 20,
    suitMatches: 40,
    numberMatches: 30,
    accuracy: 20.0,
    suitAccuracy: 40.0,
    numberAccuracy: 30.0,
    bestStreak: 5,
    currentStreak: 2,
  };

  describe('Rendering', () => {
    it('should render the title', () => {
      const { getByText } = render(<StatsSummary stats={mockStats} />);

      expect(getByText('Overview')).toBeTruthy();
    });

    it('should render total guesses', () => {
      const { getByText } = render(<StatsSummary stats={mockStats} />);

      expect(getByText('Total Guesses')).toBeTruthy();
      expect(getByText('100')).toBeTruthy();
    });

    it('should render exact matches with accuracy percentage', () => {
      const { getByText } = render(<StatsSummary stats={mockStats} />);

      expect(getByText('Exact Matches')).toBeTruthy();
      expect(getByText('20 (20.0%)')).toBeTruthy();
    });

    it('should render current streak', () => {
      const { getByText } = render(<StatsSummary stats={mockStats} />);

      expect(getByText('Current Streak')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
    });

    it('should render best streak', () => {
      const { getByText } = render(<StatsSummary stats={mockStats} />);

      expect(getByText('Best Streak')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
    });

    it('should render suit accuracy when totalGuesses > 0', () => {
      const { getByText } = render(<StatsSummary stats={mockStats} />);

      expect(getByText('Suit Accuracy:')).toBeTruthy();
      expect(getByText('40.0%')).toBeTruthy();
    });

    it('should render number accuracy when numberAccuracy > 0', () => {
      const { getByText } = render(<StatsSummary stats={mockStats} />);

      expect(getByText('Number Accuracy:')).toBeTruthy();
      expect(getByText('30.0%')).toBeTruthy();
    });

    it('should not render number accuracy when numberAccuracy is 0', () => {
      const zenerStats: DeckStats = {
        ...mockStats,
        numberAccuracy: 0,
      };

      const { queryByText } = render(<StatsSummary stats={zenerStats} />);

      expect(queryByText('Number Accuracy:')).toBeNull();
    });

    it('should not render details container when totalGuesses is 0', () => {
      const emptyStats: DeckStats = {
        ...mockStats,
        totalGuesses: 0,
      };

      const { queryByText } = render(<StatsSummary stats={emptyStats} />);

      expect(queryByText('Suit Accuracy:')).toBeNull();
      expect(queryByText('Number Accuracy:')).toBeNull();
    });
  });

  describe('Accuracy Formatting', () => {
    it('should format accuracy to 1 decimal place', () => {
      const statsWithPrecision: DeckStats = {
        ...mockStats,
        accuracy: 20.555,
        suitAccuracy: 40.123,
        numberAccuracy: 30.999,
      };

      const { getByText } = render(<StatsSummary stats={statsWithPrecision} />);

      expect(getByText('20 (20.6%)')).toBeTruthy();
      expect(getByText('40.1%')).toBeTruthy();
      expect(getByText('31.0%')).toBeTruthy();
    });

    it('should handle 0% accuracy', () => {
      const zeroStats: DeckStats = {
        ...mockStats,
        exactMatches: 0,
        accuracy: 0,
      };

      const { getByText } = render(<StatsSummary stats={zeroStats} />);

      expect(getByText('0 (0.0%)')).toBeTruthy();
    });

    it('should handle 100% accuracy', () => {
      const perfectStats: DeckStats = {
        ...mockStats,
        exactMatches: 100,
        accuracy: 100.0,
      };

      const { getByText } = render(<StatsSummary stats={perfectStats} />);

      expect(getByText('100 (100.0%)')).toBeTruthy();
    });
  });

  describe('Stats Grid Layout', () => {
    it('should render all 4 stat cards', () => {
      const { getByText } = render(<StatsSummary stats={mockStats} />);

      expect(getByText('Total Guesses')).toBeTruthy();
      expect(getByText('Exact Matches')).toBeTruthy();
      expect(getByText('Current Streak')).toBeTruthy();
      expect(getByText('Best Streak')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      const largeStats: DeckStats = {
        ...mockStats,
        totalGuesses: 999999,
        exactMatches: 123456,
        bestStreak: 9999,
        currentStreak: 8888,
      };

      const { getByText } = render(<StatsSummary stats={largeStats} />);

      expect(getByText('999999')).toBeTruthy();
      expect(getByText('9999')).toBeTruthy();
      expect(getByText('8888')).toBeTruthy();
    });

    it('should handle all zero stats', () => {
      const zeroStats: DeckStats = {
        deckType: 'zener',
        totalGuesses: 0,
        exactMatches: 0,
        suitMatches: 0,
        numberMatches: 0,
        accuracy: 0,
        suitAccuracy: 0,
        numberAccuracy: 0,
        bestStreak: 0,
        currentStreak: 0,
      };

      const { getAllByText, getByText } = render(
        <StatsSummary stats={zeroStats} />
      );

      // There will be multiple "0" texts (totalGuesses, currentStreak, bestStreak)
      expect(getAllByText('0').length).toBeGreaterThan(0);
      expect(getByText('0 (0.0%)')).toBeTruthy();
    });

    it('should handle Zener deck with no number accuracy', () => {
      const zenerStats: DeckStats = {
        deckType: 'zener',
        totalGuesses: 50,
        exactMatches: 10,
        suitMatches: 10,
        numberMatches: 0,
        accuracy: 20.0,
        suitAccuracy: 20.0,
        numberAccuracy: 0,
        bestStreak: 3,
        currentStreak: 1,
      };

      const { getByText, queryByText } = render(
        <StatsSummary stats={zenerStats} />
      );

      expect(getByText('Suit Accuracy:')).toBeTruthy();
      expect(queryByText('Number Accuracy:')).toBeNull();
    });
  });
});
