import { NextResponse } from "next/server";

async function getNormalizedHost() {
  // Prefer server-only internal host for container -> host access
  let backendHost =
    process.env.BACKEND_INTERNAL_HOST ||
    process.env.NEXT_PUBLIC_BACKEND_HOST ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "";
  backendHost = backendHost
    .trim()
    .replace(/^\"|\"$/g, "")
    .replace(/^\'|\'$/g, "")
    .replace(/[\r\n\t]/g, "")
    .replace(/\s+/g, "")
    .replace(/\/$/, "");
  if (backendHost.includes("/api"))
    backendHost = backendHost.replace(/\/api.*$/, "");
  if (backendHost && !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(backendHost))
    backendHost = `http://${backendHost}`;
  return backendHost;
}

export async function GET(request: Request, context: { params: any }) {
  const params = await context.params;
  const provider = params.provider;

  const normalizedHost = await getNormalizedHost();
  if (!normalizedHost) {
    console.error("OAuth callback proxy: missing backend host env");
    return new NextResponse(JSON.stringify({ error: "Invalid backend host" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  const incomingUrl = new URL(request.url);
  const qs = incomingUrl.search || "";
  const upstream = `${normalizedHost.replace(
    /\/$/,
    ""
  )}/api/v1/oauth/${provider}/callback${qs}`;
  console.debug("OAuth callback proxy upstream=", upstream);

  try {
    // follow redirects so we receive final HTML page that posts to opener
    const res = await fetch(upstream, {
      method: "GET",
      headers: {
        accept: request.headers.get("accept") || "*/*",
        cookie: request.headers.get("cookie") || "",
      },
      redirect: "follow",
    });

    const contentType =
      res.headers.get("content-type") || "text/html; charset=utf-8";
    const body = await res.arrayBuffer();
    const headers: Record<string, string> = { "content-type": contentType };
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) headers["set-cookie"] = setCookie;

    const status =
      typeof res.status === "number" && res.status >= 100 && res.status <= 599
        ? res.status
        : 502;
    return new NextResponse(Buffer.from(body), { status, headers });
  } catch (err) {
    console.error("OAuth callback proxy error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(
      JSON.stringify({ error: "Upstream fetch failed", details: msg }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
