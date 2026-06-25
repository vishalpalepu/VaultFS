# DATABASE_INDEXES.md

## Purpose

Defines all MongoDB indexes required by VaultFS.

Indexes are mandatory for scalability.

---

# User Collection

```ts
{
  email: 1
}
```

Unique Index

Purpose:

Authentication lookups.

---

# Folder Collection

```ts
{
  ownerId: 1,
  parentFolderId: 1
}
```

Purpose:

Folder tree traversal.

---

# Resource Collection

```ts
{
  ownerId: 1,
  folderId: 1
}
```

Purpose:

Folder resource loading.

---

```ts
{
  ownerId: 1,
  visibility: 1
}
```

Purpose:

Permission filtering.

---

# Resource Search Index

```ts
{
  title: "text",
  description: "text",
  tags: "text"
}
```

Purpose:

Global search.

---

# StorageNode Collection

```ts
{
  ownerId: 1
}
```

Purpose:

Node discovery.

---

```ts
{
  status: 1
}
```

Purpose:

Health queries.

---

# StorageLease Collection

```ts
{
  providerId: 1,
  consumerId: 1
}
```

Purpose:

Lease validation.

---

# ResourceLink Collection

```ts
{
  sourceResourceId: 1
}
```

Purpose:

Graph traversal.

---

# EventLog Collection

```ts
{
  actorId: 1,
  createdAt: -1
}
```

Purpose:

Activity history.

---

# Performance Goal

Target Query Latency:

```text
< 100ms
```

for common operations.

```
```
