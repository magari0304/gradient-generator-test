import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import coreURL from "@ffmpeg/core?url";
import wasmURL from "@ffmpeg/core/wasm?url";
import type { ExportSettings, GradientRenderConfig } from "../types";
import { clamp } from "./color";
import { GradientFrameRenderer } from "./renderFrame";

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;

const getFfmpeg = async (onLog?: (message: string) => void): Promise<FFmpeg> => {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
  }

  if (!ffmpegLoaded) {
    ffmpeg.on("log", ({ message }) => {
      onLog?.(message);
    });
    await ffmpeg.load({
      coreURL,
      wasmURL,
    });
    ffmpegLoaded = true;
  }

  return ffmpeg;
};

const crfFromQuality = (quality: number): string => {
  const clamped = clamp(quality, 1, 100);
  return String(Math.round(36 - clamped * 0.26));
};

const padFrame = (index: number): string => String(index).padStart(6, "0");

export interface VideoExportProgress {
  phase: "loading" | "frames" | "encoding" | "done";
  progress: number;
  message: string;
}

export const exportMp4 = async (
  config: GradientRenderConfig,
  settings: ExportSettings,
  onProgress: (progress: VideoExportProgress) => void,
): Promise<Blob> => {
  onProgress({ phase: "loading", progress: 0, message: "Loading FFmpeg" });
  const instance = await getFfmpeg();
  const totalFrames = Math.max(1, Math.round(settings.fps * settings.duration));
  const renderer = new GradientFrameRenderer(config.canvas.width, config.canvas.height);

  try {
    for (let frame = 0; frame < totalFrames; frame += 1) {
      const fileName = `frame_${padFrame(frame)}.png`;
      const time = (frame / settings.fps) * config.animation.speed;
      const blob = await renderer.renderToBlob(config, time, "image/png");
      await instance.writeFile(fileName, await fetchFile(blob));
      onProgress({
        phase: "frames",
        progress: (frame + 1) / totalFrames,
        message: `Generating ${frame + 1} / ${totalFrames}`,
      });
    }

    instance.on("progress", ({ progress }) => {
      onProgress({
        phase: "encoding",
        progress,
        message: `Encoding ${Math.round(progress * 100)}%`,
      });
    });

    await instance.exec([
      "-framerate",
      String(settings.fps),
      "-i",
      "frame_%06d.png",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "medium",
      "-crf",
      crfFromQuality(settings.quality),
      "-movflags",
      "faststart",
      "output.mp4",
    ]);

    const data = await instance.readFile("output.mp4");
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);

    for (let frame = 0; frame < totalFrames; frame += 1) {
      await instance.deleteFile(`frame_${padFrame(frame)}.png`).catch(() => undefined);
    }
    await instance.deleteFile("output.mp4").catch(() => undefined);

    onProgress({ phase: "done", progress: 1, message: "Done" });
    return new Blob([buffer], { type: "video/mp4" });
  } finally {
    renderer.dispose();
  }
};
