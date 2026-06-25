// ============================================================
// POST /api/auth/register – User Registration
// ============================================================

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import { createEvent } from "@/lib/services/eventLogService";
import { ok, err } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return err("Name, email, and password are required.", 400);
    }

    if (password.length < 6) {
      return err("Password must be at least 6 characters.", 400);
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return err("Email already registered.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await createEvent("USER_REGISTERED", user._id.toString());

    return ok(
      {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return err("Internal server error.", 500);
  }
}
