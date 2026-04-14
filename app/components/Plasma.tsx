"use client";

import { useEffect, useRef } from "react";

interface PlasmaProps {
  color?: string;
  speed?: number;
  direction?: "forward" | "backward";
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255]
    : [0.788, 0.663, 0.431];
}

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
  precision mediump float;
  uniform float u_time;
  uniform vec2  u_res;
  uniform vec3  u_color;
  uniform float u_scale;
  uniform vec2  u_mouse;
  uniform float u_interactive;

  void main() {
    vec2 uv = (gl_FragCoord.xy / u_res) * 2.0 - 1.0;
    uv.x *= u_res.x / u_res.y;
    uv *= u_scale;

    float t = u_time;

    float w1 = sin(uv.x * 2.5 + t * 0.8 + sin(uv.y * 1.8 + t * 0.4) * 2.0);
    float w2 = sin(uv.y * 2.0 - t * 0.6 + sin(uv.x * 2.0 - t * 0.3) * 1.8);
    float w3 = sin((uv.x * 1.5 + uv.y * 1.2) + t * 0.5);
    float r  = length(uv * 0.8 + vec2(sin(t * 0.3) * 0.4, cos(t * 0.25) * 0.3));
    float w4 = sin(r * 4.5 - t * 0.9);

    float plasma = (w1 + w2 + w3 + w4) * 0.25;

    if (u_interactive > 0.5) {
      vec2 m = u_mouse * 2.0 - 1.0;
      m.x *= u_res.x / u_res.y;
      m *= u_scale;
      float d = length(uv - m);
      plasma += sin(d * 7.0 - t * 2.0) * 0.22 * smoothstep(1.0, 0.0, d);
    }

    plasma = plasma * 0.5 + 0.5;

    vec3 base      = vec3(0.043, 0.035, 0.024);
    float intensity = pow(max(plasma - 0.32, 0.0) / 0.68, 2.0) * 0.6;
    vec3 col       = base + u_color * intensity;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function buildProgram(gl: WebGLRenderingContext) {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  return prog;
}

export default function Plasma({
  color = "#c9a96e",
  speed = 0.6,
  direction = "forward",
  scale = 1.0,
  opacity = 0.8,
  mouseInteractive = false,
}: PlasmaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const prog = buildProgram(gl);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime  = gl.getUniformLocation(prog, "u_time");
    const uRes   = gl.getUniformLocation(prog, "u_res");
    const uColor = gl.getUniformLocation(prog, "u_color");
    const uScale = gl.getUniformLocation(prog, "u_scale");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uInter = gl.getUniformLocation(prog, "u_interactive");

    const rgb = hexToRgb(color);
    gl.uniform3f(uColor, rgb[0], rgb[1], rgb[2]);
    gl.uniform1f(uScale, scale);
    gl.uniform1f(uInter, mouseInteractive ? 1.0 : 0.0);

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = [
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      ];
    };
    if (mouseInteractive) canvas.addEventListener("mousemove", onMouse);

    let raf: number;
    const t0 = performance.now();
    const render = (now: number) => {
      const elapsed = ((now - t0) / 1000) * speed * (direction === "backward" ? -1 : 1);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (mouseInteractive) canvas.removeEventListener("mousemove", onMouse);
    };
  }, [color, speed, direction, scale, mouseInteractive]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }}
    />
  );
}
