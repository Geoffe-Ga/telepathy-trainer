import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { HeatMapData } from '../types';
import {
  formatDayName,
  formatTimeSlot,
  getBestTimeSlot,
} from '../utils/statsCalculator';
import { theme } from '../constants/theme';

interface HeatMapProps {
  data: HeatMapData[];
}

export function HeatMap({ data }: HeatMapProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Not enough data for heatmap</Text>
        <Text style={styles.emptySubtext}>
          Practice at different times to see patterns
        </Text>
      </View>
    );
  }

  const bestTime = getBestTimeSlot(data);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Create lookup map for quick access
  const dataMap = new Map<string, HeatMapData>();
  data.forEach((item) => {
    dataMap.set(`${item.day}-${item.hour}`, item);
  });

  // Get color based on accuracy
  const getColor = (accuracy: number | undefined) => {
    if (accuracy === undefined) return theme.colors.surfaceLight;
    if (accuracy >= 67) return theme.colors.success;
    if (accuracy >= 34) return theme.colors.warning;
    return theme.colors.error;
  };

  const getOpacity = (count: number | undefined) => {
    if (count === undefined) return 0.1;
    return Math.min(0.3 + (count / 10) * 0.7, 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time-Based Performance</Text>
      {bestTime && (
        <View style={styles.insightContainer}>
          <Text style={styles.insightText}>
            Best time: {formatDayName(bestTime.day)}s at{' '}
            {formatTimeSlot(bestTime.hour)} ({bestTime.accuracy.toFixed(1)}%
            accuracy)
          </Text>
        </View>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.heatmapContainer}>
          {/* Hour labels (top) */}
          <View style={styles.headerRow}>
            <View style={styles.cornerCell} />
            {hours.map((hour) => (
              <View key={hour} style={styles.headerCell}>
                <Text style={styles.headerText}>{hour}</Text>
              </View>
            ))}
          </View>

          {/* Day rows with cells */}
          {days.map((day, dayIndex) => (
            <View key={dayIndex} style={styles.row}>
              <View style={styles.dayCell}>
                <Text style={styles.dayText}>{day}</Text>
              </View>
              {hours.map((hour) => {
                const cellData = dataMap.get(`${dayIndex}-${hour}`);
                return (
                  <View
                    key={hour}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: getColor(cellData?.accuracy),
                        opacity: getOpacity(cellData?.count),
                      },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Accuracy:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: theme.colors.error },
              ]}
            />
            <Text style={styles.legendText}>0-33%</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: theme.colors.warning },
              ]}
            />
            <Text style={styles.legendText}>34-66%</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: theme.colors.success },
              ]}
            />
            <Text style={styles.legendText}>67-100%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderRadius: theme.borderRadius.sm,
    height: 30,
    margin: 1,
    width: 30,
  },
  container: {
    padding: theme.spacing.md,
  },
  cornerCell: {
    height: 30,
    width: 40,
  },
  dayCell: {
    height: 30,
    justifyContent: 'center',
    paddingRight: theme.spacing.xs,
    width: 40,
  },
  dayText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
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
  headerCell: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  headerRow: {
    flexDirection: 'row',
  },
  headerText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  heatmapContainer: {
    marginVertical: theme.spacing.sm,
  },
  insightContainer: {
    backgroundColor: theme.colors.surface,
    borderLeftColor: theme.colors.accent,
    borderLeftWidth: 4,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  insightText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  legend: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  legendColor: {
    borderRadius: theme.borderRadius.sm,
    height: 16,
    width: 16,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  legendItems: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  legendText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  legendTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
});
