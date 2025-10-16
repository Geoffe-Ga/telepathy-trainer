import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { DeckSelector } from '../components/DeckSelector';
import { SuitPicker } from '../components/SuitPicker';
import { NumberPicker } from '../components/NumberPicker';
import { CardReveal } from '../components/CardReveal';
import { ConcentrationPrompt } from '../components/ConcentrationPrompt';
import { useStore } from '../store/useStore';
import { getSecureRandomCard } from '../utils/randomizer';
import { getCardsForDeck, deckRequiresNumber } from '../utils/cardData';
import { saveGuess } from '../database/queries';
import { Card, Guess } from '../types';
import { theme } from '../constants/theme';

type GuessStep = 'concentration' | 'suit' | 'number' | 'reveal';

export function GuessScreen() {
  const {
    selectedDeck,
    setSelectedDeck,
    showConcentrationPrompt,
    setShowConcentrationPrompt,
    incrementStreak,
    resetStreak,
  } = useStore();

  const [step, setStep] = useState<GuessStep>(
    showConcentrationPrompt ? 'concentration' : 'suit'
  );
  const [selectedSuit, setSelectedSuit] = useState<string | undefined>();
  const [selectedNumber, setSelectedNumber] = useState<string | undefined>();
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const [matchResult, setMatchResult] = useState<{
    suitMatch: boolean;
    numberMatch: boolean;
    exactMatch: boolean;
  } | null>(null);

  const handleDeckChange = (deck: typeof selectedDeck) => {
    setSelectedDeck(deck);
    resetGuess();
  };

  const handleConcentrationReady = () => {
    setStep('suit');
  };

  const handleConcentrationDismiss = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      setShowConcentrationPrompt(false);
    }
  };

  const drawCard = useCallback(
    async (guessedSuit: string, guessedNumber?: string) => {
      try {
        // Get all cards for the deck
        const allCards = getCardsForDeck(selectedDeck);

        // Draw a random card using cryptographically secure randomization
        const card = await getSecureRandomCard(allCards);
        setDrawnCard(card);

        // Calculate matches
        const suitMatch = card.suit === guessedSuit;
        const numberMatch = guessedNumber
          ? card.number === guessedNumber
          : true; // For Zener, always true
        const exactMatch = suitMatch && numberMatch;

        setMatchResult({ suitMatch, numberMatch, exactMatch });

        // Update streak
        if (exactMatch) {
          incrementStreak();
        } else {
          resetStreak();
        }

        // Save guess to database
        const guess: Guess = {
          id: uuidv4(),
          timestamp: Date.now(),
          deckType: selectedDeck,
          guessedSuit,
          guessedNumber,
          actualSuit: card.suit,
          actualNumber: card.number,
          suitMatch,
          numberMatch,
          exactMatch,
        };

        await saveGuess(guess);

        // Show reveal
        setStep('reveal');
      } catch (error) {
        console.error('Error drawing card:', error);
      }
    },
    [selectedDeck, incrementStreak, resetStreak]
  );

  const handleSuitSelect = useCallback(
    async (suit: string) => {
      setSelectedSuit(suit);

      // For Zener cards, we're done - draw immediately
      if (!deckRequiresNumber(selectedDeck)) {
        await drawCard(suit, undefined);
      } else {
        setStep('number');
      }
    },
    [selectedDeck, drawCard]
  );

  const handleNumberSelect = useCallback(
    async (number: string) => {
      setSelectedNumber(number);
      if (selectedSuit) {
        await drawCard(selectedSuit, number);
      }
    },
    [selectedSuit, drawCard]
  );

  const resetGuess = () => {
    setSelectedSuit(undefined);
    setSelectedNumber(undefined);
    setDrawnCard(null);
    setMatchResult(null);
    setStep('suit');
  };

  return (
    <SafeAreaView style={styles.container}>
      <DeckSelector
        selectedDeck={selectedDeck}
        onSelectDeck={handleDeckChange}
      />

      {step === 'concentration' && (
        <ConcentrationPrompt
          onReady={handleConcentrationReady}
          onDismiss={handleConcentrationDismiss}
        />
      )}

      {step === 'suit' && (
        <View style={styles.content}>
          <SuitPicker
            deckType={selectedDeck}
            selectedSuit={selectedSuit}
            onSelectSuit={handleSuitSelect}
          />
        </View>
      )}

      {step === 'number' && selectedSuit && (
        <View style={styles.content}>
          <NumberPicker
            deckType={selectedDeck}
            suit={selectedSuit}
            selectedNumber={selectedNumber}
            onSelectNumber={handleNumberSelect}
          />
        </View>
      )}

      {step === 'reveal' && drawnCard && matchResult && selectedSuit && (
        <View style={styles.content}>
          <CardReveal
            actualCard={drawnCard}
            guessedSuit={selectedSuit}
            guessedNumber={selectedNumber}
            suitMatch={matchResult.suitMatch}
            numberMatch={matchResult.numberMatch}
            exactMatch={matchResult.exactMatch}
            onDrawAnother={resetGuess}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
