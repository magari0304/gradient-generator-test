import type { GradientRenderConfig, PresetPayload } from "../types";

export const createPresetPayload = (
  name: string,
  config: GradientRenderConfig,
  exportSettings: PresetPayload["exportSettings"],
): PresetPayload => ({
  name,
  createdAt: new Date().toISOString(),
  colors: config.colors,
  gradient: config.gradient,
  noise: config.noise,
  turbulence: config.turbulence,
  animation: config.animation,
  canvas: {
    width: config.canvas.width,
    height: config.canvas.height,
  },
  exportSettings,
});

export const downloadJson = (payload: PresetPayload): void => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${payload.name.replace(/\s+/g, "-").toLowerCase()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const readPresetFile = async (file: File): Promise<PresetPayload> => {
  const text = await file.text();
  const parsed = JSON.parse(text) as PresetPayload;
  if (!Array.isArray(parsed.colors) || !parsed.gradient || !parsed.noise) {
    throw new Error("Preset file is missing required gradient data.");
  }
  return parsed;
};
