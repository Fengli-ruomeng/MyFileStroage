// ---------- close-up scenes ----------
const CL = {};
let BGS, BGSX, BGB, BGBX;

function makeBokeh(size, col) {
  const c = makeCanvas(size, size), x = c.getContext('2d');
  const r = size / 2;
  const g = x.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, rgba(col, 0.42)); g.addColorStop(0.78, rgba(col, 0.5)); g.addColorStop(0.9, rgba(col, 0.62)); g.addColorStop(1, rgba(col, 0));
  x.fillStyle = g; x.beginPath(); x.arc(r, r, r, 0, TAU); x.fill();
  return c;
}

function initClose() {
  BGS = makeCanvas(480, 270); BGSX = BGS.getContext('2d');
  BGB = makeCanvas(480, 270); BGBX = BGB.getContext('2d');
  CL.bokeh = [makeBokeh(128, hex('#ffd6e2')), makeBokeh(128, hex('#ffffff')), makeBokeh(128, hex('#ffe7a8')), makeBokeh(128, hex('#f7b9cb'))];
  // mini world for dew drop
  const m = makeCanvas(256, 256), mx = m.getContext('2d');
  const g = mx.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#3d9fb3'); g.addColorStop(1, '#d9efe4');
  mx.fillStyle = g; mx.fillRect(0, 0, 256, 256);
  mx.translate(128, 250); mx.scale(0.17, 0.17);
  WORLD.tree.draw(mx, ENV.day, 0, { x: 0, y: 0, scale: 1, s: 0, wind: { x: 0, gust: 0 } });
  CL.mini = m;
  // tree silhouette for shadows
  const sil = makeCanvas(2200, 1400), sx = sil.getContext('2d');
  WORLD.tree.draw(sx, ENV.day, 0, { x: 1100, y: 1300, scale: 1.4, s: 0.3, wind: { x: 0, gust: 0 }, sil: hex('#5b6f9a') });
  CL.sil = sil;
  // trunk texture
  CL.trunk = makeTrunkTex();
  // town map
  CL.town = makeTownMap();
  // branch geometry for branch close-up
  makeBranch();
}

// ===== macro dandelion =====
function drawMacroBG(ctx, env, t, o) {
  // render sky + blurred tree + wall + ground at low res
  const x = BGSX;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const g = x.createLinearGradient(0, 0, 0, 270);
  g.addColorStop(0, rgb(env.skyTop)); g.addColorStop(0.6, rgb(env.skyMid)); g.addColorStop(1, rgb(env.skyBot));
  x.fillStyle = g; x.fillRect(0, 0, 480, 270);
  const cam = o.cam || { x: 0, y: 0, z: 1 };
  const k = 0.25;
  // background parallax: small
  const bz = 1 + (cam.z - 1) * 0.25;
  x.setTransform(k * bz, 0, 0, k * bz, (W / 2 - (W / 2 + cam.x * 0.25) * bz) * k, (H / 2 - (H / 2 + cam.y * 0.25) * bz) * k);
  // overhead tree
  if (o.tree !== false) WORLD.tree.draw(x, env, t, { x: 520, y: 1650, scale: 1.75, s: o.treeS || 0, wind: o.wind || { x: 0.2, gust: 0.2 }, noFlowers: true, glow: o.treeGlow || 0, snow: o.snow || 0 });
  // wall receding on left
  const wc = lit(env, hex('#a8a39a'));
  x.fillStyle = rgb(wc);
  x.beginPath(); x.moveTo(-200, 260); x.lineTo(560, 690); x.lineTo(560, 775); x.lineTo(-200, 1100); x.closePath(); x.fill();
  x.strokeStyle = rgba(lit(env, hex('#6c6964')), 0.8); x.lineWidth = 6;
  for (let i = 0; i < 9; i++) { const u = i / 9; x.beginPath(); x.moveTo(-200 + u * 0, 260 + u * 800); x.lineTo(560, 690 + u * 85); x.stroke(); }
  // ground plane
  const gg = x.createLinearGradient(0, 760, 0, 1080);
  const road = lit(env, mixc(hex('#8a949b'), hex('#5f6b75'), o.wet || 0));
  gg.addColorStop(0, rgb(mixc(road, env.fog, 0.45))); gg.addColorStop(1, rgb(scalec(road, 0.85)));
  x.fillStyle = gg; x.fillRect(-400, 762, 2800, 600);
  // green strip receding
  x.fillStyle = rgb(lit(env, hex('#5f9f88'), 0.3));
  x.beginPath(); x.moveTo(560, 775); x.lineTo(610, 776); x.lineTo(330, 1300); x.lineTo(-200, 1100); x.closePath(); x.fill();
  // asphalt speckle
  x.fillStyle = rgba(lit(env, hex('#3f4954')), 0.35);
  for (let i = 0; i < 260; i++) { const yy = 770 + Math.pow(hash1(i * 1.3), 1.4) * 330, sc = (yy - 760) / 300; x.fillRect(-200 + hash1(i * 7.1) * 2600, yy, 3 + sc * 8, 1.5 + sc * 3); }
  if (o.snowGround) { x.fillStyle = rgba(lit(env, hex('#f1f5f8')), o.snowGround); x.fillRect(-400, 762, 2800, 600); }
  // blur
  BGBX.setTransform(1, 0, 0, 1, 0, 0);
  BGBX.filter = `blur(${o.bgBlur == null ? 2.2 : o.bgBlur}px)`;
  BGBX.drawImage(BGS, 0, 0);
  BGBX.filter = 'none';
  resetT(ctx);
  ctx.drawImage(BGB, -8, -8, W + 16, H + 16);
}

function bokehField(ctx, t, o) {
  resetT(ctx);
  ctx.globalCompositeOperation = 'screen';
  const n = o.n || 22;
  for (let i = 0; i < n; i++) {
    const h1 = hash1(i * 3.7 + (o.seed || 0)), h2 = hash1(i * 5.3 + 1), h3 = hash1(i * 9.1 + 2);
    const x = ((h1 * (W + 300) + t * (o.vx || 8) * (0.5 + h3)) % (W + 300)) - 150;
    const y = (o.yMin || 0) + h2 * ((o.yMax || H * 0.6) - (o.yMin || 0)) + Math.sin(t * 0.3 + i) * 10;
    const s = (o.sMin || 40) + h3 * ((o.sMax || 140) - (o.sMin || 40));
    ctx.globalAlpha = (o.alpha || 0.5) * (0.4 + 0.6 * hash1(i * 1.3));
    const img = o.imgs ? o.imgs[i % o.imgs.length] : CL.bokeh[i % CL.bokeh.length];
    ctx.drawImage(img, x - s / 2, y - s / 2, s, s);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

// o: env, stage, seedsGone, cam, wind, dew, glow, petals, rain, fly (seed flight), flyT0
function drawMacro(ctx, t, o) {
  const env = o.env, cam = o.cam || { x: 0, y: 0, z: 1 };
  const wind = o.wind || { x: 0.2, gust: 0.2 };
  drawMacroBG(ctx, env, t, o);
  if (o.sun) { resetT(ctx); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.sun[3]; ctx.drawImage(SPR.glowWarm, o.sun[0] - o.sun[2], o.sun[1] - o.sun[2], o.sun[2] * 2, o.sun[2] * 2); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  if (o.rays) godRays(ctx, o.sun ? o.sun[0] : 300, o.sun ? o.sun[1] : 100, o.rays, t, o.rayCol);
  bokehField(ctx, t, { n: o.bokehN || 18, yMin: 20, yMax: 560, alpha: (o.bokeh == null ? 0.45 : o.bokeh), sMin: 50, sMax: 170 });
  // far petals (behind dandelion)
  if (o.petals) petalField(ctx, t, { n: o.petals * 0.6, seed: 3, vx: 50 + wind.x * 120, vy: 45, zMin: 0, zMax: 0.55, sMin: 8, sMax: 20, sway: 25, tint: envTint(env), blurNear: false });
  // ground petals near focus
  camT(ctx, cam, 1);
  if (o.groundPetals !== false) {
    const R = mulberry32(9);
    const cols = [hex('#f6cdd8'), hex('#fbe4ea'), hex('#efb6c6')].map(c => lit(env, c, 0.1));
    for (let i = 0; i < 90; i++) {
      const y = 790 + Math.pow(R(), 1.5) * 330, sc = (y - 760) / 320;
      const x = -200 + R() * 2400;
      if (R() > (o.groundPetals || 1)) continue;
      ctx.fillStyle = rgb(cols[i % 3]);
      ctx.beginPath(); ctx.ellipse(x, y, 10 * sc + 2, 4 * sc + 1, R() * 0.6 - 0.3, 0, TAU); ctx.fill();
    }
  }
  // curb (foreground left)
  const cc = lit(env, mixc(hex('#c9c8c2'), hex('#8e8f8c'), o.wet || 0));
  ctx.fillStyle = rgb(cc);
  ctx.beginPath(); ctx.moveTo(-300, 860); ctx.lineTo(980, 1010); ctx.lineTo(1000, 1300); ctx.lineTo(-300, 1300); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgb(scalec(cc, 0.82));
  ctx.beginPath(); ctx.moveTo(-300, 860); ctx.lineTo(980, 1010); ctx.lineTo(985, 1030); ctx.lineTo(-300, 885); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgba(lit(env, hex('#ffffff')), 0.35); ctx.fillRect(-300, 856, 1300, 3);
  // crack
  ctx.strokeStyle = rgba(lit(env, hex('#55524c')), 0.7); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(990, 1012); ctx.lineTo(1040, 1060); ctx.lineTo(1100, 1110); ctx.stroke();
  // dandelion
  const dx = o.x || 1150, dy = o.y || 1135;
  camT(ctx, cam, 1);
  drawDandelion(ctx, env, t, { x: dx, y: dy, scale: o.scale || 1, stage: o.stage, wind, seedsGone: o.seedsGone || 0, glow: o.glow || 0, dew: o.dew || 0, nod: o.nod || 0, droop: o.droop || 0, leafScale: 1 });
  // flying seeds
  if (o.fly) drawFlyingSeeds(ctx, env, t, o, cam, dx, dy);
  // near petals (in front, blurred)
  if (o.petals) petalField(ctx, t, { n: o.petals * 0.35, seed: 7, vx: 60 + wind.x * 150, vy: 55, zMin: 0.7, zMax: 1, sMin: 30, sMax: 80, sway: 40, tint: envTint(env) });
  if (o.rain) rainField(ctx, t, o.rain, { slant: 0.3 });
  if (o.sparks) sparkField(ctx, t, o.sparks, { n: 40 });
}

// seeds leaving the puff (analytic): o.flyT0, o.flyDur, o.flyWind
function drawFlyingSeeds(ctx, env, t, o, cam, dx, dy) {
  const S = o.scale || 1;
  const Rp = 120 * 1.32 * S;
  const n = DAND.seeds.length;
  const gone = o.seedsGone || 0;
  for (let i = 0; i < n; i++) {
    const sd = DAND.seeds[i];
    if (gone <= sd.det) continue;
    // detach time
    const td = lerp(o.flyT0, o.flyT0 + o.flyDur, sd.det);
    const a = t - td; if (a < 0) continue;
    const [lx, ly, lz] = seedLocal(i, Rp, td);
    const [hx, hy] = dandHead(td, o);
    const h1 = hash1(i * 1.7), h2 = hash1(i * 2.9);
    const vx = (o.flyVX || 260) * (0.4 + h1 * 1.2), vy = -(o.flyVY || 70) * (0.45 + h2 * 1.2) + ly * 0.3;
    let x = hx + lx + vx * a + Math.sin(a * 1.5 + i) * 30 + a * a * 20;
    let y = hy + ly + vy * a + Math.sin(a * 1.1 + i * 2) * 22 - a * a * 28;
    const [sx, sy, zp] = camPoint(cam, 1, x, y);
    const size = (0.6 + h2 * 0.4) * zp * S * (1 + a * 0.18 * (h1 - 0.2));
    if (sx < -200 || sx > W + 200 || sy < -250 || sy > H + 200) continue;
    const rot = Math.sin(a * 2 + i) * 0.4 + (vx > 0 ? 0.25 : -0.25);
    const img = size > 1.25 ? SPR.seedBlur : SPR.seedGlow;
    ctx.globalAlpha = clamp(1 - a * 0.04) * clamp(a * 4 + 0.3);
    const c = Math.cos(rot), s = Math.sin(rot);
    setT(ctx, c * size, s * size, -s * size, c * size, sx, sy);
    ctx.drawImage(img, -img.width / 2, -52);
  }
  ctx.globalAlpha = 1; resetT(ctx);
}

// generic free-flying seeds in screen space (for sky / aerial shots)
function seedField(ctx, t, o) {
  const n = o.n || 30;
  for (let i = 0; i < n; i++) {
    const h1 = hash1(i * 3.3 + (o.seed || 0)), h2 = hash1(i * 7.1 + 1), z = hash1(i * 4.7 + 3);
    const sp = 0.5 + z;
    let x = ((h1 * (W + 400) + t * (o.vx || 80) * sp + Math.sin(t * 0.7 + i) * 40) % (W + 400) + W + 400) % (W + 400) - 200;
    let y = ((h2 * (H + 400) + t * (o.vy || -30) * sp + Math.sin(t * 0.5 + i * 2) * 30) % (H + 400) + H + 400) % (H + 400) - 200;
    const size = lerp(o.sMin || 0.3, o.sMax || 1.2, z * z);
    const rot = Math.sin(t * 1.2 + i) * 0.35;
    if (o.shadow) {
      ctx.globalAlpha = 0.18 * (o.alpha || 1);
      const c = Math.cos(rot), s = Math.sin(rot);
      setT(ctx, c * size, s * size, -s * size, c * size, x + o.shadow[0] * size, y + o.shadow[1] * size);
      ctx.filter = 'brightness(0)';
      ctx.drawImage(SPR.seed, -64, -52);
      ctx.filter = 'none';
    }
    ctx.globalAlpha = (o.alpha || 1) * (0.6 + 0.4 * z);
    const img = z > 0.85 ? SPR.seedBlur : SPR.seedGlow;
    const c = Math.cos(rot), s = Math.sin(rot);
    setT(ctx, c * size, s * size, -s * size, c * size, x, y);
    ctx.drawImage(img, -64, -52);
  }
  ctx.globalAlpha = 1; resetT(ctx);
}

// ===== top-down "止まれ" road =====
function drawStopScene(ctx, t, o) {
  const env = o.env;
  const pan = o.pan || 0;
  resetT(ctx);
  setT(ctx, 1.08, 0, 0, 1.08, -80, -40 - pan);
  const asp = WORLD.asphalt;
  for (let y = -300; y < H + 600; y += asp.height - 2) for (let x = -200; x < W + 200; x += asp.width) ctx.drawImage(asp, x, y);
  // green strip & edge line at left
  ctx.fillStyle = '#5f9f88'; ctx.fillRect(-200, -400, 330, 2000);
  ctx.fillStyle = '#f2f0ea'; ctx.fillRect(130, -400, 16, 2000);
  // stop line
  ctx.fillStyle = 'rgba(242,240,234,0.93)'; ctx.fillRect(160, 120, 1900, 70);
  // 止まれ
  ctx.save();
  ctx.translate(1010, 610); ctx.scale(1, 2.35);
  ctx.font = '700 230px "Noto Sans CJK JP"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(244,242,236,0.93)';
  ctx.fillText('止', -300, 0); ctx.fillText('ま', 0, 0); ctx.fillText('れ', 300, 0);
  ctx.restore();
  // wear
  ctx.globalAlpha = 0.28;
  for (let y = -300; y < H + 600; y += asp.height - 2) for (let x = -200; x < W + 200; x += asp.width) ctx.drawImage(asp, x + 37, y + 11);
  ctx.globalAlpha = 1;
  // ground petals
  if (o.groundPetals) {
    const R = mulberry32(31);
    ctx.fillStyle = '#f7d3dc';
    ctx.beginPath();
    for (let i = 0; i < 160 * o.groundPetals; i++) { const x = R() * 2100 - 100, y = R() * 1300 - 100; ell(ctx, x, y, 7 + R() * 4, 4 + R() * 3, R() * 3); }
    ctx.fill();
  }
  // tree shadow sweeping (time-lapse sun)
  const day = o.dayPhase != null ? o.dayPhase : 0;
  const sunUp = Math.max(0, Math.sin(day * TAU));
  if (sunUp > 0) {
    resetT(ctx);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.5 * Math.min(1, sunUp * 1.6);
    const q = clamp(day / 0.5);
    ctx.translate(lerp(-700, 2500, q), lerp(-250, -150, Math.sin(q * Math.PI)));
    ctx.rotate(lerp(0.9, -0.9, q) + Math.PI * 0.5);
    ctx.scale(0.62, 0.62 * (1.6 - 0.6 * sunUp));
    ctx.drawImage(CL.sil, -1100, -1300);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    resetT(ctx);
  }
  // lighting overlay: day/night
  resetT(ctx);
  const dark = 1 - sunUp;
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = rgb(mixc([255, 250, 240], hex('#33406e'), dark * 0.85));
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'screen';
  if (dark > 0.3) { ctx.globalAlpha = (dark - 0.3) * 0.9; ctx.drawImage(SPR.glowWarm, 1300, 300, 900, 900); ctx.globalAlpha = 1; }
  ctx.globalCompositeOperation = 'source-over';
  // petal shadows + petals rushing
  const vx = o.vx || 700;
  petalField(ctx, t, { n: o.petals || 70, seed: 12, vx, vy: 140, zMin: 0, zMax: 0.75, sMin: 16, sMax: 34, sway: 50, tint: [hex('#2a3555'), 0.75], alpha: 0.35 * (0.3 + 0.7 * sunUp), blurNear: false, area: [-100, -60, W + 100, H + 100] });
  petalField(ctx, t, { n: o.petals || 70, seed: 12, vx, vy: 140, zMin: 0, zMax: 0.75, sMin: 16, sMax: 34, sway: 50, burstX: -40, burstY: -60, tint: dark > 0.2 ? [hex('#4a5785'), dark * 0.6] : null, area: [-100, -60, W + 100, H + 100] });
}

// ===== branch close-up (petals letting go) =====
function makeBranch() {
  const R = mulberry32(55);
  const pts = [];
  for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([lerp(-150, 2050, u) + (R() - 0.5) * 30, lerp(900, 230, u) + Math.sin(u * 5) * 40 + (R() - 0.5) * 20]); }
  const flowers = [], leaves = [];
  const anchors = [0.28, 0.45, 0.62, 0.78];
  anchors.forEach((u, ai) => {
    const i = Math.floor(u * 12), f = u * 12 - i;
    const px = lerp(pts[i][0], pts[i + 1][0], f), py = lerp(pts[i][1], pts[i + 1][1], f);
    const nflow = 3 + Math.floor(R() * 2);
    for (let k = 0; k < nflow; k++) {
      const a = Math.PI * 0.5 + (k - (nflow - 1) / 2) * 0.55 + (R() - 0.5) * 0.3;
      const L = 70 + R() * 70;
      const petals = [];
      for (let p = 0; p < 5; p++) petals.push({ th: R(), rot: p * TAU / 5 + R() * 0.2 });
      flowers.push({ ax: px, ay: py, a, L, R: 58 + R() * 18, tilt: 0.7 + R() * 0.3, spin: R() * TAU, petals, face: R() });
    }
    for (let k = 0; k < 2; k++) leaves.push({ x: px + (R() - 0.5) * 30, y: py, a: -Math.PI / 2 + (R() - 0.5) * 1.6, s: 0.8 + R() * 0.6, th: R() });
  });
  CL.branch = { pts, flowers, leaves };
}

function drawPetalShape(ctx, x, y, size, rot, sx, col0, col1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(size / 40 * sx, size / 40);
  const g = ctx.createLinearGradient(0, 20, 0, -20); g.addColorStop(0, col0); g.addColorStop(1, col1);
  petalPath(ctx); ctx.fillStyle = g; ctx.fill();
  ctx.restore();
}

function drawBranchScene(ctx, t, o) {
  const env = o.env;
  // background: blurred tree + sky
  drawMacroBG(ctx, env, t, { cam: { x: 0, y: -200, z: 1 }, treeS: o.treeS || 0.3, wind: { x: 0.4, gust: 0.4 }, bgBlur: 3.2 });
  bokehField(ctx, t, { n: 16, yMin: 0, yMax: H, alpha: 0.4, sMin: 60, sMax: 200 });
  const B = CL.branch;
  const cam = o.cam || { x: 0, y: 0, z: 1 };
  camT(ctx, cam, 1);
  const sway = Math.sin(t * 0.9) * 6;
  // branch
  ctx.strokeStyle = rgb(lit(env, hex('#4a3a45'))); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < B.pts.length - 1; i++) {
    ctx.lineWidth = lerp(44, 16, i / 12);
    ctx.beginPath(); ctx.moveTo(B.pts[i][0], B.pts[i][1] + sway * i / 12); ctx.lineTo(B.pts[i + 1][0], B.pts[i + 1][1] + sway * (i + 1) / 12); ctx.stroke();
  }
  ctx.strokeStyle = rgba(lit(env, hex('#8c7a80')), 0.6); ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) { const [x, y] = B.pts[i]; ctx.beginPath(); ctx.moveTo(x + 10, y - 8 + sway * i / 12); ctx.lineTo(x + 28, y - 18 + sway * i / 12); ctx.stroke(); }
  // leaves (young, unfurling)
  const leafGrow = o.leaf || 0;
  for (const L of B.leaves) {
    const g = clamp((leafGrow - L.th * 0.5) * 2);
    if (g <= 0) continue;
    const img = SPR.leafGreen[0];
    const s = 2.0 * L.s * g;
    const c = Math.cos(L.a + Math.PI / 2), si = Math.sin(L.a + Math.PI / 2);
    const m = ctx.getTransform();
    ctx.translate(L.x, L.y + sway * 0.5); ctx.rotate(L.a + Math.PI / 2); ctx.scale(s, s);
    ctx.drawImage(img, -48, -78);
    ctx.setTransform(m);
  }
  // flowers + petals
  const t0 = o.dropT0, t1 = o.dropT1;
  const pc0 = rgb(lit(env, hex('#ec9ab2'))), pc1 = rgb(lit(env, hex('#fff6f8')));
  const falling = [];
  for (const f of B.flowers) {
    const sw = Math.sin(t * 1.4 + f.spin) * 0.06;
    const fx = f.ax + Math.cos(f.a + sw) * f.L, fy = f.ay + sway * 0.6 + Math.sin(f.a + sw) * f.L;
    ctx.strokeStyle = rgb(lit(env, hex('#7a9a5a'))); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(f.ax, f.ay + sway * 0.6); ctx.quadraticCurveTo(lerp(f.ax, fx, 0.5) + 10, lerp(f.ay, fy, 0.5) - 10, fx, fy); ctx.stroke();
    let remaining = 0;
    for (const p of f.petals) {
      const td = lerp(t0, t1, p.th);
      const pr = f.R * 0.62;
      const ang = p.rot + f.spin;
      const px = fx + Math.cos(ang) * pr * 0.55, py = fy + Math.sin(ang) * pr * 0.55 * f.tilt;
      if (t < td) {
        remaining++;
        ctx.save(); ctx.translate(fx, fy); ctx.scale(1, f.tilt); ctx.rotate(ang + Math.PI / 2);
        ctx.translate(0, -pr * 0.55);
        const k = f.R / 52;
        ctx.scale(k, k);
        const g = ctx.createLinearGradient(0, 20, 0, -20); g.addColorStop(0, pc0); g.addColorStop(0.45, rgb(lit(env, hex('#f9d0dc')))); g.addColorStop(1, pc1);
        petalPath(ctx); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = rgba(lit(env, hex('#e8a0b4')), 0.6); ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
      } else {
        falling.push([px, py, t - td, p.rot, f.R]);
      }
    }
    // center + stamens (fade when petals gone)
    const vis = 0.35 + 0.65 * remaining / 5;
    ctx.globalAlpha = vis;
    ctx.strokeStyle = rgb(lit(env, hex('#d76d8f'))); ctx.lineWidth = 2;
    ctx.fillStyle = rgb(lit(env, hex('#f5c65a')));
    for (let i = 0; i < 14; i++) {
      const a = i * TAU / 14 + f.spin, r = f.R * (0.28 + 0.08 * (i % 3));
      const ex = fx + Math.cos(a) * r, ey = fy + Math.sin(a) * r * f.tilt;
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.beginPath(); ctx.arc(ex, ey, 3.2, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = rgb(lit(env, hex('#c9466e'))); ctx.beginPath(); ctx.arc(fx, fy, f.R * 0.1, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // falling petals
  resetT(ctx);
  for (const [px, py, a, rot, Rr] of falling) {
    const x = px + a * 140 + Math.sin(a * 2 + rot) * 30 + a * a * 30, y = py + a * 150 + a * a * 40;
    const [sx, sy, zp] = camPoint(cam, 1, x, y);
    if (sy > H + 80) continue;
    drawTumble(ctx, SPR.petals[Math.floor(rot * 10) % 4], sx, sy, Rr * 0.9 * zp, rot + a * 2, a * 3.5 + rot, 1);
  }
  ctx.globalAlpha = 1; resetT(ctx);
  // ambient near blurred petals
  petalField(ctx, t, { n: 10, seed: 21, vx: 90, vy: 70, zMin: 0.8, zMax: 1, sMin: 40, sMax: 90, tint: envTint(env) });
}

// ===== trunk close-up (胴吹き) =====
function makeTrunkTex() {
  const w = 1000, h = 1300, c = makeCanvas(w, h), x = c.getContext('2d');
  const R = mulberry32(808);
  const g = x.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#231a21'); g.addColorStop(0.15, '#46363f'); g.addColorStop(0.38, '#6e5a62'); g.addColorStop(0.55, '#5f4c55'); g.addColorStop(0.82, '#3e3038'); g.addColorStop(1, '#1d151b');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  // horizontal banding (sakura bark peels in rings)
  for (let i = 0; i < 60; i++) {
    const y = R() * h, th = 4 + R() * 16;
    x.fillStyle = R() < 0.5 ? `rgba(20,14,18,${0.12 + R() * 0.12})` : `rgba(160,140,140,${0.05 + R() * 0.07})`;
    x.fillRect(0, y, w, th);
  }
  // lenticels (horizontal dashes) - the sakura signature
  for (let i = 0; i < 420; i++) {
    const px = R() * w, py = R() * h, L = 24 + R() * 80, th = 4 + R() * 6;
    const edge = Math.abs(px / w - 0.42) * 2;
    const a = 0.75 * (1 - edge * 0.75);
    x.fillStyle = `rgba(${178 + R() * 30},${160 + R() * 25},${158 + R() * 25},${a})`;
    x.beginPath(); x.ellipse(px, py, L / 2, th / 2, (R() - 0.5) * 0.06, 0, TAU); x.fill();
    x.fillStyle = `rgba(22,15,20,${0.55 * (1 - edge * 0.5)})`; x.beginPath(); x.ellipse(px, py + th * 0.55, L / 2 * 0.95, th / 3, 0, 0, TAU); x.fill();
  }
  // a few fissures / old wound
  x.strokeStyle = 'rgba(18,12,16,0.5)';
  for (let i = 0; i < 9; i++) {
    let px = 150 + R() * 700, py = R() * h; x.lineWidth = 2 + R() * 3; x.beginPath(); x.moveTo(px, py);
    for (let k = 0; k < 6; k++) { px += (R() - 0.5) * 22; py += 20 + R() * 30; x.lineTo(px, py); }
    x.stroke();
  }
  // knot hollow
  x.fillStyle = '#1a1217'; x.beginPath(); x.ellipse(420, 820, 46, 70, 0.1, 0, TAU); x.fill();
  x.strokeStyle = 'rgba(140,120,120,0.5)'; x.lineWidth = 6; x.beginPath(); x.ellipse(420, 820, 58, 84, 0.1, 0, TAU); x.stroke();
  // moss
  for (let i = 0; i < 10; i++) {
    const px = R() < 0.5 ? R() * w * 0.28 : w * 0.72 + R() * w * 0.28, py = R() * h;
    for (let k = 0; k < 50; k++) { x.fillStyle = `rgba(${95 + R() * 40},${145 + R() * 40},${85 + R() * 30},${0.5 + R() * 0.4})`; x.beginPath(); x.arc(px + (R() - 0.5) * 80, py + (R() - 0.5) * 60, 2 + R() * 6, 0, TAU); x.fill(); }
  }
  // edge rim light
  const rl = x.createLinearGradient(0, 0, w, 0);
  rl.addColorStop(0.0, 'rgba(150,170,220,0.0)'); rl.addColorStop(0.03, 'rgba(150,170,220,0.25)'); rl.addColorStop(0.07, 'rgba(150,170,220,0)');
  x.fillStyle = rl; x.fillRect(0, 0, w, h);
  return c;
}

function drawTrunkScene(ctx, t, o) {
  const env = o.env;
  resetT(ctx);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, rgb(mixc(env.skyTop, [10, 14, 30], 0.3))); g.addColorStop(1, rgb(mixc(env.skyBot, [10, 14, 30], 0.4)));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  bokehField(ctx, t, { n: 10, yMin: 0, yMax: H, alpha: 0.18, sMin: 80, sMax: 260, imgs: [CL.bokeh[2], CL.bokeh[1]], vx: 3 });
  const cam = o.cam || { x: 0, y: 0, z: 1 };
  camT(ctx, cam, 1);
  ctx.save();
  ctx.translate(960, 540); ctx.rotate(0.05);
  ctx.beginPath();
  for (let y = -700; y <= 700; y += 25) { const xx = -440 - 40 * Math.sin(y / 230 + 1) - 18 * Math.sin(y / 71); y === -700 ? ctx.moveTo(xx, y) : ctx.lineTo(xx, y); }
  for (let y = 700; y >= -700; y -= 25) { const xx = 450 + 46 * Math.sin(y / 260 + 2.2) + 15 * Math.sin(y / 63 + 1); ctx.lineTo(xx, y); }
  ctx.closePath(); ctx.clip();
  ctx.drawImage(CL.trunk, -520, -650, 1040, 1300);
  // lighting
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = rgb(env.light); ctx.fillRect(-500, -650, 1000, 1300);
  ctx.globalCompositeOperation = 'source-over';
  // wet sheen
  if (o.wet) {
    const sg = ctx.createLinearGradient(-500, 0, 500, 0);
    sg.addColorStop(0.25, 'rgba(200,215,240,0)'); sg.addColorStop(0.36, `rgba(200,215,240,${0.18 * o.wet})`); sg.addColorStop(0.46, 'rgba(200,215,240,0)');
    ctx.fillStyle = sg; ctx.fillRect(-500, -650, 1000, 1300);
    // droplets running
    for (let i = 0; i < 14; i++) {
      const x = -380 + hash1(i * 4.1) * 760, sp = 40 + hash1(i * 2.3) * 90;
      const y = ((hash1(i * 7.7) * 1400 + t * sp) % 1400) - 700;
      ctx.fillStyle = `rgba(220,232,255,${0.55 * o.wet})`;
      ctx.beginPath(); ctx.ellipse(x, y, 5, 8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${0.8 * o.wet})`; ctx.beginPath(); ctx.arc(x - 1.5, y - 3, 1.8, 0, TAU); ctx.fill();
      ctx.strokeStyle = `rgba(200,215,240,${0.2 * o.wet})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + Math.sin(i) * 4, y - 70); ctx.stroke();
    }
  }
  ctx.restore();
  // 胴吹き blossom
  const b = o.bloom || 0;
  const bx = 1010, by = 560;
  camT(ctx, cam, 1);
  if (b > 0) {
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.85 * smooth(0, 0.8, b);
    ctx.drawImage(SPR.glowWarm, bx - 420, by - 420, 840, 840);
    ctx.globalAlpha = 0.6 * smooth(0.2, 1, b);
    ctx.drawImage(SPR.glowPink, bx - 300, by - 300, 600, 600);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  // twig
  const tw = smooth(0, 0.35, b);
  ctx.strokeStyle = rgb(lit(env, hex('#5a4650'))); ctx.lineWidth = 9 * tw + 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(bx - 40, by + 30); ctx.quadraticCurveTo(bx, by + 10 - 30 * tw, bx + 70 * tw, by - 30 * tw); ctx.stroke();
  // buds/flowers
  const fl = [[bx + 70, by - 40, 0.15, 0.0, 1.1], [bx + 10, by - 70, 0.35, 1.9, 0.9], [bx + 95, by + 40, 0.55, 3.6, 0.85]];
  for (const [fx, fy, d0, rot, sz] of fl) {
    const k = smooth(d0, d0 + 0.45, b);
    const bud = smooth(d0 - 0.15, d0 + 0.05, b);
    if (bud <= 0) continue;
    const fxx = lerp(bx + 20, fx, tw), fyy = lerp(by, fy, tw);
    ctx.strokeStyle = rgb(lit(env, hex('#7b9a58'))); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(bx + 40 * tw, by - 15 * tw); ctx.lineTo(fxx, fyy); ctx.stroke();
    if (k < 0.15) {
      ctx.fillStyle = rgb(lit(env, hex('#e07f9c'))); ctx.beginPath(); ctx.ellipse(fxx, fyy, 10 * bud, 16 * bud, rot, 0, TAU); ctx.fill();
    } else {
      const s = 170 * sz * (0.3 + 0.7 * easeOut(k));
      ctx.save(); ctx.translate(fxx, fyy); ctx.rotate(rot + t * 0.05);
      ctx.globalAlpha = clamp(k * 3);
      ctx.drawImage(SPR.bigFlower, -s / 2, -s / 2, s, s);
      ctx.restore(); ctx.globalAlpha = 1;
    }
  }
  resetT(ctx);
  if (o.sparks) sparkField(ctx, t, o.sparks, { n: 30, img: SPR.glowPink });
  if (o.rain) rainField(ctx, t, o.rain, { slant: 0.15 });
  // vignette darkness
  const vg = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1100);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(5,8,20,${0.55 - 0.25 * b})`);
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

// ===== school clock =====
function drawClockScene(ctx, t, o) {
  const env = o.env;
  const cam = o.cam || { x: 0, y: 0, z: 1 };
  resetT(ctx);
  // sky strip
  const g = ctx.createLinearGradient(0, 0, 0, 260);
  g.addColorStop(0, rgb(env.skyTop)); g.addColorStop(1, rgb(env.skyMid));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  camT(ctx, cam, 1);
  // wall
  ctx.fillStyle = rgb(lit(env, hex('#efe8da'))); ctx.fillRect(-200, 170, 2400, 1200);
  ctx.fillStyle = rgb(lit(env, hex('#d9d1c1'))); ctx.fillRect(-200, 150, 2400, 26);
  ctx.strokeStyle = rgba(lit(env, hex('#c9c0ae')), 0.7); ctx.lineWidth = 2;
  for (let y = 300; y < 1200; y += 180) { ctx.beginPath(); ctx.moveTo(-200, y); ctx.lineTo(2400, y); ctx.stroke(); }
  // windows below
  ctx.fillStyle = rgb(lit(env, hex('#9fb6bb')));
  for (let i = 0; i < 7; i++) ctx.fillRect(-100 + i * 330, 980, 220, 160);
  const cx = 960, cy = 560, r = 300;
  // shadow
  ctx.fillStyle = 'rgba(40,40,60,0.18)'; ctx.beginPath(); ctx.arc(cx + 18, cy + 22, r + 20, 0, TAU); ctx.fill();
  ctx.fillStyle = rgb(lit(env, hex('#2f3b50'))); ctx.beginPath(); ctx.arc(cx, cy, r + 22, 0, TAU); ctx.fill();
  ctx.fillStyle = rgb(lit(env, hex('#fbfaf6'))); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  // ticks + numbers
  ctx.strokeStyle = rgb(lit(env, hex('#2f3b50')));
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * TAU; const L = i % 5 ? 12 : 30; ctx.lineWidth = i % 5 ? 3 : 8;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r - 18), cy + Math.sin(a) * (r - 18)); ctx.lineTo(cx + Math.cos(a) * (r - 18 - L), cy + Math.sin(a) * (r - 18 - L)); ctx.stroke();
  }
  ctx.fillStyle = rgb(lit(env, hex('#2f3b50'))); ctx.font = '600 52px "Noto Sans CJK SC"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU - Math.PI / 2; ctx.fillText(String(i), cx + Math.cos(a) * (r - 85), cy + Math.sin(a) * (r - 85)); }
  const clk = o.clock;
  const ha = (clk % 12) / 12 * TAU - Math.PI / 2, ma = (clk % 1) * TAU - Math.PI / 2;
  ctx.lineCap = 'round';
  // hand shadows
  ctx.strokeStyle = 'rgba(40,40,60,0.18)'; ctx.lineWidth = 16;
  ctx.beginPath(); ctx.moveTo(cx + 8, cy + 10); ctx.lineTo(cx + 8 + Math.cos(ha) * r * 0.5, cy + 10 + Math.sin(ha) * r * 0.5); ctx.stroke();
  ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(cx + 8, cy + 10); ctx.lineTo(cx + 8 + Math.cos(ma) * r * 0.78, cy + 10 + Math.sin(ma) * r * 0.78); ctx.stroke();
  ctx.strokeStyle = rgb(lit(env, hex('#1f2838')));
  ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(cx - Math.cos(ha) * 30, cy - Math.sin(ha) * 30); ctx.lineTo(cx + Math.cos(ha) * r * 0.5, cy + Math.sin(ha) * r * 0.5); ctx.stroke();
  ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(cx - Math.cos(ma) * 40, cy - Math.sin(ma) * 40); ctx.lineTo(cx + Math.cos(ma) * r * 0.78, cy + Math.sin(ma) * r * 0.78); ctx.stroke();
  const sa = (t * 0.75 % 1) * TAU - Math.PI / 2;
  ctx.strokeStyle = rgb(lit(env, hex('#d6455c'))); ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(cx - Math.cos(sa) * 50, cy - Math.sin(sa) * 50); ctx.lineTo(cx + Math.cos(sa) * r * 0.85, cy + Math.sin(sa) * r * 0.85); ctx.stroke();
  ctx.fillStyle = rgb(lit(env, hex('#d6455c'))); ctx.beginPath(); ctx.arc(cx, cy, 12, 0, TAU); ctx.fill();
  // glass glare
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(cx - 110, cy - 130, 150, 60, -0.6, 0, TAU); ctx.fill();
  resetT(ctx);
  // day/night cycling overlay
  if (o.dayPhase != null) {
    const sunUp = Math.max(0, Math.sin(o.dayPhase * TAU));
    const dark = 1 - sunUp;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = rgb(mixc([255, 248, 238], hex('#3a4676'), dark * 0.8)); ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
  // foreground blurred branch
  petalField(ctx, t, { n: 26, seed: 4, vx: o.vx || 300, vy: 60, zMin: 0.3, zMax: 1, sMin: 20, sMax: 70 });
}

// ===== aerial town =====
function makeTownMap() {
  const w = 3600, h = 2600, c = makeCanvas(w, h), x = c.getContext('2d');
  const R = mulberry32(2024);
  x.fillStyle = '#93c08d'; x.fillRect(0, 0, w, h);
  // field patches
  for (let i = 0; i < 70; i++) {
    x.fillStyle = ['#a8c97f', '#86b77a', '#b5cf8e', '#7fb07c'][i % 4];
    x.save(); x.translate(R() * w, R() * h); x.rotate((R() - 0.5) * 0.3); x.fillRect(-120, -80, 160 + R() * 200, 100 + R() * 140);
    x.strokeStyle = 'rgba(80,120,70,0.25)'; x.lineWidth = 2; for (let k = -80; k < 160; k += 14) { x.beginPath(); x.moveTo(-120, k); x.lineTo(240, k); x.stroke(); }
    x.restore();
  }
  // river
  const riv = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; riv.push([lerp(-100, w + 100, u), lerp(400, 2300, u) + Math.sin(u * 7) * 160]); }
  const drawRiver = (wd, col) => { x.strokeStyle = col; x.lineWidth = wd; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); riv.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.stroke(); };
  drawRiver(260, '#b9c7a8'); drawRiver(190, '#7cc0c8'); drawRiver(150, '#5fb0c2');
  x.globalAlpha = 0.5; drawRiver(30, '#a9dde2'); x.globalAlpha = 1;
  // roads grid (slightly rotated)
  x.save(); x.translate(w / 2, h / 2); x.rotate(-0.12); x.translate(-w / 2, -h / 2);
  const roadsX = [], roadsY = [];
  for (let px = -200; px < w + 200; px += 260 + R() * 160) roadsX.push(px);
  for (let py = -200; py < h + 200; py += 220 + R() * 140) roadsY.push(py);
  // blocks with houses
  const roofs = ['#6f9aa3', '#7d8796', '#c4927f', '#5f6f8a', '#9aa79f', '#c9a98a', '#8fa7b5', '#a7b3b8', '#7b9a8f'];
  for (let i = 0; i < roadsX.length - 1; i++) for (let j = 0; j < roadsY.length - 1; j++) {
    const bx = roadsX[i] + 20, by = roadsY[j] + 20, bw = roadsX[i + 1] - roadsX[i] - 40, bh = roadsY[j + 1] - roadsY[j] - 40;
    // skip near river roughly
    const cxb = bx + bw / 2, cyb = by + bh / 2;
    let nearRiver = false;
    for (const [rx, ry] of riv) if (Math.hypot(rx - cxb, ry - cyb) < 220) nearRiver = true;
    if (nearRiver) continue;
    if (R() < 0.12) { // park
      x.fillStyle = '#7fb67e'; x.fillRect(bx, by, bw, bh);
      for (let k = 0; k < 8; k++) { const tx = bx + R() * bw, ty = by + R() * bh, r = 16 + R() * 14; x.fillStyle = 'rgba(30,60,40,0.25)'; x.beginPath(); x.arc(tx + 8, ty + 8, r, 0, TAU); x.fill(); x.fillStyle = R() < 0.5 ? '#f3c7d3' : '#5f9b70'; x.beginPath(); x.arc(tx, ty, r, 0, TAU); x.fill(); }
      continue;
    }
    x.fillStyle = '#a9c99a'; x.fillRect(bx, by, bw, bh);
    for (let hx = bx + 6; hx < bx + bw - 30; hx += 0) {
      const hw = 58 + R() * 46;
      for (let hy = by + 8; hy < by + bh - 40;) {
        const hh = 50 + R() * 36;
        if (hx + hw > bx + bw - 4 || hy + hh > by + bh - 4) break;
        // yard
        x.fillStyle = R() < 0.5 ? '#9cc58f' : '#d7d3c6'; x.fillRect(hx - 3, hy - 3, hw + 6, hh + 6);
        const rc = hex(roofs[Math.floor(R() * roofs.length)]);
        x.fillStyle = 'rgba(30,40,60,0.28)'; x.fillRect(hx + 7, hy + 7, hw - 6, hh - 6);
        x.fillStyle = rgb(rc); x.fillRect(hx, hy, hw - 6, hh - 6);
        x.fillStyle = rgb(scalec(rc, 0.78));
        if (hw > hh) x.fillRect(hx, hy + (hh - 6) / 2, hw - 6, (hh - 6) / 2); else x.fillRect(hx + (hw - 6) / 2, hy, (hw - 6) / 2, hh - 6);
        x.fillStyle = 'rgba(255,255,255,0.18)'; if (hw > hh) x.fillRect(hx, hy + (hh - 6) / 2 - 2, hw - 6, 3); else x.fillRect(hx + (hw - 6) / 2 - 2, hy, 3, hh - 6);
        if (R() < 0.25) { const r = 10 + R() * 10; x.fillStyle = '#5f9b70'; x.beginPath(); x.arc(hx + hw, hy + hh, r, 0, TAU); x.fill(); }
        hy += hh + 14;
      }
      hx += hw + 14;
    }
  }
  // roads
  x.fillStyle = '#8f979c';
  for (const px of roadsX) x.fillRect(px - 16, -300, 32, h + 600);
  for (const py of roadsY) x.fillRect(-300, py - 16, w + 600, 32);
  x.fillStyle = 'rgba(245,245,240,0.7)';
  for (const px of roadsX) for (let py = -300; py < h + 300; py += 40) x.fillRect(px - 1.5, py, 3, 20);
  x.restore();
  // school with ground (centre-right)
  x.save(); x.translate(2200, 1250); x.rotate(-0.12);
  x.fillStyle = '#c7a27c'; x.beginPath(); x.roundRect(-320, -60, 560, 340, 40); x.fill();
  x.strokeStyle = 'rgba(255,255,255,0.75)'; x.lineWidth = 4; x.beginPath(); x.roundRect(-270, -20, 460, 260, 120); x.stroke();
  x.fillStyle = 'rgba(30,40,60,0.28)'; x.fillRect(-300, -230, 620, 130);
  x.fillStyle = '#d9dcdc'; x.fillRect(-310, -240, 620, 120);
  x.fillStyle = '#b9bfc2'; x.fillRect(-310, -180, 620, 60);
  x.fillStyle = '#6fc2d4'; x.fillRect(260, -40, 120, 200);
  // the sakura by the road
  for (let k = 0; k < 6; k++) { x.fillStyle = '#f5cdd8'; x.beginPath(); x.arc(-420 + k * 14, 240 + Math.sin(k) * 20, 36, 0, TAU); x.fill(); }
  x.restore();
  // sakura along river banks
  riv.forEach(([px, py], i) => {
    const q = riv[Math.min(i + 1, riv.length - 1)], p0 = riv[Math.max(i - 1, 0)];
    let ndx = -(q[1] - p0[1]), ndy = q[0] - p0[0]; const nl = Math.hypot(ndx, ndy) || 1; ndx /= nl; ndy /= nl;
    for (const side of [-1, 1]) for (let k = 0; k < 2; k++) {
      const r = 15 + R() * 16;
      const along = (k - 0.5) * 50 + (R() - 0.5) * 40;
      const off = 112 + (R() - 0.5) * 40;
      const ox = px + side * ndx * off + (q[0] - p0[0]) / nl * along, oy = py + side * ndy * off + (q[1] - p0[1]) / nl * along;
      if (R() < 0.32) continue;
      x.fillStyle = 'rgba(40,40,70,0.25)'; x.beginPath(); x.arc(ox + 10, oy + 10, r, 0, TAU); x.fill();
      x.fillStyle = R() < 0.85 ? '#f6cfd9' : '#fbe6ec'; x.beginPath(); circlePath(x, ox, oy, r); circlePath(x, ox + 18, oy + 6, r * 0.7); x.fill();
    }
  });
  return c;
}

function drawAerial(ctx, t, o) {
  const env = o.env;
  resetT(ctx);
  const cam = o.cam;
  const z = cam.z;
  setT(ctx, Math.cos(cam.r) * z, Math.sin(cam.r) * z, -Math.sin(cam.r) * z, Math.cos(cam.r) * z, W / 2, H / 2);
  ctx.translate(-cam.x, -cam.y);
  ctx.drawImage(CL.town, 0, 0);
  // cloud shadows
  ctx.fillStyle = 'rgba(30,40,70,0.16)';
  for (let i = 0; i < 6; i++) {
    const cx = (hash1(i * 3) * 3600 + t * 40) % 3800 - 100, cy = hash1(i * 7) * 2600;
    ctx.beginPath(); ctx.ellipse(cx, cy, 260, 160, 0.3, 0, TAU); ctx.ellipse(cx + 150, cy + 60, 180, 120, 0, 0, TAU); ctx.fill();
  }
  resetT(ctx);
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = rgb(env.light); ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  // haze
  const hz = ctx.createLinearGradient(0, 0, 0, H);
  hz.addColorStop(0, rgba(env.fog, 0.35)); hz.addColorStop(0.5, rgba(env.fog, 0.05)); hz.addColorStop(1, rgba(env.fog, 0.2));
  ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H);
}
