import { useEffect, useState, useCallback } from 'react';
import {
  DeckType,
  DeckStats,
  HeatMapData,
  CardAccuracy,
  SuitAccuracy,
  NumberAccuracy,
  ProgressDataPoint,
  Guess,
  TimeRange,
} from '../types';
import { getAllGuesses } from '../database/queries';
import {
  calculateDeckStats,
  calculateHeatMapData,
  calculateCardAccuracy,
  calculateSuitAccuracy,
  calculateNumberAccuracy,
  calculateProgressData,
} from '../utils/statsCalculator';

/**
 * Hook to fetch and calculate stats for a deck
 * Refetches when deck changes or when explicitly refreshed
 */
export function useStats(deckType?: DeckType) {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [heatMapData, setHeatMapData] = useState<HeatMapData[]>([]);
  const [cardAccuracy, setCardAccuracy] = useState<CardAccuracy[]>([]);
  const [suitAccuracy, setSuitAccuracy] = useState<SuitAccuracy[]>([]);
  const [numberAccuracy, setNumberAccuracy] = useState<NumberAccuracy[]>([]);
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch guesses from database
      const allGuesses = await getAllGuesses(deckType);
      setGuesses(allGuesses);

      // Calculate stats if we have a specific deck type
      if (deckType) {
        const deckStats = calculateDeckStats(allGuesses, deckType);
        setStats(deckStats);
      } else {
        setStats(null);
      }

      // Calculate other stats
      setHeatMapData(calculateHeatMapData(allGuesses));
      setCardAccuracy(calculateCardAccuracy(allGuesses));
      setSuitAccuracy(calculateSuitAccuracy(allGuesses));
      setNumberAccuracy(calculateNumberAccuracy(allGuesses));
      setProgressData(calculateProgressData(allGuesses));

      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, [deckType]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    guesses,
    stats,
    heatMapData,
    cardAccuracy,
    suitAccuracy,
    numberAccuracy,
    progressData,
    isLoading,
    error,
    refresh: loadStats,
  };
}

/**
 * Hook to get progress data for a specific time range
 */
export function useProgressData(
  deckType?: DeckType,
  timeRange: TimeRange = 'all'
) {
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProgressData() {
      setIsLoading(true);

      try {
        const allGuesses = await getAllGuesses(deckType);

        // Convert time range to days
        const days =
          timeRange === '7d'
            ? 7
            : timeRange === '30d'
              ? 30
              : timeRange === '90d'
                ? 90
                : 0;

        const data = calculateProgressData(allGuesses, 20, days);
        setProgressData(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading progress data:', err);
        setIsLoading(false);
      }
    }

    loadProgressData();
  }, [deckType, timeRange]);

  return { progressData, isLoading };
}
