# Supawrapper

<p align="center">
  A clean, type-safe, developer-friendly CRUD wrapper for Supabase.
</p>

<p align="center">
  Write less boilerplate. Ship faster.
</p>

<p align="center">
  <img alt="npm" src="https://img.shields.io/npm/v/supawrapper" />
  <img alt="license" src="https://img.shields.io/npm/l/supawrapper" />
  <img alt="typescript" src="https://img.shields.io/badge/TypeScript-Friendly-blue" />
  <img alt="supabase" src="https://img.shields.io/badge/Supabase-Compatible-green" />
</p>

---

## Overview

`supawrapper` is a lightweight and strongly-typed CRUD abstraction layer built on top of `@supabase/supabase-js`.

It helps developers reduce repetitive query boilerplate by providing:

- CRUD methods
- filtering utilities
- bulk operations
- pagination
- soft deletion support
- debug hints
- TypeScript-first API
- reusable table wrappers

Instead of writing repetitive Supabase queries for every table, you can create a wrapper once and use a clean service-like API.

---

## Installation

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

## Quick Start

```ts
import { createClient } from "@supabase/supabase-js";
import { ClientWrapper } from "supawrapper";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const users = new ClientWrapper<User>(supabase, "users");
```

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

## Basic Usage

---

### Create One Record

```ts
const res = await users.createOne({
  name: "Gomzy",
  email: "gomzy@example.com",
  is_active: true,
});

console.log(res.data);
```

---

### Create Multiple Records

```ts
await users.createMany([
  {
    name: "User 1",
    email: "user1@test.com",
  },
  {
    name: "User 2",
    email: "user2@test.com",
  },
]);
```

---

### Get By ID

```ts
const res = await users.getById("user-id");
```

---

### Get Records with Filters

```ts
const res = await users.get({
  eq: [
    {
      key: "is_active",
      value: true,
    },
  ],
  limit: 10,
  sortBy: "created_at",
  orderBy: "dec",
});
```

---

### Update One Record

```ts
await users.updateById("user-id", {
  name: "Updated Name",
});
```

---

### Batch Update

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

### Delete Permanently

```ts
await users.deleteOneByIDPermanent("user-id");
```

---

### Check If Record Exists

```ts
const exists = await users.exists("user-id");

console.log(exists.data); // true / false
```

---

### Count Records

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

## Filtering Options

`supawrapper` provides flexible filtering utilities.

---

### Equality Filter

```ts
{
  eq: [
    {
      key: "status",
      value: "active"
    }
  ]
}
```

---

### Contains

```ts
{
  contains: [
    {
      key: "tags",
      value: "typescript"
    }
  ]
}
```

---

### ILIKE Search

```ts
{
  ilike: [
    {
      key: "name",
      value: "%gomzy%"
    }
  ]
}
```

---

### IN Filter

```ts
{
  inValue: {
    key: "role",
    value: ["admin", "editor"]
  }
}
```

---

### OR Conditions

```ts
{
  or: "role.eq.admin,is_active.eq.true"
}
```

---

### Pagination

```ts
{
  page: 1,
  limit: 20
}
```

---

## Soft Delete Support

Enable soft deletion using `TableBehaviour`.

---

### Setup

```ts
const users = new ClientWrapper<User>(supabase, "users", {
  supportsSoftDeletion: true,
  softDeleteConfig: {
    timestampKey: "deleted_at",
    flagKey: "is_deleted",
  },
});
```

---

### Soft Delete Record

```ts
await users.setSoftDeletedById("user-id", true);
```

---

### Restore Record

```ts
await users.setSoftDeletedById("user-id", false);
```

---

## Table Behaviour Configuration

```ts
const users = new ClientWrapper<User>(supabase, "users", {
  supportsSoftDeletion: true,
  debug: {
    returnHintsOnError: true,
    hintsConfig: {
      includeArguments: true,
      includeRawResults: true,
      includeTableMetadata: true,
    },
  },
});
```

---

## Exported Types

`supawrapper` exports useful types for full TypeScript support.

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

## Exported API

Currently exposed public API:

```ts
export { ClientWrapper }
```

Supported methods:

- `createOne()`
- `createMany()`
- `getById()`
- `get()`
- `updateById()`
- `batchUpdate()`
- `deleteOneById()`
- `setSoftDeletedById()`
- `exists()`
- `count()`

---

## Why Supawrapper?

Supabase is amazing, but repeated CRUD code across tables quickly becomes repetitive.

Instead of writing:

```ts
supabase.from("users").select("*").eq("id", id)
```

again and again…

Use:

```ts
users.getById(id)
```

Cleaner.
More readable.
More reusable.

---

## Best Use Cases

Perfect for:

- SaaS dashboards
- admin panels
- CMS projects
- internal tools
- scalable service layers
- reusable repositories

---

## Roadmap

Planned features:

- auth wrapper
- storage wrapper
- realtime wrapper
- bucket utilities
- stream upload/download
- server wrapper
- CLI support
- auto schema helpers

---

## Contributing

Contributions, issues, and feature requests are welcome.

Feel free to open a PR or issue.

---

## License

MIT License

---

## Author

Built with ❤️ by **Gomzy Dhingra**