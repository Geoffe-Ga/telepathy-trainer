import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DeckSelector } from './DeckSelector';
import { DeckType } from '../types';

describe('DeckSelector', () => {
  const mockOnSelectDeck = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all deck options', () => {
      const { getByText } = render(
        <DeckSelector selectedDeck="playing" onSelectDeck={mockOnSelectDeck} />
      );

      expect(getByText('Zener')).toBeTruthy();
      expect(getByText('RWS')).toBeTruthy();
      expect(getByText('Thoth')).toBeTruthy();
      expect(getByText('Playing')).toBeTruthy();
    });

    it('should render exactly 4 deck buttons', () => {
      const { getAllByRole } = render(
        <DeckSelector selectedDeck="playing" onSelectDeck={mockOnSelectDeck} />
      );

      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(4);
    });
  });

  describe('Selection State', () => {
    it('should highlight the selected deck', () => {
      const { getByText } = render(
        <DeckSelector selectedDeck="zener" onSelectDeck={mockOnSelectDeck} />
      );

      const zenerText = getByText('Zener');
      expect(zenerText).toBeTruthy();
    });

    it('should display all decks even when one is selected', () => {
      const { getByText } = render(
        <DeckSelector selectedDeck="rws" onSelectDeck={mockOnSelectDeck} />
      );

      expect(getByText('RWS')).toBeTruthy();
      expect(getByText('Zener')).toBeTruthy();
      expect(getByText('Thoth')).toBeTruthy();
      expect(getByText('Playing')).toBeTruthy();
    });

    it('should update selection when selectedDeck prop changes', () => {
      const { getByText, rerender } = render(
        <DeckSelector selectedDeck="playing" onSelectDeck={mockOnSelectDeck} />
      );

      expect(getByText('Playing')).toBeTruthy();

      rerender(
        <DeckSelector selectedDeck="zener" onSelectDeck={mockOnSelectDeck} />
      );

      expect(getByText('Zener')).toBeTruthy();
    });
  });

  describe('User Interaction', () => {
    it('should call onSelectDeck when a deck is pressed', () => {
      const { getByText } = render(
        <DeckSelector selectedDeck="playing" onSelectDeck={mockOnSelectDeck} />
      );

      fireEvent.press(getByText('Zener'));

      expect(mockOnSelectDeck).toHaveBeenCalledTimes(1);
      expect(mockOnSelectDeck).toHaveBeenCalledWith('zener');
    });

    it('should call onSelectDeck with correct deck type for each deck', () => {
      const { getByText } = render(
        <DeckSelector selectedDeck="playing" onSelectDeck={mockOnSelectDeck} />
      );

      fireEvent.press(getByText('Zener'));
      expect(mockOnSelectDeck).toHaveBeenLastCalledWith('zener');

      fireEvent.press(getByText('RWS'));
      expect(mockOnSelectDeck).toHaveBeenLastCalledWith('rws');

      fireEvent.press(getByText('Thoth'));
      expect(mockOnSelectDeck).toHaveBeenLastCalledWith('thoth');

      fireEvent.press(getByText('Playing'));
      expect(mockOnSelectDeck).toHaveBeenLastCalledWith('playing');

      expect(mockOnSelectDeck).toHaveBeenCalledTimes(4);
    });

    it('should allow reselecting the same deck', () => {
      const { getByText } = render(
        <DeckSelector selectedDeck="playing" onSelectDeck={mockOnSelectDeck} />
      );

      fireEvent.press(getByText('Playing'));

      expect(mockOnSelectDeck).toHaveBeenCalledTimes(1);
      expect(mockOnSelectDeck).toHaveBeenCalledWith('playing');
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels for each deck', () => {
      const { getByLabelText } = render(
        <DeckSelector selectedDeck="playing" onSelectDeck={mockOnSelectDeck} />
      );

      expect(getByLabelText('Select Zener deck')).toBeTruthy();
      expect(getByLabelText('Select RWS deck')).toBeTruthy();
      expect(getByLabelText('Select Thoth deck')).toBeTruthy();
      expect(getByLabelText('Select Playing deck')).toBeTruthy();
    });

    it('should have button role for all deck buttons', () => {
      const { getAllByRole } = render(
        <DeckSelector selectedDeck="playing" onSelectDeck={mockOnSelectDeck} />
      );

      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(4);
    });
  });

  describe('All Deck Types', () => {
    const deckTypes: DeckType[] = ['zener', 'rws', 'thoth', 'playing'];

    deckTypes.forEach((deckType) => {
      it(`should properly handle ${deckType} deck selection`, () => {
        const { getByText } = render(
          <DeckSelector
            selectedDeck={deckType}
            onSelectDeck={mockOnSelectDeck}
          />
        );

        const labels: Record<DeckType, string> = {
          zener: 'Zener',
          rws: 'RWS',
          thoth: 'Thoth',
          playing: 'Playing',
        };

        expect(getByText(labels[deckType])).toBeTruthy();
      });
    });
  });
});
