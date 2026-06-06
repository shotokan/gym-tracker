export const uid = (): string => Math.random().toString(36).slice(2, 8);
export const toDay = (): string => new Date().toISOString().slice(0, 10);
export const fmtD = (d: string): string => {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
};
