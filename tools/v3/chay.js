// Chạy các tệp vẽ (lib.js + các bộ vẽ) trong Chromium chạy ngầm, xuất ảnh WebP ra v3/assets/
// Dùng: node tools/v3/chay.js            → vẽ tất cả
//       node tools/v3/chay.js nv- bg-    → chỉ vẽ ảnh có tên bắt đầu như vậy
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', '..', 'v3', 'assets');
const only = process.argv.slice(2);
const FILES = ['lib.js', 'nhanvat.js', 'quai.js', 'canh.js', 'vatpham.js', 'giaodien.js'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('pageerror', e => console.log('LỖI', e.message));
  p.on('console', m => console.log('>', m.text()));
  await p.exposeFunction('LOAD', n => 'data:image/webp;base64,' + fs.readFileSync(path.join(OUT, n + '.webp')).toString('base64'));
  await p.setContent('<html><body></body></html>');
  for (const f of FILES) { const fp = path.join(__dirname, f); if (fs.existsSync(fp)) await p.addScriptTag({ content: fs.readFileSync(fp, 'utf8') }); }
  const names = await p.evaluate(() => Object.keys(A));
  const todo = names.filter(n => !only.length || only.some(o => n.startsWith(o)));
  for (const n of todo) {
    const t = Date.now();
    const url = await p.evaluate(async n => { try { return await render(n); } catch (e) { return 'ERR ' + e.stack; } }, n);
    if (url.startsWith('ERR')) { console.log(n, url); continue; }
    fs.writeFileSync(path.join(OUT, n + '.webp'), Buffer.from(url.split(',')[1], 'base64'));
    console.log(n, Math.round(url.length * .75 / 1024) + 'KB', (Date.now() - t) + 'ms');
  }
  await b.close();
})();
