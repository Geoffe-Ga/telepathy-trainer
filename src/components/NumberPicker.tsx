import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { DeckType } from '../types';
import { getNumbersForSuit } from '../constants/decks';
import { theme } from '../constants/theme';

interface NumberPickerProps {
  deckType: DeckType;
  suit: string;
  selectedNumber?: string;
  onSelectNumber: (number: string) => void;
}

export function NumberPicker({
  deckType,
  suit,
  selectedNumber,
  onSelectNumber,
}: NumberPickerProps) {
  const numbers = getNumbersForSuit(deckType, suit);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Card:</Text>
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={true}
      >
        {numbers.map((number: string) => (
          <TouchableOpacity
            key={number}
            style={[
              styles.numberButton,
              selectedNumber === number && styles.numberButtonSelected,
            ]}
            onPress={() => onSelectNumber(number)}
            accessibilityLabel={`Select ${number}`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.numberText,
                selectedNumber === number && styles.numberTextSelected,
              ]}
            >
              {number}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    paddingBottom: theme.spacing.xl,
  },
  numberButton: {
    backgroundColor: theme.colors.surfaceLight,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    minWidth: 80,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.sm,
  },
  numberButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.secondary,
    ...theme.shadows.md,
  },
  numberText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  numberTextSelected: {
    color: theme.colors.text,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
});
