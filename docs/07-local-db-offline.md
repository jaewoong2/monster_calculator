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
expo-sqlite        # Expo 네이티브 SQLite 바인딩
drizzle-orm        # 타입 안전 ORM
drizzle-kit        # 마이그레이션 생성 도구
```

> **현재 상태**: 이 프로젝트에는 아직 설치되지 않았습니다 (optional). 필요 시 아래 순서로 설치하세요.

### 설치

```bash
npx expo install expo-sqlite
npm install drizzle-orm
npm install -D drizzle-kit
```

## Configuration

### drizzle.config.ts

```ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  driver: "expo",
  dialect: "sqlite",
} satisfies Config;
```

### metro.config.js

Drizzle 마이그레이션 파일(`.sql`)을 번들에 포함하려면 Metro 설정에 확장자를 추가해야 합니다:

```js
// metro.config.js
const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push("sql");
module.exports = config;
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
  client.ts          # drizzle() 인스턴스 생성
  schema.ts          # 테이블 정의
  migrations/        # drizzle-kit generate 결과
  queries/           # 재사용 가능한 쿼리 함수

features/notes/
  local.ts           # 로컬 DB 읽기/쓰기
  sync.ts            # 서버 동기화 로직
```

## SQLiteProvider + migration 패턴

Expo SQLite의 `SQLiteProvider`를 사용하면 앱 시작 시 DB 초기화와 마이그레이션을 자동으로 처리할 수 있습니다:

```tsx
// app/_layout.tsx
import { SQLiteProvider } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/lib/db/migrations/migrations";
import { Suspense } from "react";

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SQLiteProvider
        databaseName="app.db"
        onInit={async (db) => {
          const drizzleDb = drizzle(db);
          await migrate(drizzleDb, migrations);
        }}
      >
        <Stack />
      </SQLiteProvider>
    </Suspense>
  );
}
```

## Schema 정의 예시

```ts
// lib/db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  syncStatus: text("sync_status").default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});
```

## 마이그레이션 생성

```bash
npx drizzle-kit generate
```

생성된 `.sql` 파일은 `lib/db/migrations/`에 저장됩니다. 반드시 코드 리뷰를 거치세요.

## useLiveQuery (reactive updates)

DB 변경 시 UI를 자동 업데이트하려면 `useLiveQuery`를 사용할 수 있습니다:

```ts
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

function NotesList() {
  const { data: notesList } = useLiveQuery(
    drizzleDb.select().from(notes).orderBy(notes.createdAt)
  );
  // notesList는 DB 변경 시 자동 업데이트됩니다
}
```

## Debugging

개발 빌드에서 DB를 시각적으로 검사하려면 `expo-drizzle-studio-plugin`을 사용할 수 있습니다.

## Offline sync principles

- Prefer idempotent mutations.
- Track local pending changes.
- Keep server IDs and local IDs explicit.
- Make conflict behavior visible in code.
- Avoid silent destructive overwrites.
