import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AnimationSettings,
  CanvasSettings,
  ColorStop,
  ExportSettings,
  GradientRenderConfig,
  GradientSettings,
  GradientType,
  NoiseSettings,
  PresetPayload,
  TurbulenceSettings,
} from "../types";
import { clamp, isHexColor, makeId, normalizeHex } from "../lib/color";

interface GradientStore extends GradientRenderConfig {
  exportSettings: ExportSettings;
  savedPresets: PresetPayload[];
  setColorHex: (id: string, hex: string) => void;
  setColorRange: (id: string, key: "start" | "end" | "intensity", value: number) => void;
  addColor: () => void;
  removeColor: (id: string) => void;
  reorderColor: (fromIndex: number, toIndex: number) => void;
  setGradient: <K extends keyof GradientSettings>(key: K, value: GradientSettings[K]) => void;
  setNoise: <K extends keyof NoiseSettings>(key: K, value: NoiseSettings[K]) => void;
  setTurbulence: <K extends keyof TurbulenceSettings>(
    key: K,
    value: TurbulenceSettings[K],
  ) => void;
  setAnimation: <K extends keyof AnimationSettings>(key: K, value: AnimationSettings[K]) => void;
  setCanvas: <K extends keyof CanvasSettings>(key: K, value: CanvasSettings[K]) => void;
  setCanvasSize: (width: number, height: number) => void;
  setExport: <K extends keyof ExportSettings>(key: K, value: ExportSettings[K]) => void;
  savePreset: (preset: PresetPayload) => void;
  removePreset: (createdAt: string) => void;
  applyPreset: (preset: PresetPayload) => void;
}

const defaultColors: ColorStop[] = [
  { id: "color-1", hex: "#101826", start: 0, end: 36, intensity: 1.12 },
  { id: "color-2", hex: "#42C4B8", start: 24, end: 76, intensity: 1 },
  { id: "color-3", hex: "#E15C7A", start: 64, end: 100, intensity: 1.08 },
];

const defaultGradient: GradientSettings = {
  type: "mesh",
  angle: 38,
  centerX: 0.5,
  centerY: 0.5,
  softness: 48,
};

const defaultNoise: NoiseSettings = {
  enabled: true,
  amount: 11,
  scale: 1.55,
  monochrome: true,
  animate: true,
  speed: 0.85,
};

const defaultTurbulence: TurbulenceSettings = {
  amount: 18,
  size: 2.8,
  complexity: 4,
  evolutionSpeed: 0.35,
  direction: 35,
  seed: 120,
};

const defaultAnimation: AnimationSettings = {
  playing: true,
  loop: true,
  speed: 1,
  colorMotion: true,
  noiseMotion: true,
  turbulentEvolution: true,
};

const defaultCanvas: CanvasSettings = {
  width: 1920,
  height: 1080,
  zoom: 0.72,
  checker: false,
};

const defaultExport: ExportSettings = {
  fps: 30,
  duration: 4,
  quality: 82,
};

const nextColor = (count: number): ColorStop => {
  const palette = ["#F2B84B", "#7C6CF2", "#F4F0E8"];
  const spans: Array<[number, number]> = [
    [0, 38],
    [32, 72],
    [68, 100],
  ];
  const [start, end] = spans[count] ?? [0, 100];
  return {
    id: makeId(),
    hex: palette[count % palette.length],
    start,
    end,
    intensity: 1,
  };
};

export const canvasPresets = [
  { label: "1920 x 1080", width: 1920, height: 1080 },
  { label: "1080 x 1920", width: 1080, height: 1920 },
  { label: "1080 x 1080", width: 1080, height: 1080 },
  { label: "3840 x 2160", width: 3840, height: 2160 },
];

export const gradientTypeLabels: Array<{ value: GradientType; label: string }> = [
  { value: "linear", label: "Linear" },
  { value: "radial", label: "Radial" },
  { value: "angular", label: "Angular" },
  { value: "diamond", label: "Diamond" },
  { value: "mesh", label: "Mesh" },
];

export const useGradientStore = create<GradientStore>()(
  persist(
    (set) => ({
      colors: defaultColors,
      gradient: defaultGradient,
      noise: defaultNoise,
      turbulence: defaultTurbulence,
      animation: defaultAnimation,
      canvas: defaultCanvas,
      exportSettings: defaultExport,
      savedPresets: [],
      setColorHex: (id, hex) =>
        set((state) => ({
          colors: state.colors.map((color) =>
            color.id === id && isHexColor(hex)
              ? { ...color, hex: normalizeHex(hex) }
              : color.id === id
                ? { ...color, hex }
                : color,
          ),
        })),
      setColorRange: (id, key, value) =>
        set((state) => ({
          colors: state.colors.map((color) => {
            if (color.id !== id) {
              return color;
            }
            if (key === "intensity") {
              return { ...color, intensity: clamp(value, 0, 2) };
            }
            return { ...color, [key]: clamp(value, 0, 100) };
          }),
        })),
      addColor: () =>
        set((state) => {
          if (state.colors.length >= 3) {
            return state;
          }
          return { colors: [...state.colors, nextColor(state.colors.length)] };
        }),
      removeColor: (id) =>
        set((state) => {
          if (state.colors.length <= 1) {
            return state;
          }
          return { colors: state.colors.filter((color) => color.id !== id) };
        }),
      reorderColor: (fromIndex, toIndex) =>
        set((state) => {
          const colors = [...state.colors];
          const [moved] = colors.splice(fromIndex, 1);
          colors.splice(toIndex, 0, moved);
          return { colors };
        }),
      setGradient: (key, value) =>
        set((state) => ({
          gradient: {
            ...state.gradient,
            [key]: value,
          },
        })),
      setNoise: (key, value) =>
        set((state) => ({
          noise: {
            ...state.noise,
            [key]: value,
          },
        })),
      setTurbulence: (key, value) =>
        set((state) => ({
          turbulence: {
            ...state.turbulence,
            [key]: value,
          },
        })),
      setAnimation: (key, value) =>
        set((state) => ({
          animation: {
            ...state.animation,
            [key]: value,
          },
        })),
      setCanvas: (key, value) =>
        set((state) => ({
          canvas: {
            ...state.canvas,
            [key]: value,
          },
        })),
      setCanvasSize: (width, height) =>
        set((state) => ({
          canvas: {
            ...state.canvas,
            width: clamp(Math.round(width), 64, 7680),
            height: clamp(Math.round(height), 64, 7680),
          },
        })),
      setExport: (key, value) =>
        set((state) => ({
          exportSettings: {
            ...state.exportSettings,
            [key]: value,
          },
        })),
      savePreset: (preset) =>
        set((state) => ({
          savedPresets: [preset, ...state.savedPresets].slice(0, 16),
        })),
      removePreset: (createdAt) =>
        set((state) => ({
          savedPresets: state.savedPresets.filter((preset) => preset.createdAt !== createdAt),
        })),
      applyPreset: (preset) =>
        set((state) => ({
          colors: preset.colors,
          gradient: preset.gradient,
          noise: preset.noise,
          turbulence: preset.turbulence,
          animation: preset.animation,
          canvas: {
            ...state.canvas,
            width: preset.canvas.width,
            height: preset.canvas.height,
          },
          exportSettings: preset.exportSettings,
        })),
    }),
    {
      name: "gradient-motion-studio",
      partialize: (state) => ({
        colors: state.colors,
        gradient: state.gradient,
        noise: state.noise,
        turbulence: state.turbulence,
        animation: state.animation,
        canvas: state.canvas,
        exportSettings: state.exportSettings,
        savedPresets: state.savedPresets,
      }),
    },
  ),
);

export const selectRenderConfig = (state: GradientStore): GradientRenderConfig => ({
  colors: state.colors,
  gradient: state.gradient,
  noise: state.noise,
  turbulence: state.turbulence,
  animation: state.animation,
  canvas: state.canvas,
});
