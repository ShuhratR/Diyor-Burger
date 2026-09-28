import { describe, expect, it } from "vitest";
import { isUploadedCategoryImage } from "./category-image";

const supabase = "https://iubrvedvlqyewjwiszhw.supabase.co";
const uploaded = supabase + "/storage/v1/object/public/restaurant-media/categories/57b2763d-9734-4865-a85c-94ace0143fb0.png";

describe("new category image requirement", () => {
  it("accepts uploaded public category image from the expected Supabase project", () => {
    expect(isUploadedCategoryImage(uploaded, supabase)).toBe(true);
  });
  it("requires an actual picture before creating a category", () => {
    expect(isUploadedCategoryImage("", supabase)).toBe(false);
    expect(isUploadedCategoryImage(uploaded, undefined)).toBe(false);
  });
  it("rejects other tenants, other folders and malformed addresses", () => {
    expect(isUploadedCategoryImage(uploaded.replace("iubrvedvlqyewjwiszhw", "another-tenant"), supabase)).toBe(false);
    expect(isUploadedCategoryImage(uploaded.replace("/categories/", "/products/"), supabase)).toBe(false);
    expect(isUploadedCategoryImage("not a url", supabase)).toBe(false);
    expect(isUploadedCategoryImage("javascript:alert(1)", supabase)).toBe(false);
    expect(isUploadedCategoryImage(uploaded.replace(".png", ".svg"), supabase)).toBe(false);
  });
});
