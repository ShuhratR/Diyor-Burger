import { describe,expect,it } from "vitest";import { restaurantMediaPath,validateRestaurantImage,describeRestaurantImageUploadError } from "./restaurant-media";
describe("restaurant media",()=>{it("accepts only approved image inputs",()=>{expect(validateRestaurantImage({type:"image/webp",size:5*1024*1024})).toBeNull();expect(validateRestaurantImage({type:"image/gif",size:1})).toMatch(/JPEG/);expect(validateRestaurantImage({type:"image/png",size:5*1024*1024+1})).toMatch(/5 МБ/)});it("creates unique safe prefix paths",()=>expect(restaurantMediaPath("products","image/jpeg","a1b2c3d4")).toBe("products/a1b2c3d4.jpg"))})

describe("storage upload feedback",()=>{
  it("shows the Storage status and reason",()=>expect(describeRestaurantImageUploadError({statusCode:"403",message:"new row violates row-level security policy"})).toContain("403"));
  it("keeps a useful message when status is missing",()=>expect(describeRestaurantImageUploadError({message:"Bucket not found"})).toContain("Bucket not found"));
});
