# Release and upgrade guide

Use this document when upgrading Expo SDK, React Native, NativeWind, Expo Router, or native modules.

## General upgrade rules

- Keep upgrades separate from feature work.
- Upgrade one major area at a time.
- Read official migration notes before changing config.
- Prefer `npx expo install` for native dependencies.
- Run `npx expo-doctor` after dependency changes.
- Test Android, iOS, and Web if the project targets all three.

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
- Run the recommended Expo upgrade command.
- Reinstall native dependencies with Expo-compatible versions.
- Verify `app.json` / `app.config.ts`.
- Verify EAS Build config if used.
- Run `npx expo-doctor`.

## NativeWind upgrade checklist

- Check whether the project is on NativeWind v4 or v5.
- Do not migrate to a pre-release/still-changing major version without approval.
- Validate:
  - `global.css`
  - `tailwind.config.js`
  - `babel.config.js`
  - `metro.config.js`
  - TypeScript className types

## Dependency change checklist

Before adding a dependency, answer:

1. Is it necessary?
2. Is it maintained?
3. Does it support Expo?
4. Does it support the current RN architecture?
5. Does it work on Android/iOS/Web if required?
6. Is there a lighter built-in alternative?
