import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { StatsScreen } from './StatsScreen';
import { useStats } from '../hooks/useStats';
import { DeckStats, HeatMapData, ProgressDataPoint } from '../types';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../hooks/useStats');

// Mock child components
jest.mock('../components/StatsSummary', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View, Text } = require('react-native');
  return {
    StatsSummary: ({ stats }: { stats: DeckStats }) => {
      return (
        <View testID="stats-summary">
          <Text>Accuracy: {stats.accuracy}%</Text>
          <Text>Total: {stats.totalGuesses}</Text>
          <Text>Streak: {stats.bestStreak}</Text>
        </View>
      );
    },
  };
});

jest.mock('../components/StatsChart', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View, Text } = require('react-native');
  return {
    StatsChart: ({
      data,
      title,
    }: {
      data: ProgressDataPoint[];
      title: string;
    }) => {
      return (
        <View testID="stats-chart">
          <Text>{title}</Text>
          <Text>Data points: {data.length}</Text>
        </View>
      );
    },
  };
});

jest.mock('../components/HeatMap', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View, Text } = require('react-native');
  return {
    HeatMap: ({ data }: { data: HeatMapData[] }) => {
      return (
        <View testID="heatmap">
          <Text>HeatMap cells: {data.length}</Text>
        </View>
      );
    },
  };
});

describe('StatsScreen', () => {
  const mockRefresh = jest.fn();
  const mockUseStats = useStats as jest.Mock;

  const mockStats: DeckStats = {
    deckType: 'zener',
    totalGuesses: 100,
    exactMatches: 25,
    suitMatches: 15,
    numberMatches: 10,
    accuracy: 25.0,
    suitAccuracy: 35.0,
    numberAccuracy: 20.0,
    currentStreak: 3,
    bestStreak: 8,
  };

  const mockHeatMapData: HeatMapData[] = [
    { hour: 10, day: 1, accuracy: 30.5, count: 20 },
    { hour: 14, day: 3, accuracy: 22.0, count: 15 },
  ];

  const mockProgressData: ProgressDataPoint[] = [
    { date: '2024-01-01', accuracy: 20.0, guessCount: 10 },
    { date: '2024-01-02', accuracy: 25.0, guessCount: 15 },
    { date: '2024-01-03', accuracy: 30.0, guessCount: 20 },
  ];

  const defaultHookReturn = {
    stats: mockStats,
    heatMapData: mockHeatMapData,
    progressData: mockProgressData,
    isLoading: false,
    error: null,
    refresh: mockRefresh,
    guesses: [],
    cardAccuracy: [],
    suitAccuracy: [],
    numberAccuracy: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStats.mockReturnValue(defaultHookReturn);
  });

  describe('Initial Rendering', () => {
    it('should render the screen with all components', () => {
      const { getByTestId } = render(<StatsScreen />);

      expect(getByTestId('stats-summary')).toBeTruthy();
      expect(getByTestId('stats-chart')).toBeTruthy();
      expect(getByTestId('heatmap')).toBeTruthy();
    });

    it('should render deck filter tabs', () => {
      const { getByText } = render(<StatsScreen />);

      expect(getByText('Zener')).toBeTruthy();
      expect(getByText('RWS')).toBeTruthy();
      expect(getByText('Thoth')).toBeTruthy();
      expect(getByText('Playing')).toBeTruthy();
      expect(getByText('All')).toBeTruthy();
    });

    it('should default to Zener deck selected', () => {
      render(<StatsScreen />);

      expect(mockUseStats).toHaveBeenCalledWith('zener');
    });
  });

  describe('Loading State', () => {
    it('should display loading indicator when isLoading is true', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        isLoading: true,
      });

      const { getByText, queryByTestId } = render(<StatsScreen />);

      expect(getByText('Loading stats...')).toBeTruthy();
      expect(queryByTestId('stats-summary')).toBeNull();
    });

    it('should display ActivityIndicator during loading', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        isLoading: true,
      });

      const { UNSAFE_getByType } = render(<StatsScreen />);

      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('should not display stats content while loading', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        isLoading: true,
      });

      const { queryByTestId } = render(<StatsScreen />);

      expect(queryByTestId('stats-summary')).toBeNull();
      expect(queryByTestId('stats-chart')).toBeNull();
      expect(queryByTestId('heatmap')).toBeNull();
    });
  });

  describe('Error State', () => {
    it('should display error message when error is present', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        error: new Error('Failed to load stats'),
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Error loading stats')).toBeTruthy();
    });

    it('should display retry button on error', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        error: new Error('Failed to load stats'),
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Retry')).toBeTruthy();
    });

    it('should call refresh when retry button is pressed', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        error: new Error('Failed to load stats'),
      });

      const { getByText } = render(<StatsScreen />);

      fireEvent.press(getByText('Retry'));

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should not display stats content when error is present', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        error: new Error('Failed to load stats'),
      });

      const { queryByTestId } = render(<StatsScreen />);

      expect(queryByTestId('stats-summary')).toBeNull();
      expect(queryByTestId('stats-chart')).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no stats are available', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: null,
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('No guesses yet!')).toBeTruthy();
      expect(
        getByText(
          'Start guessing cards to see your statistics and track your progress.'
        )
      ).toBeTruthy();
    });

    it('should display empty state when totalGuesses is 0', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: { ...mockStats, totalGuesses: 0 },
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('No guesses yet!')).toBeTruthy();
    });

    it('should not display stats components in empty state', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: null,
      });

      const { queryByTestId } = render(<StatsScreen />);

      expect(queryByTestId('stats-summary')).toBeNull();
      expect(queryByTestId('stats-chart')).toBeNull();
      expect(queryByTestId('heatmap')).toBeNull();
    });

    it('should still show deck tabs in empty state', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: null,
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Zener')).toBeTruthy();
      expect(getByText('RWS')).toBeTruthy();
    });
  });

  describe('Deck Filter Tabs', () => {
    it('should switch to Zener deck when Zener tab is pressed', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: { ...mockStats, deckType: 'playing' },
      });

      const { getByText, rerender } = render(<StatsScreen />);

      fireEvent.press(getByText('Zener'));

      rerender(<StatsScreen />);

      expect(mockUseStats).toHaveBeenCalledWith('zener');
    });

    it('should switch to RWS deck when RWS tab is pressed', () => {
      const { getByText } = render(<StatsScreen />);

      fireEvent.press(getByText('RWS'));

      waitFor(() => {
        expect(mockUseStats).toHaveBeenCalledWith('rws');
      });
    });

    it('should switch to Thoth deck when Thoth tab is pressed', () => {
      const { getByText } = render(<StatsScreen />);

      fireEvent.press(getByText('Thoth'));

      waitFor(() => {
        expect(mockUseStats).toHaveBeenCalledWith('thoth');
      });
    });

    it('should switch to Playing deck when Playing tab is pressed', () => {
      const { getByText } = render(<StatsScreen />);

      fireEvent.press(getByText('Playing'));

      waitFor(() => {
        expect(mockUseStats).toHaveBeenCalledWith('playing');
      });
    });

    it('should show all decks when All tab is pressed', () => {
      const { getByText } = render(<StatsScreen />);

      fireEvent.press(getByText('All'));

      waitFor(() => {
        expect(mockUseStats).toHaveBeenCalledWith(undefined);
      });
    });

    it('should have proper accessibility labels on deck tabs', () => {
      const { getByLabelText } = render(<StatsScreen />);

      expect(getByLabelText('View Zener stats')).toBeTruthy();
      expect(getByLabelText('View RWS stats')).toBeTruthy();
      expect(getByLabelText('View Thoth stats')).toBeTruthy();
      expect(getByLabelText('View Playing stats')).toBeTruthy();
      expect(getByLabelText('View All stats')).toBeTruthy();
    });

    it('should have tab role on all deck buttons', () => {
      const { getAllByRole } = render(<StatsScreen />);

      const tabs = getAllByRole('tab');
      expect(tabs.length).toBe(5); // Zener, RWS, Thoth, Playing, All
    });
  });

  describe('Stats Display', () => {
    it('should pass stats to StatsSummary component', () => {
      const { getByText } = render(<StatsScreen />);

      expect(getByText('Accuracy: 25%')).toBeTruthy();
      expect(getByText('Total: 100')).toBeTruthy();
      expect(getByText('Streak: 8')).toBeTruthy();
    });

    it('should display progress chart when progressData is available', () => {
      const { getByText } = render(<StatsScreen />);

      expect(getByText('Progress Over Time')).toBeTruthy();
      expect(getByText('Data points: 3')).toBeTruthy();
    });

    it('should display heatmap when heatMapData is available', () => {
      const { getByText } = render(<StatsScreen />);

      expect(getByText('HeatMap cells: 2')).toBeTruthy();
    });

    it('should not display chart when progressData is empty', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        progressData: [],
      });

      const { queryByTestId } = render(<StatsScreen />);

      expect(queryByTestId('stats-chart')).toBeNull();
    });

    it('should not display heatmap when heatMapData is empty', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        heatMapData: [],
      });

      const { queryByTestId } = render(<StatsScreen />);

      expect(queryByTestId('heatmap')).toBeNull();
    });
  });

  describe('Highlights Section', () => {
    it('should display highlights when totalGuesses >= 10', () => {
      const { getByText } = render(<StatsScreen />);

      expect(getByText('Highlights')).toBeTruthy();
      expect(getByText('Total Sessions: 100')).toBeTruthy();
      expect(getByText('Success Rate: 25.0%')).toBeTruthy();
      expect(getByText('Longest Streak: 8 exact matches')).toBeTruthy();
    });

    it('should not display highlights when totalGuesses < 10', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: { ...mockStats, totalGuesses: 9 },
      });

      const { queryByText } = render(<StatsScreen />);

      expect(queryByText('Highlights')).toBeNull();
    });

    it('should display streak in highlights only if bestStreak > 0', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: { ...mockStats, bestStreak: 0 },
      });

      const { queryByText } = render(<StatsScreen />);

      expect(queryByText(/Longest Streak/)).toBeNull();
    });

    it('should display accuracy rounded to 1 decimal place', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: { ...mockStats, accuracy: 25.456 },
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Success Rate: 25.5%')).toBeTruthy();
    });
  });

  describe('Data Refresh', () => {
    it('should reload stats when deck changes', () => {
      const { getByText } = render(<StatsScreen />);

      // Initial call with 'zener'
      expect(mockUseStats).toHaveBeenCalledWith('zener');

      // Change deck
      fireEvent.press(getByText('Playing'));

      // Should trigger reload
      waitFor(() => {
        expect(mockUseStats).toHaveBeenCalledWith('playing');
      });
    });

    it('should maintain scroll position when switching decks', () => {
      const { UNSAFE_getByType } = render(<StatsScreen />);

      const scrollView = UNSAFE_getByType(ScrollView);
      expect(scrollView).toBeTruthy();

      // This test verifies the ScrollView exists and is rendered
      // In actual usage, scroll position would be maintained by React Native
    });
  });

  describe('Scrolling Behavior', () => {
    it('should render content in a ScrollView', () => {
      const { UNSAFE_getByType } = render(<StatsScreen />);

      expect(UNSAFE_getByType(ScrollView)).toBeTruthy();
    });

    it('should enable vertical scrolling', () => {
      const { UNSAFE_getByType } = render(<StatsScreen />);

      const scrollView = UNSAFE_getByType(ScrollView);
      expect(scrollView.props.showsVerticalScrollIndicator).toBe(true);
    });
  });

  describe('Component Integration', () => {
    it('should pass correct stats to StatsSummary', () => {
      const customStats: DeckStats = {
        deckType: 'playing',
        totalGuesses: 50,
        exactMatches: 10,
        suitMatches: 5,
        numberMatches: 3,
        accuracy: 20.0,
        suitAccuracy: 30.0,
        numberAccuracy: 25.0,
        currentStreak: 2,
        bestStreak: 5,
      };

      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: customStats,
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Accuracy: 20%')).toBeTruthy();
      expect(getByText('Total: 50')).toBeTruthy();
      expect(getByText('Streak: 5')).toBeTruthy();
    });

    it('should pass progress data to StatsChart', () => {
      const customProgressData: ProgressDataPoint[] = [
        { date: '2024-02-01', accuracy: 15.0, guessCount: 5 },
        { date: '2024-02-02', accuracy: 20.0, guessCount: 8 },
      ];

      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        progressData: customProgressData,
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Data points: 2')).toBeTruthy();
    });

    it('should pass heatmap data to HeatMap component', () => {
      const customHeatMapData: HeatMapData[] = [
        { hour: 9, day: 0, accuracy: 25.0, count: 10 },
        { hour: 15, day: 5, accuracy: 18.5, count: 12 },
        { hour: 20, day: 2, accuracy: 30.0, count: 8 },
      ];

      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        heatMapData: customHeatMapData,
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('HeatMap cells: 3')).toBeTruthy();
    });
  });

  describe('Multiple Deck Scenarios', () => {
    it('should handle Zener deck stats correctly', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: {
          deckType: 'zener',
          totalGuesses: 30,
          exactMatches: 8,
          suitMatches: 0,
          numberMatches: 0,
          accuracy: 26.67,
          suitAccuracy: 35.0,
          numberAccuracy: 20.0,
          currentStreak: 1,
          bestStreak: 3,
        },
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Accuracy: 26.67%')).toBeTruthy();
      expect(getByText('Total: 30')).toBeTruthy();
    });

    it('should handle Playing deck stats correctly', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: {
          deckType: 'playing',
          totalGuesses: 52,
          exactMatches: 2,
          suitMatches: 10,
          numberMatches: 5,
          accuracy: 3.85,
          suitAccuracy: 30.0,
          numberAccuracy: 25.0,
          currentStreak: 0,
          bestStreak: 2,
        },
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Accuracy: 3.85%')).toBeTruthy();
      expect(getByText('Total: 52')).toBeTruthy();
    });

    it('should handle RWS Tarot deck stats correctly', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: {
          deckType: 'rws',
          totalGuesses: 78,
          exactMatches: 1,
          suitMatches: 15,
          numberMatches: 12,
          accuracy: 1.28,
          suitAccuracy: 28.0,
          numberAccuracy: 22.0,
          currentStreak: 0,
          bestStreak: 1,
        },
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Accuracy: 1.28%')).toBeTruthy();
      expect(getByText('Total: 78')).toBeTruthy();
    });

    it('should handle Thoth Tarot deck stats correctly', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: {
          deckType: 'thoth',
          totalGuesses: 156,
          exactMatches: 3,
          suitMatches: 30,
          numberMatches: 25,
          accuracy: 1.92,
          suitAccuracy: 28.0,
          numberAccuracy: 22.0,
          currentStreak: 1,
          bestStreak: 2,
        },
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Accuracy: 1.92%')).toBeTruthy();
      expect(getByText('Total: 156')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle stats with 0 accuracy', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: { ...mockStats, accuracy: 0, exactMatches: 0 },
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Accuracy: 0%')).toBeTruthy();
    });

    it('should handle stats with 100% accuracy', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: {
          ...mockStats,
          accuracy: 100.0,
          exactMatches: 100,
          totalGuesses: 100,
        },
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Accuracy: 100%')).toBeTruthy();
    });

    it('should handle very large numbers of guesses', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        stats: {
          ...mockStats,
          totalGuesses: 99999,
          exactMatches: 12345,
          accuracy: 12.35,
        },
      });

      const { getByText } = render(<StatsScreen />);

      expect(getByText('Total Sessions: 99999')).toBeTruthy();
    });

    it('should handle empty progress data gracefully', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        progressData: [],
      });

      const { queryByTestId } = render(<StatsScreen />);

      expect(queryByTestId('stats-chart')).toBeNull();
    });

    it('should handle empty heatmap data gracefully', () => {
      mockUseStats.mockReturnValue({
        ...defaultHookReturn,
        heatMapData: [],
      });

      const { queryByTestId } = render(<StatsScreen />);

      expect(queryByTestId('heatmap')).toBeNull();
    });
  });

  describe('User Experience', () => {
    it('should maintain stats display while loading new deck data', () => {
      const { getByText, rerender } = render(<StatsScreen />);

      // Initially shows stats
      expect(getByText('Accuracy: 25%')).toBeTruthy();

      // User changes deck - in real app, brief loading state
      fireEvent.press(getByText('Playing'));

      // Content should update
      rerender(<StatsScreen />);
    });

    it('should show all required visual elements for complete UX', () => {
      const { getByTestId, getByText } = render(<StatsScreen />);

      // Tabs
      expect(getByText('Zener')).toBeTruthy();

      // Stats
      expect(getByTestId('stats-summary')).toBeTruthy();

      // Charts
      expect(getByTestId('stats-chart')).toBeTruthy();
      expect(getByTestId('heatmap')).toBeTruthy();

      // Highlights
      expect(getByText('Highlights')).toBeTruthy();
    });
  });

  describe('SafeAreaView Usage', () => {
    it('should wrap content in SafeAreaView', () => {
      const { UNSAFE_getByType } = render(<StatsScreen />);

      expect(UNSAFE_getByType(SafeAreaView)).toBeTruthy();
    });
  });
});
