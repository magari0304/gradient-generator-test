export type GradientType = "linear" | "radial" | "angular" | "diamond" | "mesh";

export interface ColorStop {
  id: string;
  hex: string;
  start: number;
  end: number;
  intensity: number;
}

export interface GradientSettings {
  type: GradientType;
  angle: number;
  centerX: number;
  centerY: number;
  softness: number;
}

export interface NoiseSettings {
  enabled: boolean;
  amount: number;
  scale: number;
  monochrome: boolean;
  animate: boolean;
  speed: number;
}

export interface TurbulenceSettings {
  amount: number;
  size: number;
  complexity: number;
  evolutionSpeed: number;
  direction: number;
  seed: number;
}

export interface AnimationSettings {
  playing: boolean;
  loop: boolean;
  speed: number;
  colorMotion: boolean;
  noiseMotion: boolean;
  turbulentEvolution: boolean;
}

export interface CanvasSettings {
  width: number;
  height: number;
  zoom: number;
  checker: boolean;
}

export interface ExportSettings {
  fps: 24 | 30 | 60;
  duration: number;
  quality: number;
}

export interface PresetPayload {
  name: string;
  createdAt: string;
  colors: ColorStop[];
  gradient: GradientSettings;
  noise: NoiseSettings;
  turbulence: TurbulenceSettings;
  animation: AnimationSettings;
  canvas: Pick<CanvasSettings, "width" | "height">;
  exportSettings: ExportSettings;
}

export interface GradientRenderConfig {
  colors: ColorStop[];
  gradient: GradientSettings;
  noise: NoiseSettings;
  turbulence: TurbulenceSettings;
  animation: AnimationSettings;
  canvas: CanvasSettings;
}
