import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    // Expecting path /api/admin/order/cancel/<order_id>
    const orderId = pathParts[pathParts.length - 1];

    const targetUrl = `${process.env.NEXT_PUBLIC_API_BASE}/user/order/cancel/${orderId}`;
    // Forward Authorization and Cookie headers from the incoming request
    const incomingAuth =
      req.headers.get("authorization") || req.headers.get("Authorization");
    const incomingCookie = req.headers.get("cookie");

    const forwardHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (incomingAuth) forwardHeaders["Authorization"] = incomingAuth;
    if (incomingCookie) forwardHeaders["Cookie"] = incomingCookie;

    const body = await req.text();

    const res = await fetch(targetUrl, {
      method: "PUT",
      headers: forwardHeaders,
      body,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
