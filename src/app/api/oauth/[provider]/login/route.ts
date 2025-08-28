import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: any }) {
  const params = await context.params;
  const provider = params.provider;

  // Prefer a specific backend host exposed to the browser (set in .env as NEXT_PUBLIC_BACKEND_HOST)
  // Fallback to NEXT_PUBLIC_API_BASE and strip any `/api` suffix so we get the base host.
  // For server-side proxying prefer a server-only env var so containers can reach the host
  // Use BACKEND_INTERNAL_HOST (e.g. http://host.docker.internal:8000) when available.
  let backendHost =
    process.env.BACKEND_INTERNAL_HOST ||
    process.env.NEXT_PUBLIC_BACKEND_HOST ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "";
  // sanitize: trim, remove surrounding quotes, and strip whitespace/newlines
  backendHost = backendHost
    .trim()
    .replace(/^\"|\"$/g, "")
    .replace(/^\'|\'$/g, "")
    .replace(/[\r\n\t]/g, "")
    .replace(/\s+/g, "")
    .replace(/\/$/, "");
  // If the value contains an /api segment, remove it so we point at the backend server root
  if (backendHost.includes("/api")) {
    backendHost = backendHost.replace(/\/api.*$/, "");
  }

  // Ensure we have a scheme (fetch in Node requires it). Default to http:// if missing.
  // Note: don't treat 'host:port' as a scheme (older regex falsely matched it), require '://'
  let normalizedHost = backendHost;
  if (normalizedHost && !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(normalizedHost)) {
    normalizedHost = `http://${normalizedHost}`;
  }

  // log after normalization so container logs show the actual value used
  console.debug(
    "OAuth proxy: normalizedHost after normalization=",
    normalizedHost
  );

  // Build upstream URL, preserving any query string from the incoming request
  const incomingUrl = new URL(request.url);
  const qs = incomingUrl.search || "";

  if (!normalizedHost) {
    console.error(
      "OAuth proxy: missing NEXT_PUBLIC_BACKEND_HOST / NEXT_PUBLIC_API_BASE"
    );
    return new NextResponse(JSON.stringify({ error: "Invalid backend host" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  const upstream = `${normalizedHost.replace(
    /\/$/,
    ""
  )}/api/v1/oauth/${provider}/login${qs}`;
  // debug log to help diagnose invalid upstream values in container logs
  console.debug(
    "OAuth proxy: chosen backendHost=",
    backendHost,
    "normalizedHost=",
    normalizedHost,
    "upstream=",
    upstream
  );

  // validate upstream URL to catch invalid-scheme early
  try {
    // eslint-disable-next-line no-new
    new URL(upstream);
  } catch (e) {
    console.error("OAuth proxy: invalid upstream URL:", upstream, e);
    return new NextResponse(
      JSON.stringify({
        error: "Invalid upstream URL",
        upstream,
        details: String(e),
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  try {
    // Call the backend but don't automatically follow redirects so we can forward them to the browser
    const res = await fetch(upstream, {
      method: "GET",
      headers: {
        // forward accept header and cookies if present
        accept: request.headers.get("accept") || "*/*",
        cookie: request.headers.get("cookie") || "",
      },
      redirect: "manual",
    });

    // If backend responds with a redirect to the provider (or anywhere), forward that redirect to the browser
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (location) {
        // Resolve relative locations against the normalizedHost
        const resolved = (() => {
          try {
            return new URL(
              location,
              normalizedHost.endsWith("/")
                ? normalizedHost
                : `${normalizedHost}/`
            ).toString();
          } catch (e) {
            return location.startsWith("http")
              ? location
              : `${normalizedHost.replace(/\/$/, "")}${
                  location.startsWith("/") ? "" : "/"
                }${location}`;
          }
        })();
        // Forward Set-Cookie header(s) from backend so the browser receives session cookie
        const setCookie = res.headers.get("set-cookie");
        const headers: Record<string, string> = { location: resolved };
        if (setCookie) headers["set-cookie"] = setCookie;
        return new NextResponse(null, { status: res.status, headers });
      }
      return new NextResponse(null, { status: Math.max(502, res.status) });
    }

    // For non-redirect responses, stream body and preserve content-type
    const contentType =
      res.headers.get("content-type") || "text/html; charset=utf-8";
    const body = await res.arrayBuffer();
    const headers: Record<string, string> = { "content-type": contentType };

    // Forward Set-Cookie header if present
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) headers["set-cookie"] = setCookie;

    const status =
      typeof res.status === "number" && res.status >= 100 && res.status <= 599
        ? res.status
        : 502;
    return new NextResponse(Buffer.from(body), { status, headers });
  } catch (err) {
    console.error("OAuth proxy error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(
      JSON.stringify({ error: "Upstream fetch failed", details: msg }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
