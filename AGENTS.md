# AGENTS.md

> 이 파일은 코딩 에이전트용 프로젝트 길라잡이입니다.  
> 자세한 구현 설명을 길게 적기보다, "어떤 작업을 할 때 어떤 문서를 먼저 확인해야 하는지"를 안내합니다.

## Project baseline

- App type: React Native app built with Expo
- Language: TypeScript (strict mode)
- Expo SDK: **54** (`expo@~54.0.33`)
- React Native: **0.81.5**
- React: **19.1**
- Routing: **Expo Router v6** (`expo-router@~6.0.23`) — Typed Routes 활성화
- Styling: **NativeWind v4** (`nativewind@^4.2.3`) + Tailwind CSS 3 (`tailwindcss@^3.4.19`)
- Reusable UI: React Native Reusables (CLI: `@react-native-reusables/cli`) first, custom components second
- Server state: **TanStack Query v5** (`@tanstack/react-query@^5.100.9`)
- Forms and validation: **React Hook Form v7** (`react-hook-form@^7.75.0`) + **Zod 4** (`zod@^4.4.2`)
- Client/global state: **Zustand 5** (`zustand@^5.0.12`)
- Animation: `react-native-reanimated@~4.1.1` + `react-native-worklets@0.5.1` (Reanimated 4 필수 의존성)
- Local storage:
  - Non-sensitive small values: AsyncStorage or **MMKV** (`react-native-mmkv@^4.3.1`)
  - Sensitive values: Expo SecureStore
  - Structured offline data: Expo SQLite + Drizzle (optional, 미설치)
- Architecture: **New Architecture 활성화** (`newArchEnabled: true`)
- React Compiler: **실험적 활성화** (`reactCompiler: true`)
- Typed Routes: **활성화** (`typedRoutes: true`)
- Import alias: `@/*` → 프로젝트 루트 (e.g., `import { Button } from "@/components/ui/button"`)
- File naming: **kebab-case** for files (`sign-in-screen.tsx`), **PascalCase** for components (`SignInScreen`)
- Baseline date: 2026-05-04

> **⚠️ Zod 4 필수**: 이 프로젝트는 Zod v4를 사용합니다. **반드시** Zod 4 top-level API(`z.email()`, `z.url()` 등)를 사용하세요. `z.string().email()` 같은 Zod 3 문법은 금지합니다. 자세한 내용은 `docs/05-forms-validation.md`를 참고하세요.

> **⚠️ Zustand 5 필수 패턴**: 셀렉터에서 여러 값을 선택할 때는 반드시 `useShallow`를 사용하세요. 자세한 내용은 `docs/06-state-storage.md`를 참고하세요.

If this repository is upgraded after React Native, Expo SDK, NativeWind, or Expo Router releases, check `docs/09-release-upgrade.md` before changing setup code.

## Read this first

Before making changes, read:

1. `docs/00-prd-core.md` (몬스터즈 계산기 핵심 기획)
2. `docs/01-prd-calculator.md` (메인 계산기 스펙)
3. `docs/02-prd-quick-calc.md` (빠른 계산 스펙)
4. The task-specific technical document listed below
5. Any related ADR under `docs/adr/`

## 몬스터즈 계산기 기획 문서 참조 가이드

AI 에이전트가 개발을 진행할 때, 작업 도메인에 따라 아래의 PRD 문서를 분리해서 참조하세요.

- **전체 기획/컨셉 파악이 필요할 때:** `docs/00-prd-core.md` 참조
  - (프로젝트 목표, 앱 네비게이션 구조, 캐릭터 '블루우' 컨셉, MVP 제외 스펙)
- **메인 계산기 UI 및 계산/캐릭터 로직을 작업할 때:** `docs/01-prd-calculator.md` 참조
  - (사칙연산 로직, 결과창 UI, 블루우의 상태별 리액션(idle, input, success, error) 조건)
- **빠른 계산(더치페이, 할인 등) 화면을 작업할 때:** `docs/02-prd-quick-calc.md` 참조
  - (빠른 계산 4종 카드 UI 및 산출 로직)

## 새 기능 추가 워크플로우

새로운 기능을 추가할 때는 이 순서를 따르세요:

### 1. Feature 모듈 생성

```txt
features/<feature-name>/
  api.ts           # API 함수 (fetch, mutate)
  hooks.ts         # useQuery/useMutation wrapper
  schema.ts        # Zod 4 스키마
  store.ts         # Zustand store (필요 시만)
  components/      # 기능 전용 컴포넌트
  screens/         # 기능 전용 화면 컴포넌트
```

### 2. Route 연결

```tsx
// app/(tabs)/new-feature.tsx
import { NewFeatureScreen } from "@/features/new-feature/screens/new-feature-screen";

export default function NewFeatureRoute() {
  return <NewFeatureScreen />;
}
```

### 3. 코드 작성 원칙

```txt
① schema.ts  → Zod 4 스키마 정의 (top-level API 필수)
② api.ts     → fetch 함수 (프레임워크 독립적)
③ hooks.ts   → queryOptions() + useQuery/useMutation
④ screens/   → 화면 컴포넌트 (로딩/에러/빈 상태 처리)
⑤ app/       → 라우트 파일 (thin wrapper)
```

### 완전한 예시: 사용자 프로필 기능

```ts
// features/user/schema.ts
import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().check(z.minLength(1)),
  email: z.email(),
  avatarUrl: z.url().optional(),
});

export type User = z.infer<typeof userSchema>;
```

```ts
// features/user/api.ts
import { userSchema } from "./schema";

export async function getUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  const data = await res.json();
  return userSchema.parse(data);
}
```

```ts
// features/user/hooks.ts
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getUser } from "./api";

export function userQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["users", id],
    queryFn: () => getUser(id),
  });
}

export function useUser(id: string) {
  return useQuery(userQueryOptions(id));
}
```

```tsx
// features/user/screens/user-profile-screen.tsx
import { View, Text, ActivityIndicator } from "react-native";
import { useUser } from "../hooks";

interface Props {
  userId: string;
}

export function UserProfileScreen({ userId }: Props) {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-destructive">사용자 정보를 불러올 수 없습니다</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted-foreground">사용자를 찾을 수 없습니다</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4 pt-6">
      <Text className="text-2xl font-bold text-foreground">{user.name}</Text>
      <Text className="text-sm text-muted-foreground">{user.email}</Text>
    </View>
  );
}
```

## Task-to-document map

### Project setup, package install, environment fixes

Read:

- `docs/01-setup-installation.md`
- `docs/09-release-upgrade.md`

Rules:

- Prefer `npx expo install` for Expo/RN native dependencies.
- Do not blindly install `@latest` for native modules.
- Keep the lockfile consistent with the existing package manager (npm).
- Do not introduce a new package manager without explicit approval.
- Node.js ≥ 20, Xcode ≥ 16.1 required.

### Routing, screens, tabs, stack navigation, deep links

Read:

- `docs/02-routing-navigation.md`

Rules:

- Use Expo Router file-based routing.
- Add screens under `app/`.
- Keep reusable screen logic outside `app/` when it is not routing-specific.
- **Typed Routes가 활성화되어 있음** — `href`에 문자열 리터럴 대신 타입 안전한 경로를 사용하세요.
- Use `<Link>` for declarative navigation and `router` for imperative navigation.

### Styling, design tokens, UI components

Read:

- `docs/03-ui-styling-components.md`

Rules:

- Use NativeWind v4 classes for layout and basic styling.
- Use components from `components/ui/` before creating new variants.
- For complex reusable UI, prefer React Native Reusables patterns.
- Add new components via CLI: `npx @react-native-reusables/cli@latest add <component>`.
- Do not mix many UI systems in one feature unless the docs say it is allowed.
- **NativeWind v5는 프리릴리스 상태** — 승인 없이 v5로 마이그레이션하지 마세요.

### API calls, server data, loading/error states

Read:

- `docs/04-data-fetching-server-state.md`

Rules:

- Use TanStack Query v5 for server state.
- Prefer `queryOptions()` helper for query configuration.
- Do not put server-fetched data into Zustand unless there is a clear reason.
- Keep API request functions in feature-level `api.ts` files.
- Validate unsafe API responses with Zod where practical.
- **반드시 로딩/에러/빈 상태를 명시적으로 처리하세요.**

### Forms, validation, schema reuse

Read:

- `docs/05-forms-validation.md`

Rules:

- Use React Hook Form for non-trivial forms.
- **Zod 4 top-level API 필수** — `z.email()`, `z.url()`, `z.uuid()` 등을 사용하세요. `z.string().email()` 금지.
- Keep form schemas close to the feature that owns them.
- Reuse Zod schemas for API payload validation when possible.

### Global state, app preferences, auth session, local persistence

Read:

- `docs/06-state-storage.md`

Rules:

- Use Zustand 5 for client UI state and local app state.
- Use TanStack Query for server state.
- Store secrets in SecureStore, not AsyncStorage.
- Persist only what must survive app restart.
- **Use `useShallow`** when selecting multiple values from a store to prevent unnecessary re-renders.

### Offline-first data, local tables, sync queues

Read:

- `docs/07-local-db-offline.md`

Rules:

- Use SQLite/Drizzle only when key-value storage is not enough.
- Keep local DB schema changes explicit.
- Do not store sensitive tokens in SQLite.
- Configure `metro.config.js` to resolve `.sql` files when using Drizzle migrations.

### Testing, linting, type checking, quality gates

Read:

- `docs/08-quality-testing.md`

Rules:

- Run the smallest relevant validation first.
- Before finishing, run lint/typecheck/tests when available.
- Add tests for bug fixes and logic-heavy changes.
- Note: `npm run typecheck` is not yet defined — suggest adding it if needed.

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
app/                    # Expo Router routes only (thin wrappers)
components/             # Shared reusable components
components/ui/          # Design-system-like primitives (RN Reusables)
features/               # Feature modules (비즈니스 로직의 중심)
lib/                    # Cross-feature utilities and clients
stores/                 # Global Zustand stores
docs/                   # Human/agent development docs
docs/adr/               # Architecture decision records
```

Feature modules should generally look like:

```txt
features/auth/
  api.ts                # API 호출 함수 (프레임워크 독립적)
  hooks.ts              # useQuery/useMutation wrapper
  schema.ts             # Zod 4 스키마 + 타입 추론
  store.ts              # Zustand store (필요 시만)
  components/           # 기능 전용 컴포넌트
  screens/              # 기능 전용 화면 컴포넌트
```

## Coding rules

- Use TypeScript (strict mode enabled).
- Prefer named exports for shared utilities/components.
- Keep files small enough to understand quickly.
- Do not hide network calls inside UI components — `api.ts` → `hooks.ts` → screen 순서로 분리.
- Do not create global state for data that belongs to a single screen.
- Do not add new dependencies when a simple local utility is enough.
- Prefer explicit error/loading/empty states for user-facing screens.
- Keep platform-specific behavior isolated with `.ios.tsx`, `.android.tsx`, or small platform helpers.
- **React Compiler가 활성화되어 있음** — `useMemo`, `useCallback`을 수동으로 과다 사용하지 마세요. 컴파일러가 자동 메모이제이션을 처리합니다. 단, 복잡한 참조 안정성이 필요한 경우는 예외입니다.
- **Zod 4 필수**: `z.email()`, `z.url()` 등 top-level API만 사용. `z.string().email()` 금지.
- **Zustand 5**: 셀렉터에서 객체를 반환할 때는 `useShallow`를 사용.

### 에이전트가 자주 실수하는 패턴

```tsx
// ❌ React Web 패턴 — React Native에서 동작하지 않음
<form onSubmit={handleSubmit}>
<input onChange={handleChange} />

// ✅ React Native 패턴
<View>
  <Controller
    control={control}
    name="email"
    render={({ field: { onChange, onBlur, value } }) => (
      <TextInput onChangeText={onChange} onBlur={onBlur} value={value} />
    )}
  />
  <Pressable onPress={handleSubmit(onSubmit)}>
    <Text>Submit</Text>
  </Pressable>
</View>
```

```tsx
// ❌ className을 style 대신 모든 RN 컴포넌트에 사용
<Image className="w-20 h-20" />  // Image에 cssInterop 없이 사용 불가

// ✅ cssInterop으로 래핑한 뒤 사용
import { cssInterop } from "nativewind";
import { Image } from "expo-image";
cssInterop(Image, { className: "style" });
<Image className="w-20 h-20" />   // 이제 동작
```

```tsx
// ❌ Zod 3 문법 (금지)
const schema = z.object({
  email: z.string().email(),
  age: z.number().int().positive(),
});

// ✅ Zod 4 문법 (필수)
const schema = z.object({
  email: z.email(),
  age: z.int().check(z.positive()),
});
```

```ts
// ❌ Zustand 5 — useShallow 없이 객체 선택
const { name, age } = useStore((s) => ({ name: s.name, age: s.age }));

// ✅ Zustand 5 — useShallow 필수
import { useShallow } from "zustand/shallow";
const { name, age } = useStore(useShallow((s) => ({ name: s.name, age: s.age })));
```

## Validation checklist before completing a task

Run commands that exist in this repo:

```bash
npm run lint
npm run typecheck   # ⚠️ 현재 미정의 — 없으면 `npx tsc --noEmit` 직접 실행
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
