import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { DeckType } from '../types';
import { useStats } from '../hooks/useStats';
import { StatsSummary } from '../components/StatsSummary';
import { StatsChart } from '../components/StatsChart';
import { HeatMap } from '../components/HeatMap';
import { theme } from '../constants/theme';

export function StatsScreen() {
  const [selectedDeck, setSelectedDeck] = useState<DeckType | undefined>(
    'zener'
  );

  const { stats, heatMapData, progressData, isLoading, error, refresh } =
    useStats(selectedDeck);

  const deckTabs: Array<{ type: DeckType | undefined; label: string }> = [
    { type: 'zener', label: 'Zener' },
    { type: 'rws', label: 'RWS' },
    { type: 'thoth', label: 'Thoth' },
    { type: 'playing', label: 'Playing' },
    { type: undefined, label: 'All' },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading stats</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isEmpty = !stats || stats.totalGuesses === 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Deck filter tabs */}
      <View style={styles.tabContainer}>
        {deckTabs.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={[
              styles.tab,
              selectedDeck === tab.type && styles.tabSelected,
            ]}
            onPress={() => setSelectedDeck(tab.type)}
            accessibilityLabel={`View ${tab.label} stats`}
            accessibilityRole="tab"
          >
            <Text
              style={[
                styles.tabText,
                selectedDeck === tab.type && styles.tabTextSelected,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No guesses yet!</Text>
          <Text style={styles.emptyText}>
            Start guessing cards to see your statistics and track your progress.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
        >
          {stats && <StatsSummary stats={stats} />}

          {progressData.length > 0 && (
            <StatsChart data={progressData} title="Progress Over Time" />
          )}

          {heatMapData.length > 0 && <HeatMap data={heatMapData} />}

          {/* Highlights section */}
          {stats && stats.totalGuesses >= 10 && (
            <View style={styles.highlightsContainer}>
              <Text style={styles.highlightsTitle}>Highlights</Text>
              <View style={styles.highlight}>
                <Text style={styles.highlightText}>
                  Total Sessions: {stats.totalGuesses}
                </Text>
              </View>
              <View style={styles.highlight}>
                <Text style={styles.highlightText}>
                  Success Rate: {stats.accuracy.toFixed(1)}%
                </Text>
              </View>
              {stats.bestStreak > 0 && (
                <View style={styles.highlight}>
                  <Text style={styles.highlightText}>
                    Longest Streak: {stats.bestStreak} exact matches
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomPadding: {
    height: theme.spacing.xxl,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.h3,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  highlight: {
    paddingVertical: theme.spacing.sm,
  },
  highlightText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  highlightsContainer: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
  },
  highlightsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  retryButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tab: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    flex: 1,
    paddingVertical: theme.spacing.sm,
  },
  tabContainer: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  tabSelected: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  tabTextSelected: {
    color: theme.colors.text,
    fontWeight: '600',
  },
});
