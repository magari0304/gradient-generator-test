export const isHexColor = (value: string): boolean =>
  /^#?([0-9a-fA-F]{6})$/.test(value.trim());

export const normalizeHex = (value: string): string => {
  const clean = value.trim().replace("#", "");
  return `#${clean.padEnd(6, "0").slice(0, 6)}`.toUpperCase();
};

export const hexToRgb01 = (hex: string): [number, number, number] => {
  const normalized = normalizeHex(hex).replace("#", "");
  const numberValue = Number.parseInt(normalized, 16);
  return [
    ((numberValue >> 16) & 255) / 255,
    ((numberValue >> 8) & 255) / 255,
    (numberValue & 255) / 255,
  ];
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const makeId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
