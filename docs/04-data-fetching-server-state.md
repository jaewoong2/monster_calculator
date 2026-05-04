# Data fetching and server state guide

Use this document when adding API calls, caching, mutations, loading states, or server-derived data.

## Default tool

Use TanStack Query for server state.

Server state includes:

- API response data
- Cached lists
- Entity detail data
- Pagination/infinite scroll
- Mutation status
- Refetch state

## Do not use Zustand for server state

Do not copy TanStack Query data into Zustand unless there is a clear reason.

Bad:

```tsx
const { data } = useQuery(...);
useUserStore.setState({ user: data });
```

Better:

```tsx
const { data: user } = useMeQuery();
```

## Recommended feature layout

```txt
features/user/
  api.ts       # fetch/update functions
  hooks.ts     # useQuery/useMutation wrappers
  schema.ts    # Zod schemas
```

## API function rules

- Keep fetchers framework-independent where practical.
- Throw typed or clear errors when requests fail.
- Validate unknown external responses with Zod when practical.
- Avoid putting UI side effects inside API functions.

Example:

```ts
export async function getMe() {
  const response = await fetch("/api/me");

  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }

  return response.json();
}
```

## Query key rules

Use stable query keys:

```ts
["me"]
["users", userId]
["posts", { status, page }]
```

Avoid unstable object creation when unnecessary.

## React Native behavior

When useful, configure:

- online status handling
- app focus refetch
- screen focus refetch

Put TanStack Query app-level setup in `lib/query/`.
