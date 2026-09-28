export type OrderableVariant = { isActive: boolean; isAvailable: boolean };

/** Only archiving the actual last orderable variant must be blocked. */
export function blocksLastOrderableVariantArchive(
  target: OrderableVariant,
  countOfOrderableVariants: number,
): boolean {
  return target.isActive && target.isAvailable && countOfOrderableVariants <= 1;
}
