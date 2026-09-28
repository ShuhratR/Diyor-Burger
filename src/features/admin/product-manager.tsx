// Shared data contracts for the visual product workspace.
// The previous technical ProductManager UI was intentionally removed.
export type AdminVariant = { id:string; name:string; nameTj?:string|null; priceDiram:number; oldPriceDiram?:number|null; sortOrder:number; isActive:boolean; isAvailable:boolean };
export type AdminProduct = { id:string; categoryId:string; name:string; nameTj?:string|null; description:string; descriptionTj?:string|null; slug:string; productType:"NORMAL"|"PIZZA"|"COMBO"; basePriceDiram?:number|null; oldPriceDiram?:number|null; promotionLabel?:string|null; imageUrl?:string|null; sortOrder:number; isAvailable:boolean; isActive:boolean; isPopular:boolean; variants?:AdminVariant[] };
export type AdminCategoryOption = { id:string; name:string };
