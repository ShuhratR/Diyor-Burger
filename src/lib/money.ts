export const DIRAM_PER_SOMONI = 100;
export function formatSomoni(diram: number): string { return `${new Intl.NumberFormat("ru-RU", { minimumFractionDigits: diram % DIRAM_PER_SOMONI === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(diram / DIRAM_PER_SOMONI)} сом`; }
export function somoniToDiram(value: unknown): number | null { const normalized=String(value??"").trim().replace(",", "."); if(!/^\d+(?:\.\d{1,2})?$/.test(normalized))return null; const [whole,fraction=""]=normalized.split("."); const diram=Number(whole)*DIRAM_PER_SOMONI+Number(fraction.padEnd(2,"0")); return Number.isSafeInteger(diram)?diram:null; }

/** Blank means no old price. A provided old price must be valid and above the selling price. */
export function parseOptionalOldPriceDiram(value: unknown, sellingPriceDiram: number | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const oldPrice = somoniToDiram(raw);
  if (oldPrice === null || sellingPriceDiram === null || oldPrice <= sellingPriceDiram) {
    throw new Error("INVALID_OLD_PRICE");
  }
  return oldPrice;
}
