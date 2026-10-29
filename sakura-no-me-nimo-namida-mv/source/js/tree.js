// ---------- procedural sakura tree ----------
// Seasonal canopy palettes: [shadow, base, light]
const CANOPY_KEYS = [
  [0.00, ['#e8a2b6', '#f9d4dd', '#fff4f6']],   // full bloom
  [0.42, ['#e9a8ba', '#f8d8df', '#fff6f7']],
  [0.62, ['#76b07a', '#a9d792', '#dcf1b6']],   // fresh leaves
  [1.00, ['#3d8a71', '#62b28b', '#9cd6a6']],   // summer
  [1.70, ['#4d8c66', '#7ab27c', '#b4d79a']],
  [2.00, ['#c45a3b', '#ea8c4b', '#f8c678']],   // autumn
  [2.50, ['#a63c34', '#d65a44', '#ef8e62']],
  [3.00, ['#7a4a3c', '#9b6450', '#c0866a']],
  [3.60, ['#c55d7c', '#e286a1', '#f4b5c6']],   // buds
  [3.93, ['#e8a2b6', '#f9d4dd', '#fff4f6']],
  [4.00, ['#e8a2b6', '#f9d4dd', '#fff4f6']],
].map(([s, cs]) => [s, cs.map(hex)]);
const RADIUS_KEYS = [[0, 1], [0.45, 0.93], [1, 1], [1.8, 0.95], [2.15, 0.85], [2.65, 0.42], [2.95, 0], [3.55, 0], [3.68, 0.15], [3.82, 0.4], [3.93, 1], [4, 1]];

function pwl(keys, s) {
  if (s <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) if (s <= keys[i + 1][0]) {
    const f = (s - keys[i][0]) / (keys[i + 1][0] - keys[i][0]);
    return lerp(keys[i][1], keys[i + 1][1], f);
  }
  return keys[keys.length - 1][1];
}
function canopyColors(s) {
  s = ((s % 4) + 4) % 4;
  for (let i = 0; i < CANOPY_KEYS.length - 1; i++) if (s <= CANOPY_KEYS[i + 1][0]) {
    const f = (s - CANOPY_KEYS[i][0]) / (CANOPY_KEYS[i + 1][0] - CANOPY_KEYS[i][0]);
    const a = CANOPY_KEYS[i][1], b = CANOPY_KEYS[i + 1][1];
    return [mixc(a[0], b[0], f), mixc(a[1], b[1], f), mixc(a[2], b[2], f)];
  }
  return CANOPY_KEYS[0][1];
}
function canopyRadius(s) { s = ((s % 4) + 4) % 4; return pwl(RADIUS_KEYS, s); }
function pinkness(s) { s = ((s % 4) + 4) % 4; if (s > 3.5) return smooth(3.72, 3.93, s); return 1 - smooth(0.42, 0.6, s); }

class SakuraTree {
  constructor(seed, opt = {}) {
    this.R = mulberry32(seed);
    this.segs = []; this.clusters = []; this.lent = [];
    this.opt = Object.assign({ trunkLen: 175, trunkW: 66, limbLen: 235, maxDepth: 5, spread: 1 }, opt);
    this.build();
  }
  build() {
    const R = this.R, o = this.opt, segs = this.segs, clusters = this.clusters;
    const maxD = o.maxDepth;
    let maxF = 1;
    const branch = (x, y, ang, len, w, depth, flex, phase) => {
      const n = depth < 2 ? 4 : 3;
      let px = x, py = y, pf = flex, a = ang, pw = w;
      const endW = w * (depth === 0 ? 0.78 : 0.6);
      const curv = (R() - 0.5) * 0.22;
      for (let k = 1; k <= n; k++) {
        a += curv + (R() - 0.5) * 0.2;
        if (depth >= 2) { const target = Math.cos(a) >= 0 ? -0.18 : -Math.PI + 0.18; a = lerp(a, target, 0.07 * depth); }
        const l = len / n;
        const nx = px + Math.cos(a) * l, ny = py + Math.sin(a) * l;
        const nw = lerp(w, endW, k / n), nf = pf + l;
        segs.push({ x0: px, y0: py, x1: nx, y1: ny, w0: pw, w1: nw, d: depth, f0: pf, f1: nf, ph: phase });
        if (w > 18 && depth <= 1) {
          for (let q = 0; q < 6; q++) this.lent.push({ s: segs.length - 1, u: R(), v: (R() - 0.5) * 1.5, l: 3 + R() * 9 });
        }
        if (depth >= 3 && k === n - 1 && R() < 0.7) clusters.push(this.mkCluster(nx, ny - 8, 30 + R() * 22, nf, phase, depth));
        px = nx; py = ny; pw = nw; pf = nf;
      }
      maxF = Math.max(maxF, pf);
      if (depth >= maxD) {
        clusters.push(this.mkCluster(px + (R() - 0.5) * 20, py - 10 - R() * 14, 46 + R() * 30, pf, phase, depth));
        if (R() < 0.6) clusters.push(this.mkCluster(px + (R() - 0.5) * 70, py + 14 + R() * 18, 34 + R() * 18, pf, phase, depth));
        return;
      }
      if (depth === 0) {
        const angs = [-0.95, -0.42, 0.12, 0.62, 1.05];
        angs.forEach((d, i) => {
          const aa = -Math.PI / 2 + d * o.spread + (R() - 0.5) * 0.15;
          branch(px, py, aa, o.limbLen * (0.85 + R() * 0.3) * (Math.abs(d) > 0.9 ? 0.92 : 1), pw * (i === 2 ? 0.55 : 0.62), 1, pf, phase + (R() - 0.5) * 2);
        });
        return;
      }
      const kids = depth >= 4 ? 2 : (R() < 0.5 ? 2 : 3);
      for (let i = 0; i < kids; i++) {
        const dev = (kids === 2 ? (i ? 0.42 : -0.42) : (i - 1) * 0.55) + (R() - 0.5) * 0.3;
        branch(px, py, a + dev, len * (0.72 + R() * 0.14), pw * (kids === 2 ? 0.74 : 0.66), depth + 1, pf, phase + (R() - 0.5) * 1.1);
      }
    };
    branch(0, 0, -Math.PI / 2 + 0.04, o.trunkLen, o.trunkW, 0, 0, 0);
    this.maxF = maxF;
    for (const s of segs) { s.f0 /= maxF; s.f1 /= maxF; }
    for (const c of clusters) c.f /= maxF;
    // sort clusters back-to-front-ish (by y) for nicer overlap
    clusters.sort((a, b) => a.y - b.y);
  }
  mkCluster(x, y, r, f, ph, depth) {
    const R = this.R;
    const k = 5 + Math.floor(R() * 4);
    const sub = [];
    for (let i = 0; i < k; i++) {
      const a = R() * TAU, d = Math.sqrt(R()) * r * 0.62;
      sub.push({ dx: Math.cos(a) * d * 1.15, dy: Math.sin(a) * d * 0.8, r: r * (0.42 + R() * 0.3), th: R() });
    }
    const flowers = [];
    const nf = 3 + Math.floor(R() * 4);
    for (let i = 0; i < nf; i++) {
      const a = -Math.PI * (0.1 + R() * 0.8) + (R() < 0.3 ? Math.PI : 0); const d = r * (0.55 + R() * 0.4);
      flowers.push({ dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.8, s: 0.55 + R() * 0.55, v: Math.floor(R() * 3), rot: R() * TAU });
    }
    return { x, y, r, f, ph: ph + (R() - 0.5) * 0.8, front: R() < 0.62, th: R(), sub, flowers, hue: (R() - 0.5) };
  }
  // sway offset for a point at flex f and phase ph
  sway(f, ph, t, wind) {
    const f2 = f * f;
    const g = wind.gust || 0;
    const dx = f2 * (wind.x * 26 + Math.sin(t * 1.25 + ph) * (4 + 10 * g) + Math.sin(t * 2.9 + ph * 1.7) * 2 * (0.5 + g));
    const dy = f2 * (Math.cos(t * 1.1 + ph * 1.3) * (2 + 4 * g) + Math.abs(wind.x) * 4);
    return [dx, dy];
  }
  // opts: {x, y, scale, s (season), wind:{x,gust}, snow, glow, dark (0..1 extra shade), sil (silhouette colour or null)}
  draw(ctx, env, t, opts) {
    const sc = opts.scale || 1, ox = opts.x, oy = opts.y;
    const wind = opts.wind || { x: 0.2, gust: 0.2 };
    const s = opts.s || 0;
    const bloomMul = opts.bloomMul == null ? 1 : opts.bloomMul;
    const base = ctx.getTransform();
    ctx.save();
    ctx.translate(ox, oy); ctx.scale(sc, sc);
    const sil = opts.sil;
    const barkBase = opts.bark || hex('#4a3a45');
    const bark = sil ? sil : lit(env, barkBase, opts.depth || 0);
    const barkHi = sil ? sil : lit(env, hex('#7a6670'), opts.depth || 0);
    const darken = opts.dark || 0;
    // ---- back canopy ----
    if (!opts.noCanopy) this.drawCanopy(ctx, env, t, s, wind, false, sil, bloomMul, opts);
    // ---- branches ----
    const P = new Path2D();
    const PC = new Path2D();
    const PR = new Path2D();
    const PH = new Path2D();
    const segPts = this._segPts = this._segPts || [];
    for (let i = 0; i < this.segs.length; i++) {
      const g = this.segs[i];
      const [ax, ay] = this.sway(g.f0, g.ph, t, wind), [bx, by] = this.sway(g.f1, g.ph, t, wind);
      const x0 = g.x0 + ax, y0 = g.y0 + ay, x1 = g.x1 + bx, y1 = g.y1 + by;
      segPts[i] = [x0, y0, x1, y1];
      let nx = -(y1 - y0), ny = x1 - x0; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      const h0 = g.w0 / 2, h1 = g.w1 / 2;
      P.moveTo(x0 + nx * h0, y0 + ny * h0); P.lineTo(x1 + nx * h1, y1 + ny * h1); P.lineTo(x1 - nx * h1, y1 - ny * h1); P.lineTo(x0 - nx * h0, y0 - ny * h0); P.closePath();
      PC.moveTo(x1 + h1, y1); PC.arc(x1, y1, h1, 0, TAU);
      if (!sil && g.d <= 3 && g.w0 > 6) {
        // light side highlight (light from upper-left): offset toward -normal side facing left
        const sx = nx < 0 ? 1 : -1; // choose side facing left
        const k0 = h0 * 0.45, k1 = h1 * 0.45;
        PH.moveTo(x0 + nx * sx * h0 * 0.9, y0 + ny * sx * h0 * 0.9); PH.lineTo(x1 + nx * sx * h1 * 0.9, y1 + ny * sx * h1 * 0.9);
        PH.lineTo(x1 + nx * sx * (h1 - k1 * 1.2), y1 + ny * sx * (h1 - k1 * 1.2)); PH.lineTo(x0 + nx * sx * (h0 - k0 * 1.2), y0 + ny * sx * (h0 - k0 * 1.2)); PH.closePath();
      }
    }
    // root flare
    if (!opts.noRoots) {
      const rw = this.opt.trunkW;
      PR.moveTo(-rw * 1.1, 6); PR.quadraticCurveTo(-rw * 0.5, -4, -rw * 0.45, -40); PR.lineTo(rw * 0.45, -40); PR.quadraticCurveTo(rw * 0.5, -4, rw * 1.15, 6); PR.closePath();
    }
    ctx.fillStyle = rgb(mixc(bark, [0, 0, 0], darken));
    ctx.fill(P); ctx.fill(PC); ctx.fill(PR);
    if (!sil) {
      ctx.fillStyle = rgba(barkHi, 0.55); ctx.fill(PH);
      // lenticels
      ctx.strokeStyle = rgba(mixc(barkHi, [255, 255, 255], 0.15), 0.5); ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath();
      for (const L of this.lent) {
        const g = this.segs[L.s], sp = segPts[L.s];
        const x = lerp(sp[0], sp[2], L.u), y = lerp(sp[1], sp[3], L.u), w = lerp(g.w0, g.w1, L.u);
        const dx = sp[2] - sp[0], dy = sp[3] - sp[1], ll = Math.hypot(dx, dy) || 1;
        const nx = -dy / ll, ny = dx / ll; // across
        const cx = x + nx * L.v * w * 0.3, cy = y + ny * L.v * w * 0.3;
        ctx.moveTo(cx - nx * L.l * 0.5, cy - ny * L.l * 0.5); ctx.lineTo(cx + nx * L.l * 0.5, cy + ny * L.l * 0.5);
      }
      ctx.stroke();
      // snow on branches
      if (opts.snow > 0) {
        ctx.strokeStyle = rgba(lit(env, hex('#ffffff')), 0.95 * clamp(opts.snow * 1.5)); ctx.lineCap = 'round';
        for (let i = 0; i < this.segs.length; i++) {
          const g = this.segs[i]; if (g.d > 4) continue;
          const sp = segPts[i];
          const dx = sp[2] - sp[0]; if (Math.abs(dx) < Math.abs(sp[3] - sp[1]) * 0.35) continue; // only on sloped branches
          const w = Math.min(g.w1 * 0.55, 9) * opts.snow + 1;
          ctx.lineWidth = w;
          ctx.beginPath(); ctx.moveTo(sp[0], sp[1] - g.w0 * 0.45); ctx.lineTo(sp[2], sp[3] - g.w1 * 0.45); ctx.stroke();
        }
      }
    }
    // ---- front canopy ----
    if (!opts.noCanopy) this.drawCanopy(ctx, env, t, s, wind, true, sil, bloomMul, opts);
    ctx.restore();
    ctx.setTransform(base);
  }
  drawCanopy(ctx, env, t, s, wind, front, sil, bloomMul, opts) {
    const bins = new Map();
    const spread = 0.3;
    const pts = [];
    for (const c of this.clusters) {
      if (c.front !== front) continue;
      const [dx, dy] = this.sway(c.f, c.ph, t, wind);
      const cx = c.x + dx, cy = c.y + dy;
      for (const u of c.sub) {
        const se = s + (u.th - 0.5) * spread + (c.th - 0.5) * 0.2;
        const rf = canopyRadius(se) * bloomMul;
        if (rf < 0.02) continue;
        const key = Math.round((((se % 4) + 4) % 4) * 24);
        let b = bins.get(key); if (!b) { b = []; bins.set(key, b); }
        b.push([cx + u.dx, cy + u.dy, u.r * rf]);
      }
      pts.push([c, cx, cy]);
    }
    const shade = front ? 1 : 0.86;
    const depth = opts.depth || 0;
    const glow = opts.glow || 0;
    if (sil) {
      const P = new Path2D();
      bins.forEach(b => { for (const [x, y, r] of b) { P.moveTo(x + r, y); P.arc(x, y, r, 0, TAU); } });
      ctx.fillStyle = rgb(sil); ctx.fill(P); return;
    }
    const darken = opts.dark || 0;
    // three passes
    for (let pass = 0; pass < 3; pass++) {
      bins.forEach((b, key) => {
        const cols = canopyColors(key / 24);
        let c = cols[pass];
        c = scalec(c, pass === 0 ? shade : (pass === 1 ? lerp(shade, 1, 0.5) : 1));
        c = lit(env, c, depth);
        if (glow > 0) c = mixc(c, mixc(cols[pass], [255, 236, 244], 0.3), glow * 0.75);
        if (darken) c = mixc(c, [0, 0, 0], darken);
        const P = new Path2D();
        for (const [x, y, r] of b) {
          if (pass === 0) { P.moveTo(x + r * 1.06, y + r * 0.22); P.arc(x, y + r * 0.22, r * 1.06, 0, TAU); }
          else if (pass === 1) { P.moveTo(x + r, y); P.arc(x, y, r, 0, TAU); }
          else { const rr = r * 0.58; P.moveTo(x - r * 0.22 + rr, y - r * 0.3); P.arc(x - r * 0.22, y - r * 0.3, rr, 0, TAU); }
        }
        ctx.fillStyle = rgb(c);
        ctx.fill(P);
      });
    }
    // flower details on front clusters
    if (front && !opts.noFlowers) {
      const m0 = ctx.getTransform();
      const tint = (typeof envTint === 'function' && LAYERX) ? envTint(env, glow > 0 ? -0.25 * glow : 0) : null;
      const dst = tint ? LAYERX : ctx;
      if (tint) { LAYERX.setTransform(1, 0, 0, 1, 0, 0); LAYERX.clearRect(0, 0, W, H); LAYERX.setTransform(m0); }
      const m = m0;
      for (const [c, cx, cy] of pts) {
        const se = s + (c.th - 0.5) * 0.4;
        const pk = pinkness(se) * clamp(canopyRadius(se) * 1.2) * bloomMul;
        if (pk < 0.05) continue;
        for (const fl of c.flowers) {
          const img = SPR.flowers[fl.v];
          const sz = 30 * fl.s * (opts.flowerScale || 1);
          dst.globalAlpha = pk * (glow > 0 ? 1 : 0.92);
          const x = cx + fl.dx, y = cy + fl.dy;
          const co = Math.cos(fl.rot), si = Math.sin(fl.rot);
          const k = sz / img.width;
          dst.setTransform(m.a * co * k + m.c * si * k, m.b * co * k + m.d * si * k, -m.a * si * k + m.c * co * k, -m.b * si * k + m.d * co * k, m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f);
          dst.drawImage(img, -img.width / 2, -img.height / 2);
        }
      }
      dst.globalAlpha = 1;
      if (tint) finishTint(ctx, tint);
      ctx.setTransform(m0); ctx.globalAlpha = 1;
      if (env.light[0] < 200 || glow > 0) {
        // dim flowers in dark env: overlay tint
      }
    }
  }
  // world position of a cluster centre (for petal emission)
  clusterWorld(i, opts, t) {
    const c = this.clusters[i % this.clusters.length];
    const [dx, dy] = this.sway(c.f, c.ph, t, opts.wind || { x: 0.2, gust: 0.2 });
    const sc = opts.scale || 1;
    return [opts.x + (c.x + dx) * sc, opts.y + (c.y + dy) * sc, c.r * sc];
  }
}
