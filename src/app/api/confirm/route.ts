import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Forward body to Shippo confirm endpoint
    const targetUrl = `${process.env.NEXT_PUBLIC_SHIPPOP_BASE_URL}/confirm/`;
    console.log(
      "Forwarding to Shippo Confirm:",
      targetUrl,
      JSON.stringify(body)
    );
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
