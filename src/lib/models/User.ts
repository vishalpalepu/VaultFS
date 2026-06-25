import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IUserDoc extends Document {
  name: string;
  email: string;
  password: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });

const User: Model<IUserDoc> = models.User || mongoose.model<IUserDoc>("User", UserSchema);
export default User;
