# 🚀 Supawrapper

<p align="center">
  <strong>⚡ MongoDB-like experience for Supabase</strong>
</p>

<p align="center">A type-safe, developer-first data layer for Supabase.</p>

<p align="center">Reduce boilerplate. Improve DX. Ship faster.</p>

---

## 😩 The Problem (Why this exists)

If you've used Supabase, you already know:

```ts
const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("is_active", true)
  .order("created_at", { ascending: false })
  .limit(10);
```

- ❌ **Verbose & repetitive**: Repeated `.select('*')` and `{ data, error }` unwrapping boilerplate.
- ❌ **Hard to reuse queries**: Filtering logic is glued to the raw client instantiation.
- ❌ **Logic scattered across code**: Common queries have to be rewritten every time they're needed.
- ❌ **Silent failures**: Invalid data types and schemas pass silently without middleware.
- ❌ **Debugging is manual and painful**: When a query fails, you lack robust built-in logging context.
- ❌ **Timestamps are manual**: Easy to forget injecting `created_at` or `updated_at`.

---

## ✅ The Solution

Supawrapper collapses query handling and database logic into a **seamless abstraction layer**. We automate the annoying parts: typed API wrappers, automatic validation with standard tools (Zod), injected timestamps, and fluent APIs, so you can write:

```ts
const users = new ClientWrapper<User>(supabase, "users");

// Fluent chained API

const chainable = users.chainable;

const data = await chainable
  .where("is_active", true)
  .orderBy("created_at", "desc")
  .limit(10)
  .get();

// OR Structured access
const res = await users.get({
  eq: [{ key: "is_active", value: true }],
  sortBy: "created_at",
  orderBy: "dec",
  limit: 10,
});
```

---

## 🔒 Works With Your Existing Supabase Setup

Supawrapper **does NOT replace your Supabase client**.

```ts
const supabase = createClient(URL, KEY);
const users = new ClientWrapper<User>(supabase, "users");
```

- ✅ **No lock-in** — use Supabase directly anytime
- ✅ **Other flows remain untouched** (auth, rpc invocations, storage, etc.)
- ✅ **Drop-in integration** into existing projects
- ✅ **Safe to adopt incrementally**

> Supawrapper only handles the **boilerplate layer**, not your core Supabase client.

---

## ✨ Features

- Fully typed CRUD wrapper
- Schema validation with Zod
- Auto-handled timestamps
- Presets (smart reusable queries)
- Chainable query API
- Raw query access
- Realtime listeners
- Broadcast channels
- Soft delete support
- Batch updates & bulk inserts
- Developer-friendly abstractions

---

## 📦 Installation

```bash
npm install supawrapper @supabase/supabase-js zod
```

---

## 🚀 Quick Start

```ts
import { createClient } from "@supabase/supabase-js";
import { ClientWrapper, RealtimeListener, BroadcastChannel, defineTable } from "supawrapper";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

---

# 📘 CRUD Wrapper

## Define Your Table Type

```ts
interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}
```

---

## Create Wrapper

```ts
const users = new ClientWrapper<User>(supabase, "users");

```

## 🎉 What's New in v1.0.7

- **Upsert support**: Added `upsertOne` and `upsertMany` APIs for seamless "insert or update" operations, resolving conflicts automatically based on your uniquely identified keys!

---

- **Table identifiers**: Introduced `uniqueIdentifiers?: string[]` to your `TableBehaviour` configuration to power deterministic conflict resolutions directly at the data layer.

---

---

## ⚙️ Client Configuration

```ts
const users = new ClientWrapper<User>(
  supabase,
  "users",
  {
    timestamps: {
      autoTimestamps: true,
      config: {
        createdAtKey: "created_at",
        updatedAtKey: "updated_at",
      },
    },
    uniqueIdentifiers: ["id"],
    validator: {
      enabled: true,
      schema: userSchema,
    },
    supportsSoftDeletion: true,
    softDeleteConfig: {
      flagKey: "is_deleted",
      timestampKey: "deleted_at",
    },
    debug: {
      returnHintsOnError: true,
      hintsConfig: {
        includeTableMetadata: true,
        includeRawResults: true,
        includeArguments: true,
      },
    },
  }
);
```

---

## Supported Client Config (`TableBehaviour<Schema>`)

```ts
interface TableBehaviour<Schema = unknown> {
  timestamps?: {
    autoTimestamps?: boolean;
    config?: {
      createdAtKey?: string;
      updatedAtKey?: string;
    };
  };
  uniqueIdentifiers?: string[];
  validator?: {
    enabled?: boolean;
    schema?: ZodSchema<Schema>;
  };
  supportsSoftDeletion?: boolean;
  softDeleteConfig?: {
    flagKey?: string | null;
    timestampKey?: string | null;
  };
  debug?: {
    returnHintsOnError?: boolean;
    hintsConfig?: {
      includeTableMetadata?: boolean;
      includeRawResults?: boolean;
      includeArguments?: boolean;
    };
  };
}
```

---

## Create One

```ts
await users.createOne({
  name: "Test User",
  email: "test.user@example.com",
  is_active: true,
});
```

---

## Create Many

```ts
await users.createMany([
  { name: "User One", email: "user.one@example.com" },
  { name: "User Two", email: "user.two@example.com" },
]);
```

---

## Upsert Operations

> **⚠️ Important:** Upsert operations require you to explicitly tell Supabase how to resolve conflicts. You **must** configure `uniqueIdentifiers` in your `TableBehaviour` configuration (e.g., `uniqueIdentifiers: ["id"]`) before using these methods. Supawrapper safely injects these keys automatically during the operation!

### Upsert One

```ts
// Inserts or updates resolving conflicts through your configured `uniqueIdentifiers`
await users.upsertOne({
  id: "00000000-0000-0000-0000-000000000001",
  name: "Upserted User",
  email: "test.user@example.com",
  is_active: true,
});
```

---

### Upsert Many

```ts
await users.upsertMany([
  { id: "1", name: "User One", email: "one@example.com", is_active: true },
  { id: "2", name: "User Two", email: "two@example.com", is_active: false },
]);
```

---

## Get By ID

```ts
const user = await users.getById("00000000-0000-0000-0000-000000000001");
```

---

## Get With Filters

```ts
const res = await users.get({
  eq: [{ key: "is_active", value: true }],
  sortBy: "created_at",
  orderBy: "dec",
  limit: 10,
});
```

---

## Query Options (`CRUDOptions<Table>`)

```ts
interface CRUDOptions<Table> {
  eq?:       { key: keyof Table; value: Table[keyof Table] }[];
  gt?:       { key: keyof Table; value: Table[keyof Table] }[];
  gte?:      { key: keyof Table; value: Table[keyof Table] }[];
  lt?:       { key: keyof Table; value: Table[keyof Table] }[];
  lte?:      { key: keyof Table; value: Table[keyof Table] }[];
  sortBy?:   keyof Table;
  orderBy?:  "asc" | "dec";
  limit?:    number;
  single?:   boolean;
  maybeSingle?: boolean;
  or?:       string;
  contains?: { key: keyof Table; value: Table[keyof Table] }[];
  overlaps?: { key: keyof Table; value: Table[keyof Table][] }[];
  ilike?:    { key: keyof Table; value: Table[keyof Table] }[];
  inValue?:  { key: keyof Table; value: Table[keyof Table][] };
  search?:      string;
  searchFields?: (keyof Table)[];
  page?:    number;
  offset?:  number;
}
```

> **Note:** `UpdateTableOpts<Table>` omits `limit`, `single`, `maybeSingle`, `orderBy`, `sortBy`, `search`, `searchFields`, `page`, and `offset` — leaving only filter-related options for update operations.

---

## Update By ID

```ts
await users.updateById("00000000-0000-0000-0000-000000000001", {
  name: "Updated Name",
});
```

---

## Batch Update

```ts
await users.batchUpdate(
  { is_active: false },
  { eq: [{ key: "role", value: "inactive" }] }
);
```

---

## Delete By ID

```ts
await users.deleteById("00000000-0000-0000-0000-000000000001");
```

---

## Soft Delete / Restore

```ts
await users.setSoftDeletedById("00000000-0000-0000-0000-000000000001", true);  // soft delete
await users.setSoftDeletedById("00000000-0000-0000-0000-000000000001", false); // restore
```

---

## Exists

```ts
const exists = await users.exists("00000000-0000-0000-0000-000000000001");
```

---

## Count

```ts
const count = await users.count({
  eq: [{ key: "is_active", value: true }],
});
```

---

# 🧠 Schema & Validation

Supawrapper integrates Zod validation directly into the table config. Enable it via the `validator` option in `TableBehaviour` — all `createOne` and `updateById` calls will be validated automatically.

```ts
import { z } from "zod";

const userSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  email: z.string().email(),
  is_active: z.boolean().default(true),
});

const users = defineTable<User, Partial<User>, GetTableOpts<User>, UpdateTableOpts<User>>(
  supabase,
  "users",
  {
    validator: {
      enabled: true,
      schema: userSchema,
    },
  }
);
```

Invalid data throws a meaningful error before it ever reaches Supabase.

---

# ⏱ Auto Timestamps

Enable `autoTimestamps` to have `created_at` and `updated_at` managed for you. Key names are configurable.

```ts
const users = defineTable<User, Partial<User>, GetTableOpts<User>, UpdateTableOpts<User>>(
  supabase,
  "users",
  {
    timestamps: {
      autoTimestamps: true,
      config: {
        createdAtKey: "created_at",
        updatedAtKey: "updated_at",
      },
    },
  }
);

await users.createOne({ name: "Test User", email: "test.user@example.com" });
// → created_at and updated_at injected automatically
```

---

# ⚡ Presets (Smart Queries)

Presets are named, reusable queries for common access patterns.
They expose a typed API perfectly reflecting the wrapper type generic constraints.

```ts
const activeUsers = await users.presets.active();
const recentUsers = await users.presets.recent(5);
const userPosts   = await posts.presets.byUser("00000000-0000-0000-0000-000000000001");
```

### Supported Preset Methods (`Presets<T>`)
```ts
class Presets<T> {
  active(): Promise<Response<T | T[], unknown>>;
  recent(limit?: number): Promise<Response<T | T[], unknown>>;
  byUser(userId: string): Promise<Response<T | T[], unknown>>;
  inactive(): Promise<Response<T | T[], unknown>>;
  deleted(): Promise<Response<T | T[], unknown>>;
  recentlyUpdated(limit?: number): Promise<Response<T | T[], unknown>>;
  createdWithin(days: number): Promise<Response<T | T[], unknown>>;
  byUsers(userIds: string[]): Promise<Response<T | T[], unknown>>;
  countActive(): Promise<Response<number, unknown>>;
  countDeleted(): Promise<Response<number, unknown>>;
}
```

---

# 🔗 Chainable Queries

The `.chain()` API gives you a fluent builder pattern to execute fully typed queries without crafting complex configuration objects.

```ts
const results = await users.chain()
  .where("is_active", true)
  .orderBy("created_at", "desc")
  .limit(10)
  .get();
```

### Supported Chain Methods (`Chainable<T>`)
```ts
class Chainable<T> {
  where(key: keyof T, value: T[keyof T]): this;
  gt(key: keyof T, value: T[keyof T]): this;
  gte(key: keyof T, value: T[keyof T]): this;
  lt(key: keyof T, value: T[keyof T]): this;
  lte(key: keyof T, value: T[keyof T]): this;
  contains(key: keyof T, value: T[keyof T]): this;
  overlaps(key: keyof T, values: T[keyof T][]): this;
  in(key: keyof T, values: T[keyof T][]): this;
  or(condition: string): this;
  orderBy(key: keyof T, order?: OrderBy): this;
  limit(n: number): this;
  page(p: number, pageSize: number): this;
  get(): Promise<Response<T | T[], unknown>>;
  first(): Promise<Response<T | T[], unknown>>;
}
```

| Method | Description |
|---|---|
| `.where(key, value)` | Exact match filter |
| `.orderBy(key, dir)` | Sort results |
| `.limit(n)` | Cap result count |
| `.gt / .gte / .lt / .lte` | Numeric/date comparisons |
| `.contains(key, value)` | JSON contains |
| `.overlaps(key, value)` | Array overlaps |
| `.in(key, values)` | Match array of values |
| `.or(condition)` | Raw OR operator conditions |
| `.page(p, limit)` | Handle pagination offset / limit |
| `.first()` | Return single record |
| `.get()` | Execute query and return |

---

# 🛠 Raw Query Access

```ts
const response = await users.rawQuery((query) =>
  query.select("*").eq("is_active", true).limit(5)
);
```

Raw queries still go through Supawrapper's response and debug layer.

---

# 💡 Why Supawrapper?

| Feature | Supabase | Supawrapper |
|---|---|---|
| Boilerplate | ❌ High | ✅ Minimal |
| Reusability | ❌ Manual | ✅ Structured |
| Type Safety | ⚠ Limited | ✅ Strong |
| Timestamps | ❌ Manual | ✅ Automatic |
| Validation | ❌ Manual | ✅ Built-in |
| Chainable Queries | ❌ Verbose | ✅ Fluent API |
| Realtime | ❌ Verbose | ✅ Simple |
| Debugging | ❌ Manual | ✅ Configurable |

---

# 🔥 End-to-End Example

```ts
import { z } from "zod";
import { defineTable } from "supawrapper";
import { GetTableOpts, UpdateTableOpts } from "supawrapper/types";

const postSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string(),
  title: z.string(),
  is_published: z.boolean().default(false),
});

interface Post {
  id: string;
  user_id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

const posts = defineTable<Post, Partial<Post>, GetTableOpts<Post>, UpdateTableOpts<Post>>(
  supabase,
  "posts",
  {
    timestamps: { autoTimestamps: true },
    validator: { enabled: true, schema: postSchema },
    supportsSoftDeletion: true,
    softDeleteConfig: { flagKey: "is_deleted", timestampKey: "deleted_at" },
  }
);

// Create
await posts.createOne({
  user_id: "00000000-0000-0000-0000-000000000001",
  title: "Hello Supawrapper",
});

// Chain query
const recent = await posts.chain()
  .where("is_published", true)
  .orderBy("created_at", "desc")
  .limit(5)
  .get();

// Preset
const userPosts = await posts.presets.byUser("00000000-0000-0000-0000-000000000001");
```

---

# ⚡ Realtime Listener

```ts
const userListener = new RealtimeListener<User>(supabase, "users");

userListener.onInsert((payload) => console.log(payload.new));
userListener.onUpdate((payload) => console.log(payload.new));
userListener.onDelete((payload) => console.log(payload.old));
userListener.onChange((payload) => console.log(payload));

await userListener.unsubscribe();
```

## Custom Channel ID

```ts
const listener = new RealtimeListener<User>(supabase, "users", {
  channelId: "dashboard-live",
});
```

---

# 📡 Broadcast Channel

```ts
const chat = new BroadcastChannel(supabase, "chat-room");

await chat.send("message", { text: "Hello world" });

chat.on("message", (payload) => console.log(payload));

await chat.unsubscribe();
```

---

# 🛣 Roadmap

- Storage wrapper
- Auth wrapper
- Presence channels
- Server-side wrapper & more

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open a PR or issue.

---

# 📄 License

MIT License

# Built with ❤️ by gomzyyy