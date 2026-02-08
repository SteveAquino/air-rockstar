# Development Guidelines

## Test-Driven Development (TDD)

This project follows a strict Test-Driven Development approach. All new features and changes must follow this workflow:

### TDD Cycle

1. **Documentation First**: Write or update feature documentation before any code
2. **Red Phase**: Write failing tests (E2E and unit tests)
3. **Green Phase**: Write minimal code to make tests pass
4. **Refactor Phase**: Improve code while keeping tests green
5. **Verify**: Run all tests, type-check, lint, and build
6. **Commit**: Commit each phase with descriptive messages

### Commit Message Conventions

Use conventional commit prefixes:
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `feat:` - New feature implementation
- `refactor:` - Code refactoring
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks

## Testing Standards

### End-to-End Tests (Playwright)

**Required Pattern: Page Object Model (POM)**

All E2E tests must use the Page Object Pattern to:
- Encapsulate page-specific selectors and interactions
- Improve test maintainability and readability
- Reduce code duplication
- Make tests resilient to UI changes

**Structure:**
```
e2e/
  pages/
    WelcomePage.ts
    GuitarPage.ts
    DrumsPage.ts
  welcome.spec.ts
  guitar.spec.ts
  drums.spec.ts
```

**Example Page Object:**
```typescript
export class WelcomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async clickGuitarButton() {
    await this.page.getByRole('link', { name: /play air guitar/i }).click();
  }

  async expectVisible() {
    await expect(this.page.getByRole('heading', { name: /air rockstar/i })).toBeVisible();
  }
}
```

**Screenshot Guidelines:**
- Take screenshots at key interaction points
- Store in `e2e-screenshots/` directory
- Use descriptive names: `[page]-[action]-[state].png`

### Unit Tests (Jest + React Testing Library)

**Required Pattern: BetterSpecs.org Guidelines**

Follow these principles (adapted for JavaScript/TypeScript):

1. **One Assertion Per Test**: Each test should verify one specific behavior
2. **Descriptive Test Names**: Use clear, behavior-focused descriptions
3. **Use `describe` and `it/test` Blocks**: Group related tests logically
4. **Test Behavior, Not Implementation**: Focus on what the component does, not how
5. **Use Accessibility Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
6. **Keep Tests Simple**: Each test should be easy to understand at a glance

**Structure:**
```typescript
describe('ComponentName', () => {
  describe('when [condition]', () => {
    it('should [expected behavior]', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

**Good Example:**
```typescript
describe('WelcomeScreen', () => {
  describe('when rendered', () => {
    it('should display the main heading', () => {
      render(<WelcomeScreen />);
      expect(screen.getByRole('heading', { name: /air rockstar/i })).toBeInTheDocument();
    });
  });

  describe('when guitar button is clicked', () => {
    it('should navigate to the guitar page', async () => {
      const user = userEvent.setup();
      render(<WelcomeScreen />);
      await user.click(screen.getByRole('link', { name: /play air guitar/i }));
      expect(mockRouter.push).toHaveBeenCalledWith('/guitar');
    });
  });
});
```

**Avoid:**
- Testing implementation details (internal state, private methods)
- Multiple unrelated assertions in one test
- Brittle selectors (CSS classes, test IDs unless necessary)
- Testing third-party libraries

### Coverage Requirements

- **Minimum Coverage**: 80% for lines, branches, functions, and statements
- **Enforcement**: CI pipeline will fail if coverage drops below threshold
- **Focus**: Aim for meaningful coverage, not just hitting numbers

### Running Tests

```bash
# Unit tests (watch mode for development)
npm test

# Unit tests with coverage
npm run test:coverage

# Unit tests in CI mode
npm run test:ci

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# View E2E test report
npm run test:e2e:report
```

## Code Quality

### Linting and Formatting

- **ESLint**: Enforces code quality and catches common errors
- **Prettier**: Ensures consistent code formatting
- **TypeScript**: Provides type safety and better developer experience

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format all files
npm run format

# Type check
npm run type-check
```

### Structure and DRY

- One React component per file (avoid multi-component modules).
- Co-locate props and shared types in a `types.ts` file or `src/types` for reuse.
- Extract helper functions when components/hooks exceed one screen of code.
- Prefer shared UI components over duplicated markup or CSS.

### Pre-Commit Checklist

Before committing code:
- [ ] All tests pass (unit and E2E)
- [ ] Coverage meets 80% threshold
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code is formatted with Prettier
- [ ] Build succeeds
- [ ] UI changes use `src/components/ui` and tokens from `app/globals.css`
- [ ] Styleguide at `/styleguide` updated if new UI patterns were introduced
- [ ] Components are one-per-file and props/types live in dedicated `types.ts` files

## Git Workflow

### Branch Strategy

- **Main branch**: `main` - Production-ready code
- **Feature branches**: `feature/[feature-name]` - New features
- **Bug fixes**: `fix/[bug-name]` - Bug fixes

### Commit Granularity

- Keep commits small and focused
- Each commit should represent one logical change
- Follow the TDD cycle: doc → test → impl → refactor commits
- Maintain granular commit history on feature branches
- **Squash on merge**: Feature branches will be squashed when merging to main

### Pull Request Guidelines

- All PRs must pass CI checks (lint, type-check, tests, build)
- E2E test reports and screenshots will be attached as artifacts
- Code coverage report must show ≥80% coverage
- PRs should reference related issues or feature documentation

## Future Development

When AI agents work on this project in the future, they must:
1. **Always follow TDD**: Documentation → Tests → Implementation
2. **Use Page Object Pattern**: For all new E2E tests
3. **Follow BetterSpecs**: For all unit tests
4. **Maintain Coverage**: Never commit code that drops coverage below 80%
5. **Update Documentation**: Keep docs in sync with code changes
6. **Run Tests Locally**: Verify E2E tests pass before pushing
7. **Use the UI Library**: Build UI with `src/components/ui` and keep `/styleguide` accurate
8. **Keep Structure Consistent**: One component per file, types in `types.ts`, and no repeated UI markup
