// ---------- the dandelion (君) ----------
const DAND = {};
function initDandelion() {
  const R = mulberry32(314);
  // seed sphere (fibonacci)
  const N = 170, seeds = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
    const d = [Math.cos(th) * r, y, Math.sin(th) * r];
    // jitter
    d[0] += (R() - 0.5) * 0.08; d[1] += (R() - 0.5) * 0.08; d[2] += (R() - 0.5) * 0.08;
    const L = Math.hypot(d[0], d[1], d[2]); d[0] /= L; d[1] /= L; d[2] /= L;
    // perpendicular basis
    const up = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let u = [d[1] * up[2] - d[2] * up[1], d[2] * up[0] - d[0] * up[2], d[0] * up[1] - d[1] * up[0]];
    let lu = Math.hypot(...u); u = u.map(v => v / lu);
    const v = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
    const fil = [];
    const nf = 11;
    for (let k = 0; k < nf; k++) {
      const ph = k / nf * TAU + R() * 0.3, sp = 0.85 + R() * 0.25;
      fil.push([d[0] + sp * (Math.cos(ph) * u[0] + Math.sin(ph) * v[0]), d[1] + sp * (Math.cos(ph) * u[1] + Math.sin(ph) * v[1]), d[2] + sp * (Math.cos(ph) * u[2] + Math.sin(ph) * v[2])]);
    }
    // detach order: upper-left first, plus randomness
    const det = clamp(0.5 + (-d[0] * 0.25 - d[1] * 0.2) + (R() - 0.5) * 0.55, 0.01, 0.99);
    seeds.push({ d, fil, det, len: 0.95 + R() * 0.1 });
  }
  DAND.seeds = seeds;
  // leaves
  DAND.leaves = [];
  const angs = [-2.75, -2.35, -1.95, -1.25, -0.8, -0.4];
  angs.forEach((a, i) => DAND.leaves.push({ a: a + (R() - 0.5) * 0.15, L: 260 + R() * 160, w: 46 + R() * 22, teeth: 5 + Math.floor(R() * 3), ph: R() * TAU, bend: (R() - 0.5) * 0.4, dark: R() }));
  // rays
  DAND.rings = [
    { n: 34, L: 1.0, w: 0.115, c0: '#f7bf2a', c1: '#ffd84a', off: 0 },
    { n: 30, L: 0.8, w: 0.11, c0: '#f6b422', c1: '#ffd040', off: 0.09 },
    { n: 24, L: 0.6, w: 0.1, c0: '#f3a51b', c1: '#fcc535', off: 0.05 },
    { n: 16, L: 0.38, w: 0.09, c0: '#ea9114', c1: '#f6b52a', off: 0.12 },
  ].map(r => Object.assign(r, { c0: hex(r.c0), c1: hex(r.c1) }));
  DAND.rayJit = []; for (let i = 0; i < 200; i++) DAND.rayJit.push([(R() - 0.5) * 0.06, 0.9 + R() * 0.18]);
}

function rayPath(ctx, r0, L, w) {
  // strap from r0 to L along +x, with 4 teeth at tip
  const h = w / 2;
  ctx.moveTo(r0, -h * 0.7);
  ctx.quadraticCurveTo(r0 + (L - r0) * 0.3, -h * 1.05, L - h * 0.4, -h);
  const tx = L;
  ctx.lineTo(tx, -h * 0.55); ctx.lineTo(tx - h * 0.35, -h * 0.25); ctx.lineTo(tx + h * 0.05, 0); ctx.lineTo(tx - h * 0.35, h * 0.25); ctx.lineTo(tx, h * 0.55);
  ctx.lineTo(L - h * 0.4, h);
  ctx.quadraticCurveTo(r0 + (L - r0) * 0.3, h * 1.05, r0, h * 0.7);
  ctx.closePath();
}

function dandHeadLocal(t, o) {
  const stage = o.stage, wind = o.wind || { x: 0.2, gust: 0.2 };
  const stemH = 560 * (stage < 1 ? lerp(0.72, 1, easeOut(stage)) : stage < 2 ? 1 : lerp(1, 1.12, clamp(stage - 2)));
  const sw = Math.sin(t * 1.3 + 0.5) * (8 + 26 * (wind.gust || 0)) + Math.sin(t * 2.7) * 4 * (0.4 + (wind.gust || 0)) + (wind.x || 0) * 60 + (o.nod || 0);
  const lean = (o.lean || 0) * 200 + 40;
  return [lean + sw, -stemH + Math.abs(sw) * 0.08 + (o.droop || 0) * 40, stemH];
}
// head position in parent coords
function dandHead(t, o) { const [hx, hy] = dandHeadLocal(t, o); return [o.x + hx * o.scale, o.y + hy * o.scale]; }
// o: {x,y,scale,stage,wind,seedsGone,small,lean,glow,leaves,dew}
function drawDandelion(ctx, env, t, o) {
  const sc = o.scale, stage = o.stage;
  const wind = o.wind || { x: 0.2, gust: 0.2 };
  const base = ctx.getTransform();
  ctx.save();
  ctx.translate(o.x, o.y); ctx.scale(sc, sc);
  const [hx, hy, stemH] = dandHeadLocal(t, o);
  const lightK = o.small ? 0 : 0;
  // ---- leaves ----
  if (o.leaves !== false) {
    for (const lf of DAND.leaves) {
      const sway = Math.sin(t * 1.1 + lf.ph) * 0.03 * (1 + (wind.gust || 0) * 2);
      const a = lf.a + sway;
      const L = lf.L * (o.leafScale || 1);
      ctx.save(); ctx.rotate(a);
      const dark = lit(env, mixc(hex('#3c7b53'), hex('#4b8a5c'), lf.dark));
      const light = lit(env, hex('#78b56f'));
      if (o.snow) { /* covered */ }
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const n = lf.teeth;
      // upper edge with backward-pointing lobes
      for (let k = 0; k <= n; k++) {
        const u = k / n; const x = u * L; const wdt = lf.w * Math.sin(Math.PI * Math.pow(u, 0.75)) * (1 - u * 0.2);
        const by = lf.bend * x * x / L;
        if (k > 0 && k < n) { ctx.lineTo(x - L / n * 0.55, by - wdt * 0.32); ctx.lineTo(x - L / n * 0.05, by - wdt); }
        else ctx.lineTo(x, by - wdt * 0.2);
      }
      for (let k = n; k >= 0; k--) {
        const u = k / n; const x = u * L; const wdt = lf.w * 0.85 * Math.sin(Math.PI * Math.pow(u, 0.75)) * (1 - u * 0.2);
        const by = lf.bend * x * x / L;
        if (k > 0 && k < n) { ctx.lineTo(x - L / n * 0.05, by + wdt); ctx.lineTo(x - L / n * 0.55, by + wdt * 0.32); }
        else ctx.lineTo(x, by + wdt * 0.2);
      }
      ctx.closePath();
      ctx.fillStyle = rgb(dark); ctx.fill();
      if (!o.small) {
        ctx.strokeStyle = rgb(light); ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(4, 0); for (let k = 1; k <= 10; k++) { const x = k / 10 * L * 0.96; ctx.lineTo(x, lf.bend * x * x / L); } ctx.stroke();
        // edge highlight
        ctx.strokeStyle = rgba(light, 0.35); ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  // ---- stem ----
  const cx = hx * 0.15 - 12, cy = -stemH * 0.55;
  if (!(o.seedsGone >= 1 && stage >= 3 && o.noBald)) {
    const g = ctx.createLinearGradient(0, 0, 0, hy);
    g.addColorStop(0, rgb(lit(env, hex('#9b6a7a')))); g.addColorStop(0.18, rgb(lit(env, hex('#8bbd6a')))); g.addColorStop(1, rgb(lit(env, hex('#a3cf7c'))));
    ctx.strokeStyle = g; ctx.lineCap = 'round';
    ctx.lineWidth = o.small ? 22 : 13;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(cx, cy, hx, hy); ctx.stroke();
    if (!o.small) {
      ctx.strokeStyle = rgba(lit(env, hex('#d7efb0')), 0.7); ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(-3, -30); ctx.quadraticCurveTo(cx - 4, cy, hx - 3, hy + 20); ctx.stroke();
    }
  }
  // stem tangent at head
  const tdx = hx - cx, tdy = hy - cy; const tang = Math.atan2(tdy, tdx) + Math.PI / 2;
  ctx.translate(hx, hy); ctx.rotate(tang * 0.6 + (o.headRot || 0));
  // ---- head ----
  const R = 120;
  if (o.glow > 0) {
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = o.glow;
    const img = stage >= 2.5 ? SPR.glowW : SPR.glowGold;
    ctx.drawImage(img, -R * 4, -R * 4, R * 8, R * 8);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  if (stage < 2.6) {
    // open-ness: 0 bud, 1 open, 2 closed
    const open = stage <= 1 ? smooth(0.25, 1, stage) : 1 - smooth(1.05, 1.8, stage);
    const wilt = smooth(1.1, 2, stage);
    drawFlowerHead(ctx, env, t, R, open, wilt, o);
    if (o.dew > 0 && !o.small) { ctx.globalAlpha = clamp(o.dew); drawDewdrop(ctx, R * 0.46, -R * 0.12, R * 0.21, env, CL.mini, t); ctx.globalAlpha = 1; }
  }
  if (stage > 2) {
    const grow = smooth(2.0, 2.9, stage);
    drawPuff(ctx, env, t, R * 1.32 * grow, o.seedsGone || 0, o, grow);
  }
  ctx.restore();
  ctx.setTransform(base);
  return [hx, hy];
}

function drawFlowerHead(ctx, env, t, R, open, wilt, o) {
  const greenD = lit(env, hex('#4f8f52')), greenL = lit(env, hex('#7fb86a'));
  if (o.small) {
    // simplified: bracts + disc
    if (open > 0.05) {
      ctx.fillStyle = rgb(lit(env, mixc(hex('#f8c22c'), hex('#c9a24a'), wilt * 0.6)));
      ctx.beginPath(); ctx.ellipse(0, 0, R * (0.4 + 0.75 * open), R * (0.35 + 0.55 * open), 0, 0, TAU); ctx.fill();
      ctx.fillStyle = rgb(lit(env, hex('#ffd955'))); ctx.beginPath(); ctx.ellipse(-R * 0.15, -R * 0.15, R * 0.5 * open, R * 0.35 * open, 0, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = rgb(greenD); ctx.beginPath(); ctx.ellipse(0, R * 0.5, R * 0.35, R * 0.5 * (1 - open * 0.5), 0, 0, TAU); ctx.fill();
    return;
  }
  // reflexed outer bracts (below head)
  ctx.fillStyle = rgb(greenD);
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.18 + 0.64 * i / 8) + Math.sin(i * 7) * 0.08;
    const L = R * (0.55 + 0.15 * Math.sin(i * 3.3)) * (0.55 + 0.45 * open);
    ctx.save(); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(R * 0.12, -8); ctx.quadraticCurveTo(L * 0.6, -10, L, 0); ctx.quadraticCurveTo(L * 0.6, 8, R * 0.12, 8); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // closed capsule (bud / closed head)
  const cap = 1 - open;
  if (cap > 0.02) {
    ctx.save();
    ctx.globalAlpha = clamp(cap * 1.6);
    const ch = R * 1.25, cw = R * 0.62;
    // tuft
    const tuft = lit(env, mixc(hex('#f8c22c'), hex('#b5964f'), wilt));
    ctx.fillStyle = rgb(tuft);
    ctx.beginPath(); ctx.ellipse(0, -ch * 0.62, cw * 0.55, ch * 0.28 * (0.6 + 0.4 * (wilt > 0 ? 1 - wilt * 0.6 : 1)), 0, 0, TAU); ctx.fill();
    // bracts
    for (let k = -3; k <= 3; k++) {
      ctx.fillStyle = rgb(k % 2 ? greenD : greenL);
      ctx.beginPath();
      ctx.moveTo(k * cw * 0.14, ch * 0.25);
      ctx.quadraticCurveTo(k * cw * 0.32 - cw * 0.2, -ch * 0.2, k * cw * 0.08, -ch * 0.62 - (3 - Math.abs(k)) * 6);
      ctx.quadraticCurveTo(k * cw * 0.32 + cw * 0.2, -ch * 0.2, k * cw * 0.14 + 4, ch * 0.25);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = rgb(greenD); ctx.beginPath(); ctx.ellipse(0, ch * 0.18, cw * 0.48, ch * 0.16, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  if (open < 0.02) return;
  // rays
  ctx.save();
  ctx.scale(1, 0.84);
  const outline = lit(env, hex('#d9890f'));
  let ji = 0;
  for (let ri = 0; ri < DAND.rings.length; ri++) {
    const ring = DAND.rings[ri];
    const L = R * ring.L * (0.25 + 0.75 * open), w = R * ring.w * (0.6 + 0.4 * open);
    const c0 = lit(env, mixc(ring.c0, hex('#c4a35a'), wilt * 0.5)), c1 = lit(env, mixc(ring.c1, hex('#d8be78'), wilt * 0.5));
    for (let i = 0; i < ring.n; i++) {
      const [ja, jl] = DAND.rayJit[ji++ % DAND.rayJit.length];
      const a = (i / ring.n + ring.off) * TAU + ja + Math.sin(t * 0.8 + i) * 0.01;
      ctx.save(); ctx.rotate(a);
      // cupping when partly open: shorten upward-facing rays visually
      ctx.beginPath(); rayPath(ctx, R * 0.08, L * jl, w);
      const g = ctx.createLinearGradient(0, 0, L, 0); g.addColorStop(0, rgb(c0)); g.addColorStop(1, rgb(c1));
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = rgba(outline, 0.55); ctx.lineWidth = 1.2; ctx.stroke();
      // center groove
      ctx.strokeStyle = rgba(outline, 0.25); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(R * 0.12, 0); ctx.lineTo(L * jl * 0.85, 0); ctx.stroke();
      ctx.restore();
    }
  }
  // center
  ctx.fillStyle = rgb(lit(env, hex('#e3870f'))); ctx.beginPath(); ctx.arc(0, 0, R * 0.12 * open, 0, TAU); ctx.fill();
  ctx.fillStyle = rgba(lit(env, hex('#ffe58a')), 0.8);
  for (let i = 0; i < 10; i++) { const a = i * 2.4, r = R * 0.07 * Math.sqrt(i / 10); ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 2.2, 0, TAU); ctx.fill(); }
  ctx.restore();
}

function puffRot(t) { return 0.35 + Math.sin(t * 0.3) * 0.15; }
function projSeed(d, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return [d[0] * c + d[2] * s, d[1], -d[0] * s + d[2] * c];
}
function drawPuff(ctx, env, t, Rp, gone, o, grow) {
  if (Rp < 1) return;
  const rot = puffRot(t);
  const small = o.small;
  // receptacle
  ctx.fillStyle = rgb(lit(env, hex('#8a9a5a')));
  ctx.beginPath(); ctx.ellipse(0, Rp * 0.04, Rp * 0.16, Rp * 0.11, 0, 0, TAU); ctx.fill();
  if (small) {
    const rem = 1 - gone;
    if (rem <= 0.01) return;
    ctx.globalAlpha = 0.25 + 0.6 * rem;
    ctx.fillStyle = rgba(lit(env, hex('#ffffff')), 0.85);
    ctx.beginPath(); ctx.arc(0, 0, Rp * (0.7 + 0.3 * rem), 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }
  const white = lit(env, hex('#ffffff')), beak = lit(env, hex('#e9e4d4'));
  const back = new Path2D(), front = new Path2D(), beaks = new Path2D(), dots = new Path2D();
  for (const sd of DAND.seeds) {
    if (gone > sd.det) continue;
    const d = projSeed(sd.d, rot);
    const r0 = Rp * 0.14, r1 = Rp * 0.74 * sd.len;
    const bx = d[0] * r1, by = d[1] * r1;
    beaks.moveTo(d[0] * r0, d[1] * r0); beaks.lineTo(bx, by);
    const P = d[2] > 0 ? front : back;
    for (const f of sd.fil) {
      const fr = projSeed(f, rot);
      const L = Rp * 0.32 * sd.len;
      P.moveTo(bx, by); P.lineTo(bx + fr[0] * L, by + fr[1] * L);
    }
    dots.moveTo(bx + 2, by); dots.arc(bx, by, 2, 0, TAU);
  }
  ctx.lineCap = 'round';
  ctx.strokeStyle = rgba(white, 0.35); ctx.lineWidth = 1.1; ctx.stroke(back);
  ctx.strokeStyle = rgba(beak, 0.75); ctx.lineWidth = 1.4; ctx.stroke(beaks);
  ctx.fillStyle = rgba(white, 0.8); ctx.fill(dots);
  ctx.strokeStyle = rgba(white, 0.78); ctx.lineWidth = 1.25; ctx.stroke(front);
  // soft sphere sheen
  const g = ctx.createRadialGradient(-Rp * 0.3, -Rp * 0.3, 0, 0, 0, Rp * 1.1);
  g.addColorStop(0, rgba(white, 0.16 * (1 - gone))); g.addColorStop(1, rgba(white, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, Rp * 1.1, 0, TAU); ctx.fill();
}

// screen/world position of seed pappus centre given dandelion params (approx, ignoring head rotation)
function seedLocal(i, Rp, t) {
  const sd = DAND.seeds[i];
  const d = projSeed(sd.d, puffRot(t));
  const r1 = Rp * 0.74 * sd.len + Rp * 0.12;
  return [d[0] * r1, d[1] * r1, d[2]];
}

// dew drop with refracted (inverted) mini world
function drawDewdrop(ctx, x, y, r, env, mini, t) {
  ctx.save();
  // shadow
  ctx.fillStyle = 'rgba(20,40,30,0.25)'; ctx.beginPath(); ctx.ellipse(x + r * 0.15, y + r * 0.85, r * 0.9, r * 0.25, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  // refracted inverted image
  ctx.translate(x, y); ctx.scale(1, -1);
  const s = r * 2.3 / mini.width;
  ctx.drawImage(mini, -mini.width * s / 2, -mini.height * s / 2 + r * 0.1, mini.width * s, mini.height * s);
  ctx.restore();
  ctx.save();
  // rim darkening & lens
  const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.3, x, y, r);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.75, 'rgba(30,60,70,0.15)'); g.addColorStop(1, 'rgba(20,40,50,0.55)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  // highlights
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.ellipse(x - r * 0.38, y - r * 0.42, r * 0.22, r * 0.13, -0.6, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(x + r * 0.35, y + r * 0.5, r * 0.18, r * 0.07, -0.4, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = Math.max(1, r * 0.04); ctx.beginPath(); ctx.arc(x, y, r * 0.96, 0.2, 1.4); ctx.stroke();
  ctx.restore();
}
