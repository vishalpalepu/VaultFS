import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { getCloudinaryUrl } from "../src/lib/storage/cloudinary";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

const StorageNodeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cloudName: { type: String, required: true },
  apiKey: { type: String, required: true },
  apiSecret: { type: String, required: true },
  status: { type: String, default: "ACTIVE" },
  active: { type: Boolean, default: true },
});

const StorageNode = mongoose.models.StorageNode || mongoose.model("StorageNode", StorageNodeSchema);

async function main() {
  await mongoose.connect(MONGODB_URI!);
  const node = await StorageNode.findOne({ active: true });
  if (!node) {
    console.error("No active node found");
    await mongoose.connection.close();
    return;
  }
  // Let's use the public ID of the uploaded PDF: "vaultfs/6a3e0bcfc1f85003930b417b/nvzgilvy2azslhg3rher"
  const publicId = "vaultfs/6a3e0bcfc1f85003930b417b/nvzgilvy2azslhg3rher";
  const url = getCloudinaryUrl(node, publicId, "image", "pdf");
  console.log("Fetching URL:", url);

  try {
    const res = await fetch(url);
    console.log("Fetch Status:", res.status);
    console.log("Fetch Headers:");
    res.headers.forEach((val, key) => {
      console.log(`  ${key}: ${val}`);
    });
    if (res.status !== 200) {
      const text = await res.text();
      console.log("Response Body (first 500 chars):", text.slice(0, 500));
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }

  await mongoose.connection.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
