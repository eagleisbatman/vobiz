const BASE_URL = "https://api.vobiz.ai/api/v1";

/**
 * Validate and encode a path segment to prevent path traversal.
 * Rejects values containing slashes, "..", or null bytes.
 */
function safePathSegment(value: string, label: string): string {
  if (
    value.includes("/") ||
    value.includes("\\") ||
    value.includes("..") ||
    value.includes("\0")
  ) {
    throw new Error(`Invalid ${label}: must not contain path separators or traversal sequences`);
  }
  return encodeURIComponent(value);
}

/**
 * Sanitize error response bodies to avoid leaking internal API details.
 * Truncates to a safe length and strips potential sensitive data.
 */
function sanitizeErrorBody(body: string): string {
  const maxLen = 200;
  const truncated = body.length > maxLen ? body.slice(0, maxLen) + "..." : body;
  return truncated.replace(/auth_secret[^,}]*/gi, "auth_secret:[REDACTED]");
}

function parseJson(body: string, method: string, path: string): unknown {
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(
      `${method} ${path}: expected JSON response but got non-JSON body (${body.length} bytes)`
    );
  }
}

export class VobizClient {
  private authId: string;
  private authToken: string;

  constructor() {
    const authId = process.env.VOBIZ_AUTH_ID;
    const authToken = process.env.VOBIZ_AUTH_TOKEN;
    if (!authId || !authToken) {
      throw new Error(
        "VOBIZ_AUTH_ID and VOBIZ_AUTH_TOKEN environment variables are required"
      );
    }
    this.authId = authId;
    this.authToken = authToken;
  }

  get accountId(): string {
    return this.authId;
  }

  /** Encode a user-provided value for safe use in a URL path segment. */
  safePath(value: string, label: string): string {
    return safePathSegment(value, label);
  }

  private headers(json = false): Record<string, string> {
    const h: Record<string, string> = {
      "X-Auth-ID": this.authId,
      "X-Auth-Token": this.authToken,
    };
    if (json) h["Content-Type"] = "application/json";
    return h;
  }

  async get(path: string, query?: Record<string, string>): Promise<unknown> {
    const url = new URL(`${BASE_URL}${path}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== "") url.searchParams.set(k, v);
      }
    }
    const res = await fetch(url, { headers: this.headers() });
    if (res.status === 204) return { status: 204 };
    const body = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${sanitizeErrorBody(body)}`);
    return parseJson(body, "GET", path);
  }

  async post(path: string, data?: unknown): Promise<unknown> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: this.headers(true),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (res.status === 204) return { status: 204 };
    const body = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${sanitizeErrorBody(body)}`);
    return body ? parseJson(body, "POST", path) : { status: res.status };
  }

  async delete(path: string): Promise<unknown> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: this.headers(),
    });
    if (res.status === 204) return { message: "deleted" };
    const body = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${sanitizeErrorBody(body)}`);
    return body ? parseJson(body, "DELETE", path) : { status: res.status };
  }
}
