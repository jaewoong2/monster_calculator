# ADR: 2026-05 React Native frontend stack

Status: Accepted  
Date: 2026-05-04

## Decision

Adopt the following frontend stack (구체적 버전 포함):

```txt
Expo SDK 54          expo@~54.0.33
Expo Router v6       expo-router@~6.0.23
React Native 0.81    react-native@0.81.5
React 19.1
TypeScript 5.9       strict mode
NativeWind v4        nativewind@^4.2.3 + tailwindcss@^3.4.19
React Native Reusables (CLI: @react-native-reusables/cli)
TanStack Query v5    @tanstack/react-query@^5.100.9
React Hook Form v7   react-hook-form@^7.75.0
Zod 4                zod@^4.4.2
Zustand 5            zustand@^5.0.12
AsyncStorage         @react-native-async-storage/async-storage@2.2.0
MMKV                 react-native-mmkv@^4.3.1
Expo SecureStore
Expo SQLite + Drizzle (optional)
```

### Architecture decisions

| Decision | Value | Rationale |
|---|---|---|
| New Architecture | Enabled | Reanimated 4 필수, 미래 SDK 호환성 확보 |
| React Compiler | Experimental | 자동 메모이제이션으로 `useMemo`/`useCallback` 부담 감소 |
| Typed Routes | Enabled | 런타임 route 오류 방지, DX 개선 |

## Why

### Expo

Expo reduces native setup overhead and provides a good default path for Android, iOS, and Web development.

### Expo Router

Expo Router provides file-based routing and keeps navigation structure visible in the file system. Typed Routes 활성화로 타입 안전한 네비게이션 가능.

### NativeWind v4

NativeWind enables Tailwind-style utility classes in React Native. Version 4 is the default stable choice for this project baseline. v5는 프리릴리스 상태이므로 채택하지 않음.

### React Native Reusables

React Native Reusables provides shadcn-like reusable component patterns that fit a NativeWind-based design system. CLI (`@react-native-reusables/cli`)로 컴포넌트를 프로젝트에 복사하여 소유권을 유지.

### TanStack Query v5

TanStack Query handles server state, cache invalidation, loading states, retries, and mutations. v5의 `queryOptions()` helper로 타입 안전한 쿼리 설정 재사용 가능.

### React Hook Form v7 + Zod 4

React Hook Form keeps forms performant and manageable. **Zod 4** provides reusable runtime validation and TypeScript inference.

> **Zod 4 채택 근거**: Zod 4는 2025년 5월 출시. Zod 3 대비 14x 빠른 문자열 파싱, 7x 빠른 배열 파싱, 더 작은 번들 크기, first-party JSON Schema 변환. **Top-level API (`z.email()`, `z.url()` 등) 사용 필수.**

### Zustand 5

Zustand is small and ergonomic for global client state. v5에서는 `useShallow`가 필수 패턴이며, `createWithEqualityFn()`으로 custom equality 지원.

### Storage

- AsyncStorage for small, non-sensitive values
- MMKV for faster synchronous key-value persistence (설치됨)
- SecureStore for secrets
- SQLite/Drizzle for structured offline data if needed

## Consequences

- Developers must keep server state out of Zustand by default.
- UI consistency depends on maintaining `components/ui/`.
- Native dependency upgrades must be checked against Expo SDK compatibility.
- Offline-first features require extra design before adding SQLite.
- **Zod 4 top-level API 필수 사용** — `z.string().email()` 금지.
- **Zustand 5의 `useShallow` 필수 사용** — 불필요한 리렌더 방지.
- **React Compiler가 실험적 활성화** — 수동 `useMemo`/`useCallback` 과다 사용 지양.
- **NativeWind v5 마이그레이션은 v5가 안정화될 때까지 보류.**
