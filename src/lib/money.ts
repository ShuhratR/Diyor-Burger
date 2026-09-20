export const DIRAM_PER_SOMONI = 100;
export function formatSomoni(diram: number): string { return `${new Intl.NumberFormat("ru-RU", { minimumFractionDigits: diram % DIRAM_PER_SOMONI === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(diram / DIRAM_PER_SOMONI)} сом`; }
