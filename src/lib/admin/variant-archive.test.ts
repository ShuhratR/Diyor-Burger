import { describe, expect, it } from "vitest";
import { blocksLastOrderableVariantArchive } from "./variant-archive";

describe("pizza variant archive guard", () => {
  it("blocks archiving the last available active variant", () => {
    expect(blocksLastOrderableVariantArchive({ isActive: true, isAvailable: true }, 1)).toBe(true);
  });
  it("allows archiving one of multiple available variants", () => {
    expect(blocksLastOrderableVariantArchive({ isActive: true, isAvailable: true }, 2)).toBe(false);
  });
  it("allows archiving an already unavailable variant", () => {
    expect(blocksLastOrderableVariantArchive({ isActive: true, isAvailable: false }, 1)).toBe(false);
  });
  it("allows archiving an inactive variant", () => {
    expect(blocksLastOrderableVariantArchive({ isActive: false, isAvailable: false }, 1)).toBe(false);
  });
});
