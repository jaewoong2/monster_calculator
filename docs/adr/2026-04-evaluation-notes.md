# ADR: 2026-04 frontend library evaluation notes

Status: Draft  
Date: 2026-04

## Context

The project needs a maintainable React Native frontend stack that works well with Expo and can support mobile-first product development.

## Evaluated areas

- Expo vs React Native CLI
- Expo Router vs manual React Navigation setup
- NativeWind vs StyleSheet-only styling
- React Native Reusables vs full UI kits
- TanStack Query vs custom fetch hooks
- Zustand vs Redux Toolkit vs Jotai
- AsyncStorage vs SecureStore vs MMKV
- SQLite/Drizzle for offline data

## Notes

- Expo is preferred for faster setup, easier native module management, and EAS compatibility.
- Expo Router is preferred for file-based routing and cross-platform navigation.
- NativeWind v4 is preferred for Tailwind-like styling in React Native.
- React Native Reusables is useful when the app wants a shadcn-like component approach.
- TanStack Query should own server state.
- Zustand should own small app-wide client state.
- SecureStore should be used for secrets.
- SQLite/Drizzle should be introduced only when key-value storage becomes insufficient.

## Decision

Use the stack documented in `docs/adr/2026-05-frontend-stack.md`.
