# Routing and navigation guide

Use this document when adding screens, tabs, stacks, links, or navigation behavior.

## Default routing system

Use Expo Router.

Expo Router uses the file system under `app/` to define routes. When a new screen file is added under `app/`, it becomes a route.

## Common patterns

```txt
app/
  _layout.tsx
  index.tsx
  (auth)/
    _layout.tsx
    sign-in.tsx
    sign-up.tsx
  (tabs)/
    _layout.tsx
    home.tsx
    settings.tsx
  users/
    [id].tsx
```

## Rules

- Use route groups like `(auth)` and `(tabs)` for organization.
- Keep route files thin.
- Move reusable UI into `components/`.
- Move feature logic into `features/<feature>/`.
- Prefer `<Link />` for declarative navigation.
- Prefer router helpers only when navigation is imperative.
- Do not manually duplicate route constants unless typed routes are not enabled.

## Route file checklist

A route file should usually:

1. Import a screen component from `features/*/screens`.
2. Compose layout-level behavior.
3. Avoid direct API calls unless the screen is tiny.
4. Avoid defining large schemas or stores inline.

Example:

```tsx
import { SignInScreen } from "@/features/auth/screens/sign-in-screen";

export default SignInRoute() {
  return <SignInScreen />;
}
```
