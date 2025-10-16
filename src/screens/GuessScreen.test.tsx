import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GuessScreen } from './GuessScreen';
import { useStore } from '../store/useStore';
import * as randomizer from '../utils/randomizer';
import * as queries from '../database/queries';
import { Card, DeckType } from '../types';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../store/useStore');
jest.mock('../utils/randomizer');
jest.mock('../database/queries');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

// Mock child components
jest.mock('../components/DeckSelector', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    DeckSelector: ({
      selectedDeck,
      onSelectDeck,
    }: {
      selectedDeck: DeckType;
      onSelectDeck: (deck: DeckType) => void;
    }) => {
      return (
        <View testID="deck-selector">
          <Text>Selected: {selectedDeck}</Text>
          <TouchableOpacity onPress={() => onSelectDeck('zener')}>
            <Text>Change Deck</Text>
          </TouchableOpacity>
        </View>
      );
    },
  };
});

jest.mock('../components/SuitPicker', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    SuitPicker: ({
      deckType,
      onSelectSuit,
    }: {
      deckType: DeckType;
      selectedSuit: string | null;
      onSelectSuit: (suit: string) => void;
    }) => {
      return (
        <View testID="suit-picker">
          <Text>Deck: {deckType}</Text>
          <TouchableOpacity onPress={() => onSelectSuit('Hearts')}>
            <Text>Select Hearts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSelectSuit('Circle')}>
            <Text>Select Circle</Text>
          </TouchableOpacity>
        </View>
      );
    },
  };
});

jest.mock('../components/NumberPicker', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    NumberPicker: ({
      suit,
      onSelectNumber,
    }: {
      deckType: DeckType;
      suit: string;
      selectedNumber: string | null;
      onSelectNumber: (num: string) => void;
    }) => {
      return (
        <View testID="number-picker">
          <Text>Suit: {suit}</Text>
          <TouchableOpacity onPress={() => onSelectNumber('Ace')}>
            <Text>Select Ace</Text>
          </TouchableOpacity>
        </View>
      );
    },
  };
});

jest.mock('../components/CardReveal', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    CardReveal: ({
      actualCard,
      guessedSuit,
      guessedNumber,
      suitMatch,
      exactMatch,
      onDrawAnother,
    }: {
      actualCard: Card;
      guessedSuit: string;
      guessedNumber: string | undefined;
      suitMatch: boolean;
      numberMatch: boolean;
      exactMatch: boolean;
      onDrawAnother: () => void;
    }) => {
      return (
        <View testID="card-reveal">
          <Text>Actual: {actualCard.name}</Text>
          <Text>
            Guessed: {guessedSuit} {guessedNumber}
          </Text>
          <Text>
            Match: {exactMatch ? 'Exact' : suitMatch ? 'Suit' : 'None'}
          </Text>
          <TouchableOpacity onPress={onDrawAnother}>
            <Text>Draw Another</Text>
          </TouchableOpacity>
        </View>
      );
    },
  };
});

jest.mock('../components/ConcentrationPrompt', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    ConcentrationPrompt: ({
      onReady,
      onDismiss,
    }: {
      onReady: () => void;
      onDismiss: (dontShowAgain: boolean) => void;
    }) => {
      return (
        <View testID="concentration-prompt">
          <Text>Concentration Prompt</Text>
          <TouchableOpacity onPress={onReady}>
            <Text>Ready</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDismiss(true)}>
            <Text>Don&apos;t Show Again</Text>
          </TouchableOpacity>
        </View>
      );
    },
  };
});

describe('GuessScreen', () => {
  const mockSetSelectedDeck = jest.fn();
  const mockSetShowConcentrationPrompt = jest.fn();
  const mockIncrementStreak = jest.fn();
  const mockResetStreak = jest.fn();
  const mockSaveGuess = queries.saveGuess as jest.Mock;
  const mockGetSecureRandomCard = randomizer.getSecureRandomCard as jest.Mock;

  const mockCard: Card = {
    id: '1',
    name: 'Ace of Hearts',
    suit: 'Hearts',
    number: 'Ace',
    deckType: 'playing',
  };

  const defaultStoreState = {
    selectedDeck: 'playing' as const,
    setSelectedDeck: mockSetSelectedDeck,
    showConcentrationPrompt: false,
    setShowConcentrationPrompt: mockSetShowConcentrationPrompt,
    incrementStreak: mockIncrementStreak,
    resetStreak: mockResetStreak,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStore as unknown as jest.Mock).mockReturnValue(defaultStoreState);
    mockGetSecureRandomCard.mockResolvedValue(mockCard);
    mockSaveGuess.mockResolvedValue(undefined);
  });

  describe('Initial Rendering', () => {
    it('should render the screen with deck selector', () => {
      const { getByTestId } = render(<GuessScreen />);
      expect(getByTestId('deck-selector')).toBeTruthy();
    });

    it('should show suit picker by default when concentration prompt is disabled', () => {
      const { getByTestId, queryByTestId } = render(<GuessScreen />);
      expect(getByTestId('suit-picker')).toBeTruthy();
      expect(queryByTestId('concentration-prompt')).toBeNull();
    });

    it('should show concentration prompt when enabled', () => {
      (useStore as unknown as jest.Mock).mockReturnValue({
        ...defaultStoreState,
        showConcentrationPrompt: true,
      });

      const { getByTestId, queryByTestId } = render(<GuessScreen />);
      expect(getByTestId('concentration-prompt')).toBeTruthy();
      expect(queryByTestId('suit-picker')).toBeNull();
    });

    it('should display the selected deck in deck selector', () => {
      const { getByText } = render(<GuessScreen />);
      expect(getByText('Selected: playing')).toBeTruthy();
    });
  });

  describe('Concentration Prompt Flow', () => {
    beforeEach(() => {
      (useStore as unknown as jest.Mock).mockReturnValue({
        ...defaultStoreState,
        showConcentrationPrompt: true,
      });
    });

    it('should transition from concentration prompt to suit picker when ready', () => {
      const { getByText, getByTestId, queryByTestId } = render(<GuessScreen />);

      expect(getByTestId('concentration-prompt')).toBeTruthy();

      fireEvent.press(getByText('Ready'));

      expect(queryByTestId('concentration-prompt')).toBeNull();
      expect(getByTestId('suit-picker')).toBeTruthy();
    });

    it('should disable concentration prompt when "Don\'t Show Again" is pressed', () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText("Don't Show Again"));

      expect(mockSetShowConcentrationPrompt).toHaveBeenCalledWith(false);
    });

    it('should not disable concentration prompt if dismissed without checking option', () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Ready'));

      expect(mockSetShowConcentrationPrompt).not.toHaveBeenCalled();
    });
  });

  describe('Deck Selection', () => {
    it('should update deck when a new deck is selected', () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Change Deck'));

      expect(mockSetSelectedDeck).toHaveBeenCalledWith('zener');
    });

    it('should reset guess state when deck is changed', async () => {
      const { getByText, queryByTestId, getByTestId } = render(<GuessScreen />);

      // Select a suit first
      fireEvent.press(getByText('Select Hearts'));

      // Wait for number picker to appear
      await waitFor(() => {
        expect(getByTestId('number-picker')).toBeTruthy();
      });

      // Change deck
      fireEvent.press(getByText('Change Deck'));

      // Should reset back to suit picker
      expect(queryByTestId('number-picker')).toBeNull();
      expect(getByTestId('suit-picker')).toBeTruthy();
    });
  });

  describe('Suit Selection - Playing Cards', () => {
    it('should display suit picker initially', () => {
      const { getByTestId } = render(<GuessScreen />);
      expect(getByTestId('suit-picker')).toBeTruthy();
    });

    it('should transition to number picker after suit selection for playing cards', async () => {
      const { getByText, getByTestId } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        expect(getByTestId('number-picker')).toBeTruthy();
      });
    });

    it('should pass selected deck type to suit picker', () => {
      const { getByText } = render(<GuessScreen />);
      expect(getByText('Deck: playing')).toBeTruthy();
    });
  });

  describe('Suit Selection - Zener Cards', () => {
    const zenerCard: Card = {
      id: 'z1',
      name: 'Circle',
      suit: 'Circle',
      deckType: 'zener',
    };

    beforeEach(() => {
      (useStore as unknown as jest.Mock).mockReturnValue({
        ...defaultStoreState,
        selectedDeck: 'zener',
      });
      mockGetSecureRandomCard.mockResolvedValue(zenerCard);
    });

    it('should draw card immediately for Zener deck (no number selection)', async () => {
      const { getByText, getByTestId, queryByTestId } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Circle'));

      await waitFor(() => {
        expect(getByTestId('card-reveal')).toBeTruthy();
      });

      // Should skip number picker for Zener
      expect(queryByTestId('number-picker')).toBeNull();
    });

    it('should call getSecureRandomCard when Zener suit is selected', async () => {
      const { getByText, getByTestId } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Circle'));

      await waitFor(() => {
        expect(mockGetSecureRandomCard).toHaveBeenCalled();
        expect(getByTestId('card-reveal')).toBeTruthy();
      });
    });
  });

  describe('Number Selection - Playing Cards', () => {
    it('should show number picker after suit selection', async () => {
      const { getByText, getByTestId } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        expect(getByTestId('number-picker')).toBeTruthy();
        expect(getByText('Suit: Hearts')).toBeTruthy();
      });
    });

    it('should draw card after number selection', async () => {
      const { getByText, getByTestId } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        expect(getByTestId('number-picker')).toBeTruthy();
      });

      fireEvent.press(getByText('Select Ace'));

      await waitFor(() => {
        expect(getByTestId('card-reveal')).toBeTruthy();
        expect(mockGetSecureRandomCard).toHaveBeenCalled();
      });
    });
  });

  describe('Card Drawing and Matching - Exact Match', () => {
    it('should calculate exact match correctly', async () => {
      const { getByText, getByTestId } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        expect(getByTestId('number-picker')).toBeTruthy();
      });

      fireEvent.press(getByText('Select Ace'));

      await waitFor(() => {
        expect(getByText('Match: Exact')).toBeTruthy();
      });
    });

    it('should increment streak on exact match', async () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(mockIncrementStreak).toHaveBeenCalledTimes(1);
      });
    });

    it('should not reset streak on exact match', async () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(mockResetStreak).not.toHaveBeenCalled();
      });
    });
  });

  describe('Card Drawing and Matching - Partial Match', () => {
    beforeEach(() => {
      const partialMatchCard: Card = {
        id: '2',
        name: 'Two of Hearts',
        suit: 'Hearts',
        number: 'Two',
        deckType: 'playing',
      };
      mockGetSecureRandomCard.mockResolvedValue(partialMatchCard);
    });

    it('should calculate suit match correctly', async () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(getByText('Match: Suit')).toBeTruthy();
      });
    });

    it('should reset streak on partial match', async () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(mockResetStreak).toHaveBeenCalledTimes(1);
      });
    });

    it('should not increment streak on partial match', async () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(mockIncrementStreak).not.toHaveBeenCalled();
      });
    });
  });

  describe('Card Drawing and Matching - No Match', () => {
    beforeEach(() => {
      const noMatchCard: Card = {
        id: '3',
        name: 'King of Diamonds',
        suit: 'Diamonds',
        number: 'King',
        deckType: 'playing',
      };
      mockGetSecureRandomCard.mockResolvedValue(noMatchCard);
    });

    it('should calculate no match correctly', async () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(getByText('Match: None')).toBeTruthy();
      });
    });

    it('should reset streak on no match', async () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(mockResetStreak).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Database Integration', () => {
    it('should save guess to database with correct data', async () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(mockSaveGuess).toHaveBeenCalledTimes(1);
        expect(mockSaveGuess).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'test-uuid-123',
            deckType: 'playing',
            guessedSuit: 'Hearts',
            guessedNumber: 'Ace',
            actualSuit: 'Hearts',
            actualNumber: 'Ace',
            suitMatch: true,
            numberMatch: true,
            exactMatch: true,
          })
        );
      });
    });

    it('should save timestamp with guess', async () => {
      const { getByText } = render(<GuessScreen />);

      const beforeTime = Date.now();

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      const afterTime = Date.now();

      await waitFor(() => {
        expect(mockSaveGuess).toHaveBeenCalledWith(
          expect.objectContaining({
            timestamp: expect.any(Number),
          })
        );

        const savedGuess = mockSaveGuess.mock.calls[0][0];
        expect(savedGuess.timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(savedGuess.timestamp).toBeLessThanOrEqual(afterTime);
      });
    });

    it('should save Zener guess without number', async () => {
      const zenerCard: Card = {
        id: 'z1',
        name: 'Circle',
        suit: 'Circle',
        deckType: 'zener',
      };

      (useStore as unknown as jest.Mock).mockReturnValue({
        ...defaultStoreState,
        selectedDeck: 'zener',
      });
      mockGetSecureRandomCard.mockResolvedValue(zenerCard);

      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Circle'));

      await waitFor(() => {
        expect(mockSaveGuess).toHaveBeenCalledWith(
          expect.objectContaining({
            deckType: 'zener',
            guessedSuit: 'Circle',
            guessedNumber: undefined,
            actualNumber: undefined,
          })
        );
      });
    });
  });

  describe('Reveal State and Reset', () => {
    it('should display card reveal after drawing', async () => {
      const { getByText, getByTestId } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(getByTestId('card-reveal')).toBeTruthy();
      });
    });

    it('should pass all props to CardReveal component', async () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(getByText('Actual: Ace of Hearts')).toBeTruthy();
        expect(getByText('Guessed: Hearts Ace')).toBeTruthy();
      });
    });

    it('should reset to suit picker when Draw Another is pressed', async () => {
      const { getByText, getByTestId, queryByTestId } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(getByTestId('card-reveal')).toBeTruthy();
      });

      fireEvent.press(getByText('Draw Another'));

      await waitFor(() => {
        expect(queryByTestId('card-reveal')).toBeNull();
        expect(getByTestId('suit-picker')).toBeTruthy();
      });
    });

    it('should clear selected suit and number on reset', async () => {
      const { getByText, queryByTestId, getByTestId } = render(<GuessScreen />);

      // Make a guess
      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(getByTestId('card-reveal')).toBeTruthy();
      });

      // Reset
      fireEvent.press(getByText('Draw Another'));

      await waitFor(() => {
        expect(getByTestId('suit-picker')).toBeTruthy();
      });

      // Verify state is reset
      expect(queryByTestId('card-reveal')).toBeNull();
      expect(queryByTestId('number-picker')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle card drawing errors gracefully', async () => {
      mockGetSecureRandomCard.mockRejectedValue(
        new Error('Random generation failed')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error drawing card:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle database save errors gracefully', async () => {
      mockSaveGuess.mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Select Hearts'));

      await waitFor(() => {
        fireEvent.press(getByText('Select Ace'));
      });

      // Should still show reveal even if save fails
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Complete User Journeys', () => {
    it('should complete full playing card guess flow', async () => {
      const { getByText, getByTestId } = render(<GuessScreen />);

      // Start with suit picker
      expect(getByTestId('suit-picker')).toBeTruthy();

      // Select suit
      fireEvent.press(getByText('Select Hearts'));

      // Should show number picker
      await waitFor(() => {
        expect(getByTestId('number-picker')).toBeTruthy();
      });

      // Select number
      fireEvent.press(getByText('Select Ace'));

      // Should show reveal
      await waitFor(() => {
        expect(getByTestId('card-reveal')).toBeTruthy();
      });

      // Verify all data is correct
      expect(mockGetSecureRandomCard).toHaveBeenCalled();
      expect(mockSaveGuess).toHaveBeenCalled();
      expect(mockIncrementStreak).toHaveBeenCalled();
    });

    it('should complete full Zener card guess flow', async () => {
      const zenerCard: Card = {
        id: 'z1',
        name: 'Circle',
        suit: 'Circle',
        deckType: 'zener',
      };

      (useStore as unknown as jest.Mock).mockReturnValue({
        ...defaultStoreState,
        selectedDeck: 'zener',
      });
      mockGetSecureRandomCard.mockResolvedValue(zenerCard);

      const { getByText, getByTestId, queryByTestId } = render(<GuessScreen />);

      // Start with suit picker
      expect(getByTestId('suit-picker')).toBeTruthy();

      // Select suit (should skip number picker)
      fireEvent.press(getByText('Select Circle'));

      // Should go straight to reveal
      await waitFor(() => {
        expect(getByTestId('card-reveal')).toBeTruthy();
      });

      // Should never show number picker
      expect(queryByTestId('number-picker')).toBeNull();
    });

    it('should allow multiple consecutive guesses', async () => {
      const { getByText, getByTestId } = render(<GuessScreen />);

      // First guess
      fireEvent.press(getByText('Select Hearts'));
      await waitFor(() => fireEvent.press(getByText('Select Ace')));
      await waitFor(() => expect(getByTestId('card-reveal')).toBeTruthy());

      // Reset
      fireEvent.press(getByText('Draw Another'));

      // Second guess
      await waitFor(() => expect(getByTestId('suit-picker')).toBeTruthy());
      fireEvent.press(getByText('Select Hearts'));
      await waitFor(() => fireEvent.press(getByText('Select Ace')));
      await waitFor(() => expect(getByTestId('card-reveal')).toBeTruthy());

      expect(mockSaveGuess).toHaveBeenCalledTimes(2);
    });
  });

  describe('State Management Integration', () => {
    it('should use selectedDeck from store', () => {
      (useStore as unknown as jest.Mock).mockReturnValue({
        ...defaultStoreState,
        selectedDeck: 'rws',
      });

      const { getByText } = render(<GuessScreen />);
      expect(getByText('Selected: rws')).toBeTruthy();
      expect(getByText('Deck: rws')).toBeTruthy();
    });

    it('should call setSelectedDeck from store on deck change', () => {
      const { getByText } = render(<GuessScreen />);

      fireEvent.press(getByText('Change Deck'));

      expect(mockSetSelectedDeck).toHaveBeenCalledWith('zener');
    });

    it('should respect showConcentrationPrompt from store', () => {
      (useStore as unknown as jest.Mock).mockReturnValue({
        ...defaultStoreState,
        showConcentrationPrompt: true,
      });

      const { getByTestId } = render(<GuessScreen />);
      expect(getByTestId('concentration-prompt')).toBeTruthy();
    });
  });
});
