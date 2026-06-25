# DATABASE_SCHEMA.md

## Overview

This document defines the database collections, relationships, and data structures used by VaultFS.

MongoDB Atlas is the source of truth for all metadata.

Cloudinary stores physical files.

---

# User

Represents an authenticated platform user.

```ts
{
  _id: ObjectId

  name: string

  email: string

  image?: string

  createdAt: Date

  updatedAt: Date
}
```

Indexes:

```ts
{
  email: 1
}
```

Unique:

```ts
email
```

---

# Folder

Represents a folder in the hierarchy.

```ts
{
  _id: ObjectId

  ownerId: ObjectId

  name: string

  parentFolderId?: ObjectId

  createdAt: Date

  updatedAt: Date
}
```

Indexes:

```ts
{
  ownerId: 1,
  parentFolderId: 1
}
```

---

# Resource

Represents any content item.

```ts
{
  _id: ObjectId

  ownerId: ObjectId

  folderId: ObjectId

  storageNodeId?: ObjectId

  type:
    | "NOTE"
    | "PDF"
    | "VIDEO"
    | "IMAGE"
    | "YOUTUBE"
    | "LINK"

  title: string

  description?: string

  tags: string[]

  visibility:
    | "PRIVATE"
    | "SHARED"

  hash?: string

  metadata: {
    cloudinaryPublicId?: string

    youtubeUrl?: string

    externalUrl?: string

    size?: number

    mimeType?: string
  }

  createdAt: Date

  updatedAt: Date
}
```

Indexes:

```ts
{
  ownerId: 1,
  folderId: 1
}
```

Text Search Index:

```ts
{
  title: "text",
  description: "text",
  tags: "text"
}
```

---

# StorageNode

Represents a Cloudinary account.

```ts
{
  _id: ObjectId

  ownerId: ObjectId

  cloudName: string

  apiKey: string

  apiSecret: string

  status:
    | "ACTIVE"
    | "OFFLINE"
    | "DISABLED"
    | "FULL"

  active: boolean

  availableStorageGB: number

  usedStorageGB: number

  lastHealthCheck: Date

  createdAt: Date
}
```

Indexes:

```ts
{
  ownerId: 1
}
```

---

# StorageLease

Represents storage-sharing agreements.

```ts
{
  _id: ObjectId

  providerId: ObjectId

  consumerId: ObjectId

  maxStorageGB: number

  status:
    | "PENDING"
    | "ACTIVE"
    | "REVOKED"

  expiresAt?: Date

  createdAt: Date
}
```

Indexes:

```ts
{
  providerId: 1,
  consumerId: 1
}
```

---

# ResourceLink

Represents relationships between resources.

```ts
{
  _id: ObjectId

  sourceResourceId: ObjectId

  targetResourceId: ObjectId

  relation:
    | "REFERENCES"
    | "RELATED"
    | "CHILD"

  createdAt: Date
}
```

Indexes:

```ts
{
  sourceResourceId: 1
}
```

---

# EventLog

Immutable audit records.

```ts
{
  _id: ObjectId

  eventType:
    | "RESOURCE_CREATED"
    | "RESOURCE_UPDATED"
    | "RESOURCE_DELETED"
    | "NODE_ADDED"
    | "NODE_REMOVED"
    | "LEASE_CREATED"
    | "LEASE_REVOKED"

  actorId: ObjectId

  targetId?: ObjectId

  metadata: {}

  createdAt: Date
}
```

Indexes:

```ts
{
  actorId: 1,
  createdAt: -1
}
```
