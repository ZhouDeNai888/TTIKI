// app/api/sse/notify/route.ts
import { cookies } from "next/headers";
import { proxySSEResponse } from "../../streamProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  // `cookies()` may be async in this runtime so await the cookie store
  const cookieStore = await cookies();
  const token = cookieStore.get("aat")?.value; // หรือดึงจาก server session
  console.log("SSE admin notify route, token:", token);

  const upstream = await fetch(API_BASE + "/sse/notify", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    // ห้าม cache สตรีม
    cache: "no-store",
  });

  return proxySSEResponse(upstream);
}
