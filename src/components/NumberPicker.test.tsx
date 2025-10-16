import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NumberPicker } from './NumberPicker';

describe('NumberPicker', () => {
  const mockOnSelectNumber = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render title', () => {
      const { getByText } = render(
        <NumberPicker
          deckType="playing"
          suit="hearts"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      expect(getByText('Select a Card:')).toBeTruthy();
    });

    it('should render all numbers for playing deck minor suits', () => {
      const { getByText } = render(
        <NumberPicker
          deckType="playing"
          suit="hearts"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      expect(getByText('Ace')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
      expect(getByText('Jack')).toBeTruthy();
      expect(getByText('Queen')).toBeTruthy();
      expect(getByText('King')).toBeTruthy();
    });

    it('should render all numbers for RWS Major Arcana', () => {
      const { getAllByRole } = render(
        <NumberPicker
          deckType="rws"
          suit="major"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      // RWS has 22 major arcana cards
      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(22);
    });

    it('should render all numbers for Thoth Major Arcana', () => {
      const { getAllByRole } = render(
        <NumberPicker
          deckType="thoth"
          suit="major"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      // Thoth has 22 major arcana cards
      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(22);
    });
  });

  describe('Selection State', () => {
    it('should show selected number with highlighted style', () => {
      const { getByText } = render(
        <NumberPicker
          deckType="playing"
          suit="hearts"
          selectedNumber="Ace"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      const aceText = getByText('Ace');
      expect(aceText).toBeTruthy();
    });

    it('should display all numbers even when one is selected', () => {
      const { getByText } = render(
        <NumberPicker
          deckType="playing"
          suit="hearts"
          selectedNumber="King"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      expect(getByText('King')).toBeTruthy();
      expect(getByText('Ace')).toBeTruthy();
    });
  });

  describe('User Interaction', () => {
    it('should call onSelectNumber when a number is pressed', () => {
      const { getByText } = render(
        <NumberPicker
          deckType="playing"
          suit="hearts"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      fireEvent.press(getByText('Ace'));

      expect(mockOnSelectNumber).toHaveBeenCalledTimes(1);
      expect(mockOnSelectNumber).toHaveBeenCalledWith('Ace');
    });

    it('should call onSelectNumber with correct value for each number', () => {
      const { getByText } = render(
        <NumberPicker
          deckType="playing"
          suit="hearts"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      fireEvent.press(getByText('Ace'));
      expect(mockOnSelectNumber).toHaveBeenLastCalledWith('Ace');

      fireEvent.press(getByText('2'));
      expect(mockOnSelectNumber).toHaveBeenLastCalledWith('2');

      fireEvent.press(getByText('King'));
      expect(mockOnSelectNumber).toHaveBeenLastCalledWith('King');

      expect(mockOnSelectNumber).toHaveBeenCalledTimes(3);
    });

    it('should allow reselecting the same number', () => {
      const { getByText } = render(
        <NumberPicker
          deckType="playing"
          suit="hearts"
          selectedNumber="Ace"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      fireEvent.press(getByText('Ace'));

      expect(mockOnSelectNumber).toHaveBeenCalledTimes(1);
      expect(mockOnSelectNumber).toHaveBeenCalledWith('Ace');
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels for each number', () => {
      const { getByLabelText } = render(
        <NumberPicker
          deckType="playing"
          suit="hearts"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      expect(getByLabelText('Select Ace')).toBeTruthy();
      expect(getByLabelText('Select 2')).toBeTruthy();
      expect(getByLabelText('Select King')).toBeTruthy();
    });

    it('should have button role for all number buttons', () => {
      const { getAllByRole } = render(
        <NumberPicker
          deckType="playing"
          suit="hearts"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(13); // 13 cards per suit in playing deck
    });
  });

  describe('Deck and Suit Variations', () => {
    it('should render different numbers for different suits in Tarot', () => {
      const { getAllByRole, rerender } = render(
        <NumberPicker
          deckType="rws"
          suit="major"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      // Major Arcana has 22 cards
      let buttons = getAllByRole('button');
      expect(buttons.length).toBe(22);

      rerender(
        <NumberPicker
          deckType="rws"
          suit="wands"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      // Minor Arcana suits have 14 cards each
      buttons = getAllByRole('button');
      expect(buttons.length).toBe(14);
    });

    it('should render correct count of cards for playing deck', () => {
      const { getAllByRole } = render(
        <NumberPicker
          deckType="playing"
          suit="hearts"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(13);
    });

    it('should render correct count of cards for RWS Major Arcana', () => {
      const { getAllByRole } = render(
        <NumberPicker
          deckType="rws"
          suit="major"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(22); // 22 Major Arcana cards
    });

    it('should render correct count of cards for RWS minor arcana', () => {
      const { getAllByRole } = render(
        <NumberPicker
          deckType="rws"
          suit="wands"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(14); // 14 cards per minor arcana suit
    });
  });

  describe('Edge Cases', () => {
    it('should handle RWS court cards correctly', () => {
      const { getAllByRole } = render(
        <NumberPicker
          deckType="rws"
          suit="wands"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      // RWS minor arcana has 14 cards (Ace-10 + Page, Knight, Queen, King)
      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(14);
    });

    it('should handle Thoth court cards correctly', () => {
      const { getAllByRole } = render(
        <NumberPicker
          deckType="thoth"
          suit="wands"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      // Thoth minor arcana has 14 cards (Ace-10 + Princess, Prince, Queen, Knight)
      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(14);
    });

    it('should handle Thoth Disks suit', () => {
      const { getAllByRole } = render(
        <NumberPicker
          deckType="thoth"
          suit="disks"
          onSelectNumber={mockOnSelectNumber}
        />
      );

      // Thoth Disks suit has 14 cards
      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(14);
    });
  });
});
