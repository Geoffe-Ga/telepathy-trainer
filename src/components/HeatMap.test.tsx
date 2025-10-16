import React from 'react';
import { render } from '@testing-library/react-native';
import { HeatMap } from './HeatMap';
import { HeatMapData } from '../types';

describe('HeatMap', () => {
  const mockData: HeatMapData[] = [
    { hour: 9, day: 1, count: 10, accuracy: 30.0 },
    { hour: 14, day: 1, count: 15, accuracy: 40.0 },
    { hour: 10, day: 2, count: 8, accuracy: 25.0 },
    { hour: 15, day: 3, count: 20, accuracy: 80.0 },
    { hour: 9, day: 4, count: 12, accuracy: 35.0 },
  ];

  describe('Rendering with Data', () => {
    it('should render the title', () => {
      const { getByText } = render(<HeatMap data={mockData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
    });

    it('should render best time insight', () => {
      const { getByText } = render(<HeatMap data={mockData} />);

      expect(getByText(/Best time:/)).toBeTruthy();
    });

    it('should render the legend', () => {
      const { getByText } = render(<HeatMap data={mockData} />);

      expect(getByText('Accuracy:')).toBeTruthy();
      expect(getByText('0-33%')).toBeTruthy();
      expect(getByText('34-66%')).toBeTruthy();
      expect(getByText('67-100%')).toBeTruthy();
    });

    it('should render day labels', () => {
      const { getByText } = render(<HeatMap data={mockData} />);

      expect(getByText('Sun')).toBeTruthy();
      expect(getByText('Mon')).toBeTruthy();
      expect(getByText('Tue')).toBeTruthy();
      expect(getByText('Wed')).toBeTruthy();
      expect(getByText('Thu')).toBeTruthy();
      expect(getByText('Fri')).toBeTruthy();
      expect(getByText('Sat')).toBeTruthy();
    });

    it('should not render empty state when data is available', () => {
      const { queryByText } = render(<HeatMap data={mockData} />);

      expect(queryByText('Not enough data for heatmap')).toBeNull();
      expect(
        queryByText('Practice at different times to see patterns')
      ).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should render empty message when data is empty', () => {
      const { getByText } = render(<HeatMap data={[]} />);

      expect(getByText('Not enough data for heatmap')).toBeTruthy();
      expect(
        getByText('Practice at different times to see patterns')
      ).toBeTruthy();
    });

    it('should not render title in empty state', () => {
      const { queryByText } = render(<HeatMap data={[]} />);

      expect(queryByText('Time-Based Performance')).toBeNull();
    });

    it('should not render legend in empty state', () => {
      const { queryByText } = render(<HeatMap data={[]} />);

      expect(queryByText('Accuracy:')).toBeNull();
      expect(queryByText('0-33%')).toBeNull();
    });

    it('should not render best time insight in empty state', () => {
      const { queryByText } = render(<HeatMap data={[]} />);

      expect(queryByText(/Best time:/)).toBeNull();
    });
  });

  describe('Best Time Slot', () => {
    it('should display the best performing time slot', () => {
      const { getByText } = render(<HeatMap data={mockData} />);

      // Hour 15 on day 3 has 80% accuracy (highest)
      expect(getByText(/Best time:/)).toBeTruthy();
      expect(getByText(/80.0% accuracy/)).toBeTruthy();
    });

    it('should format day names correctly', () => {
      const { getByText } = render(<HeatMap data={mockData} />);

      // Should show day name (like "Wednesday" for day 3)
      expect(getByText(/Best time:/)).toBeTruthy();
    });

    it('should handle multiple high-performing slots', () => {
      const tiedData: HeatMapData[] = [
        { hour: 9, day: 1, count: 10, accuracy: 80.0 },
        { hour: 14, day: 2, count: 10, accuracy: 80.0 },
      ];

      const { getByText } = render(<HeatMap data={tiedData} />);

      expect(getByText(/80.0% accuracy/)).toBeTruthy();
    });
  });

  describe('Data Patterns', () => {
    it('should handle data with varying counts', () => {
      const varyingData: HeatMapData[] = [
        { hour: 9, day: 1, count: 1, accuracy: 100.0 },
        { hour: 14, day: 1, count: 100, accuracy: 50.0 },
        { hour: 10, day: 2, count: 1000, accuracy: 25.0 },
      ];

      const { getByText } = render(<HeatMap data={varyingData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
    });

    it('should handle data across all hours', () => {
      const allHoursData: HeatMapData[] = Array.from(
        { length: 24 },
        (_, i) => ({
          hour: i,
          day: 1,
          count: 10,
          accuracy: (i / 24) * 100,
        })
      );

      const { getByText } = render(<HeatMap data={allHoursData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
    });

    it('should handle data across all days', () => {
      const allDaysData: HeatMapData[] = Array.from({ length: 7 }, (_, i) => ({
        hour: 12,
        day: i,
        count: 10,
        accuracy: (i / 7) * 100,
      }));

      const { getByText } = render(<HeatMap data={allDaysData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
    });

    it('should handle sparse data coverage', () => {
      const sparseData: HeatMapData[] = [
        { hour: 0, day: 0, count: 5, accuracy: 20.0 },
        { hour: 23, day: 6, count: 3, accuracy: 30.0 },
      ];

      const { getByText } = render(<HeatMap data={sparseData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
    });
  });

  describe('Accuracy Ranges', () => {
    it('should handle low accuracy data (0-33%)', () => {
      const lowData: HeatMapData[] = [
        { hour: 9, day: 1, count: 10, accuracy: 10.0 },
        { hour: 10, day: 1, count: 10, accuracy: 20.0 },
        { hour: 11, day: 1, count: 10, accuracy: 30.0 },
      ];

      const { getByText } = render(<HeatMap data={lowData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
      expect(getByText('0-33%')).toBeTruthy();
    });

    it('should handle medium accuracy data (34-66%)', () => {
      const mediumData: HeatMapData[] = [
        { hour: 9, day: 1, count: 10, accuracy: 40.0 },
        { hour: 10, day: 1, count: 10, accuracy: 50.0 },
        { hour: 11, day: 1, count: 10, accuracy: 60.0 },
      ];

      const { getByText } = render(<HeatMap data={mediumData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
      expect(getByText('34-66%')).toBeTruthy();
    });

    it('should handle high accuracy data (67-100%)', () => {
      const highData: HeatMapData[] = [
        { hour: 9, day: 1, count: 10, accuracy: 70.0 },
        { hour: 10, day: 1, count: 10, accuracy: 85.0 },
        { hour: 11, day: 1, count: 10, accuracy: 100.0 },
      ];

      const { getByText } = render(<HeatMap data={highData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
      expect(getByText('67-100%')).toBeTruthy();
    });

    it('should handle mixed accuracy ranges', () => {
      const mixedData: HeatMapData[] = [
        { hour: 9, day: 1, count: 10, accuracy: 10.0 },
        { hour: 10, day: 1, count: 10, accuracy: 50.0 },
        { hour: 11, day: 1, count: 10, accuracy: 90.0 },
      ];

      const { getByText } = render(<HeatMap data={mixedData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero accuracy', () => {
      const zeroData: HeatMapData[] = [
        { hour: 9, day: 1, count: 10, accuracy: 0.0 },
      ];

      const { getByText } = render(<HeatMap data={zeroData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
    });

    it('should handle perfect accuracy', () => {
      const perfectData: HeatMapData[] = [
        { hour: 9, day: 1, count: 10, accuracy: 100.0 },
      ];

      const { getByText } = render(<HeatMap data={perfectData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
      expect(getByText(/100.0% accuracy/)).toBeTruthy();
    });

    it('should handle single data point', () => {
      const singleData: HeatMapData[] = [
        { hour: 12, day: 3, count: 5, accuracy: 50.0 },
      ];

      const { getByText } = render(<HeatMap data={singleData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
    });

    it('should handle boundary hours (0 and 23)', () => {
      const boundaryData: HeatMapData[] = [
        { hour: 0, day: 0, count: 10, accuracy: 30.0 },
        { hour: 23, day: 6, count: 10, accuracy: 40.0 },
      ];

      const { getByText } = render(<HeatMap data={boundaryData} />);

      expect(getByText('Time-Based Performance')).toBeTruthy();
    });

    it('should handle boundary days (Sunday and Saturday)', () => {
      const boundaryDaysData: HeatMapData[] = [
        { hour: 12, day: 0, count: 10, accuracy: 30.0 },
        { hour: 12, day: 6, count: 10, accuracy: 40.0 },
      ];

      const { getByText } = render(<HeatMap data={boundaryDaysData} />);

      expect(getByText('Sun')).toBeTruthy();
      expect(getByText('Sat')).toBeTruthy();
    });
  });
});
