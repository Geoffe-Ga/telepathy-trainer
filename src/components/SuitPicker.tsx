import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DeckType, Suit } from '../types';
import { getSuitsForDeck } from '../constants/decks';
import { theme } from '../constants/theme';

interface SuitPickerProps {
  deckType: DeckType;
  selectedSuit?: string;
  onSelectSuit: (suit: string) => void;
}

export function SuitPicker({
  deckType,
  selectedSuit,
  onSelectSuit,
}: SuitPickerProps) {
  const suits = getSuitsForDeck(deckType);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Suit:</Text>
      <View style={styles.grid}>
        {suits.map((suit: Suit) => (
          <TouchableOpacity
            key={suit.id}
            style={[
              styles.suitButton,
              selectedSuit === suit.id && styles.suitButtonSelected,
            ]}
            onPress={() => onSelectSuit(suit.id)}
            accessibilityLabel={`Select ${suit.name}`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.suitText,
                selectedSuit === suit.id && styles.suitTextSelected,
              ]}
            >
              {suit.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  suitButton: {
    backgroundColor: theme.colors.surfaceLight,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    minWidth: 120,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.sm,
  },
  suitButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.secondary,
    ...theme.shadows.md,
  },
  suitText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  suitTextSelected: {
    color: theme.colors.text,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
});
