// Phong cảnh / nền (vẽ tay bằng canvas)
function sky(x, W, H, st) { x.fillStyle = lg(x, 0, 0, 0, H, st); x.fillRect(0, 0, W, H); }
function mtn(x, W, base, list, top, bot, o = {}) {
  const pts = peaks(-20, W + 20, base, list, o.rough ?? 4); pts.push([W + 20, o.floor ?? base + 400], [-20, o.floor ?? base + 400]);
  const p = polyPath(pts); const minY = Math.min(...pts.map(q => q[1]));
  fill(x, p, lg(x, 0, minY, 0, base + 30, [top, bot]));
  clip(x, p, () => {
    // nét chấm phá (vân núi)
    x.globalAlpha = o.cun ?? .35; for (let i = 0; i < (o.nc ?? 220); i++) { const X = rr(0, W); let y0 = minY; for (const q of pts) if (Math.abs(q[0] - X) < 3) { y0 = q[1]; break; } const Y = y0 + rr(4, 90); stroke(x, `M${X} ${Y} l${rr(-6, 6)} ${rr(10, 34)}`, o.ink || 'rgba(20,30,50,.6)', rr(1, 3)); }
    x.globalAlpha = 1; cres(x, p, -14, 0, 18, o.shadow || 'rgba(10,20,40,.5)', 'multiply', .7); cres(x, p, 8, 4, 8, o.lit || 'rgba(255,255,255,.35)', 'screen', 1);
    if (o.trees) for (let i = 0; i < o.trees; i++) { const X = rr(0, W); let y0 = base; for (const q of pts) if (Math.abs(q[0] - X) < 3) { y0 = q[1]; break; } pine(x, X, y0 + rr(2, 14), rr(.15, .35) * (o.ts || 1), o.treeC || 'rgba(20,40,40,.85)'); }
  });
  return pts;
}
function pine(x, X, Y, s, col) { x.save(); x.translate(X, Y); x.scale(s, s); stroke(x, 'M0 0 C4 -30 -6 -60 2 -90', col, 6); for (let i = 0; i < 5; i++) { const y = -30 - i * 16, w = 40 - i * 6; fill(x, ell(rr(-6, 6), y, w, 8), col); } x.restore(); }
function pav(x, cx, by, s, c = {}) {
  x.save(); x.translate(cx, by); x.scale(s, s);
  const wall = c.wall || '#c84a32', roof = c.roof || '#2e3a48', gold = '#e0b050';
  paint(x, rect(-70, -10, 140, 14, 2), { fill: lg(x, 0, -10, 0, 4, ['#d8d0c0', '#8a8478']) });
  paint(x, rect(-56, -70, 112, 60), { fill: lg(x, -56, 0, 56, 0, [wall, dk(wall, .6)]) });
  for (let i = -2; i <= 2; i++) fill(x, rect(i * 22 - 3, -70, 6, 60), dk(wall, .45));
  for (let i = -1; i <= 1; i += 2) fill(x, rect(i * 11 - 8, -60, 16, 44), 'rgba(255,220,140,.75)');
  const rf = 'M-96 -64 Q-70 -72 -60 -90 L60 -90 Q70 -72 96 -64 Q100 -70 104 -78 Q80 -80 66 -110 L-66 -110 Q-80 -80 -104 -78 Q-100 -70 -96 -64Z';
  paint(x, rf, { fill: lg(x, 0, -110, 0, -64, [dk(roof, 1.6), roof, dk(roof, .6)]), line: dk(roof, .4) }); stroke(x, 'M-96 -64 Q-70 -72 -60 -90 L60 -90 Q70 -72 96 -64', gold, 2);
  if (c.tier) { paint(x, rect(-40, -140, 80, 30), { fill: lg(x, -40, 0, 40, 0, [wall, dk(wall, .6)]) }); paint(x, 'M-70 -132 Q-50 -140 -44 -152 L44 -152 Q50 -140 70 -132 Q74 -140 76 -146 Q56 -150 46 -170 L-46 -170 Q-56 -150 -76 -146 Q-74 -140 -70 -132Z', { fill: lg(x, 0, -170, 0, -132, [dk(roof, 1.6), roof, dk(roof, .6)]), line: dk(roof, .4) }); stroke(x, 'M0 -170 L0 -190', gold, 4); }
  x.restore();
}
function blossomTree(x, X, Y, s, flip = 1, bc = ['#ffd6e6', '#ff9ac0', '#e05a8a']) {
  x.save(); x.translate(X, Y); x.scale(s * flip, s);
  const br = (x0, y0, a, L, w, d) => { if (d > 6 || L < 8) return; const x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L; const p = band([[x0, y0], [(x0 + x1) / 2 + rr(-L * .15, L * .15), (y0 + y1) / 2], [x1, y1]], taper(w, w * .6)); paint(x, p, { fill: lg(x, x0, y0, x1, y1, ['#5a3a30', '#2a1814']), line: 'rgba(20,8,4,.8)', lw: 1 }); br(x1, y1, a - rr(.2, .6), L * rr(.65, .8), w * .65, d + 1); br(x1, y1, a + rr(.2, .6), L * rr(.6, .78), w * .62, d + 1); if (d >= 3) for (let i = 0; i < 9; i++) { const bx = x1 + rr(-30, 30), by = y1 + rr(-24, 24); fill(x, circ(bx, by, rr(5, 12)), [bc[0], bc[1], bc[2]][rnd() * 3 | 0], { a: .85 }); } };
  br(0, 0, -PI / 2 + .25, 160, 34, 0);
  x.restore();
}
function lantern(x, X, Y, s, c = '#e8402a') { stroke(x, `M${X} ${Y - 60 * s} L${X} ${Y - 26 * s}`, '#2a1810', 2); glow(x, X, Y, 70 * s, 'rgba(255,160,60,.55)'); paint(x, ell(X, Y, 22 * s, 28 * s), { fill: rg(x, X - 4 * s, Y - 6 * s, 2, 30 * s, ['#ffe8a0', c, dk(c, .45)]), line: dk(c, .3) }); fill(x, rect(X - 12 * s, Y - 30 * s, 24 * s, 6 * s), '#3a2010'); fill(x, rect(X - 12 * s, Y + 25 * s, 24 * s, 6 * s), '#3a2010'); stroke(x, `M${X} ${Y + 30 * s} L${X} ${Y + 52 * s}`, '#e8c060', 2); }
const BG = {
  // núi sông sương sớm (dọc)
  'bg-son-thuy': [720, 1280, x => { const W = 720, H = 1280; sky(x, W, H, ['#e9f1f6', '#cfe0ec', '#eef3f2']); glow(x, 520, 300, 260, 'rgba(255,248,220,.9)', 1, 'source-over');
    cloud(x, 180, 220, 120, 'rgba(255,255,255,.8)', 'rgba(190,205,220,.4)'); cloud(x, 600, 420, 90, 'rgba(255,255,255,.7)', 'rgba(190,205,220,.4)');
    mtn(x, W, 640, [[120, 420, 70], [260, 300, 60], [470, 480, 80], [640, 340, 70]], 'rgba(150,170,195,.75)', 'rgba(220,232,240,.0)', { nc: 120, cun: .2 });
    mist(x, 640, 90, W, 'rgba(240,246,250,.9)');
    mtn(x, W, 860, [[40, 380, 60], [210, 260, 50], [380, 420, 60], [560, 300, 55], [700, 360, 50]], 'rgba(90,118,140,.9)', 'rgba(210,225,232,.1)', { trees: 40, treeC: 'rgba(40,60,70,.6)' });
    mist(x, 860, 100, W, 'rgba(235,242,246,.95)');
    mtn(x, W, 1120, [[-20, 360, 90], [160, 200, 80], [620, 300, 90], [760, 380, 80]], 'rgba(46,70,84,.98)', 'rgba(140,165,175,.4)', { trees: 60, ts: 1.4 });
    pav(x, 600, 830, .7, { tier: 1 }); mist(x, 1160, 120, W, 'rgba(232,240,244,.9)');
    for (let i = 0; i < 8; i++) stroke(x, `M${rr(0, W)} ${rr(300, 700)} q 10 -6 20 0 q 10 -6 20 0`, 'rgba(40,50,60,.5)', 1.6);
    grain(x, .08); }],
  // đình viện hoa đào
  'bg-dinh-vien': [720, 1280, x => { const W = 720, H = 1280; sky(x, W, H, ['#fbe9ef', '#f4dfe6', '#f8efe8']); glow(x, 420, 260, 300, 'rgba(255,250,235,.9)', 1, 'source-over');
    mtn(x, W, 520, [[100, 260, 60], [330, 330, 70], [600, 240, 60]], 'rgba(200,170,190,.6)', 'rgba(250,236,240,0)', { nc: 60, cun: .15 }); mist(x, 520, 80, W, 'rgba(252,240,244,.9)');
    // tường trắng mái ngói
    fill(x, rect(0, 560, W, 200), lg(x, 0, 560, 0, 760, ['#fbf6ee', '#e6dccc'])); for (let i = 0; i < 40; i++) stroke(x, `M${i * 20} 540 l0 30`, 'rgba(40,50,60,.5)', 8);
    fill(x, 'M-10 520 L730 520 L730 560 L-10 560Z', lg(x, 0, 520, 0, 560, ['#5a6878', '#2a3440'])); stroke(x, 'M-10 520 L730 520', '#9aa8b8', 3);
    // cổng tròn
    fill(x, circ(470, 680, 110), lg(x, 0, 570, 0, 790, ['#d8e8e0', '#a8c8b8'])); clip(x, circ(470, 680, 104), () => { mtn(x, W, 760, [[440, 140, 40], [520, 100, 40]], 'rgba(90,130,110,.9)', 'rgba(200,230,210,.3)', { nc: 30 }); blossomTree(x, 520, 790, .5, -1); }); stroke(x, circ(470, 680, 110), '#8a7a6a', 10); stroke(x, circ(470, 680, 104), '#c8b8a0', 3);
    // nền đá
    fill(x, rect(0, 760, W, 520), lg(x, 0, 760, 0, H, ['#ddd4c8', '#b8ac9c', '#8a7e70'])); for (let r = 0; r < 14; r++) { const y = 760 + r * r * 3.2; stroke(x, `M0 ${y} L${W} ${y}`, 'rgba(90,80,70,.35)', 1.5); } for (let i = -12; i <= 12; i++) stroke(x, `M${360 + i * 30} 760 L${360 + i * 140} 1280`, 'rgba(90,80,70,.25)', 1.5);
    // ao + đèn đá
    paint(x, ell(170, 960, 170, 50), { fill: lg(x, 0, 910, 0, 1010, ['#9ac8d0', '#4a8a9a']), line: '#6a6a60', lw: 4 }); for (let i = 0; i < 5; i++) paint(x, ell(rr(60, 280), rr(940, 990), 18, 8), { fill: '#5aa05a' }); fill(x, circ(140, 960, 8), '#ff9ac0');
    paint(x, 'M600 900 L620 760 L660 760 L680 900Z', { fill: lg(x, 600, 0, 680, 0, ['#c8c0b4', '#7a7266']), line: '#4a443c' }); paint(x, 'M580 770 L700 770 L660 730 L620 730Z', { fill: '#6a645a' }); glow(x, 640, 800, 50, 'rgba(255,200,120,.7)');
    blossomTree(x, 40, 1200, 1.5, 1); blossomTree(x, 740, 1000, .9, -1);
    for (let i = 0; i < 60; i++) fill(x, ell(rr(0, W), rr(0, H), rr(3, 7), rr(2, 4), rr(0, 3)), 'rgba(255,170,200,.8)');
    grain(x, .07); }],
  // phòng trong động phủ
  'bg-phong': [720, 1280, x => { const W = 720, H = 1280; fill(x, rect(0, 0, W, H), lg(x, 0, 0, 0, 760, ['#4a3426', '#7a5a40', '#a8845c']));
    for (let i = 0; i < 9; i++) fill(x, rect(i * 90, 0, 8, 760), 'rgba(40,24,14,.5)'); fill(x, rect(0, 120, W, 14), '#3a2414'); fill(x, rect(0, 0, W, 40), '#2a180c');
    // cửa sổ tròn nhìn ra núi
    fill(x, circ(360, 420, 190), '#2a180c'); clip(x, circ(360, 420, 176), () => { sky(x, W, 800, ['#2a3a6a', '#7a6aa0', '#f0b0a0']); glow(x, 430, 330, 60, 'rgba(255,250,230,1)', 1, 'source-over'); mtn(x, W, 560, [[260, 200, 50], [420, 260, 50], [560, 160, 40]], 'rgba(40,40,80,.95)', 'rgba(120,100,150,.6)', { nc: 50 }); mist(x, 560, 50, W, 'rgba(240,190,190,.6)'); });
    for (let i = -3; i <= 3; i++) stroke(x, `M${360 + i * 50} 244 L${360 + i * 50} 596`, 'rgba(42,24,12,.0)', 1); stroke(x, circ(360, 420, 182), '#c89a5a', 6);
    // sàn gỗ
    fill(x, rect(0, 760, W, 520), lg(x, 0, 760, 0, H, ['#8a5a34', '#6a4024', '#3a2010'])); for (let i = -10; i <= 10; i++) stroke(x, `M${360 + i * 40} 760 L${360 + i * 160} 1280`, 'rgba(30,14,4,.4)', 2); tex(x, rect(0, 760, W, 520), .3, NF);
    // giá sách
    paint(x, rect(30, 300, 150, 480, 4), { fill: lg(x, 0, 300, 0, 780, ['#5a3a20', '#3a2210']), line: '#1a0e04' }); for (let r = 0; r < 5; r++) { fill(x, rect(36, 380 + r * 88, 138, 8), '#2a1608'); for (let k = 0; k < 7; k++) fill(x, rect(42 + k * 18, 330 + r * 88 + rr(0, 14), 14, 50 - rr(0, 14)), ['#a83a2a', '#3a6a8a', '#d8b878', '#5a8a4a'][(r + k) % 4]); }
    // bàn trà
    paint(x, ell(380, 900, 200, 50), { fill: lg(x, 0, 850, 0, 950, ['#9a6a3a', '#5a3418']), line: '#2a1408', drop: 'rgba(0,0,0,.4)' }); paint(x, rect(190, 900, 380, 40), { fill: '#4a2a12' });
    paint(x, ell(330, 870, 30, 22), { fill: rg(x, 322, 862, 2, 30, ['#ffffff', '#c8e0e8', '#5a8a9a']), line: '#2a4a5a' }); for (const k of [400, 440]) paint(x, ell(k, 880, 14, 10), { fill: '#e8f0f0', line: '#5a7a8a' });
    glow(x, 520, 840, 40, 'rgba(255,220,160,.6)'); stroke(x, 'M520 870 C510 840 530 820 520 790', 'rgba(255,255,255,.5)', 2, { blur: 2 });
    // rèm giường
    fill(x, rect(560, 250, 160, 560), lg(x, 560, 0, 720, 0, ['rgba(240,200,210,.85)', 'rgba(200,120,150,.9)'])); for (let i = 0; i < 6; i++) stroke(x, `M${570 + i * 28} 250 C${560 + i * 28} 500 ${590 + i * 28} 600 ${570 + i * 28} 810`, 'rgba(120,40,70,.35)', 4);
    lantern(x, 120, 200, 1); lantern(x, 600, 200, 1);
    paint(x, rect(200, 640, 60, 120, 6), { fill: lg(x, 0, 640, 0, 760, ['#3a6a8a', '#16364a']) }); for (let i = 0; i < 6; i++) paint(x, ell(230 + rr(-40, 40), 620 - rr(0, 60), 20, 8, rr(-1, 1)), { fill: '#5aa05a' });
    fill(x, rect(0, 0, W, H), rg(x, 360, 640, 300, 900, ['rgba(0,0,0,0)', 'rgba(20,8,0,.55)'])); grain(x, .08); }],
  // hang động bí cảnh
  'bg-hang': [720, 1280, x => { const W = 720, H = 1280; sky(x, W, H, ['#0e1420', '#1a2434', '#0a0e16']);
    glow(x, 380, 0, 520, 'rgba(160,220,255,.35)', 1, 'source-over'); x.save(); x.globalCompositeOperation = 'lighter'; fill(x, 'M300 0 L470 0 L560 900 L240 900Z', lg(x, 0, 0, 0, 900, ['rgba(180,230,255,.35)', 'rgba(180,230,255,0)'])); x.restore();
    for (const [pts, c] of [[[[0, 0], [200, 0], [160, 300], [220, 600], [120, 900], [180, 1280], [0, 1280]], '#243246'], [[[720, 0], [520, 0], [580, 340], [500, 620], [600, 900], [540, 1280], [720, 1280]], '#202c40']]) { const p = smoothPath(pts); paint(x, p, { fill: lg(x, 0, 0, 0, H, [c, dk(c, .5)]), tex: .5, rim: [10, 0, 12, 'rgba(120,180,230,.35)'] }); }
    fill(x, rect(0, 980, W, 300), lg(x, 0, 980, 0, H, ['#1a2232', '#0a0e16'])); paint(x, ell(360, 1060, 230, 60), { fill: lg(x, 0, 1000, 0, 1120, ['#2a6a8a', '#0a2a3a']), line: 'rgba(120,200,240,.5)' }); glow(x, 360, 1060, 160, 'rgba(80,200,255,.35)');
    const crystal = (X, Y, s, c) => { for (let i = 0; i < 4; i++) { x.save(); x.translate(X, Y); x.rotate(rr(-.6, .6)); const L = rr(40, 90) * s, w = 14 * s; paint(x, `M0 ${-L} L${w} ${-L * .7} L${w * .8} 0 L${-w * .8} 0 L${-w} ${-L * .7}Z`, { fill: lg(x, -w, -L, w, 0, ['#ffffff', c, dk(c, .3)]), line: dk(c, .2) }); x.restore(); } glow(x, X, Y - 30 * s, 80 * s, rgba(c, .7)); };
    crystal(120, 940, 1.2, '#6ad8ff'); crystal(610, 880, 1, '#b08aff'); crystal(560, 400, .7, '#6ad8ff'); crystal(150, 520, .6, '#b08aff');
    paint(x, 'M300 1000 L310 760 Q360 730 410 760 L420 1000Z', { fill: lg(x, 300, 0, 420, 0, ['#6a7080', '#2a3040']), tex: .5, line: '#0a0e16' }); for (let i = 0; i < 6; i++) stroke(x, `M330 ${800 + i * 28} l60 0`, 'rgba(160,230,255,.6)', 2, { glow: '#6ad8ff' });
    dots(x, 80, [0, 0, W, H], '#bfeaff', 2, .7); grain(x, .08); }],
  // hồ đêm trăng
  'bg-ho-dem': [720, 1280, x => { const W = 720, H = 1280; sky(x, W, H, ['#0e1430', '#2a3060', '#4a4a7a', '#141a34']); glow(x, 470, 300, 260, 'rgba(255,240,210,.35)', 1, 'source-over'); paint(x, circ(470, 300, 70), { fill: rg(x, 450, 280, 10, 70, ['#fffef4', '#f4ecd0', '#d8c8a0']) });
    dots(x, 120, [0, 0, W, 640], '#ffffff', 1.3); cloud(x, 250, 380, 100, 'rgba(120,130,180,.5)', 'rgba(40,40,80,.4)');
    mtn(x, W, 700, [[100, 260, 60], [300, 200, 50], [560, 300, 70]], 'rgba(30,34,70,.95)', 'rgba(60,60,100,.7)', { nc: 60 });
    fill(x, rect(0, 700, W, 580), lg(x, 0, 700, 0, H, ['#30386a', '#141a3a', '#080a1a'])); for (let i = 0; i < 40; i++) stroke(x, `M${rr(380, 560)} ${rr(720, 1100)} l${rr(20, 70)} 0`, 'rgba(255,240,200,.45)', 2);
    pav(x, 200, 760, .8, { wall: '#a8302a', roof: '#1a2030' }); fill(x, rect(100, 760, 200, 10), '#2a2030'); glow(x, 200, 720, 80, 'rgba(255,180,80,.5)');
    paint(x, 'M420 1000 Q520 1030 640 1000 L620 1020 Q520 1046 440 1020Z', { fill: '#2a1a10' }); stroke(x, 'M540 1010 L560 900', '#3a2a1a', 3); grain(x, .08); }],
  // bầu trời cao (dọc) - Lăng Vân
  'bg-troi': [720, 1560, x => { const W = 720, H = 1560; sky(x, W, H, ['#3a7ad8', '#6aaef0', '#a8d8ff', '#e8f6ff']); glow(x, 560, 220, 340, 'rgba(255,250,220,.8)', 1, 'source-over');
    x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { x.save(); x.translate(560, 220); x.rotate(.6 + i * .32); fill(x, 'M0 0 L1400 -60 L1400 60Z', 'rgba(255,255,230,.06)'); x.restore(); } x.restore();
    for (let i = 0; i < 14; i++) cloud(x, rr(-50, 770), 200 + i * 95, rr(60, 160), 'rgba(255,255,255,.92)', 'rgba(150,190,230,.55)');
    for (const [X, Y, s] of [[120, 520, .5], [600, 760, .4]]) { fill(x, `M${X - 90 * s} ${Y} Q${X} ${Y + 160 * s} ${X + 90 * s} ${Y}Z`, 'rgba(110,140,180,.6)'); pav(x, X, Y, .35 * s * 2, { roof: '#5a6a90', wall: '#a8b8d0' }); }
    fill(x, rect(0, 1200, W, 360), lg(x, 0, 1200, 0, H, ['rgba(255,255,255,0)', 'rgba(255,255,255,.95)'])); for (let i = 0; i < 8; i++) cloud(x, rr(0, W), rr(1300, 1520), rr(120, 200), 'rgba(255,255,255,.97)', 'rgba(170,200,235,.6)');
    grain(x, .05); }],
  // biển mây cuộn (ghép dọc liền mạch) cho màn bắn
  'bg-van-hai': [720, 1280, x => { const W = 720, H = 1280; sky(x, W, H, ['#4a8ae0', '#7ab8f0', '#4a8ae0']);
    for (let i = 0; i < 26; i++) { const X = rr(-60, 780), Y = rr(0, H), s = rr(50, 130); for (const d of [-H, 0, H]) cloud(x, X, Y + d, s, 'rgba(255,255,255,.75)', 'rgba(120,170,230,.45)', 6); }
    for (let i = 0; i < 40; i++) { const X = rr(0, W), Y = rr(0, H); for (const d of [-H, 0, H]) stroke(x, `M${X} ${Y + d} l0 ${rr(30, 80)}`, 'rgba(255,255,255,.25)', 2); } }],
  // đảo bay
  'j-dao': [600, 520, x => { glow(x, 300, 300, 280, 'rgba(255,255,230,.45)');
    const rk = 'M40 250 C80 230 520 230 560 250 C540 300 460 340 400 400 C360 450 330 500 300 516 C270 500 240 450 200 400 C140 340 60 300 40 250Z';
    paint(x, rk, { fill: lg(x, 0, 240, 0, 516, ['#b8a088', '#7a6048', '#3a2a1c']), shade: [-14, -20, 20, 'rgba(30,20,10,.8)'], tex: .6, line: '#2a1a10', lw: 2 }); clip(x, P(rk), () => { for (let i = 0; i < 30; i++) stroke(x, `M${rr(80, 520)} ${rr(270, 480)} l${rr(-10, 10)} ${rr(20, 50)}`, 'rgba(40,24,10,.5)', 3); });
    for (let i = 0; i < 6; i++) stroke(x, `M${rr(200, 400)} 460 l${rr(-8, 8)} ${rr(30, 70)}`, '#5a8a3a', 3);
    paint(x, ell(300, 248, 262, 34), { fill: lg(x, 0, 214, 0, 282, ['#b8e88a', '#5aa83a', '#2a6a1a']), line: '#1a4a10', lw: 2 });
    for (const X of [70, 520, 110]) pine(x, X, 250, .9, '#24502a');
    pav(x, 300, 244, 1.25, { tier: 1, wall: '#c8402a', roof: '#2a4a7a' }); stroke(x, 'M460 244 C470 330 476 420 480 520', 'rgba(220,245,255,.8)', 10, { blur: 2 });
    cloud(x, 120, 300, 70, 'rgba(255,255,255,.9)'); cloud(x, 480, 320, 60, 'rgba(255,255,255,.9)'); }],
  // đại điện ban đêm (gacha)
  'bg-dien': [720, 1280, x => { const W = 720, H = 1280; sky(x, W, H, ['#1a1430', '#2a1e48', '#140e24']);
    // tường sau + cửa
    fill(x, rect(140, 200, 440, 560), lg(x, 0, 200, 0, 760, ['#3a2440', '#24142a'])); for (let k = 0; k < 3; k++) { const X = 170 + k * 140; paint(x, rect(X, 300, 100, 420, 4), { fill: lg(x, 0, 300, 0, 720, ['#ffcf80', '#e88a3a', '#8a3a14']) }); for (let i = 1; i < 6; i++) stroke(x, `M${X} ${300 + i * 70} L${X + 100} ${300 + i * 70}`, '#5a2410', 4); for (let i = 1; i < 4; i++) stroke(x, `M${X + i * 25} 300 L${X + i * 25} 720`, '#5a2410', 3); }
    glow(x, 360, 520, 300, 'rgba(255,170,80,.35)');
    // bậc + thảm
    fill(x, 'M0 760 L720 760 L720 1280 L0 1280Z', lg(x, 0, 760, 0, H, ['#3a2a48', '#1a1224', '#0a0610'])); for (let i = -9; i <= 9; i++) stroke(x, `M${360 + i * 50} 760 L${360 + i * 190} 1280`, 'rgba(200,160,255,.12)', 2); for (let r = 1; r < 10; r++) { const y = 760 + r * r * 6; stroke(x, `M0 ${y} L720 ${y}`, 'rgba(200,160,255,.12)', 2); }
    fill(x, 'M300 760 L420 760 L560 1280 L160 1280Z', lg(x, 0, 760, 0, H, ['#8a1a2a', '#5a0a18'])); stroke(x, 'M300 760 L160 1280 M420 760 L560 1280', '#e8b860', 6); fill(x, 'M300 760 L420 760 L560 1280 L160 1280Z', rg(x, 360, 760, 20, 500, ['rgba(255,200,120,.3)', 'rgba(0,0,0,0)']));
    // cột
    for (const [X, w] of [[40, 90], [600, 90], [150, 60], [520, 60]]) { paint(x, rect(X, 0, w, 1100), { fill: lg(x, X, 0, X + w, 0, ['#5a0a14', '#d8343a', '#ff7a6a', '#a81a24', '#3a0408']) }); fill(x, rect(X - 8, 1040, w + 16, 60), lg(x, 0, 1040, 0, 1100, ['#f0c870', '#8a5a14'])); fill(x, rect(X - 4, 120, w + 8, 20), '#e0b050'); for (let i = 0; i < 8; i++) stroke(x, `M${X + w * .5} ${300 + i * 80} q${w * .3} 20 0 40 q${-w * .3} 20 0 40`, 'rgba(255,210,120,.35)', 3); }
    // dầm trần
    fill(x, rect(0, 0, W, 150), lg(x, 0, 0, 0, 150, ['#120a18', '#3a1a24'])); for (let i = 0; i < 8; i++) fill(x, rect(i * 100 - 20, 110, 60, 30), i % 2 ? '#2a6a6a' : '#c8902a'); stroke(x, 'M0 145 L720 145', '#e0b050', 4);
    lantern(x, 250, 300, 1.2); lantern(x, 470, 300, 1.2); lantern(x, 100, 420, .9); lantern(x, 620, 420, .9);
    dots(x, 60, [0, 0, W, 900], '#ffd890', 2, .6); fill(x, rect(0, 0, W, H), rg(x, 360, 700, 300, 900, ['rgba(0,0,0,0)', 'rgba(6,2,12,.6)'])); grain(x, .06); }],
  // tế đàn triệu hồi
  'bg-trieu-hoi': [720, 1280, x => { const W = 720, H = 1280; sky(x, W, H, ['#060a24', '#1a1450', '#3a1a6a', '#0a0a20']); dots(x, 200, [0, 0, W, 900], '#ffffff', 1.4);
    glow(x, 360, 520, 360, 'rgba(120,90,255,.45)'); x.save(); x.translate(360, 520);
    for (let k = 0; k < 6; k++) { x.rotate(.5); stroke(x, ell(0, 0, 250 - k * 30, 250 - k * 30), `rgba(${180 - k * 10},${150 + k * 15},255,.5)`, 3 + k, { dash: [40 + k * 8, 20], glow: '#9a7aff', gb: 12 }); }
    fill(x, circ(0, 0, 120), rg(x, 0, 0, 10, 130, ['rgba(255,255,255,1)', 'rgba(180,160,255,.9)', 'rgba(80,40,200,0)'])); x.restore();
    for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; stroke(x, `M${360 + Math.cos(a) * 270} ${520 + Math.sin(a) * 270} l${Math.cos(a) * 14} ${Math.sin(a) * 14}`, '#d8c8ff', 3, { glow: '#a08aff' }); }
    paint(x, ell(360, 1000, 330, 90), { fill: lg(x, 0, 910, 0, 1090, ['#7a7aa0', '#3a3a5a', '#1a1a2e']), line: '#0a0a18', lw: 3 }); paint(x, ell(360, 990, 260, 66), { fill: lg(x, 0, 924, 0, 1056, ['#4a4a6a', '#24243a']) }); stroke(x, ell(360, 990, 220, 54), '#a08aff', 3, { glow: '#a08aff' }); stroke(x, ell(360, 990, 160, 38), '#a08aff', 2, { glow: '#a08aff' });
    for (const X of [80, 640]) { paint(x, rect(X - 26, 700, 52, 340, 4), { fill: lg(x, X - 26, 0, X + 26, 0, ['#5a5a7a', '#9a9ac0', '#3a3a50']), tex: .4 }); flame(x, X, 700, 110, 60, ['#3a1aa0', '#7a5aff', '#c8b8ff', '#ffffff'], 8); }
    grain(x, .06); }],
  'bg-rung': [720, 640, x => { const W = 720, H = 640; sky(x, W, H, ['#a8d8a0', '#5a9a6a', '#1a3a2a']); glow(x, 360, 200, 300, 'rgba(255,255,200,.5)', 1, 'source-over');
    for (let l = 0; l < 3; l++) for (let i = 0; i < 10; i++) { const X = rr(0, W), w = rr(20, 50) * (1 + l * .5); fill(x, rect(X, 0, w, H), `rgba(${30 - l * 8},${60 - l * 14},${40 - l * 10},${.4 + l * .25})`); }
    for (let i = 0; i < 30; i++) fill(x, ell(rr(0, W), rr(0, 160), rr(60, 140), rr(30, 60)), `rgba(${40 + rr(0, 30)},${100 + rr(0, 40)},${50},.6)`, { blur: 4 });
    fill(x, rect(0, 470, W, 170), lg(x, 0, 470, 0, H, ['#4a7a3a', '#1a3a14'])); for (let i = 0; i < 120; i++) stroke(x, `M${rr(0, W)} ${rr(480, H)} l${rr(-4, 4)} -14`, 'rgba(150,220,100,.6)', 2);
    x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) fill(x, `M${100 + i * 140} 0 L${150 + i * 140} 0 L${220 + i * 140} 640 L${120 + i * 140} 640Z`, 'rgba(255,255,200,.06)'); x.restore(); dots(x, 40, [0, 0, W, H], '#e8ffa0', 2.5); grain(x, .06); }],
  'bg-nham': [720, 640, x => { const W = 720, H = 640; sky(x, W, H, ['#1a0604', '#5a1408', '#c8381a']); mtn(x, W, 420, [[100, 200, 60], [400, 260, 80], [640, 180, 60]], 'rgba(30,8,4,.95)', 'rgba(90,20,10,.9)', { nc: 60, ink: 'rgba(255,90,30,.4)' });
    fill(x, rect(0, 440, W, 200), lg(x, 0, 440, 0, H, ['#3a0a04', '#1a0402'])); for (let i = 0; i < 14; i++) stroke(x, `M${rr(0, W)} ${rr(460, 620)} q${rr(20, 40)} ${rr(-10, 10)} ${rr(60, 120)} 0`, '#ff7a1a', rr(3, 8), { glow: '#ff5a00', gb: 14 });
    dots(x, 80, [0, 0, W, H], '#ffb04a', 2.5); glow(x, 360, 640, 300, 'rgba(255,90,20,.5)'); grain(x, .06); }],
  'bg-bang': [720, 640, x => { const W = 720, H = 640; sky(x, W, H, ['#c8e8ff', '#8ac0e8', '#e8f6ff']); mtn(x, W, 420, [[80, 240, 60], [330, 300, 70], [600, 220, 60]], 'rgba(240,250,255,.95)', 'rgba(140,190,230,.9)', { nc: 80, ink: 'rgba(60,110,160,.5)' });
    fill(x, rect(0, 450, W, 190), lg(x, 0, 450, 0, H, ['#e8f6ff', '#9ac8e8'])); for (let i = 0; i < 9; i++) { const X = rr(0, W), Y = rr(470, 600); paint(x, `M${X} ${Y} l14 -60 l14 60Z`, { fill: lg(x, X, Y - 60, X + 28, Y, ['#fff', '#8ad0ff', '#2a6a9a']) }); }
    dots(x, 120, [0, 0, W, H], '#ffffff', 2.5); grain(x, .05); }],
  // võ đài hoàng hôn
  'bg-vo-dai': [720, 1280, x => { const W = 720, H = 1280; sky(x, W, H, ['#2a1a3a', '#8a3a4a', '#f08a5a', '#f8c88a']); glow(x, 360, 560, 200, 'rgba(255,230,160,.9)', 1, 'source-over'); paint(x, circ(360, 560, 80), { fill: rg(x, 360, 560, 10, 80, ['#fffbe0', '#ffc860']) });
    mtn(x, W, 700, [[60, 340, 60], [240, 220, 50], [520, 300, 60], [700, 380, 60]], 'rgba(60,30,60,.95)', 'rgba(140,60,70,.6)', { nc: 80, trees: 20 }); mist(x, 700, 70, W, 'rgba(250,180,140,.6)');
    fill(x, rect(0, 720, W, 560), lg(x, 0, 720, 0, H, ['#3a2a30', '#1a1014'])); paint(x, ell(360, 980, 340, 130), { fill: lg(x, 0, 850, 0, 1110, ['#b8a090', '#6a5a50', '#3a3028']), tex: .5, line: '#1a1210', lw: 3 }); stroke(x, ell(360, 980, 280, 104), '#e8c070', 4); stroke(x, ell(360, 980, 120, 44), '#e8c070', 3);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; stroke(x, `M${360 + Math.cos(a) * 120} ${980 + Math.sin(a) * 44} L${360 + Math.cos(a) * 280} ${980 + Math.sin(a) * 104}`, 'rgba(232,192,112,.6)', 2); }
    for (const X of [60, 660]) { paint(x, rect(X - 14, 620, 28, 330), { fill: lg(x, X - 14, 0, X + 14, 0, ['#5a2a1a', '#a84a2a', '#3a140a']) }); fill(x, band([[X, 630], [X + (X < 360 ? 60 : -60), 650], [X + (X < 360 ? 120 : -120), 640]], leaf(50)), '#c82a2a'); }
    grain(x, .07); }],
  // mặt gỗ sơn mài (bàn cờ)
  'bg-go': [720, 1280, x => { const W = 720, H = 1280; fill(x, rect(0, 0, W, H), lg(x, 0, 0, W, H, ['#3a1408', '#5a2010', '#2a0e06']));
    x.save(); x.globalCompositeOperation = 'overlay'; x.globalAlpha = .6; x.drawImage(NZ, 0, 0, 40, 512, 0, 0, W, H); x.restore();
    for (let i = 0; i < 160; i++) { const X = rr(-50, W); stroke(x, `M${X} 0 C${X + rr(-30, 30)} 400 ${X + rr(-40, 40)} 900 ${X + rr(-20, 20)} 1280`, rnd() < .5 ? 'rgba(20,4,0,.25)' : 'rgba(255,160,100,.08)', rr(1, 4)); }
    fill(x, rect(0, 0, W, H), rg(x, 360, 640, 200, 900, ['rgba(255,140,80,.12)', 'rgba(0,0,0,.5)'])); grain(x, .1); }],
};
for (const [k, [w, h, f]] of Object.entries(BG)) A[k] = { w, h, q: .86, draw: x => f(x) };
