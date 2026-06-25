import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IFolderDoc extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  parentFolderId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolderDoc>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    parentFolderId: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
  },
  { timestamps: true }
);

// Indexes
FolderSchema.index({ ownerId: 1, parentFolderId: 1 });

const Folder: Model<IFolderDoc> = models.Folder || mongoose.model<IFolderDoc>("Folder", FolderSchema);
export default Folder;
