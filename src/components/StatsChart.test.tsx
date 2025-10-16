import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressDataPoint } from '../types';

// Mock the entire StatsChart component to avoid style/dimension issues in tests
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
}));

// Import after mocks
import { StatsChart } from './StatsChart';

describe('StatsChart', () => {
  const mockData: ProgressDataPoint[] = [
    { date: '2025-01-01', accuracy: 20.0, guessCount: 10 },
    { date: '2025-01-02', accuracy: 25.0, guessCount: 12 },
    { date: '2025-01-03', accuracy: 30.0, guessCount: 15 },
    { date: '2025-01-04', accuracy: 22.0, guessCount: 8 },
    { date: '2025-01-05', accuracy: 28.0, guessCount: 20 },
  ];

  describe('Rendering with Data', () => {
    it('should render the title', () => {
      const { getByText } = render(
        <StatsChart data={mockData} title="Progress Over Time" />
      );

      expect(getByText('Progress Over Time')).toBeTruthy();
    });

    it('should render LineChart component when data is available', () => {
      const { UNSAFE_root } = render(
        <StatsChart data={mockData} title="Progress Over Time" />
      );

      const lineChart = UNSAFE_root.findAllByType('LineChart');
      expect(lineChart.length).toBe(1);
    });

    it('should not render empty state when data is available', () => {
      const { queryByText } = render(
        <StatsChart data={mockData} title="Progress Over Time" />
      );

      expect(queryByText('Not enough data to display chart')).toBeNull();
      expect(queryByText('Keep practicing to see your progress!')).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should render empty message when data is empty', () => {
      const { getByText } = render(
        <StatsChart data={[]} title="Progress Over Time" />
      );

      expect(getByText('Not enough data to display chart')).toBeTruthy();
      expect(getByText('Keep practicing to see your progress!')).toBeTruthy();
    });

    it('should not render LineChart when data is empty', () => {
      const { UNSAFE_root } = render(
        <StatsChart data={[]} title="Progress Over Time" />
      );

      const lineChart = UNSAFE_root.findAllByType('LineChart');
      expect(lineChart.length).toBe(0);
    });

    it('should not render title in empty state', () => {
      const { queryByText } = render(
        <StatsChart data={[]} title="Progress Over Time" />
      );

      // Title should not be rendered when empty
      // The empty container has its own messaging
      expect(queryByText('Progress Over Time')).toBeNull();
    });
  });

  describe('Data Formatting', () => {
    it('should handle single data point', () => {
      const singleData: ProgressDataPoint[] = [
        { date: '2025-01-01', accuracy: 20.0, guessCount: 10 },
      ];

      const { UNSAFE_root } = render(
        <StatsChart data={singleData} title="Progress Over Time" />
      );

      const lineChart = UNSAFE_root.findAllByType('LineChart');
      expect(lineChart.length).toBe(1);
    });

    it('should handle many data points', () => {
      const manyData: ProgressDataPoint[] = Array.from(
        { length: 100 },
        (_, i) => ({
          date: `2025-01-${String(i + 1).padStart(2, '0')}`,
          accuracy: Math.random() * 100,
          guessCount: Math.floor(Math.random() * 50),
        })
      );

      const { UNSAFE_root } = render(
        <StatsChart data={manyData} title="Progress Over Time" />
      );

      const lineChart = UNSAFE_root.findAllByType('LineChart');
      expect(lineChart.length).toBe(1);
    });

    it('should handle data with 0% accuracy', () => {
      const zeroData: ProgressDataPoint[] = [
        { date: '2025-01-01', accuracy: 0, guessCount: 10 },
        { date: '2025-01-02', accuracy: 0, guessCount: 10 },
      ];

      const { UNSAFE_root } = render(
        <StatsChart data={zeroData} title="Progress Over Time" />
      );

      const lineChart = UNSAFE_root.findAllByType('LineChart');
      expect(lineChart.length).toBe(1);
    });

    it('should handle data with 100% accuracy', () => {
      const perfectData: ProgressDataPoint[] = [
        { date: '2025-01-01', accuracy: 100, guessCount: 10 },
        { date: '2025-01-02', accuracy: 100, guessCount: 10 },
      ];

      const { UNSAFE_root } = render(
        <StatsChart data={perfectData} title="Progress Over Time" />
      );

      const lineChart = UNSAFE_root.findAllByType('LineChart');
      expect(lineChart.length).toBe(1);
    });
  });

  describe('Title Prop', () => {
    it('should render custom title', () => {
      const { getByText } = render(
        <StatsChart data={mockData} title="Custom Title" />
      );

      expect(getByText('Custom Title')).toBeTruthy();
    });

    it('should render different titles for different charts', () => {
      const { getByText, rerender } = render(
        <StatsChart data={mockData} title="Weekly Progress" />
      );

      expect(getByText('Weekly Progress')).toBeTruthy();

      rerender(<StatsChart data={mockData} title="Monthly Progress" />);

      expect(getByText('Monthly Progress')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle fluctuating accuracy values', () => {
      const fluctuatingData: ProgressDataPoint[] = [
        { date: '2025-01-01', accuracy: 10.0, guessCount: 10 },
        { date: '2025-01-02', accuracy: 50.0, guessCount: 12 },
        { date: '2025-01-03', accuracy: 5.0, guessCount: 15 },
        { date: '2025-01-04', accuracy: 80.0, guessCount: 8 },
        { date: '2025-01-05', accuracy: 20.0, guessCount: 20 },
      ];

      const { UNSAFE_root } = render(
        <StatsChart data={fluctuatingData} title="Progress" />
      );

      const lineChart = UNSAFE_root.findAllByType('LineChart');
      expect(lineChart.length).toBe(1);
    });

    it('should handle very small accuracy values', () => {
      const smallData: ProgressDataPoint[] = [
        { date: '2025-01-01', accuracy: 0.1, guessCount: 1000 },
        { date: '2025-01-02', accuracy: 0.5, guessCount: 1000 },
      ];

      const { UNSAFE_root } = render(
        <StatsChart data={smallData} title="Progress" />
      );

      const lineChart = UNSAFE_root.findAllByType('LineChart');
      expect(lineChart.length).toBe(1);
    });

    it('should handle data with varying guess counts', () => {
      const varyingData: ProgressDataPoint[] = [
        { date: '2025-01-01', accuracy: 20.0, guessCount: 1 },
        { date: '2025-01-02', accuracy: 25.0, guessCount: 100 },
        { date: '2025-01-03', accuracy: 30.0, guessCount: 1000 },
      ];

      const { UNSAFE_root } = render(
        <StatsChart data={varyingData} title="Progress" />
      );

      const lineChart = UNSAFE_root.findAllByType('LineChart');
      expect(lineChart.length).toBe(1);
    });
  });
});
