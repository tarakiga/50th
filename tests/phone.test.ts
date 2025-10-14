import { isE164 } from "../src/lib/phone";
import { describe, it, expect } from "vitest";

describe("isE164", () => {
  it("accepts valid E.164", () => {
    expect(isE164("+14155552671")).toBe(true);
  });
  it("rejects non-E.164", () => {
    expect(isE164("4155552671")).toBe(false);
  });
});
