# Routing and navigation guide

Use this document when adding screens, tabs, stacks, links, or navigation behavior.

## Default routing system

Use **Expo Router v6** (`expo-router@~6.0.23`).

Expo Router uses the file system under `app/` to define routes. When a new screen file is added under `app/`, it becomes a route.

## Typed Routes

이 프로젝트는 `typedRoutes: true`가 활성화되어 있습니다.

- `<Link href="...">` 및 `router.push()`에서 타입 안전한 경로가 자동 완성됩니다.
- `.expo/types/router.d.ts`에 경로 타입이 자동 생성됩니다.
- 문자열 리터럴을 하드코딩하지 말고, 자동 완성된 타입을 사용하세요.
- `href` 타입 오류가 발생하면 `npx expo start`로 타입을 재생성하세요.

## Common patterns

```txt
app/
  _layout.tsx          # Root layout (Stack)
  index.tsx            # 홈 화면 route
  (auth)/
    _layout.tsx        # Auth group layout
    sign-in.tsx
    sign-up.tsx
  (tabs)/
    _layout.tsx        # Tab navigation layout
    home.tsx
    settings.tsx
  users/
    [id].tsx           # Dynamic route
```

## Layout 예시

### Root layout (Stack)

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

### Tab layout

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Auth group layout

```tsx
// app/(auth)/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
```

## Rules

- Use route groups like `(auth)` and `(tabs)` for organization.
- Keep route files thin — 화면 컴포넌트를 `features/*/screens/`에서 import만 하세요.
- Move reusable UI into `components/`.
- Move feature logic into `features/<feature>/`.
- Prefer `<Link />` for declarative navigation.
- Use `router.push()` / `router.replace()` only when navigation is imperative.
- Typed Routes가 활성화되어 있으므로 수동 route 상수를 중복 정의하지 마세요.

## Navigation 예시

### 선언적 (Link)

```tsx
import { Link } from "expo-router";

<Link href="/users/123">
  <Text className="text-primary">프로필 보기</Text>
</Link>
```

### 명령형 (router)

```tsx
import { router } from "expo-router";

function handleLogin() {
  // 로그인 성공 후
  router.replace("/(tabs)/home");
}
```

### Dynamic route params 읽기

```tsx
// app/users/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { UserProfileScreen } from "@/features/user/screens/user-profile-screen";

export default function UserRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <UserProfileScreen userId={id} />;
}
```

## Route file checklist

A route file should usually:

1. Import a screen component from `features/*/screens`.
2. Extract route params via `useLocalSearchParams`.
3. Pass params as props to the screen component.
4. **Avoid** direct API calls, large schemas, or stores inline.

Example (complete pattern):

```tsx
// app/(tabs)/home.tsx
import { HomeScreen } from "@/features/home/screens/home-screen";

export default function HomeRoute() {
  return <HomeScreen />;
}
```

## ⚠️ 흔한 실수

```tsx
// ❌ route 파일에 비즈니스 로직 직접 작성
export default function HomeRoute() {
  const { data } = useQuery(...);  // ← api 호출을 route 파일에 두지 마세요
  return <View>...</View>;
}

// ✅ screen 컴포넌트로 분리
export default function HomeRoute() {
  return <HomeScreen />;  // HomeScreen 내부에서 useQuery 사용
}
```
