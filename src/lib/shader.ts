import * as THREE from "three";
import type { GradientRenderConfig, GradientType } from "../types";
import { clamp, hexToRgb01 } from "./color";

const gradientTypeIndex: Record<GradientType, number> = {
  linear: 0,
  radial: 1,
  angular: 2,
  diamond: 3,
  mesh: 4,
};

export const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const fragmentShader = `
precision highp float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform int uType;
uniform int uColorCount;
uniform vec3 uColors[3];
uniform float uStarts[3];
uniform float uEnds[3];
uniform float uIntensities[3];
uniform float uAngle;
uniform vec2 uCenter;
uniform float uSoftness;
uniform float uNoiseEnabled;
uniform float uNoiseAmount;
uniform float uNoiseScale;
uniform float uNoiseMono;
uniform float uNoiseAnimate;
uniform float uNoiseSpeed;
uniform float uTurbAmount;
uniform float uTurbSize;
uniform float uTurbComplexity;
uniform float uTurbSpeed;
uniform float uTurbDirection;
uniform float uTurbSeed;
uniform float uAnimSpeed;
uniform float uColorMotion;
uniform float uNoiseMotion;
uniform float uTurbMotion;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p, float octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(1.6, 1.2, -1.2, 1.6);

  for (int i = 0; i < 8; i++) {
    if (float(i) >= octaves) {
      break;
    }
    value += amplitude * noise2(p);
    p = rotate * p + 13.7;
    amplitude *= 0.5;
  }

  return value;
}

vec2 aspectUv(vec2 uv) {
  vec2 p = uv - 0.5;
  p.x *= uResolution.x / max(uResolution.y, 1.0);
  return p + 0.5;
}

vec2 turbulentDisplace(vec2 uv) {
  float amount = uTurbAmount / 100.0;
  if (amount <= 0.001) {
    return uv;
  }

  float evolution = uTime * uTurbSpeed * uTurbMotion;
  vec2 p = aspectUv(uv) * max(uTurbSize, 0.001) + vec2(uTurbSeed * 0.013, uTurbSeed * 0.021);
  float n1 = fbm(p + evolution, uTurbComplexity);
  float n2 = fbm(p * 1.17 + vec2(31.4, 14.2) - evolution * 0.8, uTurbComplexity);
  float direction = radians(uTurbDirection);
  vec2 directional = vec2(cos(direction), sin(direction)) * (n1 - 0.5);
  vec2 cellular = vec2(n1, n2) * 2.0 - 1.0;
  vec2 offset = mix(cellular, directional, 0.35) * amount * 0.24;
  return uv + offset;
}

float gradientPosition(vec2 uv) {
  vec2 center = uCenter;
  vec2 p = aspectUv(uv) - aspectUv(center);
  float angle = radians(uAngle);
  vec2 dir = vec2(cos(angle), sin(angle));
  float drift = uColorMotion * uAnimSpeed * uTime * 0.045;

  if (uType == 0) {
    return fract(dot(p, dir) + 0.5 + drift);
  }

  if (uType == 1) {
    return clamp(length(p) * 1.42 + drift, 0.0, 1.0);
  }

  if (uType == 2) {
    return fract((atan(p.y, p.x) / 6.28318530718) + 0.5 + drift);
  }

  return clamp((abs(p.x) + abs(p.y)) * 1.25 + drift, 0.0, 1.0);
}

float bandWeight(float t, float startValue, float endValue, float intensity) {
  float start = min(startValue, endValue) / 100.0;
  float end = max(startValue, endValue) / 100.0;
  float center = (start + end) * 0.5;
  float halfWidth = max((end - start) * 0.5, 0.015);
  float falloff = mix(0.015, 0.18, clamp(uSoftness / 100.0, 0.0, 1.0));
  float distanceToBand = abs(t - center);
  float base = 1.0 - smoothstep(halfWidth, halfWidth + falloff, distanceToBand);
  return max(base, 0.0001) * max(intensity, 0.0);
}

vec3 rampColor(float t) {
  float w0 = bandWeight(t, uStarts[0], uEnds[0], uIntensities[0]);
  float w1 = bandWeight(t, uStarts[1], uEnds[1], uIntensities[1]);
  float w2 = bandWeight(t, uStarts[2], uEnds[2], uIntensities[2]);

  if (uColorCount < 3) {
    w2 = 0.0;
  }
  if (uColorCount < 2) {
    w1 = 0.0;
  }

  float total = max(w0 + w1 + w2, 0.0001);
  vec3 color = (uColors[0] * w0 + uColors[1] * w1 + uColors[2] * w2) / total;
  return color;
}

vec3 meshColor(vec2 uv) {
  vec2 p = aspectUv(uv);
  float t = uTime * uAnimSpeed * uColorMotion;
  float field = fbm(p * 2.2 + vec2(t * 0.12, -t * 0.08), 4.0);
  vec2 warp = vec2(field - 0.5, fbm(p * 2.6 + 19.1 - t * 0.1, 4.0) - 0.5) * 0.22;
  p += warp;

  vec2 a0 = aspectUv(vec2(0.20 + 0.08 * sin(t * 0.63), 0.26 + 0.07 * cos(t * 0.51)));
  vec2 a1 = aspectUv(vec2(0.78 + 0.08 * sin(t * 0.45 + 1.2), 0.34 + 0.09 * cos(t * 0.39)));
  vec2 a2 = aspectUv(vec2(0.50 + 0.12 * sin(t * 0.31 + 2.4), 0.78 + 0.08 * cos(t * 0.58)));

  float w0 = uIntensities[0] / pow(distance(p, a0) + 0.16, 2.0);
  float w1 = uIntensities[1] / pow(distance(p, a1) + 0.16, 2.0);
  float w2 = uIntensities[2] / pow(distance(p, a2) + 0.16, 2.0);

  if (uColorCount < 3) {
    w2 = 0.0;
  }
  if (uColorCount < 2) {
    w1 = 0.0;
  }

  float total = max(w0 + w1 + w2, 0.0001);
  vec3 color = (uColors[0] * w0 + uColors[1] * w1 + uColors[2] * w2) / total;
  float shade = fbm(p * 4.0 + t * 0.08, 5.0);
  return color * (0.88 + shade * 0.22);
}

vec3 applyGrain(vec3 color, vec2 uv) {
  if (uNoiseEnabled < 0.5 || uNoiseAmount <= 0.001) {
    return color;
  }

  float timeSample = floor(uTime * max(uNoiseSpeed, 0.01) * 60.0 * uNoiseAnimate * uNoiseMotion);
  vec2 grainUv = gl_FragCoord.xy / max(uNoiseScale, 0.001);
  float amount = uNoiseAmount / 100.0;

  float mono = hash21(grainUv + timeSample);
  vec3 grain = vec3(
    hash21(grainUv + timeSample + 3.1),
    hash21(grainUv + timeSample + 7.7),
    hash21(grainUv + timeSample + 12.4)
  );
  grain = mix(grain, vec3(mono), uNoiseMono);
  return clamp(color + (grain - 0.5) * amount * 0.42, 0.0, 1.0);
}

void main() {
  vec2 uv = turbulentDisplace(vUv);
  vec3 color = uType == 4 ? meshColor(uv) : rampColor(gradientPosition(uv));
  color = applyGrain(color, uv);
  color = pow(color, vec3(0.95));
  gl_FragColor = vec4(color, 1.0);
}
`;

export const createGradientMaterial = (): THREE.ShaderMaterial =>
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uType: { value: 4 },
      uColorCount: { value: 3 },
      uColors: {
        value: [
          new THREE.Color("#0E1726"),
          new THREE.Color("#37B6A8"),
          new THREE.Color("#E15C7A"),
        ],
      },
      uStarts: { value: [0, 30, 68] },
      uEnds: { value: [35, 72, 100] },
      uIntensities: { value: [1.1, 1, 1.05] },
      uAngle: { value: 38 },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uSoftness: { value: 42 },
      uNoiseEnabled: { value: 1 },
      uNoiseAmount: { value: 12 },
      uNoiseScale: { value: 1.6 },
      uNoiseMono: { value: 1 },
      uNoiseAnimate: { value: 1 },
      uNoiseSpeed: { value: 1 },
      uTurbAmount: { value: 18 },
      uTurbSize: { value: 2.8 },
      uTurbComplexity: { value: 4 },
      uTurbSpeed: { value: 0.35 },
      uTurbDirection: { value: 35 },
      uTurbSeed: { value: 120 },
      uAnimSpeed: { value: 1 },
      uColorMotion: { value: 1 },
      uNoiseMotion: { value: 1 },
      uTurbMotion: { value: 1 },
    },
  });

export const updateGradientUniforms = (
  material: THREE.ShaderMaterial,
  config: GradientRenderConfig,
  elapsedTime: number,
  width: number,
  height: number,
): void => {
  const colors = config.colors.slice(0, 3);
  const fallback = colors[colors.length - 1] ?? {
    hex: "#000000",
    start: 0,
    end: 100,
    intensity: 1,
  };

  const colorUniforms = [0, 1, 2].map((index) => {
    const [r, g, b] = hexToRgb01(colors[index]?.hex ?? fallback.hex);
    return new THREE.Color(r, g, b);
  });

  material.uniforms.uResolution.value.set(width, height);
  material.uniforms.uTime.value = elapsedTime;
  material.uniforms.uType.value = gradientTypeIndex[config.gradient.type];
  material.uniforms.uColorCount.value = colors.length;
  material.uniforms.uColors.value = colorUniforms;
  material.uniforms.uStarts.value = [0, 1, 2].map(
    (index) => colors[index]?.start ?? fallback.start,
  );
  material.uniforms.uEnds.value = [0, 1, 2].map(
    (index) => colors[index]?.end ?? fallback.end,
  );
  material.uniforms.uIntensities.value = [0, 1, 2].map(
    (index) => colors[index]?.intensity ?? fallback.intensity,
  );
  material.uniforms.uAngle.value = config.gradient.angle;
  material.uniforms.uCenter.value.set(config.gradient.centerX, config.gradient.centerY);
  material.uniforms.uSoftness.value = config.gradient.softness;
  material.uniforms.uNoiseEnabled.value = config.noise.enabled ? 1 : 0;
  material.uniforms.uNoiseAmount.value = config.noise.amount;
  material.uniforms.uNoiseScale.value = config.noise.scale;
  material.uniforms.uNoiseMono.value = config.noise.monochrome ? 1 : 0;
  material.uniforms.uNoiseAnimate.value = config.noise.animate ? 1 : 0;
  material.uniforms.uNoiseSpeed.value = config.noise.speed;
  material.uniforms.uTurbAmount.value = config.turbulence.amount;
  material.uniforms.uTurbSize.value = config.turbulence.size;
  material.uniforms.uTurbComplexity.value = clamp(config.turbulence.complexity, 1, 8);
  material.uniforms.uTurbSpeed.value = config.turbulence.evolutionSpeed;
  material.uniforms.uTurbDirection.value = config.turbulence.direction;
  material.uniforms.uTurbSeed.value = config.turbulence.seed;
  material.uniforms.uAnimSpeed.value = config.animation.speed;
  material.uniforms.uColorMotion.value = config.animation.colorMotion ? 1 : 0;
  material.uniforms.uNoiseMotion.value = config.animation.noiseMotion ? 1 : 0;
  material.uniforms.uTurbMotion.value = config.animation.turbulentEvolution ? 1 : 0;
};
