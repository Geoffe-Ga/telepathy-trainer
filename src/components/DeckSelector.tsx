import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DeckType } from '../types';
import { theme } from '../constants/theme';

interface DeckSelectorProps {
  selectedDeck: DeckType;
  onSelectDeck: (deck: DeckType) => void;
}

export function DeckSelector({
  selectedDeck,
  onSelectDeck,
}: DeckSelectorProps) {
  const decks: Array<{ type: DeckType; label: string }> = [
    { type: 'zener', label: 'Zener' },
    { type: 'rws', label: 'RWS' },
    { type: 'thoth', label: 'Thoth' },
    { type: 'playing', label: 'Playing' },
  ];

  return (
    <View style={styles.container}>
      {decks.map((deck) => (
        <TouchableOpacity
          key={deck.type}
          style={[
            styles.button,
            selectedDeck === deck.type && styles.buttonSelected,
          ]}
          onPress={() => onSelectDeck(deck.type)}
          accessibilityLabel={`Select ${deck.label} deck`}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.buttonText,
              selectedDeck === deck.type && styles.buttonTextSelected,
            ]}
          >
            {deck.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  buttonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.secondary,
  },
  buttonText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  buttonTextSelected: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  container: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
});
