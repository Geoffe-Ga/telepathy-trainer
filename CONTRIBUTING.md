# Contributing to Telepathy Trainer

Thank you for your interest in contributing to Telepathy Trainer! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Project Structure](#project-structure)
- [Development Philosophy](#development-philosophy)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race or ethnicity
- Age
- Religion or lack thereof
- Technical choices

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members
- Helping newcomers learn and grow

**Unacceptable behaviors include:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Instances of unacceptable behavior may be reported to the project maintainers at REPLACEME_EMAIL. All complaints will be reviewed and investigated promptly and fairly. Project maintainers are obligated to maintain confidentiality with regard to the reporter of an incident.

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher
- **npm** or **yarn** latest version
- **Git** for version control
- **Code editor** (VS Code recommended with React Native Tools extension)
- **Expo CLI** installed globally: `npm install -g expo-cli`
- **iOS Simulator** (Mac only) or **Android Emulator**

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone REPLACEME_YOUR_FORK_URL
   cd telepathy-trainer
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream REPLACEME_ORIGINAL_REPO_URL
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Verify setup**:
   ```bash
   npm run type-check
   npm test
   npx expo start
   ```

### Development Environment Setup

1. **Install pre-commit hooks**:
   ```bash
   pip install pre-commit
   pre-commit install
   ```

2. **Configure your editor**:
   - Install ESLint extension
   - Install Prettier extension
   - Enable "Format on Save"
   - Set TypeScript as default formatter

3. **Verify everything works**:
   ```bash
   pre-commit run --all-files
   ```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features (e.g., `feature/add-custom-deck`)
- `fix/` - Bug fixes (e.g., `fix/stats-calculation-error`)
- `docs/` - Documentation only (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/extract-card-logic`)
- `test/` - Adding or updating tests (e.g., `test/database-queries`)
- `perf/` - Performance improvements (e.g., `perf/optimize-heatmap`)

### 2. Make Your Changes

Follow the [Coding Standards](#coding-standards) section below.

**Key principles:**
- Write tests first (TDD)
- Keep changes focused and atomic
- Update documentation as you go
- Follow existing code patterns
- Comment complex logic

### 3. Test Your Changes

Run the full test suite before committing:

```bash
# Type check
npm run type-check

# Run linter
npm run lint

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Test on simulators
npx expo start
# Press 'i' for iOS, 'a' for Android
```

**Testing checklist:**
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Test coverage maintained or improved
- [ ] Manual testing on both iOS and Android
- [ ] Edge cases covered

### 4. Commit Your Changes

Follow our [Commit Guidelines](#commit-guidelines):

```bash
# Stage your changes
git add .

# Commit with conventional commit message
git commit -m "feat: add custom deck support"

# Pre-commit hooks will run automatically
```

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
# Follow the PR template
```

## Coding Standards

### TypeScript

**Type Safety:**
```typescript
// ✅ GOOD: Explicit types
interface CardProps {
  suit: string;
  number?: string;
  onPress: (cardId: string) => void;
}

function Card({ suit, number, onPress }: CardProps) {
  // ...
}

// ❌ BAD: Implicit any
function Card(props) {
  // ...
}
```

**No `any` types without justification:**
```typescript
// ❌ BAD: Lazy any
const data: any = await fetchData();

// ✅ GOOD: Proper typing
interface ApiResponse {
  guesses: Guess[];
  stats: Stats;
}
const data: ApiResponse = await fetchData();

// ✅ ACCEPTABLE: With comment explaining why
// Using any here because third-party library has no types
const chart: any = createChart(options);
```

**Prefer `type` over `interface` for unions:**
```typescript
// ✅ GOOD
type DeckType = 'zener' | 'rws' | 'thoth' | 'playing';

// ❌ BAD: Can't use interface for unions
interface DeckType {
  // ...
}
```

### React Native Components

**Functional components only:**
```typescript
// ✅ GOOD
export function DeckSelector({ onSelect }: DeckSelectorProps) {
  const [selected, setSelected] = useState<DeckType>('zener');
  // ...
}

// ❌ BAD: Class components not allowed
export class DeckSelector extends Component {
  // ...
}
```

**Proper memoization:**
```typescript
// ✅ GOOD: Memoize expensive calculations
const stats = useMemo(() => {
  return calculateComplexStats(guesses);
}, [guesses]);

// ✅ GOOD: Memoize callbacks
const handlePress = useCallback(() => {
  saveGuess(guessData);
}, [guessData]);

// ❌ BAD: Inline functions in JSX (re-renders)
<Button onPress={() => saveGuess(guessData)} />
```

**Clean useEffect:**
```typescript
// ✅ GOOD: Proper cleanup
useEffect(() => {
  const subscription = eventEmitter.addListener('guess', handleGuess);
  
  return () => {
    subscription.remove(); // Cleanup
  };
}, [handleGuess]);

// ❌ BAD: No cleanup
useEffect(() => {
  eventEmitter.addListener('guess', handleGuess);
  // Memory leak!
}, []);
```

### File Organization

**One component per file:**
```
// ✅ GOOD
DeckSelector.tsx
DeckSelector.test.tsx

// ❌ BAD: Multiple components in one file
Components.tsx (containing DeckSelector, SuitPicker, etc.)
```

**Import order:**
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. External libraries
import { useNavigation } from '@react-navigation/native';

// 3. Internal modules
import { useDatabase } from '../hooks/useDatabase';
import { calculateAccuracy } from '../utils/statsCalculator';

// 4. Types
import type { DeckType, Card } from '../types';

// 5. Styles (if separate)
import { styles } from './DeckSelector.styles';
```

**Export conventions:**
```typescript
// ✅ GOOD: Named exports for components
export function DeckSelector() { }

// ✅ GOOD: Default export for screens
export default function GuessScreen() { }

// ❌ BAD: Mixing both unnecessarily
export function DeckSelector() { }
export default DeckSelector;
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `DeckSelector`, `CardReveal` |
| Functions | camelCase | `calculateAccuracy`, `getRandomCard` |
| Hooks | camelCase with `use` prefix | `useDatabase`, `useStats` |
| Constants | UPPER_SNAKE_CASE | `MAX_GUESSES`, `DEFAULT_DECK` |
| Types/Interfaces | PascalCase | `DeckType`, `GuessData` |
| Files (components) | PascalCase | `DeckSelector.tsx` |
| Files (utils) | camelCase | `randomizer.ts`, `statsCalculator.ts` |

### Comments and Documentation

**JSDoc for public functions:**
```typescript
/**
 * Calculates accuracy percentage from guess data
 * @param guesses - Array of guess records
 * @param matchType - Type of match to calculate ('exact' | 'suit' | 'number')
 * @returns Accuracy as percentage (0-100)
 */
export function calculateAccuracy(
  guesses: Guess[],
  matchType: MatchType = 'exact'
): number {
  // Implementation
}
```

**Explain "why", not "what":**
```typescript
// ✅ GOOD: Explains reasoning
// Using crypto random to ensure statistical validity
// Math.random() is not suitable for telepathy testing
const randomBytes = await Random.getRandomBytesAsync(4);

// ❌ BAD: States the obvious
// Get random bytes
const randomBytes = await Random.getRandomBytesAsync(4);
```

**TODOs must be actionable:**
```typescript
// ✅ GOOD: Actionable with context
// TODO: Add pagination when guess count > 1000 (Issue #42)

// ❌ BAD: Vague and unactionable
// TODO: Make this better
```

### Performance Guidelines

**Avoid unnecessary re-renders:**
```typescript
// ✅ GOOD: Memoized to prevent re-render
const StatsCard = React.memo(({ stats }: StatsCardProps) => {
  return <View>{/* ... */}</View>;
});

// ❌ BAD: Re-renders on every parent render
const StatsCard = ({ stats }: StatsCardProps) => {
  return <View>{/* ... */}</View>;
};
```

**Lazy load heavy components:**
```typescript
// ✅ GOOD: Lazy load chart library
const HeatMap = React.lazy(() => import('./HeatMap'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <HeatMap data={heatmapData} />
</Suspense>
```

**Optimize database queries:**
```typescript
// ✅ GOOD: Use indexes and limit results
const query = `
  SELECT * FROM guesses
  WHERE deck_type = ? AND timestamp > ?
  ORDER BY timestamp DESC
  LIMIT 100
`;

// ❌ BAD: No indexes, no limits
const query = `SELECT * FROM guesses`;
```

## Testing Requirements

### Test Coverage Thresholds

Your contribution must maintain or improve these coverage levels:

- **Overall**: 80% minimum
- **Utilities**: 100% required
- **Database queries**: 95% minimum
- **Components**: 70% minimum
- **Critical paths**: 100% required (randomization, stats calculations)

### Test-Driven Development (TDD)

**Write tests first:**

```typescript
// 1. Write failing test
describe('calculateAccuracy', () => {
  it('returns 50% for half correct guesses', () => {
    const guesses = [
      { exactMatch: true },
      { exactMatch: false }
    ];
    expect(calculateAccuracy(guesses)).toBe(50);
  });
});

// 2. Run test (should fail)
// 3. Implement function
// 4. Run test (should pass)
// 5. Refactor if needed
```

### Test Types

**Unit Tests (utils, calculators):**
```typescript
describe('getSecureRandomCard', () => {
  it('returns a card from the provided array', async () => {
    const cards = [card1, card2, card3];
    const result = await getSecureRandomCard(cards);
    expect(cards).toContain(result);
  });

  it('uses cryptographically secure random', async () => {
    // Mock expo-random
    const mockRandom = jest.spyOn(Random, 'getRandomBytesAsync');
    await getSecureRandomCard(cards);
    expect(mockRandom).toHaveBeenCalled();
  });
});
```

**Integration Tests (database):**
```typescript
describe('Database Integration', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it('saves and retrieves guess correctly', async () => {
    const guess = createMockGuess();
    await saveGuess(guess);
    
    const retrieved = await getGuessById(guess.id);
    expect(retrieved).toEqual(guess);
  });
});
```

**Component Tests (React Native):**
```typescript
describe('DeckSelector', () => {
  it('renders all four deck options', () => {
    const { getByText } = render(<DeckSelector onSelect={jest.fn()} />);
    expect(getByText('Zener')).toBeTruthy();
    expect(getByText('RWS')).toBeTruthy();
    expect(getByText('Thoth')).toBeTruthy();
    expect(getByText('Playing')).toBeTruthy();
  });

  it('calls onSelect with correct deck type', () => {
    const onSelect = jest.fn();
    const { getByText } = render(<DeckSelector onSelect={onSelect} />);
    
    fireEvent.press(getByText('Zener'));
    expect(onSelect).toHaveBeenCalledWith('zener');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (during development)
npm test -- --watch

# Single file
npm test -- DeckSelector.test.tsx

# With coverage
npm test -- --coverage

# Update snapshots
npm test -- -u
```

## Commit Guidelines

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear, semantic commit messages.

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature change or bug fix)
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling

**Examples:**

```bash
# Simple feature
git commit -m "feat: add Thoth tarot deck support"

# Bug fix with scope
git commit -m "fix(database): correct streak calculation query"

# Breaking change
git commit -m "feat!: change stats API to async"

# With body and footer
git commit -m "feat: add heatmap visualization

Implements time-based accuracy heatmap showing performance
by day of week and hour of day.

Closes #23"
```

**Rules:**
- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line ≤ 72 characters
- Reference issues in footer (Closes #123, Fixes #456)
- Break lines at 72 characters in body

### Atomic Commits

Each commit should be:
- **Self-contained**: One logical change
- **Reversible**: Can be reverted without breaking things
- **Buildable**: Code compiles and tests pass at each commit

```bash
# ✅ GOOD: Atomic commits
git commit -m "feat: add Card interface to types"
git commit -m "feat: implement getRandomCard function"
git commit -m "test: add tests for getRandomCard"

# ❌ BAD: Too much in one commit
git commit -m "add cards, fix bugs, update docs"
```

## Pull Request Process

### Before Submitting

Ensure your PR meets these requirements:

- [ ] Code follows all coding standards
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Linter passes (`npm run lint`)
- [ ] Pre-commit hooks pass (`pre-commit run --all-files`)
- [ ] Test coverage maintained or improved
- [ ] Documentation updated (if applicable)
- [ ] Tested on both iOS and Android simulators
- [ ] Branch is up to date with main
- [ ] Commit messages follow conventional commits

### PR Title

Use the same format as commit messages:

```
feat: add custom deck support
fix(stats): correct heatmap calculation
docs: update contributing guidelines
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does and why.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Closes #123
Relates to #456

## How Has This Been Tested?
Describe the tests you ran and on which devices:
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing on iOS simulator
- [ ] Manual testing on Android emulator
- [ ] Manual testing on physical device (specify: ___)

## Screenshots (if applicable)
Add screenshots or screen recordings showing the change.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

### Review Process

1. **Automated Checks**: CI must pass (builds, lints, tests)
2. **Code Review**: At least one maintainer approval required
3. **Address Feedback**: Respond to all comments
4. **Final Approval**: Maintainer approves and merges

**Response time expectations:**
- Initial review: Within 2-3 business days
- Follow-up reviews: Within 1-2 business days
- Emergency fixes: Within 24 hours

### After Approval

Maintainers will merge using **Squash and Merge** to keep main branch history clean.

## Issue Guidelines

### Before Opening an Issue

1. **Search existing issues** to avoid duplicates
2. **Check documentation** - maybe it's already answered
3. **Try latest version** - bug might be fixed
4. **Prepare minimal reproduction** - makes fixing easier

### Bug Reports

Use this template:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Tap on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - Device: [e.g. iPhone 13]
 - OS: [e.g. iOS 16.2]
 - App Version: [e.g. 1.2.0]
 - Expo SDK: [e.g. 51.0.0]

**Additional context**
Any other relevant information.

**Possible Solution (optional)**
If you have ideas on how to fix it.
```

### Feature Requests

Use this template:

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Mockups, examples from other apps, etc.

**Would you be willing to implement this?**
[ ] Yes, I can submit a PR
[ ] No, but I can help with testing
[ ] No, just requesting
```

### Issue Labels

Maintainers will add labels:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `wontfix` - This will not be worked on
- `duplicate` - This issue already exists
- `priority: high` - Should be addressed soon
- `priority: low` - Not urgent

## Project Structure

Understanding the project structure helps you contribute more effectively:

```
telepathy-trainer/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/       # Top-level screen components
│   ├── navigation/    # Navigation configuration
│   ├── store/         # Zustand global state
│   ├── database/      # SQLite operations
│   ├── utils/         # Pure utility functions
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   └── constants/     # Static data and configuration
├── assets/            # Images, fonts, splash screens
├── docs/              # Additional documentation
├── .github/           # GitHub workflows and templates
└── scripts/           # Build and automation scripts
```

**Where to add your contribution:**

| Change Type | Location | Example |
|------------|----------|---------|
| New component | `src/components/` | `NewComponent.tsx` |
| New screen | `src/screens/` | `NewScreen.tsx` |
| Utility function | `src/utils/` | Add to relevant file or create new |
| Database query | `src/database/queries.ts` | Add function |
| Type definition | `src/types/index.ts` | Add interface/type |
| Constant data | `src/constants/` | Add to relevant file |
| Custom hook | `src/hooks/` | `useNewHook.ts` |

## Development Philosophy

### Core Principles

1. **Test-Driven Development**: Write tests first, code second
2. **Type Safety**: Leverage TypeScript's type system fully
3. **Separation of Concerns**: UI, logic, and data should be distinct
4. **Performance Matters**: Profile and optimize, don't guess
5. **Documentation Lives**: Update docs with code changes
6. **Statistical Integrity**: Cryptographic randomness is non-negotiable
7. **Accessibility First**: Everyone should be able to use the app
8. **Privacy by Design**: User data stays on device

### Code Review Philosophy

**As a reviewer:**
- Be constructive and specific
- Ask questions, don't demand changes
- Approve when "good enough" even if not perfect
- Teach, don't just criticize
- Acknowledge good work

**As an author:**
- Don't take feedback personally
- Ask for clarification if unsure
- Push back respectfully if you disagree
- Learn from the feedback
- Thank reviewers for their time

### Learning and Growth

We welcome contributors of all skill levels:

- **Beginners**: Look for issues labeled `good first issue`
- **Intermediate**: Pick up features or refactoring tasks
- **Advanced**: Help with architecture, performance, or mentoring

**Ask questions!** If something is unclear:
1. Check existing documentation
2. Search closed issues/PRs
3. Ask in issue comments
4. Reach out to maintainers

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file (alphabetically listed)
- Release notes (for significant contributions)
- GitHub contributor graph (automatically)

## License

By contributing to Telepathy Trainer, you agree that your contributions will be licensed under the same license as the project (REPLACEME_LICENSE_TYPE).

---

## Questions?

- **General questions**: Open a discussion on GitHub
- **Bug reports**: Open an issue
- **Security issues**: Email REPLACEME_SECURITY_EMAIL
- **Other inquiries**: Email REPLACEME_CONTACT_EMAIL

Thank you for contributing to Telepathy Trainer! 🔮
