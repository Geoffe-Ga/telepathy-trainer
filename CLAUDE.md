# CLAUDE.md - Agent Collaboration Guidelines

## ⚙️ Agent Behavior and Development Philosophy

**Project Status**: Telepathy Trainer is in initial development. No production deployment exists yet. The goal is to create a production-ready, maintainable React Native + Expo app suitable for App Store and Google Play submission with minimal ongoing maintenance requirements.

**Deployment Target**: Cross-platform mobile app (iOS + Android) optimized for passive income generation. Zero backend dependencies. All data stored on-device.

Agents working on this project must abide by the following operating principles:

### 1. **Test-Driven Development (TDD) Is Mandatory**

- Write tests **before** implementing features wherever possible.
- For React Native components: Use Jest + React Native Testing Library.
- For utility functions: Use Jest with 100% coverage expectation.
- For database operations: Use in-memory SQLite with fixture data.
- Every bug fix **must** include:
  1. A failing test that reproduces the bug
  2. The fix that makes the test pass
  3. Verification that no other tests broke
- Test categories required:
  - **Unit tests**: All utils, database queries, stats calculators
  - **Integration tests**: Database operations with actual SQLite
  - **Component tests**: User interactions, state changes, navigation
  - **E2E tests**: Critical user flows (guess card, view stats)

### 2. **CI/CD Is the Source of Truth**

- GitHub Actions defines project health status.
- **CI must pass green** before any PR merge to `main`.
- If CI fails, you **stop work** and fix it immediately.
- **Never** comment out failing tests or skip CI checks.
- Agents must iterate on `.github/workflows/ci.yml` until:
  - All TypeScript builds pass
  - All linters pass (ESLint, Prettier)
  - All type checks pass (TypeScript strict mode)
  - All tests pass with coverage thresholds met
  - iOS and Android builds succeed (Expo)
- Use caching aggressively (node_modules, Expo cache)
- Fail-fast behavior for faster feedback loops
- Parallel job execution where possible

### 3. **Commit Discipline and PR Standards**

**Commit Requirements:**
- One logical change per commit
- Descriptive commit messages following conventional commits:
  - `feat: add Zener card deck support`
  - `fix: correct cryptographic random bias`
  - `test: add heatmap calculation tests`
  - `docs: update installation instructions`
  - `refactor: extract card drawing logic`
  - `perf: optimize stats query with indexes`
- Commits must be atomic and revertible
- Run `pre-commit run --all-files` before every commit

**Pull Request Requirements:**
- Title: Clear, concise summary of changes
- Description must include:
  - **What**: What was changed and why
  - **How**: Technical approach taken
  - **Testing**: How it was tested
  - **Screenshots**: For UI changes (required)
  - **Checklist**: All CI checks green, pre-commit passed
- Link to related issue/task if applicable
- Request review from maintainer
- No merge until CI passes and review approved

### 4. **Code Quality Standards Are Non-Negotiable**

**TypeScript:**
- Strict mode enabled (`strict: true`)
- No `any` types without explicit justification comment
- All props must have defined interfaces
- Prefer `type` over `interface` for unions/primitives
- Use discriminated unions for state management

**React Native Best Practices:**
- Functional components only (no class components)
- Hooks for state management
- Memoization for expensive calculations (`useMemo`, `useCallback`)
- Proper cleanup in `useEffect` hooks
- Avoid inline arrow functions in JSX (performance)
- Extract complex JSX into subcomponents

**Code Organization:**
- One component per file
- File naming: PascalCase for components, camelCase for utils
- Export order: types → main export → default export
- Group imports: React → external → internal → types → styles
- Co-locate tests with source files: `CardReveal.tsx` + `CardReveal.test.tsx`

**Comments and Documentation:**
- Document **why**, not **what**
- Complex algorithms require explanation comments
- Public functions need JSDoc with param/return types
- TODOs must include issue number or be actionable
- No commented-out code in commits

**Forbidden Practices:**
- Magic numbers without named constants
- Console.log in production code (use proper logging)
- Hardcoded strings (use constants or i18n)
- Nested ternaries (use early returns or variables)
- Mutations of props or state
- Any form of `eval()` or dynamic code execution

### 5. **Testing Strategy and Coverage Requirements**

**Coverage Thresholds:**
- Overall: 80% minimum
- Utilities: 100% required
- Database queries: 95% minimum
- Components: 70% minimum
- Critical paths (card drawing, stats): 100% required

**Test Organization:**
```
src/
  components/
    CardReveal.tsx
    CardReveal.test.tsx
  utils/
    randomizer.ts
    randomizer.test.ts
  database/
    queries.ts
    queries.test.ts
    __mocks__/
      mockDatabase.ts
```

**Test Naming Convention:**
```typescript
describe('CardReveal', () => {
  describe('when exact match', () => {
    it('should display green border', () => {});
    it('should trigger success haptic', () => {});
  });
  
  describe('when partial match', () => {
    it('should display yellow border', () => {});
  });
  
  describe('when no match', () => {
    it('should display red border', () => {});
  });
});
```

**Required Test Scenarios:**
- Happy path (expected behavior)
- Edge cases (empty data, null values)
- Error conditions (network failure, db error)
- User interactions (tap, swipe, navigation)
- Async operations (loading states, timeouts)
- Randomness (use seeded random for determinism)

### 6. **Database Integrity and Performance**

**Critical Requirements:**
- **No data loss**: All writes must be transactional
- **Atomic operations**: Use SQLite transactions for multi-step writes
- **Indexed queries**: All frequently accessed columns must have indexes
- **Query optimization**: EXPLAIN QUERY PLAN for slow queries
- **Data validation**: Validate before write, not after
- **Migration strategy**: Even without backend, structure for future migrations

**Database Testing:**
- Use in-memory SQLite (`:memory:`) for tests
- Seed with fixture data
- Test all CRUD operations
- Test edge cases (duplicate IDs, missing foreign keys)
- Test query performance with large datasets (10k+ rows)
- Verify index usage with EXPLAIN

**Prohibited:**
- SQL injection vulnerabilities (use parameterized queries)
- Blocking the UI thread (use async/await)
- Storing sensitive data unencrypted (not applicable yet)
- Orphaned records (enforce foreign key constraints)

### 7. **Randomness Must Be Cryptographically Secure**

**This is a core requirement for statistical validity.**

**Mandatory Implementation:**
```typescript
// ✅ CORRECT: Cryptographically secure
import * as Random from 'expo-random';

async function getSecureRandomCard(cards: Card[]): Promise<Card> {
  const bytes = await Random.getRandomBytesAsync(4);
  const randomValue = new Uint32Array(bytes.buffer)[0];
  const index = randomValue % cards.length;
  return cards[index];
}

// ❌ WRONG: Do not use Math.random()
function insecureRandomCard(cards: Card[]): Card {
  return cards[Math.floor(Math.random() * cards.length)]; // NEVER DO THIS
}
```

**Why This Matters:**
- `Math.random()` is pseudo-random and predictable
- User's guess could theoretically influence the outcome
- Statistical validity requires true randomness
- Cryptographic randomness provides unpredictability

**Testing Randomness:**
- Mock `expo-random` for deterministic tests
- Test distribution over large samples (Chi-squared test)
- Verify no modulo bias in conversion
- Document the algorithm thoroughly

### 8. **State Management with Zustand**

**Principles:**
- Keep global state minimal (only truly global data)
- Use local state (useState) for component-specific data
- Persist only user preferences, not derived data
- Avoid storing data that belongs in the database

**Store Structure:**
```typescript
interface AppState {
  // User preferences (persisted)
  selectedDeck: DeckType;
  showConcentrationPrompt: boolean;
  
  // Transient UI state (not persisted)
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSelectedDeck: (deck: DeckType) => void;
  setError: (error: string | null) => void;
}
```

**Store Testing:**
- Test initial state
- Test each action mutates state correctly
- Test persistence (mock AsyncStorage)
- Test state rehydration on app launch

### 9. **Performance Optimization Requirements**

**App Launch:**
- Target: < 2 seconds to interactive
- Lazy load heavy components
- Initialize database on background thread
- Defer non-critical initializations

**Navigation:**
- Pre-load next screen data
- Smooth 60fps transitions
- No janky animations

**Stats Screen:**
- Pagination for large datasets
- Virtualized lists for long scrolls
- Memoize expensive calculations
- Lazy render charts below fold
- Target: < 1 second to render 10k guesses

**Database:**
- Index all foreign keys
- Batch inserts in transactions
- VACUUM database periodically
- Monitor query execution time

**Measurements Required:**
- Use React Native Performance Monitor
- Profile with Flipper
- Measure render times with React Profiler
- Log slow database queries (>100ms)

### 10. **User Experience and Accessibility**

**Accessibility Requirements (WCAG AA):**
- All interactive elements: 44x44pt minimum
- Color contrast ratio: 4.5:1 for text
- Screen reader labels on all buttons
- Dynamic type support
- Haptic feedback for important actions
- VoiceOver/TalkBack tested

**UX Principles:**
- Immediate visual feedback on interactions
- Loading states for async operations
- Error messages in plain language
- Undo/redo where destructive actions exist
- Onboarding for first-time users
- Empty states that guide users

**Design System Adherence:**
- Use theme constants (no hardcoded colors)
- Consistent spacing via theme.spacing
- Consistent typography via theme.typography
- Shadows/elevation via theme.shadows
- No arbitrary magic numbers

### 11. **Error Handling and Resilience**

**Error Handling Strategy:**
- Try-catch all async operations
- Display user-friendly error messages
- Log errors for debugging (dev only)
- Graceful degradation when features fail
- Recovery mechanisms where possible

**Error Boundaries:**
- Wrap each screen in ErrorBoundary
- Fallback UI with retry option
- Report errors to logging service (future)

**Edge Cases to Handle:**
- Database corruption (recovery mechanism)
- Insufficient storage space
- Crypto random failure (fallback or error)
- Rapid user interactions (debounce/throttle)
- App state restoration after crash
- Timezone changes (all timestamps UTC)

### 12. **Security and Privacy**

**Current Requirements:**
- All data stored on-device only
- No network requests (offline-first)
- No analytics or tracking
- No personally identifiable information collected

**Future Sync Feature Prep:**
- Design for zero-knowledge architecture
- Encrypt synced data end-to-end
- User controls data deletion
- GDPR-compliant by design

**Code Security:**
- No secrets in source code
- No eval() or dynamic code execution
- Validate all user inputs
- Sanitize data before database writes

### 13. **Documentation Standards**

**Required Documentation:**
- README.md: Setup, development, deployment
- CONTRIBUTING.md: How to contribute, PR process
- CLAUDE.md: This file (agent guidelines)
- API.md: Internal API contracts (database, stores)
- ARCHITECTURE.md: High-level system design

**Code Documentation:**
- JSDoc for all public functions
- README in each major directory
- Inline comments for complex logic
- ADR (Architecture Decision Records) for major decisions

**Documentation Style:**
- Clear, concise, scannable
- Code examples where helpful
- Up-to-date (update with code changes)
- Written for human developers, not agents

### 14. **Workflow Automation**

**Pre-commit Hooks:**
```yaml
repos:
  - repo: local
    hooks:
      - id: prettier
        name: Prettier
        entry: npx prettier --write
        language: system
        types: [typescript, javascript, json]
      
      - id: eslint
        name: ESLint
        entry: npx eslint --fix
        language: system
        types: [typescript, javascript]
      
      - id: type-check
        name: TypeScript
        entry: npx tsc --noEmit
        language: system
        pass_filenames: false
      
      - id: tests
        name: Tests
        entry: npm test -- --bail --findRelatedTests
        language: system
        types: [typescript, javascript]
```

**CI Pipeline Stages:**
1. **Install**: Cache dependencies, install packages
2. **Lint**: ESLint, Prettier check
3. **Type Check**: TypeScript strict mode
4. **Test**: Jest with coverage
5. **Build**: Expo prebuild for iOS and Android
6. **E2E** (future): Detox tests on simulators

### 15. **Agent Iteration Protocol**

When implementing features, agents must follow this cycle:

```
1. READ PROMPT → Understand requirements thoroughly
2. DESIGN → Plan implementation, identify edge cases
3. TEST → Write failing tests first
4. IMPLEMENT → Write minimal code to pass tests
5. REFACTOR → Clean up, optimize, document
6. VERIFY → Run full test suite, check coverage
7. LINT → Fix all linting errors
8. PRE-COMMIT → Run hooks, ensure all pass
9. COMMIT → Atomic commit with clear message
10. CI → Monitor CI, fix if red
11. REPEAT → Next feature/fix
```

**If CI Fails:**
1. Read the error output carefully
2. Reproduce locally
3. Fix the root cause (never mask symptoms)
4. Verify fix locally
5. Push and monitor CI again

**If Tests Fail:**
1. Never comment out tests
2. Never skip tests
3. Fix the test or fix the code
4. If test is wrong, document why in commit message

**If Stuck:**
1. Review relevant documentation
2. Check similar implementations in codebase
3. Consult Expo/React Native docs
4. Search issues on GitHub
5. Ask specific, detailed questions

### 16. **Code Review Expectations**

**For Authors:**
- Self-review before requesting review
- Run all checks locally first
- Provide context in PR description
- Respond to feedback promptly
- Be open to suggestions

**For Reviewers:**
- Check for correctness first
- Look for edge cases and error handling
- Verify tests are comprehensive
- Ensure code follows standards
- Suggest improvements, don't just criticize
- Approve only when confident

**Review Checklist:**
- [ ] Does it solve the stated problem?
- [ ] Are there tests with good coverage?
- [ ] Does it follow TypeScript standards?
- [ ] Is it accessible?
- [ ] Is it performant?
- [ ] Is it secure?
- [ ] Is it documented?
- [ ] Does CI pass?

### 17. **Deck-Specific Implementation Requirements**

**Zener Cards (Special Case):**
- Only 5 cards, suit-only (no numbers)
- Skip number selection in UI flow
- Stats calculations must handle `undefined` numbers
- Chance accuracy: 20% (1 in 5)

**Tarot Decks (RWS and Thoth):**
- Major Arcana is a pseudo-suit with 22 cards
- Different naming conventions (RWS: The World, Thoth: The Aeon)
- Minor Arcana has different court cards (RWS: Page/Knight, Thoth: Princess/Prince)
- Thoth uses "Disks" instead of "Pentacles"
- Chance accuracy: 1.28% (1 in 78)

**Playing Cards:**
- Standard 52-card deck
- Four suits, 13 cards each
- Simplest deck, good for onboarding
- Chance accuracy: 1.92% (1 in 52)

**Testing Deck Data:**
- Verify card counts for each deck
- Test that all cards are unique
- Test suit/number filtering
- Test special cases (Major Arcana, Zener)

### 18. **Statistics Calculation Integrity**

**Critical Rules:**
- Calculate from raw data, never from cached aggregates
- Use SQL for aggregations where possible (faster)
- Validate input data before calculations
- Handle division by zero gracefully
- Round percentages to 2 decimal places
- Use UTC timestamps consistently

**Streak Calculation:**
- Only exact matches count toward streak
- Partial matches reset streak to 0
- Store streak in database for accuracy
- Recalculate on app launch (verify integrity)

**Heatmap Requirements:**
- Minimum 3 data points per cell before showing
- Display "Insufficient data" for sparse cells
- Color scale: Red (0-33%), Yellow (34-66%), Green (67-100%)
- Hour: 0-23, Day: 0-6 (Sunday-Saturday)
- Group by local time, store in UTC

**Progress Over Time:**
- Use rolling average (20-guess window)
- Handle gaps in data (missing days)
- Show trend line (linear regression)
- Date range filters: 7d, 30d, 90d, all time

### 19. **Future Feature Preparation**

**Sync Feature (Future):**
- Every guess has UUID
- Timestamps in ISO format
- Add `synced: boolean` column (default false)
- Add `user_id: string?` column (null for now)
- Design API contract now, implement later
- Batch upload strategy (offline queue)

**Sender/Receiver Mode (Future):**
- Consider data model changes needed
- Session-based pairing mechanism
- Real-time communication (WebSocket)
- Keep simple for now, design extensibility

**Do Not Implement Yet:**
- These are for awareness only
- Focus on core features first
- Design for extensibility, not speculation

### 20. **Monitoring and Debugging**

**Development Tools:**
- React Native Debugger for component inspection
- Flipper for network, database, performance
- Expo Dev Tools for logs and reloads
- React DevTools for component hierarchy

**Logging Strategy:**
- Use proper logging library (not console.log)
- Log levels: debug, info, warn, error
- Include context in logs (user action, timestamp)
- Disable debug logs in production builds

**Error Tracking (Future):**
- Sentry or similar for crash reporting
- User consent required
- Privacy-preserving error reports
- Disable in development builds

## Repository Structure

```
telepathy-trainer/
├── src/
│   ├── components/        # Reusable UI components + tests
│   ├── screens/          # Top-level screens + tests
│   ├── navigation/       # Navigation configuration
│   ├── store/           # Zustand state management
│   ├── database/        # SQLite schema, queries, migrations
│   ├── utils/           # Pure utility functions + tests
│   ├── hooks/           # Custom React hooks + tests
│   ├── types/           # TypeScript type definitions
│   ├── constants/       # App-wide constants (decks, theme, help)
│   └── __mocks__/       # Mock implementations for testing
├── assets/              # Images, fonts, splash screens
├── .github/
│   └── workflows/       # CI/CD pipelines
├── docs/                # Additional documentation
│   ├── ARCHITECTURE.md  # System design overview
│   ├── API.md          # Internal API contracts
│   └── ADR/            # Architecture Decision Records
├── scripts/             # Build and automation scripts
├── App.tsx             # Root component
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── jest.config.js      # Test configuration
├── .eslintrc.js        # Linting rules
├── .prettierrc         # Code formatting rules
├── .pre-commit-config.yaml  # Pre-commit hooks
├── README.md           # Project overview and setup
├── CONTRIBUTING.md     # Contribution guidelines
└── CLAUDE.md           # This file
```

## Critical Reminders for Agents

1. **Randomness is sacred**: Use crypto random always, test thoroughly
2. **Tests before code**: TDD is not optional
3. **CI must be green**: Fix failures immediately
4. **One commit, one change**: Atomic commits only
5. **Database integrity**: Transactions, indexes, validation
6. **Performance matters**: Profile, measure, optimize
7. **Accessibility required**: Screen readers, contrast, touch targets
8. **Documentation lives**: Update docs with code changes
9. **Security by default**: No secrets, validate inputs, encrypt data
10. **Future-proof design**: Prepare for sync, design for change

## Success Criteria for Agent Work

Your work is complete when:

- ✅ All tests pass with required coverage
- ✅ All linters pass (ESLint, Prettier, TypeScript)
- ✅ CI pipeline is green
- ✅ Pre-commit hooks pass
- ✅ Code follows all standards in this document
- ✅ Documentation is updated
- ✅ PR description is complete
- ✅ Self-review is done
- ✅ No known bugs or edge cases
- ✅ Feature works on both iOS and Android

**If any item above is not checked, the work is not done.**

---

## Philosophy: Build to Last

This app is designed for passive income with minimal maintenance. Every line of code should be:

- **Correct**: Works as intended, handles edge cases
- **Tested**: Comprehensive test coverage
- **Documented**: Future developers understand it
- **Performant**: Smooth, responsive, efficient
- **Maintainable**: Easy to change and extend
- **Accessible**: Usable by everyone
- **Secure**: Protects user data and privacy

Agents working on this project are expected to internalize these principles and apply them consistently. Quality is not negotiable.

**Welcome to the Telepathy Trainer project. Build something excellent.**
