import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { CardReveal } from './CardReveal';
import { Card } from '../types';
import { theme } from '../constants/theme';

// Mock expo-haptics
jest.mock('expo-haptics');

describe('CardReveal', () => {
  const mockCard: Card = {
    id: '1',
    name: 'Ace of Hearts',
    suit: 'Hearts',
    number: 'Ace',
    deckType: 'playing',
  };

  const mockOnDrawAnother = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Exact Match Scenario', () => {
    it('should display success message for exact match', () => {
      const { getByText, getAllByText } = render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Hearts"
          guessedNumber="Ace"
          suitMatch={true}
          numberMatch={true}
          exactMatch={true}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(getByText(/Exact Match!/)).toBeTruthy();
      expect(getAllByText('Ace of Hearts').length).toBeGreaterThan(0);
    });

    it('should trigger success haptic feedback on exact match', () => {
      render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Hearts"
          guessedNumber="Ace"
          suitMatch={true}
          numberMatch={true}
          exactMatch={true}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should display green border for exact match', () => {
      const { getByText } = render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Hearts"
          guessedNumber="Ace"
          suitMatch={true}
          numberMatch={true}
          exactMatch={true}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      const resultText = getByText(/Exact Match!/);
      expect(resultText.props.style).toContainEqual({
        color: theme.colors.success,
      });
    });
  });

  describe('Suit Match Only Scenario', () => {
    it('should display suit match message', () => {
      const { getByText } = render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Hearts"
          guessedNumber="Two"
          suitMatch={true}
          numberMatch={false}
          exactMatch={false}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(getByText('~ Suit Match')).toBeTruthy();
    });

    it('should trigger warning haptic feedback on suit match', () => {
      render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Hearts"
          guessedNumber="Two"
          suitMatch={true}
          numberMatch={false}
          exactMatch={false}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
    });

    it('should display yellow border for suit match', () => {
      const { getByText } = render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Hearts"
          guessedNumber="Two"
          suitMatch={true}
          numberMatch={false}
          exactMatch={false}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      const resultText = getByText('~ Suit Match');
      expect(resultText.props.style).toContainEqual({
        color: theme.colors.warning,
      });
    });
  });

  describe('Number Match Only Scenario', () => {
    it('should display number match message', () => {
      const { getByText } = render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Diamonds"
          guessedNumber="Ace"
          suitMatch={false}
          numberMatch={true}
          exactMatch={false}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(getByText('~ Number Match')).toBeTruthy();
    });

    it('should trigger warning haptic feedback on number match', () => {
      render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Diamonds"
          guessedNumber="Ace"
          suitMatch={false}
          numberMatch={true}
          exactMatch={false}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
    });
  });

  describe('No Match Scenario', () => {
    it('should display no match message', () => {
      const { getByText } = render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Diamonds"
          guessedNumber="Two"
          suitMatch={false}
          numberMatch={false}
          exactMatch={false}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(getByText(/No Match/)).toBeTruthy();
    });

    it('should trigger error haptic feedback on no match', () => {
      render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Diamonds"
          guessedNumber="Two"
          suitMatch={false}
          numberMatch={false}
          exactMatch={false}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });

    it('should display red border for no match', () => {
      const { getByText } = render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Diamonds"
          guessedNumber="Two"
          suitMatch={false}
          numberMatch={false}
          exactMatch={false}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      const resultText = getByText(/No Match/);
      expect(resultText.props.style).toContainEqual({
        color: theme.colors.error,
      });
    });
  });

  describe('User Guess Display', () => {
    it('should display guess with number for full deck', () => {
      const { getAllByText } = render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Hearts"
          guessedNumber="Ace"
          suitMatch={true}
          numberMatch={true}
          exactMatch={true}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      // Should appear at least twice (guess and actual)
      const aceOfHeartsElements = getAllByText('Ace of Hearts');
      expect(aceOfHeartsElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should display only suit for Zener cards (no number)', () => {
      const zenerCard: Card = {
        id: '1',
        name: 'Circle',
        suit: 'Circle',
        deckType: 'zener',
      };

      const { getAllByText } = render(
        <CardReveal
          actualCard={zenerCard}
          guessedSuit="Circle"
          suitMatch={true}
          numberMatch={false}
          exactMatch={true}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      // Should appear at least twice (guess and actual card name)
      const circleElements = getAllByText('Circle');
      expect(circleElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('User Interaction', () => {
    it('should call onDrawAnother when button is pressed', () => {
      const { getByText } = render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Hearts"
          guessedNumber="Ace"
          suitMatch={true}
          numberMatch={true}
          exactMatch={true}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      const button = getByText('Draw Another Card');
      fireEvent.press(button);

      expect(mockOnDrawAnother).toHaveBeenCalledTimes(1);
    });

    it('should have proper accessibility label on button', () => {
      const { getByLabelText } = render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Hearts"
          guessedNumber="Ace"
          suitMatch={true}
          numberMatch={true}
          exactMatch={true}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(getByLabelText('Draw another card')).toBeTruthy();
    });
  });

  describe('Haptic Feedback Triggers', () => {
    it('should only trigger haptics once on mount', () => {
      const { rerender } = render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Hearts"
          guessedNumber="Ace"
          suitMatch={true}
          numberMatch={true}
          exactMatch={true}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);

      // Re-render with same props shouldn't trigger again
      rerender(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Hearts"
          guessedNumber="Ace"
          suitMatch={true}
          numberMatch={true}
          exactMatch={true}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptics again if match result changes', () => {
      const { rerender } = render(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Hearts"
          guessedNumber="Ace"
          suitMatch={true}
          numberMatch={true}
          exactMatch={true}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );

      // Change to no match
      rerender(
        <CardReveal
          actualCard={mockCard}
          guessedSuit="Diamonds"
          guessedNumber="Two"
          suitMatch={false}
          numberMatch={false}
          exactMatch={false}
          onDrawAnother={mockOnDrawAnother}
        />
      );

      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(2);
      expect(Haptics.notificationAsync).toHaveBeenLastCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });
  });
});
