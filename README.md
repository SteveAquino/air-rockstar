# Air Rockstar 🎸🥁

A motion-tracking virtual instrument application that lets you play air guitar and air drums using your camera and hand movements.

## Features

- 🎸 **Air Guitar Mode**: Play virtual guitar by moving your hands
- 🥁 **Air Drums Mode**: Play virtual drums with hand tracking
- 📹 **Camera-Based Motion Tracking**: Uses MediaPipe Hands for accurate hand detection
- 🎵 **Real-Time Audio**: Synthesized instrument sounds with velocity-based dynamics
- ♿ **Fully Accessible**: Built with ARIA labels and keyboard navigation
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Motion Tracking**: MediaPipe Hands
- **Audio**: Tone.js
- **Testing**: Jest + React Testing Library (unit), Playwright (E2E)
- **Code Quality**: ESLint, Prettier
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- Modern browser with camera support (Chrome, Firefox, Safari, Edge)
- HTTPS connection (required for camera access in production)

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd air-rockstar

# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Development

```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

The app will automatically reload when you make changes to the code.

### Building for Production

```bash
# Create an optimized production build
npm run build

# Start the production server
npm start
```

## Testing

This project follows Test-Driven Development (TDD) practices with comprehensive test coverage.

### Unit Tests

```bash
# Run unit tests in watch mode (development)
npm test

# Run unit tests once with coverage
npm run test:coverage

# Run unit tests in CI mode
npm run test:ci
```

**Coverage Requirements**: 80% minimum for lines, branches, functions, and statements.

### End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# View the last E2E test report
npm run test:e2e:report
```

E2E tests run across multiple browsers (Chromium, Firefox, WebKit) and capture screenshots at key interaction points.

### All Quality Checks

```bash
# Run all checks (type-check, lint, tests, build)
npm run type-check && npm run lint && npm run test:ci && npm run build
```

## Code Quality

### Linting and Formatting

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Format all files with Prettier
npm run format

# Type check without emitting files
npm run type-check
```

## Project Structure

```
air-rockstar/
├── __tests__/              # Unit tests
│   ├── page.test.tsx       # Welcome page tests
│   ├── guitar-page.test.tsx
│   ├── drums-page.test.tsx
│   └── setup.d.ts          # TypeScript types for tests
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Welcome screen
│   ├── page.module.css     # Welcome screen styles
│   ├── guitar/             # Guitar mode
│   │   └── page.tsx
│   └── drums/              # Drums mode
│       └── page.tsx
├── docs/                   # Documentation
│   ├── DEVELOPMENT.md      # Development guidelines & TDD workflow
│   ├── FEATURES.md         # Feature specifications
│   ├── HAND_TRACKING.md    # Hand tracking documentation (coming soon)
│   └── ARCHITECTURE.md     # Architecture docs (coming soon)
├── e2e/                    # End-to-end tests
│   ├── pages/              # Page Object Models
│   │   ├── WelcomePage.ts
│   │   ├── GuitarPage.ts
│   │   └── DrumsPage.ts
│   └── welcome.spec.ts     # Welcome screen E2E tests
├── src/                    # Source code (services, utils, hooks)
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   └── hooks/              # React hooks
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI pipeline
├── jest.config.js          # Jest configuration
├── jest.setup.js           # Jest setup file
├── playwright.config.ts    # Playwright configuration
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## Development Workflow

This project follows a strict **Test-Driven Development (TDD)** approach. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed guidelines.

### TDD Cycle

1. **Documentation First**: Write or update feature documentation
2. **Red Phase**: Write failing tests (E2E and unit tests)
3. **Green Phase**: Write minimal code to make tests pass
4. **Refactor Phase**: Improve code while keeping tests green
5. **Verify**: Run all tests, type-check, lint, and build
6. **Commit**: Commit each phase with descriptive messages

### Testing Patterns

- **E2E Tests**: Use Page Object Pattern (see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md))
- **Unit Tests**: Follow BetterSpecs.org guidelines
- **Accessibility**: All tests use semantic queries (`getByRole`, `getByLabelText`)

### Commit Conventions

```
docs: Documentation changes
test: Adding or updating tests
feat: New feature implementation
refactor: Code refactoring
fix: Bug fixes
chore: Maintenance tasks
ci: CI/CD changes
```

## Browser Requirements

### Development
- Any modern browser on `http://localhost:3000`

### Production
- **HTTPS required** for camera access
- Supported browsers:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

### Camera Permissions

The app requests camera access when you select an instrument. If denied:
1. Look for the camera icon in your browser's address bar
2. Click it and select "Allow"
3. Refresh the page

## CI/CD

GitHub Actions automatically runs on all pull requests:

1. ✅ ESLint checks
2. ✅ TypeScript type checking
3. ✅ Unit tests with coverage enforcement (80%)
4. ✅ Production build
5. ✅ E2E tests across browsers
6. 📊 Test reports and screenshots uploaded as artifacts

## Roadmap

### ✅ Phase 1: Foundation (Complete)
- [x] Project setup with Next.js and TypeScript
- [x] Testing infrastructure (Jest, Playwright)
- [x] CI/CD pipeline
- [x] Welcome screen with navigation

### 🚧 Phase 2: Camera & Hand Tracking (Next)
- [ ] Camera permission flow
- [ ] MediaPipe Hands integration
- [ ] Hand position and velocity tracking
- [ ] Visual feedback overlay

### 📋 Phase 3: Instruments
- [ ] Guitar string zones and collision detection
- [ ] Drum kit zones and collision detection
- [ ] Audio synthesis with Tone.js
- [ ] Visual instrument rendering

### 🎯 Phase 4: Enhancements
- [ ] Pre-recorded instrument samples
- [ ] Velocity-based hit detection
- [ ] Multiple instrument options
- [ ] Customization settings
- [ ] Performance optimization

## Contributing

1. Follow the TDD workflow documented in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
2. Ensure all tests pass and coverage remains ≥80%
3. Use Page Object Pattern for E2E tests
4. Use BetterSpecs pattern for unit tests
5. Run all quality checks before committing
6. Create granular commits following conventions
7. Squash commits when merging to main

## Troubleshooting

### Camera Not Working

**Issue**: Camera permission denied or not accessible

**Solutions**:
- Ensure you're on HTTPS (or localhost for development)
- Check browser permissions in Settings
- Close other apps using the camera
- Try a different browser

### Tests Failing

**Issue**: Tests fail locally or in CI

**Solutions**:
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Reinstall Playwright browsers
npx playwright install --with-deps
```

### Build Errors

**Issue**: TypeScript or build errors

**Solutions**:
```bash
# Check TypeScript errors
npm run type-check

# Clean Next.js cache
rm -rf .next

# Rebuild
npm run build
```

## License

[Add your license here]

## Acknowledgments

- [MediaPipe](https://google.github.io/mediapipe/) for hand tracking
- [Tone.js](https://tonejs.github.io/) for web audio
- [Next.js](https://nextjs.org/) for the React framework
- [Playwright](https://playwright.dev/) for E2E testing
