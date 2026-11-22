// Vẽ nhân vật đứng toàn thân kiểu tranh hoạt hình cổ trang (600x1000), không dùng ảnh có sẵn.
const SK = { a: ['#fff3ea', '#f9d9c6', '#d9a38c'], b: ['#fdebdc', '#f0c7aa', '#c58a6e'], pale: ['#f6f6fb', '#e2e2ee', '#a7a6c0'], ma: ['#f1e2e6', '#d6b6c0', '#8a5a6e'] };
function dk(c, f = .6) { const n = parseInt(c.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; return 'rgb(' + [r * f | 0, g * f | 0, b * f | 0] + ')'; }
function rgba(c, a) { const n = parseInt(c.slice(1), 16); return 'rgba(' + [n >> 16, (n >> 8) & 255, n & 255, a] + ')'; }
function nv(x, o) {
  const m = o.sex === 'm', cx = 300, sw = m ? 110 : 90, wY = m ? 505 : 492, ww = m ? 80 : 66, hw = m ? 170 : 182, sk = o.skin || SK.a;
  const R3 = o.robe, IN = o.inner || ['#ffffff', '#eef0f6', '#a9b0c4'], TR = o.trim, SA = o.sash || TR, HR = o.hair;
  const X = (s, v) => cx + s * v;
  // ---- hào quang
  if (o.aura) { glow(x, cx, 420, 380, rgba(o.aura, .45), 1, 'source-over'); }
  // ---- vũ khí sau lưng
  if (o.weapon === 'sword') {
    x.save(); x.translate(392, 232); x.rotate(-0.55 + PI);
    const bl = rect(-9, -40, 18, 560, 6); paint(x, bl, { fill: lg(x, -9, 0, 9, 0, ['#f4fbff', '#b9cde0', '#6f88a8']), line: '#2c3a52', lw: 1.5 });
    stroke(x, 'M0 -30 L0 500', 'rgba(255,255,255,.8)', 1.5);
    paint(x, rect(-30, -52, 60, 14, 6), { fill: lg(x, 0, -52, 0, -38, ['#ffe9a8', '#c99434', '#6a4410']), line: '#3a2406' });
    paint(x, rect(-7, -130, 14, 80, 5), { fill: lg(x, -7, 0, 7, 0, ['#5a3a6a', '#2a1832', '#12081a']), line: '#120812' });
    for (let i = 0; i < 6; i++) stroke(x, `M-7 ${-124 + i * 13} L7 ${-118 + i * 13}`, '#c99434', 2);
    paint(x, circ(0, -138, 10), { fill: rg(x, -3, -141, 1, 10, ['#fff2b8', '#d8a03a', '#6a4410']), line: '#3a2406' });
    stroke(x, 'M0 -138 C 20 -110 30 -60 14 -20', o.tassel || '#d23c3c', 3);
    x.restore();
  }
  // ---- tóc sau
  const bh = m ? `M300 90 C226 90 212 150 220 230 C222 300 214 360 210 430 C206 480 214 520 226 548 L246 520 L262 560 L284 528 L300 566 L316 528 L338 560 L354 520 L374 548 C386 520 394 480 390 430 C386 360 378 300 380 230 C388 150 374 90 300 90Z`
    : `M300 92 C228 92 210 150 216 226 C220 310 200 390 190 486 C182 566 194 616 210 650 L232 608 L250 662 L272 618 L300 672 L328 618 L350 662 L368 608 L390 650 C406 616 418 566 410 486 C400 390 380 310 384 226 C390 150 372 92 300 92Z`;
  HT(x, () => hairPaint(x, bh, HR, true));
  // ---- dải lụa bay phía sau
  if (o.ribbon) {
    const rb = o.ribbon; const L = [[204, 470], [150, 410], [96, 450], [76, 560], [92, 680], [56, 800], [18, 900]], Rt = [[396, 470], [452, 408], [508, 446], [528, 560], [512, 690], [548, 800], [592, 880]];
    for (const pts of [L, Rt]) { const p = band(pts, t => 8 + 34 * Math.abs(Math.cos(t * 7 + .6)) * (1 - t * .5), 20); fill(x, p, lg(x, 0, 380, 0, 900, [rgba(rb, .9), rgba(rb, .6), rgba(rb, .05)])); clip(x, p, () => { for (let i = 0; i < 5; i++) stroke(x, band(pts, t => 2, 20), 'rgba(255,255,255,.0)', 1); x.globalCompositeOperation = 'screen'; x.fillStyle = lg(x, 0, 380, 0, 900, ['rgba(255,255,255,.6)', 'rgba(255,255,255,0)', 'rgba(255,255,255,.4)', 'rgba(255,255,255,0)']); x.fill(p); }); stroke(x, p, rgba('#ffffff', .6), 1.2); }
  }
  // ---- váy dưới (lớp trong)
  const skirtIn = `M${cx - ww + 6} ${wY} C${cx - ww - 10} 660 ${cx - hw + 30} 850 ${cx - hw + 22} 958 Q${cx} 992 ${cx + hw - 22} 958 C${cx + hw - 30} 850 ${cx + ww + 10} 660 ${cx + ww - 6} ${wY}Z`;
  paint(x, skirtIn, { fill: lg(x, 0, wY, 0, 980, [IN[0], IN[1], IN[2]]), shade: [-18, -6, 14, rgba(IN[2], .8)], line: rgba(dk(IN[2], .5), .7) });
  // giày
  for (const s of [-1, 1]) paint(x, ell(X(s, 34), 978, 26, 10), { fill: lg(x, 0, 968, 0, 990, [TR[1], TR[2]]), line: dk(TR[2], .5) });
  // ---- áo choàng ngoài: hai vạt
  for (const s of [-1, 1]) {
    const pth = `M${cx} ${wY - 4} L${X(s, ww)} ${wY} C${X(s, ww + 22)} 660 ${X(s, hw - 6)} 840 ${X(s, hw)} 956 Q${X(s, hw * .55)} 990 ${X(s, 46)} 980 C${X(s, 40)} 860 ${X(s, 22)} 700 ${cx} ${wY - 4}Z`;
    paint(x, pth, { fill: lg(x, X(s, 0), 0, X(s, hw), 0, s < 0 ? [R3[0], R3[1], R3[2]] : [R3[1], R3[1], R3[2]]), shade: [s * 14, -10, 16, rgba(R3[2], .9)], rim: [s * -6, 6, 6, 'rgba(255,255,255,.7)'], line: rgba(dk(R3[2], .45), .8) });
    // nếp gấp
    clip(x, pth, () => {
      for (let i = 0; i < 5; i++) { const k = i / 4; const xa = X(s, 20 + k * (ww - 10)), xb = X(s, 50 + k * (hw - 40)); stroke(x, `M${xa} ${wY + 20} C${xa + s * 10} 680 ${xb - s * 18} 820 ${xb} 975`, rgba(R3[2], .35), 10, { blur: 6 }); stroke(x, `M${xa + s * 8} ${wY + 30} C${xa + s * 18} 680 ${xb - s * 6} 820 ${xb + s * 8} 975`, 'rgba(255,255,255,.35)', 3, { blur: 2 }); }
      // viền gấu áo
      const hem = band([[X(s, hw + 4), 950], [X(s, hw * .6), 984], [X(s, 46), 978]], () => 24);
      fill(x, hem, lg(x, 0, 950, 0, 990, [TR[0], TR[1], TR[2]])); motif(x, hem, TR[0]);
      const ed = band([[X(s, 46), 982], [X(s, 40), 860], [X(s, 22), 700], [cx + s * 2, wY]], () => 22); fill(x, ed, lg(x, X(s, 20), 0, X(s, 50), 0, [TR[0], TR[1], TR[2]])); motif(x, ed, TR[0]);
    });
    tex(x, pth, .18);
  }
  // ---- thân áo trên
  const up = `M${cx} 288 C${cx - 30} 294 ${X(-1, sw - 20)} 304 ${X(-1, sw - 18)} 316 C${X(-1, sw + 2)} 326 ${X(-1, sw + 6)} 356 ${X(-1, sw + 2)} 390 L${X(-1, ww + 8)} ${wY + 10} L${X(1, ww + 8)} ${wY + 10} L${X(1, sw + 2)} 390 C${X(1, sw + 6)} 356 ${X(1, sw + 2)} 326 ${X(1, sw - 18)} 316 C${X(1, sw - 20)} 304 ${cx + 30} 294 ${cx} 288Z`;
  paint(x, up, { fill: lg(x, 200, 290, 400, 520, [R3[0], R3[1], R3[2]]), shade: [-16, -10, 18, rgba(R3[2], .85)], rim: [6, 6, 8, 'rgba(255,255,255,.6)'], line: rgba(dk(R3[2], .45), .8) });
  // cổ áo chéo (giao lĩnh)
  clip(x, up, () => {
    fill(x, `M${cx - 22} 290 L${cx} 410 L${cx + 22} 290Z`, lg(x, 0, 290, 0, 410, [sk[1], sk[2]]));
    fill(x, band([[cx + 20, 286], [cx + 4, 360], [cx - 30, wY]], () => 30), lg(x, 0, 290, 0, 500, [IN[0], IN[1]]));
    const c1 = band([[cx + 24, 284], [cx + 8, 350], [cx - 34, wY]], () => 20); fill(x, c1, lg(x, 260, 0, 340, 0, [TR[0], TR[1], TR[2]])); motif(x, c1, TR[0]);
    const c2 = band([[cx - 24, 284], [cx - 4, 350], [cx + 40, wY]], () => 24); fill(x, rect(0, 0, 600, 1000), 'rgba(0,0,0,0)');
    x.save(); x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 8; x.shadowOffsetX = 4; fill(x, band([[cx - 20, 286], [cx + 6, 360], [cx + 44, wY]], () => 34), lg(x, 0, 290, 0, 500, [IN[0], IN[1]])); x.restore();
    fill(x, c2, lg(x, 260, 0, 340, 0, [TR[0], TR[1], TR[2]])); motif(x, c2, TR[0]);
    stroke(x, `M${cx - 12} 300 C${cx + 4} 360 ${cx + 20} 420 ${cx + 30} 500`, rgba(R3[2], .4), 2);
  });
  // ---- cổ + đầu
  const neck = `M${cx - 15} 236 L${cx - 16} 300 Q${cx} 314 ${cx + 16} 300 L${cx + 15} 236Z`;
  paint(x, neck, { fill: lg(x, 0, 240, 0, 300, [sk[1], sk[2]]), line: rgba(dk(sk[2], .6), .6) });
  fill(x, ell(cx, 262, 22, 12), rgba(dk(sk[2], .7), .45), { op: 'multiply', blur: 5 });
  // ---- đai lưng
  const sash = `M${X(-1, ww + 10)} ${wY - 34} Q${cx} ${wY - 44} ${X(1, ww + 10)} ${wY - 34} L${X(1, ww + 8)} ${wY + 10} Q${cx} ${wY} ${X(-1, ww + 8)} ${wY + 10}Z`;
  paint(x, sash, { fill: lg(x, 0, wY - 40, 0, wY + 10, [SA[0], SA[1], SA[2]]), shade: [-10, -4, 8, rgba(SA[2], .9)], line: dk(SA[2], .5) });
  stroke(x, `M${X(-1, ww + 9)} ${wY - 28} Q${cx} ${wY - 38} ${X(1, ww + 9)} ${wY - 28}`, '#e8c068', 2.2); stroke(x, `M${X(-1, ww + 8)} ${wY + 4} Q${cx} ${wY - 6} ${X(1, ww + 8)} ${wY + 4}`, '#e8c068', 2.2);
  // dải buộc + ngọc bội
  for (const s of [-1, 1]) { const p = band([[cx + s * 8, wY - 10], [cx + s * 20, wY + 80], [cx + s * 12, wY + 200], [cx + s * 26, wY + 300]], taper(16, 8)); paint(x, p, { fill: lg(x, 0, wY, 0, wY + 300, [SA[0], SA[1], SA[2]]), line: dk(SA[2], .5) }); }
  paint(x, ell(cx, wY - 12, 18, 14), { fill: rg(x, cx - 4, wY - 16, 1, 18, [SA[0], SA[1], SA[2]]), line: dk(SA[2], .5) });
  const jd = o.jade || '#7fe0b8'; stroke(x, `M${cx - 30} ${wY} L${cx - 34} ${wY + 70}`, '#c9a14a', 2);
  paint(x, circ(cx - 34, wY + 88, 17), { fill: rg(x, cx - 39, wY + 82, 1, 18, ['#ffffff', jd, dk(jd, .4)]), line: dk(jd, .35) }); fill(x, circ(cx - 34, wY + 88, 5), 'rgba(0,0,0,.25)');
  const ts = band([[cx - 34, wY + 104], [cx - 36, wY + 150], [cx - 32, wY + 190]], taper(10, 4)); fill(x, ts, lg(x, 0, wY + 104, 0, wY + 190, [o.tassel || '#e04a4a', dk(o.tassel || '#e04a4a', .5)]));
  // ---- tay áo
  for (const s of [-1, 1]) {
    const sl = `M${X(s, sw - 22)} 312 C${X(s, sw + 30)} 322 ${X(s, sw + 42)} 420 ${X(s, sw + 58)} 520 C${X(s, sw + 72)} 600 ${X(s, sw + 80)} 660 ${X(s, sw + 62)} 706 C${X(s, sw + 30)} 722 ${X(s, sw - 30)} 704 ${X(s, sw - 62)} 664 C${X(s, sw - 58)} 600 ${X(s, sw - 44)} 470 ${X(s, sw - 40)} 400Z`;
    // lòng tay áo (bên trong tối)
    paint(x, `M${X(s, sw + 62)} 706 C${X(s, sw + 30)} 722 ${X(s, sw - 30)} 704 ${X(s, sw - 62)} 664 C${X(s, sw - 30)} 650 ${X(s, sw + 30)} 676 ${X(s, sw + 62)} 706Z`, { fill: dk(R3[2], .45) });
    paint(x, sl, { fill: lg(x, X(s, sw - 40), 320, X(s, sw + 70), 700, s < 0 ? [R3[0], R3[1], R3[2]] : [R3[1], R3[1], R3[2]]), shade: [s * 18, -14, 20, rgba(R3[2], .9)], rim: [s * -8, 8, 8, 'rgba(255,255,255,.75)'], line: rgba(dk(R3[2], .45), .85) });
    clip(x, sl, () => {
      for (let i = 0; i < 3; i++) stroke(x, `M${X(s, sw - 10 + i * 18)} 360 C${X(s, sw + i * 22)} 480 ${X(s, sw + 4 + i * 26)} 600 ${X(s, sw - 4 + i * 24)} 700`, rgba(R3[2], .3), 9, { blur: 6 });
      const cf = band([[X(s, sw + 66), 700], [X(s, sw + 20), 716], [X(s, sw - 30), 700], [X(s, sw - 64), 662]], () => 26); fill(x, cf, lg(x, 0, 660, 0, 720, [TR[0], TR[1], TR[2]])); motif(x, cf, TR[0]);
    });
    tex(x, sl, .16);
  }
  if (o.ribbon) for (const s of [-1, 1]) { const p = band([[X(s, sw - 10), 470], [X(s, sw + 30), 520], [X(s, sw + 64), 520]], leaf(24)); fill(x, p, rgba(o.ribbon, .8)); stroke(x, p, 'rgba(255,255,255,.5)', 1); }
  HT(x, () => {
  // ---- mặt
  const face = m ? `M248 168 C247 216 266 250 300 272 C334 250 353 216 352 168 C352 110 248 110 248 168Z` : `M251 168 C249 214 266 246 300 266 C334 246 351 214 349 168 C349 114 251 114 251 168Z`;
  for (const s of [-1, 1]) paint(x, ell(X(s, m ? 52 : 49), 206, 9, 16, s * .2), { fill: sk[1], line: rgba(dk(sk[2], .6), .6) });
  paint(x, face, { fill: lg(x, 0, 140, 0, 270, [sk[0], sk[1]]), shade: [-12, -10, 14, rgba(sk[2], .7)], line: rgba(dk(sk[2], .55), .7), lw: 1.4 });
  if (o.horn) for (const s of [-1, 1]) paint(x, `M${X(s, 30)} 128 C${X(s, 40)} 90 ${X(s, 66)} 60 ${X(s, 96)} 50 C${X(s, 70)} 76 ${X(s, 56)} 106 ${X(s, 50)} 140Z`, { fill: lg(x, 0, 140, 0, 50, ['#2a1018', '#6a2030', '#e8b0a0']), line: '#12060a', rim: [s * -3, 3, 3, 'rgba(255,220,200,.6)'] });
  fill(x, ell(273, 236, 15, 8), 'rgba(255,120,130,.32)', { blur: 6 }); fill(x, ell(327, 236, 15, 8), 'rgba(255,120,130,.32)', { blur: 6 });
  // mắt
  const ey = m ? 208 : 207;
  for (const s of [-1, 1]) eye(x, X(s, 25), ey + 3, s, m, o.eye || '#3c62c8', o.eyeGlow);
  // lông mày
  for (const s of [-1, 1]) stroke(x, m ? `M${X(s, 10)} 186 Q${X(s, 26)} 178 ${X(s, 44)} 184` : `M${X(s, 12)} 188 Q${X(s, 26)} 182 ${X(s, 40)} 186`, dk(HR[1], .9), m ? 3.4 : 2.2);
  stroke(x, 'M301 226 L298 235 L302 236', rgba(dk(sk[2], .6), .6), 1.4);
  stroke(x, m ? 'M291 250 Q300 253 309 250' : 'M293 247 Q300 251 307 247', o.lip || '#c0585e', m ? 1.8 : 2.2);
  if (!m) fill(x, ell(300, 249, 4, 1.6), 'rgba(230,110,120,.5)');
  if (o.mark) { paint(x, `M300 160 L296 170 L300 180 L304 170Z`, { fill: o.mark }); glow(x, 300, 170, 14, o.mark, .5); }
  if (o.beard) {
    const bd = 'M262 244 C264 300 280 360 300 400 C320 360 336 300 338 244 C324 262 312 268 300 268 C288 268 276 262 262 244Z';
    hairPaint(x, bd, o.beardC || ['#f4f4f8', '#c8cad6', '#8a8ca0'], false);
    for (const s of [-1, 1]) { const p = band([[X(s, 6), 252], [X(s, 30), 256], [X(s, 50), 276], [X(s, 54), 300]], taper(7, 1)); fill(x, p, '#e8eaf0'); }
  }
  // ---- tóc trước
  frontHair(x, o, m, HR);
  if (o.fox) for (const s of [-1, 1]) { const e = `M${X(s, 30)} 118 C${X(s, 40)} 80 ${X(s, 60)} 50 ${X(s, 82)} 36 C${X(s, 90)} 70 ${X(s, 86)} 104 ${X(s, 70)} 132Z`; paint(x, e, { fill: lg(x, 0, 36, 0, 132, [HR[0], HR[1], HR[2]]), line: dk(HR[2], .5) }); fill(x, `M${X(s, 42)} 112 C${X(s, 50)} 86 ${X(s, 62)} 66 ${X(s, 76)} 54 C${X(s, 80)} 80 ${X(s, 76)} 100 ${X(s, 66)} 120Z`, '#ffd8e0'); }
  // ---- trang sức đầu
  if (o.crown) crown(x, o.crown, m);
  if (o.pins) for (const [px, py, c] of o.pins) { stroke(x, `M${px} ${py} L${px + (px < 300 ? -46 : 46)} ${py - 30}`, '#d8b45a', 3); paint(x, circ(px, py, 9), { fill: rg(x, px - 3, py - 3, 1, 9, ['#fff', c, dk(c, .4)]), line: dk(c, .3) }); for (let k = 0; k < 3; k++) { stroke(x, `M${px} ${py + 8} L${px + (k - 1) * 6} ${py + 40 + k * 8}`, '#e8c86a', 1.2); fill(x, circ(px + (k - 1) * 6, py + 44 + k * 8, 3.5), c); } }
  if (o.flower) { const [fx, fy, fc] = o.flower; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; paint(x, ell(fx + Math.cos(a) * 11, fy + Math.sin(a) * 11, 10, 7, a), { fill: rg(x, fx, fy, 2, 20, ['#fff', fc]), line: dk(fc, .6), lw: 1 }); } fill(x, circ(fx, fy, 5), '#ffd860'); }
  });
  // ---- đuôi cáo (vẽ sau cùng phía dưới để thấy rõ)
  if (o.tails) { x.save(); x.globalCompositeOperation = 'destination-over'; for (let i = 0; i < o.tails; i++) { const a = (i - (o.tails - 1) / 2) * .38; const ex = 300 + Math.sin(a) * 300, ey = 640 - Math.cos(a) * 260; const p = band([[300, 640], [300 + Math.sin(a) * 120, 640 - Math.cos(a) * 60], [ex, ey], [ex + Math.sin(a) * 40, ey - 60]], leaf(110, .7)); paint(x, p, { fill: lg(x, 300, 640, ex, ey, [HR[2], HR[1], '#fff6ea']), line: dk(HR[2], .5) }); } x.restore(); }
  if (o.fx) o.fx(x);
  grain(x, .06);
}
function HT(x, fn) { x.save(); x.translate(300, 300); x.scale(.86, .86); x.translate(-300, -300); fn(); x.restore(); }
function motif(x, p, col) { clip(x, p, () => { x.globalAlpha = .55; for (let i = 0; i < 40; i++) { const X = rr(0, 600), Y = rr(250, 1000); stroke(x, `M${X} ${Y} q5 -7 10 0 q5 7 10 0`, col, 1.4); } x.globalAlpha = 1; stroke(x, p, 'rgba(232,192,104,.9)', 2.4); }); }
function hairPaint(x, d, HR, back) {
  const p = P(d);
  fill(x, p, lg(x, 0, 90, 0, 680, back ? [HR[1], HR[1], dk(HR[1], .8)] : [HR[0], HR[1], HR[1]]));
  clip(x, p, () => {
    for (let i = 0; i < 70; i++) { const sx = rr(200, 400), ex = sx + (sx - 300) * rr(.1, .6); const pth = band([[300 + (sx - 300) * .2, 90], [sx, 260], [ex, 680]], taper(rr(3, 9), 0)); fill(x, pth, rnd() < .5 ? rgba(HR[0], .22) : rgba(dk(HR[1], .5), .35)); }
  });
  cres(x, p, -10, -8, 12, rgba(dk(HR[1], .5), 1), 'multiply', .8);
  cres(x, p, 5, 6, 5, rgba(HR[2], 1), 'screen', .7);
  stroke(x, p, rgba(dk(HR[1], .4), .9), 1.6);
}
function frontHair(x, o, m, HR) {
  const st = o.hs || (m ? 'top' : 'long');
  const lock = (pts, w, k = 1) => { const p = band(pts, t => w * Math.min(1, .3 + t * 2.6) * Math.pow(1 - t, k) + .5); paint(x, p, { fill: lg(x, 0, pts[0][1], 0, pts[pts.length - 1][1], [HR[1], dk(HR[1], .85)]), rim: [2, 3, 3, rgba(HR[2], .85)], shade: [-3, -2, 4, rgba(dk(HR[1], .4), 1), .6], line: rgba(dk(HR[1], .35), .9), lw: 1.1 }); };
  if (st === 'top') paint(x, ell(300, 74, 28, 24), { fill: rg(x, 290, 64, 2, 32, [HR[2], HR[1], dk(HR[1], .6)]), line: dk(HR[1], .4) });
  if (st === 'bun') for (const s of [-1, 1]) paint(x, circ(300 + s * 56, 100, 27), { fill: rg(x, 300 + s * 56 - 7, 92, 2, 30, [HR[2], HR[1], dk(HR[1], .6)]), line: dk(HR[1], .4) });
  // chỏm tóc bao đầu (rộng hơn mặt)
  const cap = P(`M232 232 C210 120 258 76 300 76 C342 76 390 120 368 232 C360 190 344 158 300 150 C256 158 240 190 232 232Z`);
  fill(x, cap, lg(x, 0, 76, 0, 232, [HR[1], HR[1], dk(HR[1], .85)]));
  clip(x, cap, () => { for (let i = 0; i < 46; i++) { const sx = rr(228, 372); fill(x, band([[300, st === 'top' ? 78 : 92], [300 + (sx - 300) * .7, 140], [sx + (sx - 300) * .15, 236]], taper(rr(2, 6), 0)), rnd() < .5 ? rgba(HR[0], .28) : rgba(dk(HR[1], .5), .3)); } });
  clip(x, cap, () => fill(x, band([[238, 146], [266, 108], [300, 100], [334, 108], [362, 146]], t => 10 + 6 * Math.sin(t * PI)), rgba(HR[2], .6), { blur: 4 }));
  cres(x, cap, -8, -6, 10, rgba(dk(HR[1], .5), 1), 'multiply', .7);
  stroke(x, cap, rgba(dk(HR[1], .4), .9), 1.5);
  // bóng tóc trên trán
  clip(x, P(m ? 'M248 168 C247 216 266 250 300 272 C334 250 353 216 352 168 C352 110 248 110 248 168Z' : 'M251 168 C249 214 266 246 300 266 C334 246 351 214 349 168 C349 114 251 114 251 168Z'), () => fill(x, rect(200, 140, 200, 50), 'rgba(110,50,70,.3)', { blur: 9, op: 'multiply' }));
  // tóc mái: các lọn toả ra từ đỉnh đầu, cong mềm
  const L = m ? [[-44, 212, -10], [-28, 196, -6], [-10, 186, 4], [8, 178, 10], [24, 192, 10], [40, 206, 8], [-52, 232, -8], [52, 228, 8]]
    : [[-46, 214, -12], [-32, 202, -8], [-16, 194, -2], [2, 190, 6], [18, 196, 10], [34, 204, 12], [48, 214, 10], [-54, 240, -6], [54, 236, 6]];
  for (const [dx, ty, bd] of L) lock([[300 + dx * .25, 96], [300 + dx * .8 + bd * .4, 140], [300 + dx + bd, ty - 22], [300 + dx + bd * 1.6, ty]], m ? 24 : 26, 1.15);
  // tóc mai hai bên
  for (const s of [-1, 1]) {
    lock([[300 + s * 44, 140], [300 + s * 56, 200], [300 + s * 54, 262], [300 + s * 62, m ? 320 : 360], [300 + s * 58, m ? 350 : 420]], m ? 22 : 26, .9);
    if (!m || st === 'long') lock([[300 + s * 58, 190], [300 + s * 72, 270], [300 + s * 66, 350], [300 + s * 80, 430], [300 + s * 74, m ? 470 : 520]], 22, .9);
    if (!m) lock([[300 + s * 50, 200], [300 + s * 64, 280], [300 + s * 56, 340], [300 + s * 64, 400]], 14, 1);
  }
}
function eye(x, cx, cy, s, m, ic, glowC) {
  const X = u => cx + s * u;
  const h = m ? 14 : 21, q = m ? 1.15 : 1.28;
  const wh = `M${X(-15 * q)} ${cy + 3} Q${X(-2)} ${cy - h} ${X(17 * q)} ${cy - 3 - (m ? 3 : 0)} Q${X(6)} ${cy + h * .85} ${X(-15 * q)} ${cy + 3}Z`;
  fill(x, wh, '#fffdfb');
  clip(x, wh, () => {
    const ix = X(1), iy = cy - 3;
    fill(x, ell(ix, iy + 1, m ? 10 : 12.5, m ? 12.5 : 15.5), lg(x, 0, iy - 13, 0, iy + 14, [dk(ic, .3), ic, '#e0f4ff']));
    stroke(x, ell(ix, iy + 1, m ? 10 : 12.5, m ? 12.5 : 15.5), dk(ic, .3), 1.2);
    fill(x, ell(ix, iy + 1, 4.5, 6.5), dk(ic, .15));
    fill(x, ell(ix, iy + 7, 7, 4), 'rgba(255,255,255,.35)', { blur: 2 });
    fill(x, rect(cx - 30, cy - 20, 60, 12), 'rgba(40,20,30,.35)', { blur: 3 });
    fill(x, circ(ix - s * 3, iy - 4.5, m ? 2.4 : 3.2), '#fff'); fill(x, circ(ix + s * 3, iy + 4, 1.4), 'rgba(255,255,255,.8)');
    if (glowC) glow(x, ix, iy, 12, glowC, .9);
  });
  stroke(x, `M${X(-17 * q)} ${cy + 3} Q${X(-2)} ${cy - h - 2} ${X(18 * q)} ${cy - 4 - (m ? 3 : 0)} L${X(23 * q)} ${cy - (m ? 9 : 8)}`, '#2a1618', m ? 3.6 : 4.2);
  stroke(x, `M${X(-2)} ${cy + h * .78} Q${X(8)} ${cy + h * .75} ${X(15)} ${cy + 4}`, 'rgba(120,60,60,.35)', 1);
  if (!m) stroke(x, `M${X(14)} ${cy - 6} L${X(20)} ${cy - 11}`, '#2a1618', 1.6);
}
function crown(x, c, m) {
  const G = c === 'jade' ? ['#eafff4', '#58c49a', '#185a3c'] : c === 'dark' ? ['#c8a8d8', '#4a2a5a', '#12061a'] : ['#fff4c0', '#d8a43c', '#5e3a0a'];
  const p = m ? 'M278 92 C278 64 286 52 300 46 C314 52 322 64 322 92Z' : 'M270 104 C276 84 288 74 300 70 C312 74 324 84 330 104 Q300 96 270 104Z';
  paint(x, p, { fill: lg(x, 0, 46, 0, 96, [G[0], G[1], G[2]]), rim: [3, 3, 2, 'rgba(255,255,255,.8)'], line: dk(G[2], .5) });
  paint(x, circ(300, m ? 70 : 88, 6), { fill: rg(x, 298, m ? 68 : 86, 1, 7, ['#fff', '#7fd8ff', '#1a4a8a']) });
  stroke(x, m ? 'M248 84 L352 70' : 'M246 100 L354 92', '#e8c46a', 3.5); stroke(x, m ? 'M248 84 L352 70' : 'M246 100 L354 92', 'rgba(255,255,255,.6)', 1);
  for (const [px, py] of m ? [[246, 84], [354, 70]] : [[244, 100], [356, 92]]) paint(x, circ(px, py, 5), { fill: G[1], line: dk(G[2], .5) });
}
const NVS = {
  'nv-kiem-tu': { sex: 'm', robe: ['#ffffff', '#e4ecf6', '#8ea2c2'], trim: ['#b8d8ff', '#3c6ec4', '#162c66'], sash: ['#5a6ea8', '#22305e', '#0c1430'], hair: ['#56557a', '#191826', '#9aa6d8'], eye: '#3a6ad0', crown: 'gold', weapon: 'sword', hs: 'top', ribbon: '#bfe2ff', aura: '#a8d4ff' },
  'nv-tien-nu': { sex: 'f', robe: ['#fffafc', '#f7dbe6', '#c88aa6'], trim: ['#ffe0ec', '#e17aa8', '#7a2450'], sash: ['#ffd0e2', '#d0588e', '#5e1638'], hair: ['#4a3a4e', '#171019', '#a08ab0'], eye: '#c0508a', pins: [[262, 118, '#ff8ab8'], [338, 112, '#9ad8ff']], flower: [258, 132, '#ffb4d0'], ribbon: '#ffc2dc', aura: '#ffd0e4', hs: 'long' },
  'nv-su-phu': { sex: 'm', robe: ['#ffffff', '#e8e6e0', '#9a968a'], trim: ['#f2e2b8', '#b08a3c', '#4e3a10'], sash: ['#8a7a5a', '#4a3e26', '#1a140a'], hair: ['#ffffff', '#c6c8d4', '#ffffff'], beard: 1, eye: '#6a6a7a', crown: 'jade', hs: 'top', skin: SK.b, aura: '#fff2c0' },
  'nv-ma-tu': { sex: 'm', robe: ['#6a3a48', '#2a1018', '#0a0408'], trim: ['#ff9a8a', '#c0182c', '#4a0410'], sash: ['#3a1018', '#1a060a', '#000'], inner: ['#4a2a30', '#2a1418', '#100608'], hair: ['#8a2a3a', '#1a0a10', '#ff6a7a'], eye: '#ff2a3a', eyeGlow: '#ff3a3a', horn: 1, skin: SK.ma, hs: 'long', mark: '#ff2a40', aura: '#ff3a4a', crown: 'dark', tassel: '#ff2a3a', jade: '#ff4a5a' },
  'nv-ho-ly': { sex: 'f', robe: ['#fffaf2', '#ffe2c4', '#d28a5a'], trim: ['#ffd8b0', '#e8743a', '#6a2a0a'], sash: ['#ffb08a', '#d24a2a', '#5a1808'], hair: ['#ffd8b8', '#e8864a', '#fff0d8'], eye: '#e8a020', fox: 1, tails: 5, hs: 'long', ribbon: '#ffd2a8', aura: '#ffb87a', pins: [[336, 112, '#ff6a4a']] },
  'nv-bang-co': { sex: 'f', robe: ['#ffffff', '#ddf2ff', '#7eaad0'], trim: ['#e0f6ff', '#58b0e0', '#16507a'], sash: ['#c0e8ff', '#3a8ac0', '#0e3458'], hair: ['#eaf6ff', '#a8c8e8', '#ffffff'], eye: '#3ab0f0', skin: SK.pale, hs: 'bun', ribbon: '#d8f2ff', aura: '#b0e4ff', pins: [[300, 82, '#a8e8ff']], jade: '#c8f0ff' },
  'nv-loi-tuong': { sex: 'm', robe: ['#efe6ff', '#9a7ad8', '#3a2a6a'], trim: ['#fff0b0', '#d8a830', '#5a3a06'], sash: ['#ffe08a', '#b07a10', '#3a2400'], hair: ['#7a7aa8', '#1e1a30', '#c8b8ff'], eye: '#a070ff', eyeGlow: '#c8a0ff', crown: 'gold', hs: 'long', weapon: 'sword', aura: '#c8a8ff', tassel: '#8a5aff' },
  'nv-moc-linh': { sex: 'f', robe: ['#fbfff4', '#d8f0c4', '#6aa05a'], trim: ['#e8ffd0', '#68b048', '#22501a'], sash: ['#c8e8a8', '#4a8a30', '#183a10'], hair: ['#b8e0a0', '#3a6a3a', '#e8ffd0'], eye: '#3a9a5a', hs: 'long', flower: [340, 128, '#ffe28a'], ribbon: '#d8f8c0', aura: '#c8f0a8' },
  'nv-de-tu': { sex: 'm', robe: ['#f8fbff', '#cfe0ef', '#6e8aa8'], trim: ['#d8ecff', '#5a86b8', '#1e3a5e'], hair: ['#4a4a58', '#141420', '#8a8aa8'], eye: '#5a6a8a', hs: 'top', crown: 'jade' },
};
for (const [k, o] of Object.entries(NVS)) A[k] = { w: 600, h: 1000, draw: x => nv(x, o) };
