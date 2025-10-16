import {
  Guess,
  DeckStats,
  HeatMapData,
  CardAccuracy,
  SuitAccuracy,
  NumberAccuracy,
  ProgressDataPoint,
  DeckType,
} from '../types';
import { format, subDays } from 'date-fns';

/**
 * Calculate comprehensive stats for a deck from raw guess data
 */
export function calculateDeckStats(
  guesses: Guess[],
  deckType: DeckType
): DeckStats {
  const deckGuesses = guesses.filter((g) => g.deckType === deckType);

  const totalGuesses = deckGuesses.length;
  const exactMatches = deckGuesses.filter((g) => g.exactMatch).length;
  const suitMatches = deckGuesses.filter((g) => g.suitMatch).length;
  const numberMatches = deckGuesses.filter((g) => g.numberMatch).length;

  const accuracy = totalGuesses > 0 ? (exactMatches / totalGuesses) * 100 : 0;
  const suitAccuracy =
    totalGuesses > 0 ? (suitMatches / totalGuesses) * 100 : 0;
  const numberAccuracy =
    totalGuesses > 0 ? (numberMatches / totalGuesses) * 100 : 0;

  const bestStreak = calculateBestStreak(deckGuesses);
  const currentStreak = calculateCurrentStreak(deckGuesses);

  return {
    deckType,
    totalGuesses,
    exactMatches,
    suitMatches,
    numberMatches,
    accuracy: Number(accuracy.toFixed(2)),
    suitAccuracy: Number(suitAccuracy.toFixed(2)),
    numberAccuracy: Number(numberAccuracy.toFixed(2)),
    bestStreak,
    currentStreak,
  };
}

/**
 * Calculate best streak (longest consecutive exact matches)
 */
export function calculateBestStreak(guesses: Guess[]): number {
  let currentStreak = 0;
  let bestStreak = 0;

  // Sort by timestamp to ensure chronological order
  const sortedGuesses = [...guesses].sort((a, b) => a.timestamp - b.timestamp);

  for (const guess of sortedGuesses) {
    if (guess.exactMatch) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return bestStreak;
}

/**
 * Calculate current streak (recent consecutive exact matches)
 */
export function calculateCurrentStreak(guesses: Guess[]): number {
  if (guesses.length === 0) return 0;

  // Sort by timestamp descending (most recent first)
  const sortedGuesses = [...guesses].sort((a, b) => b.timestamp - a.timestamp);

  let streak = 0;
  for (const guess of sortedGuesses) {
    if (guess.exactMatch) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate heatmap data for time-based performance analysis
 * Minimum 3 guesses per time slot required
 */
export function calculateHeatMapData(
  guesses: Guess[],
  minDataPoints: number = 3
): HeatMapData[] {
  const timeSlots: Record<string, { count: number; successes: number }> = {};

  for (const guess of guesses) {
    const date = new Date(guess.timestamp);
    const hour = date.getHours();
    const day = date.getDay(); // 0-6 (Sunday-Saturday)
    const key = `${day}-${hour}`;

    if (!timeSlots[key]) {
      timeSlots[key] = { count: 0, successes: 0 };
    }

    timeSlots[key].count++;
    if (guess.exactMatch) {
      timeSlots[key].successes++;
    }
  }

  const heatMapData: HeatMapData[] = [];

  for (const [key, data] of Object.entries(timeSlots)) {
    if (data.count >= minDataPoints) {
      const [day, hour] = key.split('-').map(Number);
      const accuracy = (data.successes / data.count) * 100;

      heatMapData.push({
        day,
        hour,
        count: data.count,
        accuracy: Number(accuracy.toFixed(2)),
      });
    }
  }

  return heatMapData;
}

/**
 * Calculate card-specific accuracy
 */
export function calculateCardAccuracy(guesses: Guess[]): CardAccuracy[] {
  const cardStats: Record<string, { attempts: number; successes: number }> = {};

  for (const guess of guesses) {
    const cardKey = `${guess.actualSuit}-${guess.actualNumber || 'suit-only'}`;

    if (!cardStats[cardKey]) {
      cardStats[cardKey] = { attempts: 0, successes: 0 };
    }

    cardStats[cardKey].attempts++;
    if (guess.exactMatch) {
      cardStats[cardKey].successes++;
    }
  }

  return Object.entries(cardStats)
    .map(([cardId, stats]) => {
      // For Zener cards: 'circle-suit-only' -> cardName should be 'circle'
      // For other cards: 'hearts-Ace' -> cardName should be 'Ace of hearts'
      const parts = cardId.split('-');
      const suit = parts[0];
      const number = parts.slice(1).join('-'); // Handle 'suit-only' correctly
      const cardName = number !== 'suit-only' ? `${number} of ${suit}` : suit;

      return {
        cardId,
        cardName,
        attempts: stats.attempts,
        successes: stats.successes,
        accuracy: Number(((stats.successes / stats.attempts) * 100).toFixed(2)),
      };
    })
    .sort((a, b) => b.accuracy - a.accuracy);
}

/**
 * Calculate suit-specific accuracy
 */
export function calculateSuitAccuracy(guesses: Guess[]): SuitAccuracy[] {
  const suitStats: Record<string, { attempts: number; successes: number }> = {};

  for (const guess of guesses) {
    const suit = guess.actualSuit;

    if (!suitStats[suit]) {
      suitStats[suit] = { attempts: 0, successes: 0 };
    }

    suitStats[suit].attempts++;
    if (guess.suitMatch) {
      suitStats[suit].successes++;
    }
  }

  return Object.entries(suitStats)
    .map(([suit, stats]) => ({
      suit,
      attempts: stats.attempts,
      successes: stats.successes,
      accuracy: Number(((stats.successes / stats.attempts) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.accuracy - a.accuracy);
}

/**
 * Calculate number-specific accuracy
 */
export function calculateNumberAccuracy(guesses: Guess[]): NumberAccuracy[] {
  const numberStats: Record<string, { attempts: number; successes: number }> =
    {};

  for (const guess of guesses) {
    if (!guess.actualNumber) continue; // Skip Zener cards

    const number = guess.actualNumber;

    if (!numberStats[number]) {
      numberStats[number] = { attempts: 0, successes: 0 };
    }

    numberStats[number].attempts++;
    if (guess.numberMatch) {
      numberStats[number].successes++;
    }
  }

  return Object.entries(numberStats)
    .map(([number, stats]) => ({
      number,
      attempts: stats.attempts,
      successes: stats.successes,
      accuracy: Number(((stats.successes / stats.attempts) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.accuracy - a.accuracy);
}

/**
 * Calculate progress over time with rolling average
 * @param guesses Array of guesses
 * @param windowSize Number of guesses for rolling average (default 20)
 * @param days Number of days to include (0 = all time)
 */
export function calculateProgressData(
  guesses: Guess[],
  windowSize: number = 20,
  days: number = 0
): ProgressDataPoint[] {
  // Filter by date range if specified
  let filteredGuesses = guesses;
  if (days > 0) {
    const cutoffDate = subDays(new Date(), days).getTime();
    filteredGuesses = guesses.filter((g) => g.timestamp >= cutoffDate);
  }

  // Sort by timestamp
  const sortedGuesses = [...filteredGuesses].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  if (sortedGuesses.length < windowSize) {
    // Not enough data for rolling average, return single point
    if (sortedGuesses.length === 0) return [];

    const exactMatches = sortedGuesses.filter((g) => g.exactMatch).length;
    const accuracy = (exactMatches / sortedGuesses.length) * 100;

    return [
      {
        date: format(
          new Date(sortedGuesses[sortedGuesses.length - 1].timestamp),
          'yyyy-MM-dd'
        ),
        accuracy: Number(accuracy.toFixed(2)),
        guessCount: sortedGuesses.length,
      },
    ];
  }

  const progressData: ProgressDataPoint[] = [];

  // Calculate rolling average for each point
  for (let i = windowSize - 1; i < sortedGuesses.length; i++) {
    const window = sortedGuesses.slice(i - windowSize + 1, i + 1);
    const exactMatches = window.filter((g) => g.exactMatch).length;
    const accuracy = (exactMatches / windowSize) * 100;

    progressData.push({
      date: format(new Date(sortedGuesses[i].timestamp), 'yyyy-MM-dd'),
      accuracy: Number(accuracy.toFixed(2)),
      guessCount: i + 1,
    });
  }

  return progressData;
}

/**
 * Get best performing time slot from heatmap data
 */
export function getBestTimeSlot(
  heatMapData: HeatMapData[]
): { day: number; hour: number; accuracy: number } | null {
  if (heatMapData.length === 0) return null;

  const best = heatMapData.reduce((best, current) =>
    current.accuracy > best.accuracy ? current : best
  );

  return {
    day: best.day,
    hour: best.hour,
    accuracy: best.accuracy,
  };
}

/**
 * Format day number to day name
 */
export function formatDayName(day: number): string {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[day] || 'Unknown';
}

/**
 * Format hour to time string
 */
export function formatTimeSlot(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${ampm}`;
}
