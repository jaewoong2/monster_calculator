# Local DB and offline-first guide

Use this document when key-value storage is not enough.

## When to use SQLite

Use SQLite when you need:

- local searchable lists
- offline-first entities
- sync queues
- relational data
- durable drafts
- conflict resolution metadata

Do not use SQLite just to store one or two settings.

## Recommended stack

```txt
expo-sqlite
drizzle-orm
drizzle-kit
```

## Rules

- Keep schema definitions explicit.
- Keep migrations reviewable.
- Do not store sensitive tokens in SQLite.
- Keep sync logic separate from UI components.
- Treat local DB writes as application logic, not styling/UI logic.

## Suggested structure

```txt
lib/db/
  client.ts
  schema.ts
  migrations/
  queries/

features/notes/
  local.ts
  sync.ts
```

## Offline sync principles

- Prefer idempotent mutations.
- Track local pending changes.
- Keep server IDs and local IDs explicit.
- Make conflict behavior visible in code.
- Avoid silent destructive overwrites.
