import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SuitPicker } from './SuitPicker';
import { DeckType } from '../types';

describe('SuitPicker', () => {
  const mockOnSelectSuit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render title', () => {
      const { getByText } = render(
        <SuitPicker deckType="playing" onSelectSuit={mockOnSelectSuit} />
      );

      expect(getByText('Select a Suit:')).toBeTruthy();
    });

    it('should render all suits for playing deck', () => {
      const { getByText } = render(
        <SuitPicker deckType="playing" onSelectSuit={mockOnSelectSuit} />
      );

      expect(getByText('Hearts')).toBeTruthy();
      expect(getByText('Diamonds')).toBeTruthy();
      expect(getByText('Clubs')).toBeTruthy();
      expect(getByText('Spades')).toBeTruthy();
    });

    it('should render all suits for Zener deck', () => {
      const { getByText } = render(
        <SuitPicker deckType="zener" onSelectSuit={mockOnSelectSuit} />
      );

      expect(getByText('Circle')).toBeTruthy();
      expect(getByText('Cross')).toBeTruthy();
      expect(getByText('Waves')).toBeTruthy();
      expect(getByText('Square')).toBeTruthy();
      expect(getByText('Star')).toBeTruthy();
    });

    it('should render all suits for RWS Tarot deck', () => {
      const { getByText } = render(
        <SuitPicker deckType="rws" onSelectSuit={mockOnSelectSuit} />
      );

      expect(getByText('Major Arcana')).toBeTruthy();
      expect(getByText('Wands')).toBeTruthy();
      expect(getByText('Cups')).toBeTruthy();
      expect(getByText('Swords')).toBeTruthy();
      expect(getByText('Pentacles')).toBeTruthy();
    });

    it('should render all suits for Thoth Tarot deck', () => {
      const { getByText } = render(
        <SuitPicker deckType="thoth" onSelectSuit={mockOnSelectSuit} />
      );

      expect(getByText('Major Arcana')).toBeTruthy();
      expect(getByText('Wands')).toBeTruthy();
      expect(getByText('Cups')).toBeTruthy();
      expect(getByText('Swords')).toBeTruthy();
      expect(getByText('Disks')).toBeTruthy();
    });
  });

  describe('Selection State', () => {
    it('should show selected suit with highlighted style', () => {
      const { getByText } = render(
        <SuitPicker
          deckType="playing"
          selectedSuit="Hearts"
          onSelectSuit={mockOnSelectSuit}
        />
      );

      const heartsText = getByText('Hearts');
      expect(heartsText).toBeTruthy();
    });

    it('should display all suits even when one is selected', () => {
      const { getByText } = render(
        <SuitPicker
          deckType="playing"
          selectedSuit="Diamonds"
          onSelectSuit={mockOnSelectSuit}
        />
      );

      expect(getByText('Diamonds')).toBeTruthy();
      expect(getByText('Hearts')).toBeTruthy();
      expect(getByText('Clubs')).toBeTruthy();
      expect(getByText('Spades')).toBeTruthy();
    });
  });

  describe('User Interaction', () => {
    it('should call onSelectSuit when a suit is pressed', () => {
      const { getByText } = render(
        <SuitPicker deckType="playing" onSelectSuit={mockOnSelectSuit} />
      );

      fireEvent.press(getByText('Hearts'));

      expect(mockOnSelectSuit).toHaveBeenCalledTimes(1);
      expect(mockOnSelectSuit).toHaveBeenCalledWith('hearts');
    });

    it('should call onSelectSuit with correct suit ID for each suit', () => {
      const { getByText } = render(
        <SuitPicker deckType="playing" onSelectSuit={mockOnSelectSuit} />
      );

      fireEvent.press(getByText('Hearts'));
      expect(mockOnSelectSuit).toHaveBeenLastCalledWith('hearts');

      fireEvent.press(getByText('Diamonds'));
      expect(mockOnSelectSuit).toHaveBeenLastCalledWith('diamonds');

      fireEvent.press(getByText('Clubs'));
      expect(mockOnSelectSuit).toHaveBeenLastCalledWith('clubs');

      fireEvent.press(getByText('Spades'));
      expect(mockOnSelectSuit).toHaveBeenLastCalledWith('spades');

      expect(mockOnSelectSuit).toHaveBeenCalledTimes(4);
    });

    it('should allow reselecting the same suit', () => {
      const { getByText } = render(
        <SuitPicker
          deckType="playing"
          selectedSuit="hearts"
          onSelectSuit={mockOnSelectSuit}
        />
      );

      fireEvent.press(getByText('Hearts'));

      expect(mockOnSelectSuit).toHaveBeenCalledTimes(1);
      expect(mockOnSelectSuit).toHaveBeenCalledWith('hearts');
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels for each suit', () => {
      const { getByLabelText } = render(
        <SuitPicker deckType="playing" onSelectSuit={mockOnSelectSuit} />
      );

      expect(getByLabelText('Select Hearts')).toBeTruthy();
      expect(getByLabelText('Select Diamonds')).toBeTruthy();
      expect(getByLabelText('Select Clubs')).toBeTruthy();
      expect(getByLabelText('Select Spades')).toBeTruthy();
    });

    it('should have button role for all suit buttons', () => {
      const { getAllByRole } = render(
        <SuitPicker deckType="playing" onSelectSuit={mockOnSelectSuit} />
      );

      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(4); // 4 suits in playing deck
    });

    it('should have proper accessibility labels for Zener cards', () => {
      const { getByLabelText } = render(
        <SuitPicker deckType="zener" onSelectSuit={mockOnSelectSuit} />
      );

      expect(getByLabelText('Select Circle')).toBeTruthy();
      expect(getByLabelText('Select Cross')).toBeTruthy();
      expect(getByLabelText('Select Waves')).toBeTruthy();
      expect(getByLabelText('Select Square')).toBeTruthy();
      expect(getByLabelText('Select Star')).toBeTruthy();
    });
  });

  describe('Deck Type Variations', () => {
    it('should update suits when deck type changes', () => {
      const { getAllByText, rerender, queryByText } = render(
        <SuitPicker deckType="playing" onSelectSuit={mockOnSelectSuit} />
      );

      expect(getAllByText('Hearts').length).toBeGreaterThan(0);
      expect(queryByText('Circle')).toBeNull();

      rerender(<SuitPicker deckType="zener" onSelectSuit={mockOnSelectSuit} />);

      expect(queryByText('Hearts')).toBeNull();
      expect(getAllByText('Circle').length).toBeGreaterThan(0);
    });

    it('should render correct number of suits for each deck type', () => {
      const deckTypes: Array<{ type: DeckType; count: number }> = [
        { type: 'playing', count: 4 },
        { type: 'zener', count: 5 },
        { type: 'rws', count: 5 },
        { type: 'thoth', count: 5 },
      ];

      deckTypes.forEach(({ type, count }) => {
        const { getAllByRole } = render(
          <SuitPicker deckType={type} onSelectSuit={mockOnSelectSuit} />
        );

        const buttons = getAllByRole('button');
        expect(buttons.length).toBe(count);
      });
    });
  });
});
