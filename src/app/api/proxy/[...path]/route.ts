import { NextResponse } from "next/server";

async function proxyHandler(request: Request, params: { path?: string[] }) {
  const pathParts = params?.path ?? [];
  const targetBase = process.env.NEXT_PUBLIC_API_BASE || "";
  const targetPath = pathParts.join("/");
  const targetUrl = targetPath ? `${targetBase}/${targetPath}` : targetBase;

  // Clone headers and forward cookies
  const incomingHeaders = Object.fromEntries(request.headers.entries());
  // Remove host header to avoid conflicts
  delete incomingHeaders.host;

  // Build fetch options
  const options: RequestInit = {
    method: request.method,
    headers: incomingHeaders as HeadersInit,
    // body will be added below if present
  };

  // Only set body for methods that allow it
  const methodsWithBody = ["POST", "PUT", "PATCH", "DELETE"];
  if (methodsWithBody.includes(request.method.toUpperCase())) {
    try {
      const buf = await request.arrayBuffer();
      if (buf && buf.byteLength > 0) options.body = Buffer.from(buf);
    } catch (e) {
      // ignore
    }
  }

  // Forward the request to the target URL
  const res = await fetch(targetUrl, options);

  // Build response headers (filter hop-by-hop headers)
  const responseHeaders = new Headers(res.headers);
  [
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
  ].forEach((h) => responseHeaders.delete(h));

  const body = await res.arrayBuffer();

  return new NextResponse(Buffer.from(body), {
    status: res.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, context: { params: any }) {
  const params = await context.params;
  return proxyHandler(request, params);
}

export async function POST(request: Request, context: { params: any }) {
  const params = await context.params;
  return proxyHandler(request, params);
}

export async function PUT(request: Request, context: { params: any }) {
  const params = await context.params;
  return proxyHandler(request, params);
}

export async function PATCH(request: Request, context: { params: any }) {
  const params = await context.params;
  return proxyHandler(request, params);
}

export async function DELETE(request: Request, context: { params: any }) {
  const params = await context.params;
  return proxyHandler(request, params);
}

export async function OPTIONS(request: Request, context: { params: any }) {
  // Allow CORS preflight to succeed by proxying and returning headers
  const params = await context.params;
  const res = await proxyHandler(request, params);
  return res;
}
