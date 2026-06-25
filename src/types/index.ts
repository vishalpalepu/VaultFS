// ============================================================
// VaultFS – Shared TypeScript Types
// ============================================================

export type ResourceType = "NOTE" | "PDF" | "VIDEO" | "IMAGE" | "YOUTUBE" | "LINK";
export type Visibility = "PRIVATE" | "SHARED";
export type NodeStatus = "ACTIVE" | "OFFLINE" | "DISABLED" | "FULL";
export type LeaseStatus = "PENDING" | "ACTIVE" | "REVOKED";
export type RelationType = "REFERENCES" | "RELATED" | "CHILD";

export type EventType =
  | "RESOURCE_CREATED"
  | "RESOURCE_UPDATED"
  | "RESOURCE_DELETED"
  | "RESOURCE_SHARED"
  | "NODE_ADDED"
  | "NODE_UPDATED"
  | "NODE_DISABLED"
  | "NODE_REMOVED"
  | "LEASE_REQUESTED"
  | "LEASE_APPROVED"
  | "LEASE_REVOKED"
  | "USER_REGISTERED"
  | "USER_LOGIN";

// ---- Serialized (JSON-safe) versions of Mongoose documents ----

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFolder {
  _id: string;
  ownerId: string;
  name: string;
  parentFolderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IResourceMetadata {
  cloudinaryPublicId?: string;
  youtubeUrl?: string;
  externalUrl?: string;
  noteContent?: string;
  size?: number;
  mimeType?: string;
  cloudName?: string;
}

export interface IResource {
  _id: string;
  ownerId: string;
  folderId: string;
  storageNodeId?: string | null;
  type: ResourceType;
  title: string;
  description?: string;
  tags: string[];
  visibility: Visibility;
  hash?: string;
  metadata: IResourceMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface IStorageNode {
  _id: string;
  ownerId: string;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  status: NodeStatus;
  active: boolean;
  availableStorageGB: number;
  usedStorageGB: number;
  failureCount: number;
  lastHealthCheck?: string | null;
  createdAt: string;
}

export interface IStorageLease {
  _id: string;
  providerId: string;
  consumerId: string;
  maxStorageGB: number;
  status: LeaseStatus;
  expiresAt?: string | null;
  createdAt: string;
  // populated
  provider?: IUser;
  consumer?: IUser;
}

export interface IResourceLink {
  _id: string;
  sourceResourceId: string;
  targetResourceId: string;
  relation: RelationType;
  createdAt: string;
  // populated
  targetResource?: IResource;
}

export interface IEventLog {
  _id: string;
  eventType: EventType;
  actorId: string;
  targetId?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ---- API response wrappers ----

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ---- Dashboard stats ----

export interface DashboardStats {
  totalResources: number;
  totalStorageGB: number;
  activeLeases: number;
  recentResources: IResource[];
}
