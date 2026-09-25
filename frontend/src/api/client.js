const responseCache = new Map();

export function clearJsonCache() {
  responseCache.clear();
}

export async function getJson(url, options = {}) {
  const { signal: externalSignal, timeoutMs = 12000, ...fetchOptions } = options;
  const method = String(fetchOptions.method || "GET").toUpperCase();
  const cacheable = method === "GET";
  const cached = cacheable ? responseCache.get(url) : null;
  const headers = new Headers(fetchOptions.headers || {});
  if (cached?.etag && !headers.has("If-None-Match")) headers.set("If-None-Match", cached.etag);

  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const relayAbort = () => controller.abort();
  externalSignal?.addEventListener("abort", relayAbort, { once: true });

  try {
    const response = await fetch(url, {
      cache: "no-store",
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
    if (response.status === 304 && cached) return cached.payload;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `Request failed: ${response.status}`);
    }
    if (cacheable) {
      const etag = response.headers.get("ETag");
      if (etag) responseCache.set(url, { etag, payload });
    } else {
      responseCache.delete(url);
    }
    return payload;
  } catch (error) {
    if (timedOut) throw new Error("The page took too long to update. Trying again...");
    throw error;
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", relayAbort);
  }
}
