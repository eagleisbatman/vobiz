import { describe, it, expect } from "vitest";
import { uuidPattern, phonePattern, uuidParam, cdrFilterSchema, buildQuery } from "../tools/validation.js";

describe("uuidPattern", () => {
  it("matches valid UUIDs", () => {
    expect(uuidPattern.test("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(uuidPattern.test("ABCDEF12-3456-7890-ABCD-EF1234567890")).toBe(true);
  });

  it("rejects invalid UUIDs", () => {
    expect(uuidPattern.test("not-a-uuid")).toBe(false);
    expect(uuidPattern.test("550e8400e29b41d4a716446655440000")).toBe(false);
    expect(uuidPattern.test("")).toBe(false);
    expect(uuidPattern.test("550e8400-e29b-41d4-a716-44665544000g")).toBe(false);
  });
});

describe("phonePattern", () => {
  it("matches E.164 numbers", () => {
    expect(phonePattern.test("+919876543210")).toBe(true);
    expect(phonePattern.test("+14155551234")).toBe(true);
    expect(phonePattern.test("919876543210")).toBe(true);
  });

  it("rejects invalid numbers", () => {
    expect(phonePattern.test("")).toBe(false);
    expect(phonePattern.test("+0123456789")).toBe(false);
    expect(phonePattern.test("abc")).toBe(false);
    expect(phonePattern.test("+1234567890123456")).toBe(false);
  });
});

describe("uuidParam", () => {
  it("accepts valid UUID", () => {
    const schema = uuidParam("test_id");
    expect(schema.parse("550e8400-e29b-41d4-a716-446655440000")).toBe(
      "550e8400-e29b-41d4-a716-446655440000"
    );
  });

  it("rejects invalid UUID with label in message", () => {
    const schema = uuidParam("call_uuid");
    expect(() => schema.parse("bad")).toThrow("call_uuid");
  });
});

describe("cdrFilterSchema", () => {
  it("has expected filter keys", () => {
    const keys = Object.keys(cdrFilterSchema);
    expect(keys).toContain("from_number");
    expect(keys).toContain("to_number");
    expect(keys).toContain("start_date");
    expect(keys).toContain("end_date");
    expect(keys).toContain("call_direction");
    expect(keys).toContain("min_duration");
    expect(keys).toContain("page");
    expect(keys).toContain("per_page");
  });
});

describe("buildQuery", () => {
  it("converts values to strings", () => {
    expect(buildQuery({ page: 1, limit: 20 })).toEqual({
      page: "1",
      limit: "20",
    });
  });

  it("skips undefined values", () => {
    expect(buildQuery({ a: "yes", b: undefined, c: 3 })).toEqual({
      a: "yes",
      c: "3",
    });
  });

  it("returns empty object for empty input", () => {
    expect(buildQuery({})).toEqual({});
  });

  it("handles boolean values", () => {
    expect(buildQuery({ flag: true })).toEqual({ flag: "true" });
  });
});
