# Agent Guidelines for Air Rockstar

This document contains critical guidelines and workflows that AI agents must follow when working on this project.

## Pre-Push Checklist ✅

**MANDATORY**: Before pushing any code changes, ALWAYS run the following commands in order:

```bash
npm run lint          # ESLint - must pass with no errors
npm run test:ci       # Unit tests with coverage - must reach 80% threshold
npm run build         # Production build - must compile without errors
npm run test:e2e      # End-to-end tests - must pass all scenarios
```

**Only push code if ALL checks pass.** If any check fails, fix the issues before pushing.

**Note on Camera E2E Tests**: Camera permission and getUserMedia tests have limitations in headless browsers and CI environments. Some camera-related E2E tests may be marked as skipped or require browser-specific implementations. This is acceptable for features that require actual hardware access.

## Code Quality Principles

### DRY (Don't Repeat Yourself)
- Extract repeated logic into reusable functions, hooks, or utilities
- Create shared components for common UI patterns
- Use TypeScript types and interfaces to avoid duplicating type definitions
- Example: `useCamera` hook centralizes camera permission logic used across pages

### File Hygiene
- One React component per file (no multi-component modules)
- Keep props and shared types in dedicated `types.ts` files (co-located) or `src/types`
- Extract helper functions when a component or hook grows beyond one screen of code
- Prefer shared UI components over copy-pasted markup or styles

### Single Responsibility Principle (SRP)
- Each function should do one thing and do it well
- Each component should have a single, clear purpose
- Each hook should manage one specific piece of state or behavior
- Example: `useCamera` only manages camera permissions and stream, not audio or hand tracking

### Separation of Concerns
- Keep business logic separate from presentation
- Use custom hooks for stateful logic
- Keep components focused on rendering
- Example: Pages use `useCamera` hook rather than implementing camera logic directly

### Component Organization
```
app/                    # Next.js pages (App Router)
src/
  components/          # Reusable UI components
  hooks/              # Custom React hooks for shared logic
  utils/              # Pure utility functions
  types/              # TypeScript type definitions
```

## Design Patterns

### Testing Patterns

#### Page Object Pattern (E2E Tests)
- All E2E tests use page objects in `e2e/pages/`
- Page objects encapsulate selectors and actions
- Tests interact with page objects, not raw Playwright API
- Example: `CameraPermissionPage` provides `grantCameraPermission()`, `expectCameraFeedVisible()`

#### BetterSpecs Pattern (Unit Tests)
- Use descriptive `describe` blocks for context
- Use `it` blocks for specific behaviors
- Follow "when/should" naming: "when rendered, should display heading"
- Group related tests under shared context
- Reference: https://www.betterspecs.org/

#### Test Organization
```typescript
describe('ComponentName', () => {
  describe('when [context]', () => {
    it('should [expected behavior]', () => {
      // arrange
      // act
      // assert
    });
  });
});
```

### React Patterns

#### Custom Hooks for Stateful Logic
- Extract complex state management into custom hooks
- Prefix hook names with `use`
- Return stable object with state and functions
- Example: `useCamera` returns `{ stream, error, requestCamera, stopCamera }`

#### Composition Over Inheritance
- Build complex components by composing smaller ones
- Pass behavior through props and children
- Use hooks to share logic between components

## Test-Driven Development (TDD)

Follow this workflow for all features:

1. **Documentation First** - Write feature spec in `docs/FEATURES.md`
2. **E2E Tests** - Write failing E2E tests with Page Object Pattern
3. **Unit Tests** - Write failing unit tests with BetterSpecs pattern
4. **Implementation** - Write minimum code to make tests pass
5. **Verification** - Run full test suite and verify coverage
6. **Refactor** - Improve code while keeping tests green

## Git Workflow

### Branching Strategy
- Create feature branches: `feature/feature-name`
- Keep commits granular and focused
- Write descriptive commit messages following Conventional Commits

### Commit Message Format
```
type(scope): brief description

- Detailed explanation if needed
- Reference issues or PRs if applicable
```

Types: `feat`, `fix`, `test`, `refactor`, `docs`, `style`, `chore`

### Merge Strategy
- Keep granular commits on feature branches
- Squash commits when merging to main
- Ensure all CI checks pass before merging

## Code Coverage Standards

- **Minimum Coverage**: 80% for all metrics (branches, functions, lines, statements)
- **Mock External Dependencies**: Navigator APIs, MediaPipe, Tone.js
- **Test Error States**: Always test happy path AND error scenarios
- **Test Accessibility**: Verify ARIA labels, roles, and semantic HTML

## Technology-Specific Guidelines

### Next.js 14 (App Router)
- Use Server Components by default
- Mark with `'use client'` only when needed (hooks, events, browser APIs)
- Prefer static generation where possible
- Use module CSS for component styles

### TypeScript
- Enable strict mode (already configured)
- Define explicit types for function parameters and return values
- Use interfaces for object shapes
- Avoid `any` - use `unknown` if type is truly unknown

### React Testing Library
- Query by role, label, or text (not by class or test IDs)
- Use `screen` queries for better error messages
- Mock at the module level for consistency
- Wait for async updates with `waitFor` or `findBy` queries

### Playwright
- Use Page Object Pattern exclusively
- Grant camera permissions in beforeEach hooks
- Take screenshots on all test steps for debugging
- Use descriptive test names that explain user scenarios

## Performance Considerations

- Clean up effects and subscriptions
- Stop camera streams when components unmount
- Avoid unnecessary re-renders with `useMemo` and `useCallback`
- Lazy load heavy dependencies (MediaPipe, Tone.js)

## Accessibility Standards

- Use semantic HTML elements (`<main>`, `<nav>`, `<button>`)
- Provide ARIA labels for custom controls
- Ensure keyboard navigation works
- Display errors with `role="alert"`
- Test with screen reader context in mind

## Documentation

- Update `docs/FEATURES.md` for user-facing features
- Add JSDoc comments for complex functions
- Document design patterns when introducing new patterns
- Keep README.md updated with setup instructions
- Maintain the styleguide at `/styleguide` as the source of truth for UI decisions

## Design System Usage

- **Always use the shared component library** in `src/components/ui` for new UI
- **Extend components before creating one-off styles** (add variants/props as needed)
- **Keep the styleguide current** whenever new components or visual patterns are added
- **Do not bypass tokens** defined in `app/globals.css` for colors, typography, or spacing

## Remember

This is a learning project demonstrating best practices. Quality over speed. Every line of code should:
- Be tested
- Follow established patterns
- Be maintainable by others
- Demonstrate professional standards

---

**Last Updated**: February 8, 2026
