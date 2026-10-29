// ---------- Chinese lyrics ----------
// layout: v = vertical columns (phrases -> columns, right to left), h = one line centred, h2 = phrases on separate lines
const LYRICS = [
  { t: 0.850, e: 5.40, s: '纵使无人能将我得见', L: 'v', x: 1660, y: 190, size: 60 },
  { t: 3.507, e: 5.40, s: '我仍想再多活些时日', L: 'v', x: 1560, y: 270, size: 60 },
  { t: 5.631, e: 10.25, s: '可我啊 只能任由无数眼泪散落漫天', L: 'h', x: 960, y: 930, size: 58 },
  { t: 21.026, e: 25.55, s: '上学路上一隅 幸得春风漫舞', L: 'v', x: 360, y: 140, size: 58 },
  { t: 25.810, e: 30.65, s: '我邂逅了悄然绽放的你', L: 'v', x: 400, y: 200, size: 60 },
  { t: 30.857, e: 35.45, s: '唯有你的眼眸 能将我心捕获', L: 'v', x: 380, y: 170, size: 60 },
  { t: 35.638, e: 40.50, s: '眼底藏着一丝落寞 是与我如此地相像', L: 'h', x: 960, y: 960, size: 54 },
  { t: 40.687, e: 43.45, s: '真希望夏日永远不要到来', L: 'h', x: 960, y: 940, size: 58 },
  { t: 43.622, e: 45.60, s: '我还想再度与你相遇', L: 'h', x: 960, y: 940, size: 58 },
  { t: 45.748, e: 50.60, s: '就让世间所有四季 都染上你的色彩吧', L: 'h', x: 960, y: 546, size: 62, band: true },
  { t: 50.812, e: 55.65, s: '那些空虚到泫然欲泣的夜晚', L: 'v', x: 330, y: 170, size: 60 },
  { t: 55.857, e: 60.45, s: '只要将你想起 便重新鲜活起来', L: 'h', x: 960, y: 940, size: 64, glow: hex('#ffd36b') },
  { t: 60.638, e: 65.50, s: '是你对我说出了那句还想再见', L: 'v', x: 360, y: 130, size: 58 },
  { t: 65.685, e: 70.55, s: '而你降生于世 便是对我的救赎', L: 'h', x: 960, y: 940, size: 62, glow: hex('#ffcf8a') },
  { t: 70.732, e: 75.55, s: '真希望春日永远延续下去', L: 'v', x: 380, y: 140, size: 58 },
  { t: 73.388, e: 75.55, s: '我还想一直同你相谈', L: 'v', x: 280, y: 220, size: 58 },
  { t: 75.779, e: 80.60, s: '就让世间所有四季 都染上你的色彩吧', L: 'h', x: 960, y: 940, size: 64, glow: hex('#ffd36b') },
  { t: 90.940, e: 95.80, s: '任凭祈求时间停驻的我 被远远抛在身后', L: 'v', x: 1790, y: 110, size: 56 },
  { t: 95.986, e: 100.60, s: '能与你相遇的时光 正在不断地减少', L: 'v', x: 330, y: 90, size: 56 },
  { t: 100.770, e: 105.40, s: '明明你是我心中唯一的依托', L: 'v', x: 380, y: 140, size: 58 },
  { t: 105.550, e: 110.40, s: '若要夺走什么 就只管把我带走啊', L: 'h', x: 960, y: 540, size: 72, shake: 1 },
  { t: 110.597, e: 115.45, s: '我那颗本只会逐渐腐朽的心灵', L: 'v', x: 1730, y: 150, size: 56 },
  { t: 115.643, e: 120.50, s: '因为被你寻见 才重新焕发生机', L: 'v', x: 1760, y: 170, size: 58, glow: hex('#ffb8cb') },
  { t: 120.690, e: 125.55, s: '只因还想与你再次相遇 我才有了活下去的念头', L: 'h2', x: 960, y: 885, size: 56 },
  { t: 125.738, e: 130.35, s: '至于我的全部 你尽管夺走吧', L: 'h', x: 960, y: 940, size: 62 },
  { t: 130.519, e: 135.40, s: '那些悲伤到泫然欲泣的夜晚', L: 'v', x: 330, y: 170, size: 60 },
  { t: 135.566, e: 140.45, s: '只要将你想起 便也美丽动人', L: 'h', x: 960, y: 940, size: 64, glow: hex('#cfe0ff') },
  { t: 140.612, e: 145.50, s: '是你对我说出了那句还想再见', L: 'v', x: 360, y: 130, size: 58 },
  { t: 145.660, e: 150.55, s: '你仍留存于世 便是对我的救赎', L: 'h', x: 960, y: 940, size: 62, glow: hex('#ffcf8a') },
  { t: 150.707, e: 153.22, s: '我好想知道 遥远未来的你 会是什么模样', L: 'h', x: 960, y: 940, size: 56, fast: true },
  { t: 153.362, e: 155.38, s: '我仍想再多活些时日啊', L: 'h', x: 960, y: 940, size: 60, fast: true },
  { t: 155.488, e: 160.30, s: '可我啊 只能任由无数眼泪散落漫天', L: 'h', x: 960, y: 540, size: 66, glow: hex('#ffd6e2') },
  { t: 180.503, e: 183.30, s: '纵使这份伤痛 想必无人能够治愈', L: 'v', x: 380, y: 130, size: 58 },
  { t: 183.442, e: 185.70, s: '我会连带你的那一份 一起活下去', L: 'v', x: 380, y: 130, size: 58 },
  { t: 185.831, e: 190.40, s: '愿来世我们仍能共赴这场春日', L: 'h', x: 960, y: 1000, size: 66, glow: hex('#ffd6e2') },
];

function lyricText() { return LYRICS.map(l => l.s).join('') + '桜の目にも涙冬館「」·'; }

function drawLyrics(ctx, t) {
  for (const L of LYRICS) {
    if (t < L.t - 0.05 || t > L.e + 0.05) continue;
    drawLine(ctx, t, L);
  }
}

function drawLine(ctx, t, L) {
  const size = L.size;
  const phrases = L.s.split(' ');
  const chars = [];
  const stagger = L.fast ? 0.025 : 0.05;
  const appear = L.fast ? 0.3 : 0.55;
  const fadeOut = Math.min(0.6, (L.e - L.t) * 0.2);
  // layout
  if (L.L === 'v') {
    const step = size * 1.12;
    let ci = 0;
    phrases.forEach((p, pi) => {
      const cx = L.x - pi * size * 1.55;
      const cy0 = L.y + pi * size * 1.3;
      [...p].forEach((ch, k) => { chars.push({ ch, x: cx, y: cy0 + k * step, i: ci++ }); });
    });
  } else if (L.L === 'h' || L.L === 'h2') {
    ctx.font = `700 ${size}px "LXGW WenKai"`;
    const gap = size * 0.9;
    if (L.L === 'h') {
      const widths = phrases.map(p => [...p].length * size * 1.04);
      const total = widths.reduce((a, b) => a + b, 0) + gap * (phrases.length - 1);
      let x = L.x - total / 2 + size * 0.52;
      let ci = 0;
      phrases.forEach((p, pi) => { [...p].forEach(ch => { chars.push({ ch, x, y: L.y, i: ci++ }); x += size * 1.04; }); x += gap; });
    } else {
      let ci = 0;
      phrases.forEach((p, pi) => {
        const n = [...p].length; let x = L.x - n * size * 1.04 / 2 + size * 0.52;
        [...p].forEach(ch => { chars.push({ ch, x, y: L.y + pi * size * 1.45, i: ci++ }); x += size * 1.04; });
      });
    }
  }
  resetT(ctx);
  ctx.font = `700 ${size}px "LXGW WenKai"`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const out = 1 - smooth(L.e - fadeOut, L.e, t);
  // optional dark band for readability
  if (L.band) {
    const a = smooth(L.t - 0.2, L.t + 0.4, t) * out;
    const g = ctx.createLinearGradient(0, L.y - size * 1.6, 0, L.y + size * 1.6);
    g.addColorStop(0, 'rgba(20,28,48,0)'); g.addColorStop(0.5, `rgba(20,28,48,${0.45 * a})`); g.addColorStop(1, 'rgba(20,28,48,0)');
    ctx.fillStyle = g; ctx.fillRect(0, L.y - size * 1.6, W, size * 3.2);
  }
  const vertical = L.L === 'v';
  for (const c of chars) {
    const t0 = L.t + c.i * stagger;
    const k = smooth(t0, t0 + appear, t);
    if (k <= 0) continue;
    const a = k * out;
    if (a <= 0.005) continue;
    let dx = 0, dy = 0;
    if (vertical) dy = (1 - k) * -14; else dy = (1 - k) * 16;
    // drift on exit
    const ex = 1 - out;
    if (vertical) dy -= ex * 10; else dy -= ex * 10;
    if (L.shake) { const s = (1 - smooth(L.t, L.t + 1.2, t)) * 4 + 1.2; dx += Math.sin(t * 43 + c.i * 1.7) * s; dy += Math.cos(t * 37 + c.i) * s; }
    const x = c.x + dx, y = c.y + dy;
    // shadow / halo
    ctx.globalAlpha = a * 0.75;
    ctx.shadowColor = 'rgba(12,20,40,0.85)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(12,20,40,0.35)';
    ctx.fillText(c.ch, x, y + 2);
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    if (L.glow) {
      ctx.globalAlpha = a * 0.55 * (0.8 + 0.2 * Math.sin(t * 3 + c.i));
      ctx.shadowColor = rgba(L.glow, 0.9); ctx.shadowBlur = 26;
      ctx.fillStyle = rgba(L.glow, 0.5); ctx.fillText(c.ch, x, y);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = a;
    // appear: slight scale pop
    const sc = 1 + (1 - k) * 0.12;
    if (sc !== 1) { ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.fillStyle = '#fffaf3'; ctx.fillText(c.ch, 0, 0); ctx.restore(); }
    else { ctx.fillStyle = '#fffaf3'; ctx.fillText(c.ch, x, y); }
  }
  ctx.globalAlpha = 1; ctx.shadowColor = 'transparent';
}

// title card
function drawTitle(ctx, t, t0, t1, o = {}) {
  if (t < t0 || t > t1) return;
  const a = smooth(t0, t0 + 1.4, t) * (1 - smooth(t1 - 1.2, t1, t));
  resetT(ctx);
  const x = o.x || 960, y = o.y || 430;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = a;
  ctx.shadowColor = o.dark ? 'rgba(255,255,255,0.6)' : 'rgba(12,20,40,0.6)'; ctx.shadowBlur = 24;
  ctx.fillStyle = o.dark ? '#3a3550' : '#fffaf3';
  ctx.font = '700 104px "LXGW WenKai"';
  const title = '桜の目にも涙';
  const chs = [...title];
  chs.forEach((ch, i) => {
    const k = smooth(t0 + i * 0.12, t0 + i * 0.12 + 0.8, t);
    ctx.globalAlpha = a * k;
    ctx.fillText(ch, x + (i - (chs.length - 1) / 2) * 112, y + (1 - k) * 12);
  });
  ctx.globalAlpha = a * smooth(t0 + 0.9, t0 + 1.8, t);
  ctx.font = '400 40px "LXGW WenKai"';
  ctx.fillText('冬  館', x, y + 104);
  // little rule
  ctx.fillRect(x - 70, y + 66, 140, 2);
  if (o.sub) { ctx.font = '400 28px "LXGW WenKai"'; ctx.globalAlpha = a * 0.85 * smooth(t0 + 1.4, t0 + 2.4, t); ctx.fillText(o.sub, x, y + 160); }
  ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.globalAlpha = 1;
}
