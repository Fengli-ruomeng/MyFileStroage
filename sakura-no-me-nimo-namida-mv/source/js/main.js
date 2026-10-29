// ---------- main ----------
const CANVAS = document.getElementById('c');
const CTX = CANVAS.getContext('2d');
let BUFA, BUFAX, BUFB, BUFBX;

function cleanCtx(c) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.shadowColor = 'transparent'; c.shadowBlur = 0;
}

function renderShot(idx, c, t) {
  cleanCtx(c);
  setView(null);
  c.save();
  SHOTS[idx][2](c, t);
  c.restore();
  setView(null);
  cleanCtx(c);
}

function findShot(t) {
  for (let i = SHOTS.length - 1; i >= 0; i--) if (t >= SHOTS[i][0]) return i;
  return 0;
}

function renderFrame(t) {
  const ctx = CTX;
  cleanCtx(ctx);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const i = findShot(t);
  // transition windows
  let blend = null;
  const next = SHOTS[i + 1];
  if (next && next[3] && next[3].type !== 'cut') { const d = next[3].d; if (t >= next[0] - d / 2) blend = [i, i + 1, (t - (next[0] - d / 2)) / d, next[3].type]; }
  const cur = SHOTS[i];
  if (!blend && cur[3] && cur[3].type !== 'cut' && i > 0) { const d = cur[3].d; if (t < cur[0] + d / 2) blend = [i - 1, i, (t - (cur[0] - d / 2)) / d, cur[3].type]; }
  if (!blend) {
    renderShot(i, ctx, t);
  } else {
    const [a, b, k0, type] = blend;
    const k = clamp(k0);
    if (type === 'fade') {
      renderShot(a, BUFAX, t); renderShot(b, BUFBX, t);
      ctx.drawImage(BUFA, 0, 0);
      ctx.globalAlpha = easeInOutS(k); ctx.drawImage(BUFB, 0, 0); ctx.globalAlpha = 1;
    } else if (type === 'white' || type === 'black') {
      if (k < 0.5) renderShot(a, ctx, t); else renderShot(b, ctx, t);
      const w = 1 - Math.abs(k * 2 - 1);
      ctx.fillStyle = type === 'white' ? `rgba(255,251,246,${Math.pow(w, 0.8) * 0.96})` : `rgba(0,0,0,${w})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
  cleanCtx(ctx);
  post(ctx, t);
}

function post(ctx, t) {
  // gentle global grade: lift shadows toward navy, highlight warmth
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = 'rgba(255,236,240,0.12)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05);
  vg.addColorStop(0, 'rgba(10,16,36,0)'); vg.addColorStop(1, 'rgba(10,16,36,0.38)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // titles
  drawTitle(ctx, t, 12.6, 18.0, { y: 300 });
  // lyrics
  drawLyrics(ctx, t);
  // end card
  if (t > 189.6) {
    const a = smooth(189.6, 191.2, t);
    ctx.fillStyle = `rgba(255,250,246,${a * 0.82})`; ctx.fillRect(0, 0, W, H);
    drawTitle(ctx, t, 190.2, 199, { y: 470, dark: true, sub: '' });
  }
  // grain (changes ~12x per second)
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.14;
  const gi = Math.floor(t * 12) % 4;
  ctx.drawImage(SPR.grain[gi], 0, 0, W, H);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // fades
  const fin = 1 - smooth(0, 1.3, t), fout = smooth(192.7, 193.7, t);
  const f = Math.max(fin, fout);
  if (f > 0) { ctx.fillStyle = `rgba(0,0,0,${f})`; ctx.fillRect(0, 0, W, H); }
}

async function init() {
  await document.fonts.load('700 64px "LXGW WenKai"', lyricText());
  await document.fonts.load('400 40px "LXGW WenKai"', lyricText());
  await document.fonts.load('700 92px "Noto Sans CJK SC"', '通学路');
  await document.fonts.load('700 92px "Noto Sans CJK JP"', '止まれ');
  await document.fonts.ready;
  BUFA = makeCanvas(W, H); BUFAX = BUFA.getContext('2d');
  BUFB = makeCanvas(W, H); BUFBX = BUFB.getContext('2d');
  initSprites();
  initWorld();
  initDandelion();
  initClose();
  window.READY = true;
  const q = new URLSearchParams(location.search);
  if (q.has('t')) renderFrame(parseFloat(q.get('t')));
}
init().catch(e => { console.error('INIT ERROR', e && e.stack || e); window.INIT_ERROR = String(e && e.stack || e); });
