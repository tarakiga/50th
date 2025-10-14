import { describe, it, expect } from "vitest";
import { RSVPBodySchema } from "../src/schemas/rsvp";

describe("RSVPBodySchema", () => {
  it("accepts valid payload", () => {
    const r = RSVPBodySchema.safeParse({ token: "abcdefgh", action: "attending" });
    expect(r.success).toBe(true);
  });
  it("rejects short token", () => {
    const r = RSVPBodySchema.safeParse({ token: "abc", action: "attending" });
    expect(r.success).toBe(false);
  });
  it("rejects invalid action", () => {
    // @ts-expect-error testing invalid
    const r = RSVPBodySchema.safeParse({ token: "abcdefgh", action: "maybe" });
    expect(r.success).toBe(false);
  });
});
