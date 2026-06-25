// ============================================================
// VaultFS – API Response Helpers
// ============================================================

import { NextResponse } from "next/server";

export function ok<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function err(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}
