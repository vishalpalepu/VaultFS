# API_SPEC.md

## Authentication

### Register

```http
POST /api/auth/register
```

---

### Login

```http
POST /api/auth/login
```

---

### Logout

```http
POST /api/auth/logout
```

---

# Folder APIs

## Create Folder

```http
POST /api/folders
```

---

## Get Folder

```http
GET /api/folders/:id
```

---

## Update Folder

```http
PATCH /api/folders/:id
```

---

## Delete Folder

```http
DELETE /api/folders/:id
```

---

## List Folder Contents

```http
GET /api/folders/:id/resources
```

---

# Resource APIs

## Create Resource

```http
POST /api/resources
```

---

## Get Resource

```http
GET /api/resources/:id
```

---

## Update Resource

```http
PATCH /api/resources/:id
```

---

## Delete Resource

```http
DELETE /api/resources/:id
```

---

# Upload APIs

## Upload File

```http
POST /api/uploads
```

Flow:

1. Request upload.
2. Select storage node.
3. Generate Cloudinary signature.
4. Upload file.
5. Save metadata.

---

# Search APIs

## Global Search

```http
GET /api/search?q=
```

Searches:

* Resource Titles
* Descriptions
* Tags
* Notes

---

# Storage Node APIs

## Create Node

```http
POST /api/storage/nodes
```

---

## List Nodes

```http
GET /api/storage/nodes
```

---

## Update Node

```http
PATCH /api/storage/nodes/:id
```

---

## Disable Node

```http
POST /api/storage/nodes/:id/disable
```

---

# Storage Lease APIs

## Request Lease

```http
POST /api/leases/request
```

---

## Approve Lease

```http
POST /api/leases/approve
```

---

## Revoke Lease

```http
POST /api/leases/revoke
```

---

## List Active Leases

```http
GET /api/leases
```

---

# Resource Linking APIs

## Create Link

```http
POST /api/resource-links
```

---

## Get Resource Graph

```http
GET /api/resources/:id/links
```

---

# Health APIs

## Node Health

```http
GET /api/storage/health
```

---

## Storage Statistics

```http
GET /api/storage/stats
```

```
```
