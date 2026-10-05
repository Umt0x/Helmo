export type TrafficPoint = { date: string; label: string; joins: number; leaves: number };

// Small deterministic PRNG so server and client render identical mock data.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildTraffic(days: number, seed: number, months: string[]): TrafficPoint[] {
  const rand = mulberry32(seed);
  const end = new Date(Date.UTC(2026, 5, 30));
  const points: TrafficPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 86_400_000);
    const wave = Math.sin((days - i) / 2.4) * 0.5 + 0.5;
    const joins = Math.round(40 + wave * 90 + rand() * 25);
    const leaves = Math.round(joins * (0.3 + rand() * 0.15));
    points.push({
      date: d.toISOString().slice(0, 10),
      label: `${d.getUTCDate()} ${months[d.getUTCMonth()]}`,
      joins,
      leaves,
    });
  }
  return points;
}

export type ResourcePoint = { label: string; cpu: number; ram: number };

export function buildResources(hours: number, seed: number): ResourcePoint[] {
  const rand = mulberry32(seed);
  return Array.from({ length: hours }, (_, i) => ({
    label: `${String(i % 24).padStart(2, "0")}:00`,
    cpu: Math.round(12 + (Math.sin(i / 3) * 0.5 + 0.5) * 22 + rand() * 8),
    ram: Math.round(38 + (Math.sin(i / 7) * 0.5 + 0.5) * 12 + rand() * 4),
  }));
}
