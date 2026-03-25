export function formatScore(value: number): string {
  return value.toFixed(1);
}

export function formatSigned(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(0)}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
