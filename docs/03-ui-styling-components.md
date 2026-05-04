# UI, styling, and components guide

Use this document when adding or changing styles, shared UI, layout, theme, or design tokens.

## Default styling

Use **NativeWind v4** for React Native styling. NativeWind v4는 Tailwind CSS 3 기반입니다.

Prefer:

```tsx
<View className="flex-1 bg-background px-4">
  <Text className="text-lg font-semibold text-foreground">Title</Text>
</View>
```

Avoid:

- Large inline style objects in screen files
- Mixing multiple styling systems without a reason
- Hardcoding repeated spacing/color values
- `StyleSheet.create()` when NativeWind class로 충분한 경우

## NativeWind — React Native에서 안 되는 것들

React Web의 Tailwind와 달리, **NativeWind에서는 일부 클래스가 동작하지 않습니다**:

```tsx
// ❌ 동작하지 않는 클래스들
<View className="grid grid-cols-3" />       // CSS Grid 미지원 → flexbox 사용
<View className="hover:bg-gray-100" />      // hover 미지원 (모바일)
<Text className="line-clamp-2" />           // line-clamp 미지원 → numberOfLines prop
<View className="transition-all" />         // CSS transition 미지원 → Reanimated
<View className="cursor-pointer" />         // cursor 미지원 (모바일)
<View className="backdrop-blur-sm" />       // backdrop-filter 미지원

// ✅ React Native 대안
<View className="flex-row flex-wrap" />     // grid 대신 flexbox
<Text numberOfLines={2} className="text-sm" />
// hover/transition → Pressable + Reanimated
```

### gap 지원 (RN 0.71+)

```tsx
// ✅ gap은 지원됩니다
<View className="flex-row gap-4">
  <View className="flex-1" />
  <View className="flex-1" />
</View>
```

## NativeWind version policy

- **v4 (현재)**: 안정 버전. Tailwind CSS 3 + `tailwind.config.js` 기반.
- **v5 (프리릴리스)**: Tailwind CSS 4 기반, CSS-first 설정. **승인 없이 v5로 마이그레이션 금지.**

## UI component priority

1. Existing component in `components/ui/` (이미 복사된 RN Reusables)
2. Existing feature component in `features/<feature>/components/`
3. React Native Reusables에서 새로 추가 (CLI)
4. New custom component

## React Native Reusables

React Native Reusables는 shadcn/ui 스타일의 copy-paste 기반 컴포넌트 시스템입니다.

### CLI로 컴포넌트 추가

```bash
npx @react-native-reusables/cli@latest add button
npx @react-native-reusables/cli@latest add dialog
npx @react-native-reusables/cli@latest add input
```

- 컴포넌트는 `components/ui/`에 복사됩니다.
- 프로젝트가 코드를 소유하므로 자유롭게 수정 가능합니다.
- Radix primitives 기반으로 접근성이 내장되어 있습니다.

### 설정 확인

```bash
npx @react-native-reusables/cli@latest doctor
```

## Component rules

- Shared primitive components go in `components/ui/`.
- Feature-specific components stay in `features/<feature>/components/`.
- Keep components controlled when used in forms (`Controller` 사용).
- Do not import feature-specific code into `components/ui/`.

## 화면 컴포넌트 패턴

모든 사용자 대면 화면은 **로딩/에러/빈 상태**를 명시적으로 처리해야 합니다:

```tsx
export function UserListScreen() {
  const { data, isLoading, error } = useUsers();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-lg font-semibold text-destructive">오류 발생</Text>
        <Text className="mt-2 text-center text-muted-foreground">
          {error.message}
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">데이터가 없습니다</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      contentContainerClassName="p-4 gap-3"
      renderItem={({ item }) => <UserCard user={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}
```

## Suggested UI primitives

```txt
Button
Input
TextArea
Card
Badge
Avatar
Dialog
Sheet
Toast
Skeleton
EmptyState
ErrorState
```

## Design tokens

Prefer semantic names (NativeWind + CSS variables in `global.css`):

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --primary: 221 83% 53%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --border: 214 32% 91%;
    --destructive: 0 84% 60%;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --primary: 217 91% 60%;
    --primary-foreground: 221 83% 12%;
    --muted: 215 28% 17%;
    --muted-foreground: 217 11% 65%;
    --border: 215 28% 17%;
    --destructive: 0 63% 31%;
  }
}
```

```js
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{tsx,ts}", "./components/**/*.{tsx,ts}", "./features/**/*.{tsx,ts}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        border: "hsl(var(--border))",
        destructive: "hsl(var(--destructive))",
      },
    },
  },
  plugins: [],
};
```

## Dark mode

NativeWind v4에서 다크 모드를 사용하려면:

```tsx
// 조건부 클래스
<View className="bg-background">
  <Text className="text-foreground">자동으로 다크 모드 대응</Text>
</View>

// CSS 변수 기반이므로 .dark 클래스 토글 시 자동 전환
```

`app.json`에 `"userInterfaceStyle": "automatic"`이 설정되어 있어 시스템 설정을 따릅니다.

## Animation and gesture

Use:

- `react-native-reanimated` (v4) for animation — `react-native-worklets` 필수 동반 설치
- `react-native-gesture-handler` for gestures
- `@gorhom/bottom-sheet` for bottom sheets

React Compiler가 활성화되어 있으므로 일반 컴포넌트에 수동 `useMemo`/`useCallback` 불필요. 단, Reanimated의 `useAnimatedStyle`, `useSharedValue` 등은 Reanimated 자체 메커니즘이므로 그대로 사용.

## cssInterop / remapProps

NativeWind v4에서 서드파티 컴포넌트에 `className`을 적용하려면:

```ts
// lib/nativewind-interop.ts
import { cssInterop } from "nativewind";
import { Image } from "expo-image";

cssInterop(Image, { className: "style" });
```

이 파일을 `_layout.tsx` 상단에서 import하면 앱 전체에서 사용 가능:

```tsx
// app/_layout.tsx
import "@/lib/nativewind-interop";
```

그 후:

```tsx
<Image className="w-20 h-20 rounded-full" source={{ uri: avatarUrl }} />
```
