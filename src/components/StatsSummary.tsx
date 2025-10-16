import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeckStats } from '../types';
import { theme } from '../constants/theme';

interface StatsSummaryProps {
  stats: DeckStats;
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  const statCards = [
    { label: 'Total Guesses', value: stats.totalGuesses.toString() },
    {
      label: 'Exact Matches',
      value: `${stats.exactMatches} (${stats.accuracy.toFixed(1)}%)`,
    },
    { label: 'Current Streak', value: stats.currentStreak.toString() },
    { label: 'Best Streak', value: stats.bestStreak.toString() },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overview</Text>
      <View style={styles.grid}>
        {statCards.map((card, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </View>
        ))}
      </View>
      {stats.totalGuesses > 0 && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Suit Accuracy:</Text>
            <Text style={styles.detailValue}>
              {stats.suitAccuracy.toFixed(1)}%
            </Text>
          </View>
          {stats.numberAccuracy > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Number Accuracy:</Text>
              <Text style={styles.detailValue}>
                {stats.numberAccuracy.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    flex: 1,
    minWidth: '45%',
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  cardValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  container: {
    padding: theme.spacing.md,
  },
  detailLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  detailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
});
