# VaultFS — Federated Knowledge & Resource Repository (MVP)

VaultFS is a federated resource and knowledge management platform built with Next.js 15, MongoDB Atlas, and Cloudinary. It enforces a strict separation of metadata (MongoDB) from physical storage (Cloudinary cluster) and supports storage capacity sharing through explicit Storage Leases.

## Architecture

- **Client:** Next.js 15 UI with Tailwind CSS.
- **Backend:** Next.js Route Handlers (SSR-first, minimal client-side state).
- **Metadata Database:** MongoDB Atlas (via Mongoose connection caching).
- **Physical Storage:** Decentralized pool of user-contributed Cloudinary nodes.

## Features Implemented

1. **Authentication:** Register, Login, and Logout via NextAuth v5.
2. **Folders:** Create, browse, nested subfolders, rename, and recursive deletion.
3. **Resources:** PDF viewer, video streaming player, image viewer, markdown note editors/viewers, YouTube embedded player, clickable links.
4. **Content-Addressable Hashing:** Browser-side SHA-256 hashing to deduplicate assets.
5. **Storage Routing:** Smart score-based allocation algorithm:
   `score = (availableStorageGB * 0.8) + (healthScore * 0.2)`
6. **Health Checking:** Periodic cron endpoint (`api/cron/health`) pinging Cloudinary nodes with a 3-failure OFFLINE threshold.
7. **Storage Sharing:** Request, approve, or revoke storage leases between peer users.
8. **Resource Linking:** Semantic referencing graph between knowledge base documents.
9. **Event Logging:** Immutable audit trailing for workspace activity feeds.

---

## Setup Instructions

### 1. Prerequisites
- Node.js v18+ installed.
- A MongoDB Atlas connection string.
- One or more Cloudinary accounts (to add as storage nodes).

### 2. Configure Environment Variables
Create a file named `.env.local`:

```env
# MongoDB Connection URI
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/vaultfs?retryWrites=true&w=majority"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-random-secret-key-goes-here"

# Cron trigger authorization
CRON_SECRET="optional-cron-security-token"
```

> **Tip:** You can generate a NextAuth secret using `openssl rand -base64 32`.

### 3. Install Dependencies
Navigate to the app folder and run:
```bash
npm install
```

### 4. Seed Database
Seed the database with sample users (`alice@vaultfs.local` and `bob@vaultfs.local`), folder structures, and mock notes:
```bash
npm run db:seed
```
*Note: Ensure your `.env.local` file contains the correct `MONGODB_URI` before running the seed script.*

### 5. Launch Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Alice Credentials:** `alice@vaultfs.local` / `password123`
- **Bob Credentials:** `bob@vaultfs.local` / `password123`

---

## Technical Architecture Details

### Node Health check Cron
Pings the Cloudinary cluster API. Run health checking programmatically by hitting `/api/storage/health` or setting up a periodic cron scheduler targeting `/api/cron/health?secret=your-secret`.

### Zero-Trust Sharing Model
Storage leases grant upload and storage allocations only. Reading resource metadata or accessing items is independent of lease status, maintaining absolute private workspace isolation.
