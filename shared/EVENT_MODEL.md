# EVENT_MODEL.md

## Purpose

Defines immutable audit events generated throughout the system.

---

# Principles

Events are:

* Append Only
* Immutable
* Never Updated
* Never Deleted

---

# Event Types

## Resource Events

```ts
RESOURCE_CREATED

RESOURCE_UPDATED

RESOURCE_DELETED

RESOURCE_SHARED
```

---

## Storage Events

```ts
NODE_ADDED

NODE_UPDATED

NODE_DISABLED

NODE_REMOVED
```

---

## Lease Events

```ts
LEASE_REQUESTED

LEASE_APPROVED

LEASE_REVOKED
```

---

## User Events

```ts
USER_REGISTERED

USER_LOGIN
```

---

# Event Structure

```ts
{
  _id: ObjectId

  eventType: string

  actorId: ObjectId

  targetId?: ObjectId

  metadata: {}

  createdAt: Date
}
```

---

# Example

```ts
{
  eventType: "RESOURCE_CREATED",

  actorId: "userA",

  targetId: "resource123",

  metadata: {
    folderId: "folder1"
  }
}
```

---

# Usage

Events are used for:

* Debugging
* Audit Trails
* Analytics
* Activity Feeds
* Future Notifications

```
```
