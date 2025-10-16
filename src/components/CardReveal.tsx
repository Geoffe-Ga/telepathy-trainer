import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Card } from '../types';
import { theme } from '../constants/theme';

interface CardRevealProps {
  actualCard: Card;
  guessedSuit: string;
  guessedNumber?: string;
  suitMatch: boolean;
  numberMatch: boolean;
  exactMatch: boolean;
  onDrawAnother: () => void;
}

export function CardReveal({
  actualCard,
  guessedSuit,
  guessedNumber,
  suitMatch,
  numberMatch,
  exactMatch,
  onDrawAnother,
}: CardRevealProps) {
  useEffect(() => {
    // Trigger haptic feedback based on result
    if (exactMatch) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (suitMatch || numberMatch) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [exactMatch, suitMatch, numberMatch]);

  const getBorderColor = () => {
    if (exactMatch) return theme.colors.success;
    if (suitMatch || numberMatch) return theme.colors.warning;
    return theme.colors.error;
  };

  const getResultText = () => {
    if (exactMatch) return ' Exact Match!';
    if (suitMatch && numberMatch) return ' Exact Match!';
    if (suitMatch) return '~ Suit Match';
    if (numberMatch) return '~ Number Match';
    return ' No Match';
  };

  const getResultColor = () => {
    if (exactMatch) return theme.colors.success;
    if (suitMatch || numberMatch) return theme.colors.warning;
    return theme.colors.error;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderColor: getBorderColor() }]}>
        <Text style={styles.cardName}>{actualCard.name}</Text>
        <View style={styles.divider} />
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonRow}>
            <Text style={styles.label}>Your Guess:</Text>
            <Text style={styles.value}>
              {guessedNumber
                ? `${guessedNumber} of ${guessedSuit}`
                : guessedSuit}
            </Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.label}>Actual Card:</Text>
            <Text style={styles.value}>{actualCard.name}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={[styles.result, { color: getResultColor() }]}>
          {getResultText()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={onDrawAnother}
        accessibilityLabel="Draw another card"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Draw Another Card</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.md,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    maxWidth: 400,
    padding: theme.spacing.xl,
    width: '100%',
    ...theme.shadows.md,
  },
  cardName: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  comparisonContainer: {
    gap: theme.spacing.sm,
  },
  comparisonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  divider: {
    backgroundColor: theme.colors.border,
    height: 1,
    marginVertical: theme.spacing.md,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  result: {
    ...theme.typography.h3,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
