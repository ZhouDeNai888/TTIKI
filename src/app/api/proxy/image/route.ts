import { NextResponse } from "next/server";

// Simple image proxy to avoid browser CORS when client needs to fetch image blobs.
// Usage: /api/proxy/image?src=<encoded-image-url>
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { searchParams, pathname } = url;

    // Allow either ?src=<url> or path-based proxy: /api/proxy/image/<path>
    let upstreamUrl = searchParams.get("src") || null;

    if (!upstreamUrl) {
      // Build upstream from NEXT_PUBLIC_BACKEND_HOST or fallback to backend:8000
      const backendHostRaw =
        process.env.NEXT_PUBLIC_BACKEND_HOST || "backend:8000";
      const backendBase =
        backendHostRaw.startsWith("http://") ||
        backendHostRaw.startsWith("https://")
          ? backendHostRaw.replace(/\/$/, "")
          : `http://${backendHostRaw.replace(/\/$/, "")}`;

      const prefix = "/api/proxy/image/";
      if (!pathname.startsWith(prefix)) {
        return NextResponse.json(
          { error: "Missing src parameter or invalid proxy path" },
          { status: 400 }
        );
      }

      // tail is the portion after /api/proxy/image/
      const tail = pathname.slice(prefix.length);
      if (!tail) {
        return NextResponse.json(
          { error: "Missing proxied path" },
          { status: 400 }
        );
      }

      // Construct upstream URL pointing at backend uploads
      // If caller requested /api/proxy/image/uploads/..., map to /uploads/...
      upstreamUrl = `${backendBase}/${tail}`;
    }

    // Basic validation to avoid proxying non-http(s) schemes
    if (
      !upstreamUrl.startsWith("http://") &&
      !upstreamUrl.startsWith("https://")
    ) {
      return NextResponse.json(
        { error: "Invalid src parameter" },
        { status: 400 }
      );
    }

    const upstream = await fetch(upstreamUrl);
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Upstream fetch failed", status: upstream.status },
        { status: 502 }
      );
    }

    // Copy content-type and stream the body back to the client, adding CORS header
    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Access-Control-Allow-Origin", "*");
    // Short cache to reduce repeated upstream hits
    headers.set("Cache-Control", "public, max-age=60");

    // Forward upstream body (stream) and headers to client
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (err) {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
