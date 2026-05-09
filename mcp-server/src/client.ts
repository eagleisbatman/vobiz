const BASE_URL = "https://api.vobiz.ai/api/v1";

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
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${body}`);
    return JSON.parse(body);
  }

  async post(path: string, data?: unknown): Promise<unknown> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: this.headers(true),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (res.status === 204) return { status: 204 };
    const body = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${body}`);
    return body ? JSON.parse(body) : { status: res.status };
  }

  async put(path: string, data?: unknown): Promise<unknown> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: this.headers(true),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (res.status === 204) return { status: 204 };
    const body = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${body}`);
    return body ? JSON.parse(body) : { status: res.status };
  }

  async delete(path: string): Promise<unknown> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: this.headers(),
    });
    if (res.status === 204) return { message: "deleted" };
    const body = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${body}`);
    return body ? JSON.parse(body) : { status: res.status };
  }
}
