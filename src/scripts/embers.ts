// Real-time ember and camphor-spark layer for the climb, drawn over the film.
import * as THREE from 'three';

export function embers(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 10;

  const N = window.innerWidth < 760 ? 260 : 560;
  const pos = new Float32Array(N * 3);
  const seed = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 22;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    seed[i * 4] = Math.random();
    seed[i * 4 + 1] = 0.35 + Math.random() * 0.9; // speed
    seed[i * 4 + 2] = 0.4 + Math.random() * 1.6; // size
    seed[i * 4 + 3] = Math.random() * 6.28; // phase
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 4));

  const uniforms = {
    uTime: { value: 0 },
    uRise: { value: 0 }, // scroll progress pushes embers upward faster
    uPx: { value: renderer.getPixelRatio() },
    uIntensity: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec4 seed;
      uniform float uTime, uRise, uPx;
      varying float vA, vHot;
      void main() {
        vec3 p = position;
        float t = uTime * seed.y + uRise * 6.0 * seed.y;
        p.y = mod(p.y + t + 7.0, 14.0) - 7.0;
        p.x += sin(t * 0.9 + seed.w) * 0.55 + sin(t * 2.3 + seed.w * 2.0) * 0.12;
        p.z += cos(t * 0.7 + seed.w) * 0.3;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float life = smoothstep(-7.0, -4.5, p.y) * (1.0 - smoothstep(3.5, 7.0, p.y));
        float flick = 0.65 + 0.35 * sin(uTime * 9.0 * seed.y + seed.w * 7.0);
        vA = life * flick;
        vHot = seed.x;
        gl_PointSize = seed.z * uPx * (26.0 / -mv.z);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uIntensity;
      varying float vA, vHot;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float core = smoothstep(0.5, 0.0, d);
        core *= core;
        vec3 hot = vec3(1.0, 0.86, 0.55);
        vec3 warm = vec3(1.0, 0.52, 0.16);
        vec3 col = mix(warm, hot, vHot * core);
        gl_FragColor = vec4(col, core * vA * uIntensity * 0.9);
      }`,
  });
  scene.add(new THREE.Points(geo, mat));

  let w = 0, h = 0, running = false, raf = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (r.width === w && r.height === h) return;
    w = r.width; h = r.height;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  };
  const clock = new THREE.Clock();
  const loop = () => {
    if (!running) return;
    resize();
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  return {
    start() { if (running) return; running = true; clock.start(); loop(); },
    stop() { running = false; cancelAnimationFrame(raf); },
    rise(p: number) { uniforms.uRise.value = p; },
    intensity(v: number) { uniforms.uIntensity.value = v; },
  };
}
