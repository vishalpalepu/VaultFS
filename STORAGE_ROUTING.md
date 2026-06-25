# STORAGE_ROUTING.md

## Purpose

This document defines how VaultFS selects a storage node when a resource upload occurs.

The routing algorithm must be deterministic, lightweight, and easy to debug.

---

# Routing Workflow

When a user uploads a resource:

1. Get all storage nodes owned by the user.
2. Get all active storage leases.
3. Get all storage nodes accessible through active leases.
4. Merge accessible nodes.
5. Remove inactive nodes.
6. Remove FULL nodes.
7. Calculate node score.
8. Select highest score.
9. Upload file.
10. Save metadata.

---

# Accessible Nodes

Accessible nodes include:

* User-owned nodes
* Nodes belonging to active storage leases

Example:

User A owns:

* Node A1
* Node A2

User A has lease with User B:

* Node B1

Accessible Nodes:

* A1
* A2
* B1

---

# Node Eligibility Rules

A node is eligible only when:

```ts
status === "ACTIVE"
```

A node is rejected when:

```ts
status === "OFFLINE"
```

or

```ts
status === "FULL"
```

or

```ts
status === "DISABLED"
```

---

# Scoring Formula

```ts
score =
(availableStorageGB * 0.8)
+
(healthScore * 0.2)
```

---

# Health Score

```ts
ACTIVE = 100

OFFLINE = 0

FULL = 0

DISABLED = 0
```

---

# Example

Node A

```ts
availableStorageGB = 20

healthScore = 100

score = 36
```

Node B

```ts
availableStorageGB = 50

healthScore = 100

score = 60
```

Node C

```ts
availableStorageGB = 10

healthScore = 100

score = 28
```

Selected Node:

```ts
Node B
```

---

# Failure Handling

If no node is available:

```ts
throw StorageUnavailableError
```

User receives:

```text
No active storage nodes available.
```

---

# Future Enhancements

* Consistent Hashing
* Weighted Routing
* Storage Tiering
* Replication
* Cost-Aware Routing
* Geographic Routing

```
```
