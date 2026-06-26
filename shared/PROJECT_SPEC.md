**Project Goal** VaultFS is a federated knowledge and resource management platform that completely separates metadata management from physical storage, allowing capacity to expand horizontally through a decentralized network of trusted users.

**Architecture**

* **Frontend & API Orchestration:** Next.js utilizing the App Router for server-rendered interfaces and stateless API route handlers.  
* **Metadata Service:** MongoDB, implemented with a global singleton connection cache to prevent serverless connection pool exhaustion.  
* **Storage Service:** A federated pool of user-contributed Cloudinary accounts.

**Features**

* Hierarchical folder organization.  
* Semantic graph relationships for resources.  
* Client-side SHA-256 data hashing via the Web Crypto API to enable content-addressable deduplication.  
* Immutable event logs for system observability.  
* Global metadata search.

**Storage Model**

* **Federated Contribution Model:** Resources always belong to the uploading user (`ownerId`), regardless of which physical node holds the file.  
* **Capacity-Aware Allocation:** Replaces traditional round-robin routing with an intelligent scoring system based on real-time node health and available storage capacity.

**Trust Model**

* **Direct Relationships:** Storage pooling relies strictly on explicit, direct bilateral handshakes (no multi-hop traversal).  
* **Zero-Trust Visibility:** Resources are strictly Private or Shared.  
* **Storage Leases:** Resources stored on external nodes utilize finite expiration timestamps to protect peer storage quotas.

**Node Model**

* **Dynamic Configuration:** Each node holds unique Cloudinary credentials dynamically instantiated by the server.  
* **Health Validation:** Nodes are monitored using a cron-triggered worker that pings the `cloudinary.v2.api.ping()` endpoint to verify credential validity and API reachability.

**MVP Scope** Folder hierarchy, MongoDB metadata management, client-side deduplication hashes, Next.js UI, multi-node Cloudinary federation, direct trust relationships, capacity-aware routing, node health checks, storage leases, event logs, and resource linking.


# MVP Features

- Authentication
- Folder hierarchy
- Notes
- File upload
- Cloudinary nodes
- Storage leases
- Search
- PDF viewer
- Video viewer

# Phase 2

- Event logs
- Deduplication
- Resource linking

# Phase 3

- Recommendations
- Analytics
- Replication
