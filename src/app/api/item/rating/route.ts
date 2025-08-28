import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export async function PUT(req: Request) {
  try {
    const payload = await req.json();

    const auth = req.headers.get("authorization");
    const cookie = req.headers.get("cookie");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (auth) headers["authorization"] = auth;
    if (cookie) headers["cookie"] = cookie;

    const res = await fetch(`${API_BASE}/item/rating`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: res.status });
    } catch (e) {
      // upstream returned non-JSON body
      return new NextResponse(text, { status: res.status });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}

export const runtime = "edge";
