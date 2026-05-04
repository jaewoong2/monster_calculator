# Setup and installation guide

이 문서는 프로젝트 생성, 의존성 설치, 개발 환경 설정 시 확인합니다.

## Requirements

- **Node.js ≥ 20** (RN 0.81+ 요구사항)
- **Xcode ≥ 16.1** (iOS 빌드 시)
- macOS, Linux, or Windows (WSL recommended)

## Create project

```bash
npx create-expo-app@latest my-app
cd my-app
```

If a specific Expo SDK template is required, use the versioned template recommended by Expo at the time of setup.

## Package manager

이 프로젝트는 **npm**을 사용합니다. `package-lock.json`이 존재합니다.

Do not mix lockfiles. Do not switch package manager without approval.

## Install with Expo compatibility

For Expo/RN native dependencies, prefer:

```bash
npx expo install <package-name>
```

Use normal package manager install for JS-only packages:

```bash
npm install <package-name>
```

Examples:

```bash
# Native dependencies — use npx expo install
npx expo install react-native-reanimated react-native-gesture-handler react-native-worklets

# JS-only dependencies — use npm install
npm install @tanstack/react-query zod zustand react-hook-form
```

## Core dependencies (현재 설치됨)

### Native dependencies (npx expo install)

```bash
npx expo install expo-secure-store @react-native-async-storage/async-storage expo-image
npx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context
npx expo install react-native-screens react-native-worklets react-native-mmkv
```

> **Note**: `react-native-worklets`는 Reanimated 4의 필수 의존성입니다. Reanimated 설치 시 반드시 함께 설치하세요.

### JS dependencies (npm install)

```bash
npm install @tanstack/react-query zod react-hook-form @hookform/resolvers zustand
```

## NativeWind v4

이 프로젝트는 NativeWind **v4** + Tailwind CSS **3**을 사용합니다.

```bash
npx expo install nativewind react-native-reanimated react-native-safe-area-context
npm install -D tailwindcss@^3.4 prettier-plugin-tailwindcss
npx tailwindcss init
```

> **⚠️ NativeWind v5는 프리릴리스 상태입니다.** v5는 Tailwind CSS 4 기반이며 설정 방식이 완전히 다릅니다. 승인 없이 v5로 마이그레이션하지 마세요.

Expected files:

```txt
global.css
tailwind.config.js
babel.config.js (or metro transformer)
metro.config.js
```

## React Native Reusables

UI 컴포넌트는 React Native Reusables CLI로 추가합니다:

```bash
npx @react-native-reusables/cli@latest add <component-name>
```

컴포넌트는 `components/ui/`에 복사됩니다. 소유권이 프로젝트에 있으므로 자유롭게 수정 가능합니다.

## Architecture flags

`app.json`에 다음이 활성화되어 있습니다:

```jsonc
{
  "expo": {
    "newArchEnabled": true,
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
}
```

이 설정들을 임의로 변경하지 마세요.

## Validation after setup

```bash
npx expo start
npx expo-doctor
npm run lint
npx tsc --noEmit       # typecheck — npm run typecheck가 미정의이므로 직접 실행
```

Only run commands that exist in the project.
