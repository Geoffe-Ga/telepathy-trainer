import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ProgressDataPoint } from '../types';
import { theme } from '../constants/theme';

interface StatsChartProps {
  data: ProgressDataPoint[];
  title: string;
}

export function StatsChart({ data, title }: StatsChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Not enough data to display chart</Text>
        <Text style={styles.emptySubtext}>
          Keep practicing to see your progress!
        </Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;

  // Prepare chart data
  const labels = data.map((point, index) => {
    // Show label for every nth point to avoid crowding
    const showEvery = Math.ceil(data.length / 5);
    if (index % showEvery === 0) {
      return point.date.slice(5); // Show MM-DD
    }
    return '';
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: data.map((point) => point.accuracy),
        color: (opacity = 1) => `rgba(107, 76, 230, ${opacity})`, // theme.colors.primary
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surfaceLight,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(157, 124, 255, ${opacity})`, // theme.colors.secondary
    labelColor: (opacity = 1) => `rgba(160, 160, 176, ${opacity})`, // theme.colors.textSecondary
    style: {
      borderRadius: theme.borderRadius.md,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={chartData}
        width={screenWidth - theme.spacing.md * 2}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        withDots={data.length < 20}
        withShadow={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
  },
  container: {
    padding: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    margin: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  emptySubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
});
