import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IPdfProgressDoc extends Document {
  userId: mongoose.Types.ObjectId;
  pdfUrl: string;
  page: number;
  createdAt: Date;
  updatedAt: Date;
}

const PdfProgressSchema = new Schema<IPdfProgressDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pdfUrl: { type: String, required: true },
    page: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

PdfProgressSchema.index({ userId: 1, pdfUrl: 1 }, { unique: true });

const PdfProgress: Model<IPdfProgressDoc> =
  models.PdfProgress || mongoose.model<IPdfProgressDoc>("PdfProgress", PdfProgressSchema);
export default PdfProgress;
