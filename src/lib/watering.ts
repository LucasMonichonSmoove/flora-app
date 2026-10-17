export function getDaysSinceWatering(
  lastWatered: string | null,
  now = new Date(),
): number | null {
  if (!lastWatered) return null;
  const timestamp = new Date(lastWatered).getTime();
  if (!Number.isFinite(timestamp)) return null;
  const elapsed = now.getTime() - timestamp;
  return elapsed < 0 ? 0 : Math.floor(elapsed / 86_400_000);
}
