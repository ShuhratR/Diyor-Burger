import type { CSSProperties } from "react";

export const diyorIconNames = [
  "arrow-left", "arrow-right", "cart", "category-burger", "category-combo", "category-fries",
  "category-hotdog", "category-other", "category-pizza", "category-roll", "category-drink", "check", "check-circle",
  "chef-hat", "chevron-down", "chevron-right", "clock", "close-x", "crown", "discount-badge",
  "document", "external-link", "filter-sliders", "gift", "hash", "headset", "heart-filled",
  "heart-outline", "info-circle", "instagram", "leaf", "location-pin", "map-fold", "menu-hamburger",
  "message-square", "minus", "navigation", "phone", "plus", "radio-off", "radio-on", "scooter",
  "search", "shield-check", "spark-rays", "storefront", "trash", "truck", "user", "utensils", "whatsapp",
] as const;

export type DiyorIconName = (typeof diyorIconNames)[number];

const referenceCategoryIcons: Partial<Record<DiyorIconName, string>> = {
  search: "/assets/icons/ref-search.svg",
  "filter-sliders": "/assets/icons/ref-filter.svg",
  cart: "/assets/icons/ref-cart.svg",
  "close-x": "/assets/icons/ref-close.svg",
  phone: "/assets/icons/ref-phone.svg",
  "location-pin": "/assets/icons/ref-location.svg",
  whatsapp: "/assets/icons/ref-whatsapp.svg",
  clock: "/assets/icons/ref-clock.svg",
  minus: "/assets/icons/ref-minus.svg",
  plus: "/assets/icons/ref-plus.svg",
  trash: "/assets/icons/ref-trash.svg",
  "category-burger": "/assets/icons/ref-category-burger.svg",
  "category-hotdog": "/assets/icons/ref-category-hotdog.svg",
  "category-roll": "/assets/icons/ref-category-roll.svg",
  "category-pizza": "/assets/icons/ref-category-pizza.svg",
  "category-fries": "/assets/icons/ref-category-fries.svg",
  "category-drink": "/assets/icons/ref-category-drink.svg",
  "category-combo": "/assets/icons/ref-category-combo.svg",
};

const fileName: Record<DiyorIconName, string> = Object.fromEntries(
  diyorIconNames.map((name) => [name, referenceCategoryIcons[name] ?? `/assets/icons/${name} (1).svg`]),
) as Record<DiyorIconName, string>;

export function DiyorIcon({ name, label, className = "" }: { name: DiyorIconName; label?: string; className?: string }) {
  const style = { "--diyor-icon-mask": `url("${fileName[name]}")` } as CSSProperties;
  return <span aria-hidden={label ? undefined : true} aria-label={label} className={`diyor-icon ${className}`} style={style} />;
}
