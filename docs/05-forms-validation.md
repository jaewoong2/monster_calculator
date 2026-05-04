# Forms and validation guide

Use this document when adding or changing forms, request payload validation, or schema logic.

## Default tools

- React Hook Form for form state
- Zod for validation
- `@hookform/resolvers/zod` to connect them

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

## Example

```ts
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type SignInForm = z.infer<typeof signInSchema>;
```

## Rules

- Keep validation messages user-friendly.
- Do not duplicate form type definitions manually if they can be inferred from Zod.
- Keep form components controlled through React Hook Form `Controller` when using React Native inputs.
- Do not put network mutations directly inside low-level input components.

## API payloads

Use the same schema or a related schema to validate outgoing payloads when helpful.

Example:

```ts
const payload = signInSchema.parse(values);
await signIn(payload);
```
