import mongoose, { Schema, Document, Model, models } from "mongoose";
import type { RelationType } from "@/types";

export interface IResourceLinkDoc extends Document {
  sourceResourceId: mongoose.Types.ObjectId;
  targetResourceId: mongoose.Types.ObjectId;
  relation: RelationType;
  createdAt: Date;
}

const ResourceLinkSchema = new Schema<IResourceLinkDoc>(
  {
    sourceResourceId: { type: Schema.Types.ObjectId, ref: "Resource", required: true },
    targetResourceId: { type: Schema.Types.ObjectId, ref: "Resource", required: true },
    relation: {
      type: String,
      enum: ["REFERENCES", "RELATED", "CHILD"],
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes
ResourceLinkSchema.index({ sourceResourceId: 1 });
ResourceLinkSchema.index({ targetResourceId: 1 });

const ResourceLink: Model<IResourceLinkDoc> =
  models.ResourceLink || mongoose.model<IResourceLinkDoc>("ResourceLink", ResourceLinkSchema);
export default ResourceLink;
