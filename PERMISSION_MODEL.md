
## Purpose

This document defines ownership, visibility, and storage access rules.

---

# Ownership Model

Every resource has an owner.

Example:

```ts
{
  ownerId: "user-a"
}
```

The owner is the user who created the resource.

Ownership never changes automatically.

---

# Storage Ownership

Storage ownership is separate from resource ownership.

Example:

Resource Owner:

User A

Storage Owner:

User B

Storage Node:

Node B1

The file remains owned by User A.

---

# Visibility Levels

## PRIVATE

Only the owner may access the resource.

```ts
visibility = "PRIVATE"
```

---

## SHARED

Owner grants access to specific users.

```ts
visibility = "SHARED"
```

---

# Storage Lease Permissions

A storage lease grants:

* Upload permission
* Storage consumption permission

A storage lease does NOT grant:

* Resource read access
* Resource modification access
* Resource ownership

---

# Direct Trust Rule

Storage sharing requires explicit approval.

Example:

User A → Request

User B → Accept

Storage lease becomes ACTIVE.

---

# Multi-Hop Rule

Not allowed.

Example:

A trusts B

B trusts C

A cannot use C storage.

Only direct leases are considered during storage routing.

---

# Lease Revocation

Providers may revoke leases.

When revoked:

* New uploads are blocked
* Existing files remain accessible
* Existing files are not migrated automatically

Status:

```ts
REVOKED
```

---

# Access Validation Order

For every resource request:

1. Verify authentication
2. Verify resource exists
3. Verify ownership or sharing permissions
4. Generate access URL
5. Return resource

Access is denied immediately if permission validation fails.
