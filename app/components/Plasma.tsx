"use client";

import React, { useLayoutEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

type PlasmaQuality = "auto" | "high" | "low";

interface PlasmaProps {
  color?: string;
  speed?: number;
  direction?: "forward" | "reverse" | "pingpong";
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
  /** auto: 좁은 화면·절전 모드에서 DPR·셰이더 반복·FPS를 줄임 (모바일 버벅임 완화) */
  quality?: PlasmaQuality;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
uniform float uLoopMax;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;

  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);

  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < uLoopMax; O += o.w / d * o.xyz) {
    p = z * normalize(vec3(C - .5 * r, r.y));
    p.z -= 4.;
    S = p;
    d = p.y - T;

    p.x += .4 * (1. + p.y) * sin(d + p.x * 0.1) * cos(.34 * d + p.x * 0.05);
    Q = p.xz *= mat2(cos(p.y + vec4(0, 11, 33, 0) - T));
    z += d = abs(sqrt(length(Q * Q)) - .25 * (5. + S.y)) / 3. + 8e-4;
    o = 1. + sin(S.y + p.z * .5 + S.z - length(S - p) + vec4(2, 1, 0, 8));
  }

  o.xyz = tanh(O / 1e4);
}

bool finite1(float x) { return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c) {
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);

  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));

  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}
`;

export const Plasma: React.FC<PlasmaProps> = ({
  color = "#ffffff",
  speed = 1,
  direction = "forward",
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
  quality = "auto",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  // useLayoutEffect: 클라이언트 전환 직후 레이아웃 직전에 캔버스 크기 잡기 (뒤로가기 시 빈 화면)
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const shortSide =
      typeof window !== "undefined"
        ? Math.min(window.innerWidth, window.innerHeight)
        : 1024;
    const narrow = shortSide < 768;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lowPower = false;
    if (quality === "low") lowPower = true;
    else if (quality === "high") lowPower = false;
    else lowPower = narrow || reduceMotion;

    const dprCap = lowPower ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const loopMax = lowPower ? 32 : 60;
    const minFrameMs = lowPower ? 1000 / 60 : 0;
    const useMouse =
      mouseInteractive && !lowPower && !("ontouchstart" in window);

    const useCustomColor = color ? 1.0 : 0.0;
    const customColorRgb = color ? hexToRgb(color) : [1, 1, 1];
    const directionMultiplier = direction === "reverse" ? -1.0 : 1.0;

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: dprCap,
    });
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    containerRef.current.appendChild(canvas);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: useCustomColor },
        uSpeed: { value: speed * 0.4 },
        uDirection: { value: directionMultiplier },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: useMouse ? 1.0 : 0.0 },
        uLoopMax: { value: loopMax },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const handleMouseMove = (e: MouseEvent) => {
      if (!useMouse) return;
      const rect = containerRef.current!.getBoundingClientRect();
      mousePos.current.x = e.clientX - rect.left;
      mousePos.current.y = e.clientY - rect.top;
      const mouseUniform = program.uniforms.uMouse.value as Float32Array;
      mouseUniform[0] = mousePos.current.x;
      mouseUniform[1] = mousePos.current.y;
    };

    if (useMouse) {
      containerRef.current.addEventListener("mousemove", handleMouseMove);
    }

    const setSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // 뒤로가기 등으로 레이아웃이 아직 그려지지 않았을 때 fallback
      const width = Math.max(1, Math.floor(rect.width || window.innerWidth));
      const height = Math.max(1, Math.floor(rect.height || window.innerHeight));
      renderer.setSize(width, height);
      const res = program.uniforms.iResolution.value as Float32Array;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(containerRef.current);

    const onWinResize = () => setSize();
    window.addEventListener("resize", onWinResize);

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setSize();
      setTimeout(setSize, 0);
    };
    window.addEventListener("pageshow", onPageShow);

    const onVisibility = () => {
      if (document.visibilityState === "visible") setSize();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // 초기·SPA 복귀 후 레이아웃이 늦게 잡히는 경우 대비
    setSize();
    const timeout0 = setTimeout(setSize, 0);
    const timeout50 = setTimeout(setSize, 50);
    const timeout200 = setTimeout(setSize, 200);
    const raf1 = requestAnimationFrame(() => {
      setSize();
      requestAnimationFrame(setSize);
    });

    let raf = 0;
    const timeStart = performance.now();
    let lastRender = 0;

    const loop = (t: number) => {
      if (minFrameMs > 0 && lastRender > 0 && t - lastRender < minFrameMs) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastRender = t;

      const timeValue = (t - timeStart) * 0.001;

      if (direction === "pingpong") {
        const pingpongDuration = 10;
        const segmentTime = timeValue % pingpongDuration;
        const isForward = Math.floor(timeValue / pingpongDuration) % 2 === 0;
        const u = segmentTime / pingpongDuration;
        const smooth = u * u * (3 - 2 * u);
        const pingpongTime = isForward
          ? smooth * pingpongDuration
          : (1 - smooth) * pingpongDuration;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (program.uniforms.uDirection as any).value = 1.0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (program.uniforms.iTime as any).value = pingpongTime;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (program.uniforms.iTime as any).value = timeValue;
      }

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      clearTimeout(timeout0);
      clearTimeout(timeout50);
      clearTimeout(timeout200);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onWinResize);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      if (useMouse && containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove);
      }
      try {
        containerRef.current?.removeChild(canvas);
      } catch {
        // 이미 제거된 경우 무시
      }
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive, quality]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
    />
  );
};

export default Plasma;
