# Project overview

이 문서는 React Native + Expo 프론트엔드 프로젝트의 기본 방향을 정리합니다.

## Goals

- Android, iOS, Web을 하나의 TypeScript 코드베이스로 운영한다.
- Expo 생태계를 우선 사용해 네이티브 설정 부담을 줄인다.
- 서버 상태, 클라이언트 상태, 로컬 저장소의 책임을 분리한다.
- UI는 NativeWind 기반으로 빠르게 만들되, 재사용 가능한 컴포넌트를 축적한다.
- 앱이 커져도 기능 단위로 유지보수할 수 있는 구조를 유지한다.

## Default stack

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

## State responsibility

| Type | Use |
|---|---|
| Server state | TanStack Query |
| Form state | React Hook Form |
| Validation | Zod |
| UI/global client state | Zustand |
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

- `app/` is for routes and route composition.
- `features/` owns business logic.
- `components/ui/` contains reusable primitives.
- `lib/` contains cross-feature infrastructure.
- `stores/` contains global state only when it truly needs to be global.
