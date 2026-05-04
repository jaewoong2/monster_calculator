# Data fetching and server state guide

Use this document when adding API calls, caching, mutations, loading states, or server-derived data.

## Default tool

Use **TanStack Query v5** (`@tanstack/react-query@^5.100.9`) for server state.

Server state includes:

- API response data
- Cached lists
- Entity detail data
- Pagination/infinite scroll
- Mutation status
- Refetch state

## Do not use Zustand for server state

Do not copy TanStack Query data into Zustand unless there is a clear reason.

```tsx
// ❌ Bad — Zustand에 서버 데이터 복사
const { data } = useQuery(...);
useUserStore.setState({ user: data });

// ✅ Good — TanStack Query가 소유
const { data: user } = useUser(userId);
```

## Feature 파일 구조

```txt
features/user/
  api.ts       # fetch/update 함수 (프레임워크 독립적)
  hooks.ts     # useQuery/useMutation wrapper
  schema.ts    # Zod 4 스키마 (top-level API 필수)
  keys.ts      # query key factory (optional, hooks.ts에 inline도 가능)
```

## 완전한 CRUD 예시

### 1. Schema (Zod 4 — top-level API 필수)

```ts
// features/todo/schema.ts
import { z } from "zod";

export const todoSchema = z.object({
  id: z.string(),
  title: z.string().check(z.minLength(1, "제목을 입력하세요")),
  completed: z.boolean(),
  createdAt: z.string(),
});

export type Todo = z.infer<typeof todoSchema>;

export const createTodoSchema = z.object({
  title: z.string().check(z.minLength(1, "제목을 입력하세요")),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
```

### 2. API 함수

```ts
// features/todo/api.ts
import { todoSchema, type CreateTodoInput } from "./schema";
import { z } from "zod";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export async function getTodos() {
  const res = await fetch(`${API_BASE}/todos`);
  if (!res.ok) throw new Error("할 일 목록을 불러올 수 없습니다");
  const data = await res.json();
  return z.array(todoSchema).parse(data);
}

export async function getTodo(id: string) {
  const res = await fetch(`${API_BASE}/todos/${id}`);
  if (!res.ok) throw new Error("할 일을 찾을 수 없습니다");
  const data = await res.json();
  return todoSchema.parse(data);
}

export async function createTodo(input: CreateTodoInput) {
  const res = await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("할 일 생성에 실패했습니다");
  return todoSchema.parse(await res.json());
}

export async function deleteTodo(id: string) {
  const res = await fetch(`${API_BASE}/todos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("할 일 삭제에 실패했습니다");
}
```

### 3. Hooks (queryOptions 패턴)

```ts
// features/todo/hooks.ts
import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTodos, getTodo, createTodo, deleteTodo } from "./api";
import type { CreateTodoInput } from "./schema";

// queryOptions — 타입 안전한 설정 재사용
export function todosQueryOptions() {
  return queryOptions({
    queryKey: ["todos"],
    queryFn: getTodos,
  });
}

export function todoQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["todos", id],
    queryFn: () => getTodo(id),
  });
}

// Query hooks
export function useTodos() {
  return useQuery(todosQueryOptions());
}

export function useTodo(id: string) {
  return useQuery(todoQueryOptions(id));
}

// Mutation hooks
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
```

### 4. Screen (로딩/에러/빈 상태 처리)

```tsx
// features/todo/screens/todo-list-screen.tsx
import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useTodos, useDeleteTodo } from "../hooks";

export function TodoListScreen() {
  const { data: todos, isLoading, error, refetch } = useTodos();
  const deleteMutation = useDeleteTodo();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-lg font-semibold text-destructive">오류 발생</Text>
        <Text className="mt-2 text-center text-muted-foreground">{error.message}</Text>
        <Pressable onPress={() => refetch()} className="mt-4 rounded-lg bg-primary px-4 py-2">
          <Text className="font-medium text-primary-foreground">다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  if (!todos || todos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">할 일이 없습니다</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={todos}
      contentContainerClassName="p-4 gap-3"
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="flex-row items-center justify-between rounded-lg border border-border bg-background p-4">
          <Text className="flex-1 text-foreground">{item.title}</Text>
          <Pressable
            onPress={() => deleteMutation.mutate(item.id)}
            disabled={deleteMutation.isPending}
          >
            <Text className="text-sm text-destructive">삭제</Text>
          </Pressable>
        </View>
      )}
    />
  );
}
```

## API function rules

- Keep fetchers framework-independent (fetch API 사용, axios 등 별도 의존성 불필요).
- Throw typed or clear errors when requests fail.
- **Zod 4로 응답 검증** — `schema.parse(data)` 패턴 사용.
- Avoid putting UI side effects inside API functions.
- 환경 변수: `process.env.EXPO_PUBLIC_*` 접두사 사용 (Expo 규칙).

## Query key rules

Use stable query keys:

```ts
["todos"]                    // 목록
["todos", todoId]            // 단일 항목
["todos", { status, page }]  // 필터 조건
```

Avoid unstable object creation when unnecessary.

## React Native specific setup

### Focus refetch

React Native에서는 화면 포커스 시 자동 refetch를 위해 `focusManager`를 설정하세요:

```ts
// lib/query/setup.ts
import { focusManager } from "@tanstack/react-query";
import { AppState } from "react-native";
import type { AppStateStatus } from "react-native";

function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === "active");
}

AppState.addEventListener("change", onAppStateChange);
```

### Online status (optional)

네트워크 연결 상태 관리가 필요하면:

```ts
import { onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});
```

> Note: `@react-native-community/netinfo`는 현재 미설치. 필요 시 `npx expo install @react-native-community/netinfo`로 설치.

### QueryClient setup

```ts
// lib/query/client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,           // 1분
      gcTime: 5 * 60 * 1000,          // 5분
      retry: 2,
      refetchOnWindowFocus: false,    // RN에서는 focusManager로 대체
    },
  },
});
```

```tsx
// lib/query/provider.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

Put these in `lib/query/` and wrap in root `_layout.tsx`.

## ⚠️ 흔한 실수

```tsx
// ❌ query key를 함수 호출마다 새 객체로 생성
useQuery({
  queryKey: ["todos", { ...filters }],  // spread는 매번 새 참조
  queryFn: () => getTodos(filters),
});

// ✅ queryOptions로 안정적 key 관리
useQuery(todosQueryOptions(filters));
```

```tsx
// ❌ mutation 결과를 수동으로 상태에 저장
const [todos, setTodos] = useState([]);
const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: (newTodo) => setTodos([...todos, newTodo]),  // 동기화 문제 발생
});

// ✅ invalidation으로 서버 상태 동기화
const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
});
```
