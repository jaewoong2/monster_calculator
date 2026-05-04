# UI, styling, and components guide

Use this document when adding or changing styles, shared UI, layout, theme, or design tokens.

## Default styling

Use NativeWind v4 for React Native styling.

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

## UI component priority

1. Existing component in `components/ui/`
2. Existing feature component in `features/<feature>/components/`
3. React Native Reusables pattern/component
4. New custom component

## Component rules

- Shared primitive components go in `components/ui/`.
- Feature-specific components stay in `features/<feature>/components/`.
- Keep components controlled when used in forms.
- Do not import feature-specific code into `components/ui/`.

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

Prefer semantic names:

```txt
background
foreground
primary
primary-foreground
muted
muted-foreground
border
destructive
```

## Animation and gesture

Use:

- `react-native-reanimated` for animation
- `react-native-gesture-handler` for gestures
- `@gorhom/bottom-sheet` for bottom sheets

Do not hand-roll complex gestures when a maintained library already solves the problem.
