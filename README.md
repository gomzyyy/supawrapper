# Supawrapper

<p align="center">
  <strong>A type-safe, developer-first Supabase wrapper for CRUD and Realtime operations.</strong>
</p>

<p align="center">
  Reduce boilerplate. Improve DX. Ship faster.
</p>

<p align="center">
  <img alt="npm" src="https://img.shields.io/npm/v/supawrapper" />
  <img alt="license" src="https://img.shields.io/npm/l/supawrapper" />
  <img alt="typescript" src="https://img.shields.io/badge/TypeScript-Friendly-blue" />
  <img alt="supabase" src="https://img.shields.io/badge/Supabase-Compatible-green" />
</p>

> 🚧 **Early release notice**
>
> `supawrapper` is actively evolving and improving.
> If you encounter any bugs, DX issues, or have feature suggestions, please **feel free to open an Issue or PR**.
> Community feedback is highly appreciated ❤️

---

## ✨ Features

- Fully typed CRUD wrapper
- Realtime listeners
- Broadcast channels
- Soft delete support
- Batch updates
- Bulk inserts
- Query filters
- Channel lifecycle management
- TypeScript-first API
- Developer-friendly abstractions

---

## 📦 Installation

```bash
npm install supawrapper @supabase/supabase-js
```

or

```bash
yarn add supawrapper @supabase/supabase-js
```

or

```bash
pnpm add supawrapper @supabase/supabase-js
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

---

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
  order: "desc",
  limit: 10,
});
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

Listen to table changes in real time.

---

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
  console.log("Inserted:", payload.new);
});
```

---

## Listen for Updates

```ts
userListener.onUpdate((payload) => {
  console.log("Updated:", payload.new);
});
```

---

## Listen for Deletes

```ts
userListener.onDelete((payload) => {
  console.log("Deleted:", payload.old);
});
```

---

## Listen for All Changes

```ts
userListener.onChange((payload) => {
  console.log("Changed:", payload);
});
```

---

## Cleanup Listener

```ts
await userListener.unsubscribe();
```

---

## Custom Channel ID

Useful when creating multiple listeners for the same table.

```ts
const listener =
  new RealtimeListener<User>(
    supabase,
    "users",
    "dashboard-live"
  );
```

---

# 📡 Broadcast Channel

Use custom realtime channels for app-level events like chat, notifications, and collaboration.

---

## Create Channel

```ts
const chat =
  new BroadcastChannel(
    supabase,
    "chat-room"
  );
```

---

## Subscribe

```ts
chat.subscribe();
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

# 🧠 Exported API

```ts
import {
  ClientWrapper,
  RealtimeListener,
  BroadcastChannel,
} from "supawrapper";
```

---

# 📦 Exported Types

```ts
import type {
  CRUDOptions,
  GetTableOpts,
  UpdateTableOpts,
  TableBehaviour,
  Callbacks,
} from "supawrapper";
```

---

# 🛣 Roadmap

Upcoming features:

- Storage wrapper
- Auth wrapper
- Presence channels
- Server-side wrapper
- Query chaining
- CLI support
- Schema helpers

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to open a PR or issue.

---

# 📄 License

MIT License

---

# ❤️ Author

Built with love by **Gomzy Dhingra**