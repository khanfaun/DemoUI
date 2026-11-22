// Quái vật, tọa kỵ, nhân vật nhỏ (400x400) — vẽ tay bằng canvas
function flame(x, cx, cy, h, w, cols, n = 9) {
  for (let i = 0; i < n; i++) { const t = i / (n - 1), ww = w * (1 - t * .7), hh = h * (1 - t * .45); const ox = rr(-w * .15, w * .15);
    const p = `M${cx - ww / 2} ${cy} C${cx - ww / 2} ${cy - hh * .5} ${cx + ox - ww * .2} ${cy - hh * .7} ${cx + ox} ${cy - hh} C${cx + ox + ww * .25} ${cy - hh * .7} ${cx + ww / 2} ${cy - hh * .5} ${cx + ww / 2} ${cy} C${cx + ww / 2} ${cy + ww * .4} ${cx - ww / 2} ${cy + ww * .4} ${cx - ww / 2} ${cy}Z`;
    fill(x, p, lg(x, 0, cy - hh, 0, cy + ww * .3, [cols[Math.min(cols.length - 1, i * cols.length / n | 0)], cols[Math.min(cols.length - 1, (i * cols.length / n | 0) + 1)] || cols[0]]), { a: .55 + t * .4, op: 'lighter', blur: 1.5 }); }
}
function eyes2(x, cx, cy, d, r, col = '#fff', pupil = '#1a0a0a') { for (const s of [-1, 1]) { fill(x, ell(cx + s * d, cy, r, r * 1.25), col); fill(x, ell(cx + s * d + s * r * .1, cy + r * .15, r * .5, r * .7), pupil); fill(x, circ(cx + s * d - r * .3, cy - r * .4, r * .3), '#fff'); } }
const Q = {
  'q-hoa-linh': x => { glow(x, 200, 230, 190, 'rgba(255,120,30,.6)'); flame(x, 200, 300, 260, 220, ['#5a0a00', '#d8300a', '#ff8a1a', '#ffd84a', '#fff8d0'], 12);
    for (const s of [-1, 1]) flame(x, 200 + s * 110, 260, 90, 60, ['#d8300a', '#ff8a1a', '#ffe070'], 6);
    eyes2(x, 200, 220, 34, 16, '#fffbe0', '#7a1a00'); stroke(x, 'M180 262 Q200 276 220 262', '#7a1a00', 4); dots(x, 40, [60, 40, 340, 330], '#ffd070', 3); },
  'q-bang-tinh': x => { glow(x, 200, 220, 190, 'rgba(120,210,255,.55)');
    const cr = [[200, 60, 46, 0], [138, 120, 34, -.5], [262, 110, 36, .45], [96, 200, 26, -.9], [304, 190, 28, .9], [170, 150, 30, -.2], [236, 160, 30, .25]];
    for (const [cx, cy, w, a] of cr.slice().reverse()) { x.save(); x.translate(200, 320); x.rotate(a); const L = 320 - cy, p = `M0 ${-L} L${w} ${-L * .7} L${w * .8} 0 L${-w * .8} 0 L${-w} ${-L * .7}Z`;
      paint(x, p, { fill: lg(x, -w, -L, w, 0, ['#ffffff', '#a8e6ff', '#3a86c8', '#16406e']), rim: [4, 4, 3, 'rgba(255,255,255,.9)'], line: 'rgba(20,60,110,.8)', lw: 2 }); stroke(x, `M0 ${-L} L0 0`, 'rgba(255,255,255,.7)', 2); x.restore(); }
    paint(x, ell(200, 330, 130, 34), { fill: lg(x, 0, 300, 0, 360, ['#e8f8ff', '#7ab8e0', '#2a5a8a']), line: '#1a4a7a' });
    glow(x, 200, 220, 60, 'rgba(220,250,255,1)'); eyes2(x, 200, 220, 22, 11, '#e8ffff', '#0a3a6a'); for (let i = 0; i < 12; i++) spark(x, rr(70, 330), rr(40, 320), rr(4, 9)); },
  'q-doi-ma': x => { glow(x, 200, 200, 180, 'rgba(160,40,200,.45)');
    for (const s of [-1, 1]) { const w = `M${200 + s * 40} 170 C${200 + s * 90} 90 ${200 + s * 150} 70 ${200 + s * 190} 90 C${200 + s * 180} 140 ${200 + s * 186} 180 ${200 + s * 170} 230 C${200 + s * 150} 210 ${200 + s * 130} 214 ${200 + s * 118} 240 C${200 + s * 100} 216 ${200 + s * 80} 220 ${200 + s * 66} 246 C${200 + s * 56} 220 ${200 + s * 44} 214 ${200 + s * 34} 220Z`;
      paint(x, w, { fill: lg(x, 200, 80, 200 + s * 190, 240, ['#7a3aa0', '#3a1458', '#12041e']), rim: [0, 6, 5, 'rgba(220,150,255,.6)'], line: '#0a0010', lw: 2 });
      for (const [ex, ey] of [[190, 90], [170, 230], [118, 240], [66, 246]]) stroke(x, `M${200 + s * 44} 172 L${200 + s * ex} ${ey}`, 'rgba(20,0,30,.6)', 3); }
    paint(x, ell(200, 200, 52, 62), { fill: rg(x, 186, 180, 6, 70, ['#8a4ab0', '#3a1458', '#12041e']), line: '#0a0010', lw: 2 });
    for (const s of [-1, 1]) paint(x, `M${200 + s * 18} 150 L${200 + s * 40} 104 L${200 + s * 44} 158Z`, { fill: '#2a0a3a', line: '#0a0010' });
    fill(x, ell(184, 190, 9, 7), '#ff3a3a', { sh: '#ff2020', sb: 14 }); fill(x, ell(216, 190, 9, 7), '#ff3a3a', { sh: '#ff2020', sb: 14 });
    stroke(x, 'M180 222 Q200 232 220 222', '#0a0010', 3); for (const s of [-1, 1]) fill(x, `M${200 + s * 10} 224 L${200 + s * 14} 240 L${200 + s * 18} 226Z`, '#fff'); },
  'q-thach-quai': x => { glow(x, 200, 220, 190, 'rgba(60,220,200,.3)');
    const rock = (p, c = ['#b8b0a0', '#6a6458', '#2a2620']) => { paint(x, p, { fill: lg(x, 0, 40, 0, 380, c), shade: [-10, -10, 10, 'rgba(20,18,14,.9)'], rim: [5, 5, 4, 'rgba(255,250,230,.6)'], tex: .5, line: '#1a1814', lw: 2 }); };
    rock('M120 230 L90 300 L104 370 L170 376 L176 300Z'); rock('M280 230 L310 300 L296 370 L230 376 L224 300Z');
    rock('M110 130 L290 124 L320 240 L270 320 L130 322 L84 236Z'); rock('M40 150 L100 130 L120 220 L90 300 L40 290 L22 210Z'); rock('M360 150 L300 130 L280 220 L310 300 L360 290 L378 210Z');
    rock('M150 50 L250 46 L274 120 L240 156 L160 158 L126 116Z', ['#c8c0b0', '#7a7464', '#2e2a22']);
    for (const d of ['M150 180 L190 220 L170 270', 'M250 170 L220 230 L240 290', 'M60 200 L80 250', 'M340 200 L320 250']) stroke(x, d, '#6afff0', 4, { glow: '#3affe8', gb: 14 });
    fill(x, ell(176, 104, 12, 8), '#9affff', { sh: '#3affe8', sb: 18 }); fill(x, ell(224, 104, 12, 8), '#9affff', { sh: '#3affe8', sb: 18 }); },
  'q-xa-yeu': x => { glow(x, 200, 220, 190, 'rgba(80,220,120,.35)');
    const body = band([[60, 360], [160, 330], [290, 340], [330, 270], [240, 230], [130, 220], [110, 160], [190, 120]], t => 34 + 22 * Math.sin(t * PI), 18);
    paint(x, body, { fill: lg(x, 0, 120, 0, 380, ['#9ae86a', '#3a8a3a', '#0e3a1a']), shade: [-6, -10, 10, 'rgba(0,30,10,.9)'], rim: [4, 4, 4, 'rgba(220,255,180,.7)'], line: '#062010', lw: 2 });
    clip(x, body, () => { for (let i = 0; i < 160; i++) { const X = rr(40, 360), Y = rr(100, 380); stroke(x, `M${X - 6} ${Y} Q${X} ${Y + 6} ${X + 6} ${Y}`, 'rgba(10,50,20,.5)', 1.5); } });
    const hd = 'M170 128 C170 80 210 60 250 66 C290 74 310 100 300 128 C290 150 250 160 220 156 C196 152 172 146 170 128Z';
    paint(x, hd, { fill: lg(x, 0, 60, 0, 160, ['#b8f08a', '#4aa04a', '#14461e']), rim: [4, 4, 4, 'rgba(230,255,200,.7)'], line: '#062010', lw: 2 });
    for (const s of [0, 1]) paint(x, `M${214 + s * 50} 76 C${206 + s * 54} 40 ${226 + s * 60} 20 ${246 + s * 60} 18 C${236 + s * 56} 40 ${236 + s * 54} 60 ${232 + s * 50} 82Z`, { fill: lg(x, 0, 18, 0, 82, ['#fff4c0', '#c8a040', '#5a3a0a']), line: '#3a2406' });
    fill(x, ell(230, 102, 10, 7, -.3), '#ffe23a', { sh: '#ffcc00', sb: 12 }); fill(x, ell(274, 100, 9, 6, .2), '#ffe23a', { sh: '#ffcc00', sb: 12 }); fill(x, ell(230, 102, 2.5, 6), '#1a1000'); fill(x, ell(274, 100, 2.5, 5), '#1a1000');
    stroke(x, 'M296 130 L330 140 L340 130 M330 140 L342 150', '#e83a4a', 3); },
  'q-quy-dang': x => { glow(x, 200, 200, 180, 'rgba(120,255,200,.4)');
    for (let i = 0; i < 4; i++) { const p = band([[200 + (i - 1.5) * 30, 300], [200 + (i - 1.5) * 44, 340], [200 + (i - 1.5) * 30 + rr(-30, 30), 390]], taper(26, 0)); fill(x, p, 'rgba(150,255,210,.55)', { blur: 3 }); }
    paint(x, rect(160, 40, 80, 26, 6), { fill: lg(x, 0, 40, 0, 66, ['#5a3a2a', '#2a1810']), line: '#100804' });
    const lb = 'M200 66 C110 70 90 140 96 190 C102 250 140 300 200 304 C260 300 298 250 304 190 C310 140 290 70 200 66Z';
    paint(x, lb, { fill: rg(x, 200, 180, 10, 150, ['#fff8d0', '#ffa84a', '#c0380a', '#5a1000']), line: '#3a0a00', lw: 2 });
    clip(x, lb, () => { for (let i = -3; i <= 3; i++) stroke(x, `M${200 + i * 30} 66 Q${200 + i * 48} 185 ${200 + i * 30} 304`, 'rgba(90,20,0,.45)', 2); });
    glow(x, 200, 190, 90, 'rgba(255,230,140,.6)');
    paint(x, rect(170, 300, 60, 18, 5), { fill: lg(x, 0, 300, 0, 318, ['#5a3a2a', '#2a1810']), line: '#100804' });
    fill(x, ell(170, 180, 18, 10, .3), '#2a0400'); fill(x, ell(230, 180, 18, 10, -.3), '#2a0400'); fill(x, circ(172, 180, 4), '#a8ffe0', { sh: '#6affc8', sb: 10 }); fill(x, circ(228, 180, 4), '#a8ffe0', { sh: '#6affc8', sb: 10 });
    fill(x, 'M160 222 Q200 262 240 222 Q200 236 160 222Z', '#2a0400'); for (const k of [-1, 0, 1]) fill(x, `M${200 + k * 18 - 6} 228 L${200 + k * 18} 240 L${200 + k * 18 + 6} 229Z`, '#fff8e0'); },
  'q-moc-yeu': x => { glow(x, 200, 200, 180, 'rgba(150,255,100,.3)');
    for (const s of [-1, 1]) { const ar = band([[200 + s * 50, 200], [200 + s * 110, 170], [200 + s * 150, 110], [200 + s * 170, 70]], taper(30, 6)); paint(x, ar, { fill: lg(x, 0, 70, 0, 220, ['#a8784a', '#5a3a1a', '#2a1808']), line: '#1a0e04', lw: 2, tex: .5 }); }
    const tr = 'M140 380 C150 300 130 200 150 120 C170 80 230 80 250 120 C270 200 250 300 260 380 C240 360 220 390 200 370 C180 392 160 360 140 380Z';
    paint(x, tr, { fill: lg(x, 140, 0, 260, 0, ['#b88a5a', '#6a4422', '#2a1808']), shade: [-10, 0, 10, 'rgba(20,10,0,.8)'], tex: .6, line: '#1a0e04', lw: 2 });
    clip(x, tr, () => { for (let i = 0; i < 14; i++) stroke(x, `M${rr(150, 250)} ${rr(120, 200)} q${rr(-10, 10)} 60 ${rr(-6, 6)} 140`, 'rgba(30,15,0,.5)', 3); });
    for (let i = 0; i < 26; i++) { const a = rr(-PI, 0), r = rr(60, 150); paint(x, ell(200 + Math.cos(a) * r * 1.2, 100 + Math.sin(a) * r * .55, rr(20, 34), rr(14, 22), rr(0, 3)), { fill: rg(x, 200, 40, 10, 160, ['#d8ff8a', '#5aa83a', '#1a4a14']), line: 'rgba(10,40,10,.7)' }); }
    fill(x, ell(176, 190, 12, 16), '#1a0e04'); fill(x, ell(224, 190, 12, 16), '#1a0e04'); fill(x, circ(176, 192, 5), '#d0ff6a', { sh: '#aaff3a', sb: 10 }); fill(x, circ(224, 192, 5), '#d0ff6a', { sh: '#aaff3a', sb: 10 });
    fill(x, 'M176 240 Q200 270 224 240 Q200 252 176 240Z', '#1a0e04'); },
};
for (const [k, f] of Object.entries(Q)) A[k] = { w: 400, h: 400, draw: x => { f(x); grain(x, .05); } };

// --------- tọa kỵ ---------
const MT = {
  'mt-hac': x => { glow(x, 200, 200, 190, 'rgba(255,240,200,.35)');
    for (const s of [-1, 1]) { const w = `M${200 + s * 20} 200 C${200 + s * 60} 120 ${200 + s * 130} 60 ${200 + s * 190} 40 C${200 + s * 170} 90 ${200 + s * 160} 140 ${200 + s * 120} 190 C${200 + s * 90} 220 ${200 + s * 50} 230 ${200 + s * 20} 230Z`;
      paint(x, w, { fill: lg(x, 200, 200, 200 + s * 190, 40, ['#ffffff', '#eef0f6', '#c8ccd8']), shade: [s * -8, -10, 10, 'rgba(120,130,160,.6)'], line: '#4a4e60', lw: 1.5 });
      clip(x, w, () => { fill(x, `M${200 + s * 150} 30 L${200 + s * 210} 30 L${200 + s * 200} 200 L${200 + s * 110} 200Z`, '#22222c'); for (let i = 0; i < 7; i++) stroke(x, `M${200 + s * (40 + i * 18)} 220 L${200 + s * (80 + i * 18)} ${150 - i * 14}`, 'rgba(90,100,130,.5)', 1.5); }); }
    paint(x, 'M140 230 C150 190 230 180 270 210 C290 230 280 260 250 270 C210 280 160 270 140 230Z', { fill: lg(x, 0, 180, 0, 280, ['#ffffff', '#e8eaf2', '#a8acc0']), line: '#4a4e60', lw: 1.5 });
    fill(x, 'M140 232 L90 260 L110 236 L80 240 L130 220Z', '#2a2a34');
    const nk = band([[250, 214], [282, 170], [268, 120], [292, 86]], taper(20, 10)); paint(x, nk, { fill: '#f4f4fa', line: '#4a4e60', lw: 1.5 });
    clip(x, nk, () => fill(x, rect(240, 110, 80, 60), '#22222c'));
    paint(x, ell(300, 82, 16, 13), { fill: '#f8f8fc', line: '#4a4e60' }); fill(x, ell(298, 72, 8, 5), '#e8283a'); stroke(x, 'M312 82 L356 96', '#5a4a3a', 5); fill(x, circ(304, 80, 2.5), '#111');
    for (const k of [0, 1]) stroke(x, `M${200 + k * 20} 268 L${180 + k * 30} 350 L${170 + k * 30} 370`, '#3a3a44', 3); },
  'mt-kiem': x => { glow(x, 200, 200, 180, 'rgba(120,200,255,.5)'); x.save(); x.translate(200, 200); x.rotate(-.75);
    for (let i = 0; i < 4; i++) fill(x, band([[-10, 160 + i * 6], [rr(-30, 30), 230 + i * 10], [rr(-40, 40), 300]], taper(30 - i * 6, 0)), 'rgba(150,220,255,.25)', { blur: 4, op: 'lighter' });
    paint(x, 'M0 -190 L22 -150 L18 120 L-18 120 L-22 -150Z', { fill: lg(x, -22, 0, 22, 0, ['#ffffff', '#bfe0ff', '#5a8ac0', '#26466e']), rim: [3, 3, 3, 'rgba(255,255,255,.9)'], line: '#1a2e4e', lw: 2 }); stroke(x, 'M0 -180 L0 110', 'rgba(255,255,255,.8)', 2, { glow: '#9adcff' });
    paint(x, 'M-60 112 Q0 140 60 112 L50 136 Q0 150 -50 136Z', { fill: lg(x, 0, 110, 0, 150, ['#fff0b8', '#d8a440', '#6a4410']), line: '#3a2406' }); paint(x, rect(-10, 140, 20, 70, 5), { fill: lg(x, -10, 0, 10, 0, ['#3a5a8a', '#16263e']), line: '#0a1220' }); paint(x, circ(0, 216, 12), { fill: rg(x, -3, 212, 1, 12, ['#fff', '#7ad8ff', '#1a4a8a']), line: '#0a1a3a' }); x.restore(); for (let i = 0; i < 10; i++) spark(x, rr(60, 340), rr(60, 340), rr(4, 9), '#cfeeff'); },
  'mt-lien-dai': x => { glow(x, 200, 240, 190, 'rgba(255,180,220,.55)'); for (let i = 0; i < 3; i++) cloud(x, 200, 320 + i * 8, 120 - i * 20, 'rgba(255,255,255,.9)', 'rgba(220,190,230,.6)');
    const pet = (a, L, Wd, c) => { x.save(); x.translate(200, 270); x.rotate(a); paint(x, `M0 0 C${-Wd} ${-L * .3} ${-Wd * .7} ${-L * .8} 0 ${-L} C${Wd * .7} ${-L * .8} ${Wd} ${-L * .3} 0 0Z`, { fill: lg(x, 0, -L, 0, 0, c), rim: [2, 4, 4, 'rgba(255,255,255,.8)'], line: 'rgba(140,40,90,.7)', lw: 1.4 }); x.restore(); };
    for (let i = -4; i <= 4; i++) pet(i * .32, 110, 40, ['#ffd0e4', '#e8609e', '#8a1a52']); for (let i = -3; i <= 3; i++) pet(i * .3, 140, 44, ['#ffffff', '#ffb8d6', '#d0508a']); for (let i = -1; i <= 1; i++) pet(i * .26, 160, 44, ['#ffffff', '#ffe0ee', '#ff90c0']);
    glow(x, 200, 160, 70, 'rgba(255,240,180,.8)'); paint(x, ell(200, 268, 110, 22), { fill: lg(x, 0, 250, 0, 290, ['#c8f0b0', '#4a9a4a', '#1a4a1a']), line: '#0e3a10' }); },
  'mt-ho-lo': x => { glow(x, 200, 200, 180, 'rgba(255,200,100,.45)'); cloud(x, 200, 320, 130, 'rgba(255,250,240,.95)', 'rgba(230,200,160,.6)');
    x.save(); x.translate(200, 200); x.rotate(.5); paint(x, 'M0 -150 C24 -150 34 -126 30 -104 C26 -90 18 -84 16 -76 C64 -66 96 -26 96 30 C96 100 52 140 0 140 C-52 140 -96 100 -96 30 C-96 -26 -64 -66 -16 -76 C-18 -84 -26 -90 -30 -104 C-34 -126 -24 -150 0 -150Z', { fill: rg(x, -30, -10, 10, 150, ['#fff0b0', '#e89a2a', '#8a4006', '#3a1400']), shade: [-14, -14, 16, 'rgba(60,20,0,.8)'], rim: [6, 6, 6, 'rgba(255,240,200,.7)'], tex: .3, line: '#2a1000', lw: 2 });
    paint(x, rect(-30, -84, 60, 14, 6), { fill: lg(x, 0, -84, 0, -70, ['#ff6a5a', '#a8141e']), line: '#3a0006' }); fill(x, band([[20, -76], [44, -40], [36, 0]], taper(12, 4)), '#c8141e'); paint(x, ell(0, -158, 12, 9), { fill: '#6aa03a', line: '#1a3a0a' }); x.restore(); },
  'mt-con-ngu': x => { glow(x, 200, 200, 190, 'rgba(100,200,255,.45)');
    for (const s of [-1, 1]) fill(x, band([[200, 220], [200 + s * 80, 280], [200 + s * 150, 260], [200 + s * 190, 300]], leaf(70, .6)), lg(x, 200, 220, 200 + s * 190, 300, ['rgba(160,230,255,.9)', 'rgba(80,160,230,.4)']), { blur: 1 });
    const b = 'M40 200 C60 120 180 90 280 120 C330 136 370 170 380 200 C370 230 330 264 280 280 C180 310 60 280 40 200Z';
    paint(x, b, { fill: lg(x, 0, 90, 0, 310, ['#e8f8ff', '#5aa8e0', '#1a4a8a', '#0a2244']), shade: [-6, -14, 14, 'rgba(0,20,50,.8)'], rim: [4, 6, 6, 'rgba(255,255,255,.8)'], line: '#06183a', lw: 2 });
    clip(x, b, () => { for (let i = 0; i < 120; i++) { const X = rr(60, 340), Y = rr(110, 290); stroke(x, `M${X - 7} ${Y} Q${X} ${Y + 7} ${X + 7} ${Y}`, 'rgba(255,255,255,.3)', 1.4); } });
    fill(x, band([[40, 200], [0, 150], [-10, 120]], taper(60, 10)), 'rgba(120,200,255,.7)'); fill(x, band([[40, 200], [0, 250], [-10, 290]], taper(60, 10)), 'rgba(120,200,255,.7)');
    fill(x, circ(320, 186, 10), '#fff'); fill(x, circ(322, 188, 5), '#0a1a3a'); for (let i = 0; i < 10; i++) fill(x, circ(rr(40, 360), rr(40, 360), rr(3, 8)), 'rgba(220,250,255,.6)'); },
  'mt-phuong': x => { glow(x, 200, 200, 190, 'rgba(255,120,40,.55)');
    for (let i = 0; i < 5; i++) { const a = (i - 2) * .22; fill(x, band([[200, 240], [200 + Math.sin(a) * 80 - 40, 300], [200 + Math.sin(a) * 160 - 120, 360 + i * 6], [200 + Math.sin(a) * 200 - 180, 390]], leaf(40, .5)), lg(x, 200, 240, 0, 400, ['#ffe080', '#ff5a1a', 'rgba(200,20,0,.2)']), { op: 'lighter' }); }
    for (const s of [-1, 1]) { const w = `M${200 + s * 10} 200 C${200 + s * 60} 110 ${200 + s * 120} 50 ${200 + s * 190} 40 C${200 + s * 160} 100 ${200 + s * 150} 160 ${200 + s * 100} 220Z`; paint(x, w, { fill: lg(x, 200, 220, 200 + s * 190, 40, ['#ffd060', '#ff6a1a', '#a01800']), rim: [0, 6, 6, 'rgba(255,240,180,.8)'], line: '#4a0a00', lw: 1.5 }); clip(x, w, () => { for (let i = 0; i < 8; i++) stroke(x, `M${200 + s * 20} 210 L${200 + s * (100 + i * 12)} ${50 + i * 14}`, 'rgba(120,20,0,.4)', 2); }); }
    paint(x, ell(200, 220, 40, 50), { fill: rg(x, 190, 200, 4, 50, ['#fff0a0', '#ff8a2a', '#b02000']), line: '#4a0a00' });
    const nk = band([[200, 190], [214, 150], [206, 120]], taper(26, 18)); paint(x, nk, { fill: '#ffaa3a', line: '#4a0a00' }); paint(x, ell(210, 112, 18, 15), { fill: rg(x, 206, 106, 2, 18, ['#fff0a0', '#ff8a2a', '#b02000']), line: '#4a0a00' });
    fill(x, 'M226 112 L250 118 L226 122Z', '#ffd040'); fill(x, circ(214, 108, 3), '#1a0400'); for (let i = 0; i < 3; i++) fill(x, band([[204, 98], [200 + i * 8, 76], [196 + i * 14, 60]], taper(5, 1)), '#ffd040'); glow(x, 200, 200, 80, 'rgba(255,200,80,.5)'); },
};
for (const [k, f] of Object.entries(MT)) A[k] = { w: 400, h: 400, draw: x => { f(x); grain(x, .05); } };


// nhân vật đứng trên phi kiếm (ghép từ ảnh nhân vật đã vẽ)
A['j-ngu-kiem'] = { w: 300, h: 420, draw: async x => {
  for (let i = 0; i < 4; i++) fill(x, band([[150, 392], [150 + rr(-24, 24), 412], [150 + rr(-40, 40), 420]], taper(40 - i * 8, 0)), 'rgba(170,230,255,.35)', { blur: 4 });
  glow(x, 150, 384, 120, 'rgba(140,220,255,.55)');
  x.save(); x.translate(150, 384); paint(x, 'M-130 0 L-100 -9 L100 -7 L110 0 L100 7 L-100 9Z', { fill: lg(x, 0, -9, 0, 9, ['#ffffff', '#bfe0ff', '#4a78b0']), line: '#1a2e4e', lw: 1.5 }); stroke(x, 'M-120 0 L100 0', 'rgba(255,255,255,.9)', 1.5, { glow: '#9adcff' });
  paint(x, rect(100, -16, 10, 32, 4), { fill: lg(x, 0, -16, 0, 16, ['#fff0b8', '#d8a03a', '#6a4006']) }); paint(x, rect(110, -5, 26, 10, 4), { fill: '#2a3a5e' }); fill(x, circ(140, 0, 6), '#7ad8ff'); x.restore();
  const im = await img(await LOAD('nv-kiem-tu')); x.drawImage(im, 150 - 120, 380 - 392, 240, 400);
} };
