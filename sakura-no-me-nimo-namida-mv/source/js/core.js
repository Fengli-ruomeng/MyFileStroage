// ---------- core utilities ----------
const W = 1920, H = 1080;
const TAU = Math.PI * 2;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const easeInOut = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const easeInOutS = t => { t = clamp(t); return -(Math.cos(Math.PI * t) - 1) / 2; };
const easeOut = t => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
const easeIn = t => { t = clamp(t); return t * t * t; };
const fract = x => x - Math.floor(x);
function hash1(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function hash2(a, b) { const s = Math.sin(a * 127.1 + b * 311.7 + 74.7) * 43758.5453; return s - Math.floor(s); }
function noise1(x) { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash1(i), hash1(i + 1), u) * 2 - 1; }
function fbm1(x) { return noise1(x) * 0.6 + noise1(x * 2.13 + 5.2) * 0.3 + noise1(x * 4.37 + 11.1) * 0.1; }
// 2D value noise
function noise2(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}

// ---------- color ----------
function hex(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
function mixc(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
function mulc(a, b) { return [a[0] * b[0] / 255, a[1] * b[1] / 255, a[2] * b[2] / 255]; }
function addc(a, b, k = 1) { return [Math.min(255, a[0] + b[0] * k), Math.min(255, a[1] + b[1] * k), Math.min(255, a[2] + b[2] * k)]; }
function scalec(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
function rgba(c, a = 1) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; }
function rgb(c) { return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; }
function desat(c, k) { const l = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11; return mixc(c, [l, l, l], k); }

// ---------- environment / lighting presets ----------
// light: multiplier for lit surfaces; fog: haze colour for distance; amb: shadow tint
const ENV = {};
function defEnv(name, o) {
  const e = {};
  for (const k in o) e[k] = (typeof o[k] === 'string') ? hex(o[k]) : o[k];
  ENV[name] = e; return e;
}
defEnv('day', { skyTop: '#3d9fb3', skyMid: '#79c4c8', skyBot: '#d9efe4', light: '#ffffff', fog: '#cdeae4', fogK: 1, cloud: '#fffaf1', cloudSh: '#a7d3d5', stars: 0, night: 0, sun: '#fff6dc', sunA: 0.0, glow: '#fff3d6', grade: '#ffffff', gradeK: 0 });
defEnv('morning', { skyTop: '#4ea8bf', skyMid: '#93cfd0', skyBot: '#f7e6d3', light: '#fff4e8', fog: '#f0e4d6', fogK: 1, cloud: '#fff6ea', cloudSh: '#b6cfd6', stars: 0, night: 0, sun: '#fff1cf', sunA: 0.6, glow: '#ffe9c4', grade: '#ffe7cf', gradeK: 0.06 });
defEnv('dawn', { skyTop: '#26386a', skyMid: '#8d7fb0', skyBot: '#f8c6a6', light: '#c6b6cf', fog: '#a99bbd', fogK: 1, cloud: '#f2c7c0', cloudSh: '#6f6a98', stars: 0.25, night: 0.35, sun: '#ffd9a8', sunA: 0.8, glow: '#ffc9a0', grade: '#d9b8d6', gradeK: 0.08 });
defEnv('sunset', { skyTop: '#3e5b8f', skyMid: '#e59d93', skyBot: '#ffd29b', light: '#ffcfae', fog: '#eebaa6', fogK: 1, cloud: '#ffd7bd', cloudSh: '#a07ea0', stars: 0, night: 0.1, sun: '#fff0c4', sunA: 1, glow: '#ffbf8a', grade: '#ffc8a0', gradeK: 0.12 });
defEnv('night', { skyTop: '#08122a', skyMid: '#172650', skyBot: '#2d4377', light: '#56638f', fog: '#22325c', fogK: 1, cloud: '#33456f', cloudSh: '#1a2648', stars: 1, night: 1, sun: '#e9efff', sunA: 0, glow: '#ffd99a', grade: '#1b2a55', gradeK: 0.1 });
defEnv('magic', { skyTop: '#0d1640', skyMid: '#3b2f78', skyBot: '#2f7f95', light: '#9a8fc8', fog: '#4b4f8f', fogK: 1, cloud: '#5a5a9c', cloudSh: '#2a2c63', stars: 1, night: 0.85, sun: '#f4f1ff', sunA: 0, glow: '#ffe2a0', grade: '#3a2f7a', gradeK: 0.06 });
defEnv('overcast', { skyTop: '#7b929e', skyMid: '#a6b6b9', skyBot: '#cdd6d3', light: '#bcc6c8', fog: '#b4c1c3', fogK: 1, cloud: '#d6dcdb', cloudSh: '#8d9ea6', stars: 0, night: 0.15, sun: '#ffffff', sunA: 0, glow: '#ffffff', grade: '#9fb2ba', gradeK: 0.1 });
defEnv('storm', { skyTop: '#26323f', skyMid: '#3f4c5a', skyBot: '#5e6c75', light: '#727f8c', fog: '#55626e', fogK: 1, cloud: '#56636f', cloudSh: '#2b3540', stars: 0, night: 0.5, sun: '#ffffff', sunA: 0, glow: '#c9d6ff', grade: '#2d3a4a', gradeK: 0.15 });
defEnv('summer', { skyTop: '#1f8fb8', skyMid: '#5fc0d6', skyBot: '#d2f0ec', light: '#ffffff', fog: '#cdeef0', fogK: 1, cloud: '#ffffff', cloudSh: '#9ccbdc', stars: 0, night: 0, sun: '#ffffff', sunA: 0.5, glow: '#fffbe6', grade: '#ffffff', gradeK: 0 });
defEnv('autumn', { skyTop: '#5a8fb0', skyMid: '#b9c9c0', skyBot: '#f6dcb4', light: '#ffe6c8', fog: '#ecd8bd', fogK: 1, cloud: '#fff1df', cloudSh: '#b9b4b4', stars: 0, night: 0.05, sun: '#fff0d0', sunA: 0.5, glow: '#ffd59a', grade: '#ffcf96', gradeK: 0.1 });
defEnv('winter', { skyTop: '#93b9cb', skyMid: '#c5dbe2', skyBot: '#eef3f2', light: '#eef3fa', fog: '#e3ecef', fogK: 1, cloud: '#f7fafc', cloudSh: '#b5c8d4', stars: 0, night: 0.05, sun: '#ffffff', sunA: 0.2, glow: '#ffffff', grade: '#dfe9f2', gradeK: 0.08 });

defEnv('gold', { skyTop: '#d9985a', skyMid: '#f4c879', skyBot: '#fff0c8', light: '#ffe7b0', fog: '#ffe3b0', fogK: 1, cloud: '#fff4d8', cloudSh: '#eab27e', stars: 0, night: 0, sun: '#fffbe8', sunA: 0.9, glow: '#ffd98a', grade: '#ffd27a', gradeK: 0.12 });
defEnv('moon', { skyTop: '#0e1a3a', skyMid: '#22386a', skyBot: '#3f5a8e', light: '#7584b4', fog: '#2c3f70', fogK: 1, cloud: '#3d5180', cloudSh: '#1f2c54', stars: 0.9, night: 0.9, sun: '#e9efff', sunA: 0, glow: '#ffe3a6', grade: '#22305f', gradeK: 0.1 });

function mixEnv(a, b, t) {
  if (typeof a === 'string') a = ENV[a];
  if (typeof b === 'string') b = ENV[b];
  if (t <= 0) return a; if (t >= 1) return b;
  const e = {};
  for (const k in a) {
    const va = a[k], vb = b[k];
    e[k] = Array.isArray(va) ? mixc(va, vb, t) : lerp(va, vb, t);
  }
  return e;
}
// keyframed env: list of [time, name]
function envAt(keys, t) {
  if (t <= keys[0][0]) return ENV[keys[0][1]] || keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b] = keys[i + 1];
    if (t <= t1) return mixEnv(a, b, easeInOutS((t - t0) / (t1 - t0)));
  }
  const l = keys[keys.length - 1][1];
  return typeof l === 'string' ? ENV[l] : l;
}
// apply lighting to a base colour; depth 0 = near, 1 = far
function lit(env, base, depth = 0, extraFog = 0) {
  let c = mulc(base, env.light);
  const f = clamp(depth * env.fogK + extraFog);
  return mixc(c, env.fog, f);
}

// ---------- canvas helpers ----------
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
// global view matrix (lets whole scenes render into panels)
let VIEW = null; // null = identity
function setView(m) { VIEW = m; }
function setT(ctx, a, b, c, d, e, f) {
  if (!VIEW) { ctx.setTransform(a, b, c, d, e, f); return; }
  const V = VIEW;
  ctx.setTransform(V.a * a + V.c * b, V.b * a + V.d * b, V.a * c + V.c * d, V.b * c + V.d * d, V.a * e + V.c * f + V.e, V.b * e + V.d * f + V.f);
}
function resetT(ctx) { if (!VIEW) ctx.setTransform(1, 0, 0, 1, 0, 0); else ctx.setTransform(VIEW.a, VIEW.b, VIEW.c, VIEW.d, VIEW.e, VIEW.f); }
// Parallax camera transform: cam = {x, y, z, r?}; p = parallax factor
function camT(ctx, cam, p) {
  const zp = 1 + (cam.z - 1) * p;
  const rot = (cam.r || 0) * p;
  if (!rot) { setT(ctx, zp, 0, 0, zp, W / 2 - (W / 2 + cam.x * p) * zp, H / 2 - (H / 2 + cam.y * p) * zp); return; }
  const c = Math.cos(rot) * zp, s = Math.sin(rot) * zp;
  const tx = -(W / 2 + cam.x * p), ty = -(H / 2 + cam.y * p);
  setT(ctx, c, s, -s, c, W / 2 + c * tx - s * ty, H / 2 + s * tx + c * ty);
}
function camPoint(cam, p, wx, wy) {
  const zp = 1 + (cam.z - 1) * p;
  return [W / 2 + (wx - W / 2 - cam.x * p) * zp, H / 2 + (wy - H / 2 - cam.y * p) * zp, zp];
}
// key-framed number: [[t, v, ease?], ...]
function kf(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const k0 = keys[i], k1 = keys[i + 1];
    if (t <= k1[0]) { const e = k1[2] || easeInOutS; return lerp(k0[1], k1[1], e((t - k0[0]) / (k1[0] - k0[0]))); }
  }
  return keys[keys.length - 1][1];
}
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); }
function circlePath(ctx, x, y, r) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }

// beat helpers from audio analysis
const BPM = 95.7, BEAT = 60 / BPM;
function rmsAt(t) { const a = window.AUDIO; if (!a) return 0.6; const i = clamp(t * 10, 0, a.rms.length - 1); const i0 = Math.floor(i); const f = i - i0; return lerp(a.rms[i0], a.rms[Math.min(i0 + 1, a.rms.length - 1)], f); }
function beatPulse(t) {
  const a = window.AUDIO; if (!a) return 0;
  // find last beat
  let lo = 0, hi = a.beats.length - 1;
  if (t < a.beats[0]) return 0;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (a.beats[m] <= t) lo = m; else hi = m - 1; }
  const dt = t - a.beats[lo];
  return Math.exp(-dt * 6);
}
