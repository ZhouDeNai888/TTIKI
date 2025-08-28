import { NextResponse } from "next/server";

// Minimal placeholder handlers so this file is a proper module for Next.js build.
// Replace with real update logic as needed.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    return NextResponse.json({ success: true, received: body });
  } catch (err) {
    return NextResponse.json(
      { error: "internal_server_error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to update" });
}
