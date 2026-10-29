// ---------- shot timeline ----------
const DCAM = (x, y) => ({ x: x - W / 2, y: y - H / 2 }); // centre camera on world point

function dayCycleEnv(p) {
  return envAt([[0, 'morning'], [0.22, 'day'], [0.45, 'sunset'], [0.58, 'night'], [0.86, 'night'], [0.94, 'dawn'], [1, 'morning']], fract(p));
}
function dayCycleSun(p) {
  const q = fract(p + 0.06) / 0.62; // 0..1 while sun up
  if (q > 1) return null;
  return [lerp(1850, 120, q), 700 - Math.sin(Math.PI * q) * 520, 46, Math.sin(Math.PI * q) * 0.9 + 0.1];
}

function wind(x, g) { return { x, gust: g }; }

// ---------------- A: night prologue ----------------
function shotA(ctx, t) {
  const env = mixEnv('night', 'moon', smooth(0, 4, t));
  const cam = { x: kf([[0, 230], [10.3, 160]], t), y: kf([[0, -30], [5.6, -70], [10.3, -560]], t), z: kf([[0, 1.32], [5.6, 1.42], [10.3, 1.18]], t) };
  const gust = smooth(5.3, 6.4, t);
  const wd = wind(lerp(0.12, 0.85, gust), lerp(0.12, 0.8, gust));
  drawWorld(ctx, t, { env, cam, s: 0.2, wind: wd, dand: 0.3, lamp: 1, petals: lerp(40, 140, gust), groundPetals: 0.6, moon: [430, 210, 46, 1], cloudAlpha: 0.6, cloudSpeed: 4 });
  // tears scattering: big stream of petals
  if (gust > 0) {
    const k = gust * (1 - smooth(9.4, 10.6, t));
    petalField(ctx, t, { n: 150 * k, seed: 5, vx: 420, vy: -60, zMin: 0, zMax: 1, sMin: 10, sMax: 54, sway: 60, tint: [hex('#6a74a8'), 0.35] });
  }
  sparkField(ctx, t, 0.35, { n: 30, img: SPR.glowPink, vx: 4 });
}

// ---------------- B: dawn reveal + title ----------------
function shotB(ctx, t) {
  const env = envAt([[10.3, 'night'], [12.6, 'dawn'], [16.2, 'morning'], [20.8, 'day']], t);
  const cy = kf([[10.3, -760], [15.2, -760], [20.8, 0]], t);
  const cam = { x: kf([[10.3, 0], [15.2, 0], [20.8, -250]], t), y: cy, z: kf([[10.3, 1.0], [20.8, 1.04]], t) };
  const sunY = lerp(760, 300, smooth(11.0, 19.5, t)) - cy * 0.12;
  const sun = [1520, sunY, 44, smooth(11.5, 13.5, t) * 0.95];
  const wd = wind(0.5, 0.4);
  drawWorld(ctx, t, { env, cam, s: 0.2, wind: wd, dand: lerp(0.3, 1, smooth(16, 20.5, t)), lamp: 1 - smooth(11.5, 13.5, t), petals: 110, groundPetals: 0.7, sun, sunRaysBehind: 0.45 * smooth(11.5, 14, t) * (1 - smooth(18, 21, t)), treeShadow: smooth(17, 20, t), cloudSpeed: 10 });
  const e = rmsAt(t);
  petalField(ctx, t, { n: 70 + 50 * e, seed: 9, vx: 160, vy: -10, zMin: 0, zMax: 1, sMin: 10, sMax: 48, sway: 50, tint: envTint(env) });
  godRays(ctx, sun[0], sun[1], 0.35 * smooth(12, 15, t) * (1 - smooth(19, 21, t)), t);
}

// ---------------- C: the school road ----------------
function shotC(ctx, t) {
  const env = ENV.day;
  const push = smooth(24.2, 25.9, t);
  const cam = { x: lerp(kf([[21, -250], [24.2, 60]], t), DAND_X - W / 2 + 30, easeInOut(push)), y: lerp(0, DAND_Y - H / 2 - 40, easeInOut(push)), z: lerp(kf([[21, 1.04], [24.2, 1.1]], t), 2.6, easeIn(push)) };
  drawWorld(ctx, t, { env, cam, s: 0.2, wind: wind(0.45, 0.35), dand: 1, dandHalo: 0.25 + 0.6 * push, petals: 120, groundPetals: 0.75, treeShadow: 1, cloudSpeed: 10 });
  petalField(ctx, t, { n: 60, seed: 13, vx: 150, vy: 10, zMin: 0.2, zMax: 1, sMin: 12, sMax: 50, sway: 50 });
}

// ---------------- D: macro — meeting you ----------------
function macroCamTo(t, o, z, ox = 0, oy = 0) {
  const [hx, hy] = dandHead(t, o);
  return { x: hx - W / 2 + ox, y: hy - H / 2 + oy, z };
}
function shotD(ctx, t) {
  const env = mixEnv('morning', 'day', 0.6);
  const o = { x: 1150, y: 1175, scale: 1.15, stage: kf([[25.8, 0.72], [28.5, 1]], t), wind: wind(0.12, 0.15) };
  let cam = { x: kf([[25.8, 40], [30.8, 0]], t), y: kf([[25.8, -60], [30.8, 0]], t), z: kf([[25.8, 1.18], [29, 1.0], [30.8, 1.04]], t) };
  const pin = smooth(30.86, 35.4, t);
  if (pin > 0) {
    const tgt = macroCamTo(t, o, 1, 0, 0);
    // target: dew drop on head (approx offset)
    const dropX = tgt.x + 120 * 0.46 * 1.15, dropY = tgt.y - 120 * 0.12 * 1.15;
    const e = easeInOut(pin);
    cam = { x: lerp(cam.x, dropX, e), y: lerp(cam.y, dropY, e), z: lerp(cam.z, 4.4, easeIn(pin) * 0.6 + e * 0.4) };
  }
  drawMacro(ctx, t, Object.assign({ env, cam, dew: smooth(29.2, 31.0, t), petals: 50, bokeh: 0.5, treeS: 0.2, sun: [300, 120, 500, 0.35] }, o));
}

// ---------------- E: diptych — alike ----------------
function shotE(ctx, t) {
  const env = mixEnv('sunset', 'day', 0.25);
  const k = easeOut((t - 35.64) / 0.9);
  const sw = wind(0.25, 0.3);
  // left: the lone tree
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, 956, H); ctx.clip();
  setView(new DOMMatrix([0.78, 0, 0, 0.78, -420 - (1 - k) * 300, 250]));
  drawWorld(ctx, t, { env, cam: { x: 40, y: -30, z: 0.95 }, s: 0.2, wind: sw, dand: 1, petals: 70, groundPetals: 0.8, treeShadow: 0.6, sun: [380, 520, 40, 0.8] });
  setView(null);
  ctx.restore();
  // right: the lone dandelion
  ctx.save();
  ctx.beginPath(); ctx.rect(964, 0, 956, H); ctx.clip();
  setView(new DOMMatrix([1, 0, 0, 1, 250 + (1 - k) * 300, 0]));
  drawMacro(ctx, t, { env, cam: { x: 30, y: 30, z: 1.05 }, x: 1150, y: 1175, scale: 1.15, stage: 1, wind: sw, petals: 30, bokeh: 0.4, treeS: 0.2 });
  setView(null);
  ctx.restore();
  resetT(ctx);
  ctx.fillStyle = 'rgba(255,248,238,0.9)'; ctx.fillRect(956, 0, 8, H);
}

// ---------------- F: pre-chorus — don't come, summer ----------------
function shotF(ctx, t) {
  const env = mixEnv('day', 'summer', smooth(40.7, 44, t));
  const push = smooth(43.4, 45.9, t);
  const base = { x: kf([[40.69, -150], [43.4, 0]], t), y: 0, z: kf([[40.69, 1.0], [43.4, 1.06]], t) };
  const cam = { x: lerp(base.x, DAND_X - W / 2 - 60, easeInOut(push)), y: lerp(0, DAND_Y - H / 2 - 120, easeInOut(push)), z: lerp(base.z, 2.4, easeInOut(push)) };
  drawWorld(ctx, t, { env, cam, s: 0.24, wind: wind(0.35, 0.3), dand: 1, dandHalo: 0.2 + 0.8 * push, petals: 100, groundPetals: 0.85, treeShadow: 1, thunderhead: smooth(40.7, 44.5, t) * 0.9, thunderX: 380, cloudSpeed: 14 });
  petalField(ctx, t, { n: 40, seed: 17, vx: 120, vy: 20, zMin: 0.3, zMax: 1, sMin: 12, sMax: 44 });
}

// ---------------- G: four seasons dyed in your colour ----------------
let PANEL, PANELX;
function shotG(ctx, t) {
  if (!PANEL) { PANEL = makeCanvas(960, 540); PANELX = PANEL.getContext('2d'); }
  const seasons = [
    { env: ENV.day, s: 0.2, dand: 1, petals: 60, gp: 0.8 },
    { env: ENV.summer, s: 1.0, dand: 3, petals: 0, thunder: 0.8 },
    { env: ENV.autumn, s: 2.15, dand: 1, petals: 0 },
    { env: ENV.winter, s: 3.22, dand: null, petals: 0, snow: 1 },
  ];
  const slide = easeOut((t - 45.75) / 0.6);
  for (let i = 0; i < 4; i++) {
    const S = seasons[i];
    const px = (i % 2) * 960, py = Math.floor(i / 2) * 540;
    PANELX.setTransform(1, 0, 0, 1, 0, 0); PANELX.clearRect(0, 0, 960, 540);
    setView(new DOMMatrix([0.5, 0, 0, 0.5, 0, 0]));
    const cam = { x: 100 + Math.sin(t * 0.3 + i) * 20, y: -20, z: 1.0 + (t - 45.75) * 0.015 };
    drawWorld(PANELX, t, { env: S.env, cam, s: S.s, wind: wind(0.3, 0.3), dand: S.dand, petals: S.petals, groundPetals: S.gp || 0, snow: S.snow || 0, snowGround: S.snow || 0, thunderhead: S.thunder || 0, thunderX: 380, cloudSpeed: 8 });
    if (S.snow) snowField(PANELX, t, 0.6, {});
    if (i === 2) petalField(PANELX, t, { n: 30, seed: 3, vx: 80, vy: 60, sprites: SPR.leafAutumn, blurNear: false, sMin: 14, sMax: 30 });
    setView(null);
    PANELX.setTransform(1, 0, 0, 1, 0, 0);
    // reveal
    const r = easeInOut(smooth(46.1 + i * 0.75, 48.3 + i * 0.75, t));
    const ox = px + (1 - slide) * (i % 2 ? 200 : -200) * 0;
    resetT(ctx);
    ctx.globalAlpha = slide;
    ctx.filter = 'grayscale(0.88) brightness(0.92) contrast(0.95)';
    ctx.drawImage(PANEL, ox, py);
    ctx.filter = 'none';
    if (r > 0) {
      const [dx, dy] = camPoint({ x: cam.x, y: cam.y, z: cam.z }, 1, DAND_X, DAND_Y - 20);
      const cx = ox + dx * 0.5, cy = py + dy * 0.5;
      const rad = r * 1150;
      ctx.save();
      ctx.beginPath(); ctx.rect(ox, py, 960, 540); ctx.clip();
      ctx.beginPath();
      for (let a = 0; a <= 64; a++) { const th = a / 64 * TAU; const rr = rad * (1 + 0.06 * Math.sin(th * 5 + t * 2 + i) + 0.04 * Math.sin(th * 9 - t)); a ? ctx.lineTo(cx + Math.cos(th) * rr, cy + Math.sin(th) * rr) : ctx.moveTo(cx + Math.cos(th) * rr, cy + Math.sin(th) * rr); }
      ctx.closePath(); ctx.clip();
      ctx.drawImage(PANEL, ox, py);
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(255,200,70,0.55)'; ctx.fillRect(ox, py, 960, 540);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.5 * (1 - r * 0.6);
      ctx.drawImage(SPR.glowGold, cx - rad, cy - rad, rad * 2, rad * 2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  resetT(ctx);
  ctx.fillStyle = 'rgba(255,248,238,0.92)'; ctx.fillRect(956, 0, 8, H); ctx.fillRect(0, 536, W, 8);
}

// ---------------- H: empty nights made vivid ----------------
function shotH(ctx, t) {
  const v = smooth(55.7, 57.2, t);
  const env = mixEnv(mixEnv('night', 'moon', 0.4), 'magic', v);
  const cam = { x: kf([[50.8, 120], [55.86, 190], [60.64, 140]], t), y: kf([[50.8, -10], [55.86, -40], [60.64, -170]], t), z: kf([[50.8, 1.1], [55.86, 1.2], [60.64, 1.02]], t) };
  drawWorld(ctx, t, { env, cam, s: 0.2, wind: wind(0.2, 0.25 + 0.3 * v), dand: 0.3, dandHalo: 0.7 * v, lamp: 1, petals: lerp(60, 150, v), groundPetals: 0.8, moon: [lerp(450, 520, v), lerp(230, 170, v), lerp(40, 70, v), 1], treeGlow: v, cloudAlpha: 0.5 * (1 - v) + 0.2 });
  if (v > 0) {
    petalField(ctx, t, { n: 70 * v, seed: 23, vx: 70, vy: -30, zMin: 0, zMax: 0.9, sMin: 10, sMax: 40, alpha: v });
    sparkField(ctx, t, v, { n: 70 });
    sparkField(ctx, t + 3, v * 0.7, { n: 40, img: SPR.glowPink, vx: -5 });
  }
}

// ---------------- I: "see you again" at night -> sunrise ----------------
function shotI(ctx, t) {
  const env = envAt([[60.6, 'moon'], [65.9, 'moon'], [67.6, 'dawn'], [70.7, 'morning']], t);
  const open = kf([[60.6, 0.32], [65.9, 0.32], [69.2, 1.0]], t);
  const nodAmp = (1 - smooth(65, 66, t));
  const nod = (beatPulse(t) * 18 + Math.sin(t * 2.4) * 6) * nodAmp;
  const o = { x: 1150, y: 1175, scale: 1.15, stage: open, wind: wind(0.08, 0.12), nod };
  const cam = macroCamTo(t, o, kf([[60.6, 1.05], [65.7, 1.12], [70.7, 1.3]], t), -40, 60);
  cam.x = lerp(30, cam.x, 0.5); cam.y = lerp(20, cam.y, 0.5);
  const sunA = smooth(66, 68.5, t);
  const sun = [1480, kf([[66, 760], [70.7, 380]], t), 520, sunA * 0.85];
  drawMacro(ctx, t, Object.assign({ env, cam, petals: 26, bokeh: 0.3 + 0.2 * sunA, treeS: 0.2, sun, rays: sunA * 0.7, glow: 0.25 + 0.6 * sunA, sparks: (1 - sunA) * 0.4, groundPetals: 0.8 }, o));
}

// ---------------- J: let spring last forever ----------------
function shotJ(ctx, t) {
  const crane = smooth(75.6, 80.4, t);
  const seasonsK = smooth(76.0, 80.4, t);
  const s = 0.2 + seasonsK * 3.95;
  const env = mixEnv(ENV.day, ENV.gold, smooth(75.6, 77.5, t) * 0.75);
  const cam = { x: kf([[70.7, 440], [75.6, 400], [80.8, 220]], t), y: lerp(kf([[70.7, 70], [75.6, 50]], t), -620, easeInOut(crane)), z: lerp(kf([[70.7, 1.32], [75.6, 1.26]], t), 1.0, easeInOut(crane)) };
  const snow = smooth(2.7, 3.0, s) * (1 - smooth(3.35, 3.6, s));
  const talk = Math.sin(t * TAU / (BEAT * 2)) * 0.25;
  drawWorld(ctx, t, { env, cam, s, wind: wind(0.25 + talk, 0.35), dand: 1, dandHalo: 0.45, petals: 110 * (1 - seasonsK), groundPetals: 0.8, treeShadow: 1, snow, treeGlow: 0.25 * seasonsK, cloudSpeed: 12 });
  if (seasonsK > 0) {
    sparkField(ctx, t, seasonsK * 0.9, { n: 60 });
    const sk = ((s % 4) + 4) % 4;
    if (sk > 1.8 && sk < 2.9) petalField(ctx, t, { n: 50, seed: 4, vx: 100, vy: 90, sprites: SPR.leafAutumn, blurBig: SPR.leafAutumnBlur, blurMid: SPR.leafAutumn, sMin: 14, sMax: 40 });
    if (snow > 0) snowField(ctx, t, snow * 0.8);
  }
}

// ---------------- K: time-lapse instrumental ----------------
function shotK1(ctx, t) {
  const p = (t - 80.81) / (BEAT * 4) + 0.15;
  const env = dayCycleEnv(p);
  const sun = dayCycleSun(p);
  const q = fract(p);
  const cam = { x: kf([[80.8, -60], [86, 40]], t), y: -30, z: 0.97 };
  const s = kf([[80.8, 0.2], [86, 0.52]], t);
  const night = clamp(env.night);
  drawWorld(ctx, t, { env, cam, s, wind: wind(0.4, 0.4), dand: kf([[80.8, 1], [86, 1.85]], t), lamp: smooth(0.4, 0.55, q) * (1 - smooth(0.9, 0.97, q)), petals: 130, groundPetals: 0.95, sun: sun || undefined, moon: night > 0.5 ? [lerp(1600, 300, (q - 0.5) / 0.45), 220, 36, night] : undefined, cloudSpeed: 520, cloudOffset: 0, treeShadow: sun ? 0.8 : 0 });
  petalField(ctx, t, { n: 50, seed: 29, vx: 420, vy: 30, zMin: 0.3, zMax: 1, sMin: 12, sMax: 44, tint: envTint(env) });
}
function shotK2(ctx, t) {
  const p = (t - 85.86) / (BEAT * 4) + 0.2;
  const env = dayCycleEnv(p);
  drawClockScene(ctx, t, { env, clock: 7.5 + 9.5 * Math.pow(clamp((t - 85.6) / 5.6), 1.6), dayPhase: fract(p - 0.08) * 0.58 / 1 + 0, cam: { x: 0, y: 0, z: kf([[85.86, 1.0], [90.94, 1.25]], t) }, vx: 520 });
}

// ---------------- L: 止まれ — time won't stop ----------------
function shotL(ctx, t) {
  const p = (t - 90.94) / (BEAT * 4);
  drawStopScene(ctx, t, { env: ENV.day, pan: (t - 90.94) * 26, dayPhase: fract(p + 0.08) * 0.62, vx: 950, petals: 80, groundPetals: 0.7 });
}

// ---------------- M: petals letting go ----------------
function shotM(ctx, t) {
  const env = mixEnv('day', 'overcast', 0.35);
  drawBranchScene(ctx, t, { env, dropT0: 96.3, dropT1: 100.5, leaf: smooth(96, 100.6, t), cam: { x: kf([[96, -20], [100.8, 30]], t), y: 0, z: kf([[96, 1.0], [100.8, 1.08]], t) }, treeS: 0.45 });
}

// ---------------- N: the dandelion clock, grey day ----------------
function shotN(ctx, t) {
  const env = mixEnv('overcast', 'storm', smooth(102, 105.6, t) * 0.55);
  const w = smooth(101, 105.5, t);
  const o = { x: 1150, y: 1175, scale: 1.15, stage: 3, wind: wind(lerp(0.15, 0.55, w), lerp(0.2, 0.75, w)) };
  const cam = macroCamTo(t, o, kf([[100.77, 1.0], [105.6, 1.18]], t), -260, 160);
  drawMacro(ctx, t, Object.assign({ env, cam, petals: 18, bokeh: 0.2, treeS: 0.7, groundPetals: 0.5 }, o));
}

// ---------------- O: storm — take only me ----------------
function shotO(ctx, t) {
  const env = ENV.storm;
  const sh = 6 * smooth(105.5, 106.5, t);
  const cam = { x: kf([[105.55, 120], [110.6, 260]], t) + Math.sin(t * 31) * sh, y: kf([[105.55, 0], [110.6, 80]], t) + Math.cos(t * 27) * sh, z: kf([[105.55, 1.15], [110.6, 1.45]], t) };
  const wd = wind(1.35 + Math.sin(t * 3) * 0.2, 1.0);
  drawWorld(ctx, t, { env, cam, s: 0.55, wind: wd, dand: 3, dandHalo: 0.55, petals: 210, groundPetals: 1, wet: 1, puddles: 0.7, rain: 1, cloudSpeed: 160, cloudAlpha: 1 });
  petalField(ctx, t, { n: 140, seed: 31, vx: 1250, vy: 160, zMin: 0, zMax: 1, sMin: 12, sMax: 60, sway: 70, tint: envTint(env) });
  rainField(ctx, t, 1, { slant: 0.45 });
  // lightning
  const flash = Math.max(Math.exp(-Math.abs(t - 106.92) * 14), Math.exp(-Math.abs(t - 108.8) * 12) * 0.8, Math.exp(-Math.abs(t - 108.95) * 18) * 0.6);
  if (flash > 0.02) { resetT(ctx); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(210,225,255,${flash * 0.75})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
}

// ---------------- P: the decaying heart revives (胴吹き) ----------------
function shotP(ctx, t) {
  const env = mixEnv(mixEnv('storm', 'night', 0.5), 'dawn', smooth(116, 120.6, t) * 0.6);
  drawTrunkScene(ctx, t, { env, wet: 1, rain: 0.6 * (1 - smooth(112, 115, t)), bloom: smooth(115.3, 119.6, t), sparks: smooth(116.5, 119, t) * 0.8, cam: { x: kf([[110.6, -60], [115.6, -20], [120.7, 50]], t), y: kf([[110.6, 60], [120.7, 20]], t), z: kf([[110.6, 1.0], [115.6, 1.05], [120.7, 1.3]], t) } });
}

// ---------------- Q: after the rain ----------------
function shotQ1(ctx, t) {
  const env = mixEnv('morning', 'day', smooth(121, 125.7, t) * 0.5);
  const rise = smooth(120.69, 125.7, t);
  const cam = { x: lerp(-260, 120, easeInOut(rise)), y: lerp(330, 10, easeInOut(rise)), z: lerp(2.1, 1.1, easeInOut(rise)) };
  drawWorld(ctx, t, { env, cam, s: 0.62, wind: wind(0.25, 0.25), dand: 3, dandHalo: 0.4, petals: 50, groundPetals: 1, wet: lerp(0.7, 0.3, rise), puddles: 1, puddleCanopy: 0.6, sun: [260, 260, 44, 0.9], sunRaysBehind: 0.4, treeShadow: 0.6, cloudSpeed: 18 });
  godRays(ctx, 260, 260, 0.35, t);
}
function shotQ2(ctx, t) {
  const env = mixEnv('morning', 'day', 0.5);
  const w = smooth(125.7, 128, t);
  const o = { x: 1150, y: 1175, scale: 1.15, stage: 3, wind: wind(lerp(0.2, 0.55, w), lerp(0.2, 0.6, w)) };
  const cam = macroCamTo(t, o, kf([[125.74, 1.0], [130.5, 1.32]], t), -220, 140);
  drawMacro(ctx, t, Object.assign({ env, cam, petals: 70 * w + 10, bokeh: 0.4, treeS: 0.62, glow: 0.3 + 0.5 * w, sun: [380, 160, 600, 0.6], rays: 0.4 }, o));
  // the tree's last petals swirl around you
  const [hx, hy] = dandHead(t, o);
  const [sx, sy, zp] = camPoint(cam, 1, hx, hy);
  const n = Math.floor(60 * w);
  for (let i = 0; i < n; i++) {
    const h1 = hash1(i * 2.3), h2 = hash1(i * 4.1);
    const th = t * (0.8 + h1 * 0.9) + h2 * TAU;
    const r = (230 + h1 * 260) * zp * (1 - 0.25 * Math.sin(t * 0.7 + i));
    const x = sx + Math.cos(th) * r, y = sy + Math.sin(th) * r * 0.42 - 20 * zp;
    drawTumble(ctx, SPR.petals[i % 4], x, y, (18 + h2 * 18) * zp, th * 2, th * 3 + i, w * (Math.sin(th) > 0 ? 1 : 0.75));
  }
  ctx.globalAlpha = 1; resetT(ctx);
}

// ---------------- R: sad nights made beautiful ----------------
function shotR(ctx, t) {
  const v = smooth(135.4, 137, t);
  const env = mixEnv('moon', 'magic', v * 0.85);
  const cam = { x: kf([[130.5, 200], [135.57, 260], [140.6, 150]], t), y: kf([[130.5, 40], [135.57, 50], [140.6, -140]], t), z: kf([[130.5, 1.25], [135.57, 1.36], [140.6, 1.0]], t) };
  drawWorld(ctx, t, { env, cam, s: 0.75, wind: wind(0.12, 0.2), dand: 3, dandHalo: 0.6 + 0.4 * v, lamp: 1, petals: 20, groundPetals: 1, wet: 0.8, puddles: 1, puddleCanopy: 0.2, moon: [520, 190, 58, 1], treeGlow: 0.35 * v, cloudAlpha: 0.7 - 0.5 * v });
  sparkField(ctx, t, 0.25 + 0.75 * v, { n: 60, img: SPR.glowW, vx: 3 });
  if (v > 0) sparkField(ctx, t + 9, v * 0.6, { n: 30, img: SPR.glowGold, vx: -3 });
}

// ---------------- S: dawn puff, you're still here ----------------
function shotS(ctx, t) {
  const env = envAt([[140.6, 'dawn'], [144, 'morning'], [150.7, mixEnv('day', 'gold', 0.2)]], t);
  const o = { x: 1150, y: 1175, scale: 1.15, stage: 3, wind: wind(0.1 + 0.3 * smooth(149, 150.8, t), 0.15 + 0.4 * smooth(149, 150.8, t)) };
  const [hx, hy] = dandHead(t, o);
  const cam = macroCamTo(t, o, kf([[140.6, 1.18], [145.66, 1.36], [150.7, 1.2]], t), kf([[140.6, -120], [150.7, -200]], t), 120);
  const sunA = smooth(140.6, 143.5, t);
  const [sx, sy] = camPoint(cam, 1, hx + 60, hy - 40);
  drawMacro(ctx, t, Object.assign({ env, cam, petals: 16, bokeh: 0.45, treeS: 0.5, glow: 0.5 + 0.4 * sunA, sun: [sx + 140, sy - 80, 650, sunA * 0.6], rays: sunA * kf([[140.6, 0.35], [146, 0.65]], t), rayCol: [255, 228, 190] }, o));
}

// ---------------- T: the seeds fly / tears scatter ----------------
function shotT1(ctx, t) {
  const env = mixEnv('day', 'gold', 0.35);
  const o = { x: 1150, y: 1175, scale: 1.15, stage: 3, wind: wind(0.85, 0.85) };
  const f = smooth(150.71, 155.6, t);
  const cam = { x: lerp(60, 380, easeInOut(f)), y: lerp(-40, -420, easeInOut(f)), z: lerp(1.15, 0.92, easeInOut(f)) };
  drawMacro(ctx, t, Object.assign({ env, cam, petals: 70, bokeh: 0.45, treeS: 0.5, glow: 0.6, seedsGone: clamp((t - 150.85) / 4.55), fly: true, flyT0: 150.85, flyDur: 4.55, flyVX: 260, flyVY: 160, sun: [1500, 200, 650, 0.55], rays: 0.45, rayCol: [255, 230, 190] }, o));
}
function shotT2(ctx, t) {
  const env = mixEnv('day', 'gold', 0.22);
  const cam = { x: kf([[155.4, 100], [160.6, 400]], t), y: kf([[155.4, -900], [160.6, -1100]], t), z: 1.0, r: 0 };
  drawWorld(ctx, t, { env, cam, s: 0.5, wind: wind(0.8, 0.9), petals: 0, sun: [1450, 260, 46, 1], sunRaysBehind: 0.25, cloudSpeed: 40 });
  godRays(ctx, 1450, 260, 0.28, t);
  const k = smooth(155.3, 156.5, t);
  seedField(ctx, t, { n: 70 * k, seed: 2, vx: 150, vy: -110, sMin: 0.35, sMax: 1.6 });
  petalField(ctx, t, { n: 130 * k, seed: 41, vx: 220, vy: -70, zMin: 0, zMax: 1, sMin: 10, sMax: 56, sway: 70 });
}

// ---------------- U: journey & seasons ----------------
function shotU1(ctx, t) {
  const env = mixEnv('day', 'gold', 0.2);
  const u = (t - 160.5) / 6.6;
  const cam = { x: lerp(1250, 2250, easeInOutS(u)), y: lerp(820, 1320, easeInOutS(u)), z: lerp(0.72, 0.9, u), r: lerp(-0.12, 0.04, u) };
  drawAerial(ctx, t, { env, cam });
  seedField(ctx, t, { n: 26, seed: 8, vx: 120, vy: -40, sMin: 0.45, sMax: 1.5, shadow: [60, 90] });
  petalField(ctx, t, { n: 30, seed: 6, vx: 140, vy: 20, zMin: 0.5, zMax: 1, sMin: 16, sMax: 50 });
}
function shotU2(ctx, t) {
  const env = envAt([[167, 'summer'], [170.2, 'summer'], [171.6, 'autumn'], [175, 'autumn'], [176.6, 'winter']], t);
  const s = kf([[167, 1.0], [170.2, 1.4], [171.6, 2.05], [174.8, 2.55], [176.4, 3.22]], t, );
  const cam = { x: kf([[167, -220], [180.6, 220]], t), y: -10, z: kf([[167, 1.0], [180.6, 1.08]], t) };
  const snowAmt = smooth(176.2, 177.6, t);
  drawWorld(ctx, t, { env, cam, s, wind: wind(0.3, 0.3), dand: t < 171.5 ? 3 : null, seedsGone: 1, petals: 0, groundPetals: 0, treeShadow: t < 176 ? 1 : 0, thunderhead: kf([[167, 0.85], [170.5, 0.85], [171.8, 0]], t), thunderX: 380, snow: snowAmt, snowGround: smooth(176.6, 179, t), cloudSpeed: 14 });
  const leaves = smooth(170.8, 171.8, t) * (1 - smooth(175.6, 176.6, t));
  if (leaves > 0) petalField(ctx, t, { n: 60 * leaves, seed: 7, vx: 110, vy: 100, sprites: SPR.leafAutumn, blurBig: SPR.leafAutumnBlur, blurMid: SPR.leafAutumn, sMin: 16, sMax: 48, sway: 50, alpha: leaves });
  if (snowAmt > 0) snowField(ctx, t, snowAmt);
}

// ---------------- V: outro ----------------
function shotV(ctx, t) {
  const env = envAt([[180.5, 'winter'], [183.44, 'winter'], [185.8, 'morning'], [189, 'day']], t);
  const s = kf([[180.5, 3.22], [183.44, 3.26], [185.83, 3.78], [188.0, 4.17]], t);
  const thaw = smooth(183.44, 185.6, t);
  const spring = smooth(185.83, 188.0, t);
  const cam = { x: kf([[180.5, 160], [185.83, 120], [193.75, 60]], t), y: kf([[180.5, -40], [185.83, -30], [193.75, -10]], t), z: kf([[180.5, 1.12], [185.83, 1.2], [193.75, 0.98]], t) };
  drawWorld(ctx, t, { env, cam, s, wind: wind(0.3, 0.3), snow: 1 - thaw, snowGround: 1 - thaw * 0.8 - spring * 0.2, dand: t > 185.9 ? kf([[185.9, 0.05], [188.2, 1]], t) : null, extraDands: kf([[186.0, 0], [189.6, 3.6]], t, (x) => x), petals: 140 * spring, groundPetals: spring * 0.8, treeShadow: spring, dandHalo: 0.5 * spring, cloudSpeed: 10 });
  snowField(ctx, t, (1 - thaw) * 0.9);
  if (spring > 0) {
    petalField(ctx, t, { n: 60 * spring, seed: 51, vx: 120, vy: 30, zMin: 0.2, zMax: 1, sMin: 12, sMax: 50 });
    sparkField(ctx, t, spring * 0.4, { n: 30 });
  }
}

// timeline: [start, end, fn, transition-in {type, d}]
const SHOTS = [
  [0, 10.3, shotA],
  [10.3, 21.026, shotB, { type: 'fade', d: 1.6 }],
  [21.026, 25.81, shotC, { type: 'fade', d: 0.5 }],
  [25.81, 35.638, shotD, { type: 'white', d: 0.6 }],
  [35.638, 40.687, shotE, { type: 'fade', d: 0.5 }],
  [40.687, 45.748, shotF, { type: 'fade', d: 0.5 }],
  [45.748, 50.812, shotG, { type: 'white', d: 0.5 }],
  [50.812, 60.638, shotH, { type: 'fade', d: 0.7 }],
  [60.638, 70.732, shotI, { type: 'fade', d: 0.8 }],
  [70.732, 80.81, shotJ, { type: 'white', d: 0.6 }],
  [80.81, 85.86, shotK1, { type: 'fade', d: 0.6 }],
  [85.86, 90.94, shotK2, { type: 'cut' }],
  [90.94, 95.986, shotL, { type: 'white', d: 0.4 }],
  [95.986, 100.77, shotM, { type: 'fade', d: 0.6 }],
  [100.77, 105.55, shotN, { type: 'fade', d: 0.6 }],
  [105.55, 110.597, shotO, { type: 'cut' }],
  [110.597, 120.69, shotP, { type: 'black', d: 1.0 }],
  [120.69, 125.738, shotQ1, { type: 'white', d: 0.9 }],
  [125.738, 130.519, shotQ2, { type: 'fade', d: 0.6 }],
  [130.519, 140.612, shotR, { type: 'fade', d: 0.8 }],
  [140.612, 150.707, shotS, { type: 'fade', d: 1.0 }],
  [150.707, 155.45, shotT1, { type: 'fade', d: 0.4 }],
  [155.45, 160.5, shotT2, { type: 'white', d: 0.5 }],
  [160.5, 167.0, shotU1, { type: 'fade', d: 0.8 }],
  [167.0, 180.503, shotU2, { type: 'white', d: 0.8 }],
  [180.503, 193.75, shotV, { type: 'fade', d: 1.0 }],
];
