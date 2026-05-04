# Release and upgrade guide

Use this document when upgrading Expo SDK, React Native, NativeWind, Expo Router, or native modules.

## Current project versions (2026-05-04)

```txt
Expo SDK:          54 (expo@~54.0.33)
React Native:      0.81.5
React:             19.1
Expo Router:       6 (expo-router@~6.0.23)
NativeWind:        4 (nativewind@^4.2.3 + tailwindcss@^3.4.19)
Zod:               4 (zod@^4.4.2)
Zustand:           5 (zustand@^5.0.12)
TanStack Query:    5 (@tanstack/react-query@^5.100.9)
Reanimated:        4 (react-native-reanimated@~4.1.1)
Architecture:      New Architecture (enabled)
```

## General upgrade rules

- Keep upgrades separate from feature work.
- Upgrade one major area at a time.
- Read official migration notes before changing config.
- Prefer `npx expo install` for native dependencies.
- Run `npx expo-doctor` after dependency changes.
- Test Android, iOS, and Web if the project targets all three.

---

## React Native release awareness

React Native ships frequent minor releases. Do not assume library compatibility based only on version numbers.

When upgrading:

1. Check current React Native release status.
2. Check Expo SDK compatibility.
3. Check New Architecture compatibility for native modules.
4. Check NativeWind/Reanimated/Babel/Metro configuration.
5. Run the app on supported platforms.

## Expo SDK upgrade checklist

- Check Expo SDK release notes.
- Run the recommended Expo upgrade command:
  ```bash
  npx expo install expo@^<NEW_VERSION>
  npx expo install --fix
  npx expo-doctor
  ```
- Reinstall native dependencies with Expo-compatible versions.
- Verify `app.json` / `app.config.ts`.
- Verify EAS Build config if used.

---

## SDK 55 참고 정보

> SDK 55 (Feb 2026)가 현재 최신 안정 버전입니다. 이 프로젝트는 SDK 54입니다. 업그레이드가 필요할 때 참고하세요.

주요 변경사항:

- **New Architecture 필수**: Legacy Architecture 지원 완전 제거 (이 프로젝트는 이미 `newArchEnabled: true`)
- **React Native 0.83** + React 19.2
- **패키지 버전 SDK-aligned**: 모든 Expo 패키지가 SDK 번호와 정렬
- **expo-av deprecated** → `expo-audio` + `expo-video`로 분리
- **Development Builds 권장**: Expo Go보다 `expo-dev-client` 사용 권장

업그레이드 시 주의:

- `react-native-reanimated` 호환 버전 확인 (4.3.0+ for SDK 55)
- `react-native-worklets` 호환 버전도 함께 확인

---

## NativeWind upgrade checklist

### v4 → v4 patch (safe)

```bash
npx expo install nativewind
npm install -D tailwindcss@^3.4
```

### v4 → v5 (major — 승인 필요)

> **⚠️ NativeWind v5는 현재 프리릴리스 상태입니다.** 승인 없이 마이그레이션하지 마세요.

v5 마이그레이션 시 변경 사항:

| 영역 | v4 | v5 |
|---|---|---|
| Tailwind | v3 (`tailwind.config.js`) | v4 (CSS-first, `@theme`) |
| Core | `nativewind` + `react-native-css-interop` | `nativewind` wraps `react-native-css` |
| JSX | Babel JSX transform | Import rewrite system |
| Setup | `babel.config.js` + `metro.config.js` | `postcss.config.mjs` 추가 |

---

## Zod 3 → Zod 4 migration

> **이 프로젝트는 이미 Zod 4로 마이그레이션 완료되었습니다** (`zod@^4.4.2`).

기존 Zod 3 코드를 발견하면 자동 코드모드를 사용하세요:

```bash
npx @zod/codemod --transform v3-to-v4 ./src
```

주요 변경점은 `docs/05-forms-validation.md`를 참조하세요. **Zod 4 top-level API 사용이 필수입니다.**

---

## Dependency change checklist

Before adding a dependency, answer:

1. Is it necessary?
2. Is it maintained?
3. Does it support Expo?
4. Does it support the current RN architecture (New Architecture)?
5. Does it work on Android/iOS/Web if required?
6. Is there a lighter built-in alternative?
7. `npx expo-doctor` 통과하는가?
