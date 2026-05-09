import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { VobizClient } from "../client.js";

const FAKE_ID = "TEST_AUTH_ID";
const FAKE_TOKEN = "TEST_AUTH_TOKEN";

function setEnv() {
  process.env.VOBIZ_AUTH_ID = FAKE_ID;
  process.env.VOBIZ_AUTH_TOKEN = FAKE_TOKEN;
}

function clearEnv() {
  delete process.env.VOBIZ_AUTH_ID;
  delete process.env.VOBIZ_AUTH_TOKEN;
}

describe("VobizClient constructor", () => {
  afterEach(clearEnv);

  it("throws when env vars are missing", () => {
    clearEnv();
    expect(() => new VobizClient()).toThrow("VOBIZ_AUTH_ID");
  });

  it("constructs with valid env vars", () => {
    setEnv();
    const client = new VobizClient();
    expect(client.accountId).toBe(FAKE_ID);
  });
});

describe("safePath", () => {
  let client: VobizClient;

  beforeEach(() => {
    setEnv();
    client = new VobizClient();
  });
  afterEach(clearEnv);

  it("accepts clean values", () => {
    expect(client.safePath("abc-123", "id")).toBe("abc-123");
  });

  it("encodes special characters", () => {
    expect(client.safePath("+919876543210", "phone")).toBe("%2B919876543210");
  });

  it("rejects path traversal", () => {
    expect(() => client.safePath("../etc/passwd", "id")).toThrow("path separators");
    expect(() => client.safePath("a/b", "id")).toThrow("path separators");
    expect(() => client.safePath("a\\b", "id")).toThrow("path separators");
  });

  it("rejects null bytes", () => {
    expect(() => client.safePath("abc\0def", "id")).toThrow("path separators");
  });
});

describe("recordingUrl", () => {
  let client: VobizClient;

  beforeEach(() => {
    setEnv();
    client = new VobizClient();
  });
  afterEach(clearEnv);

  it("builds correct media URL", () => {
    const url = client.recordingUrl("550e8400-e29b-41d4-a716-446655440000");
    expect(url).toBe(
      `https://media.vobiz.ai/v1/Account/${FAKE_ID}/Recording/550e8400-e29b-41d4-a716-446655440000.wav`
    );
  });

  it("rejects traversal in recording ID", () => {
    expect(() => client.recordingUrl("../../../etc")).toThrow("path separators");
  });
});

describe("HTTP methods", () => {
  let client: VobizClient;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setEnv();
    client = new VobizClient();
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    clearEnv();
    vi.restoreAllMocks();
  });

  it("GET sends correct headers and parses JSON", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"result":"ok"}'),
    });

    const result = await client.get("/test/path");
    expect(result).toEqual({ result: "ok" });

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url.toString()).toContain("/test/path");
    expect(opts.headers["X-Auth-ID"]).toBe(FAKE_ID);
    expect(opts.headers["X-Auth-Token"]).toBe(FAKE_TOKEN);
  });

  it("GET appends query params", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve("{}"),
    });

    await client.get("/path", { page: "1", limit: "10" });
    const [url] = fetchSpy.mock.calls[0];
    expect(url.toString()).toContain("page=1");
    expect(url.toString()).toContain("limit=10");
  });

  it("GET handles 204 without body", async () => {
    fetchSpy.mockResolvedValue({ ok: true, status: 204 });
    const result = await client.get("/path");
    expect(result).toEqual({ status: 204 });
  });

  it("GET throws on error response", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: () => Promise.resolve("not found"),
    });

    await expect(client.get("/missing")).rejects.toThrow("404 Not Found");
  });

  it("POST sends JSON body", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"created":true}'),
    });

    const result = await client.post("/create", { name: "test" });
    expect(result).toEqual({ created: true });

    const [, opts] = fetchSpy.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(opts.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(opts.body)).toEqual({ name: "test" });
  });

  it("DELETE returns message on 204", async () => {
    fetchSpy.mockResolvedValue({ ok: true, status: 204 });
    const result = await client.delete("/resource");
    expect(result).toEqual({ message: "deleted" });
  });
});
