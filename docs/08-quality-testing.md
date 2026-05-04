# Quality and testing guide

Use this document before finishing a task or when adding tests.

## Validation commands

Run available commands only:

```bash
npm run lint
npm run typecheck
npm test
npx expo-doctor
```

If a command does not exist, mention it and suggest adding it.

## Recommended tooling

- ESLint
- Prettier
- TypeScript strict mode
- Jest
- jest-expo
- React Native Testing Library
- Maestro for E2E flows

## What to test

Add tests for:

- bug fixes
- data transformation logic
- validation schemas
- critical auth/session behavior
- complex hooks
- reusable UI behavior where practical

Do not over-test static layout-only components.

## Pull request checklist

- Lint passes
- Typecheck passes
- Tests pass or missing test command is noted
- New dependencies are justified
- Native dependency compatibility is checked
- User-facing loading/error/empty states are handled
