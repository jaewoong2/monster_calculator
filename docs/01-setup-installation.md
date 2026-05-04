# Setup and installation guide

이 문서는 프로젝트 생성, 의존성 설치, 개발 환경 설정 시 확인합니다.

## Create project

```bash
npx create-expo-app@latest my-app
cd my-app
```

If a specific Expo SDK template is required, use the versioned template recommended by Expo at the time of setup.

## Package manager

Pick one package manager and keep it consistent.

Recommended priority:

1. pnpm
2. npm
3. yarn
4. bun

Do not mix lockfiles.

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
npx expo install react-native-reanimated react-native-gesture-handler
npm install @tanstack/react-query zod zustand react-hook-form
```

## Core dependencies

```bash
npm install @tanstack/react-query zod react-hook-form @hookform/resolvers zustand
npx expo install expo-secure-store @react-native-async-storage/async-storage expo-image
npx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context
```

## NativeWind v4

```bash
npx expo install nativewind react-native-reanimated react-native-safe-area-context
npm install -D tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11
npx tailwindcss init
```

Expected files:

```txt
global.css
tailwind.config.js
babel.config.js
metro.config.js
```

## Validation after setup

```bash
npx expo start
npx expo-doctor
npm run lint
npm run typecheck
```

Only run commands that exist in the project.
