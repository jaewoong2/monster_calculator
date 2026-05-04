# Project overview

이 문서는 React Native + Expo 프론트엔드 프로젝트의 기본 방향을 정리합니다.

## Goals

- Android, iOS, Web을 하나의 TypeScript 코드베이스로 운영한다.
- Expo 생태계를 우선 사용해 네이티브 설정 부담을 줄인다.
- 서버 상태, 클라이언트 상태, 로컬 저장소의 책임을 분리한다.
- UI는 NativeWind 기반으로 빠르게 만들되, 재사용 가능한 컴포넌트를 축적한다.
- 앱이 커져도 기능 단위로 유지보수할 수 있는 구조를 유지한다.

## Default stack (2026-05 기준)

```txt
Expo SDK 54          (expo@~54.0.33)
Expo Router v6       (expo-router@~6.0.23)
React Native 0.81    (react-native@0.81.5)
React 19.1
TypeScript 5.9       (strict mode)
NativeWind v4        (nativewind@^4.2.3 + tailwindcss@^3.4.19)
React Native Reusables (CLI: @react-native-reusables/cli)
TanStack Query v5    (@tanstack/react-query@^5.100.9)
React Hook Form v7   (react-hook-form@^7.75.0)
Zod 4                (zod@^4.4.2)
Zustand 5            (zustand@^5.0.12)
AsyncStorage         (@react-native-async-storage/async-storage@2.2.0)
MMKV                 (react-native-mmkv@^4.3.1)
Expo SecureStore
Expo SQLite + Drizzle (optional, 미설치)
```

## Architecture flags

| Flag | Value | Notes |
|---|---|---|
| New Architecture | `true` | `app.json > newArchEnabled` |
| React Compiler | `true` (experimental) | `app.json > experiments.reactCompiler` |
| Typed Routes | `true` | `app.json > experiments.typedRoutes` |
| Edge-to-Edge (Android) | `true` | `app.json > android.edgeToEdgeEnabled` |

## State responsibility

| Type | Use |
|---|---|
| Server state | TanStack Query v5 |
| Form state | React Hook Form v7 |
| Validation | Zod 4 |
| UI/global client state | Zustand 5 |
| Non-sensitive persistence | AsyncStorage or MMKV |
| Sensitive persistence | Expo SecureStore |
| Structured offline data | Expo SQLite + Drizzle |

## Recommended folder structure

```txt
app/
  _layout.tsx
  index.tsx
  (auth)/
  (tabs)/

components/
  ui/
  layout/
  feedback/

features/
  auth/
  user/
  settings/

lib/
  api/
  query/
  storage/
  config/

stores/
  use-theme-store.ts

docs/
  adr/
```

## General principles

- `app/` is for routes and route composition (thin wrappers only).
- `features/` owns business logic — schema → api → hooks → screens 순서로 작성.
- `components/ui/` contains reusable primitives (React Native Reusables CLI로 추가).
- `lib/` contains cross-feature infrastructure (query client, storage utils, config).
- `stores/` contains global state only when it truly needs to be global.
- Import alias: `@/*` → 프로젝트 루트 (e.g., `import { Button } from "@/components/ui/button"`).
- File naming: **kebab-case** for files (`user-profile-screen.tsx`), **PascalCase** for components.
- **Zod 4 top-level API 필수** — `z.email()`, `z.url()` 등 사용. `z.string().email()` 금지.
- **Zustand 5**: 셀렉터에서 객체 반환 시 `useShallow` 필수.
- React Compiler가 활성화되어 있으므로 수동 `useMemo`/`useCallback` 남용을 피한다.
- Typed Routes가 활성화되어 있으므로 navigation에 타입 안전한 경로를 사용한다.
