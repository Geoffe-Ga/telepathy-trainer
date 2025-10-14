# Telepathy Practice App - Complete Implementation Prompt

## Project Overview
Build a cross-platform mobile app (iOS + Android) that helps users practice telepathy by guessing cards from various decks and tracking their statistical performance over time. The app must be entirely on-device with no backend dependencies, optimized for passive income with minimal maintenance.

## Tech Stack

### Core Framework
- **React Native** with **Expo** (managed workflow)
- **TypeScript** for type safety
- Target: Expo SDK 51+ (latest stable)

### Dependencies
```json
{
  "expo": "~51.0.0",
  "react": "18.2.0",
  "react-native": "0.74.0",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "zustand": "^4.4.7",
  "expo-sqlite": "~14.0.0",
  "@react-native-async-storage/async-storage": "1.21.0",
  "react-native-chart-kit": "^6.12.0",
  "expo-random": "~14.0.0",
  "react-native-svg": "14.1.0",
  "expo-haptics": "~13.0.0",
  "@expo/vector-icons": "^14.0.0",
  "date-fns": "^3.0.0"
}
```

### Architecture
- **State Management**: Zustand with persist middleware
- **Database**: expo-sqlite for stats, AsyncStorage for preferences
- **Navigation**: React Navigation with bottom tabs
- **Styling**: StyleSheet with theme system
- **Random Number Generation**: expo-random (cryptographically secure)

## Application Structure

```
telepathy-app/
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── screens/
│   │   ├── GuessScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   └── HelpModal.tsx
│   ├── components/
│   │   ├── DeckSelector.tsx
│   │   ├── SuitPicker.tsx
│   │   ├── NumberPicker.tsx
│   │   ├── CardReveal.tsx
│   │   ├── ConcentrationPrompt.tsx
│   │   ├── StatsChart.tsx
│   │   ├── HeatMap.tsx
│   │   └── StatsSummary.tsx
│   ├── store/
│   │   └── useStore.ts
│   ├── database/
│   │   ├── db.ts
│   │   └── queries.ts
│   ├── utils/
│   │   ├── cardData.ts
│   │   ├── randomizer.ts
│   │   └── statsCalculator.ts
│   ├── types/
│   │   └── index.ts
│   ├── constants/
│   │   ├── decks.ts
│   │   ├── theme.ts
│   │   └── helpContent.ts
│   └── hooks/
│       ├── useDatabase.ts
│       └── useStats.ts
```

## Detailed Implementation Requirements

### 1. Data Models & Types

#### TypeScript Types
```typescript
// src/types/index.ts
export type DeckType = 'zener' | 'rws' | 'thoth' | 'playing';

export interface Suit {
  id: string;
  name: string;
  deckType: DeckType;
}

export interface Card {
  id: string;
  suit: string;
  number?: string; // undefined for Zener cards (they only have suits)
  name: string;
  deckType: DeckType;
}

export interface Guess {
  id: string;
  timestamp: number;
  deckType: DeckType;
  guessedSuit: string;
  guessedNumber?: string;
  actualSuit: string;
  actualNumber?: string;
  suitMatch: boolean;
  numberMatch: boolean;
  exactMatch: boolean;
}

export interface DeckStats {
  deckType: DeckType;
  totalGuesses: number;
  exactMatches: number;
  suitMatches: number;
  numberMatches: number;
  accuracy: number;
  suitAccuracy: number;
  numberAccuracy: number;
  bestStreak: number;
  currentStreak: number;
}

export interface HeatMapData {
  hour: number;
  day: number; // 0-6 (Sunday-Saturday)
  count: number;
  accuracy: number;
}
```

#### Database Schema
```sql
-- SQLite tables
CREATE TABLE IF NOT EXISTS guesses (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  deck_type TEXT NOT NULL,
  guessed_suit TEXT NOT NULL,
  guessed_number TEXT,
  actual_suit TEXT NOT NULL,
  actual_number TEXT,
  suit_match INTEGER NOT NULL,
  number_match INTEGER NOT NULL,
  exact_match INTEGER NOT NULL
);

CREATE INDEX idx_timestamp ON guesses(timestamp);
CREATE INDEX idx_deck_type ON guesses(deck_type);
CREATE INDEX idx_exact_match ON guesses(exact_match);
```

### 2. Card Deck Definitions

#### src/constants/decks.ts
Define all four deck types with complete card data:

**Zener Cards** (5 cards, suit-only):
- Circle
- Cross
- Waves
- Square
- Star

**Rider-Waite-Smith Tarot** (78 cards):
- Major Arcana (22 cards): 0. The Fool through XXI. The World
- Minor Arcana (56 cards): 
  - Wands: Ace, Two-Ten, Page, Knight, Queen, King
  - Cups: Ace, Two-Ten, Page, Knight, Queen, King
  - Swords: Ace, Two-Ten, Page, Knight, Queen, King
  - Pentacles: Ace, Two-Ten, Page, Knight, Queen, King

**Thoth Tarot** (78 cards):
- Major Arcana (22 cards): 0. The Fool through XXI. The Aeon
- Minor Arcana (56 cards):
  - Wands: Ace, Two-Ten, Princess, Prince, Queen, Knight
  - Cups: Ace, Two-Ten, Princess, Prince, Queen, Knight
  - Swords: Ace, Two-Ten, Princess, Prince, Queen, Knight
  - Disks: Ace, Two-Ten, Princess, Prince, Queen, Knight

**Playing Cards** (52 cards):
- Hearts: Ace, 2-10, Jack, Queen, King
- Diamonds: Ace, 2-10, Jack, Queen, King
- Clubs: Ace, 2-10, Jack, Queen, King
- Spades: Ace, 2-10, Jack, Queen, King

Export as structured data with helper functions for filtering by deck/suit.

### 3. Cryptographically Secure Randomization

#### src/utils/randomizer.ts
```typescript
import * as Random from 'expo-random';

/**
 * CRITICAL: Use cryptographically secure random number generation
 * to ensure the card draw is truly random and not influenced by
 * the user's guess in any way.
 * 
 * This function must:
 * 1. Use expo-random (crypto.getRandomValues under the hood)
 * 2. Generate random bytes and convert to index
 * 3. Ensure uniform distribution across all cards
 */
export async function getSecureRandomCard(cards: Card[]): Promise<Card> {
  // Implementation using expo-random
  // Generate enough random bytes to avoid modulo bias
}
```

### 4. Screen Implementations

#### Guess Screen Flow (src/screens/GuessScreen.tsx)

**Step 0: Concentration Prompt** (initially visible, can be dismissed)
- Display tips from Mitch Horowitz on effective telepathy practice
- Include practical advice like "caffeine can enhance focus and sensitivity"
- Tips about relaxation, clearing the mind, trusting first impressions
- "I'm ready" button to proceed to Step 1
- Don't show again checkbox (stored in AsyncStorage)

**Step 1: Deck Selection** (top of screen, always visible)
- Four buttons: Zener | RWS | Thoth | Playing Cards
- Selected deck highlighted with theme color
- Smooth transition when changing decks

**Step 2: Suit Selection**
- Grid or list of suit buttons based on selected deck
- Zener: 5 suits (this IS the guess for Zener, skip to Step 4)
- Tarot: 5 suits (Major Arcana + 4 minor suits)
- Playing: 4 suits
- Large, tappable buttons with suit names
- Visual feedback on selection
- Disable "Next" until selection made

**Step 3: Number Selection** (skip for Zener)
- Grid layout of all numbers in selected suit
- Different layouts for Major Arcana (0-21) vs Minor Arcana (Ace-King) vs Playing (Ace-King)
- Scrollable if needed for large sets
- Clear visual selection state
- "Draw Card" button appears when number selected

**Step 4: Draw Card**
- User taps "Draw Card" button
- Brief animation/loading (200ms) for anticipation
- Call cryptographically secure random function
- CRITICAL: Random card selection happens AFTER guess is recorded
- Display drawn card with suit and number
- Show immediate feedback:
  - ✓ Green border for exact match
  - ~ Yellow border for partial match (suit OR number)
  - ✗ Red border for no match
- Save guess to database with timestamp
- Haptic feedback based on result
- "Draw Another Card" button to reset to Step 2 (or Step 1 for Zener)
- Increment streak counter if exact match, reset if no exact match

#### Stats Screen (src/screens/StatsScreen.tsx)

**Deck Filter Selector** (top)
- Tabs or segmented control: All | Zener | RWS | Thoth | Playing
- Shows aggregate stats when "All" selected
- Updates all visualizations when changed

**Stats Sections** (scrollable)

1. **Overview Cards** (top section)
   - Total Guesses
   - Exact Matches (with %)
   - Current Streak / Best Streak
   - Overall Accuracy

2. **Accuracy by Suit** (chart)
   - Bar chart or horizontal bars
   - Show percentage of correct guesses per suit
   - Minimum 5 guesses per suit before showing stats
   - Show "Not enough data" for suits with <5 guesses

3. **Accuracy by Number** (chart)
   - Similar to suit chart
   - Only show for decks with numbers (skip for Zener)
   - Group similar numbers (e.g., all Aces together across suits)

4. **Exact Card Accuracy** (detailed list/grid)
   - Heatmap-style visualization
   - Each card shows: attempts and success rate
   - Sort by: most attempted, highest accuracy, lowest accuracy
   - Color-coded: red (0-20%), yellow (21-40%), green (41%+)

5. **Progress Over Time** (line chart)
   - X-axis: date
   - Y-axis: rolling accuracy (e.g., 20-guess moving average)
   - Show trend line
   - Toggle between: 7 days, 30 days, 90 days, all time

6. **Time-Based Heatmap**
   - 7x24 grid (days of week × hours of day)
   - Color intensity based on:
     - Primary: accuracy during that hour/day
     - Secondary: number of guesses (darker = more data)
   - Show "Most effective time" insight (e.g., "You're most accurate on Tuesday mornings")
   - Minimum 3 guesses per time slot before showing

7. **Highlights Section**
   - "Best performing suit: [Suit Name] at [X]%"
   - "Most challenging card: [Card Name]"
   - "Longest streak: [N] exact matches"
   - "Total practice sessions: [N]"
   - Motivational insights based on data

**Empty State**
- When no guesses recorded: "Start guessing cards to see your stats!"
- Illustration and call-to-action button to Guess screen

### 5. Help Content

#### src/constants/helpContent.ts
Include comprehensive text based on Mitch Horowitz's telepathy research:

**Concentration Tips:**
- Find a quiet space with minimal distractions
- Practice when alert but relaxed (caffeine can help enhance focus)
- Take 3 deep breaths before each guess
- Clear your mind of expectations
- Trust your first impression—don't second-guess
- Visualize the card appearing in your mind's eye
- Notice physical sensations or emotions that arise

**Practice Strategies:**
- Consistency matters more than duration (daily practice is key)
- Start with simpler decks (Zener) before moving to complex ones (Tarot)
- Track patterns in your performance—learn when you're most receptive
- Don't get discouraged by misses—psychic abilities fluctuate
- Some people are better at suits, others at numbers—discover your strength
- Practice in different mental/physical states to find your optimal condition

**Understanding Results:**
- Chance accuracy varies by deck (20% for Zener, 1.3% for 78-card Tarot)
- Results above chance over many trials may indicate developing ability
- Focus on trends over time rather than individual guesses
- Partial matches (suit or number) can indicate "near hits"
- Pay attention to your best times/days—psychic sensitivity varies

### 6. State Management

#### src/store/useStore.ts
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  selectedDeck: DeckType;
  showHelp: boolean;
  showConcentrationPrompt: boolean;
  currentStreak: number;
  setSelectedDeck: (deck: DeckType) => void;
  setShowHelp: (show: boolean) => void;
  setShowConcentrationPrompt: (show: boolean) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

// Use persist middleware for preferences
// Streaks are stored separately in database for accuracy
```

### 7. Database Operations

#### src/database/db.ts & queries.ts
Implement:
- `initDatabase()`: Create tables if not exist
- `saveGuess(guess: Guess)`: Insert guess record
- `getGuessesByDeck(deckType: DeckType)`: Retrieve filtered guesses
- `getAllGuesses()`: Retrieve all guesses
- `getStatsForDeck(deckType: DeckType)`: Calculate DeckStats
- `getHeatMapData(deckType?: DeckType)`: Calculate time-based accuracy
- `getProgressData(deckType: DeckType, days: number)`: Time series data
- `getSuitAccuracy(deckType: DeckType)`: Per-suit stats
- `getNumberAccuracy(deckType: DeckType)`: Per-number stats
- `getCardAccuracy(deckType: DeckType)`: Per-card stats
- `getBestStreak()`: Query for longest exact match streak
- `clearAllData()`: Factory reset function (add to settings)

Use prepared statements and proper indexing for performance.

### 8. UI/UX Design System

#### src/constants/theme.ts
```typescript
export const theme = {
  colors: {
    // Mystical, modern palette
    primary: '#6B4CE6', // Deep purple
    secondary: '#9D7CFF', // Light purple
    accent: '#FF6B9D', // Mystical pink
    background: '#0A0A0F', // Near black
    surface: '#1A1A2E', // Dark blue-gray
    surfaceLight: '#2A2A40',
    text: '#FFFFFF',
    textSecondary: '#A0A0B0',
    success: '#00D9A0', // Teal green
    warning: '#FFB74D', // Amber
    error: '#FF5252', // Red
    border: '#3A3A50',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' },
    h2: { fontSize: 24, fontWeight: '600' },
    h3: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    caption: { fontSize: 14, fontWeight: '400' },
    small: { fontSize: 12, fontWeight: '400' },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 4,
    },
  },
};
```

**Design Principles:**
- Dark theme by default (mystical aesthetic)
- High contrast for accessibility
- Smooth animations (200-300ms)
- Generous touch targets (minimum 44x44pt)
- Responsive to screen sizes (phones and tablets)
- Use gradients sparingly for accent elements
- Subtle glassmorphism effects on cards/modals

### 9. Responsive Design

- Use `Dimensions` and `useWindowDimensions` for responsive layouts
- Breakpoints:
  - Small: < 375pt (older iPhones)
  - Medium: 375-768pt (modern phones)
  - Large: > 768pt (tablets)
- Grid layouts adjust column count based on width
- Font sizes scale slightly on tablets
- Stat charts adapt height/width to screen size
- Safe area insets for notched devices

### 10. Storage Optimization

**Strategy:**
- SQLite for guess history (structured, queryable)
- AsyncStorage only for:
  - Selected deck preference
  - Show/hide concentration prompt flag
  - Theme preferences (future)
- Delete guesses older than 2 years (configurable)
- Compress database periodically (vacuum)
- Estimated storage: ~100KB per 1000 guesses

### 11. Future-Proofing for Sync Feature

**Current Implementation:**
- Generate UUID for each guess (using uuid library)
- Store ISO timestamps (easy to sync)
- No device-specific data in guess records
- Clean data model ready for API export

**Future Backend Prep:**
- Add `synced: boolean` column to schema (set to false by default)
- Add `user_id` field (null for now)
- Design guess data to be POSTable to REST API
- When sync feature added: batch upload unsynced guesses

### 12. Error Handling & Edge Cases

- Network not required (pure offline app)
- Handle database initialization failures gracefully
- Validate all user inputs before saving
- Catch and log crypto random generation errors
- Graceful degradation if stats insufficient
- Handle rapid tap/double-tap scenarios
- Prevent race conditions in guess recording
- Clear error messages in UI (non-technical language)

### 13. Performance Requirements

- App launch: < 2 seconds to interactive
- Card draw: < 300ms from tap to reveal
- Stats screen: < 1 second to render with 10,000 guesses
- Smooth 60fps animations
- Database queries optimized with indexes
- Lazy load stat sections (render as user scrolls)
- Memoize expensive calculations

### 14. Accessibility

- Semantic labels for screen readers
- Minimum 44pt touch targets
- High contrast ratios (WCAG AA)
- Haptic feedback for important actions
- Support dynamic type scaling
- Test with VoiceOver (iOS) and TalkBack (Android)

### 15. App Configuration

#### app.json
```json
{
  "expo": {
    "name": "Telepathy Trainer",
    "slug": "telepathy-trainer",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0A0A0F"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.telepathytrainer"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0A0A0F"
      },
      "package": "com.yourcompany.telepathytrainer"
    },
    "plugins": [
      "expo-sqlite",
      "expo-haptics"
    ]
  }
}
```

### 16. Development Workflow

1. Initialize Expo project: `npx create-expo-app telepathy-trainer --template blank-typescript`
2. Install dependencies
3. Implement in this order:
   - Type definitions
   - Deck constants
   - Database setup
   - Randomizer utility
   - Store setup
   - Navigation structure
   - Components (bottom-up)
   - Screens
   - Polish & testing
4. Test on both iOS and Android simulators
5. Test on physical devices before deployment

### 17. Testing Strategy (for future)

Since you'll add testing in follow-up prompts, ensure code is testable:
- Pure functions in utils (easy to unit test)
- Separate business logic from UI
- Mock database for tests
- Mock expo-random for deterministic tests
- Component tests for critical user flows

### 18. Deployment Considerations

**Expo EAS Build:**
- Production builds for App Store and Google Play
- Internal testing builds with expo-dev-client
- OTA updates for bug fixes (no native code changes)

**App Store Optimization:**
- Keywords: telepathy, ESP, psychic training, Zener cards, tarot practice
- Screenshots showing main features
- Description emphasizing practice and statistics
- Privacy policy (no data collection, fully offline)

**Monetization Prep:**
- Free app, no ads initially (passive income through user growth)
- Future: Optional pro features (export stats, sync, sender/receiver mode)
- Future: Non-intrusive ads or tip jar

## Implementation Checklist

Generate production-ready code with:

- [ ] Complete TypeScript type safety (strict mode)
- [ ] All four deck definitions with accurate card data
- [ ] Cryptographically secure randomization with no bias
- [ ] SQLite database with proper schema and indexes
- [ ] Zustand store with persistence
- [ ] Full navigation structure (tab navigator)
- [ ] All screens implemented per specifications
- [ ] All components with proper prop types
- [ ] Concentration prompt with Mitch Horowitz tips
- [ ] Help modal with comprehensive guidance
- [ ] Complete stats calculations and visualizations
- [ ] Heatmap for time-based performance
- [ ] Progress over time chart
- [ ] Responsive layouts for all screen sizes
- [ ] Dark theme with mystical aesthetic
- [ ] Smooth animations and haptic feedback
- [ ] Error handling throughout
- [ ] Comments explaining complex logic
- [ ] Ready for iOS and Android deployment
- [ ] Storage optimization implemented
- [ ] Future-proofed for sync feature

## Code Quality Standards

- TypeScript strict mode enabled
- ESLint configuration (to be added in follow-up)
- Prettier formatting (to be added in follow-up)
- Meaningful variable and function names
- Clear comments for complex algorithms
- Consistent code style throughout
- No console.logs in production code (use proper logging)
- Proper error boundaries in React components

## Critical Implementation Notes

1. **Random Card Selection**: MUST use expo-random for cryptographic security. The guess must be recorded before the card is drawn, and the guess must have ZERO influence on the random selection. This is essential for statistical validity.

2. **Database Efficiency**: Create indexes on frequently queried columns. Use transactions for batch operations. Vacuum database periodically.

3. **Stats Calculation**: Calculate stats on-demand from raw guess data. Don't store aggregated stats (they can be recalculated). This ensures data integrity.

4. **Zener Card Special Case**: Zener cards only have suits, no numbers. UI flow should skip number selection step. Stats calculations must handle undefined number fields.

5. **Tarot Major Arcana**: Major Arcana has unique numbering (0-21 or I-XXI). Treat as a special "suit" with its own numbers.

6. **Heatmap Data Requirements**: Only show heatmap cells with minimum 3 data points. Show "insufficient data" message otherwise to avoid misleading statistics.

7. **Streak Tracking**: Exact match only. Partial matches don't count. Store in database, not just in-memory.

8. **First Launch Experience**: Show help modal automatically on first app open. Store `hasSeenHelp` flag in AsyncStorage.

## Success Criteria

The generated code should:
- ✅ Build without errors using `expo start`
- ✅ Run on iOS simulator
- ✅ Run on Android emulator
- ✅ Pass TypeScript type checking
- ✅ Store and retrieve guesses correctly
- ✅ Display accurate statistics
- ✅ Provide smooth, intuitive user experience
- ✅ Follow all specifications exactly
- ✅ Be production-ready (not a prototype)
- ✅ Be maintainable and well-documented

## Additional Context

This app is designed for passive income generation with minimal maintenance. The code should be:
- Robust and error-free
- Easy to understand for future updates
- Performant even with thousands of guesses
- Delightful to use (users should want to practice daily)
- Ready for App Store and Google Play submission

The target audience includes:
- People interested in developing psychic abilities
- Tarot enthusiasts wanting to improve intuition
- Casual users curious about telepathy
- Anyone interested in tracking unusual statistics

The app should feel professional, mystical, and modern—not gimmicky or overly complicated.

---

## Prompt for Claude Code CLI

Use this entire document as context when generating the Telepathy Trainer app. Create a complete, production-ready React Native + Expo application following every specification, architectural decision, and implementation detail provided above. Generate all necessary files, components, screens, utilities, and configurations to create a fully functional app that can be deployed to the App Store and Google Play Store.

Priority: Correctness and completeness over brevity. This is production code, not a demo.