# State and storage guide

Use this document when adding global state, persistence, auth session storage, preferences, or local key-value data.

## State decision table

| Need | Use |
|---|---|
| API/server data | TanStack Query |
| Screen-only UI state | `useState` or local reducer |
| App-wide UI state | Zustand |
| Form state | React Hook Form |
| Non-sensitive persisted values | AsyncStorage or MMKV |
| Sensitive values | Expo SecureStore |
| Structured offline tables | SQLite + Drizzle |

## Zustand rules

Use Zustand for:

- theme preference
- app settings
- onboarding flags
- local UI preferences
- auth session metadata if needed

Avoid Zustand for:

- API caches
- large lists from the server
- form field state
- navigation state

## Persistence rules

Persist only values that must survive app restart.

Good candidates:

- theme mode
- onboarding completed
- selected locale
- last selected workspace ID

Bad candidates:

- server lists
- temporary modal state
- form input drafts unless intentionally supported

## Storage choice

### AsyncStorage

Use for small, non-sensitive values.

### MMKV

Use when synchronous fast access is important, or when app startup reads are frequent.

### SecureStore

Use for secrets:

- access token
- refresh token
- session token
- device secret

Do not store secrets in AsyncStorage.

## Auth token pattern

Preferred approach:

1. Store token in SecureStore.
2. Keep in-memory auth state in Zustand if needed.
3. Use TanStack Query invalidation after sign-in/sign-out.
4. Clear SecureStore and query cache on sign-out.
