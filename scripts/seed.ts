// ============================================================
// VaultFS – Database Seeding Script
// Seeds a demo workspace with standard user, nodes, folders,
// resources, and event logs.
// ============================================================

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load local environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not set in process.env or .env.local");
  process.exit(1);
}

// Schemas & Models (Embedded minimal schemas to prevent module path resolution issues during standalone executions)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const FolderSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  parentFolderId: { type: mongoose.Schema.Types.ObjectId, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ResourceSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", required: true },
  storageNodeId: { type: mongoose.Schema.Types.ObjectId, default: null },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  tags: [{ type: String }],
  visibility: { type: String, default: "PRIVATE" },
  hash: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const StorageNodeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cloudName: { type: String, required: true },
  apiKey: { type: String, required: true },
  apiSecret: { type: String, required: true },
  status: { type: String, default: "ACTIVE" },
  active: { type: Boolean, default: true },
  availableStorageGB: { type: Number, default: 10 },
  usedStorageGB: { type: Number, default: 0 },
  failureCount: { type: Number, default: 0 },
  lastHealthCheck: { type: Date, default: null },
});

const StorageLeaseSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  consumerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  maxStorageGB: { type: Number, required: true },
  status: { type: String, default: "PENDING" },
  expiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Folder = mongoose.models.Folder || mongoose.model("Folder", FolderSchema);
const Resource = mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);
const StorageNode = mongoose.models.StorageNode || mongoose.model("StorageNode", StorageNodeSchema);
const StorageLease = mongoose.models.StorageLease || mongoose.model("StorageLease", StorageLeaseSchema);

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected successfully!");

  // Clean databases
  console.log("Cleaning existing records...");
  await Promise.all([
    User.deleteMany({}),
    Folder.deleteMany({}),
    Resource.deleteMany({}),
    StorageNode.deleteMany({}),
    StorageLease.deleteMany({}),
  ]);

  // 1. Create Users
  console.log("Creating default users...");
  const hashedPassword = await bcrypt.hash("password123", 12);
  
  const userAlice = await User.create({
    name: "Alice Smith",
    email: "alice@vaultfs.local",
    password: hashedPassword,
  });

  const userBob = await User.create({
    name: "Bob Jones",
    email: "bob@vaultfs.local",
    password: hashedPassword,
  });

  console.log(`Created Alice (${userAlice.email}) & Bob (${userBob.email})`);

  // 2. Create Folders for Alice
  console.log("Creating folder structures for Alice...");
  const folderDocuments = await Folder.create({
    ownerId: userAlice._id,
    name: "Documents",
  });

  const folderVideos = await Folder.create({
    ownerId: userAlice._id,
    name: "Videos & Tutorials",
  });

  const folderBookmarks = await Folder.create({
    ownerId: userAlice._id,
    name: "Bookmarks & Links",
  });

  const folderNotes = await Folder.create({
    ownerId: userAlice._id,
    name: "Engineering Notes",
  });

  // Nest a subfolder inside documents
  const folderSubDocs = await Folder.create({
    ownerId: userAlice._id,
    name: "System Specifications",
    parentFolderId: folderDocuments._id,
  });

  console.log("Folders created successfully!");

  // 3. Create Resources for Alice
  console.log("Creating default resources for Alice...");
  
  // Note resource
  await Resource.create({
    ownerId: userAlice._id,
    folderId: folderNotes._id,
    type: "NOTE",
    title: "VaultFS Architecture Core principles",
    description: "Overview notes on VaultFS storage separation model.",
    tags: ["architecture", "vaultfs", "design"],
    visibility: "PRIVATE",
    metadata: {
      noteContent: `# VaultFS Architecture Design Principles

VaultFS decouples metadata from physical storage seamlessly. Here are the core axioms:

1. **Separation of Concerns:** MongoDB manages the resource paths and relationships; Cloudinary handles binary data.
2. **Federated Nodes:** Nodes are dynamically initialized using credentials provided by peers.
3. **Decentralized Trust:** Agreements are strictly direct leases.
4. **Capacity Routing:** Score = availableStorage * 0.8 + health * 0.2.
`,
    },
  });

  // Link resource
  await Resource.create({
    ownerId: userAlice._id,
    folderId: folderBookmarks._id,
    type: "LINK",
    title: "Mongoose Singleton Cache Pattern",
    description: "Useful reference for setting up globalThis connection cache.",
    tags: ["mongoose", "nextjs", "database"],
    visibility: "PRIVATE",
    metadata: {
      externalUrl: "https://mongoosejs.com/docs/connections.html",
    },
  });

  // YouTube resource
  await Resource.create({
    ownerId: userAlice._id,
    folderId: folderVideos._id,
    type: "YOUTUBE",
    title: "Next.js 15 App Router Crash Course",
    description: "Learn Next.js 15 routing, layout structures, and server actions.",
    tags: ["nextjs", "tutorial", "video"],
    visibility: "SHARED",
    metadata: {
      youtubeUrl: "https://www.youtube.com/watch?v=ZjAqacL_To0",
    },
  });

  console.log("Alice's resources created successfully!");

  // 4. Create Storage Lease request from Bob to Alice
  console.log("Seeding storage lease request...");
  await StorageLease.create({
    providerId: userAlice._id, // Alice provides storage to Bob
    consumerId: userBob._id,
    maxStorageGB: 15,
    status: "PENDING",
  });

  console.log("Seeding complete! Closing connection...");
  await mongoose.connection.close();
  console.log("Database seeded successfully. Run 'npm run dev' to start the application.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
