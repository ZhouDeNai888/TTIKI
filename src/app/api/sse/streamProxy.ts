// Helper to stream an upstream Response body to the client as an SSE stream
export async function proxySSEResponse(
  upstream: Response,
  upstreamAbortController?: AbortController
) {
  if (!upstream || !upstream.body)
    return new Response("no body", { status: 502 });

  const upstreamBody: any = upstream.body;
  const encoder = new TextEncoder();

  let reader: any = null;
  let nodeStreamListeners: any = null;

  const stream = new ReadableStream({
    async start(controller) {
      let keepAliveInterval: any;
      const startKeepAlive = () => {
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        keepAliveInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": keep-alive\n\n"));
          } catch (e) {
            // ignore
          }
        }, 15000);
      };

      startKeepAlive();

      try {
        // WHATWG ReadableStream (has getReader)
        if (typeof upstreamBody.getReader === "function") {
          reader = upstreamBody.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
            startKeepAlive();
          }

          // Async iterable (Node stream implements async iterator in recent runtimes)
        } else if (Symbol.asyncIterator in upstreamBody) {
          for await (const chunk of upstreamBody) {
            controller.enqueue(
              typeof chunk === "string" ? encoder.encode(chunk) : chunk
            );
            startKeepAlive();
          }

          // Fallback to Node-style event emitter streams
        } else if (typeof upstreamBody.on === "function") {
          const onData = (chunk: any) => {
            controller.enqueue(
              typeof chunk === "string" ? encoder.encode(chunk) : chunk
            );
            startKeepAlive();
          };
          const onEnd = () => controller.close();
          const onError = (err: any) => controller.error(err);
          upstreamBody.on("data", onData);
          upstreamBody.on("end", onEnd);
          upstreamBody.on("error", onError);
          nodeStreamListeners = { onData, onEnd, onError };
          return;
        } else {
          // Last-resort: buffer and send
          const buf = await upstream.arrayBuffer();
          controller.enqueue(new Uint8Array(buf));
        }

        controller.close();
      } catch (err) {
        controller.error(err as any);
      } finally {
        if (keepAliveInterval) clearInterval(keepAliveInterval);
      }
    },
    cancel() {
      try {
        // Prefer aborting the upstream fetch if controller provided
        try {
          if (
            upstreamAbortController &&
            typeof upstreamAbortController.abort === "function"
          )
            upstreamAbortController.abort();
        } catch (_) {}

        // If we created a reader, cancel it directly to avoid "ReadableStream is locked"
        if (reader && typeof reader.cancel === "function") {
          try {
            reader.cancel();
          } catch (_) {}
        } else if (
          nodeStreamListeners &&
          typeof upstreamBody.off === "function"
        ) {
          // Remove node stream listeners and try to destroy the stream
          try {
            upstreamBody.off("data", nodeStreamListeners.onData);
            upstreamBody.off("end", nodeStreamListeners.onEnd);
            upstreamBody.off("error", nodeStreamListeners.onError);
          } catch (_) {}
          try {
            if (typeof upstreamBody.destroy === "function")
              upstreamBody.destroy();
          } catch (_) {}
        } else {
          try {
            if (typeof upstreamBody.cancel === "function")
              upstreamBody.cancel();
          } catch (_) {}
        }
      } catch (_) {}
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
