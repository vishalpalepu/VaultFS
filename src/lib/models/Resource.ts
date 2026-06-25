import mongoose, { Schema, Document, Model, models } from "mongoose";
import type { ResourceType, Visibility } from "@/types";

export interface IResourceMetadataDoc {
  cloudinaryPublicId?: string;
  youtubeUrl?: string;
  externalUrl?: string;
  noteContent?: string;
  size?: number;
  mimeType?: string;
  cloudName?: string;
}

export interface IResourceDoc extends Document {
  ownerId: mongoose.Types.ObjectId;
  folderId: mongoose.Types.ObjectId;
  storageNodeId?: mongoose.Types.ObjectId | null;
  type: ResourceType;
  title: string;
  description?: string;
  tags: string[];
  visibility: Visibility;
  hash?: string;
  metadata: IResourceMetadataDoc;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResourceDoc>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    folderId: { type: Schema.Types.ObjectId, ref: "Folder", required: true },
    storageNodeId: { type: Schema.Types.ObjectId, ref: "StorageNode", default: null },
    type: {
      type: String,
      enum: ["NOTE", "PDF", "VIDEO", "IMAGE", "YOUTUBE", "LINK"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    visibility: {
      type: String,
      enum: ["PRIVATE", "SHARED"],
      default: "PRIVATE",
    },
    hash: { type: String },
    metadata: {
      cloudinaryPublicId: { type: String },
      youtubeUrl: { type: String },
      externalUrl: { type: String },
      noteContent: { type: String },
      size: { type: Number },
      mimeType: { type: String },
      cloudName: { type: String },
    },
  },
  { timestamps: true }
);

// Indexes
ResourceSchema.index({ ownerId: 1, folderId: 1 });
ResourceSchema.index(
  { title: "text", description: "text", tags: "text", "metadata.noteContent": "text" },
  { name: "resource_text_search" }
);

const Resource: Model<IResourceDoc> =
  models.Resource || mongoose.model<IResourceDoc>("Resource", ResourceSchema);
export default Resource;
