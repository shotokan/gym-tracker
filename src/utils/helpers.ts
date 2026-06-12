export const uid = (): string => Math.random().toString(36).slice(2, 8);
export const toDay = (): string => new Date().toISOString().slice(0, 10);
export const fmtD = (d: string): string => {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
};

// Formatear hora desde timestamp ISO a hora local (ej: "2026-06-10T23:22:29Z" -> "18:22" si UTC-5)
export const fmtTime = (timestamp: string): string => {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch {
    return "";
  }
};

// Formatear duración en segundos a formato legible (ej: 125 -> "2m 5s")
export const fmtDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};
