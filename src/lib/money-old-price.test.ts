import { describe, expect, it } from "vitest";
import { parseOptionalOldPriceDiram } from "./money";

describe("optional old price", () => {
  it("treats an unfilled input as no discount", () => {
    expect(parseOptionalOldPriceDiram("", 4300)).toBeNull();
    expect(parseOptionalOldPriceDiram("  ", 4300)).toBeNull();
    expect(parseOptionalOldPriceDiram(null, 4300)).toBeNull();
  });

  it("accepts a higher old price in somoni with comma or dot decimals", () => {
    expect(parseOptionalOldPriceDiram("50", 4300)).toBe(5000);
    expect(parseOptionalOldPriceDiram("43,50", 4300)).toBe(4350);
    expect(parseOptionalOldPriceDiram("43.50", 4300)).toBe(4350);
  });

  it("rejects an equal or lower old price", () => {
    expect(() => parseOptionalOldPriceDiram("43", 4300)).toThrow("INVALID_OLD_PRICE");
    expect(() => parseOptionalOldPriceDiram("42", 4300)).toThrow("INVALID_OLD_PRICE");
  });

  it("does not silently remove an invalid filled old price", () => {
    expect(() => parseOptionalOldPriceDiram("wrong", 4300)).toThrow("INVALID_OLD_PRICE");
    expect(() => parseOptionalOldPriceDiram("43.123", 4300)).toThrow("INVALID_OLD_PRICE");
    expect(() => parseOptionalOldPriceDiram("55", null)).toThrow("INVALID_OLD_PRICE");
  });
});
