// usage:
//   node render.js stills <t1,t2,...> <outdir> [scale]
//   node render.js video <frameStart> <frameEnd> <out.mp4>
const { chromium } = require('playwright');
const fs = require('fs');
const { spawn } = require('child_process');
const FPS = 30;

(async () => {
  const [mode, ...args] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-gpu', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('console', m => { if (m.type() === 'error' || m.text().includes('ERROR')) console.log('PAGE:', m.text()); });
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  await page.goto('file://' + __dirname + '/index.html');
  await page.waitForFunction(() => window.READY === true || window.INIT_ERROR, null, { timeout: 180000 });
  const err = await page.evaluate(() => window.INIT_ERROR);
  if (err) { console.log('INIT ERROR', err); process.exit(1); }
  if (mode === 'stills') {
    const times = args[0].split(',').map(Number); const outdir = args[1]; const q = 0.9;
    fs.mkdirSync(outdir, { recursive: true });
    for (const t of times) {
      const t0 = Date.now();
      const data = await page.evaluate(([t, q]) => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', q); }, [t, q]);
      fs.writeFileSync(`${outdir}/f_${t.toFixed(2).padStart(7, '0')}.jpg`, Buffer.from(data.split(',')[1], 'base64'));
      console.log('t', t, (Date.now() - t0) + 'ms');
    }
  } else if (mode === 'video') {
    const f0 = +args[0], f1 = +args[1], out = args[2];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-maxrate', '7M', '-bufsize', '14M', '-g', '60', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const tStart = Date.now();
    for (let f = f0; f < f1; f++) {
      const t = f / FPS;
      const data = await page.evaluate((t) => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.94); }, t);
      const buf = Buffer.from(data.split(',')[1], 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - f0) % 150 === 0) { const el = (Date.now() - tStart) / 1000; console.log(`[${out}] frame ${f}/${f1} ${(el / Math.max(1, f - f0 + 1)).toFixed(3)}s/f elapsed ${el.toFixed(0)}s`); }
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('done', out, ((Date.now() - tStart) / 1000).toFixed(0) + 's');
  }
  await browser.close();
})();
