/* Seq2Seq — 🎬 Animasyonlu tur: 3B mimari (iframe) + her durakta o adımın matris işleminin canlı animasyonu.
   Sayılar gerçek: lesson-s2s-weights.js'teki eğitilmiş ağırlıklar, soru/model Simülasyon A ile ortak (window.__s2sAdd). */
(function(){
  const D=window.S2S_CK; if(!D) return;
  const H=D.H, PLUS=10, ST=10, EN=11, VD=12;
  const NE=t=>t<10?String(t):'+', ND=t=>t<10?String(t):(t===ST?'<s>':'<e>');
  const sig=x=>1/(1+Math.exp(-x));
  const f2=v=>(v<0?'−':'')+Math.abs(v).toFixed(2).replace('.',',');
  // ---- model (lesson-s2s-add.js ile aynı hesap, kapı ayrıntılarıyla)
  function cell(W,b,x,h,c){const n=x.length,z=new Array(4*H);for(let r=0;r<4*H;r++){const row=W[r];let s=b[r];for(let j=0;j<n;j++)s+=row[j]*x[j];for(let j=0;j<H;j++)s+=row[n+j]*h[j];z[r]=s;}
    const F=[],I=[],G=[],O=[],c2=[],h2=[];for(let k=0;k<H;k++){F[k]=sig(z[k]);I[k]=sig(z[H+k]);G[k]=Math.tanh(z[2*H+k]);O[k]=sig(z[3*H+k]);c2[k]=F[k]*c[k]+I[k]*G[k];h2[k]=O[k]*Math.tanh(c2[k]);}
    return {W,b,inp:x.concat(h),nx:n,z,f:F,i:I,g:G,o:O,cp:c,c:c2,h:h2};}
  function run(ck,a,b){const P=ck.W,z=()=>new Array(H).fill(0);let s={h1:z(),c1:z(),h2:z(),c2:z()};const enc=[],dec=[];
    for(const t of [a,PLUS,b]){const e=P.embE[t],l1=cell(P.We1,P.be1,e,s.h1,s.c1),l2=cell(P.We2,P.be2,l1.h,s.h2,s.c2);s={h1:l1.h,c1:l1.c,h2:l2.h,c2:l2.c};enc.push({tok:t,emb:e,L:[l1,l2]});}
    const ctx=s;let tok=ST;
    for(let k=0;k<3;k++){const e=P.embD[tok],l1=cell(P.Wd1,P.bd1,e,s.h1,s.c1),l2=cell(P.Wd2,P.bd2,l1.h,s.h2,s.c2);s={h1:l1.h,c1:l1.c,h2:l2.h,c2:l2.c};
      const lg=P.Wo.map((row,q)=>{let v=P.bo[q];for(let j=0;j<H;j++)v+=row[j]*l2.h[j];return v;}),mx=Math.max(...lg),ex=lg.map(v=>Math.exp(v-mx)),sm=ex.reduce((x,y)=>x+y,0),p=ex.map(v=>v/sm);
      let best=0;for(let q=1;q<VD;q++)if(lg[q]>lg[best])best=q;dec.push({inp:tok,emb:e,L:[l1,l2],lg,ex,sm,p,out:best});tok=best;}
    return {P,enc,ctx,dec};}
  let S=null,R=null,KN=0;
  function recompute(){const st=window.__s2sAdd||{a:7,b:5,ci:3};S={a:st.a,b:st.b,ci:st.ci};R=run(D.ck[st.ci],st.a,st.b);
    KN=0;R.ctx.h2.forEach((v,j)=>{if(Math.abs(v)>Math.abs(R.ctx.h2[KN]))KN=j;});}

  // ---- çizim yardımcıları
  const W0=980,H0=470;let cv,g;
  const colv=(v,vm)=>{const a=0.14+0.86*Math.min(1,Math.abs(v)/(vm||1));return v>=0?'rgba(70,130,255,'+a+')':'rgba(240,85,105,'+a+')';};
  const T=(s,x,y,o)=>{o=o||{};g.font=(o.b?'bold ':'')+(o.s||12)+'px ui-monospace,Menlo,monospace';g.fillStyle=o.c||'#ccd5e8';g.textAlign=o.a||'left';g.textBaseline=o.bl||'alphabetic';g.fillText(s,x,y);};
  const ease=t=>t<0?0:t>1?1:t*t*(3-2*t);
  const seg=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
  function strip(x,y,v,cw,ch,o){o=o||{};const n=o.n==null?v.length:o.n;for(let k=0;k<v.length;k++){const X=o.vert?x:x+k*cw,Y=o.vert?y+k*ch:y;
      g.fillStyle=k<n?colv(v[k],o.vm):'#151b28';g.fillRect(X,Y,cw-1,ch-1);
      if(o.num&&k<n){T(f2(v[k]),X+cw/2,Y+ch/2+1,{s:o.ns||10,a:'center',bl:'middle',c:'#fff'});}}
    if(o.hl!=null&&o.hl>=0){g.strokeStyle='#ffd54a';g.lineWidth=2;const X=o.vert?x:x+o.hl*cw,Y=o.vert?y+o.hl*ch:y;g.strokeRect(X-1,Y-1,cw+1,ch+1);}
    if(o.mark!=null){g.strokeStyle='#46c46a';g.lineWidth=1.5;const X=o.vert?x:x+o.mark*cw,Y=o.vert?y+o.mark*ch:y;g.strokeRect(X-1,Y-1,cw+1,ch+1);}}
  function mat(x,y,M,cw,ch,vm,hlRow,rows){const R2=rows==null?M.length:rows;for(let r=0;r<M.length;r++)for(let c=0;c<M[0].length;c++){g.fillStyle=r<R2?colv(M[r][c],vm):'#151b28';g.fillRect(x+c*cw,y+r*ch,Math.max(1,cw-(cw>4?1:0)),Math.max(1,ch-(ch>4?1:0)));}
    if(hlRow!=null&&hlRow>=0){g.strokeStyle='#ffd54a';g.lineWidth=2;g.strokeRect(x-1,y+hlRow*ch-1,M[0].length*cw+2,ch+1);}}
  function arrow(x1,y1,x2,y2,c){g.strokeStyle=c||'#95a2c2';g.fillStyle=c||'#95a2c2';g.lineWidth=1.6;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1);g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-8*Math.cos(a-0.4),y2-8*Math.sin(a-0.4));g.lineTo(x2-8*Math.cos(a+0.4),y2-8*Math.sin(a+0.4));g.fill();}
  const GN=['f (unut)','i (giriş)','c̃ (aday)','o (çıkış)'],GC=['#e06a6a','#46c46a','#f0a032','#3a7afe'];

  // ---- sahne çizicileri
  // gömme: one-hot · emb tablosu = satır
  function sEmb(dec,t){const tok=dec?R.dec[0].inp:R.enc[0].tok,M=dec?R.P.embD:R.P.embE,V=M.length,nm=dec?ND:NE,e=M[tok];
    const x0=60,y0=70,cw=26,ch=24;
    T((dec?'Decoder':'Encoder')+' sözlüğü: '+V+' sembol → one-hot 1×'+V,x0,40,{s:13,b:1});
    // one-hot (dikey, tablonun solunda)
    for(let r=0;r<V;r++){const on=r===tok;g.fillStyle=on?'#3a7afe':'#151b28';g.fillRect(x0,y0+r*ch,cw-2,ch-2);T(on?'1':'0',x0+cw/2-1,y0+r*ch+ch/2,{s:11,a:'center',bl:'middle',c:on?'#fff':'#55607a'});T(nm(r),x0-8,y0+r*ch+ch/2,{s:11,a:'right',bl:'middle',c:on?'#ffd54a':'#8b95ab'});}
    T('one-hot',x0-6,y0-10,{s:11,c:'#95a2c2'});
    const tx=x0+70;T((dec?'embD':'embE')+'  '+V+'×8',tx,y0-10,{s:11,c:dec?'#46b0e0':'#f0a032',b:1});
    const scan=Math.min(tok,Math.floor(ease(seg(t,0,0.45))*(tok+1)));
    mat(tx,y0,M,34,ch,1.2,scan);
    for(let r=0;r<V;r++)for(let c=0;c<8;c++)T(f2(M[r][c]),tx+c*34+16,y0+r*ch+ch/2,{s:9,a:'center',bl:'middle',c:r===tok&&t>0.45?'#fff':'rgba(255,255,255,.45)'});
    if(t>0.45){const k=ease(seg(t,0.45,0.75)),ox=tx+8*34+70,oy=y0+tok*ch*(1-k)+(y0+ch*3)*k;arrow(tx+8*34+6,y0+tok*ch+ch/2,ox-8,oy+ch/2,'#ffd54a');
      strip(ox,oy,e,46,ch,{num:1,ns:10,vm:1.2});T('x = satır «'+nm(tok)+'»  1×8',ox,oy-10,{s:12,b:1,c:'#ffd54a'});
      if(t>0.78)T('Çarpma yok: one-hot × tablo = sadece o satırı oku.',ox,oy+ch+28,{s:12,c:'#95a2c2'});
      if(t>0.78)T('Bu 8 sayı Katman 1 hücresinin x girdisi.',ox,oy+ch+48,{s:12,c:'#95a2c2'});}
    return 'one-hot['+nm(tok)+'] · '+(dec?'embD':'embE')+' → satır '+tok+' = ('+e.slice(0,4).map(f2).join('; ')+'; …)';}
  // matris çarpımı: z = W·[x ; h₋₁] + b   (96 satır = 4 kapı × 24 nöron)
  function sMatmul(L,t,nm,inLab){const n=L.nx,cols=n+H,cw=Math.min(14,Math.floor(470/cols)),ch=3.6,x0=150,y0=92;
    T('girdi = [ '+inLab+' | hₜ₋₁ (24) ]  1×'+cols,x0,40,{s:12,b:1});
    strip(x0,52,L.inp,cw,22,{vm:1.2});g.strokeStyle='#ffd54a';g.lineWidth=1;g.beginPath();g.moveTo(x0+n*cw-0.5,48);g.lineTo(x0+n*cw-0.5,78);g.stroke();
    T(inLab,x0+n*cw/2,86,{s:10,a:'center',c:'#95a2c2'});T('hₜ₋₁',x0+n*cw+H*cw/2,86,{s:10,a:'center',c:'#95a2c2'});
    const rows=Math.floor(ease(seg(t,0.05,0.85))*96),cur=Math.min(95,rows);
    mat(x0,y0,L.W,cw,ch,0.8,t<0.86?cur:-1);T(nm+'  96×'+cols,x0,y0+96*ch+16,{s:11,b:1,c:'#b592f0'});
    for(let gI=0;gI<4;gI++){const yy=y0+gI*24*ch;g.fillStyle=GC[gI];g.fillRect(x0-14,yy,6,24*ch-2);T(GN[gI],x0-20,yy+12*ch,{s:11,a:'right',bl:'middle',c:GC[gI]});
      g.strokeStyle='#46c46a';g.lineWidth=1;g.strokeRect(x0-1,yy+KN*ch,cols*cw+1,ch);}
    const zx=x0+cols*cw+50;T('z  96×1 (+ b)',zx,y0-8,{s:11,b:1});
    strip(zx,y0,L.z,40,ch,{vert:1,vm:4,n:rows,hl:t<0.86?cur:-1});arrow(x0+cols*cw+6,y0+cur*ch+ch/2,zx-6,y0+cur*ch+ch/2,'#ffd54a');
    for(let gI=0;gI<4;gI++){const r=gI*H+KN;if(r<rows)T(GN[gI][0]+'['+(KN+1)+'] = '+f2(L.z[r]),zx+50,y0+r*ch+ch/2,{s:11,bl:'middle',c:GC[gI]});}
    T('96 satırın her biri: 1 nokta çarpım ('+cols+' çarpım + toplam) + b',x0+120,y0+96*ch+16,{s:11,c:'#95a2c2'});
    T('yeşil çerçeve: izlediğimiz nöron '+(KN+1),x0+120,y0+96*ch+34,{s:11,c:'#46c46a'});
    const gI=Math.floor(cur/H),j=cur%H,row=L.W[cur];
    return 'z['+cur+'] ('+GN[gI].split(' ')[0]+', nöron '+(j+1)+') = b + Σ W·girdi = '+f2(L.b[cur])+' + ('+f2(row[0])+')('+f2(L.inp[0])+') + ('+f2(row[1])+')('+f2(L.inp[1])+') + … ('+cols+' terim) = '+f2(L.z[cur]);}
  // kapılar: z'nin 4 parçası → σ / tanh
  function sGates(L,t){const x0=40,cw=17,y0=70;T('z (96) → 4 parça × 24 → aktivasyon',x0,40,{s:13,b:1});
    const n=Math.floor(ease(seg(t,0.1,0.8))*H),acts=['σ','σ','tanh','σ'],out=[L.f,L.i,L.g,L.o];
    for(let gI=0;gI<4;gI++){const y=y0+gI*92;T(GN[gI],x0,y-6,{s:12,b:1,c:GC[gI]});strip(x0,y,L.z.slice(gI*H,gI*H+H),cw,26,{vm:4,mark:KN});
      arrow(x0+H*cw+10,y+13,x0+H*cw+60,y+13,GC[gI]);T(acts[gI],x0+H*cw+34,y+6,{s:12,a:'center',c:GC[gI],b:1});
      strip(x0+H*cw+70,y,out[gI],cw,26,{vm:1,n,mark:KN,hl:n<H?n:-1});
      const z=L.z[gI*H+KN],v=out[gI][KN];if(n>KN)T(acts[gI]+'('+f2(z)+') = '+f2(v),x0+2*H*cw+90,y+18,{s:12,c:'#fff',b:1});}
    T('σ → 0…1 arası "ne kadar" (kapı), tanh → −1…1 arası aday bilgi',x0,y0+4*92+6,{s:12,c:'#95a2c2'});
    return 'nöron '+(KN+1)+': f='+f2(L.f[KN])+'  i='+f2(L.i[KN])+'  c̃='+f2(L.g[KN])+'  o='+f2(L.o[KN]);}
  // hafıza güncelleme: eleman eleman
  function sCell(L,t){const x0=150,cw=24,ch=28,y0=56;const rows=[['cₜ₋₁',L.cp,1.5],['f',L.f,1],['f⊙cₜ₋₁',L.f.map((v,k)=>v*L.cp[k]),1.5],['i',L.i,1],['c̃',L.g,1],['i⊙c̃',L.i.map((v,k)=>v*L.g[k]),1.5],['c = toplam',L.c,1.5],['tanh(c)',L.c.map(Math.tanh),1],['o',L.o,1],['h = o⊙tanh(c)',L.h,1]];
    T('Eleman eleman (⊙): her nöron kendi sütununda, matris çarpımı yok',x0-110,34,{s:13,b:1});
    const j=Math.min(H-1,Math.floor(ease(seg(t,0.05,0.9))*H));
    rows.forEach((r,i)=>{const y=y0+i*ch+(i>=6?10:0)+(i>=9?6:0);T(r[0],x0-10,y+ch/2,{s:11,a:'right',bl:'middle',c:i===6?'#46c46a':i===9?'#e06a6a':'#ccd5e8',b:i===6||i===9});strip(x0,y,r[1],cw,ch-4,{vm:r[2],n:i<2||i===3||i===4||i===8?H:j+1,hl:j});});
    const k=j,cell=(a)=>f2(a);
    T('sütun '+(k+1)+':',x0+H*cw+16,y0+20,{s:12,b:1,c:'#ffd54a'});
    T('c = '+cell(L.f[k])+'×'+cell(L.cp[k])+' + '+cell(L.i[k])+'×'+cell(L.g[k]),x0+H*cw+16,y0+44,{s:11});
    T('  = '+cell(L.c[k]),x0+H*cw+16,y0+62,{s:11,b:1,c:'#46c46a'});
    T('h = '+cell(L.o[k])+'×tanh('+cell(L.c[k])+')',x0+H*cw+16,y0+92,{s:11});
    T('  = '+cell(L.h[k]),x0+H*cw+16,y0+110,{s:11,b:1,c:'#e06a6a'});
    T('c → sağa (sonraki adım)',x0+H*cw+16,y0+160,{s:11,c:'#46c46a'});T('h → sağa ve yukarı',x0+H*cw+16,y0+178,{s:11,c:'#e06a6a'});
    return 'nöron '+(k+1)+': c = f·c₋₁ + i·c̃ = '+cell(L.f[k])+'·'+cell(L.cp[k])+' + '+cell(L.i[k])+'·'+cell(L.g[k])+' = '+cell(L.c[k])+'   h = o·tanh(c) = '+cell(L.h[k]);}
  // t=2, t=3: aynı tablolar, hafıza taşınıyor
  function sTime(t){const x0=110,cw=9,colw=240,y0=80;T('Aynı We1/We2, her adımda yeni girdi + bir önceki hafıza',x0-70,40,{s:13,b:1});
    const lab=[['c²',1,'c'],['h²',1,'h'],['c¹',0,'c'],['h¹',0,'h']];
    for(let i=0;i<3;i++){const vis=seg(t,i*0.28,i*0.28+0.2);if(vis<=0)continue;g.globalAlpha=ease(vis);const x=x0+i*colw,e=R.enc[i];
      T('t='+(i+1)+'  «'+NE(e.tok)+'»',x+H*cw/2,y0-12,{s:13,a:'center',b:1,c:'#ffd54a'});
      lab.forEach((l,r)=>{const y=y0+r*58+(r>=2?24:0),L=e.L[l[1]],v=l[2]==='c'?L.c:L.h;strip(x,y,v,cw,22,{vm:l[2]==='c'?1.5:1});if(i===0)T(l[0],x-8,y+12,{s:12,a:'right',bl:'middle',c:l[2]==='c'?'#46c46a':'#e06a6a',b:1});
        if(i<2&&t>i*0.28+0.2)arrow(x+H*cw+6,y+11,x+colw-10,y+11,l[2]==='c'?'#46c46a':'#e06a6a');});
      T('Katman 2',x+H*cw/2,y0+128,{s:10,a:'center',c:'#7d879c'});T('Katman 1',x+H*cw/2,y0+268,{s:10,a:'center',c:'#7d879c'});
      g.globalAlpha=1;}
    T('Encoder tahmin yapmaz: yalnız okur, hafızayı günceller.',x0-70,y0+320,{s:12,c:'#95a2c2'});
    return 'h¹ (t=3, nöron '+(KN+1)+') = '+f2(R.enc[2].L[0].h[KN])+'   h² = '+f2(R.enc[2].L[1].h[KN]);}
  // bağlam
  function sCtx(t){const x0=60,cw=10,y0=90,k=ease(seg(t,0.15,0.75)),dx=x0+k*520;
    T('🍾 Bağlam = encoder\'ın son durumu: 2 katman × (c, h) × 24 = 96 sayı',x0,40,{s:13,b:1});
    const rows=[['c¹',R.ctx.c1,'#46c46a'],['h¹',R.ctx.h1,'#e06a6a'],['c²',R.ctx.c2,'#46c46a'],['h²',R.ctx.h2,'#e06a6a']];
    rows.forEach((r,i)=>{const y=y0+i*62;strip(x0,y,r[1],cw,24,{vm:1.5});T(r[0],x0-8,y+12,{s:12,a:'right',bl:'middle',c:r[2],b:1});
      g.globalAlpha=0.35+0.65*k;strip(dx,y,r[1],cw,24,{vm:1.5});g.globalAlpha=1;});
    T('ENCODER t=3',x0+H*cw/2,y0-14,{s:12,a:'center',c:'#3a7afe',b:1});T('DECODER t=1 başlangıcı',dx+H*cw/2,y0-14,{s:12,a:'center',c:'#46b0e0',b:1});
    T('Kopya: Katman 1 → Katman 1, Katman 2 → Katman 2. Decoder soruyu başka hiçbir yoldan görmez.',x0,y0+4*62+20,{s:12,c:'#95a2c2'});
    return 'bağlam: 96 sayı, ör. h²['+(KN+1)+'] = '+f2(R.ctx.h2[KN])+', c²['+(KN+1)+'] = '+f2(R.ctx.c2[KN]);}
  // tam bağlı: puan = Wo·h² + bo
  function sFC(t){const d=R.dec[0],h=d.L[1].h,x0=150,cw=17,ch=24,y0=96,Wo=R.P.Wo;
    T('h² (24)  →  Wo (12×24) · h² + bo  →  12 puan',x0-110,40,{s:13,b:1});
    strip(x0,60,h,cw,22,{vm:1});T('h²',x0-8,71,{s:12,a:'right',bl:'middle',c:'#e06a6a',b:1});
    const rows=Math.floor(ease(seg(t,0.05,0.85))*12),cur=Math.min(11,rows);
    mat(x0,y0,Wo,cw,ch,1.5,t<0.86?cur:-1);for(let q=0;q<12;q++)T(ND(q),x0-8,y0+q*ch+ch/2,{s:11,a:'right',bl:'middle',c:q===d.out?'#ffd54a':'#8b95ab'});
    const zx=x0+H*cw+50;T('puan',zx,y0-8,{s:11,b:1});strip(zx,y0,d.lg,60,ch,{vert:1,vm:8,n:rows,num:1,ns:11,hl:t<0.86?cur:-1});
    arrow(x0+H*cw+6,y0+cur*ch+ch/2,zx-6,y0+cur*ch+ch/2,'#ffd54a');
    if(rows>d.out)T('← en yüksek: «'+ND(d.out)+'»',zx+68,y0+d.out*ch+ch/2,{s:12,bl:'middle',c:'#ffd54a',b:1});
    const r=Wo[cur];return 'puan[«'+ND(cur)+'»] = bo + Σ Wo·h² = '+f2(R.P.bo[cur])+' + ('+f2(r[0])+')('+f2(h[0])+') + ('+f2(r[1])+')('+f2(h[1])+') + … (24 terim) = '+f2(d.lg[cur]);}
  // softmax
  function sSoft(t){const d=R.dec[0],x0=80,bw=58,y0=380,k=ease(seg(t,0.1,0.7));
    T('softmax: eᵖᵘᵃⁿ / Σ eᵖᵘᵃⁿ  → olasılık (toplam 1)',x0,40,{s:13,b:1});
    for(let q=0;q<12;q++){const x=x0+q*(bw+8),p=d.p[q]*k,hgt=Math.max(1,p*280),win=q===d.out;
      g.fillStyle=win?'#46c46a':'rgba(70,130,255,.65)';g.fillRect(x,y0-hgt,bw,hgt);T(ND(q),x+bw/2,y0+18,{s:13,a:'center',c:win?'#ffd54a':'#ccd5e8',b:win});
      T('%'+(d.p[q]*100).toFixed(d.p[q]>0.995?0:1).replace('.',','),x+bw/2,y0-hgt-6,{s:10,a:'center',c:win?'#fff':'#8b95ab'});
      T(f2(d.lg[q]),x+bw/2,y0+36,{s:10,a:'center',c:'#7d879c'});}
    T('puan:',x0-10,y0+36,{s:10,a:'right',c:'#7d879c'});
    if(t>0.75)T('Seçim = en yüksek olasılık → «'+ND(d.out)+'» (greedy)',x0,90,{s:14,b:1,c:'#ffd54a'});
    return 'Σ e^puan = '+f2(d.sm)+'   p(«'+ND(d.out)+'») = e^'+f2(d.lg[d.out])+' / '+f2(d.sm)+' → %'+(d.p[d.out]*100).toFixed(1).replace('.',',');}
  // üretim döngüsü
  function sLoop(t){const x0=80,y0=110,cw=280;T('Çıktı bir sonraki adımın girdisi olur (aynı Wd1/Wd2/Wo)',x0,40,{s:13,b:1});
    R.dec.forEach((d,k)=>{const vis=seg(t,k*0.28,k*0.28+0.2);if(vis<=0)return;g.globalAlpha=ease(vis);const x=x0+k*cw;
      g.strokeStyle='#46b0e0';g.lineWidth=1.5;g.strokeRect(x,y0,200,150);T('decoder t='+(k+1),x+100,y0+22,{s:12,a:'center',c:'#46b0e0',b:1});
      T('girdi «'+ND(d.inp)+'»',x+100,y0+180,{s:13,a:'center',c:'#3a7afe',b:1});arrow(x+100,y0+168,x+100,y0+152,'#3a7afe');
      strip(x+16,y0+46,d.L[1].h,7,20,{vm:1});T('h²',x+10,y0+56,{s:10,a:'right',bl:'middle',c:'#e06a6a'});
      T('«'+ND(d.out)+'»  %'+(d.p[d.out]*100).toFixed(1).replace('.',','),x+100,y0+110,{s:16,a:'center',b:1,c:'#ffd54a'});
      if(k<2&&t>k*0.28+0.22){g.strokeStyle='#ff9a3c';g.lineWidth=2;g.beginPath();g.moveTo(x+200,y0+105);g.lineTo(x+cw-40,y0+105);g.lineTo(x+cw-40,y0+175);g.lineTo(x+cw+60,y0+175);g.stroke();}
      g.globalAlpha=1;});
    const ans=R.dec.map(d=>d.out),tt=S.a+S.b,ok=ans[0]===Math.floor(tt/10)&&ans[1]===tt%10&&ans[2]===EN;
    if(t>0.86)T('Cevap: '+ND(ans[0])+ND(ans[1])+'   '+(ok?'✓ doğru ('+S.a+' + '+S.b+' = '+tt+')':'✗ doğrusu '+tt)+'   «<e>» gelince üretim durur',x0,y0+250,{s:14,b:1,c:ok?'#46c46a':'#e06a6a'});
    return R.dec.map((d,k)=>'t='+(k+1)+': «'+ND(d.inp)+'» → «'+ND(d.out)+'»').join('   ');}

  // ---- duraklar
  const E=()=>R.enc[0],Dd=()=>R.dec[0];
  const STOPS=[
    {k:'E1',ch:'7 → gömme',t:()=>'Encoder t=1: «'+NE(E().tok)+'» → one-hot → embE satırı',dur:7,f:{step:1,ids:['eo0','ee0','embE']},draw:t=>sEmb(false,t),
     txt:'Token önce one-hot olur (11 kutudan biri 1). One-hot ile tablonun çarpımı tek bir satırı seçer: encoder\'ın KENDİ gömme tablosundan 8 sayı.'},
    {k:'E2',ch:'Katman 1: z = W·[x;h]',t:()=>'Encoder Katman 1: kapı puanları z = We1·[x ; hₜ₋₁] + b',dur:11,f:{step:1,ids:['e1_0','We1']},draw:t=>sMatmul(E().L[0],t,'We1','x (8)'),
     txt:'Girdi (8 gömme + 24 önceki h) We1 tablosunun 96 satırıyla tek tek nokta çarpılır: 96 = 4 kapı × 24 nöron. İlk adımda hₜ₋₁ = 0.'},
    {k:'E3',ch:'kapılar σ/tanh',t:()=>'Encoder Katman 1: 96 puan → 4 kapı',dur:7,f:{step:1,ids:['e1_0']},draw:t=>sGates(E().L[0],t),
     txt:'z dört parçaya bölünür. f, i, o σ ile 0…1 arası «ne kadar» olur; c̃ tanh ile −1…1 arası aday bilgi.'},
    {k:'E4',ch:'c ve h güncelle',t:()=>'Encoder Katman 1: hafıza güncelleme (eleman eleman)',dur:9,f:{step:1,ids:['e1_0']},draw:t=>sCell(E().L[0],t),
     txt:'Her nöron kendi sütununda: c = f·c₋₁ + i·c̃ (unut + yaz), h = o·tanh(c) (dışarı söylenen). Matris çarpımı yok, eleman eleman.'},
    {k:'E5',ch:'Katman 2',t:()=>'Encoder Katman 2: aynı hesap, girdi Katman 1\'in h\'si',dur:9,f:{step:1,ids:['e2_0','We2']},draw:t=>sMatmul(E().L[1],t,'We2','h¹ (24)'),
     txt:'Katman 2 aynı kalıbı kendi tablosu We2 ile yapar; x yerine Katman 1\'in h\'si (24) girer. Sonra yine kapılar ve c, h güncellemesi.'},
    {k:'E6',ch:'t=2, t=3',t:()=>'Encoder t=2 «+», t=3 «'+NE(R.enc[2].tok)+'»: aynı tablolar, yeni hafıza',dur:8,f:{step:3,ids:['e1_1','e2_1','e1_2','e2_2']},draw:t=>sTime(t),
     txt:'Her adımda aynı We1/We2 kullanılır. Değişen yalnız girdi ve sağa taşınan c, h: soru adım adım hafızaya yazılır.'},
    {k:'E7',ch:'🍾 bağlam',t:()=>'Bağlam: 96 sayı decoder\'a geçer',dur:6,f:{step:4,ids:['xh1','xc1','xh2','xc2']},draw:t=>sCtx(t),
     txt:'Encoder\'ın son c ve h\'leri decoder\'ın başlangıç hafızası olur. Darboğaz: sorunun tamamı bu 96 sayıda.'},
    {k:'D1',ch:'<s> → gömme',t:()=>'Decoder t=1: «<s>» → embD satırı',dur:6,f:{step:5,ids:['do0','de0','embD']},draw:t=>sEmb(true,t),
     txt:'Decoder başlangıç işaretiyle başlar ve KENDİ gömme tablosunu (embD, 12×8) kullanır. Aynı rakamın encoder ve decoder gömmesi farklıdır.'},
    {k:'D2',ch:'Katman 1–2',t:()=>'Decoder Katman 1: z = Wd1·[x ; bağlam h¹] + b',dur:9,f:{step:5,ids:['d1_0','d2_0','Wd1','Wd2']},draw:t=>sMatmul(Dd().L[0],t,'Wd1','x (8)'),
     txt:'Encoder ile aynı LSTM hesabı, ama ayrı tablolar (Wd1, Wd2). hₜ₋₁ ve cₜ₋₁ burada bağlamdan geliyor. Katman 2 de aynı şekilde Wd2 ile.'},
    {k:'D3',ch:'tam bağlı',t:()=>'Tam bağlı katman: puan = Wo · h² + bo',dur:9,f:{step:5,ids:['d2_0','df0','Wo']},draw:t=>sFC(t),
     txt:'Katman 2\'nin h\'si (24) Wo\'nun 12 satırıyla nokta çarpılır: her decoder sembolü için bir puan.'},
    {k:'D4',ch:'softmax',t:()=>'Softmax → olasılık → seçim',dur:7,f:{step:5,ids:['df0','dp0']},draw:t=>sSoft(t),
     txt:'Puanlar e üssüyle pozitif yapılıp toplama bölünür: toplamı 1 olan olasılıklar. En yüksek olan seçilir.'},
    {k:'D5',ch:'döngü → cevap',t:()=>'Üretim döngüsü: çıktı → sonraki girdi',dur:9,f:{step:7,ids:['dp0','do1','dp1','do2','dp2']},draw:t=>sLoop(t),
     txt:'Seçilen sembol bir sonraki adımın girdisi olur; aynı hesap tekrar edilir. «<e>» gelince durur.'}];

  // ---- her durak için sözel anlatım + elde ettik (canlı sayılarla)
  const pc=v=>'%'+Math.round(v*100);
  const B=x=>'<b>'+x+'</b>';
  const n=()=>'nöron '+(KN+1);
  function cellTxt(L,first,ctxNote){const k=KN,f=L.f[k],i=L.i[k],g=L.g[k],o=L.o[k],cp=L.cp[k],c=L.c[k],h=L.h[k];
    return 'Her nöron kendi sütununda çalışır, matris çarpımı yok. İzlediğimiz '+n()+':<br>'+
      '• '+B('c = f·c₋₁ + i·c̃')+' = '+f2(f)+'·'+f2(cp)+' + '+f2(i)+'·'+f2(g)+' = '+B(f2(c))+(first?' — ilk adım: c₋₁ = 0, unutulacak bir şey yok, yalnız yazılıyor.':' — eski hafızadan tutulan pay '+pc(f)+', aday bilgiden eklenen pay '+pc(i)+'.')+'<br>'+
      '• '+B('h = o·tanh(c)')+' = '+f2(o)+'·tanh('+f2(c)+') = '+B(f2(h))+' — dışarı söylenen pay '+pc(o)+'.<br>'+
      '24 nöronun hepsi aynı hesabı kendi f, i, c̃, o\'suyla yapar → 24 sayılık c ve 24 sayılık h.'+(ctxNote||'');}
  const SOZ={
    E1:()=>{const e=R.enc[0];return ['«'+NE(e.tok)+'» için one-hot: encoder sözlüğündeki 11 kutudan '+(e.tok+1)+'. kutu 1, gerisi 0. Bu bir '+B('adres')+': «embE\'nin '+NE(e.tok)+' satırını oku» demek. One-hot × tablo yapınca 1\'in denk geldiği satır aynen çıkar, gerisi 0 ile çarpılıp kaybolur — yani çarpma değil, '+B('satır okuma')+'. Pratikte one-hot hiç yazılmaz, kod doğrudan embE['+e.tok+'] okur.<br>One-hot anlam taşımaz (her sembol diğerlerine eşit uzaklıkta); anlamı tablonun eğitimle öğrenilmiş 8 sayısı taşır.',
      B('x')+' = 8 sayı ('+e.emb.slice(0,4).map(f2).join('; ')+'; …). Hücreye giren bu; one-hot hücreye girmez.'];},
    E2:()=>{const L=R.enc[0].L[0];return ['Hücreye iki şey girer: '+B('x')+' (gömmeden 8 sayı) ve '+B('hₜ₋₁')+' (bu katmanın bir önceki adımdaki çıktısı, 24 sayı — ilk adım olduğu için hepsi 0). Yan yana konur → '+B('32 sayı')+'.<br>We1 tablosunun '+B('96 satırının')+' her biri bu 32 sayıyla tek tek çarpılıp toplanır, üstüne bias eklenir → 1 puan. Bu 96 kez tekrarlanır → 96 puan (z). Sarı çizgi o an hangi satırdaysa onu hesaplıyor; alttaki satır o hesabın ilk terimleri.<br>Neden 96? 4 kapı (f, i, c̃, o) × 24 nöron: her nöronun her kapısı için ayrı bir satır.',
      B('z')+' = 96 ham puan (henüz kapı değil). '+n()+' için f puanı '+f2(L.z[KN])+', i '+f2(L.z[H+KN])+', c̃ '+f2(L.z[2*H+KN])+', o '+f2(L.z[3*H+KN])+'.'];},
    E3:()=>{const L=R.enc[0].L[0],k=KN;return ['96 puan 4 parçaya bölünür: '+B('1–24 → f')+' (unut), '+B('25–48 → i')+' (giriş), '+B('49–72 → c̃')+' (aday bilgi), '+B('73–96 → o')+' (çıkış). Her nöron her parçadan kendi sırasındaki puanı alır.<br>f, i, o '+B('σ')+'dan geçer → 0…1 arası «ne kadar» (bir vana gibi); c̃ '+B('tanh')+'tan geçer → −1…1 arası «yazılacak bilgi».<br>'+n()+': f = '+f2(L.f[k])+' → eski hafızadan tutulacak pay '+pc(L.f[k])+'; i = '+f2(L.i[k])+' → aday bilgiden yazılacak pay '+pc(L.i[k])+'; c̃ = '+f2(L.g[k])+' → yazılacak bilgi bu; o = '+f2(L.o[k])+' → dışarı söylenecek pay '+pc(L.o[k])+'.',
      '4 × 24 kapı değeri. Henüz hafıza değişmedi; bunlar «nasıl değişecek» talimatları.'];},
    E4:()=>{const L=R.enc[0].L[0];return [cellTxt(L,true),
      B('c¹')+' (24) ve '+B('h¹')+' (24). h yukarı çıkar → Katman 2\'nin x\'i; c ve h sağa → «+» adımının c₋₁ ve h₋₁\'i.'];},
    E5:()=>{const L=R.enc[0].L[1];return ['Katman 2 aynı dört işi (girdi → 96 puan → 4 kapı → c, h) kendi tablosu '+B('We2')+' ile yapar. Tek fark girdi: x artık gömme değil, '+B('Katman 1\'in h\'si (24 sayı)')+'; yanına Katman 2\'nin önceki h\'si (24, ilk adımda 0) gelir → 48 sayı. We2 bu yüzden 96×48.<br>'+cellTxt(L,true)+'<br>Encoder\'da Katman 2\'nin üstünde çıkış katmanı yok: tahmin yapmaz, yalnız okur.',
      B('c²')+' ve '+B('h²')+' (24\'er sayı) → sağa, sonraki adıma.'];},
    E6:()=>{const e1=R.enc[1].L[0],e2=R.enc[2];return ['«+» ve «'+NE(e2.tok)+'» için aynı yol tekrarlanır: one-hot → embE satırı → Katman 1 → Katman 2, '+B('aynı We1 ve We2 ile')+'. Değişen iki şey var: girdi token\'ı ve '+B('sağdan gelen hafıza')+' (c₋₁, h₋₁ artık 0 değil).<br>Örnek ('+n()+', t=2 Katman 1): c = '+f2(e1.f[KN])+'·'+f2(e1.cp[KN])+' + '+f2(e1.i[KN])+'·'+f2(e1.g[KN])+' = '+f2(e1.c[KN])+' — önceki adımdan gelen hafıza ('+f2(e1.cp[KN])+') f ile korunup yeni bilgiyle karışıyor. Soru böyle adım adım hafızaya yazılıyor.',
      't=3 sonunda iki katmanın c ve h\'si: sorunun tamamının özeti. '+n()+': h¹ = '+f2(e2.L[0].h[KN])+', h² = '+f2(e2.L[1].h[KN])+'.'];},
    E7:()=>['Encoder bitti. Elinde son adımdaki '+B('c¹, h¹, c², h²')+' var: 4 × 24 = '+B('96 sayı')+'. Bunlar decoder\'ın '+B('başlangıç hafızası')+' olur: Katman 1\'inki decoder Katman 1\'e, Katman 2\'ninki decoder Katman 2\'ye.<br>Decoder soruyu («'+S.a+'+'+S.b+'») hiç görmez; bildiği her şey bu 96 sayı. Bu yüzden «darboğaz» denir.',
      B('Bağlam')+' (96 sayı) = decoder\'ın t=1\'deki c₋₁ ve h₋₁\'i.'],
    D1:()=>{const d=R.dec[0];return ['Decoder bir başlangıç işaretiyle başlar: '+B('&lt;s&gt;')+' («cevaba başla»). Decoder sözlüğü 12 sembol (0-9, &lt;s&gt;, &lt;e&gt;) ve '+B('kendi gömme tablosu embD')+' var (12×8) — encoder\'ınkinden ayrı. Aynı «1» rakamının encoder\'daki ve decoder\'daki gömmesi farklıdır, çünkü iki taraf farklı iş yapıyor (biri okuyor, biri yazıyor).',
      B('x')+' = &lt;s&gt; satırı, 8 sayı ('+d.emb.slice(0,4).map(f2).join('; ')+'; …).'];},
    D2:()=>{const L=R.dec[0].L[0],L2=R.dec[0].L[1];return ['Encoder\'la '+B('aynı LSTM hesabı')+', ama ayrı tablolar: '+B('Wd1, Wd2')+'. Asıl fark hafızada: hₜ₋₁ ve cₜ₋₁ sıfır değil, '+B('bağlam')+' (encoder\'ın son hali). Yani decoder ilk adımda soruyu «bilerek» başlıyor.<br>'+cellTxt(L,false,'<br>Katman 2 de aynı şekilde Wd2 ile çalışır; çıkan h² = '+f2(L2.h[KN])+' ('+n()+'), sıradaki adımda tam bağlı katmana gidecek.'),
      B('h²')+' (24 sayı): «sıradaki sembol ne olmalı» tarifi.'];},
    D3:()=>{const d=R.dec[0];return ['Katman 2\'nin h\'si (24 sayı) '+B('Wo')+' tablosunun 12 satırıyla tek tek nokta çarpılır, + bias → '+B('12 puan')+', her decoder sembolü (0-9, &lt;s&gt;, &lt;e&gt;) için bir. Puan = «sıradaki sembol bu mu?» sorusunun cevabı. Wo yalnız decoder\'da var; encoder hiç tahmin yapmadığı için onda yok.',
      '12 puan. En yüksek: «'+ND(d.out).replace('<','&lt;').replace('>','&gt;')+'» = '+f2(d.lg[d.out])+'.'];},
    D4:()=>{const d=R.dec[0];return ['Puanlar olasılığa çevrilir: her puanın '+B('e üssü')+' alınır (hepsi pozitif olur), toplama bölünür → toplamı 1 olan 12 olasılık. Puanlar arasındaki fark büyükse en yüksek olan neredeyse her şeyi alır. Sonra '+B('en yüksek olasılık')+' seçilir (greedy).',
      'Seçilen sembol: «'+ND(d.out).replace('<','&lt;').replace('>','&gt;')+'» '+pc(d.p[d.out])+'.'];},
    D5:()=>{const a=R.dec.map(d=>ND(d.out).replace('<','&lt;').replace('>','&gt;'));return ['Seçilen «'+a[0]+'» bir sonraki adımın '+B('girdisi')+' olur: embD\'den onun satırı okunur, hafıza (c, h) sağdan gelir, aynı hesap (Katman 1 → Katman 2 → Wo → softmax) tekrarlanır → «'+a[1]+'». Sonra «'+a[1]+'» girdi olur → «'+a[2]+'». '+B('&lt;e&gt;')+' (bitti işareti) gelince üretim durur.<br>Ağırlıklar her adımda aynı (Wd1, Wd2, Wo); her adımda değişen yalnız girdi sembolü ve hafıza.',
      'Cevap: '+B(a[0]+a[1])+' ('+S.a+' + '+S.b+' = '+(S.a+S.b)+').'];}};
  let cur=0,tt=0,play=false,speed=1,last=0,raf=0,on=false;
  const TOT=()=>STOPS.reduce((s,x)=>s+x.dur,0);
  const host=document.getElementById('s2sTour'); if(!host) return;
  host.innerHTML=
   '<div class="st-bar"><button class="addbtn" id="st_prev">⏮ Önceki</button><button class="addbtn" id="st_play">▶ Oynat</button><button class="addbtn" id="st_next">Sonraki ⏭</button><button class="addbtn" id="st_rst">↺ Baştan</button>'+
   '<label style="font-size:12px;color:var(--muted)">Hız <select id="st_spd" class="rex-sel"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label></div>'+
   '<input type="range" id="st_rng" min="0" max="1000" value="0" style="width:100%">'+
   '<div id="st_chips" class="st-chips"></div>'+
   '<div id="st_ttl" class="st-ttl"></div><canvas id="st_cv" style="width:100%;display:block;background:#0e131c;border-radius:8px"></canvas>'+
   '<div id="st_live" class="st-live"></div><div id="st_soz" class="st-soz"></div><div id="st_elde" class="st-elde"></div>';
  cv=document.getElementById('st_cv');g=cv.getContext('2d');
  const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=W0*dpr;cv.height=H0*dpr;cv.style.aspectRatio=W0+'/'+H0;
  const $=id=>document.getElementById(id);
  $('st_chips').innerHTML=STOPS.map((s,i)=>'<button class="st-chip" data-i="'+i+'">'+(i+1)+' · '+s.ch.replace(/</g,'&lt;')+'</button>').join('');
  function stopStart(i){let s=0;for(let k=0;k<i;k++)s+=STOPS[k].dur;return s;}
  function setStop(i,keepT){cur=Math.max(0,Math.min(STOPS.length-1,i));if(!keepT)tt=0;
    [...$('st_chips').children].forEach((b,k)=>b.classList.toggle('on',k===cur));
    const s=STOPS[cur];$('st_ttl').textContent=(cur+1)+'/'+STOPS.length+' · '+s.t();const sz=SOZ[s.k]();$('st_soz').innerHTML='<b>🗣️ Sözel anlatım</b><br>'+sz[0];$('st_elde').innerHTML='<b>📦 Elde ettik:</b> '+sz[1];
    if(window.__s2sSync3d)window.__s2sSync3d();render();}
  function render(){if(!R)recompute();g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W0,H0);g.fillStyle='#0e131c';g.fillRect(0,0,W0,H0);
    const s=STOPS[cur],live=s.draw(Math.min(1,tt/s.dur));$('st_live').textContent=live||'';
    $('st_rng').value=Math.round((stopStart(cur)+tt)/TOT()*1000);}
  function loop(ts){if(!play){raf=0;return;}const dt=last?(ts-last)/1000:0;last=ts;tt+=dt*speed;
    if(tt>=STOPS[cur].dur){if(cur<STOPS.length-1){setStop(cur+1);}else{tt=STOPS[cur].dur;setPlay(false);}}
    render();raf=requestAnimationFrame(loop);}
  function setPlay(p){play=p;$('st_play').textContent=p?'⏸ Durdur':'▶ Oynat';last=0;if(p&&!raf)raf=requestAnimationFrame(loop);}
  $('st_play').onclick=()=>{if(!play&&cur===STOPS.length-1&&tt>=STOPS[cur].dur){setStop(0);}setPlay(!play);};
  $('st_prev').onclick=()=>setStop(tt>1?cur:cur-1);$('st_next').onclick=()=>setStop(cur+1);$('st_rst').onclick=()=>{setStop(0);};
  $('st_spd').onchange=e=>speed=+e.target.value;
  $('st_chips').onclick=e=>{const b=e.target.closest('.st-chip');if(b)setStop(+b.dataset.i);};
  $('st_rng').oninput=e=>{let T2=+e.target.value/1000*TOT(),i=0;while(i<STOPS.length-1&&T2>=STOPS[i].dur){T2-=STOPS[i].dur;i++;}const ch=i!==cur;cur=i;tt=T2;if(ch)setStop(i,true);else render();};
  window.__s2sTourState=()=>on?{step:STOPS[cur].f.step,ids:STOPS[cur].f.ids}:null;
  window.__s2sAnimSync=()=>{recompute();if(on){setStop(cur,true);}};
  window.__s2sTour={STOPS,go:(i,t)=>{setStop(i);if(t!=null){tt=t*STOPS[cur].dur;render();}},state:()=>({cur,tt,S,KN}),R:()=>R};
  window.__s2sTourOn=v=>{on=v;if(v){recompute();setStop(cur,true);}else{setPlay(false);if(window.__s2sSync3d)window.__s2sSync3d();}};
})();
