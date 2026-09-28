export const RESTAURANT_MEDIA_BUCKET="restaurant-media";export const RESTAURANT_MEDIA_PREFIXES=["products","categories","combos","banners","settings"] as const;export type RestaurantMediaPrefix=typeof RESTAURANT_MEDIA_PREFIXES[number];export const MAX_RESTAURANT_IMAGE_BYTES=5*1024*1024;const mimeExtension:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
export function validateRestaurantImage(file:{type:string;size:number}){if(!(file.type in mimeExtension))return "Поддерживаются JPEG, PNG и WebP.";if(!Number.isFinite(file.size)||file.size<=0||file.size>MAX_RESTAURANT_IMAGE_BYTES)return "Максимальный размер изображения — 5 МБ.";return null}
export function restaurantMediaPath(prefix:RestaurantMediaPrefix,mimeType:string,token:string){if(!RESTAURANT_MEDIA_PREFIXES.includes(prefix))throw new Error("INVALID_MEDIA_PREFIX");const extension=mimeExtension[mimeType];if(!extension||!/^[a-z0-9-]{8,80}$/i.test(token))throw new Error("INVALID_MEDIA_PATH");return `${prefix}/${token}.${extension}`}


// Expose the Storage response to an authorized admin instead of hiding all failures
// behind the same generic message. Never include keys or session tokens.
export function describeRestaurantImageUploadError(error: {
  message?: string;
  statusCode?: string | number;
  code?: string;
}) {
  const code = String(error.statusCode ?? error.code ?? "").trim();
  const reason = (error.message || "Неизвестная ошибка загрузки").slice(0, 240);
  return `Ошибка Storage${code ? ` (${code})` : ""}: ${reason}`;
}
