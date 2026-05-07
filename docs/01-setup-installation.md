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

## iPhone real-device dev build

이 프로젝트는 `react-native-mmkv`, `react-native-nitro-modules` 같은 네이티브 모듈을 사용합니다. 따라서 실제 iPhone 테스트는 **Expo Go가 아니라 iOS dev build**를 기준 경로로 사용합니다.

### Prerequisites

- macOS + Xcode 설치
- iPhone을 USB로 연결
- iPhone에서 **이 컴퓨터 신뢰** 허용
- Xcode에 Apple ID 로그인
- Mac과 iPhone이 같은 네트워크에 연결되어 있어야 Metro 연결이 안정적입니다.

### First install

터미널 1:

```bash
npm install
npm start
```

터미널 2:

```bash
npx expo run:ios --device
```

연결된 iPhone을 선택하면 네이티브 앱을 빌드하고 기기에 설치합니다.

### Reinstall after code/native changes

JS만 수정했으면 Metro가 켜진 상태에서 앱을 다시 열면 됩니다.

네이티브 설정, `app.json`, native dependency, iOS generated project가 바뀌었으면 다시 설치합니다:

```bash
npx expo run:ios --device
```

Metro 캐시가 의심되면:

```bash
npm start -- --clear
```

### Trust developer profile

설치 후 실행이 막히면 iPhone에서 개발자 인증서를 신뢰해야 합니다:

```txt
설정 → 일반 → VPN 및 기기 관리 → Developer App → Apple Development 계정 → 신뢰
```

### Signing errors

다음 같은 에러가 나면 Xcode signing 설정 문제입니다:

```txt
No profiles for '<bundle id>' were found
Automatic signing is disabled
```

조치:

1. `ios/monsterscalculator.xcworkspace`를 Xcode로 엽니다.
2. app target의 `Signing & Capabilities`에서 Team을 지정합니다.
3. 필요하면 `app.json`의 `expo.ios.bundleIdentifier`를 본인 계정에서 고유한 값으로 변경합니다.
4. 다시 실행합니다:

```bash
npx expo run:ios --device
```

### Missing iOS platform/device support

다음 같은 에러가 나면 Xcode의 iOS platform/device support가 부족한 상태입니다:

```txt
iOS <version> is not installed
Unable to find a destination matching the provided destination specifier
```

우선 Xcode에서 설치합니다:

```txt
Xcode → Settings → Components → iOS platform 설치
```

CLI로 설치해야 하면:

```bash
xcodebuild -downloadPlatform iOS
```

### `No script URL provided` runtime error

실기기에서 다음 에러가 뜨면 앱이 JS bundle을 못 찾은 상태입니다:

```txt
No script URL provided. Make sure the packager is running or you have embedded a JS bundle in your application bundle.
unsanitizedScriptURLString = (null)
```

해결 순서:

1. Metro가 켜져 있는지 확인합니다.

```bash
lsof -nP -iTCP:8081 -sTCP:LISTEN
```

2. Metro가 없으면 실행합니다.

```bash
npm start
```

3. iPhone과 Mac이 같은 네트워크인지 확인합니다.
4. 앱을 완전히 종료한 뒤 다시 엽니다.
5. 계속 실패하면 Metro를 켠 상태에서 다시 설치/실행합니다.

```bash
npx expo run:ios --device
```

### Local path caveat

iOS/Xcode shell scripts는 공백이 들어간 프로젝트 경로에서 깨질 수 있습니다. 예를 들어 다음 에러가 나면 경로 공백 문제일 가능성이 큽니다:

```txt
bash: /Users/<user>/Desktop/: is a directory
```

가장 안정적인 해결책은 repo를 공백 없는 경로에 두는 것입니다:

```txt
~/Developer/monsters_calculator
```

이미 `ios/`가 생성된 뒤 경로를 옮겼다면 네이티브 프로젝트를 다시 생성하는 편이 안전합니다:

```bash
rm -rf ios
npx expo prebuild --platform ios
npx expo run:ios --device
```

## Validation after setup

```bash
npx expo start
npx expo-doctor
npm run lint
npx tsc --noEmit       # typecheck — npm run typecheck가 미정의이므로 직접 실행
```

Only run commands that exist in the project.
