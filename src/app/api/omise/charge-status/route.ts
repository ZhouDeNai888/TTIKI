import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const charge_id = searchParams.get("charge_id");
  if (!charge_id) {
    return NextResponse.json(
      { success: false, message: "charge_id required" },
      { status: 400 }
    );
  }

  // Prefer NEXT_PUBLIC_OMISE_SECRET_KEY when explicitly requested by dev, otherwise use server-only OMISE_SECRET_KEY.
  // Note: exposing a secret via NEXT_PUBLIC_ is unsafe for production. Use a server-side env var when possible.
  const secret =
    process.env.NEXT_PUBLIC_OMISE_SECRET_KEY || process.env.OMISE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { success: false, message: "OMISE_SECRET_KEY not configured on server" },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.omise.co/charges/${encodeURIComponent(charge_id)}`;
    // basic auth: secret key as username, empty password
    const auth = Buffer.from(`${secret}:`).toString("base64");
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    const data = await res.json();
    return NextResponse.json({ success: true, data }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || String(err) },
      { status: 500 }
    );
  }
}
