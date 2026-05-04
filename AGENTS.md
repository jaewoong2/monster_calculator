# AGENTS.md

> 이 파일은 코딩 에이전트용 프로젝트 길라잡이입니다.  
> 자세한 구현 설명을 길게 적기보다, “어떤 작업을 할 때 어떤 문서를 먼저 확인해야 하는지”를 안내합니다.

## Project baseline

- App type: React Native app built with Expo
- Language: TypeScript
- Routing: Expo Router
- Styling: NativeWind v4
- Reusable UI: React Native Reusables first, custom components second
- Server state: TanStack Query
- Forms and validation: React Hook Form + Zod
- Client/global state: Zustand
- Local storage:
  - Non-sensitive small values: AsyncStorage or MMKV
  - Sensitive values: Expo SecureStore
  - Structured offline data: Expo SQLite + Drizzle
- Baseline date: 2026-05-04

If this repository is upgraded after React Native, Expo SDK, NativeWind, or Expo Router releases, check `docs/09-release-upgrade.md` before changing setup code.

## Read this first

Before making changes, read:

1. `docs/00-project-overview.md`
2. The task-specific document listed below
3. Any related ADR under `docs/adr/`

## Task-to-document map

### Project setup, package install, environment fixes

Read:

- `docs/01-setup-installation.md`
- `docs/09-release-upgrade.md`

Rules:

- Prefer `npx expo install` for Expo/RN native dependencies.
- Do not blindly install `@latest` for native modules.
- Keep the lockfile consistent with the existing package manager.
- Do not introduce a new package manager without explicit approval.

### Routing, screens, tabs, stack navigation, deep links

Read:

- `docs/02-routing-navigation.md`

Rules:

- Use Expo Router file-based routing.
- Add screens under `app/`.
- Keep reusable screen logic outside `app/` when it is not routing-specific.
- Prefer typed routes when enabled.

### Styling, design tokens, UI components

Read:

- `docs/03-ui-styling-components.md`

Rules:

- Use NativeWind classes for layout and basic styling.
- Use components from `components/ui/` before creating new variants.
- For complex reusable UI, prefer React Native Reusables patterns.
- Do not mix many UI systems in one feature unless the docs say it is allowed.

### API calls, server data, loading/error states

Read:

- `docs/04-data-fetching-server-state.md`

Rules:

- Use TanStack Query for server state.
- Do not put server-fetched data into Zustand unless there is a clear reason.
- Keep API request functions in feature-level `api.ts` files.
- Validate unsafe API responses with Zod where practical.

### Forms, validation, schema reuse

Read:

- `docs/05-forms-validation.md`

Rules:

- Use React Hook Form for non-trivial forms.
- Use Zod for schema validation.
- Keep form schemas close to the feature that owns them.
- Reuse Zod schemas for API payload validation when possible.

### Global state, app preferences, auth session, local persistence

Read:

- `docs/06-state-storage.md`

Rules:

- Use Zustand for client UI state and local app state.
- Use TanStack Query for server state.
- Store secrets in SecureStore, not AsyncStorage.
- Persist only what must survive app restart.

### Offline-first data, local tables, sync queues

Read:

- `docs/07-local-db-offline.md`

Rules:

- Use SQLite/Drizzle only when key-value storage is not enough.
- Keep local DB schema changes explicit.
- Do not store sensitive tokens in SQLite.

### Testing, linting, type checking, quality gates

Read:

- `docs/08-quality-testing.md`

Rules:

- Run the smallest relevant validation first.
- Before finishing, run lint/typecheck/tests when available.
- Add tests for bug fixes and logic-heavy changes.

### Dependency upgrades, Expo SDK migration, React Native changes

Read:

- `docs/09-release-upgrade.md`
- `docs/adr/2026-05-frontend-stack.md`

Rules:

- Check Expo/RN compatibility before upgrading native dependencies.
- Prefer small, isolated upgrade PRs.
- Do not combine feature work and major dependency upgrades.

## Repository structure

Expected structure:

```txt
app/                    # Expo Router routes only
components/             # Shared reusable components
components/ui/          # Design-system-like primitives
features/               # Feature modules
lib/                    # Cross-feature utilities and clients
stores/                 # Global Zustand stores
docs/                   # Human/agent development docs
docs/adr/               # Architecture decision records
```

Feature modules should generally look like:

```txt
features/auth/
  api.ts
  hooks.ts
  schema.ts
  store.ts
  components/
  screens/
```

## Coding rules

- Use TypeScript.
- Prefer named exports for shared utilities/components.
- Keep files small enough to understand quickly.
- Do not hide network calls inside UI components.
- Do not create global state for data that belongs to a single screen.
- Do not add new dependencies when a simple local utility is enough.
- Prefer explicit error/loading/empty states for user-facing screens.
- Keep platform-specific behavior isolated with `.ios.tsx`, `.android.tsx`, or small platform helpers.

## Validation checklist before completing a task

Run commands that exist in this repo:

```bash
npm run lint
npm run typecheck
npm test
npx expo-doctor
```

If a command does not exist, do not invent it. Mention that it is missing and suggest adding it.

## When uncertain

- Prefer reading the relevant doc under `docs/`.
- Prefer official library documentation over blog posts.
- Ask before adding new production dependencies.
- If there is a conflict between docs, follow the most specific document:
  1. Nested `AGENTS.md`
  2. Current feature docs
  3. `docs/adr/*`
  4. Root `AGENTS.md`
  5. README
