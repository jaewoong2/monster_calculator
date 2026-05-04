# Quality and testing guide

Use this document before finishing a task or when adding tests.

## Validation commands

Run available commands only:

```bash
npm run lint                # ✅ 정의됨 — expo lint 실행
npm run typecheck           # ⚠️ 현재 미정의 — 아래 대안 사용
npx tsc --noEmit            # typecheck 대안 (직접 실행)
npm test                    # ⚠️ 현재 미정의 — Jest 설정 후 사용
npx expo-doctor             # Expo 의존성 호환성 검사
```

> **💡 권장**: 다음 스크립트를 `package.json`에 추가하면 에이전트와 개발자 모두 일관된 명령을 사용할 수 있습니다:
> ```json
> {
>   "scripts": {
>     "typecheck": "tsc --noEmit",
>     "test": "jest"
>   }
> }
> ```

If a command does not exist, mention it and suggest adding it.

## expo-doctor 결과 해석

`npx expo-doctor`는 다음을 검사합니다:

- Expo SDK와 native 패키지 버전 호환성
- 잘못된 의존성 버전
- config plugin 충돌
- 알려진 취약점

`ERROR`가 나오면 반드시 해결하세요. `WARNING`은 검토 후 판단합니다.

## Recommended tooling

- **ESLint** (v9 flat config — `eslint-config-expo@~10.0.0`)
- **Prettier** (+ `prettier-plugin-tailwindcss`)
- **TypeScript** strict mode (v5.9)
- **Jest** + `jest-expo`
- **React Native Testing Library** (`@testing-library/react-native`)
- **Maestro** for E2E flows

## What to test

Add tests for:

- bug fixes
- data transformation logic
- validation schemas (Zod 4)
- critical auth/session behavior
- complex hooks
- reusable UI behavior where practical

Do not over-test static layout-only components.

## Testing Zod 4 schemas

```ts
import { signInSchema } from "./schema";

describe("signInSchema", () => {
  it("accepts valid input", () => {
    const result = signInSchema.safeParse({
      email: "user@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signInSchema.safeParse({
      email: "not-email",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });
});
```

## Testing hooks with TanStack Query

```tsx
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
```

## Pull request checklist

- Lint passes (`npm run lint`)
- Typecheck passes (`npx tsc --noEmit`)
- Tests pass or missing test command is noted
- New dependencies are justified
- Native dependency compatibility is checked (`npx expo-doctor`)
- User-facing loading/error/empty states are handled
- Zod schemas use **Zod 4 top-level API 필수** (`z.email()`, not `z.string().email()`)
- Zustand selectors use `useShallow` when returning objects
