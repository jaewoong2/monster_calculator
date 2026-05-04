# Forms and validation guide

Use this document when adding or changing forms, request payload validation, or schema logic.

## Default tools

- **React Hook Form v7** (`react-hook-form@^7.75.0`) for form state
- **Zod 4** (`zod@^4.4.2`) for validation
- `@hookform/resolvers/zod` to connect them

> **⚠️ Zod 4 top-level API 필수**: `z.string().email()` 같은 Zod 3 체이닝 문법은 금지입니다. 반드시 `z.email()` 같은 top-level API를 사용하세요.

## Zod 4 — 필수 API 가이드

### Top-level validators (필수)

```ts
// ❌ 금지 — Zod 3 체이닝 문법
z.string().email()
z.string().url()
z.string().uuid()
z.string().min(1)
z.number().int()
z.number().int().positive()

// ✅ 필수 — Zod 4 top-level API
z.email()
z.url()
z.uuid()
z.string().check(z.minLength(1))
z.int()
z.int().check(z.positive())
```

### Error handling (Zod 4 방식)

```ts
// ❌ Zod 3 방식
z.string({ required_error: "필수", invalid_type_error: "문자열이어야 합니다" })

// ✅ Zod 4 — 통합된 error 파라미터
z.string({ error: "문자열이어야 합니다" })
z.email({ error: "유효한 이메일을 입력하세요" })
```

### Object strictness (Zod 4 방식)

```ts
// ❌ Zod 3 방식
z.object({ ... }).strict()
z.object({ ... }).passthrough()

// ✅ Zod 4 — top-level functions
z.strictObject({ ... })   // 추가 필드 거부
z.looseObject({ ... })    // 추가 필드 허용
z.object({ ... })          // 추가 필드 strip (기본)
```

## Schema location

For feature-specific forms:

```txt
features/auth/schema.ts
features/profile/schema.ts
```

For shared schemas:

```txt
lib/schema/
```

## 완전한 Form 예시 (React Native)

> React Native에는 `<form>`, `<input>`, `onChange`가 없습니다. `Controller`와 `TextInput`을 사용하세요.

### 1. Schema 정의

```ts
// features/auth/schema.ts
import { z } from "zod";

export const signInSchema = z.object({
  email: z.email({ error: "유효한 이메일을 입력하세요" }),
  password: z.string().check(z.minLength(8, "8자 이상 입력하세요")),
});

export type SignInForm = z.infer<typeof signInSchema>;
```

### 2. Form 컴포넌트

```tsx
// features/auth/components/sign-in-form.tsx
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInForm } from "../schema";

interface Props {
  onSubmit: (data: SignInForm) => void;
  isPending?: boolean;
}

export function SignInFormComponent({ onSubmit, isPending }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <View className="gap-4">
      {/* Email */}
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">이메일</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="rounded-lg border border-border bg-background px-4 py-3 text-foreground"
              placeholder="email@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.email && (
          <Text className="text-sm text-destructive">{errors.email.message}</Text>
        )}
      </View>

      {/* Password */}
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">비밀번호</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="rounded-lg border border-border bg-background px-4 py-3 text-foreground"
              placeholder="8자 이상"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text className="text-sm text-destructive">{errors.password.message}</Text>
        )}
      </View>

      {/* Submit */}
      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
        className="items-center rounded-lg bg-primary py-3"
      >
        {isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-semibold text-primary-foreground">로그인</Text>
        )}
      </Pressable>
    </View>
  );
}
```

### 3. Screen에서 사용

```tsx
// features/auth/screens/sign-in-screen.tsx
import { View } from "react-native";
import { SignInFormComponent } from "../components/sign-in-form";
import { useSignIn } from "../hooks";

export function SignInScreen() {
  const signInMutation = useSignIn();

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <SignInFormComponent
        onSubmit={(data) => signInMutation.mutate(data)}
        isPending={signInMutation.isPending}
      />
    </View>
  );
}
```

## Rules

- Keep validation messages user-friendly (한글 메시지 권장).
- Do not duplicate form type definitions — `z.infer<typeof schema>`로 추론.
- **`Controller`를 반드시 사용** — React Native의 `TextInput`은 uncontrolled로 동작하지 않음.
- `onChangeText` 사용 (`onChange` 아님) — React Native에서 `onChange`는 nativeEvent를 전달.
- Do not put network mutations directly inside form components — mutation은 screen에서 주입.

## ⚠️ 흔한 실수

```tsx
// ❌ onChange 사용 (React Web 패턴)
<TextInput onChange={onChange} />  // nativeEvent 객체가 전달됨

// ✅ onChangeText 사용 (React Native 패턴)
<TextInput onChangeText={onChange} />  // 문자열이 직접 전달됨
```

```tsx
// ❌ register 사용 (React Native에서 동작하지 않음)
<TextInput {...register("email")} />

// ✅ Controller 사용 (필수)
<Controller
  control={control}
  name="email"
  render={({ field: { onChange, onBlur, value } }) => (
    <TextInput onChangeText={onChange} onBlur={onBlur} value={value} />
  )}
/>
```

## API payloads

Use the same schema or a related schema to validate outgoing payloads:

```ts
const payload = signInSchema.parse(values);
await signIn(payload);
```

## Advanced: JSON Schema 변환

Zod 4는 first-party JSON Schema 변환을 지원합니다:

```ts
const jsonSchema = z.toJSONSchema(signInSchema);
```

서버와 스키마를 공유하거나 API 문서를 생성할 때 유용합니다.
