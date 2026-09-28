/** An inline-created category needs a real uploaded image from this project's Storage. */
export function isUploadedCategoryImage(url: string, supabaseUrl: string | undefined): boolean {
  if (!url || !supabaseUrl) return false;
  try {
    const image = new URL(url);
    const project = new URL(supabaseUrl);
    return image.protocol === "https:" &&
      image.origin === project.origin &&
      /^\/storage\/v1\/object\/public\/restaurant-media\/categories\/[a-z0-9-]+\.(?:png|jpg|webp)$/i
        .test(image.pathname);
  } catch {
    return false;
  }
}
