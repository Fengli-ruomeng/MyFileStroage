// ---------- the school-road world (wide shots) ----------
const WORLD = {};
const GROUND_Y = 812;   // foot of the stone wall / road edge
const ROAD_TOP = 812, ROAD_BOT = 1012;
const TREE_X = 1230, TREE_Y = 702;
const DAND_X = 1352, DAND_Y = 818;
let LAYER, LAYERX, LAYER2, LAYER2X;

function initWorld() {
  LAYER = makeCanvas(W, H); LAYERX = LAYER.getContext('2d');
  LAYER2 = makeCanvas(W, H); LAYER2X = LAYER2.getContext('2d');
  WORLD.tree = new SakuraTree(20260415, { trunkLen: 150, trunkW: 70, limbLen: 250, maxDepth: 5, spread: 1.05 });
  const R = mulberry32(99);
  // clouds
  WORLD.clouds = [];
  const cdefs = [[-260, 170, 1.25], [380, 120, 0.8], [900, 230, 1.0], [1500, 140, 1.1], [2150, 210, 0.9], [2700, 150, 1.0]];
  for (const [cx, cy, s] of cdefs) {
    const circ = [];
    const n = 9 + Math.floor(R() * 5);
    for (let i = 0; i < n; i++) {
      const u = (i / (n - 1)) * 2 - 1;
      const r = (70 + R() * 50) * s * (1 - Math.abs(u) * 0.45);
      circ.push([u * 210 * s + (R() - 0.5) * 30, -r * 0.55 - R() * 30 * s, r]);
    }
    // tower puffs
    for (let i = 0; i < 4; i++) circ.push([(R() - 0.5) * 160 * s, -110 * s - R() * 90 * s, (55 + R() * 40) * s]);
    WORLD.clouds.push({ x: cx, y: cy, s, circ });
  }
  // mountains
  WORLD.mtn = [];
  for (let L = 0; L < 2; L++) {
    const pts = [];
    for (let x = -900; x <= 2900; x += 24) {
      const y = (L ? 610 : 560) - (fbm1(x / (L ? 380 : 520) + L * 13) * 0.5 + 0.5) * (L ? 70 : 120) - Math.max(0, 1 - Math.abs(x - (L ? 1500 : 400)) / 900) * (L ? 30 : 80);
      pts.push([x, y]);
    }
    WORLD.mtn.push(pts);
  }
  // town houses (parallax layer)
  WORLD.houses = [];
  const roofCols = ['#4f8f9c', '#5c6b80', '#b8735f', '#3f5170', '#7a8f8a', '#c08f6a', '#567a8f'].map(hex);
  for (let x = -700; x < 2900;) {
    const w = 50 + R() * 70, h = 26 + R() * 30;
    if (x > 120 && x < 760) { x = 760; continue; } // school gap
    WORLD.houses.push({ x, w, h, roof: roofCols[Math.floor(R() * roofCols.length)], wall: mixc(hex('#efe7da'), hex('#d9dfe0'), R()), y: 708 - R() * 10, flat: R() < 0.25, win: R() });
    x += w + 4 + R() * 20;
  }
  // stone wall stones
  WORLD.stones = [];
  for (let row = 0; row < 5; row++) {
    const y0 = 704 + row * 22.4;
    let x = -700 + (row % 2) * 30 + R() * 20;
    while (x < 2700) {
      const w = 34 + R() * 34;
      WORLD.stones.push({ x, y: y0, w: w - 3, h: 20, tone: R(), moss: R() < 0.12 });
      x += w;
    }
  }
  // asphalt texture
  const at = makeCanvas(1600, 220), ax = at.getContext('2d');
  ax.fillStyle = '#7d8790'; ax.fillRect(0, 0, 1600, 220);
  for (let i = 0; i < 26000; i++) {
    const v = R(); ax.fillStyle = v < 0.5 ? `rgba(40,48,58,${0.12 + R() * 0.15})` : `rgba(230,235,240,${0.08 + R() * 0.12})`;
    ax.fillRect(R() * 1600, R() * 220, 1 + R() * 2.2, 1 + R() * 1.6);
  }
  for (let i = 0; i < 8; i++) { // repair patches / cracks
    ax.strokeStyle = 'rgba(40,46,56,0.28)'; ax.lineWidth = 1.4; ax.beginPath();
    let px = R() * 1600, py = R() * 220; ax.moveTo(px, py);
    for (let k = 0; k < 7; k++) { px += (R() - 0.3) * 40; py += (R() - 0.5) * 18; ax.lineTo(px, py); }
    ax.stroke();
  }
  WORLD.asphalt = at;
  // ground petals on road (spring carpet)
  WORLD.groundPetals = [];
  for (let i = 0; i < 520; i++) {
    const x = 300 + Math.pow(R(), 0.8) * 2000 * (R() < 0.5 ? 1 : 0.9);
    const y = ROAD_TOP + 4 + Math.pow(R(), 1.6) * (ROAD_BOT - ROAD_TOP + 30);
    WORLD.groundPetals.push({ x: x + (R() - 0.5) * 300, y, r: 3 + R() * 3, a: R() * TAU, c: Math.floor(R() * 3), th: R() });
  }
  // grass tufts foreground
  WORLD.tufts = [];
  for (let x = -800; x < 2900; x += 18 + R() * 30) WORLD.tufts.push({ x, h: 20 + R() * 60, n: 3 + Math.floor(R() * 5), seed: R() * 100, dark: R() });
  // wall-top grass
  WORLD.topGrass = [];
  for (let x = -800; x < 2900; x += 8 + R() * 10) WORLD.topGrass.push({ x, h: 6 + R() * 16, lean: (R() - 0.5) * 0.8 });
  // stars
  WORLD.stars = [];
  for (let i = 0; i < 260; i++) WORLD.stars.push({ x: R() * W, y: Math.pow(R(), 1.4) * 760, r: 0.6 + Math.pow(R(), 3) * 2.2, tw: R() * TAU, sp: 0.5 + R() * 2 });
  // finale dandelions along wall foot
  WORLD.extraDands = [];
  const dx = [1010, 1120, 1205, 1290, 1420, 1505, 1600, 1700, 1785, 905, 1880, 1560, 1150];
  dx.forEach((x, i) => WORLD.extraDands.push({ x: x + (R() - 0.5) * 30, y: GROUND_Y + 4 + R() * 26, s: 0.068 + R() * 0.03, t: i * 0.22 + R() * 0.3, lean: (R() - 0.5) * 0.3 }));
  WORLD.extraDands.sort((a, b) => a.y - b.y);
  // pole positions (layer 0.65)
  WORLD.poles = [-450, 260, 980, 1700, 2420];
}

// --------- sky ---------
function drawSky(ctx, env, t, o = {}) {
  resetT(ctx);
  const hy = o.horizon || 760, sh = o.shift || 0;
  const g = ctx.createLinearGradient(0, -200 + sh, 0, hy + sh);
  g.addColorStop(0, rgb(env.skyTop)); g.addColorStop(0.55, rgb(env.skyMid)); g.addColorStop(1, rgb(env.skyBot));
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  // stars
  if (env.stars > 0.01) {
    for (const s of WORLD.stars) {
      const a = env.stars * (0.55 + 0.45 * Math.sin(t * s.sp + s.tw)) * (1 - s.y / 900);
      ctx.globalAlpha = clamp(a);
      ctx.fillStyle = '#fffbea';
      ctx.beginPath(); ctx.arc(s.x, s.y + (o.starShift || 0), s.r, 0, TAU); ctx.fill();
      if (s.r > 2) { ctx.globalAlpha = clamp(a) * 0.35; ctx.drawImage(SPR.glowW, s.x - 10, s.y - 10 + (o.starShift || 0), 20, 20); }
    }
    ctx.globalAlpha = 1;
  }
  // moon
  if (o.moon) {
    const [mx, my, mr, ma] = o.moon;
    ctx.globalAlpha = ma * 0.5; ctx.drawImage(SPR.glowW, mx - mr * 6, my - mr * 6, mr * 12, mr * 12);
    ctx.globalAlpha = ma;
    ctx.fillStyle = '#fbf6e4'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(200,205,220,0.35)';
    ctx.beginPath(); circlePath(ctx, mx - mr * 0.3, my - mr * 0.2, mr * 0.22); circlePath(ctx, mx + mr * 0.25, my + mr * 0.25, mr * 0.15); circlePath(ctx, mx + mr * 0.35, my - mr * 0.35, mr * 0.1); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // sun
  if (o.sun) {
    const [sx, sy, sr, sa] = o.sun;
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = sa * 0.7; ctx.drawImage(SPR.glowWarm, sx - sr * 9, sy - sr * 9, sr * 18, sr * 18);
    ctx.globalAlpha = sa; ctx.drawImage(SPR.glowW, sx - sr * 2.4, sy - sr * 2.4, sr * 4.8, sr * 4.8);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = rgba(env.sun, sa); ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawClouds(ctx, env, t, cam, o = {}) {
  const drift = (o.cloudSpeed == null ? 6 : o.cloudSpeed) * t + (o.cloudOffset || 0);
  camT(ctx, cam, 0.06);
  for (const c of WORLD.clouds) {
    let x = c.x + drift; x = ((x + 900) % 3600 + 3600) % 3600 - 900;
    const y = c.y + (o.cloudY || 0);
    const bottom = y + 10 * c.s;
    ctx.save();
    ctx.beginPath(); ctx.rect(x - 600, y - 600, 1200, 600 + 10 * c.s); ctx.clip();
    const P = new Path2D();
    for (const [dx, dy, r] of c.circ) { P.moveTo(x + dx + r, y + dy); P.arc(x + dx, y + dy, r, 0, TAU); }
    ctx.fillStyle = rgba(env.cloudSh, o.cloudAlpha == null ? 1 : o.cloudAlpha); ctx.fill(P);
    const P2 = new Path2D();
    for (const [dx, dy, r] of c.circ) { const rr = r * 0.9; P2.moveTo(x + dx - r * 0.12 + rr, y + dy - r * 0.18); P2.arc(x + dx - r * 0.12, y + dy - r * 0.18, rr, 0, TAU); }
    ctx.fillStyle = rgba(env.cloud, o.cloudAlpha == null ? 1 : o.cloudAlpha); ctx.fill(P2);
    const P3 = new Path2D();
    for (const [dx, dy, r] of c.circ) { const rr = r * 0.45; if (dy > -60 * c.s) continue; P3.moveTo(x + dx - r * 0.3 + rr, y + dy - r * 0.35); P3.arc(x + dx - r * 0.3, y + dy - r * 0.35, rr, 0, TAU); }
    ctx.fillStyle = rgba(mixc(env.cloud, [255, 255, 255], 0.5), 0.6 * (o.cloudAlpha == null ? 1 : o.cloudAlpha)); ctx.fill(P3);
    ctx.restore();
  }
}

// big summer cumulonimbus on horizon
function drawThunderhead(ctx, env, t, cam, amt, x0 = 1550) {
  if (amt <= 0) return;
  camT(ctx, cam, 0.08);
  const R = mulberry32(5);
  const P = new Path2D(), P2 = new Path2D();
  const base = 690, hgt = 640 * amt;
  for (let i = 0; i < 34; i++) {
    const u = R(), v = R();
    const y = base - u * hgt; const w = (1 - u * 0.5) * 420;
    const x = x0 + (v - 0.5) * w * 2;
    const r = 60 + (1 - u) * 70 + R() * 30;
    P.moveTo(x + r, y); P.arc(x, y, r, 0, TAU);
    P2.moveTo(x - r * 0.15 + r * 0.85, y - r * 0.15); P2.arc(x - r * 0.15, y - r * 0.15, r * 0.85, 0, TAU);
  }
  ctx.save(); ctx.beginPath(); ctx.rect(0, -400, 3600, base + 400); ctx.clip();
  ctx.fillStyle = rgb(env.cloudSh); ctx.fill(P);
  ctx.fillStyle = rgb(env.cloud); ctx.fill(P2);
  ctx.restore();
}

function drawMountains(ctx, env, cam) {
  const cols = [hex('#6f9fb3'), hex('#5f9a98')];
  for (let L = 0; L < 2; L++) {
    camT(ctx, cam, L ? 0.2 : 0.12);
    const pts = WORLD.mtn[L];
    ctx.beginPath(); ctx.moveTo(pts[0][0], 900);
    for (const [x, y] of pts) ctx.lineTo(x, y);
    ctx.lineTo(pts[pts.length - 1][0], 900); ctx.closePath();
    ctx.fillStyle = rgb(lit(env, cols[L], L ? 0.42 : 0.6));
    ctx.fill();
  }
}

function drawTown(ctx, env, t, cam, o = {}) {
  camT(ctx, cam, 0.32);
  const fogD = 0.38;
  // ground band
  ctx.fillStyle = rgb(lit(env, hex('#7fae8c'), 0.45));
  ctx.fillRect(-1500, 700, 5000, 300);
  // houses
  for (const h of WORLD.houses) {
    const wall = lit(env, h.wall, fogD), roof = lit(env, h.roof, fogD);
    const bx = h.x, by = h.y;
    ctx.fillStyle = rgb(wall); ctx.fillRect(bx, by - h.h, h.w, h.h + 20);
    ctx.fillStyle = rgb(roof);
    ctx.beginPath();
    if (h.flat) { ctx.rect(bx - 3, by - h.h - 6, h.w + 6, 7); }
    else { ctx.moveTo(bx - 6, by - h.h + 2); ctx.lineTo(bx + h.w * 0.5, by - h.h - h.w * 0.32); ctx.lineTo(bx + h.w + 6, by - h.h + 2); ctx.closePath(); }
    ctx.fill();
    // windows
    const lightOn = env.night > 0.5 && h.win < 0.6;
    ctx.fillStyle = lightOn ? rgba(hex('#ffd98f'), 0.85 * env.night) : rgba(lit(env, hex('#5d7280'), fogD), 0.8);
    const nw = Math.max(1, Math.floor(h.w / 26));
    for (let i = 0; i < nw; i++) ctx.fillRect(bx + 8 + i * 24, by - h.h + 8, 10, 9);
  }
  // school
  const sx = 170, sw = 560, sy = 712, sh = 120;
  const sw1 = lit(env, hex('#f1ede4'), fogD);
  ctx.fillStyle = rgb(sw1); ctx.fillRect(sx, sy - sh, sw, sh + 20);
  ctx.fillStyle = rgb(lit(env, hex('#e5e0d6'), fogD)); ctx.fillRect(sx + 220, sy - sh - 34, 120, 36);
  ctx.fillStyle = rgb(lit(env, hex('#9fb6bb'), fogD));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 16; c++) ctx.fillRect(sx + 14 + c * 34, sy - sh + 14 + r * 34, 22, 18);
  if (env.night > 0.4) { ctx.fillStyle = rgba(hex('#ffe3a3'), 0.7 * env.night); ctx.fillRect(sx + 14 + 3 * 34, sy - sh + 14 + 34, 22, 18); }
  // clock
  const cx = sx + 280, cy = sy - sh - 16, cr = 14;
  ctx.fillStyle = rgb(lit(env, hex('#ffffff'), fogD * 0.8)); ctx.beginPath(); ctx.arc(cx, cy, cr, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgb(lit(env, hex('#3d4a5a'), fogD)); ctx.lineWidth = 2; ctx.stroke();
  const clk = o.clock != null ? o.clock : 8.2 + t / 3600;
  const ha = (clk % 12) / 12 * TAU - Math.PI / 2, ma = (clk % 1) * TAU - Math.PI / 2;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * cr * 0.55, cy + Math.sin(ha) * cr * 0.55); ctx.stroke();
  ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ma) * cr * 0.85, cy + Math.sin(ma) * cr * 0.85); ctx.stroke();
  // trees in town (round blobs)
  const R = mulberry32(4);
  for (let i = 0; i < 30; i++) {
    const x = -600 + R() * 3300, y = 712 + R() * 6, r = 14 + R() * 18;
    const pink = R() < 0.3 && o.season != null && pinkness(o.season) > 0.5;
    ctx.fillStyle = rgb(lit(env, pink ? hex('#efc3cf') : hex('#5f9b7c'), fogD));
    ctx.beginPath(); circlePath(ctx, x, y - r * 0.6, r); circlePath(ctx, x + r * 0.7, y - r * 0.3, r * 0.7); ctx.fill();
  }
  // field/hedge band in front of town
  camT(ctx, cam, 0.5);
  ctx.fillStyle = rgb(lit(env, hex('#6a9f7e'), 0.3));
  ctx.beginPath(); ctx.moveTo(-1500, 712);
  for (let x = -1500; x <= 3500; x += 40) ctx.lineTo(x, 708 + Math.sin(x * 0.05) * 3 + noise1(x * 0.02) * 4);
  ctx.lineTo(3500, 900); ctx.lineTo(-1500, 900); ctx.closePath(); ctx.fill();
}

function drawPoles(ctx, env, t, cam) {
  camT(ctx, cam, 0.65);
  const col = lit(env, hex('#4c5666'), 0.2);
  const top = 150, base = 760;
  ctx.strokeStyle = rgb(mixc(col, [0, 0, 0], 0.2)); ctx.lineWidth = 2;
  // wires
  const ps = WORLD.poles;
  for (let i = 0; i < ps.length - 1; i++) {
    for (let k = 0; k < 3; k++) {
      const y = top + 12 + k * 22; const x0 = ps[i] + (k - 1) * 30, x1 = ps[i + 1] + (k - 1) * 30;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo((x0 + x1) / 2, y + 70 + k * 6, x1, y); ctx.stroke();
    }
  }
  ctx.fillStyle = rgb(col);
  for (const x of ps) {
    ctx.beginPath(); ctx.moveTo(x - 9, base); ctx.lineTo(x - 6, top); ctx.lineTo(x + 6, top); ctx.lineTo(x + 9, base); ctx.closePath(); ctx.fill();
    ctx.fillRect(x - 48, top + 8, 96, 7);
    ctx.fillRect(x - 36, top + 30, 72, 6);
    // transformer
    ctx.fillRect(x + 8, top + 70, 22, 34);
    // rungs
    for (let y = top + 140; y < base - 120; y += 34) ctx.fillRect(x - 13, y, 26, 3);
    // yellow-black stripe guard
    ctx.fillStyle = rgb(lit(env, hex('#e1c25a'), 0.2)); ctx.fillRect(x - 10, base - 90, 20, 50); ctx.fillStyle = rgb(col);
  }
}

function drawWall(ctx, env, t, cam, o = {}) {
  camT(ctx, cam, 1);
  const top = 700, bot = GROUND_Y;
  // embankment top grass + mortar base
  ctx.fillStyle = rgb(lit(env, hex('#6b6e72'))); ctx.fillRect(-900, top, 3800, bot - top + 2);
  const groups = [[], [], []];
  for (const s of WORLD.stones) groups[Math.floor(s.tone * 3)].push(s);
  const scols = [hex('#b9b3a8'), hex('#a7a49d'), hex('#c7c1b4')];
  const wet = o.wet || 0;
  groups.forEach((g, i) => {
    let c = lit(env, scols[i]);
    if (wet) c = mixc(c, scalec(c, 0.7), wet);
    ctx.fillStyle = rgb(c);
    ctx.beginPath();
    for (const s of g) { ctx.roundRect(s.x, s.y, s.w, s.h, 6); }
    ctx.fill();
  });
  // stone highlights (top edges)
  ctx.fillStyle = rgba(lit(env, hex('#e6e1d6')), 0.6);
  ctx.beginPath(); for (const s of WORLD.stones) ctx.roundRect(s.x + 3, s.y + 2, s.w - 6, 4, 2); ctx.fill();
  // moss
  ctx.fillStyle = rgba(lit(env, hex('#7aa36a')), 0.75);
  ctx.beginPath(); for (const s of WORLD.stones) if (s.moss) { ell(ctx, s.x + s.w * 0.3, s.y + s.h * 0.75, s.w * 0.35, 5, 0); } ctx.fill();
  // shadow under the canopy on wall
  const sh = ctx.createLinearGradient(0, top, 0, bot);
  sh.addColorStop(0, rgba([20, 30, 50], 0.25)); sh.addColorStop(1, rgba([20, 30, 50], 0.05));
  ctx.fillStyle = sh; ctx.fillRect(-900, top, 3800, bot - top);
  // grass on top
  const gc = lit(env, o.snowGround ? hex('#eef3f6') : hex('#6fae7d'));
  ctx.fillStyle = rgb(gc); ctx.fillRect(-900, top - 8, 3800, 12);
  ctx.strokeStyle = rgb(gc); ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath();
  for (const g of WORLD.topGrass) { ctx.moveTo(g.x, top - 4); ctx.lineTo(g.x + g.lean * g.h + Math.sin(t * 2 + g.x) * 1.5, top - 4 - g.h); }
  ctx.stroke();
}

function drawRoad(ctx, env, t, cam, o = {}) {
  camT(ctx, cam, 1);
  // green pedestrian strip
  const wet = o.wet || 0;
  ctx.fillStyle = rgb(lit(env, mixc(hex('#5f9f88'), hex('#3f6f60'), wet * 0.5))); ctx.fillRect(-900, ROAD_TOP, 3800, 36);
  // asphalt
  const asp = WORLD.asphalt;
  ctx.save();
  ctx.beginPath(); ctx.rect(-900, ROAD_TOP + 36, 3800, ROAD_BOT - ROAD_TOP - 36); ctx.clip();
  for (let x = -900; x < 2900; x += asp.width) ctx.drawImage(asp, x, ROAD_TOP + 36);
  // lighting multiply via overlay colour
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = rgb(mixc(env.light, scalec(env.light, 0.55), wet * 0.6));
  ctx.fillRect(-900, ROAD_TOP + 36, 3800, 200);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
  // white line
  const wl = lit(env, hex('#f3f1ea'));
  ctx.fillStyle = rgb(wl); ctx.fillRect(-900, ROAD_TOP + 36, 3800, 6);
  // 通学路 marking (on asphalt, viewed obliquely)
  ctx.save();
  ctx.translate(430, 948); ctx.scale(1.25, 0.42);
  ctx.font = '900 92px "Noto Sans CJK SC"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = rgba(wl, 0.82);
  ctx.fillText('通 学 路', 0, 0);
  ctx.restore();
  // gutter + curb near side
  ctx.fillStyle = rgb(lit(env, hex('#b8bcbc'))); ctx.fillRect(-900, ROAD_BOT, 3800, 22);
  ctx.fillStyle = rgb(lit(env, hex('#9da3a5'))); ctx.fillRect(-900, ROAD_BOT, 3800, 4);
  // near verge
  ctx.fillStyle = rgb(lit(env, o.snowGround ? hex('#e8eef2') : hex('#5d9a72'))); ctx.fillRect(-900, ROAD_BOT + 22, 3800, 200);
  // tree shadow on road (day)
  if (o.treeShadow) {
    ctx.save(); ctx.globalAlpha = o.treeShadow;
    ctx.fillStyle = 'rgba(30,45,70,0.13)';
    ctx.beginPath(); ctx.ellipse(TREE_X + 120, 905, 640, 62, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // petals on the ground
  const gp = o.groundPetals || 0;
  if (gp > 0) {
    const cols = [hex('#f6cdd8'), hex('#fbe4ea'), hex('#efb6c6')].map(c => lit(env, c));
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = rgb(cols[k]); ctx.beginPath();
      for (const p of WORLD.groundPetals) if (p.c === k && p.th < gp) ell(ctx, p.x, p.y, p.r, p.r * 0.45, p.a);
      ctx.fill();
    }
  }
  // snow on ground
  if (o.snowGround) {
    ctx.fillStyle = rgba(lit(env, hex('#f4f8fb')), 0.85 * o.snowGround);
    ctx.fillRect(-900, ROAD_TOP, 3800, 36);
    ctx.beginPath();
    for (let x = -900; x < 2900; x += 60) ell(ctx, x + 30, ROAD_TOP + 50 + Math.sin(x) * 6, 50, 10, 0);
    ctx.fill();
  }
  // puddles
  if (o.puddles) drawPuddles(ctx, env, t, o);
}

function drawPuddles(ctx, env, t, o) {
  const pud = [[560, 925, 170, 20], [1500, 965, 240, 26], [1060, 880, 110, 12], [2050, 940, 150, 18]];
  for (const [x, y, rx, ry] of pud) {
    ctx.save();
    ctx.globalAlpha = o.puddles;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.clip();
    const g = ctx.createLinearGradient(0, y - ry, 0, y + ry);
    g.addColorStop(0, rgb(mixc(env.skyBot, env.skyMid, 0.5))); g.addColorStop(1, rgb(env.skyTop));
    ctx.fillStyle = g; ctx.fillRect(x - rx, y - ry, rx * 2, ry * 2);
    // reflection of canopy (pink smear)
    if (o.puddleCanopy) { ctx.fillStyle = rgba(lit(env, hex('#f3c6d2')), 0.5 * o.puddleCanopy); ctx.fillRect(x - rx, y - ry, rx * 2, ry * 0.8); }
    if (o.lamp > 0 && Math.abs(x - 720) < 300) { ctx.globalAlpha = o.puddles * o.lamp; ctx.drawImage(SPR.glowGold, 720 - 30 - (720 - x) * 0.3, y - 30, 60, 60); }
    // star reflections
    if (env.stars > 0.3) { ctx.fillStyle = 'rgba(255,250,230,0.8)'; for (let i = 0; i < 8; i++) { ctx.fillRect(x - rx + hash1(i + x) * rx * 2, y - ry + hash1(i * 3 + y) * ry * 2, 2, 1.4); } }
    // ripples
    if (o.rain > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) {
        const ph = fract(t * 1.3 + hash1(i * 7 + x)); const px = x - rx * 0.8 + hash1(i * 13 + x + Math.floor(t * 1.3 + hash1(i * 7 + x))) * rx * 1.6;
        ctx.globalAlpha = o.puddles * (1 - ph) * o.rain;
        ctx.beginPath(); ctx.ellipse(px, y, 4 + ph * 30, (4 + ph * 30) * 0.18, 0, 0, TAU); ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function drawLamp(ctx, env, t, cam, o = {}) {
  camT(ctx, cam, 1);
  const x = 700, base = GROUND_Y + 4, top = 330;
  const col = lit(env, hex('#55606e'));
  ctx.fillStyle = rgb(col);
  ctx.fillRect(x - 6, top, 12, base - top);
  ctx.strokeStyle = rgb(col); ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, top + 10); ctx.quadraticCurveTo(x + 4, top - 30, x + 60, top - 26); ctx.stroke();
  ctx.fillStyle = rgb(lit(env, hex('#3f4855')));
  ctx.beginPath(); ctx.roundRect(x + 44, top - 34, 66, 16, 6); ctx.fill();
  const on = o.lamp || 0;
  ctx.fillStyle = on > 0 ? rgba(hex('#fff2c8'), 0.4 + 0.6 * on) : rgb(lit(env, hex('#dfe5e8')));
  ctx.fillRect(x + 50, top - 20, 54, 5);
  // curve mirror
  const mx = 1890, my = 440;
  ctx.fillStyle = rgb(lit(env, hex('#e8743b'))); ctx.fillRect(mx - 5, my, 10, base - my);
  ctx.beginPath(); ctx.arc(mx, my, 62, 0, TAU); ctx.fill();
  const mg = ctx.createLinearGradient(mx - 50, my - 50, mx + 50, my + 50);
  mg.addColorStop(0, rgb(mixc(env.skyBot, [255, 255, 255], 0.3))); mg.addColorStop(0.6, rgb(env.skyMid)); mg.addColorStop(1, rgb(lit(env, hex('#7d8790'))));
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, 52, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(mx - 18, my - 20, 18, 9, -0.7, 0, TAU); ctx.fill();
  // pink blur reflection of tree in mirror
  ctx.fillStyle = rgba(lit(env, hex('#f6cbd6')), 0.55 * (o.mirrorPink == null ? 1 : o.mirrorPink)); ctx.beginPath(); ctx.arc(mx - 10, my - 8, 34, Math.PI * 0.9, Math.PI * 1.9); ctx.fill();
}

function drawLampGlow(ctx, env, t, cam, on) {
  if (on <= 0) return;
  camT(ctx, cam, 1);
  const x = 777, y = 312;
  ctx.globalCompositeOperation = 'screen';
  // cone
  const g = ctx.createLinearGradient(0, y, 0, GROUND_Y + 160);
  g.addColorStop(0, rgba(hex('#ffe3a6'), 0.42 * on)); g.addColorStop(1, rgba(hex('#ffe3a6'), 0.05 * on));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - 24, y); ctx.lineTo(x + 24, y); ctx.lineTo(x + 330, GROUND_Y + 170); ctx.lineTo(x - 330, GROUND_Y + 170); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = on * 0.9; ctx.drawImage(SPR.glowWarm, x - 180, y - 180, 360, 360);
  ctx.globalAlpha = on * 0.55; ctx.drawImage(SPR.glowWarm, x - 380, GROUND_Y + 110 - 110, 760, 220);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

function drawForeground(ctx, env, t, cam, o = {}) {
  camT(ctx, cam, 1.3);
  const col = lit(env, o.snowGround ? hex('#dfe8ee') : hex('#3f7a5c'));
  const col2 = lit(env, o.snowGround ? hex('#f3f7fa') : hex('#579a6e'));
  ctx.lineCap = 'round';
  for (const tf of WORLD.tufts) {
    const by = H + 30;
    for (let i = 0; i < tf.n; i++) {
      const a = (i / (tf.n - 1) - 0.5) * 0.9 + Math.sin(t * 1.6 + tf.seed + i) * 0.06 * (1 + (o.windK || 0));
      ctx.strokeStyle = rgb(i % 2 ? col : col2); ctx.lineWidth = 5;
      const h = tf.h * (0.7 + 0.3 * hash1(tf.seed + i));
      ctx.beginPath(); ctx.moveTo(tf.x + i * 4, by); ctx.quadraticCurveTo(tf.x + i * 4 + a * h * 0.4, by - h * 0.6, tf.x + i * 4 + a * h, by - h); ctx.stroke();
    }
  }
}

// ---------- particles ----------
// generic wrapping field of tumbling petals in screen space
function petalField(ctx, t, o) {
  const n = Math.floor(o.n || 60);
  const R = o.seed || 1;
  const area = o.area || [-220, -220, W + 220, H + 220];
  const aw = area[2] - area[0], ah = area[3] - area[1];
  const sprites = o.sprites || SPR.petals;
  const tint = o.tint;
  const tgt = tint ? LAYERX : ctx;
  if (tint) { LAYERX.setTransform(1, 0, 0, 1, 0, 0); LAYERX.clearRect(0, 0, W, H); }
  for (let i = 0; i < n; i++) {
    const h1 = hash2(i, R), h2 = hash2(i + 17, R), h3 = hash2(i + 41, R), h4 = hash2(i + 83, R);
    const z = lerp(o.zMin == null ? 0 : o.zMin, o.zMax == null ? 1 : o.zMax, h3);
    const sp = lerp(0.45, 1.5, z);
    const size = lerp(o.sMin || 10, o.sMax || 36, z * z);
    const tt = t + h4 * 50;
    let x = area[0] + h1 * aw + ((o.vx || 60) * sp * t) + Math.sin(tt * (0.7 + h2) + i) * (o.sway || 30) + (o.burstX || 0) * sp;
    let y = area[1] + h2 * ah + ((o.vy || 40) * sp * t) + Math.sin(tt * (0.9 + h1) * 1.3) * (o.sway || 30) * 0.5 + (o.burstY || 0) * sp;
    x = area[0] + (((x - area[0]) % aw) + aw) % aw;
    y = area[1] + (((y - area[1]) % ah) + ah) % ah;
    const rot = tt * (0.6 + h3 * 1.6) * (h1 < 0.5 ? -1 : 1);
    const flip = tt * (1.4 + h2 * 2.5);
    let img;
    const bb = o.blurBig || SPR.petalsBlurBig, bm = o.blurMid || SPR.petalsBlur;
    if (z > 0.88 && o.blurNear !== false) img = bb[i % bb.length];
    else if (z > 0.72 && o.blurNear !== false) img = bm[i % bm.length];
    else img = sprites[i % sprites.length];
    const a = (o.alpha == null ? 1 : o.alpha) * lerp(0.55, 1, z);
    drawTumble(tgt, img, x, y, size, rot, flip, a);
  }
  tgt.globalAlpha = 1; resetT(tgt);
  if (tint) finishTint(ctx, tint);
}
function finishTint(ctx, tint) {
  LAYERX.setTransform(1, 0, 0, 1, 0, 0);
  LAYERX.globalCompositeOperation = 'source-atop';
  LAYERX.fillStyle = rgba(tint[0], tint[1]); LAYERX.fillRect(0, 0, W, H);
  LAYERX.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(LAYER, 0, 0);
  resetT(ctx);
}
function envTint(env, extra = 0) {
  const b = (env.light[0] + env.light[1] + env.light[2]) / 765;
  const k = clamp((1 - b) * 0.9 + extra);
  if (k < 0.03) return null;
  return [mulc(env.light, [235, 225, 240]), k];
}

// petals falling from the tree canopy (world space -> screen)
function treePetals(ctx, env, t, cam, o) {
  const tree = WORLD.tree, n = Math.floor(o.n || 80);
  const topts = { x: TREE_X, y: TREE_Y, scale: o.treeScale || 1, wind: o.wind };
  const tint = envTint(env, o.tintExtra || 0);
  const tgt = tint ? LAYERX : ctx;
  if (tint) { LAYERX.setTransform(1, 0, 0, 1, 0, 0); LAYERX.clearRect(0, 0, W, H); }
  const nc = tree.clusters.length;
  const wx = (o.wind ? o.wind.x : 0.3);
  for (let i = 0; i < n; i++) {
    const P = 6 + hash1(i * 3.1) * 5;
    const ph = hash1(i * 7.7) * P;
    const cyc = Math.floor((t + ph) / P), a = (t + ph) - cyc * P;
    const ci = Math.floor(hash2(i, cyc) * nc);
    const c = tree.clusters[ci];
    const ox = TREE_X + c.x + (hash2(i + 5, cyc) - 0.5) * c.r, oy = TREE_Y + c.y + (hash2(i + 9, cyc) - 0.5) * c.r * 0.6;
    const fall = 55 + hash1(i * 1.3) * 35;
    let x = ox + wx * 110 * a + Math.sin(a * 1.6 + i) * 26 + a * 18;
    let y = oy + fall * a + Math.sin(a * 2.3 + i * 1.7) * 10;
    const groundY = ROAD_TOP + 10 + hash1(i * 5.3) * (ROAD_BOT - ROAD_TOP);
    let landed = 0;
    if (y > groundY) { const al = (groundY - oy) / fall; x = ox + wx * 110 * al + Math.sin(al * 1.6 + i) * 26 + al * 18; y = groundY; landed = a - al; }
    const [sx, sy, zp] = camPoint(cam, 1, x, y);
    if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) continue;
    const alpha = smooth(0, 0.6, a) * (1 - smooth(P - 1.2, P, a)) * (o.alpha == null ? 1 : o.alpha);
    const size = (14 + hash1(i * 2.9) * 10) * zp * (o.size || 1);
    const rot = landed > 0 ? i : a * (1 + hash1(i)) * 2 + i, flip = landed > 0 ? 1.2 : a * 3 + i;
    drawTumble(tgt, SPR.petals[i % 4], sx, sy, size, rot, flip, alpha);
  }
  tgt.globalAlpha = 1; resetT(tgt);
  if (tint) finishTint(ctx, tint);
}

function rainField(ctx, t, amt, o = {}) {
  if (amt <= 0) return;
  resetT(ctx);
  ctx.strokeStyle = `rgba(210,225,240,${0.35 * amt})`; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  ctx.beginPath();
  const n = Math.floor(260 * amt), slant = o.slant || 0.25;
  for (let i = 0; i < n; i++) {
    const h1 = hash1(i * 1.7), h2 = hash1(i * 3.3), z = hash1(i * 5.1);
    const sp = 1400 + z * 900, len = 30 + z * 50;
    const y = ((h2 * (H + 200) + t * sp) % (H + 200)) - 100;
    const x = ((h1 * (W + 400) + y * slant) % (W + 400)) - 200;
    ctx.moveTo(x, y); ctx.lineTo(x + len * slant, y + len);
  }
  ctx.stroke();
}

function snowField(ctx, t, amt, o = {}) {
  if (amt <= 0) return;
  resetT(ctx);
  const n = Math.floor(220 * amt);
  for (let i = 0; i < n; i++) {
    const h1 = hash1(i * 1.9), h2 = hash1(i * 2.7), z = hash1(i * 4.3);
    const sp = 40 + z * 90, sz = 3 + z * z * 16;
    const y = ((h2 * (H + 100) + t * sp) % (H + 100)) - 50;
    const x = ((h1 * (W + 200) + Math.sin(t * 0.8 + i) * 30 + t * (o.vx || 15) * (0.5 + z)) % (W + 200) + W + 200) % (W + 200) - 100;
    ctx.globalAlpha = (0.5 + 0.5 * z) * clamp(amt * 1.5);
    const img = z > 0.8 ? SPR.snowBlur : SPR.snow;
    ctx.drawImage(img, x - sz, y - sz, sz * 2, sz * 2);
  }
  ctx.globalAlpha = 1;
}

function sparkField(ctx, t, amt, o = {}) {
  if (amt <= 0) return;
  resetT(ctx);
  ctx.globalCompositeOperation = 'screen';
  const n = Math.floor((o.n || 50) * amt);
  for (let i = 0; i < n; i++) {
    const h1 = hash1(i * 2.1 + 3), h2 = hash1(i * 3.9 + 1), z = hash1(i * 6.1);
    const x = (h1 * W + Math.sin(t * 0.4 + i) * 60 + t * (o.vx || 6)) % W;
    const y = ((h2 * H - t * (12 + z * 20)) % H + H) % H;
    const fl = 0.5 + 0.5 * Math.sin(t * (2 + z * 3) + i);
    const s = (10 + z * 34) * (0.6 + 0.4 * fl);
    ctx.globalAlpha = amt * fl * (0.4 + 0.6 * z);
    ctx.drawImage(o.img || SPR.glowGold, x - s, y - s, s * 2, s * 2);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

function godRays(ctx, x, y, amt, t, col = [255, 236, 200]) {
  if (amt <= 0) return;
  resetT(ctx);
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 9; i++) {
    const a = 0.35 + i * 0.27 + Math.sin(t * 0.2 + i) * 0.04;
    const w = 0.035 + hash1(i * 3) * 0.05;
    const L = 2600;
    const g = ctx.createRadialGradient(x, y, 0, x, y, L);
    g.addColorStop(0, rgba(col, 0.28 * amt)); g.addColorStop(0.6, rgba(col, 0.06 * amt)); g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a - w) * L, y + Math.sin(a - w) * L); ctx.lineTo(x + Math.cos(a + w) * L, y + Math.sin(a + w) * L); ctx.closePath(); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------- the full wide scene ----------
// o: env, cam, s(season), wind, dand (stage), lamp, rain, snow, puddles, petals, groundPetals, glow ...
function drawWorld(ctx, t, o) {
  const env = o.env, cam = o.cam || { x: 0, y: 0, z: 1 };
  const wind = o.wind || { x: 0.3, gust: 0.25 };
  drawSky(ctx, env, t, { moon: o.moon, sun: o.sun, starShift: o.starShift == null ? -cam.y * 0.08 : o.starShift, shift: -cam.y * 0.4 });
  if (o.sunRaysBehind) godRays(ctx, o.sun[0], o.sun[1], o.sunRaysBehind, t);
  drawThunderhead(ctx, env, t, cam, o.thunderhead || 0, o.thunderX);
  drawClouds(ctx, env, t, cam, { cloudSpeed: o.cloudSpeed, cloudOffset: o.cloudOffset, cloudAlpha: o.cloudAlpha });
  drawMountains(ctx, env, cam);
  drawTown(ctx, env, t, cam, { clock: o.clock, season: o.s });
  drawPoles(ctx, env, t, cam);
  drawWall(ctx, env, t, cam, { wet: o.wet, snowGround: o.snowGround });
  drawRoad(ctx, env, t, cam, o);
  // tree
  camT(ctx, cam, 1);
  if (o.treeGlow > 0) {
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = o.treeGlow * 0.7;
    ctx.drawImage(SPR.glowPink, TREE_X - 900, TREE_Y - 900, 1800, 1200);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  WORLD.tree.draw(ctx, env, t, { x: TREE_X, y: TREE_Y, scale: 1, s: o.s || 0, wind, snow: o.snow || 0, glow: o.treeGlow || 0, bloomMul: o.bloomMul });
  // dandelions
  camT(ctx, cam, 1);
  if (o.dand != null) {
    if (o.dandHalo) { ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.dandHalo; ctx.drawImage(SPR.glowGold, DAND_X - 60, DAND_Y - 95, 120, 120); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    drawDandelion(ctx, env, t, { x: DAND_X, y: DAND_Y, scale: 0.075, stage: o.dand, wind, seedsGone: o.seedsGone || 0, small: true, snow: o.snowGround });
  }
  if (o.extraDands) {
    for (const d of WORLD.extraDands) {
      const st = clamp((o.extraDands - d.t) * 1.2, 0, 1);
      if (st <= 0) continue;
      camT(ctx, cam, 1);
      drawDandelion(ctx, env, t, { x: d.x, y: d.y, scale: d.s * lerp(0.6, 1, st), stage: lerp(0.2, 1, st), wind, small: true, lean: d.lean });
    }
  }
  drawLamp(ctx, env, t, cam, { lamp: o.lamp || 0 });
  resetT(ctx);
  if (o.petals) treePetals(ctx, env, t, cam, { n: o.petals, wind });
  drawLampGlow(ctx, env, t, cam, o.lamp || 0);
  drawForeground(ctx, env, t, cam, { snowGround: o.snowGround, windK: wind.gust });
  resetT(ctx);
}
