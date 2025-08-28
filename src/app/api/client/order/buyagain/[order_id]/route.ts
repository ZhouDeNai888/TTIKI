import { NextResponse } from "next/server";

// Proxy GET /api/client/order/buyagain/:orderId -> <API_BASE>/client/order/buyagain/:orderId
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    // Expecting path /api/admin/order/cancel/<order_id>
    const orderId = pathParts[pathParts.length - 1];

    const targetUrl = `${process.env.NEXT_PUBLIC_API_BASE}/client/order/buyagain/${orderId}`;

    // Forward Authorization and Cookie headers from the incoming request
    const incomingAuth =
      req.headers.get("authorization") || req.headers.get("Authorization");
    const incomingCookie = req.headers.get("cookie");

    const forwardHeaders: Record<string, string> = {
      Accept: "application/json",
    };
    if (incomingAuth) forwardHeaders["Authorization"] = incomingAuth;
    if (incomingCookie) forwardHeaders["Cookie"] = incomingCookie;

    const res = await fetch(targetUrl, {
      method: "GET",
      headers: forwardHeaders,
    });

    const text = await res.text();
    try {
      const data = text ? JSON.parse(text) : null;
      if (res.status === 401) {
        return NextResponse.json(data ?? { detail: "Unauthorized" }, {
          status: 401,
        });
      }
      return NextResponse.json(data, { status: res.status });
    } catch (err) {
      if (res.status === 401) {
        return NextResponse.json(
          { detail: text || "Unauthorized" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { success: false, message: text },
        { status: res.status }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
