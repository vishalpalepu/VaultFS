import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import PdfProgress from "@/lib/models/PdfProgress";
import { ok, err } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const url = req.nextUrl.searchParams.get("url");
    if (!url) return err("URL parameter is required", 400);

    await connectDB();
    const progress = await PdfProgress.findOne({ userId: session.user.id, pdfUrl: url }).lean();

    return ok({ page: progress?.page || 1 });
  } catch (error) {
    console.error("Get PDF progress error:", error);
    return err("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const body = await req.json();
    const { url, page } = body;

    if (!url || typeof page !== "number") {
      return err("url and valid page number are required", 400);
    }

    await connectDB();
    const progress = await PdfProgress.findOneAndUpdate(
      { userId: session.user.id, pdfUrl: url },
      { $set: { page } },
      { upsert: true, new: true }
    ).lean();

    return ok({ page: progress.page });
  } catch (error) {
    console.error("Update PDF progress error:", error);
    return err("Internal server error", 500);
  }
}
