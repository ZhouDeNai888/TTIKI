import { NextResponse } from "next/server";

// Minimal placeholder handlers so this file is a proper module for Next.js build.
// Adjust logic to match your real cancel-order implementation later.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    // TODO: implement order cancel logic here using body data
    return NextResponse.json({ success: true, received: body });
  } catch (err) {
    return NextResponse.json(
      { error: "internal_server_error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Informative default for GET requests to this endpoint
  return NextResponse.json({ message: "Use POST to cancel an order" });
}
