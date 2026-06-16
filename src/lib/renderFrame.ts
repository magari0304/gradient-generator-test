import * as THREE from "three";
import type { GradientRenderConfig } from "../types";
import { createGradientMaterial, updateGradientUniforms } from "./shader";

export class GradientFrameRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private canvas: HTMLCanvasElement;

  constructor(width: number, height: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(width, height, false);
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.material = createGradientMaterial();
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.scene.add(this.mesh);
  }

  setSize(width: number, height: number): void {
    if (this.canvas.width === width && this.canvas.height === height) {
      return;
    }
    this.canvas.width = width;
    this.canvas.height = height;
    this.renderer.setSize(width, height, false);
  }

  render(config: GradientRenderConfig, time: number): HTMLCanvasElement {
    updateGradientUniforms(
      this.material,
      config,
      time,
      this.canvas.width,
      this.canvas.height,
    );
    this.renderer.render(this.scene, this.camera);
    return this.canvas;
  }

  async renderToBlob(
    config: GradientRenderConfig,
    time: number,
    mimeType: "image/png" | "image/jpeg",
    quality = 0.92,
  ): Promise<Blob> {
    this.render(config, time);
    const blob = await new Promise<Blob | null>((resolve) => {
      this.canvas.toBlob(resolve, mimeType, quality);
    });
    if (!blob) {
      throw new Error("Canvas export failed.");
    }
    return blob;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}

export const renderStill = async (
  config: GradientRenderConfig,
  time: number,
  mimeType: "image/png" | "image/jpeg",
  quality = 0.92,
): Promise<Blob> => {
  const renderer = new GradientFrameRenderer(config.canvas.width, config.canvas.height);
  try {
    return await renderer.renderToBlob(config, time, mimeType, quality);
  } finally {
    renderer.dispose();
  }
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
