# NODE_HEALTH.md

## Purpose

This document defines node monitoring and health validation.

---

# Objective

Ensure uploads are only routed to valid Cloudinary nodes.

---

# Health Check Schedule

Frequency:

```text
Every 6 Hours
```

Implementation:

```text
Vercel Cron Job
```

or

```text
Background Worker
```

---

# Validation Steps

For each storage node:

1. Load credentials.
2. Initialize Cloudinary SDK.
3. Execute health request.
4. Record result.

---

# Health Endpoint

```ts
cloudinary.v2.api.ping()
```

---

# Successful Check

Update:

```ts
{
  status: "ACTIVE",

  active: true,

  lastHealthCheck: now()
}
```

---

# Failed Check

Increment:

```ts
failureCount += 1
```

---

# Failure Threshold

Maximum Consecutive Failures:

```text
3
```

After threshold:

```ts
status = "OFFLINE"
```

---

# Full Node Detection

If:

```ts
availableStorageGB <= 0
```

Update:

```ts
status = "FULL"
```

---

# Disabled Node

Manually disabled by owner.

```ts
status = "DISABLED"
```

No uploads allowed.

---

# Health States

ACTIVE

* Uploads Allowed
* Streaming Allowed

OFFLINE

* Uploads Blocked
* Streaming Allowed

FULL

* Uploads Blocked
* Streaming Allowed

DISABLED

* Uploads Blocked
* Streaming Allowed

---

# Metrics

Track:

* Last Health Check
* Failure Count
* Uptime Percentage
* Current Status

```
```
