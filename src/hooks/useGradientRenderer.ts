import type { MutableRefObject } from "react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createGradientMaterial, updateGradientUniforms } from "../lib/shader";
import { selectRenderConfig, useGradientStore } from "../store/gradientStore";

export const useGradientRenderer = (externalTimeRef?: MutableRefObject<number>) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fps, setFps] = useState(0);
  const elapsedRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = createGradientMaterial();
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    let animationFrame = 0;
    let lastTime = performance.now();
    let lastDrawTime = 0;
    let dirty = true;
    let fpsFrames = 0;
    let fpsLast = performance.now();

    const unsubscribe = useGradientStore.subscribe(() => {
      dirty = true;
    });

    const resize = () => {
      const width = Math.max(2, canvas.clientWidth);
      const height = Math.max(2, canvas.clientHeight);
      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      const targetWidth = Math.floor(width * pixelRatio);
      const targetHeight = Math.floor(height * pixelRatio);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);
        dirty = true;
      }
    };

    const draw = (now: number) => {
      if (now - lastDrawTime < 1000 / 60) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }
      lastDrawTime = now;
      const delta = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const state = useGradientStore.getState();
      const config = selectRenderConfig(state);

      if (state.animation.playing) {
        elapsedRef.current += delta;
        if (state.animation.loop && elapsedRef.current > 3600) {
          elapsedRef.current = 0;
        }
        dirty = true;
      }
      if (externalTimeRef) {
        externalTimeRef.current = elapsedRef.current;
      }

      resize();

      if (dirty) {
        updateGradientUniforms(material, config, elapsedRef.current, canvas.width, canvas.height);
        renderer.render(scene, camera);
        dirty = false;
        fpsFrames += 1;
      }

      if (now - fpsLast >= 500) {
        const measured = Math.round((fpsFrames * 1000) / (now - fpsLast));
        setFps(measured);
        fpsFrames = 0;
        fpsLast = now;
      }

      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      unsubscribe();
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return { canvasRef, fps, elapsedRef };
};
