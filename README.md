# 🚀 Supawrapper

```{=html}
<p align="center">
```
`<strong>`{=html}⚡ MongoDB-like experience for
Supabase`</strong>`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
A type-safe, developer-first data layer for Supabase.
```{=html}
</p>
```
```{=html}
<p align="center">
```
Reduce boilerplate. Improve DX. Ship faster.
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<img alt="npm" src="https://img.shields.io/npm/v/supawrapper" />`{=html}
`<img alt="license" src="https://img.shields.io/npm/l/supawrapper" />`{=html}
`<img alt="typescript" src="https://img.shields.io/badge/TypeScript-Friendly-blue" />`{=html}
`<img alt="supabase" src="https://img.shields.io/badge/Supabase-Compatible-green" />`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## 😩 The Problem (Why this exists)

If you've used Supabase, you already know:

``` ts
const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("is_active", true)
  .order("created_at", { ascending: false })
  .limit(10);
```

-   ❌ Verbose & repetitive\
-   ❌ Hard to reuse queries\
-   ❌ Logic scattered across code\
-   ❌ Realtime setup is repetitive\
-   ❌ Debugging is manual and painful

------------------------------------------------------------------------

## ✅ The Solution

``` ts
const users = new ClientWrapper<User>(supabase, "users");

const data = await users.get({
  eq: [{ key: "is_active", value: true }],
  sortBy: "created_at",
  orderBy: "dec",
  limit: 10,
});
```

------------------------------------------------------------------------

## 🔒 Works With Your Existing Supabase Setup

Supawrapper does NOT replace your Supabase client.

------------------------------------------------------------------------

## ✨ Features

-   Fully typed CRUD wrapper
-   Realtime listeners
-   Broadcast channels
-   Soft delete support
-   Batch updates
-   Bulk inserts
-   Query filters
-   Developer-friendly abstractions

------------------------------------------------------------------------

## 📦 Installation

```bash
npm install supawrapper @supabase/supabase-js
```

---

## 🚀 Quick Start

```ts
import { createClient } from "@supabase/supabase-js";
import {
  ClientWrapper,
  RealtimeListener,
  BroadcastChannel
} from "supawrapper";

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
}
```

---

## Create Wrapper

```ts
const users = new ClientWrapper<User>(
  supabase,
  "users"
);
```

---

## ⚙️ Client Configuration

```ts
const users = new ClientWrapper<User>(
  supabase,
  "users",
  {
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

## Supported Client Config

```ts
interface TableBehaviour {
  supportsSoftDeletion?: boolean;
  softDeleteConfig?: SoftDeleteConfig;
  debug?: DebugConfig;
}
```

---

## Create One

```ts
await users.createOne({
  name: "Gomzy",
  email: "gomzy@example.com",
  is_active: true,
});
```

---

## Create Many

```ts
await users.createMany([
  {
    name: "User 1",
    email: "u1@test.com",
  },
  {
    name: "User 2",
    email: "u2@test.com",
  },
]);
```

---

## Get By ID

```ts
const user = await users.getById("user-id");
```

---

## Get With Filters

```ts
const res = await users.get({
  eq: [
    {
      key: "is_active",
      value: true,
    },
  ],
  sortBy: "created_at",
  orderBy: "dec",
  limit: 10,
});
```

---

## Query Options

```ts
interface CRUDOptions<Table> {
  eq?: { key: keyof Table; value: Table[keyof Table] }[];
  sortBy?: keyof Table;
  orderBy?: "asc" | "dec";
  limit?: number;
  single?: boolean;
  maybeSingle?: boolean;
  or?: string;
  contains?: { key: keyof Table; value: Table[keyof Table] }[];
  overlaps?: { key: keyof Table; value: Table[keyof Table][] }[];
  ilike?: { key: keyof Table; value: string }[];
  inValue?: { key: keyof Table; value: Table[keyof Table][] };
  search?: string;
  searchFields?: (keyof Table)[];
  page?: number;
  offset?: number;
}
```

---

## Update By ID

```ts
await users.updateById("user-id", {
  name: "Updated Name",
});
```

---

## Batch Update

```ts
await users.batchUpdate(
  {
    is_active: false,
  },
  {
    eq: [
      {
        key: "role",
        value: "inactive",
      },
    ],
  }
);
```

---

## Delete By ID

```ts
await users.deleteById("user-id");
```

---

## Soft Delete / Restore

```ts
await users.setSoftDeletedById(
  "user-id",
  true
);

await users.setSoftDeletedById(
  "user-id",
  false
);
```

---

## Exists

```ts
const exists = await users.exists("user-id");
```

---

## Count

```ts
const count = await users.count({
  eq: [
    {
      key: "is_active",
      value: true,
    },
  ],
});
```

---

# ⚡ Realtime Listener

## Create Listener

```ts
const userListener =
  new RealtimeListener<User>(
    supabase,
    "users"
  );
```

---

## Listen for Inserts

```ts
userListener.onInsert((payload) => {
  console.log(payload.new);
});
```

---

## Listen for Updates

```ts
userListener.onUpdate((payload) => {
  console.log(payload.new);
});
```

---

## Listen for Deletes

```ts
userListener.onDelete((payload) => {
  console.log(payload.old);
});
```

---

## Listen for All Changes

```ts
userListener.onChange((payload) => {
  console.log(payload);
});
```

---

## Cleanup Listener

```ts
await userListener.unsubscribe();
```

---

## Realtime Channel Config

```ts
interface RealtimeChannelConfig {
  channelId?: string;
}
```

---

## Custom Channel ID

```ts
const listener =
  new RealtimeListener<User>(
    supabase,
    "users",
    {
      channelId: "dashboard-live"
    }
  );
```

---

# 📡 Broadcast Channel

## Create Channel

```ts
const chat =
  new BroadcastChannel(
    supabase,
    "chat-room"
  );
```

---

## Send Event

```ts
await chat.send("message", {
  text: "Hello world",
});
```

---

## Listen to Event

```ts
chat.on("message", (payload) => {
  console.log(payload);
});
```

---

## Cleanup

```ts
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

Contributions, issues, and feature requests are welcome.

Feel free to open a PR or issue.

---

# 📄 License

MIT License

---

# ❤️ Author

Built with love by **gomzyyy**