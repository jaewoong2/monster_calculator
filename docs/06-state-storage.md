# State and storage guide

Use this document when adding global state, persistence, auth session storage, preferences, or local key-value data.

## State decision table

| Need | Use |
|---|---|
| API/server data | TanStack Query v5 |
| Screen-only UI state | `useState` or local reducer |
| App-wide UI state | Zustand 5 |
| Form state | React Hook Form v7 |
| Non-sensitive persisted values | AsyncStorage or MMKV |
| Sensitive values | Expo SecureStore |
| Structured offline tables | SQLite + Drizzle |

## Zustand 5 rules

> **이 프로젝트는 Zustand 5를 사용합니다.** v4와의 주요 차이점에 주의하세요.

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

### Store 정의 패턴

```ts
import { create } from "zustand";

interface ThemeState {
  mode: "light" | "dark" | "system";
  setMode: (mode: ThemeState["mode"]) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "system",
  setMode: (mode) => set({ mode }),
}));
```

### useShallow (필수 패턴)

Zustand 5에서 여러 값을 선택할 때는 **반드시 `useShallow`를 사용**하세요. 새 객체 참조가 매번 생성되어 불필요한 리렌더가 발생하는 것을 방지합니다:

```ts
import { useShallow } from "zustand/shallow";

// ✅ Good — useShallow로 불필요한 리렌더 방지
const { mode, setMode } = useThemeStore(
  useShallow((state) => ({
    mode: state.mode,
    setMode: state.setMode,
  }))
);

// ✅ Good — 단일 값은 useShallow 불필요
const mode = useThemeStore((state) => state.mode);

// ❌ Bad — 매번 새 객체 참조 → 무한 리렌더
const { mode, setMode } = useThemeStore((state) => ({
  mode: state.mode,
  setMode: state.setMode,
}));
```

### Custom equality (필요 시)

Zustand 5에서 `create()`는 custom equality function을 지원하지 않습니다. 복잡한 비교가 필요하면:

```ts
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

const useStore = createWithEqualityFn<State>()(
  (set) => ({ ... }),
  shallow
);
```

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

Use for small, non-sensitive values. 비동기 API.

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";

await AsyncStorage.setItem("locale", "ko");
const locale = await AsyncStorage.getItem("locale");
```

### MMKV (권장 — 이 프로젝트에 설치됨)

Use when **synchronous fast access** is important, or when app startup reads are frequent. MMKV는 AsyncStorage보다 훨씬 빠릅니다.

```ts
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();
storage.set("locale", "ko");
const locale = storage.getString("locale");
```

### Zustand persist + MMKV

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";

const mmkv = new MMKV();

const mmkvStorage = {
  getItem: (name: string) => mmkv.getString(name) ?? null,
  setItem: (name: string, value: string) => mmkv.set(name, value),
  removeItem: (name: string) => mmkv.delete(name),
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: "ko",
      setLocale: (locale: string) => set({ locale }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
```

### SecureStore

Use for secrets:

- access token
- refresh token
- session token
- device secret

Do not store secrets in AsyncStorage or MMKV.

```ts
import * as SecureStore from "expo-secure-store";

await SecureStore.setItemAsync("accessToken", token);
const token = await SecureStore.getItemAsync("accessToken");
```

## Auth token pattern

Preferred approach:

1. Store token in SecureStore.
2. Keep in-memory auth state in Zustand if needed.
3. Use TanStack Query invalidation after sign-in/sign-out.
4. Clear SecureStore and query cache on sign-out.

```ts
// features/auth/store.ts
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  signIn: () => set({ isAuthenticated: true }),
  signOut: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    queryClient.clear();
    set({ isAuthenticated: false });
  },
}));
```
