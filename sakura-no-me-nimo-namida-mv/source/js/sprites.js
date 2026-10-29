// ---------- pre-rendered sprites ----------
const SPR = {};

function petalPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.bezierCurveTo(-14, 13, -17, -8, -8, -19);
  ctx.quadraticCurveTo(-4, -18.5, 0, -13);
  ctx.quadraticCurveTo(4, -18.5, 8, -19);
  ctx.bezierCurveTo(17, -8, 14, 13, 0, 20);
  ctx.closePath();
}

function makePetal(cBase, cTip, cLine, blur) {
  const s = 96, c = makeCanvas(s, s), x = c.getContext('2d');
  x.translate(s / 2, s / 2);
  if (blur) x.filter = `blur(${blur}px)`;
  x.scale(1.5, 1.5);
  const g = x.createLinearGradient(0, 20, 0, -20);
  g.addColorStop(0, rgb(cBase)); g.addColorStop(0.45, rgb(mixc(cBase, cTip, 0.7))); g.addColorStop(1, rgb(cTip));
  petalPath(x); x.fillStyle = g; x.fill();
  if (!blur) {
    x.strokeStyle = rgba(cLine, 0.35); x.lineWidth = 0.8;
    x.beginPath(); x.moveTo(0, 17); x.quadraticCurveTo(-1, 0, 0, -11); x.stroke();
    x.beginPath(); x.moveTo(0, 12); x.quadraticCurveTo(-6, 0, -6, -12); x.moveTo(0, 12); x.quadraticCurveTo(6, 0, 6, -12); x.stroke();
  }
  return c;
}

function makeFlower(size, cPet, cTip, cCenter, tiltY = 1, blur = 0) {
  const s = size, c = makeCanvas(s, s), x = c.getContext('2d');
  x.translate(s / 2, s / 2);
  if (blur) x.filter = `blur(${blur}px)`;
  x.scale(s / 96, s / 96 * tiltY);
  for (let i = 0; i < 5; i++) {
    x.save(); x.rotate(i * TAU / 5 + 0.2); x.translate(0, -22); x.scale(0.95, 1.05);
    const g = x.createLinearGradient(0, 20, 0, -20);
    g.addColorStop(0, rgb(cCenter)); g.addColorStop(0.35, rgb(cPet)); g.addColorStop(1, rgb(cTip));
    petalPath(x); x.fillStyle = g; x.fill();
    x.restore();
  }
  // stamens
  x.strokeStyle = rgba(hex('#c9577a'), 0.9); x.lineWidth = 1.4;
  x.fillStyle = '#f2c35b';
  for (let i = 0; i < 12; i++) {
    const a = i * TAU / 12 + 0.1, r = 13 + (i % 3) * 3;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * r, Math.sin(a) * r); x.stroke();
    x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, 2.2, 0, TAU); x.fill();
  }
  x.fillStyle = '#d2577b'; x.beginPath(); x.arc(0, 0, 4.5, 0, TAU); x.fill();
  return c;
}

function makeGlow(size, col, inner = 1) {
  const c = makeCanvas(size, size), x = c.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, rgba(col, 1 * inner)); g.addColorStop(0.25, rgba(col, 0.45 * inner)); g.addColorStop(1, rgba(col, 0));
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  return c;
}

function makeSeed(blur = 0, glow = false) {
  const w = 128, h = 176, c = makeCanvas(w, h), x = c.getContext('2d');
  if (blur) x.filter = `blur(${blur}px)`;
  const cx = w / 2, cy = 52;
  // pappus filaments
  const R = mulberry32(77);
  x.lineCap = 'round';
  for (let i = 0; i < 34; i++) {
    const a = -Math.PI + (i / 33) * Math.PI + (R() - 0.5) * 0.12; // upper half dome
    const r = 40 + R() * 6;
    const ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r * 0.85 + 6;
    x.strokeStyle = 'rgba(255,255,255,0.95)'; x.lineWidth = 1.7;
    x.beginPath(); x.moveTo(cx, cy + 4); x.quadraticCurveTo(lerp(cx, ex, 0.5), lerp(cy, ey, 0.5) - 4, ex, ey); x.stroke();
    // tiny barbs
    x.lineWidth = 0.7; x.strokeStyle = 'rgba(255,255,255,0.55)';
    for (let k = 0.55; k < 1; k += 0.18) {
      const px = lerp(cx, ex, k), py = lerp(cy + 4, ey, k);
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a + 0.8) * 5, py + Math.sin(a + 0.8) * 5); x.stroke();
    }
  }
  // beak
  x.strokeStyle = 'rgba(245,240,230,0.95)'; x.lineWidth = 1.6;
  x.beginPath(); x.moveTo(cx, cy + 4); x.lineTo(cx, cy + 80); x.stroke();
  // achene
  x.fillStyle = '#b39a7c';
  x.beginPath(); x.ellipse(cx, cy + 90, 2.6, 10, 0, 0, TAU); x.fill();
  x.fillStyle = 'rgba(255,255,255,0.9)'; x.beginPath(); x.arc(cx, cy + 4, 2.4, 0, TAU); x.fill();
  if (glow) {
    x.filter = 'none';
    x.globalCompositeOperation = 'destination-over';
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, 60);
    g.addColorStop(0, 'rgba(255,250,230,0.5)'); g.addColorStop(1, 'rgba(255,250,230,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }
  return c;
}

function makeLeaf(cA, cB, blur = 0, serr = true) {
  const s = 96, c = makeCanvas(s, s), x = c.getContext('2d');
  x.translate(s / 2, s / 2);
  if (blur) x.filter = `blur(${blur}px)`;
  x.beginPath();
  x.moveTo(0, 30);
  const pts = [];
  for (let i = 0; i <= 16; i++) { const tt = i / 16; const y = lerp(26, -32, tt); const wdt = Math.sin(tt * Math.PI) * 15 * (1 - tt * 0.25); pts.push([wdt, y]); }
  for (let i = 0; i < pts.length; i++) { const [px, py] = pts[i]; x.lineTo(px + (serr && i % 2 ? 1.6 : 0), py); }
  for (let i = pts.length - 1; i >= 0; i--) { const [px, py] = pts[i]; x.lineTo(-px - (serr && i % 2 ? 1.6 : 0), py); }
  x.closePath();
  const g = x.createLinearGradient(-15, 0, 15, 0); g.addColorStop(0, rgb(cA)); g.addColorStop(1, rgb(cB));
  x.fillStyle = g; x.fill();
  x.strokeStyle = rgba(scalec(cA, 0.7), 0.6); x.lineWidth = 1.2;
  x.beginPath(); x.moveTo(0, 34); x.lineTo(0, -28); x.stroke();
  return c;
}

function makeGrain(w, h, seed) {
  const c = makeCanvas(w, h), x = c.getContext('2d');
  const id = x.createImageData(w, h), d = id.data;
  const R = mulberry32(seed);
  for (let i = 0; i < w * h; i++) {
    const v = 128 + (R() + R() + R() - 1.5) * 70;
    d[i * 4] = v; d[i * 4 + 1] = v; d[i * 4 + 2] = v; d[i * 4 + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  return c;
}

function makeSnow(blur) {
  const s = 32, c = makeCanvas(s, s), x = c.getContext('2d');
  if (blur) x.filter = `blur(${blur}px)`;
  const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, 10);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.6, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.beginPath(); x.arc(s / 2, s / 2, 10, 0, TAU); x.fill();
  return c;
}

function initSprites() {
  const pinkA = hex('#f2a7bd'), pinkTip = hex('#fff4f6'), line = hex('#d77d98');
  SPR.petals = [
    makePetal(pinkA, pinkTip, line, 0),
    makePetal(hex('#f7c1cf'), hex('#ffffff'), line, 0),
    makePetal(hex('#ea93ad'), hex('#fde3ea'), line, 0),
    makePetal(hex('#fbd5de'), hex('#fffafa'), line, 0),
  ];
  SPR.petalsBlur = [
    makePetal(pinkA, pinkTip, line, 3),
    makePetal(hex('#f7c1cf'), hex('#ffffff'), line, 3),
    makePetal(hex('#fbd5de'), hex('#fffafa'), line, 3),
  ];
  SPR.petalsBlurBig = [
    makePetal(pinkA, pinkTip, line, 7),
    makePetal(hex('#fbd5de'), hex('#fffafa'), line, 7),
  ];
  SPR.flowers = [
    makeFlower(64, hex('#fbe3ea'), hex('#ffffff'), hex('#e98aa6'), 1),
    makeFlower(64, hex('#f9d2dd'), hex('#fff8fa'), hex('#e07b9a'), 0.75),
    makeFlower(64, hex('#fdeef2'), hex('#ffffff'), hex('#ee9db4'), 0.9),
  ];
  SPR.bigFlower = makeFlower(256, hex('#fbe0e8'), hex('#ffffff'), hex('#e3809f'), 1);
  SPR.glowW = makeGlow(128, [255, 255, 255]);
  SPR.glowGold = makeGlow(128, hex('#ffd36b'));
  SPR.glowWarm = makeGlow(256, hex('#ffe2a8'));
  SPR.glowPink = makeGlow(128, hex('#ffb3c9'));
  SPR.seed = makeSeed(0, false);
  SPR.seedGlow = makeSeed(0, true);
  SPR.seedBlur = makeSeed(4, true);
  SPR.leafGreen = [makeLeaf(hex('#5fae7c'), hex('#8fd09a')), makeLeaf(hex('#4f9c74'), hex('#7cc290'))];
  SPR.leafAutumn = [makeLeaf(hex('#d9573c'), hex('#f08a4b')), makeLeaf(hex('#e88a3a'), hex('#f7bf5a')), makeLeaf(hex('#c2443a'), hex('#e46a4e'))];
  SPR.leafAutumnBlur = [makeLeaf(hex('#d9573c'), hex('#f08a4b'), 5), makeLeaf(hex('#e88a3a'), hex('#f7bf5a'), 5)];
  SPR.snow = makeSnow(0); SPR.snowBlur = makeSnow(3);
  SPR.grain = [makeGrain(960, 540, 11), makeGrain(960, 540, 23), makeGrain(960, 540, 37), makeGrain(960, 540, 51)];
}

// draw a tumbling sprite (petal/leaf). flip in [0,2pi) gives 3D-ish tumbling
function drawTumble(ctx, img, x, y, size, rot, flip, alpha = 1) {
  const sx = Math.cos(flip);
  ctx.globalAlpha = alpha;
  const c = Math.cos(rot), s = Math.sin(rot);
  const k = size / 64;
  // rotation * scale(sx,1)
  setT(ctx, c * k * sx, s * k * sx, -s * k, c * k, x, y);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
}
