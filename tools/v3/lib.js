// Thư viện vẽ dùng chung (chạy trong trình duyệt). Tất cả ảnh đều là ảnh điểm (raster), vẽ bằng canvas.
const A = {};
let SEED = 1;
const rnd = () => (SEED = (SEED * 16807) % 2147483647) / 2147483647;
const rr = (a, b) => a + rnd() * (b - a);
const hash = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 2147483647; return h || 3; };
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
async function render(n) {
  const a = A[n]; const c = cv(a.w, a.h); const x = c.getContext('2d'); SEED = hash(n);
  await a.draw(x, a.w, a.h); return c.toDataURL('image/webp', a.q || .9);
}
const P = d => typeof d === 'string' ? new Path2D(d) : d;
const PI = Math.PI, TAU = PI * 2;
function lg(x, x0, y0, x1, y1, st) { const g = x.createLinearGradient(x0, y0, x1, y1); st.forEach((s, i) => Array.isArray(s) ? g.addColorStop(s[0], s[1]) : g.addColorStop(i / (st.length - 1), s)); return g; }
function rg(x, cx, cy, r0, r, st, fx, fy) { const g = x.createRadialGradient(fx ?? cx, fy ?? cy, r0, cx, cy, r); st.forEach((s, i) => Array.isArray(s) ? g.addColorStop(s[0], s[1]) : g.addColorStop(i / (st.length - 1), s)); return g; }
function fill(x, d, st, o = {}) { x.save(); if (o.a != null) x.globalAlpha = o.a; if (o.op) x.globalCompositeOperation = o.op; if (o.blur) x.filter = 'blur(' + o.blur + 'px)'; if (o.sh) { x.shadowColor = o.sh; x.shadowBlur = o.sb || 10; x.shadowOffsetY = o.sy || 0; x.shadowOffsetX = o.sx || 0; } x.fillStyle = st; x.fill(P(d), o.eo ? 'evenodd' : 'nonzero'); x.restore(); }
function stroke(x, d, st, w, o = {}) { x.save(); x.lineCap = o.cap || 'round'; x.lineJoin = 'round'; x.lineWidth = w; x.strokeStyle = st; if (o.a != null) x.globalAlpha = o.a; if (o.op) x.globalCompositeOperation = o.op; if (o.blur) x.filter = 'blur(' + o.blur + 'px)'; if (o.glow) { x.shadowColor = o.glow; x.shadowBlur = o.gb || 8; } if (o.dash) x.setLineDash(o.dash); x.stroke(P(d)); x.restore(); }
function clip(x, d, fn, eo) { x.save(); x.clip(P(d), eo ? 'evenodd' : 'nonzero'); fn(); x.restore(); }
// bóng hình lưỡi liềm: phần của hình KHÔNG bị bản sao dịch chuyển (dx,dy) che → tạo bóng tối/viền sáng một phía
function cres(x, d, dx, dy, blur, col, op = 'multiply', a = 1) {
  const W = x.canvas.width, H = x.canvas.height, o = cv(W, H), ox = o.getContext('2d'); const p = P(d);
  ox.setTransform(x.getTransform()); ox.fillStyle = col; ox.fill(p);
  ox.globalCompositeOperation = 'destination-out'; ox.filter = 'blur(' + blur + 'px)'; ox.translate(dx, dy); ox.fill(p);
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = op; x.globalAlpha = a; x.drawImage(o, 0, 0); x.restore();
}
// bóng trong viền (tối mép)
function inner(x, d, w, blur, col, op = 'multiply', a = 1) { clip(x, d, () => { x.globalCompositeOperation = op; x.globalAlpha = a; x.filter = 'blur(' + blur + 'px)'; x.lineWidth = w; x.strokeStyle = col; x.stroke(P(d)); }); }
// nhiễu
function noiseTex(w, h, sc, oct, seed, contrast = 1) {
  const g = cv(w, h), x = g.getContext('2d'); let s = seed || 5; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); x.imageSmoothingQuality = 'high';
  for (let o = 0; o < oct; o++) {
    const n = Math.max(2, Math.round(sc * Math.pow(2, o))), t = cv(n, n), tx = t.getContext('2d'), d = tx.createImageData(n, n);
    for (let i = 0; i < n * n; i++) { const v = 128 + (r() - .5) * 255 * contrast; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
    tx.putImageData(d, 0, 0); x.globalAlpha = 1 / (o + 1.3); x.drawImage(t, 0, 0, w, h);
  } return g;
}
const NZ = noiseTex(512, 512, 6, 5, 11), NF = noiseTex(512, 512, 48, 3, 23), NG = noiseTex(512, 512, 180, 1, 41);
function tex(x, d, a = .3, n = NZ, op = 'overlay', b) { clip(x, d, () => { x.globalCompositeOperation = op; x.globalAlpha = a; const c = x.canvas; if (b) x.drawImage(n, b[0], b[1], b[2], b[3]); else { x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(n, 0, 0, c.width, c.height); } }); }
function grain(x, a = .12) { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'overlay'; x.globalAlpha = a; x.drawImage(NG, 0, 0, x.canvas.width, x.canvas.height); x.restore(); }
function glow(x, cx, cy, r, col, a = .8, op = 'lighter') { x.save(); x.globalCompositeOperation = op; x.globalAlpha = a; x.fillStyle = rg(x, cx, cy, 0, r, [col, 'rgba(0,0,0,0)']); x.fillRect(cx - r, cy - r, r * 2, r * 2); x.restore(); }
function softGlow(x, cx, cy, r, col, a = .8) { x.save(); x.globalAlpha = a; x.fillStyle = rg(x, cx, cy, 0, r, [col, col.replace(/[\d.]+\)$/, '0)')]); x.fillRect(cx - r, cy - r, r * 2, r * 2); x.restore(); }
function spark(x, cx, cy, s, col = '#fff', a = 1) { x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = a; x.fillStyle = col; x.shadowColor = col; x.shadowBlur = s * 1.5; x.beginPath(); x.moveTo(cx, cy - s); x.quadraticCurveTo(cx, cy, cx + s * .7, cy); x.quadraticCurveTo(cx, cy, cx, cy + s); x.quadraticCurveTo(cx, cy, cx - s * .7, cy); x.quadraticCurveTo(cx, cy, cx, cy - s); x.fill(); x.restore(); }
function dots(x, n, b, col, r = 1.5, a = 1) { x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = col; for (let i = 0; i < n; i++) { x.globalAlpha = a * (.3 + rnd() * .7); x.beginPath(); x.arc(rr(b[0], b[2]), rr(b[1], b[3]), r * (.4 + rnd()), 0, TAU); x.fill(); } x.restore(); }
// đường cong Catmull-Rom qua các điểm → mảng điểm mịn
function spline(pts, seg = 16) {
  const o = []; for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    for (let j = 0; j < seg; j++) {
      const t = j / seg, t2 = t * t, t3 = t2 * t;
      o.push([.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
      .5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
    }
  } o.push(pts[pts.length - 1]); return o;
}
// dải thuôn dọc theo đường: độ rộng theo hàm wf(t) → Path2D (dùng cho tóc, dải lụa)
function band(pts, wf, seg = 14) {
  const s = spline(pts, seg), L = [], Rr = [];
  for (let i = 0; i < s.length; i++) {
    const a = s[Math.max(0, i - 1)], b = s[Math.min(s.length - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const w = wf(i / (s.length - 1)) / 2; L.push([s[i][0] - dy * w, s[i][1] + dx * w]); Rr.push([s[i][0] + dy * w, s[i][1] - dx * w]);
  }
  const p = new Path2D(); p.moveTo(L[0][0], L[0][1]); for (const q of L) p.lineTo(q[0], q[1]); for (let i = Rr.length - 1; i >= 0; i--) p.lineTo(Rr[i][0], Rr[i][1]); p.closePath(); return p;
}
const taper = (w0, w1 = 0, k = 1) => t => w0 + (w1 - w0) * Math.pow(t, k);
const leaf = (w, k = 1) => t => w * Math.pow(Math.sin(PI * Math.min(1, t)), k);
function polyPath(pts, close = true) { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); if (close) p.closePath(); return p; }
function smoothPath(pts, close = true) { return polyPath(spline(close ? [...pts, pts[0], pts[1]] : pts, 12).slice(0, close ? -12 : undefined), close); }
const circ = (cx, cy, r) => { const p = new Path2D(); p.arc(cx, cy, r, 0, TAU); return p; };
const ell = (cx, cy, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(cx, cy, rx, ry, rot, 0, TAU); return p; };
const rect = (X, Y, W, H, r = 0) => { const p = new Path2D(); p.roundRect(X, Y, W, H, r); return p; };
// tô hình kiểu hoạt hình vẽ tay: nền dải màu + bóng một phía + viền sáng + vân + viền nét
function paint(x, d, o) {
  const p = P(d);
  if (o.drop) fill(x, p, 'rgba(0,0,0,1)', { sh: o.drop, sb: o.db || 12, sy: o.dy ?? 4, a: 1 }), clip(x, p, () => { x.globalCompositeOperation = 'source-over'; });
  fill(x, p, o.fill);
  if (o.shade) cres(x, p, o.shade[0], o.shade[1], o.shade[2], o.shade[3], 'multiply', o.shade[4] ?? 1);
  if (o.rim) cres(x, p, o.rim[0], o.rim[1], o.rim[2], o.rim[3], 'screen', o.rim[4] ?? 1);
  if (o.inner) inner(x, p, o.inner[0], o.inner[1], o.inner[2], 'multiply', o.inner[3] ?? 1);
  if (o.tex) tex(x, p, o.tex, o.nz || NZ);
  if (o.hi) clip(x, p, () => { x.globalCompositeOperation = 'screen'; x.fillStyle = rg(x, o.hi[0], o.hi[1], 0, o.hi[2], [o.hi[3] || 'rgba(255,255,255,.7)', 'rgba(255,255,255,0)']); x.fillRect(o.hi[0] - o.hi[2], o.hi[1] - o.hi[2], o.hi[2] * 2, o.hi[2] * 2); });
  if (o.line) stroke(x, p, o.line, o.lw || 1.5, { a: o.la ?? 1 });
}
function img(src) { return new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = src; }); }
// đường sống núi bằng chia đôi ngẫu nhiên
function ridge(x0, x1, y, rough, n = 9, seed) {
  if (seed) SEED = seed; let pts = [[x0, y + rr(-rough, rough) * .5], [x1, y + rr(-rough, rough) * .5]], amp = rough;
  for (let k = 0; k < n; k++) { const q = []; for (let i = 0; i < pts.length - 1; i++) { q.push(pts[i]); q.push([(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2 + rr(-amp, amp)]); } q.push(pts[pts.length - 1]); pts = q; amp *= .55; } return pts;
}
// đỉnh núi kiểu tranh thủy mặc: các ngọn nhọn cao theo danh sách
function peaks(x0, x1, base, list, rough = 6) {
  const pts = []; const N = 220;
  for (let i = 0; i <= N; i++) {
    const X = x0 + (x1 - x0) * i / N; let y = base;
    for (const [px, h, w] of list) { const d = (X - px) / w; y = Math.min(y, base - h * Math.exp(-d * d * 2.2) * (1 + .08 * Math.sin(X * .13 + px))); }
    pts.push([X, y]);
  }
  for (let k = 0; k < 2; k++) for (let i = 1; i < pts.length - 1; i++) pts[i][1] += rr(-rough, rough) * (1 - k * .5);
  return pts;
}
function mist(x, y, h, w, col, a = 1) { x.save(); x.globalAlpha = a; x.fillStyle = lg(x, 0, y - h, 0, y + h, [[0, col.replace(/[\d.]+\)$/, '0)')], [.5, col], [1, col.replace(/[\d.]+\)$/, '0)')]]); x.fillRect(0, y - h, w, h * 2); x.restore(); }
function cloud(x, cx, cy, s, col = 'rgba(255,255,255,.95)', shade = 'rgba(160,180,210,.6)', puffs = 7) {
  const P2 = []; for (let i = 0; i < puffs; i++) { const t = i / (puffs - 1) - .5; P2.push([cx + t * s * 2.2 + rr(-s * .1, s * .1), cy - Math.cos(t * PI) * s * .35 + rr(-s * .08, s * .08), s * (.35 + Math.cos(t * PI) * .35) * rr(.8, 1.15)]); }
  x.save(); x.filter = 'blur(' + (s * .04) + 'px)';
  for (const [X, Y, r] of P2) { x.fillStyle = rg(x, X, Y + r * .3, 0, r * 1.05, [shade, shade.replace(/[\d.]+\)$/, '0)')]); x.beginPath(); x.arc(X, Y + r * .25, r * 1.05, 0, TAU); x.fill(); }
  for (const [X, Y, r] of P2) { x.fillStyle = rg(x, X - r * .2, Y - r * .3, 0, r, [col, col, col.replace(/[\d.]+\)$/, '.0)')].map((c, i) => [[0, .6, 1][i], c])); x.beginPath(); x.arc(X, Y, r, 0, TAU); x.fill(); }
  x.restore();
}
