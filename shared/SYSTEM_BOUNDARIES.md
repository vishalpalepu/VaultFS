## Purpose

This document defines exactly what VaultFS is responsible for and what is intentionally excluded from the system.

---

# VaultFS Responsibilities

## Metadata Management

VaultFS manages:

* Users
* Folders
* Resources
* Tags
* Search Metadata
* Resource Relationships

---

## Storage Routing

VaultFS determines:

* Which storage node receives uploads
* Which nodes are available
* Which leases are active
* Which nodes are healthy

---

## Resource Organization

VaultFS provides:

* Folder hierarchy
* Search
* Tagging
* Resource linking

---

## Media Consumption

VaultFS supports:

* Video streaming
* PDF viewing
* Image viewing
* Note viewing
* YouTube embedding

---

## Storage Federation

VaultFS supports:

* Multiple Cloudinary nodes
* Storage leases
* Federated storage pools
* Storage accounting

---

# VaultFS Does Not Manage

## File Replication

Not supported in Version 1.

---

## Distributed Consensus

Not supported.

Examples:

* Raft
* Paxos

---

## Chunk-Based Storage

Not supported.

Files are stored as complete Cloudinary objects.

---

## Distributed Databases

Not supported.

MongoDB remains centralized.

---

## Video Processing

Not supported.

Examples:

* Custom transcoding
* Compression pipelines
* HLS generation

Cloudinary handles media processing.

---

## Storage Recovery

Not supported.

If a Cloudinary account is deleted, VaultFS cannot restore files.

---

## Multi-Hop Trust

Not supported.

Example:

A trusts B

B trusts C

A cannot use C

Only direct storage leases are valid.

---

# Version 1 Constraints

Maximum Upload Size:

500 MB

Storage Provider:

Cloudinary Only

Metadata Database:

MongoDB Atlas

Authentication:

NextAuth

Deployment Target:

Vercel
