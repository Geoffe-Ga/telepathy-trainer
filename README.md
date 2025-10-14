# 🔮 Telepathy Trainer

A cross-platform mobile app for practicing and tracking telepathy skills using multiple card decks. Built with React Native and Expo.

## 📖 Table of Contents

- [About the App](#about-the-app)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Key Concepts](#key-concepts)
- [Development Guide](#development-guide)
- [Building for Production](#building-for-production)
- [Contributing](#contributing)
- [License](#license)

## About the App

Telepathy Trainer helps users develop and measure their intuitive abilities through card guessing exercises. The app provides:

- **Four distinct card decks**: Zener cards, Rider-Waite-Smith Tarot, Thoth Tarot, and standard playing cards
- **Comprehensive statistics**: Track your accuracy by suit, number, exact card, and even time of day
- **Progress tracking**: Visualize your development over time with charts and heatmaps
- **Educational content**: Learn effective telepathy practice techniques from researcher Mitch Horowitz
- **Complete privacy**: All data stored locally on your device with no backend or data collection

### Why This App?

The app was designed with three core principles:

1. **Statistical Integrity**: Uses cryptographically secure randomness to ensure card draws are truly random and independent of user guesses
2. **Meaningful Metrics**: Tracks multiple dimensions of accuracy (exact matches, suit matches, number matches) to identify patterns in intuitive ability
3. **User Experience**: Beautiful, mystical aesthetic combined with smooth, intuitive interactions that encourage daily practice

## Features

### 🎴 Multiple Deck Types

- **Zener Cards** (5 cards): Simple geometric shapes designed specifically for ESP testing
- **Rider-Waite-Smith Tarot** (78 cards): The most popular tarot deck with rich symbolism
- **Thoth Tarot** (78 cards): Aleister Crowley's esoteric deck with unique court card names
- **Playing Cards** (52 cards): Standard deck familiar to everyone

### 📊 Advanced Statistics

- **Overview Metrics**: Total guesses, accuracy percentages, current and best streaks
- **Suit & Number Accuracy**: Identify which categories you're most accurate with
- **Card-Level Details**: See your performance on every individual card
- **Time-Based Heatmap**: Discover when you're most intuitive (day of week × hour of day)
- **Progress Charts**: Track your accuracy improvement over time with configurable date ranges
- **Smart Insights**: Automated highlights like "Most accurate on Tuesday mornings" or "Best performing suit: Cups"

### 🧠 Practice Tools

- **Concentration Prompts**: Pre-guess meditation tips based on research
- **Help System**: Comprehensive guide to effective telepathy practice
- **Haptic Feedback**: Immediate physical feedback on guess accuracy
- **Streak Tracking**: Build momentum with consecutive exact matches

### 🔒 Privacy & Offline-First

- **100% On-Device**: All data stored locally using SQLite and AsyncStorage
- **No Network Required**: Works completely offline
- **No Data Collection**: Your practice sessions are private
- **Future-Ready**: Database designed to enable optional cloud sync in future versions

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**: Latest version
- **Expo CLI**: Installed globally (`npm install -g expo-cli`)
- **iOS Simulator** (Mac only) or **Android Emulator**: For testing

### Installation

1. **Clone the repository**
   ```bash
   git clone REPLACEME_REPO_URL
   cd telepathy-trainer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

### Quick Start Guide

Once the app is running:

1. **First Launch**: Read the help modal explaining telepathy practice techniques
2. **Choose a Deck**: Start with Zener cards (simplest) to learn the flow
3. **Make a Guess**: Select a suit (and number if applicable)
4. **Draw the Card**: See if your intuition was correct
5. **Review Stats**: After 10+ guesses, explore your statistics
6. **Find Patterns**: Use the heatmap to discover your most intuitive times

## Project Structure

```
telepathy-trainer/
│
├── App.tsx                      # Root component, initializes navigation
├── app.json                     # Expo configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
│
├── assets/                      # REPLACEME: Images, icons, splash screens
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
│
└── src/                         # All source code
    │
    ├── navigation/              # Navigation setup
    │   └── AppNavigator.tsx    # Tab navigation between Guess/Stats screens
    │
    ├── screens/                 # Main app screens (full-page components)
    │   ├── GuessScreen.tsx     # Card guessing interface with multi-step flow
    │   ├── StatsScreen.tsx     # Statistics dashboard with charts
    │   └── HelpModal.tsx       # Educational content about telepathy practice
    │
    ├── components/              # Reusable UI components
    │   ├── DeckSelector.tsx    # Four-button deck chooser
    │   ├── SuitPicker.tsx      # Grid of suit selection buttons
    │   ├── NumberPicker.tsx    # Grid of number selection buttons
    │   ├── CardReveal.tsx      # Animated card reveal with match feedback
    │   ├── ConcentrationPrompt.tsx  # Pre-guess meditation tips
    │   ├── StatsChart.tsx      # Reusable chart wrapper for various visualizations
    │   ├── HeatMap.tsx         # 7x24 time-based accuracy visualization
    │   └── StatsSummary.tsx    # Overview cards showing key metrics
    │
    ├── store/                   # Global state management
    │   └── useStore.ts         # Zustand store (selected deck, preferences, UI state)
    │
    ├── database/                # SQLite database layer
    │   ├── db.ts               # Database initialization and connection
    │   └── queries.ts          # SQL queries and data access functions
    │
    ├── utils/                   # Pure utility functions
    │   ├── cardData.ts         # Card deck definitions and filtering helpers
    │   ├── randomizer.ts       # Cryptographically secure random card selection
    │   └── statsCalculator.ts  # Statistical calculations (accuracy, streaks, etc.)
    │
    ├── types/                   # TypeScript type definitions
    │   └── index.ts            # Shared types (DeckType, Card, Guess, Stats, etc.)
    │
    ├── constants/               # Static data and configuration
    │   ├── decks.ts            # Complete card data for all four decks
    │   ├── theme.ts            # Design system (colors, spacing, typography)
    │   └── helpContent.ts      # Educational text content
    │
    └── hooks/                   # Custom React hooks
        ├── useDatabase.ts      # Hook for database operations with loading states
        └── useStats.ts         # Hook for computed statistics with memoization
```

### Directory Purpose Guide

| Directory | Purpose | Key Concepts |
|-----------|---------|--------------|
| **screens/** | Complete views that fill the device screen. Each screen represents a tab in the navigation. | Think of screens as "pages" in your app |
| **components/** | Reusable UI pieces that compose into screens. Each should be self-contained with clear props. | Components are like LEGO blocks - small, reusable, composable |
| **store/** | Global state shared across the app (selected deck, preferences). Local state stays in components. | Only put truly global data here; most state should be local |
| **database/** | All SQLite interactions isolated here. Screens/components never write SQL directly. | Separation of concerns - UI doesn't know about SQL syntax |
| **utils/** | Pure functions with no side effects. Given the same inputs, always returns same output. | Easy to test and reason about |
| **hooks/** | Reusable stateful logic that can be shared across components. Encapsulates complex operations. | Custom hooks make components cleaner |
| **constants/** | Data that never changes at runtime. Extracted for easy maintenance and reuse. | Single source of truth for static data |
| **types/** | TypeScript definitions that ensure type safety across the codebase. | Catch bugs at compile-time instead of runtime |

## Architecture Overview

### Tech Stack Rationale

#### React Native + Expo
- **Why**: Cross-platform development (iOS + Android from single codebase)
- **Learning**: Expo simplifies native features (SQLite, haptics, random generation) without ejecting
- **Trade-off**: Slightly larger app size, but much faster development and easier maintenance

#### TypeScript
- **Why**: Catch errors during development instead of in production
- **Learning**: Strong typing helps IDEs provide better autocomplete and documentation
- **Trade-off**: Slightly more verbose, but dramatically reduces bugs

#### Zustand (State Management)
- **Why**: Much simpler than Redux but still powerful
- **Learning**: Uses React hooks pattern you already know - no actions, reducers, or middleware to learn
- **Trade-off**: Less ecosystem/tooling than Redux, but perfect for apps of this size

#### SQLite (Database)
- **Why**: Structured queries, indexes for fast lookups, handles thousands of records efficiently
- **Learning**: SQL is a valuable skill that transfers to backend development
- **Trade-off**: More complex than AsyncStorage, but necessary for complex statistics

#### React Navigation
- **Why**: Industry standard, well-maintained, excellent TypeScript support
- **Learning**: Declarative navigation - define structure, library handles transitions
- **Trade-off**: Slightly heavy, but most battle-tested solution

### Data Flow

```
User Action (tap button)
    ↓
Component Handler
    ↓
┌─────────────────────────┐
│  Store Update (Zustand) │  ← For UI state (selected deck, preferences)
└─────────────────────────┘
    ↓
Database Operation (SQLite) ← For persistent data (guesses, stats)
    ↓
Query Results
    ↓
Statistics Calculation
    ↓
Component Re-render
    ↓
Updated UI
```

### Key Architecture Decisions

#### 1. Database-First Statistics
**Decision**: Calculate all statistics on-demand from raw guess data, never store aggregated stats.

**Why**: 
- Single source of truth (raw guesses)
- Easy to add new stat types without migrating data
- Ensures data integrity

**Trade-off**: Slightly more computation, but with indexes it's still fast even with 10,000+ records.

#### 2. Cryptographically Secure Randomness
**Decision**: Use `expo-random` (wraps `crypto.getRandomValues`) for all card draws.

**Why**:
- Statistical validity requires true randomness
- User's guess must have zero influence on the draw
- Standard `Math.random()` is not suitable for this use case

**Code Example**:
```typescript
// ❌ WRONG: Not secure enough for this use case
const randomIndex = Math.floor(Math.random() * cards.length);

// ✅ CORRECT: Cryptographically secure
const randomBytes = await Random.getRandomBytesAsync(4);
const randomIndex = new Uint32Array(randomBytes.buffer)[0] % cards.length;
```

#### 3. Separation of Concerns
**Decision**: Strict separation between UI (components), business logic (utils), and data (database).

**Why**:
- Easy to test business logic without rendering components
- Can swap out database implementation without touching UI
- Multiple components can reuse same logic

**Example**:
```typescript
// ❌ BAD: Business logic mixed with UI
function GuessScreen() {
  const handleGuess = () => {
    const correct = guess.suit === actual.suit && guess.number === actual.number;
    const accuracy = (correctGuesses / totalGuesses) * 100;
    // ... more calculations in component
  }
}

// ✅ GOOD: Business logic extracted
function GuessScreen() {
  const { saveGuess } = useDatabase();
  const { calculateAccuracy } = useStats();
  
  const handleGuess = () => {
    saveGuess(guessData);
  }
}
```

## Key Concepts

### Understanding the Guess Flow

The app follows a strict sequence to ensure statistical integrity:

1. **User makes guess** → Guess data stored in memory (not yet saved)
2. **User taps "Draw Card"** → Guess is saved to database with timestamp
3. **Card is randomly selected** → Uses crypto-secure randomness, completely independent of guess
4. **Match detection** → Compare guess to drawn card, calculate matches
5. **Results saved** → Update database with match results and display to user

**Critical**: The random card selection happens AFTER the guess is committed. This prevents any possibility of the guess influencing the randomness.

### Statistics Calculations

#### Match Types
- **Exact Match**: Both suit and number match (Zener: just suit)
- **Suit Match**: Suit matches but number doesn't
- **Number Match**: Number matches but suit doesn't
- **No Match**: Neither suit nor number match

#### Accuracy Metrics
```typescript
// Overall accuracy (exact matches only)
accuracy = (exactMatches / totalGuesses) * 100

// Suit accuracy (includes both exact and suit-only matches)
suitAccuracy = ((exactMatches + suitOnlyMatches) / totalGuesses) * 100

// Number accuracy (includes both exact and number-only matches)  
numberAccuracy = ((exactMatches + numberOnlyMatches) / totalGuesses) * 100
```

#### Chance Baselines
Understanding chance helps interpret results:
- **Zener**: 20% (1 in 5 cards)
- **Playing Cards**: ~1.9% exact match (1 in 52)
- **Tarot (RWS/Thoth)**: ~1.3% exact match (1 in 78)
- **Suit-only** (Playing): 25% (1 in 4)
- **Suit-only** (Tarot): 20% (1 in 5, treating Major Arcana as a suit)

### State Management Strategy

#### Zustand Store (Global State)
Use for:
- User preferences (selected deck, show/hide prompts)
- Current UI state (which screen, modal visibility)
- Data that multiple screens need

#### Component State (Local State)
Use for:
- Form inputs (current guess)
- UI toggles (expanded/collapsed sections)
- Data used by only one component

#### Database (Persistent State)
Use for:
- Historical data (all guesses)
- Data that survives app restarts
- Data that needs to be queried/filtered

**Rule of Thumb**: Start with local state, lift to Zustand when multiple components need it, persist to database when it should survive restarts.

### Database Design

#### Why SQLite?
- **Queries**: "Show me all guesses from Tuesday mornings" - SQL makes this easy
- **Indexes**: Fast lookups even with thousands of records
- **Relationships**: Can expand to linked tables if adding multiplayer features
- **Standards**: SQL skills transfer to backend development

#### Table Design Philosophy
```sql
-- Simple, flat structure - easy to query
CREATE TABLE guesses (
  id TEXT PRIMARY KEY,              -- UUID for future sync
  timestamp INTEGER NOT NULL,       -- Unix timestamp in milliseconds
  deck_type TEXT NOT NULL,          -- 'zener' | 'rws' | 'thoth' | 'playing'
  guessed_suit TEXT NOT NULL,       -- What user guessed
  guessed_number TEXT,              -- NULL for Zener cards
  actual_suit TEXT NOT NULL,        -- What was actually drawn
  actual_number TEXT,               -- NULL for Zener cards
  suit_match INTEGER NOT NULL,      -- Boolean as 0/1
  number_match INTEGER NOT NULL,    -- Boolean as 0/1
  exact_match INTEGER NOT NULL      -- Boolean as 0/1
);
```

**Design Choices**:
- Store both guess and actual (enables future analysis like "near misses")
- Pre-calculate match booleans (small storage cost, big query speedup)
- Integer timestamps (smaller than ISO strings, easy to query by date ranges)
- Nullable number fields (handles Zener cards elegantly)

### Cryptographic Randomness Deep Dive

**Why It Matters**: 
In telepathy testing, any bias in randomness invalidates results. Standard `Math.random()` uses a pseudo-random number generator (PRNG) that:
- Can be predicted if you know the seed
- May have statistical biases
- Is not suitable for security or statistical testing

**Our Solution**:
```typescript
export async function getSecureRandomCard<T>(items: T[]): Promise<T> {
  // Generate 4 bytes (32 bits) of cryptographically secure random data
  const randomBytes = await Random.getRandomBytesAsync(4);
  
  // Convert to unsigned 32-bit integer
  const randomValue = new Uint32Array(randomBytes.buffer)[0];
  
  // Use modulo to map to array index
  // Note: Technically introduces tiny bias for non-power-of-2 lengths,
  // but negligible for our use case (bias < 0.0001%)
  const index = randomValue % items.length;
  
  return items[index];
}
```

**Learning Points**:
- `crypto.getRandomValues()` uses OS-level entropy (mouse movements, network timing, etc.)
- Always generate enough random bytes to avoid pattern analysis
- Modulo bias is acceptable for small arrays (< 1000 items)
- For critical applications, use rejection sampling to eliminate all bias

## Development Guide

### Running the App

```bash
# Start development server
npx expo start

# Run on iOS simulator (Mac only)
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Clear cache if you encounter issues
npx expo start -c
```

### Project Scripts

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate test coverage report
npm test -- --coverage

# Run pre-commit checks
pre-commit run --all-files
```

### Common Development Tasks

#### Adding a New Card Deck

1. **Define card data** in `src/constants/decks.ts`:
   ```typescript
   export const MY_DECK: Card[] = [
     { id: 'my-deck-card-1', suit: 'Suit1', number: '1', name: 'Card Name', deckType: 'mydeck' },
     // ... more cards
   ];
   ```

2. **Update types** in `src/types/index.ts`:
   ```typescript
   export type DeckType = 'zener' | 'rws' | 'thoth' | 'playing' | 'mydeck';
   ```

3. **Add to deck selector** in `src/components/DeckSelector.tsx`

4. **Update database queries** to handle the new deck type

5. **Write tests** for the new deck

#### Adding a New Statistic

1. **Add query function** in `src/database/queries.ts`:
   ```typescript
   export async function getMyNewStat(deckType: DeckType): Promise<number> {
     const db = await getDatabase();
     // SQL query here
   }
   ```

2. **Add to stats calculator** in `src/utils/statsCalculator.ts` if complex calculation needed

3. **Create visualization component** in `src/components/`

4. **Add to stats screen** in `src/screens/StatsScreen.tsx`

5. **Write tests** for the new statistic

#### Debugging Database Issues

```typescript
// Add to any component to inspect database
import { getDatabase } from '../database/db';

const debugDatabase = async () => {
  const db = await getDatabase();
  const result = await db.getAllAsync('SELECT * FROM guesses LIMIT 10');
  console.log('Recent guesses:', result);
};
```

**Useful SQL Commands**:
```sql
-- Count total guesses
SELECT COUNT(*) FROM guesses;

-- View recent guesses
SELECT * FROM guesses ORDER BY timestamp DESC LIMIT 10;

-- Check accuracy by deck
SELECT deck_type, 
       AVG(exact_match) * 100 as accuracy 
FROM guesses 
GROUP BY deck_type;

-- Find best streak
SELECT COUNT(*) as streak 
FROM (
  SELECT exact_match, 
         ROW_NUMBER() OVER (ORDER BY timestamp) - 
         ROW_NUMBER() OVER (PARTITION BY exact_match ORDER BY timestamp) as grp
  FROM guesses
)
WHERE exact_match = 1
GROUP BY grp
ORDER BY streak DESC
LIMIT 1;
```

### Performance Optimization Tips

1. **Memoize expensive calculations**:
   ```typescript
   const stats = useMemo(() => calculateStats(guesses), [guesses]);
   ```

2. **Use indexes for common queries**:
   ```sql
   CREATE INDEX idx_deck_timestamp ON guesses(deck_type, timestamp);
   ```

3. **Lazy load stats sections**: Only calculate when user scrolls to that section

4. **Batch database operations**: Use transactions for multiple inserts

5. **Limit query results**: Use `LIMIT` clause, paginate if needed

### Testing Approach

#### Unit Tests (Utils)
```typescript
// Example: Testing stats calculator
describe('calculateAccuracy', () => {
  it('returns 50% for half correct guesses', () => {
    const guesses = [
      { exactMatch: true },
      { exactMatch: false }
    ];
    expect(calculateAccuracy(guesses)).toBe(50);
  });
});
```

#### Integration Tests (Database)
```typescript
// Example: Testing database operations
describe('saveGuess', () => {
  it('saves guess and retrieves correctly', async () => {
    await saveGuess(mockGuess);
    const guesses = await getAllGuesses();
    expect(guesses).toContainEqual(mockGuess);
  });
});
```

#### Component Tests (UI)
```typescript
// Example: Testing DeckSelector
describe('DeckSelector', () => {
  it('calls onSelect when deck button pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(<DeckSelector onSelect={onSelect} />);
    fireEvent.press(getByText('Zener'));
    expect(onSelect).toHaveBeenCalledWith('zener');
  });
});
```

## Building for Production

### Prerequisites

1. **Expo Account**: Sign up at https://expo.dev
2. **EAS CLI**: Install with `npm install -g eas-cli`
3. **Apple Developer Account**: For iOS builds ($99/year)
4. **Google Play Console Account**: For Android builds ($25 one-time)

### Build Commands

```bash
# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Build for both platforms
eas build --platform all --profile production

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### Pre-Launch Checklist

- [ ] Test on physical iOS device
- [ ] Test on physical Android device  
- [ ] Verify all stats calculations are correct
- [ ] Test with 100+ guesses for performance
- [ ] Verify database doesn't grow too large
- [ ] Test on small screen (iPhone SE) and large screen (iPad)
- [ ] Ensure all text is readable
- [ ] Verify haptic feedback works
- [ ] Test offline functionality
- [ ] Create app store screenshots (required sizes)
- [ ] Write app description and keywords
- [ ] Create privacy policy (even though we don't collect data, stores require it)
- [ ] Set up analytics (optional, but useful for understanding usage)

### App Store Optimization

**Keywords** (for discovery):
- Primary: telepathy, ESP, psychic, intuition
- Secondary: Zener cards, tarot practice, mental training
- Tertiary: card reading, divination, statistics

**Description Template**:
```
Develop your intuitive abilities with Telepathy Trainer - a beautifully designed app for practicing and tracking ESP skills.

🎴 FOUR CARD DECKS
• Zener Cards - Classic ESP testing
• Tarot Decks - RWS & Thoth systems  
• Playing Cards - Familiar and accessible

📊 COMPREHENSIVE STATISTICS
• Track accuracy by suit, number, and individual card
• Discover your most intuitive times with heatmap analysis
• Watch your abilities develop over time with progress charts

🔒 COMPLETELY PRIVATE
• All data stored locally on your device
• No account required
• No ads or data collection

Based on research from Mitch Horowitz and decades of parapsychology studies.
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of conduct
- Development workflow
- Coding standards
- Pull request process
- How to report bugs
- Feature request guidelines

## Learning Resources

### For React Native Beginners
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation Tutorial](https://reactnavigation.org/docs/getting-started)

### For TypeScript Learners
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### For Database/SQL
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [SQL Teaching](https://www.sqlteaching.com/) - Interactive SQL course

### For Telepathy/ESP
- *The Miracle Club* by Mitch Horowitz - Practical guide to thought power
- *Mindreach* by Russell Targ & Harold Puthoff - Remote viewing research
- *The Conscious Universe* by Dean Radin - Statistical analysis of psi phenomena

## License

REPLACEME_LICENSE_TYPE - see [LICENSE](LICENSE) file for details.

---

## Questions?

- **Bug Reports**: Open an issue with detailed description and steps to reproduce
- **Feature Requests**: Open an issue with use case and proposed implementation  
- **General Questions**: Check existing issues or start a discussion

Built with ❤️ for the intuitive arts community.
