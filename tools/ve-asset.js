// Vẽ bộ ảnh 2D (WebP thật) cho 4 bản demo v2 bằng canvas trong Chromium chạy ngầm.
// Cách làm giống tools/ve-anh.js của dự án Sect: dải màu, nhiễu, đổ bóng, phát sáng, viền sáng.
// Dùng: node tools/ve-asset.js            → ghi vào v2/assets/
//       node tools/ve-asset.js it- sk-    → chỉ vẽ các nhóm có tên bắt đầu như vậy
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'v2', 'assets');
const only = process.argv.slice(2);

const PAGE = String.raw`
let SEED=7;const R=()=>(SEED=(SEED*16807)%2147483647)/2147483647;
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function noise(w,h,scale,oct,seed){const g=cv(w,h),x=g.getContext('2d');let s=seed||1;const r=()=>(s=(s*16807)%2147483647)/2147483647;
  x.fillStyle='#808080';x.fillRect(0,0,w,h);
  for(let o=0;o<oct;o++){const n=Math.max(2,Math.round(scale*Math.pow(2,o))),t=cv(n,n),tx=t.getContext('2d'),d=tx.createImageData(n,n);
    for(let i=0;i<n*n;i++){const v=r()*255;d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=v;d.data[i*4+3]=255;}tx.putImageData(d,0,0);
    x.globalAlpha=1/(o+1.2);x.imageSmoothingQuality='high';x.drawImage(t,0,0,w,h);}x.globalAlpha=1;return g;}
const NZ=noise(256,256,8,4,11), NZ2=noise(256,256,24,3,29);
function img(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src;});}
const C=(cx,cy,r)=>'M'+(cx-r)+' '+cy+'a'+r+' '+r+' 0 1 0 '+(2*r)+' 0a'+r+' '+r+' 0 1 0 '+(-2*r)+' 0Z';
const E=(cx,cy,rx,ry)=>'M'+(cx-rx)+' '+cy+'a'+rx+' '+ry+' 0 1 0 '+(2*rx)+' 0a'+rx+' '+ry+' 0 1 0 '+(-2*rx)+' 0Z';
// bảng màu: sáng, giữa, tối
const PL={gold:['#fff6c8','#e3ac3c','#6e400c'],silver:['#ffffff','#b9c8d6','#3e4e60'],bronze:['#f8d8a0','#a66a2c','#3e220c'],jade:['#eafff2','#5cc08c','#174e32'],
 wood:['#f0c084','#8c5a2a','#34200e'],red:['#ffd6c8','#d23c2a','#4e0c06'],paper:['#fffbea','#ead8a2','#94743a'],blue:['#e2f2ff','#4a8ade','#16336e'],
 purple:['#f4e2ff','#9a58da','#341464'],cyan:['#eaffff','#40d0e2','#0a5262'],green:['#ecffd8','#64bc36','#24520e'],pink:['#fff0f6','#f088b6','#7e2452'],
 stone:['#eeeee8','#9c9a92','#44423c'],black:['#9a98a6','#3a3846','#0c0c14'],white:['#ffffff','#e4eaf0','#8e9cac'],orange:['#ffe8c0','#f08a28','#6a2a06'],
 ivory:['#fffdf2','#e8dcc0','#8c7c5c'],teal:['#e0fff8','#2aa896','#0a4038'],crimson:['#ffc8cc','#b8142a','#3a0008'],ice:['#ffffff','#a8e4ff','#2a6a9a']};
// tô một hình kiểu sơn dầu: bóng đổ, dải màu chéo, vân nhiễu, tối mép, đốm sáng, viền tối
function F(x,d,c,o={}){const p=typeof d==='string'?new Path2D(d):d;const [l,m,k]=typeof c==='string'?PL[c]:c;const b=o.b||[0,0,64,64];
  x.save();if(o.sh!==0){x.shadowColor='rgba(0,0,0,'+(o.sh||.45)+')';x.shadowBlur=o.sb||3;x.shadowOffsetY=o.sy??1.6;}
  const g=x.createLinearGradient(b[0]+(b[2]-b[0])*.2,b[1],b[0]+(b[2]-b[0])*.8,b[3]);g.addColorStop(0,l);g.addColorStop(o.mid||.48,m);g.addColorStop(1,k);
  x.fillStyle=g;x.fill(p,o.eo?'evenodd':'nonzero');x.shadowColor='transparent';x.clip(p,o.eo?'evenodd':'nonzero');
  x.globalCompositeOperation='overlay';x.globalAlpha=o.tex??.42;x.drawImage(o.tx2?NZ2:NZ,b[0],b[1],b[2]-b[0],b[3]-b[1]);
  x.globalCompositeOperation='multiply';x.globalAlpha=o.ed??.5;x.filter='blur('+(o.eb||2.5)+'px)';x.lineWidth=o.ew||5;x.strokeStyle=k;x.stroke(p);x.filter='none';
  x.globalCompositeOperation='screen';const hx=o.hx??(b[0]+(b[2]-b[0])*.34),hy=o.hy??(b[1]+(b[3]-b[1])*.28),hr=o.hr??Math.max(b[2]-b[0],b[3]-b[1])*.42;
  const h=x.createRadialGradient(hx,hy,0,hx,hy,hr);h.addColorStop(0,'rgba(255,255,255,'+(o.hl??.6)+')');h.addColorStop(1,'rgba(255,255,255,0)');x.globalAlpha=1;x.fillStyle=h;x.fillRect(b[0],b[1],b[2]-b[0],b[3]-b[1]);
  x.restore();if(o.ln!==0){x.save();x.lineJoin='round';x.lineWidth=o.lw||1.1;x.strokeStyle=o.line||'rgba(28,14,4,.8)';x.stroke(p);x.restore();}}
function S(x,d,col,w,o={}){x.save();x.lineCap='round';x.lineJoin='round';x.lineWidth=w;x.strokeStyle=col;if(o.glow){x.shadowColor=o.glow;x.shadowBlur=o.gb||6;}if(o.op)x.globalCompositeOperation=o.op;x.globalAlpha=o.a??1;x.stroke(typeof d==='string'?new Path2D(d):d);x.restore();}
function GL(x,cx,cy,r,col,a=.7){x.save();x.globalCompositeOperation='lighter';const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha=a;x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);x.restore();}
function SP(x,cx,cy,s,col='#fff'){x.save();x.globalCompositeOperation='lighter';x.fillStyle=col;x.shadowColor=col;x.shadowBlur=s;x.beginPath();x.moveTo(cx,cy-s);x.quadraticCurveTo(cx,cy,cx+s,cy);x.quadraticCurveTo(cx,cy,cx,cy+s);x.quadraticCurveTo(cx,cy,cx-s,cy);x.quadraticCurveTo(cx,cy,cx,cy-s);x.fill();x.restore();}
function DOTS(x,n,b,col,r=.8){x.save();x.globalCompositeOperation='lighter';x.fillStyle=col;for(let i=0;i<n;i++){x.globalAlpha=.4+R()*.6;x.beginPath();x.arc(b[0]+R()*(b[2]-b[0]),b[1]+R()*(b[3]-b[1]),r*(.5+R()),0,7);x.fill();}x.restore();}
function grain(x,w,h,a){x.save();x.globalCompositeOperation='overlay';x.globalAlpha=a;x.drawImage(NZ2,0,0,w,h);x.restore();}

// ======================= VẬT PHẨM (128x128, lưới 64) =======================
const IT={
 pill:(x,[c,g])=>{GL(x,32,34,30,g,.75);F(x,C(32,35,19),c,{hx:25,hy:27,hr:16});S(x,'M18 38q14 10 28-2',g,2.2,{op:'lighter',a:.7,glow:g});S(x,'M22 28q8-6 18-2','#fff',1.4,{op:'lighter',a:.6});SP(x,44,21,5);SP(x,20,46,2.5,g);},
 vial:(x,[c,g])=>{GL(x,32,40,26,g,.55);F(x,'M24 8h16v6h-16z','wood',{sh:0});F(x,'M26 14h12v6c0 2 2 3 4 5 6 5 8 10 8 16 0 10-8 17-18 17S14 51 14 41c0-6 2-11 8-16 2-2 4-3 4-5z',c,{hx:26,hy:34});
   S(x,'M20 40q0-10 8-14',"#fff",2,{op:'screen',a:.7});S(x,'M12 9h40','rgba(0,0,0,0)',1);F(x,'M22 10q10-4 20 0l-1 3h-18z','red',{sh:0,ln:0});SP(x,40,30,3);},
 gourd:(x)=>{F(x,'M32 9c5 0 7 4 7 8 0 3-2 5-3 7 9 2 15 9 15 18 0 11-9 19-19 19S13 53 13 42c0-9 6-16 15-18-1-2-3-4-3-7 0-4 2-8 7-8z',['#ffe6a8','#d68a2a','#5a2806'],{hx:24,hy:34});
   S(x,'M27 24q5 2 10 0','#b8141e',3);S(x,'M33 24q6 8 2 18','#b8141e',1.6);F(x,'M32 9q1-6 7-6-1 5-6 7z','green',{sh:0});GL(x,26,40,10,'#fff2c0',.3);},
 lingzhi:(x)=>{F(x,'M28 34c0 8-2 16-4 22h11c-1-6-1-14 0-22z',['#fff0d2','#d8b080','#6a4a24']);
   F(x,'M7 31c2-13 14-21 26-21s24 8 24 18c0 4-4 7-10 7-4 0-6-2-14-2s-12 4-18 4c-6 0-9-2-8-6z',['#ffc08e','#b0361a','#3a0804'],{hx:24,hy:16,hl:.7});
   S(x,'M14 28q18-14 38-2','#ffd8a0',1.2,{a:.6});S(x,'M18 31q14-10 30-1','#ffd8a0',1,{a:.45});F(x,'M44 48c0-6 4-10 9-10s8 3 8 6c0 2-2 3-5 3h-12z',['#ffc08e','#b0361a','#3a0804'],{b:[44,38,61,50]});GL(x,30,22,14,'#ffb070',.35);},
 ginseng:(x)=>{F(x,'M30 20c-6 2-8 10-6 18 1 6-6 12-10 18 4 0 8-4 11-8 0 6-2 10-4 14 4-1 7-6 8-12 2 6 6 10 10 12-2-4-4-10-3-15 3 3 7 5 11 5-4-4-8-8-9-14 2-8 0-16-6-18z',['#fff2d4','#e0b072','#76461a']);
   for(const a of [-50,-10,30]){x.save();x.translate(32,20);x.rotate(a*Math.PI/180);F(x,'M0 0c-4-6-4-12 0-16 4 4 4 10 0 16z','green',{b:[-4,-16,4,0],sh:.2});x.restore();}
   F(x,C(32,6,3),'red',{sh:0});F(x,C(37,8,2.4),'red',{sh:0});S(x,'M24 32q4 2 8 0M25 40q3 2 6 0','#8a5a2a',.8,{a:.7});},
 lotus:(x)=>{F(x,E(32,52,24,6),'teal',{sh:.2});const P=[['M32 50C16 48 6 36 6 24c10 2 20 12 26 26z',['#fff0f6','#e870a6','#6e1a46']],['M32 50c16-2 26-14 26-26-10 2-20 12-26 26z',['#fff0f6','#e870a6','#6e1a46']],['M32 50c-12-6-18-18-16-30 8 4 14 16 16 30z','pink'],['M32 50c12-6 18-18 16-30-8 4-14 16-16 30z','pink'],['M32 50c-8-10-10-26 0-40 10 14 8 30 0 40z',['#ffffff','#ffb0d0','#a03a6a']]];
   for(const [d,c] of P)F(x,d,c,{sh:.25});GL(x,32,34,16,'#ffe0f0',.45);SP(x,32,18,4);},
 herb:(x,[c,g])=>{S(x,'M32 60V22','#3a6a1a',2.5);for(const [a,s] of [[-55,1],[-20,.8],[25,.9],[60,1]]){x.save();x.translate(32,40-s*8);x.rotate(a*Math.PI/180);F(x,'M0 0c-5-8-4-18 0-22 4 4 5 14 0 22z','green',{b:[-5,-22,5,0],sh:.2});x.restore();}
   GL(x,32,16,16,g,.8);F(x,C(32,16,6),c,{sh:0});SP(x,32,16,6);},
 ore:(x,[c,g])=>{F(x,'M9 45l6-21 14-12 19 4 8 19-6 15-22 6z','stone',{tx2:1});S(x,'M18 26l12 8 16-10M30 34l2 20M30 34l-14 10',g,1.6,{op:'lighter',glow:g,gb:5});F(x,'M30 22l6-6 6 6-6 8z',c,{sh:0});GL(x,36,22,12,g,.5);},
 crystal:(x,[c,g])=>{GL(x,32,34,30,g,.6);F(x,'M18 24l8 8-4 26-10-18z',c,{sh:.2});F(x,'M46 24l-8 8 4 26 10-18z',c,{sh:.2});F(x,'M32 4l11 17-11 41-11-41z',c,{hx:28,hy:16});
   S(x,'M32 4v58M21 21h22','#fff',.8,{op:'lighter',a:.6});SP(x,26,14,5);SP(x,46,40,3,g);},
 gem:(x,[c,g])=>{GL(x,32,34,28,g,.55);F(x,'M12 24l10-12h20l10 12-20 32z',c);S(x,'M12 24h40M22 12l10 44 10-44M22 12l-4 12 14 32 14-32-4-12','rgba(255,255,255,.55)',.8);SP(x,24,18,4);},
 ingot:(x)=>{GL(x,32,36,26,'#ffd060',.4);F(x,'M21 31c0-8 5-13 11-13s11 5 11 13z','gold',{hy:22});F(x,'M6 29c6 5 14 5 18 1h16c4 4 12 4 18-1-2 15-12 23-26 23S8 44 6 29z','gold');SP(x,26,24,4);},
 coin:(x)=>{F(x,C(32,32,24)+'M26 26h12v12H26z',['#fff0c0','#c88a2a','#4e2a06'],{eo:1});S(x,C(32,32,19),'#6a3a0a',1.2,{a:.6});x.save();x.fillStyle='#5a3408';x.font='bold 9px serif';x.textAlign='center';x.fillText('通',32,22);x.fillText('寶',32,49);x.fillText('元',19,35);x.fillText('天',45,35);x.restore();},
 sword:(x,[c,g])=>{GL(x,40,24,26,g,.45);F(x,'M49 5h10v10L29 45l-10-10z',c,{b:[19,5,59,45],hx:46,hy:12});S(x,'M55 9L24 40',"#fff",1,{op:'lighter',a:.8,glow:g});
   F(x,'M13 33l18 18-5 5-18-18z','gold');F(x,'M15 47l4 4-8 8-4-4z',['#e06a5a','#7a1a12','#2a0604']);F(x,C(8,58,3.2),'gold',{sh:0});S(x,'M7 59q-4 2-4 4',"#c81e1e",2.4);},
 saber:(x,[c,g])=>{GL(x,40,26,26,g,.4);F(x,'M56 4c3 16-8 32-27 42l-7-7c15-8 27-20 34-35z',c,{hx:46,hy:16});S(x,'M53 9c-2 12-12 24-26 33',"#fff",.9,{op:'lighter',a:.8});F(x,'M16 36l12 12-4 4-12-12z','bronze');F(x,'M15 47l4 4-9 9-4-4z','wood');},
 spear:(x,[c,g])=>{S(x,'M10 56L44 22','#5a3010',3.4);S(x,'M10 56L44 22','#a86a30',1.6);F(x,'M42 24l6-16 8-2-2 8-16 6z',c);F(x,'M38 22l6 6-4 2-4-4z','red',{sh:0});S(x,'M42 26q-6 6-10 4q4 4 2 10',"#d2241a",2);},
 fan:(x)=>{F(x,'M32 56L5 22c8-10 18-15 27-15s19 5 27 15z','paper',{hx:32,hy:16});for(let i=0;i<9;i++){const a=(-140+i*12.5)*Math.PI/180;S(x,'M32 56L'+(32+46*Math.cos(a))+' '+(56+46*Math.sin(a)),'rgba(90,60,20,.45)',.7);}
   F(x,C(42,24,5),'red',{sh:0,ln:0});S(x,'M10 30q8-8 14-2t14 0','#3a3a3a',1.4,{a:.7});F(x,'M29 52h6v8h-6z','wood',{sh:0});},
 robe:(x,[c])=>{F(x,'M22 7l10 6 10-6 15 10-6 13-5-3v32H18V27l-5 3-6-13z',c,{hx:28,hy:20});S(x,'M22 7l10 18 10-18','#f0c860',2.2);F(x,'M18 34h28v6H18z','gold',{sh:0});S(x,'M32 25v34','rgba(0,0,0,.35)',1);},
 crown:(x)=>{F(x,'M14 42c0-13 8-24 18-24s18 11 18 24z','gold',{hy:24});F(x,'M10 40h44v8H10z',['#e6fff0','#3aa870','#0e3a22'],{sh:0});F(x,'M2 30h60v3H2z','silver',{sh:0});F(x,C(32,30,5),'red',{sh:0});SP(x,26,22,4);},
 boots:(x,[c])=>{F(x,'M18 7h18v30l16 8c4 2 4 11 0 11H16c-2 0-4-2-4-4V40z',c);F(x,'M12 50h42v6H12z','black',{sh:0});S(x,'M18 14h18','#f0c860',2);},
 belt:(x)=>{F(x,'M3 25h58v13H3z',['#ffd0c8','#b8202a','#3e0408'],{sh:.3});F(x,C(32,31,10),'jade');F(x,C(32,31,4),'gold',{sh:0});S(x,'M28 41q-2 10 0 18M36 41q2 10 0 18','#b8202a',2.4);},
 ring:(x,[c,g])=>{F(x,C(32,40,18)+C(32,40,12),'gold',{eo:1});GL(x,32,18,14,g,.6);F(x,'M22 18l10-11 10 11-10 10z',c);SP(x,29,14,4);},
 pendant:(x)=>{S(x,'M32 2v10','#c81e1e',2.4);F(x,C(32,30,19)+C(32,30,6),'jade',{eo:1,hx:24,hy:20});S(x,C(32,30,13),'rgba(255,255,255,.5)',1);F(x,'M27 49h10l-2 4h-6z','gold',{sh:0});S(x,'M30 53q-2 6 0 10M34 53q2 6 0 10M32 53v10','#c81e1e',1.6);},
 bracelet:(x)=>{F(x,E(32,36,24,16)+E(32,36,16,9),['#f0fff8','#40b890','#0e4a36'],{eo:1});S(x,'M14 30q18-14 36 0','#fff',1.2,{op:'screen',a:.7});},
 bell:(x)=>{F(x,'M32 7c-12 0-16 12-16 24v11l-6 8h44l-6-8V31c0-12-4-24-16-24z','bronze');S(x,'M17 34h30M16 42h32','#3a200a',1.2,{a:.6});F(x,C(32,55,4.5),'bronze',{sh:0});F(x,'M28 2h8v6h-8z','bronze',{sh:0});GL(x,26,24,12,'#ffe0a0',.35);},
 tower:(x)=>{GL(x,32,30,30,'#ffd870',.45);let y=56;for(let i=0;i<4;i++){const w=34-i*7,xx=32-w/2;F(x,'M'+(xx+3)+' '+(y-9)+'h'+(w-6)+'v9h'+(-(w-6))+'z',['#ffd0b0','#b8302a','#3a0806'],{sh:0,ln:.5});
   F(x,'M'+(xx-5)+' '+(y-8)+'Q32 '+(y-17)+' '+(xx+w+5)+' '+(y-8)+'l-4-4H'+(xx-1)+'z','gold',{sh:.3});y-=12;}F(x,'M30 4h4l1 '+(y-2)+'h-6z','gold',{sh:0});SP(x,32,4,4,'#fff0a0');},
 mirror:(x)=>{F(x,'M28 46h8l2 14h-12z','bronze');F(x,C(32,27,21),'bronze');F(x,C(32,27,15),['#ffffff','#a8e8f0','#2a6a7a'],{hx:26,hy:20,hl:.9});SP(x,26,20,5);},
 cauldron:(x)=>{GL(x,32,22,20,'#ff8a30',.5);F(x,'M16 52l-4 9h5l4-7zM48 52l4 9h-5l-4-7z','bronze',{sh:0});F(x,'M9 24h46c0 18-10 29-23 29S9 42 9 24z','bronze',{hy:30});F(x,'M5 20h54v6H5z','bronze',{sh:0});
   S(x,'M8 20c-5-6 0-12 6-10M56 20c5-6 0-12-6-10','#6a3a10',2.6);S(x,'M12 32h40','#3a1a04',1,{a:.6});S(x,'M24 14q4-6 0-11M38 14q4-6 0-11','#e8e0d0',1.6,{a:.6});},
 scroll:(x,[c])=>{F(x,'M12 16h40v32H12z','paper',{tx2:1});S(x,'M20 24h24M20 30h24M20 36h16','#5a3a1a',1.2,{a:.7});F(x,'M6 12h8v40H6z','wood');F(x,'M50 12h8v40h-8z','wood');F(x,C(10,12,4)+C(10,52,4)+C(54,12,4)+C(54,52,4),'gold',{sh:0});F(x,'M30 44h8l-1 14-3-3-3 3z',c,{sh:0});},
 book:(x,[c])=>{F(x,'M13 7h35c3 0 5 2 5 5v41c0 3-2 5-5 5H13z',c);F(x,'M13 7h6v51h-6z','black',{sh:0});for(let i=0;i<5;i++)S(x,'M13 '+(12+i*10)+'h6','#e8d8b0',1);F(x,'M30 14h14v26H30z','paper',{sh:0});S(x,'M37 18v18M33 22h8M33 30h8','#3a1a0a',1.2);},
 talisman:(x)=>{GL(x,32,32,28,'#ffd040',.35);F(x,'M20 4h24l-1 56H21z',['#fffac8','#f0d058','#8a6810'],{tx2:1});S(x,'M26 12h12M32 12v36M25 22h14M26 30l12 8M38 30l-12 8M27 46h10','#c4141e',1.8);},
 egg:(x,[c,g])=>{GL(x,32,36,30,g,.6);F(x,'M32 7c12 0 20 18 20 31s-8 20-20 20-20-7-20-20S20 7 32 7z',c,{hx:26,hy:22});S(x,'M18 34l7 5 6-7 6 8 8-6',g,1.6,{op:'lighter',glow:g});DOTS(x,10,[18,16,46,52],'#ffffff',.9);},
 feather:(x,[c,g])=>{GL(x,30,32,28,g,.5);F(x,'M53 5C25 11 12 33 12 59c18-6 41-25 41-54z',c,{hx:40,hy:16});S(x,'M12 59L46 14','#fff',1.2,{a:.8});for(let i=0;i<8;i++){const t=.15+i*.1,px=12+34*t,py=59-45*t;S(x,'M'+px+' '+py+'l'+(6+i)+' 2',"rgba(255,255,255,.35)",.7);}},
 chest:(x)=>{F(x,'M8 28h48v28H8z','wood');F(x,'M8 28c0-12 10-18 24-18s24 6 24 18z',['#f0c084','#9a5a24','#3a1a06']);F(x,'M8 26h48v5H8zM8 50h48v5H8z','gold',{sh:0});F(x,'M27 28h10v12H27z','gold',{sh:0});GL(x,32,30,14,'#ffe080',.5);},
 token:(x,[c])=>{S(x,'M32 2v8','#c81e1e',2.4);F(x,'M17 10h30l6 8v35l-21 9-21-9V18z',c,{hx:26,hy:20});S(x,'M22 18h20v30l-10 5-10-5z','rgba(0,0,0,.35)',1.4);x.save();x.fillStyle='rgba(40,20,0,.75)';x.font='bold 18px serif';x.textAlign='center';x.fillText('令',32,40);x.restore();},
 banner:(x,[c])=>{S(x,'M14 4v58','#4a2a10',3.4);F(x,'M16 8h38l-6 11 6 11H16z',c);S(x,'M16 8h38','#f0c860',1.6);F(x,C(32,19,6),'gold',{sh:0});},
 core:(x,[c,g])=>{GL(x,32,32,30,g,.9);F(x,C(32,32,18),c,{hx:26,hy:24});F(x,'M32 18c4 6 4 22 0 28-4-6-4-22 0-28z','black',{sh:0,ln:0});S(x,'M32 20c3 6 3 18 0 24',g,1,{op:'lighter',glow:g});SP(x,26,24,3);},
 flame:(x)=>{GL(x,32,38,28,'#ff7a20',.7);F(x,'M32 4c4 14 20 21 20 37a20 20 0 0 1-40 0c0-10 6-14 8-22 4 6 6 8 8 8-2-8 0-17 4-23z','orange',{sh:0});F(x,'M32 26c3 9 11 12 11 21a11 11 0 0 1-22 0c0-7 7-11 11-21z',['#ffffff','#ffe080','#f08a20'],{sh:0,ln:0});},
 claw:(x)=>{for(const [dx,s] of [[-14,.85],[0,1],[14,.85]]){x.save();x.translate(32+dx,8);x.scale(s,s);F(x,'M-4 0c8 10 10 30 2 48 2-14 0-30-8-44z','ivory',{b:[-8,0,8,48]});x.restore();}},
 map:(x)=>{F(x,'M6 12l16-6 20 6 16-6v46l-16 6-20-6-16 6z','paper',{tx2:1});S(x,'M22 6v46M42 12v46','rgba(90,60,20,.4)',1);S(x,'M12 44q8-8 14-4t12-10 14-8','#c81e1e',1.4,{a:.85});F(x,C(50,22,3),'red',{sh:0});},
 hammer:(x)=>{S(x,'M14 56L40 30','#6a3a14',4);F(x,'M30 12l18 18-8 8-18-18z','silver');F(x,'M28 10l6-4 22 22-4 6z','stone',{sh:0});},
 seed:(x,[c,g])=>{GL(x,32,36,24,g,.6);F(x,E(32,38,12,16),c);S(x,'M32 22q-4-12 6-18','#4a8a2a',2);F(x,'M36 10c6-4 12-2 14 2-6 2-10 2-14-2z','green',{sh:0});},
 pearl:(x,[c,g])=>{GL(x,32,34,26,g,.6);F(x,'M10 44c4-12 14-18 22-18s18 6 22 18c-8 6-36 6-44 0z','ivory',{sh:.3});F(x,C(32,34,10),c,{hx:28,hy:30,hl:.9});SP(x,28,30,3);},
};
const ITEMS={ // tên tệp: [hình, tham số]
 'it-dan-do':['pill',[['#ffe0d0','#e83a2a','#5a0a04'],'#ff6a40']],'it-dan-vang':['pill',[['#fff8d0','#f0b830','#6a4006'],'#ffd040']],'it-dan-lam':['pill',[['#e0f4ff','#3a8ae8','#0e2a6a'],'#60c0ff']],
 'it-dan-tim':['pill',[['#f6e4ff','#a04ae8','#30085a'],'#c070ff']],'it-dan-luc':['pill',[['#e8ffe0','#40c060','#0a4a1a'],'#70ff90']],'it-dan-trang':['pill',[['#ffffff','#e0e8f0','#7a8a9a'],'#ffffff']],
 'it-binh-do':['vial',[['#ffd8d0','#d82a3a','#4a0610'],'#ff5a6a']],'it-binh-lam':['vial',[['#e0f6ff','#38a8e8','#0a3a6a'],'#6ad8ff']],'it-ho-lo':['gourd'],
 'it-linh-chi':['lingzhi'],'it-nhan-sam':['ginseng'],'it-sen':['lotus'],'it-thao-lam':['herb',[['#e8f8ff','#5ab8ff','#1a4a8a'],'#80d0ff']],'it-thao-do':['herb',[['#fff0e8','#ff6a3a','#7a1a06'],'#ff9a60']],
 'it-quang-lam':['ore',[['#e8ffff','#40d8f0','#0a4a6a'],'#60f0ff']],'it-quang-do':['ore',[['#ffe8d0','#f07a2a','#6a2006'],'#ffa040']],'it-linh-thach':['crystal',['cyan','#60f0ff']],'it-linh-thach-tim':['crystal',['purple','#c080ff']],
 'it-huyet-ngoc':['gem',['crimson','#ff4a5a']],'it-luc-bao':['gem',['jade','#60ffa0']],'it-nguyen-bao':['ingot'],'it-dong-tien':['coin'],
 'it-kiem':['sword',['silver','#8ae0ff']],'it-kiem-lua':['sword',[['#fff0d0','#f07030','#5a1404'],'#ff8040']],'it-dao':['saber',['silver','#c0e8ff']],'it-thuong':['spear',['silver','#fff']],'it-quat':['fan'],
 'it-ao-lam':['robe',['blue']],'it-ao-tim':['robe',['purple']],'it-ao-trang':['robe',['white']],'it-mu':['crown'],'it-giay':['boots',['black']],'it-dai':['belt'],'it-nhan':['ring',['blue','#60c0ff']],'it-nhan-do':['ring',['crimson','#ff5060']],
 'it-ngoc-boi':['pendant'],'it-vong':['bracelet'],'it-chuong':['bell'],'it-thap':['tower'],'it-guong':['mirror'],'it-lo-dan':['cauldron'],
 'it-truc-thu':['scroll',['red']],'it-bi-kip':['book',['blue']],'it-bi-kip-do':['book',['crimson']],'it-bua':['talisman'],'it-trung':['egg',['ice','#a0e8ff']],'it-trung-lua':['egg',['orange','#ff8a40']],
 'it-long-vu':['feather',[['#fff0c0','#f05a2a','#5a0806'],'#ff7a40']],'it-ruong':['chest'],'it-lenh-bai':['token',['bronze']],'it-lenh-ngoc':['token',['jade']],'it-co':['banner',['crimson']],
 'it-yeu-dan':['core',['crimson','#ff3a3a']],'it-yeu-dan-lam':['core',['blue','#40a0ff']],'it-hoa-chung':['flame'],'it-vuot':['claw'],'it-ban-do':['map'],'it-bua-ren':['hammer'],'it-hat-giong':['seed',['wood','#a0ff80']],'it-ngoc-trai':['pearl',['white','#e0f0ff']],
};

// ======================= CHIÊU THỨC (128x128, tròn) =======================
function skillBg(x,a,b){const g=x.createRadialGradient(28,24,2,32,32,32);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.beginPath();x.arc(32,32,32,0,7);x.fill();x.save();x.globalCompositeOperation='overlay';x.globalAlpha=.35;x.drawImage(NZ2,0,0,64,64);x.restore();}
function vign(x){const v=x.createRadialGradient(32,32,18,32,32,32);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=v;x.fillRect(0,0,64,64);}
const SK={
 fire:x=>{skillBg(x,'#6a1a04','#1a0400');GL(x,32,40,30,'#ff5010',.9);F(x,'M32 6c5 14 22 20 22 36a22 22 0 0 1-44 0c0-10 7-15 9-23 4 6 6 8 8 8-2-9 0-16 5-21z','orange',{sh:0,ln:0});F(x,'M32 26c3 9 12 12 12 21a12 12 0 0 1-24 0c0-7 8-11 12-21z',['#ffffff','#ffe080','#ff8a20'],{sh:0,ln:0});DOTS(x,14,[8,6,56,40],'#ffb060',.8);},
 ice:x=>{skillBg(x,'#1a4a7a','#04101e');GL(x,32,32,28,'#80d8ff',.7);for(const a of [0,60,120,180,240,300]){x.save();x.translate(32,32);x.rotate(a*Math.PI/180);F(x,'M0-26l5 14-5 12-5-12z','ice',{b:[-5,-26,5,0],sh:0,ln:.5});x.restore();}F(x,C(32,32,6),'white',{sh:0});SP(x,32,32,10);DOTS(x,12,[6,6,58,58],'#e0f8ff',.7);},
 thunder:x=>{skillBg(x,'#2a1a5a','#06041a');GL(x,32,30,30,'#a080ff',.7);S(x,'M40 4L20 34h14l-6 26 22-34H36z','#fff',2,{glow:'#c0a0ff',gb:10});F(x,'M40 4L20 34h14l-6 26 22-34H36z',['#ffffff','#fff080','#ffb000'],{sh:0,ln:0});S(x,'M22 34l-12 8M44 28l12-6M30 46l-10 10','#d8c8ff',1,{op:'lighter',glow:'#a080ff'});},
 sword:x=>{skillBg(x,'#0e3a5a','#020a14');GL(x,32,32,30,'#60e0ff',.6);for(const s of [1,-1]){x.save();x.translate(32,32);x.scale(s,1);F(x,'M-24 22L20-22l4 4-44 44z',['#ffffff','#a0f0ff','#2a8ab0'],{b:[-24,-22,24,26],sh:0,ln:0});x.restore();}S(x,'M6 50L58 8','#fff',1,{op:'lighter',glow:'#80f0ff',gb:8});SP(x,32,32,8);},
 wind:x=>{skillBg(x,'#1a5a4a','#021410');for(let i=0;i<4;i++)S(x,'M'+(10+i*3)+' '+(20+i*8)+'q20-'+(14-i*2)+' 40 0',['#ffffff','#c0fff0','#80ffd8','#40d0a0'][i],3-i*.5,{op:'lighter',glow:'#80ffd0'});S(x,'M18 48q14 10 30-4',"#e0fff8",2,{op:'lighter'});},
 earth:x=>{skillBg(x,'#5a3a14','#140a02');GL(x,32,50,24,'#ffb060',.4);F(x,'M6 58l10-30 8 14 8-30 8 26 8-16 10 36z','stone',{sh:0});S(x,'M16 28l4 30M32 12v46M48 26l-4 32','rgba(255,200,120,.5)',1);DOTS(x,10,[8,8,56,30],'#c8a070',1);},
 water:x=>{skillBg(x,'#0e3a7a','#020a1e');F(x,'M6 44c8-20 26-30 40-26 10 3 14 12 10 20-4-8-12-10-20-6 8 2 12 8 10 14-14-4-26 2-40-2z','blue',{sh:0,ln:0});S(x,'M14 42c10-14 24-20 36-16','#e0f4ff',1.4,{op:'lighter'});DOTS(x,14,[10,10,54,30],'#a0e0ff',.9);},
 heal:x=>{skillBg(x,'#1a5a20','#021204');GL(x,32,32,26,'#80ff80',.6);F(x,'M14 52C14 26 30 12 52 10c0 24-16 40-38 42z','green',{sh:0});S(x,'M14 52L42 22','#e0ffd0',1.4);F(x,'M28 22h8v-8h6v8h8v6h-8v8h-6v-8h-8z','white',{sh:0,b:[28,14,50,36]});DOTS(x,10,[6,6,58,58],'#d0ffb0',.8);},
 shield:x=>{skillBg(x,'#5a4a10','#140e02');GL(x,32,32,28,'#ffd860',.6);F(x,'M32 6l22 8v16c0 15-9 24-22 30C19 54 10 45 10 30V14z','gold',{sh:0});F(x,'M32 14l14 5v11c0 10-6 16-14 20-8-4-14-10-14-20V19z',['#fff8e0','#f0c860','#8a5a10'],{sh:0,ln:0});S(x,'M32 18v28M22 30h20','#8a5a10',1.4);},
 poison:x=>{skillBg(x,'#2a4a0a','#060e02');GL(x,32,36,26,'#a0ff40',.5);F(x,'M32 8c6 12 16 20 16 32a16 16 0 0 1-32 0c0-12 10-20 16-32z',['#f0ffc0','#70d020','#1a4a04'],{sh:0});F(x,C(26,38,3.5)+C(38,38,3.5),'black',{sh:0,ln:0});S(x,'M26 48q6-3 12 0','#1a2a04',1.6);DOTS(x,8,[8,8,56,56],'#c0ff60',1.2);},
 illusion:x=>{skillBg(x,'#4a1a6a','#0e0418');GL(x,32,32,28,'#e080ff',.6);F(x,'M4 32q28-26 56 0-28 26-56 0z',['#fff0ff','#d090f0','#5a1a7a'],{sh:0});F(x,C(32,32,11),'purple',{sh:0});F(x,E(32,32,3,9),'black',{sh:0,ln:0});SP(x,28,28,3);S(x,C(32,32,22),'#f0c0ff',.8,{op:'lighter',a:.5});},
 palm:x=>{skillBg(x,'#6a4a0a','#160e02');for(let i=0;i<12;i++){const a=i/12*Math.PI*2;S(x,'M32 32L'+(32+30*Math.cos(a))+' '+(32+30*Math.sin(a)),'#ffe080',1,{op:'lighter',a:.5});}GL(x,32,32,26,'#ffd040',.7);
   F(x,'M22 56V30c0-3 4-3 4 0v-12c0-3 4-3 4 0v-4c0-3 4-3 4 0v4c0-3 4-3 4 0v14c1-3 5-4 5 0 0 6-2 14-4 18v6z','gold',{sh:0});},
 blood:x=>{skillBg(x,'#5a0410','#120002');GL(x,32,32,28,'#ff2040',.6);F(x,'M10 50C14 26 34 10 56 8 40 16 26 32 22 54z','crimson',{sh:0});S(x,'M14 48C20 28 36 14 52 10','#ffd0d0',1.2,{op:'lighter'});DOTS(x,10,[30,30,58,58],'#ff4050',1.4);},
 star:x=>{skillBg(x,'#1a1a5a','#02020e');DOTS(x,30,[2,2,62,62],'#ffffff',.6);for(const [a,b,s] of [[18,20,7],[42,16,5],[30,40,10]]){GL(x,a,b,s*2.5,'#a0c0ff',.6);SP(x,a,b,s);}S(x,'M54 6L34 30','#c0d8ff',1.4,{op:'lighter',glow:'#a0c0ff'});},
 qi:x=>{skillBg(x,'#0a4a4a','#021010');for(let i=0;i<3;i++)S(x,C(32,32,8+i*7),['#ffffff','#a0fff0','#40d8c0'][i],2-i*.4,{op:'lighter',glow:'#60ffe0',a:.8});x.save();x.translate(32,32);x.scale(.5,.5);x.translate(-32,-32);F(x,C(32,19,13)+'M32 6a26 26 0 0 1 0 52a13 13 0 0 1 0-26a13 13 0 0 0 0-26z','white',{sh:0});x.restore();},
 meteor:x=>{skillBg(x,'#4a1a0a','#100402');for(const [a,b] of [[46,16],[30,30],[52,40]]){S(x,'M'+(a+12)+' '+(b-14)+'L'+a+' '+b,'#ffb060',3,{op:'lighter',glow:'#ff6020',gb:8});F(x,C(a,b,4),'orange',{sh:0,ln:0});}GL(x,22,48,20,'#ff6020',.6);},
};

// ======================= TỌA KỴ (320x240, lưới 80x60) =======================
const MT={
 crane:x=>{GL(x,40,32,34,'#c0e8ff',.5);F(x,'M30 30C20 14 8 8 2 6c6 12 14 20 24 28z','white',{b:[2,6,30,34]});F(x,'M4 8c2 4 4 6 6 8l-4 0z','black',{sh:0});F(x,'M14 36c8-8 22-10 32-6l14-16c2-2 5-1 4 2l-10 16c2 7-2 13-12 15-12 2-24-2-28-11z','white',{b:[14,14,64,52],hx:30,hy:30});
   F(x,'M38 30C40 14 50 4 62 2c-4 12-12 22-20 30z','white',{b:[38,2,62,32]});F(x,'M58 4c2 0 4 0 4-2l-2 6z','black',{sh:0});F(x,'M10 38l-8 4 10 0z','black',{sh:0});F(x,C(63,14,2),'red',{sh:0,ln:0});F(x,'M65 15l10 2-10 1z','gold',{sh:0});S(x,'M36 50l-4 10M42 50l2 10','#3a3a3a',1);},
 _tiger:x=>{GL(x,40,34,34,'#a0d0ff',.4);F(x,'M10 30c0-7 9-11 22-11h16c7 0 11 2 13 6l7-2c2 0 3 2 2 4l-4 5c0 4-2 7-7 7l-2 12h-6l-1-9H28l-2 9h-6l-1-9c-5-2-9-5-9-12z','white',{b:[10,19,70,52],hx:36,hy:24});
   F(x,'M62 20c4-4 10-4 12 0 2 4 0 10-4 12h-10c-2-4-2-8 2-12z','white',{b:[58,16,76,32]});F(x,'M63 17l2-5 3 4zM70 16l3-4 1 5z','white',{sh:0,b:[62,12,74,18]});
   for(const s of ['M26 20l2 9','M33 19l1 10','M40 19l0 10','M47 20l-1 9','M54 22l-2 7'])S(x,s,'#2a2a3a',1.6);F(x,C(70,22,1.3),['#ffffff','#40c0ff','#0a3a6a'],{sh:0,ln:0});GL(x,70,22,4,'#60d0ff',.9);S(x,'M10 28q-10-4-8-14',"#e8eef4",3);S(x,'M10 28q-10-4-8-14',"#2a2a3a",1,{a:.5});},
 sword:x=>{GL(x,40,30,36,'#80f0ff',.6);F(x,'M6 46L70 10l4 4L12 52z',['#ffffff','#b0f0ff','#2a7ab0'],{b:[6,10,74,52]});S(x,'M10 48L72 12','#fff',.8,{op:'lighter',glow:'#80f0ff'});F(x,'M10 40l8 14-4 2-8-14z','gold');
   for(let i=0;i<4;i++){F(x,E(20+i*12,54-i*2,10,3),'white',{sh:0,ln:0,hl:.8});}},
 _cloud:x=>{GL(x,40,32,36,'#ffe0a0',.5);const p=C(24,36,11)+C(38,28,14)+C(54,34,11)+'M14 36h50v10H14z';F(x,p,['#ffffff','#ffe8f0','#d8a0b8'],{b:[12,14,66,48],sh:.25});S(x,'M18 44q20 6 44 0','#f0c060',1.6);S(x,'M62 38q12 0 14-10',"#ffffff",3);S(x,'M28 30q4-6 10-4',"#f0c060",1.2);},
 phoenix:x=>{GL(x,40,30,38,'#ff7a20',.7);F(x,'M30 30C20 10 6 6 0 6c6 12 14 22 26 28z',['#fff0c0','#f06020','#5a0804'],{b:[0,6,30,34]});F(x,'M44 28C50 8 64 2 78 2c-6 14-16 24-28 30z',['#fff0c0','#f06020','#5a0804'],{b:[44,2,78,32]});
   F(x,'M26 36c6-8 16-10 24-6l8-8c2-2 5 0 4 2l-6 10c0 8-6 12-14 12-8 0-14-4-16-10z',['#fff8d0','#ff8a30','#7a1a04'],{b:[26,22,62,48]});for(const d of ['M28 42C18 50 8 56 2 58','M30 44C22 54 16 58 8 60','M32 44C28 54 26 58 22 60'])S(x,d,'#ffb040',2,{op:'lighter',glow:'#ff6020'});F(x,'M62 24l8-1-7 4z','gold',{sh:0});},
 turtle:x=>{GL(x,40,36,34,'#60c0a0',.4);F(x,'M14 42c2-14 14-22 26-22s24 8 26 22z','teal',{b:[14,20,66,42]});for(const d of ['M28 24l4 8h16l4-8','M22 32h36','M32 32l-4 10M48 32l4 10'])S(x,d,'#0a3028',1.2);F(x,'M64 36c4-2 10 0 12 4-2 4-8 4-12 2z','stone',{sh:0});F(x,'M18 42h8v6h-8zM54 42h8v6h-8z','stone',{sh:0});S(x,'M14 40q-8 2-12 8',"#3a6a5a",2.6);},
};

// ======================= LẦU CÁC (256x256, lưới 64) =======================
function bld(x,o){const roof=PL[o.roof]||o.roof,wall=o.wall||['#e8a888','#a8301e','#3a0804'];GL(x,32,52,26,'#ffffff',.25);
  F(x,'M6 58l4-6h44l4 6z','stone',{sh:.3});let y=52;const T=o.t||2;
  for(let i=0;i<T;i++){const w=(o.w||44)-i*9,xx=32-w/2,h=i===0?12:9;F(x,'M'+(xx+4)+' '+(y-h)+'h'+(w-8)+'v'+h+'h'+(-(w-8))+'z',wall,{sh:0,ln:.5,b:[xx,y-h,xx+w,y]});
    for(let k=1;k<4;k++)S(x,'M'+(xx+4+(w-8)*k/4)+' '+(y-h)+'v'+h,'#3a1a0a',.8,{a:.7});
    x.save();x.globalCompositeOperation='lighter';x.fillStyle='rgba(255,190,90,.22)';x.fillRect(xx+6,y-h+3,(w-12),h*.35);x.restore();
    const ry=y-h;F(x,'M'+(xx-6)+' '+(ry+1)+'Q'+(xx+2)+' '+(ry-2)+' '+(xx+6)+' '+(ry-7)+'H'+(xx+w-6)+'Q'+(xx+w-2)+' '+(ry-2)+' '+(xx+w+6)+' '+(ry+1)+'Q32 '+(ry-3)+' '+(xx-6)+' '+(ry+1)+'z',roof,{b:[xx-6,ry-8,xx+w+6,ry+2],sh:.35});
    S(x,'M'+(xx+8)+' '+(ry-6)+'H'+(xx+w-8),'#fff',.6,{a:.5});y=ry-6;}
  F(x,'M28 '+(y+1)+'Q32 '+(y-6)+' 36 '+(y+1)+'z',roof,{sh:0});S(x,'M32 '+(y-3)+'v-6','#e8c060',1.2);
  if(o.lan!==0){for(const lx of [10,54]){S(x,'M'+lx+' 40v4','#3a1a0a',.6);GL(x,lx,46,5,'#ff9030',.9);F(x,E(lx,46,1.8,2.4),'red',{sh:0,ln:0});}}
  if(o.fx==='fire'){GL(x,32,30,20,'#ff7020',.6);S(x,'M26 10q4-6 0-10M38 12q4-6 0-10','#e8e0d8',1.2,{a:.5});}
  if(o.fx==='glow'){GL(x,32,30,30,o.gc||'#80f0ff',.45);DOTS(x,12,[6,6,58,40],o.gc||'#c0ffff',.6);}
  if(o.fx==='mist'){x.save();x.filter='blur(3px)';x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.ellipse(32,57,30,4,0,0,7);x.fill();x.restore();}}
const BL={'bd-chinh-dien':{roof:'gold',t:3,w:50,fx:'mist'},'bd-dan-phong':{roof:'bronze',t:2,fx:'fire'},'bd-tang-kinh':{roof:'blue',t:3,w:40},'bd-luyen-khi':{roof:'stone',t:2,w:46,fx:'fire'},
 'bd-tu-linh':{roof:'jade',t:2,w:40,fx:'glow',gc:'#80ffd0'},'bd-linh-thu':{roof:'green',t:1,w:48},'bd-linh-dien':{roof:'wood',t:1,w:38,lan:0},'bd-truyen-cong':{roof:'purple',t:3,w:42,fx:'glow',gc:'#d0a0ff'},
 'bd-vo-truong':{roof:'crimson',t:1,w:52},'bd-ma-dien':{roof:'black',t:3,w:46,wall:['#5a5a6a','#2a2a36','#0a0a10'],fx:'glow',gc:'#ff4060'},'bd-thuong-hoi':{roof:'orange',t:2,w:46},'bd-dong-thien':{roof:'teal',t:2,w:38,fx:'glow',gc:'#a0e8ff'}};

// ======================= QUÁI VẬT (bóng tối + viền sáng, 256x256 lưới 64) =======================
function rim(x,d,col,eyes){const p=new Path2D(d);x.save();x.shadowColor=col;x.shadowBlur=10;x.fillStyle=col;x.fill(p);x.restore();
  x.save();x.translate(0,1.2);F(x,p,['#3a3446','#15121c','#050408'],{sh:0,ln:0,hl:.15,tex:.3});x.restore();
  x.save();x.clip(p);x.globalCompositeOperation='lighter';x.lineWidth=2.2;x.strokeStyle=col;x.filter='blur(1.2px)';x.translate(0,-1.4);x.stroke(p);x.restore();
  for(const [ex,ey,r] of eyes){GL(x,ex,ey,r*4,col,1);F(x,E(ex,ey,r,r*.6),['#ffffff',col,col],{sh:0,ln:0});}}
const MO={
 'mo-yeu-lang':x=>rim(x,'M32 60l-9-6-7-14-6-28 12 10h20l12-10-6 28-7 14zM20 30l-8 6 6 2zM44 30l8 6-6 2z','#ff3a30',[[25,32,2.2],[39,32,2.2]]),
 'mo-xa-yeu':x=>{S(x,'M8 58c10-6 30-4 30-16S14 34 20 22s22-8 26-14','rgba(0,0,0,0)',1);const d='M6 58c12-4 26-4 28-14s-20-10-16-22 20-10 24-16l6 4c-4 8-20 8-22 16s18 12 14 24-20 14-32 12z M42 4l12 2-2 10-10-2z';rim(x,d,'#60ff70',[[49,8,1.6]]);},
 'mo-ma-tuong':x=>rim(x,'M32 4l4 8 8-6-2 10c8 4 12 12 12 22v20H10V38c0-10 4-18 12-22l-2-10 8 6zM6 40l6-8v24H4zM58 40l-6-8v24h8z','#c060ff',[[26,24,2],[38,24,2]]),
 'mo-oan-hon':x=>rim(x,'M32 6c12 0 18 10 18 22v20l-6-4-4 8-4-6-4 8-4-8-4 6-4-8-6 4V28C14 16 20 6 32 6z','#80e0ff',[[26,24,2.6],[38,24,2.6]]),
 'mo-hoa-ky-lan':x=>rim(x,'M8 44c0-10 8-16 20-16h14l8-10c2-4 8-6 10-2l2 6-4 4 2 8c0 6-4 10-10 10l-2 12h-5l-2-10H26l-2 10h-5l-2-10c-5-1-9-4-9-8zM52 14l4-10 2 10z','#ffa030',[[56,22,1.8]]),
 'mo-thach-nhan':x=>rim(x,'M20 8h24l6 12-4 10 10 8-4 20H16L12 38l10-8-4-10z','#ffd080',[[27,18,2],[37,18,2]]),
};

// ======================= KHUNG & NÚT GIAO DIỆN =======================
function rrp(a,b,w,h,r){return 'M'+(a+r)+' '+b+'H'+(a+w-r)+'Q'+(a+w)+' '+b+' '+(a+w)+' '+(b+r)+'V'+(b+h-r)+'Q'+(a+w)+' '+(b+h)+' '+(a+w-r)+' '+(b+h)+'H'+(a+r)+'Q'+a+' '+(b+h)+' '+a+' '+(b+h-r)+'V'+(b+r)+'Q'+a+' '+b+' '+(a+r)+' '+b+'Z';}
const UI={
 // A: giấy cũ, viền mực, góc dấu son (120x120, cắt 30)
 'ui-a-khung':async(x)=>{const T=await img(TEX.sq);x.save();x.beginPath();x.rect(4,4,112,112);x.clip();x.drawImage(T,0,0,512,512,0,0,120,120);x.restore();
   S(x,'M6 6h108v108H6z','#3a2410',2.2,{a:.85});S(x,'M11 11h98v98H11z','#3a2410',.8,{a:.6});for(const [a,b] of [[11,11],[109,11],[11,109],[109,109]]){x.save();x.fillStyle='#a82418';x.beginPath();x.arc(a,b,5,0,7);x.fill();x.fillStyle='#f0d8b0';x.font='bold 6px serif';x.textAlign='center';x.fillText('道',a,b+2);x.restore();}},
 'ui-a-nut':x=>{F(x,rrp(4,6,112,40,6),['#e8584a','#a82418','#4a0804'],{b:[4,6,116,46],tex:.5,tx2:1,lw:1.4});S(x,rrp(8,10,104,32,4),'#f0c890',.8,{a:.7});},
 'ui-a-nut2':x=>{F(x,rrp(4,6,112,40,6),['#f0d8a8','#b08a50','#4a3010'],{b:[4,6,116,46],tex:.5,tx2:1,lw:1.4});S(x,rrp(8,10,104,32,4),'#fff4d8',.8,{a:.7});},
 'ui-a-the':async(x)=>{const T=await img(TEX.sq);x.save();x.beginPath();x.rect(3,3,114,154);x.clip();x.drawImage(T,100,100,300,400,0,0,120,160);x.restore();S(x,'M5 5h110v150H5z','#2a1a08',2);S(x,'M10 10h100v140H10z','#8a5a20',1.2);F(x,C(16,16,9),['#ffe0a0','#c08030','#4a2a08'],{b:[7,7,25,25],sh:.3});},
 'ui-a-dau':x=>{GL(x,32,32,30,'#ff4030',.15);F(x,'M32 4c8 0 10 6 16 8s12 4 12 12-4 10-4 16 2 12-6 16-14 4-18 4-10 0-18-4-6-10-6-16-4-8-4-16 6-10 12-12 8-8 16-8z',['#ff7060','#b01a10','#3a0402'],{tex:.4});S(x,C(32,32,16),'#ffc0a0',1,{a:.5});},
 // B: ngọc trắng viền vàng (120x120, cắt 32)
 'ui-b-khung':x=>{F(x,rrp(2,2,116,116,14),['#fffdf6','#e4efe8','#a8c4b8'],{b:[2,2,118,118],tex:.15,ln:0,sh:0});S(x,rrp(3,3,114,114,13),'#c8a050',2.4);S(x,rrp(8,8,104,104,9),'#e8d8a0',.8);
   for(const [a,b,r] of [[14,14,0],[106,14,90],[106,106,180],[14,106,270]]){x.save();x.translate(a,b);x.rotate(r*Math.PI/180);F(x,'M-8 4c0-8 4-12 12-12h10l-4 4H4c-4 0-6 2-6 6v6l-4 4z','gold',{b:[-8,-8,14,14],sh:.2});x.restore();}},
 'ui-b-nut':x=>{F(x,rrp(4,6,112,40,20),['#fff4c8','#e0b04a','#7a4a10'],{b:[4,6,116,46],tex:.25,lw:1.2});S(x,rrp(9,10,102,30,15),'#fff8e0',1,{a:.8});x.save();x.globalCompositeOperation='screen';x.fillStyle='rgba(255,255,255,.4)';x.fill(new Path2D(rrp(14,11,92,12,6)));x.restore();},
 'ui-b-nut2':x=>{F(x,rrp(4,6,112,40,20),['#f0fff8','#7ac8a8','#1e5a46'],{b:[4,6,116,46],tex:.25,lw:1.2});S(x,rrp(9,10,102,30,15),'#e8fff4',1,{a:.8});},
 // C: kính tối viền thép, góc vát (120x120, cắt 24)
 'ui-c-khung':x=>{const d='M14 2H106L118 14V106L106 118H14L2 106V14Z';x.fillStyle='rgba(8,18,30,.86)';x.fill(new Path2D(d));x.save();x.clip(new Path2D(d));x.globalAlpha=.25;x.globalCompositeOperation='overlay';x.drawImage(NZ2,0,0,120,120);x.restore();
   S(x,d,'#5aa8d0',1.6,{a:.9});S(x,'M2 22V14L14 2h18M118 98v8l-12 12H88','#a0f0ff',2.4,{glow:'#60d8ff',gb:6});S(x,'M8 8h6M106 112h6','#a0f0ff',1);},
 'ui-c-nut':x=>{const d='M10 6H112L118 12V40L112 46H10L4 40V12Z';const g=x.createLinearGradient(0,6,0,46);g.addColorStop(0,'#2a7aa8');g.addColorStop(1,'#0a2a44');x.fillStyle=g;x.fill(new Path2D(d));S(x,d,'#80e0ff',1.4,{glow:'#40c0ff',gb:5});S(x,'M10 9H110','#c0f4ff',.8,{a:.7});},
 'ui-c-nut2':x=>{const d='M10 6H112L118 12V40L112 46H10L4 40V12Z';const g=x.createLinearGradient(0,6,0,46);g.addColorStop(0,'#f0b040');g.addColorStop(1,'#8a4a08');x.fillStyle=g;x.fill(new Path2D(d));S(x,d,'#ffe0a0',1.4,{glow:'#ffb040',gb:5});S(x,'M10 9H110','#fff0c0',.8,{a:.7});},
 // D: chàm đêm viền đồng chạm (120x120, cắt 30)
 'ui-d-khung':x=>{F(x,rrp(2,2,116,116,6),['#2a2a52','#161634','#080816'],{b:[2,2,118,118],tex:.3,ln:0,sh:0,hl:.12});S(x,rrp(3,3,114,114,5),'#b8823a',2.6);S(x,rrp(9,9,102,102,3),'#6a4a2a',1);
   for(const [a,b] of [[10,10],[110,10],[10,110],[110,110]]){F(x,'M'+a+' '+(b-8)+'L'+(a+8)+' '+b+'L'+a+' '+(b+8)+'L'+(a-8)+' '+b+'Z','bronze',{b:[a-8,b-8,a+8,b+8],sh:.3});GL(x,a,b,8,'#ffb050',.5);}},
 'ui-d-nut':x=>{F(x,rrp(4,6,112,40,4),['#ffd890','#c07a28','#4a2206'],{b:[4,6,116,46],tex:.35,lw:1.2});S(x,rrp(9,10,102,30,2),'#ffe8b8',.8,{a:.7});GL(x,60,26,30,'#ffb040',.2);},
 'ui-d-nut2':x=>{F(x,rrp(4,6,112,40,4),['#8a8ab8','#3a3a6a','#10102a'],{b:[4,6,116,46],tex:.35,lw:1.2});S(x,rrp(9,10,102,30,2),'#b8b8e8',.8,{a:.6});},
};

// ======================= ẢNH LỚN =======================
async function bigCauldron(){const W=600,H=600,c=cv(W,H),x=c.getContext('2d');x.scale(W/64,H/64);SEED=91;
  GL(x,32,52,30,'#ff6a10',.7);GL(x,32,22,26,'#ffb040',.35);
  for(let i=0;i<5;i++){const dx=-12+i*6;F(x,'M'+(32+dx)+' 50c2 4 6 6 6 9a6 6 0 0 1-12 0c0-3 4-5 6-9z',i%2?'orange':['#ffffff','#ffd060','#ff6a10'],{sh:0,ln:0,b:[26+dx,50,38+dx,62]});}
  F(x,'M15 46l-4 14h5l4-11zM49 46l4 14h-5l-4-11z','bronze',{b:[11,46,53,60]});
  F(x,'M8 22h48c0 18-10 28-24 28S8 40 8 22z','bronze',{hy:28,tex:.55,b:[8,22,56,50]});
  S(x,'M10 30h44M12 38h40','#2a1404',.6,{a:.8});for(let i=0;i<8;i++)S(x,'M'+(14+i*5)+' 31l2 6','#f0c070',.5,{a:.5});
  x.save();x.fillStyle='rgba(40,18,2,.7)';x.font='bold 7px serif';x.textAlign='center';x.fillText('乾 坤 鼎',32,46);x.restore();
  F(x,'M4 18h56v6H4z','bronze',{b:[4,18,60,24]});S(x,'M7 18c-5-7 0-14 7-11M57 18c5-7 0-14-7-11','#5a3410',2.2);
  GL(x,32,18,16,'#ffd070',.8);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<5;i++){x.globalAlpha=.25;x.filter='blur(1.5px)';x.fillStyle='#fff0d0';x.beginPath();x.ellipse(24+i*4,10-i*2,4,6,0,0,7);x.fill();}x.restore();
  DOTS(x,30,[8,0,56,30],'#ffd080',.35);return c;}
async function enemyArt(src,col,hue){const I=await img(src);const W=400,H=400,c=cv(W,H),x=c.getContext('2d');
  x.filter='blur(14px)';x.globalAlpha=.9;x.drawImage(I,0,0,W,H);x.filter='none';x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,W,H);
  x.globalCompositeOperation='source-over';x.globalAlpha=1;x.filter='hue-rotate('+hue+'deg) saturate(1.6) brightness(.55) contrast(1.3)';x.drawImage(I,0,0,W,H);x.filter='none';
  const t=cv(W,H),tx=t.getContext('2d');tx.drawImage(I,0,0,W,H);tx.globalCompositeOperation='source-in';const g=tx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,0,0,.2)');g.addColorStop(1,'rgba(0,0,0,.6)');tx.fillStyle=g;tx.fillRect(0,0,W,H);x.drawImage(t,0,0);
  x.save();x.globalCompositeOperation='lighter';x.fillStyle=col;x.shadowColor=col;x.shadowBlur=14;for(const ex of [.465,.535]){x.beginPath();x.ellipse(W*ex,H*.17,5,2.5,0,0,7);x.fill();}x.restore();return c;}
`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent('<html><body></body></html>'); await p.addScriptTag({ content: PAGE });
  const d64 = f => 'data:image/webp;base64,' + fs.readFileSync(path.join(OUT, f)).toString('base64');
  await p.evaluate(([sq, nam, nu]) => { window.TEX = { sq, nam, nu }; }, [d64('giay-vuong.webp'), d64('nv-nam.webp'), d64('nv-nu-dem.webp')]);
  const want = n => !only.length || only.some(o => n.startsWith(o));
  const save = async (name, js, q = 0.86) => { if (!want(name)) return;
    const url = await p.evaluate(async ([e, q]) => { const c = await eval(e); return c.toDataURL('image/webp', q); }, [js, q]);
    fs.writeFileSync(path.join(OUT, name + '.webp'), Buffer.from(url.split(',')[1], 'base64')); };
  const unit = (W, H, gx, gy, call) => `(async()=>{const c=cv(${W},${H}),x=c.getContext('2d');x.scale(${W / gx},${H / gy});SEED=${Math.round(Math.random() * 1e6)};await (${call});return c;})()`;
  for (const [n, [k, a]] of Object.entries(await p.evaluate(() => ITEMS))) await save(n, unit(128, 128, 64, 64, `IT[${JSON.stringify(k)}](x,${JSON.stringify(a || [])})`));
  for (const k of await p.evaluate(() => Object.keys(SK))) await save('sk-' + k, unit(128, 128, 64, 64, `(SK.${k}(x),vign(x))`));
  for (const k of await p.evaluate(() => Object.keys(MT).filter(k=>k[0]!=='_'))) await save('mt-' + k, unit(320, 240, 80, 60, `MT.${k}(x)`));
  for (const k of await p.evaluate(() => Object.keys(BL))) await save(k, unit(256, 256, 64, 64, `bld(x,BL[${JSON.stringify(k)}])`));
  for (const k of await p.evaluate(() => Object.keys(UI))) { const [w, h, gx, gy] = k === 'ui-a-dau' ? [128, 128, 64, 64] : k.endsWith('the') ? [240, 320, 120, 160] : k.includes('nut') ? [240, 104, 120, 52] : [240, 240, 120, 120];
    await save(k, unit(w, h, gx, gy, `UI[${JSON.stringify(k)}](x)`), 0.9); }
  await save('lo-dan-lon', 'bigCauldron()');
  await save('mo-tam-ma', `enemyArt(TEX.nam,'#ff2a40',140)`);
  await save('mo-huyet-ma', `enemyArt(TEX.nam,'#ff6a20',160)`);
  await save('mo-u-co', `enemyArt(TEX.nu,'#a060ff',40)`);
  await save('mo-bang-co', `enemyArt(TEX.nu,'#60d8ff',-30)`);
  await save('mo-doc-nhan', `enemyArt(TEX.nam,'#80ff40',-60)`);
  await save('mo-kim-giap', `enemyArt(TEX.nam,'#ffd040',-150)`);
  await b.close();
  console.log(fs.readdirSync(OUT).length, 'tệp trong', OUT);
})();
