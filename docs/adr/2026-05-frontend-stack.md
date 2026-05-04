# ADR: 2026-05 React Native frontend stack

Status: Accepted  
Date: 2026-05-04

## Decision

Adopt the following frontend stack:

```txt
Expo
Expo Router
React Native
TypeScript
NativeWind v4
React Native Reusables
TanStack Query
React Hook Form
Zod
Zustand
AsyncStorage
Expo SecureStore
MMKV, optional
Expo SQLite + Drizzle, optional
```

## Why

### Expo

Expo reduces native setup overhead and provides a good default path for Android, iOS, and Web development.

### Expo Router

Expo Router provides file-based routing and keeps navigation structure visible in the file system.

### NativeWind v4

NativeWind enables Tailwind-style utility classes in React Native. Version 4 is the default stable choice for this project baseline.

### React Native Reusables

React Native Reusables provides shadcn-like reusable component patterns that fit a NativeWind-based design system.

### TanStack Query

TanStack Query handles server state, cache invalidation, loading states, retries, and mutations.

### React Hook Form + Zod

React Hook Form keeps forms performant and manageable. Zod provides reusable runtime validation and TypeScript inference.

### Zustand

Zustand is small and ergonomic for global client state.

### Storage

- AsyncStorage for small, non-sensitive values
- SecureStore for secrets
- MMKV for faster key-value persistence if needed
- SQLite/Drizzle for structured offline data if needed

## Consequences

- Developers must keep server state out of Zustand by default.
- UI consistency depends on maintaining `components/ui/`.
- Native dependency upgrades must be checked against Expo SDK compatibility.
- Offline-first features require extra design before adding SQLite.
