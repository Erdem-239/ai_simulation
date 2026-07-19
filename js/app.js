/* ---- RNN hücre içi (computational graph) + formül oluşturucu ---- */
(function(){
  const svg=document.getElementById('cellSvg'); if(!svg) return;
  const fbox=document.getElementById('cellFormula');
  const info=document.getElementById('cellInfo');
  let timer=null;

  function op(id,x,y,sym){ return '<circle class="op" id="'+id+'" data-k="'+id+'" cx="'+x+'" cy="'+y+'" r="17"/><text class="op-lbl" x="'+x+'" y="'+(y+5)+'" text-anchor="middle">'+sym+'</text>'; }
  function ar(x1,y1,x2,y2){ return '<line class="rnn-edge" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" marker-end="url(#car)"/>'; }
  function wl(x,y,t,anc){ return '<text class="w-lbl" x="'+x+'" y="'+y+'" text-anchor="'+(anc||'middle')+'">'+t+'</text>'; }
  function sup(b,sp){ return b+'<tspan dy="-6" font-size="9">'+sp+'</tspan>'; }

  let s='<defs><marker id="car" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#8a9097"/></marker></defs>';
  s+='<rect x="115" y="85" width="560" height="290" rx="18" fill="rgba(90,160,224,0.12)" stroke="#3a6a9a" stroke-width="1.5"/>';
  // ana akış okları
  s+=ar(82,240,160,240);     // a<t-1> -> ×aa
  s+=ar(200,240,362,240);    // ×aa -> +a
  s+=ar(327,388,327,307);    // x<t> -> ×ax
  s+=ar(342,276,366,254);    // ×ax -> +a
  s+=ar(402,240,424,240);    // +a -> g1
  s+=ar(462,240,700,240);    // g1 -> a<t>
  s+=ar(580,240,580,182);    // dal yukarı -> ×ya
  s+=ar(562,162,404,162);    // ×ya -> +y
  s+=ar(384,144,384,132);    // +y -> g2
  s+=ar(384,94,384,80);      // g2 -> y<t>
  // ağırlık / bias BESLEME okları (her biri kendi oku)
  s+=ar(180,168,180,222);    // Waa -> ×aa (yukarıdan)
  s+=ar(256,287,309,287);    // Wax -> ×ax (soldan)
  s+=ar(640,162,600,162);    // Wya -> ×ya (sağdan)
  s+=ar(424,260,400,246);    // ba  -> +a  (alt-sağdan)
  s+=ar(320,162,366,162);    // by  -> +y  (soldan)
  // etiketler (okların ucunda, ferah)
  s+=wl(180,154,'Whh');
  s+=wl(246,291,'Wxh','end');
  s+=wl(438,272,'bh','start');
  s+=wl(662,166,'Why','start');
  s+=wl(303,166,'by','end');
  // işlem düğümleri
  s+=op('mul_aa',180,240,'×');
  s+=op('mul_ax',327,287,'×');
  s+=op('add_a',382,240,'+');
  s+=op('g1',444,240,'tanh');
  s+=op('mul_ya',580,162,'×');
  s+=op('add_y',384,162,'+');
  s+=op('g2',384,112,'g₂');
  // giriş / çıkış
  s+='<rect class="op io-a" id="io-a0" data-k="io-a0" x="22" y="224" width="58" height="32" rx="7"/><text class="io-lbl" x="51" y="245" text-anchor="middle">'+'h₋₁'+'</text>';
  s+='<rect class="op io-a" id="io-at" data-k="io-at" x="702" y="224" width="60" height="32" rx="7"/><text class="io-lbl" x="732" y="245" text-anchor="middle">'+'h'+'</text>';
  s+='<rect class="op io-x" id="io-x" data-k="io-x" x="300" y="388" width="54" height="30" rx="7"/><text class="io-lbl" x="327" y="408" text-anchor="middle">'+'x'+'</text>';
  s+='<rect class="op io-y" id="io-y" data-k="io-yt" x="357" y="48" width="54" height="30" rx="7"/><text class="io-lbl" x="384" y="68" text-anchor="middle">'+'ŷ'+'</text>';
  svg.setAttribute('viewBox','0 0 770 430');
  svg.innerHTML=s;

  const cinfo={
    'io-a0':'<b>h₋₁</b> — önceki gizli durum (geçmiş hafıza). Soldan gelir.',
    'io-x':'<b>x</b> — bu adımın girdisi. Alttan gelir.',
    'mul_aa':'<b>× çarpma:</b> W<sub>hh</sub> · h₋₁ — geçmiş hafızayı ağırlıkla çarp.',
    'mul_ax':'<b>× çarpma:</b> W<sub>xh</sub> · x — girdiyi ağırlıkla çarp.',
    'add_a':'<b>+ toplama:</b> W<sub>hh</sub>·h₋₁ + W<sub>xh</sub>·x + b<sub>h</sub>.',
    'g1':'<b>tanh aktivasyon</b> (genelde tanh): h = tanh(toplam) → yeni hafıza.',
    'io-at':'<b>h</b> — yeni gizli durum. Sağa (sonraki adım) ve yukarı (çıktı) gider.',
    'mul_ya':'<b>× çarpma:</b> W<sub>hy</sub> · h.',
    'add_y':'<b>+ toplama:</b> W<sub>hy</sub>·h + b<sub>y</sub>.',
    'g2':'<b>g₂ aktivasyon</b> (softmax/sigmoid): ŷ = g₂(toplam).',
    'io-yt':'<b>ŷ</b> — bu adımın çıktısı (tahmin).'
  };
  svg.querySelectorAll('[data-k]').forEach(el=>{
    el.addEventListener('click',()=>{ reset(); info.innerHTML=cinfo[el.dataset.k]||''; el.classList.add('cell-hl'); });
  });

  const AT='h', AT1='h₋₁', XT='x', YT='ŷ';
  const line1=AT+' = tanh( W<sub>hh</sub>·'+AT1+' + W<sub>xh</sub>·'+XT+' + b<sub>h</sub> )';
  const line2=YT+' = g₂( W<sub>hy</sub>·'+AT+' + b<sub>y</sub> )';
  const P=AT+' = tanh(', Q='<br>'+YT+' = g₂(';
  const cellSteps=[
    {hl:['io-a0','mul_aa'], f:P+' <b>W<sub>hh</sub>·'+AT1+'</b>', i:'<b>×</b> çarp: W<sub>hh</sub>·h₋₁ (önceki hafıza × ağırlık).'},
    {hl:['io-x','mul_ax'],  f:P+' W<sub>hh</sub>·'+AT1+' + <b>W<sub>xh</sub>·'+XT+'</b>', i:'<b>×</b> çarp: W<sub>xh</sub>·x (girdi × ağırlık).'},
    {hl:['add_a'],          f:P+' W<sub>hh</sub>·'+AT1+' + W<sub>xh</sub>·'+XT+' + <b>b<sub>h</sub></b>', i:'<b>+</b> topla: iki çarpım + b<sub>h</sub>.'},
    {hl:['g1'],             f:P+' W<sub>hh</sub>·'+AT1+' + W<sub>xh</sub>·'+XT+' + b<sub>h</sub> <b>)</b>', i:'<b>tanh</b> aktivasyon (genelde tanh) uygulanır.'},
    {hl:['io-at'],          f:line1+' &nbsp;<b style="color:#3fb6b6">✓ h hazır</b>', i:'<b>h</b> = yeni gizli durum. Sağa (sonraki adım) ve yukarı (çıktı) gider.'},
    {hl:['mul_ya'],         f:line1+Q+' <b>W<sub>hy</sub>·'+AT+'</b>', i:'<b>×</b> çarp: W<sub>hy</sub>·h.'},
    {hl:['add_y'],          f:line1+Q+' W<sub>hy</sub>·'+AT+' + <b>b<sub>y</sub></b>', i:'<b>+</b> topla: + b<sub>y</sub>.'},
    {hl:['g2'],             f:line1+Q+' W<sub>hy</sub>·'+AT+' + b<sub>y</sub> <b>)</b>', i:'<b>g₂</b> aktivasyon (softmax/sigmoid) uygulanır.'},
    {hl:['io-y'],           f:line1+'<br>'+line2+' &nbsp;<b style="color:#e06a6a">✓ ŷ hazır</b>', i:'<b>ŷ</b> = çıktı (tahmin). Formül tamam! ✅'}
  ];
  // --- GERİ YAYILIM (BPTT) gradyan satırları ---
  const gl=[
    'dz<sub>y</sub> = ∂L/∂ŷ · g₂′',
    '∂L/∂b<sub>y</sub> = dz<sub>y</sub>',
    '∂L/∂W<sub>hy</sub> = dz<sub>y</sub> · h',
    '∂L/∂h = dz<sub>y</sub>·W<sub>hy</sub> + (gelecek adımdan)',
    'dz<sub>a</sub> = ∂L/∂h · tanh′',
    '∂L/∂b<sub>h</sub> = dz<sub>a</sub>',
    '∂L/∂W<sub>hh</sub> = dz<sub>a</sub>·h₋₁ &nbsp;→&nbsp; ∂L/∂h₋₁ = dz<sub>a</sub>·W<sub>hh</sub> <i>(önceki zamana akar)</i>',
    '∂L/∂W<sub>xh</sub> = dz<sub>a</sub>·x'
  ];
  function bf(n){ return gl.slice(0,n).map((t,i)=> i===n-1?'<b style="color:#f0a032">'+t+'</b>':t).join('<br>'); }
  const cellBackSteps=[
    {hl:['io-y','g2'], f:bf(1), i:'<b>g₂ geri:</b> aktivasyon türeviyle çarp → dz<sub>y</sub>.'},
    {hl:['add_y'],     f:bf(2), i:'<b>+ geri:</b> gradyan kopyalanır → ∂L/∂b<sub>y</sub> = dz<sub>y</sub>.'},
    {hl:['mul_ya'],    f:bf(3), i:'<b>× geri:</b> diğer çarpanla çarp → ∂L/∂W<sub>hy</sub> = dz<sub>y</sub>·h.'},
    {hl:['io-at'],     f:bf(4), i:'<b>hye İKİ koldan gradyan gelir:</b> çıktıdan + gelecek adımdan → toplanır (BPTT’nin kalbi).'},
    {hl:['g1'],        f:bf(5), i:'<b>tanh geri:</b> dz<sub>a</sub> = ∂L/∂h · tanh′.'},
    {hl:['add_a'],     f:bf(6), i:'<b>+ geri:</b> kopyala → ∂L/∂b<sub>h</sub> = dz<sub>a</sub>.'},
    {hl:['mul_aa'],    f:bf(7), i:'<b>× geri:</b> ∂L/∂W<sub>hh</sub> = dz<sub>a</sub>·h₋₁; ayrıca ∂L/∂h₋₁ ÖNCEKİ zamana akar (BPTT).'},
    {hl:['mul_ax'],    f:bf(8), i:'<b>× geri:</b> ∂L/∂W<sub>xh</sub> = dz<sub>a</sub>·x.'},
    {hl:['io-a0'],     f:gl.join('<br>')+'<br><b style="color:#46c46a">✓ Tüm gradyanlar hazır → Σ<sub>t</sub> topla → W := W − α·∂L/∂W</b>', i:'✓ Bitti! Ağırlık gradyanları zaman boyunca toplanıp güncellenir. (W<sub>hh</sub>·tanh′ tekrar çarpıldığı için vanishing/exploding olur.)'}
  ];

  let cstep=0, mode=null;
  function clr(){ if(timer){clearInterval(timer);timer=null;} svg.querySelectorAll('.cell-hl,.cell-hl-b').forEach(e=>e.classList.remove('cell-hl','cell-hl-b')); }
  function reset(){ clr(); cstep=0; mode=null; fbox.innerHTML='<b style="color:#ffd24a">İleri ▶</b> ile h, ŷ kurulur; <b style="color:#f0a032">◀ BPTT</b> ile gradyanlar geriye akar.'; info.innerHTML='Bir düğüme tıkla → ne yaptığı burada görünür.'; }
  function apply(st,cls){ st.hl.forEach(id=>{ const el=document.getElementById(id); if(el) el.classList.add(cls); }); fbox.innerHTML=st.f; info.innerHTML=st.i; }
  function ensure(m){ if(mode!==m){ clr(); cstep=0; mode=m; } }
  function fStep(){ ensure('fwd'); if(cstep>=cellSteps.length) return false; apply(cellSteps[cstep],'cell-hl'); cstep++; return true; }
  function bStep(){ ensure('bwd'); if(cstep>=cellBackSteps.length) return false; apply(cellBackSteps[cstep],'cell-hl-b'); cstep++; return true; }
  function auto(fn){ clr(); cstep=0; mode=null; timer=setInterval(()=>{ if(!fn()){ clearInterval(timer); timer=null; } }, 800); }

  document.getElementById('cellStep').addEventListener('click', ()=>{ if(timer){clearInterval(timer);timer=null;} if(mode==='fwd'&&cstep>=cellSteps.length){ reset(); } else { fStep(); } });
  document.getElementById('cellBack').addEventListener('click', ()=>{ if(timer){clearInterval(timer);timer=null;} if(mode==='bwd'&&cstep>=cellBackSteps.length){ reset(); } else { bStep(); } });
  document.getElementById('cellAuto').addEventListener('click', ()=>auto(fStep));
  document.getElementById('cellBackAuto').addEventListener('click', ()=>auto(bStep));
  document.getElementById('cellRst').addEventListener('click', reset);
})();

/* ---- interaktif tek-hücre RNN geri yayılım oynatıcısı ---- */
(function(){
  const $=id=>document.getElementById(id);
  if(!$('rc_fwd')) return;
  const F=(v,d=4)=>(isFinite(v)?v:0).toFixed(d);
  const sliders=['Wxh','Whh','b','Why','by','alpha'];
  const nums=['x','hp','y'];

  function read(){
    const g=id=>parseFloat($('rc_'+id).value);
    return { x:g('x'), hp:g('hp'), y:g('y'),
             Wxh:g('Wxh'), Whh:g('Whh'), b:g('b'), Why:g('Why'), by:g('by'), alpha:g('alpha') };
  }

  /* Genel: eğri + o anki noktada teğet çizen mini-grafik (tüm Geri Adım kartları bunu kullanır) */
  function plotCurveWithTangent(cv, o){
    if(!cv) return;
    const ctx=cv.getContext('2d');
    const W=cv.width, H=cv.height;
    const gx0=32, gx1=W-10, gy0=12, gy1=H-22;
    const lo=o.lo, hi=o.hi, Ymin=o.Ymin, Ymax=o.Ymax;
    const X=v=>gx0+(gx1-gx0)*(v-lo)/(hi-lo);
    const Y=v=>gy1-(gy1-gy0)*(v-Ymin)/(Ymax-Ymin);

    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#2a2c30'; ctx.lineWidth=1;
    for(let i=0;i<=4;i++){ const v=lo+(hi-lo)*i/4; ctx.beginPath(); ctx.moveTo(X(v),gy0); ctx.lineTo(X(v),gy1); ctx.stroke(); }
    ctx.strokeStyle='#5a6068'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(gx0,Y(Math.max(Ymin,0))); ctx.lineTo(gx1,Y(Math.max(Ymin,0))); ctx.stroke();

    // eğri
    ctx.strokeStyle='#3a7afe'; ctx.lineWidth=2.4;
    ctx.beginPath();
    for(let i=0;i<=100;i++){ const v=lo+(hi-lo)*i/100; const yy=o.curveFn(v); const px=X(v), py=Y(yy); i?ctx.lineTo(px,py):ctx.moveTo(px,py); }
    ctx.stroke();

    // opsiyonel işaret çizgisi (örn. hedef y)
    if(o.markX!=null){
      ctx.strokeStyle='#46c46a'; ctx.setLineDash([3,3]); ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(X(o.markX),gy0); ctx.lineTo(X(o.markX),gy1); ctx.stroke(); ctx.setLineDash([]);
      if(o.markLabel){ ctx.fillStyle='#46c46a'; ctx.font='10px Segoe UI'; ctx.fillText(o.markLabel, X(o.markX)-3, gy0+10); }
    }

    // teğet: eğim = o.slope, (curV, curY) noktasından geçer
    const va=o.curV-(hi-lo)*0.22, vb=o.curV+(hi-lo)*0.22;
    const La=o.curY+o.slope*(va-o.curV), Lb=o.curY+o.slope*(vb-o.curV);
    ctx.strokeStyle='#ffd24a'; ctx.lineWidth=1.6; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(X(va),Y(Math.max(Ymin,Math.min(Ymax,La)))); ctx.lineTo(X(vb),Y(Math.max(Ymin,Math.min(Ymax,Lb)))); ctx.stroke(); ctx.setLineDash([]);

    // nokta
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(X(o.curV),Y(o.curY),5,0,7); ctx.fill();
    ctx.strokeStyle='#3a7afe'; ctx.lineWidth=2; ctx.stroke();

    ctx.font='10.5px Segoe UI';
    if(o.xLabel){ ctx.fillStyle='#9aa0a6'; ctx.fillText(o.xLabel, gx1-o.xLabel.length*6-4, gy1-4); }
    if(o.yLabel){ ctx.fillStyle=o.yLabelColor||'#3a7afe'; ctx.fillText(o.yLabel, gx0+2, gy0+10); }
  }

  /* Geri Adım 1 — L(ŷ) eğrisi + teğet (eğim = ∂L/∂ŷ) */
  function drawStep1(y, yhat, L, slope){
    let lo=Math.min(y,yhat)-1.5, hi=Math.max(y,yhat)+1.5;
    if(hi-lo<3){ const mid=(hi+lo)/2; lo=mid-1.5; hi=mid+1.5; }
    const Ymax=Math.max(0.5*(lo-y)*(lo-y), 0.5*(hi-y)*(hi-y), 0.05)*1.15;
    plotCurveWithTangent($('rcStep1Canvas'), {
      lo, hi, curveFn:v=>0.5*(v-y)*(v-y), curV:yhat, curY:L, slope,
      Ymin:0, Ymax, markX:y, markLabel:'y', xLabel:'ŷ →', yLabel:'L(ŷ)'
    });
  }

  /* Geri Adım 2 — L(W_hy) eğrisi + teğet (eğim = ∂L/∂W_hy); h, b_y, y sabit tutulur */
  function drawStep2(p, h, dWhy){
    const cur=p.Why, lo=cur-1.5, hi=cur+1.5;
    const Lof=v=>{ const yh=v*h+p.by; return 0.5*(yh-p.y)*(yh-p.y); };
    const curY=Lof(cur);
    let Ymax=0.05; for(let i=0;i<=20;i++){ Ymax=Math.max(Ymax, Lof(lo+(hi-lo)*i/20)); }
    plotCurveWithTangent($('rcStep2Canvas'), {
      lo, hi, curveFn:Lof, curV:cur, curY, slope:dWhy,
      Ymin:0, Ymax:Ymax*1.15, xLabel:'W_hy →', yLabel:'L(W_hy)'
    });
  }

  /* Geri Adım 3 — h = tanh(z) eğrisi + teğet (eğim = 1−h²) */
  function drawStep3(z, h, slope){
    plotCurveWithTangent($('rcStep3Canvas'), {
      lo:-4, hi:4, curveFn:v=>Math.tanh(v), curV:z, curY:h, slope,
      Ymin:-1.15, Ymax:1.15, xLabel:'z →', yLabel:'h=tanh(z)', yLabelColor:'#46c46a'
    });
  }

  /* Geri Adım 4 — L(W_xh) eğrisi + teğet (eğim = ∂L/∂W_xh); x, h₋₁, diğer ağırlıklar sabit, tanh'tan geçtiği için tam ileri yayılım tekrar hesaplanır */
  function drawStep4(p, dWxh){
    const cur=p.Wxh, lo=cur-1.5, hi=cur+1.5;
    const Lof=v=>{ const zz=v*p.x+p.Whh*p.hp+p.b; const hh=Math.tanh(zz); const yh=p.Why*hh+p.by; return 0.5*(yh-p.y)*(yh-p.y); };
    const curY=Lof(cur);
    let Ymax=0.05; for(let i=0;i<=20;i++){ Ymax=Math.max(Ymax, Lof(lo+(hi-lo)*i/20)); }
    plotCurveWithTangent($('rcStep4Canvas'), {
      lo, hi, curveFn:Lof, curV:cur, curY, slope:dWxh,
      Ymin:0, Ymax:Ymax*1.15, xLabel:'W_xh →', yLabel:'L(W_xh)'
    });
  }

  /* Geri Adım 5 — zaman boyunca geriye giden katkılar (T-3..T), r=Whh(1-h²) ile üstel küçülüp/büyüyor */
  function drawStep5(r, gT){
    const cv=$('rcStep5Canvas'); if(!cv) return;
    const ctx=cv.getContext('2d');
    const W=cv.width, H=cv.height;
    const gx0=32, gx1=W-10, gy0=12, gy1=H-24;
    const vals=[3,2,1,0].map(k=>gT*Math.pow(r,k));
    const labels=['T-3','T-2','T-1','T'];
    const maxAbs=Math.max(...vals.map(Math.abs), 1e-6)*1.2;
    const Y=v=>gy0+(gy1-gy0)*(maxAbs-v)/(2*maxAbs);
    ctx.clearRect(0,0,W,H);
    const zeroY=Y(0);
    ctx.strokeStyle='#5a6068'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(gx0,zeroY); ctx.lineTo(gx1,zeroY); ctx.stroke();
    const bw=(gx1-gx0)/vals.length;
    vals.forEach((v,i)=>{
      const x=gx0+i*bw+bw*0.22, w=bw*0.56;
      const y1=Y(v), top=Math.min(zeroY,y1), h=Math.max(1,Math.abs(y1-zeroY));
      ctx.fillStyle = i===vals.length-1 ? '#f0a032' : 'rgba(58,122,254,'+(0.4+0.18*i)+')';
      ctx.fillRect(x, top, w, h);
      ctx.fillStyle='#9aa0a6'; ctx.font='10px Segoe UI'; ctx.textAlign='center';
      ctx.fillText(labels[i], x+w/2, gy1+13);
    });
    ctx.textAlign='left';
  }
  /* ---- Kayıp Vadisi: gradyan pusulası (radar) — gerçek |∂L/∂W| büyüklükleri ---- */
  const radarCv=$('gradRadarCanvas');
  function drawGradRadar(items){
    if(!radarCv) return;
    const ctx=radarCv.getContext('2d');
    const W=radarCv.width, H=radarCv.height;
    const cx=W/2, cy=H/2+4, R=Math.min(W,H)/2-38, n=items.length;
    const maxMag=Math.max(...items.map(g=>Math.abs(g.val)), 0.02);
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#2a2c30'; ctx.lineWidth=1;
    [0.25,0.5,0.75,1].forEach(f=>{
      ctx.beginPath();
      for(let i=0;i<=n;i++){ const a=-Math.PI/2+i*(2*Math.PI/n); const x=cx+Math.cos(a)*R*f, y=cy+Math.sin(a)*R*f; i?ctx.lineTo(x,y):ctx.moveTo(x,y); }
      ctx.stroke();
    });
    ctx.strokeStyle='#3a3d42'; ctx.fillStyle='#9aa0a6'; ctx.font='12px Segoe UI'; ctx.textAlign='center';
    items.forEach((g,i)=>{
      const a=-Math.PI/2+i*(2*Math.PI/n);
      const x=cx+Math.cos(a)*R, y=cy+Math.sin(a)*R;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y); ctx.stroke();
      const lx=cx+Math.cos(a)*(R+18), ly=cy+Math.sin(a)*(R+18);
      ctx.fillText(g.label, lx, ly+4);
    });
    ctx.beginPath();
    items.forEach((g,i)=>{ const a=-Math.PI/2+i*(2*Math.PI/n); const r=(Math.abs(g.val)/maxMag)*R; const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r; i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
    ctx.closePath();
    ctx.fillStyle='rgba(240,160,50,0.28)'; ctx.fill();
    ctx.strokeStyle='#f0a032'; ctx.lineWidth=2; ctx.stroke();
    items.forEach((g,i)=>{ const a=-Math.PI/2+i*(2*Math.PI/n); const r=(Math.abs(g.val)/maxMag)*R; const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x,y,3.5,0,7); ctx.fill(); });
  }

  /* ---- Kayıp Vadisi: gerçek 3B yüzey L(W_xh,W_hy) — three.js ---- */
  let loss3D=null;
  (function initLoss3D(){
    const el=document.getElementById('lossSurface3D');
    if(!el || typeof THREE==='undefined') return;
    const W=el.clientWidth||320, H=el.clientHeight||280;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(42, W/H, 0.1, 100);
    camera.position.set(3.1, 2.5, 3.1);
    camera.lookAt(0, 0.4, 0);
    const renderer=new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    el.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff,0.6));
    const dl=new THREE.DirectionalLight(0xffffff,0.75); dl.position.set(3,5,2); scene.add(dl);
    const SEG=22;
    const geo=new THREE.PlaneGeometry(4,4,SEG,SEG);
    geo.rotateX(-Math.PI/2);
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count*3),3));
    const mat=new THREE.MeshPhongMaterial({vertexColors:true, side:THREE.DoubleSide, shininess:18});
    const mesh=new THREE.Mesh(geo, mat);
    scene.add(mesh);
    const marker=new THREE.Mesh(new THREE.SphereGeometry(0.1,16,16), new THREE.MeshBasicMaterial({color:0xffffff}));
    scene.add(marker);
    loss3D={scene, camera, renderer, geo, marker, el};
    (function animate(){
      requestAnimationFrame(animate);
      if(!loss3D) return;
      loss3D.scene.rotation.y += 0.0025;
      loss3D.renderer.render(loss3D.scene, loss3D.camera);
    })();
  })();
  function updateLoss3D(p){
    if(!loss3D) return;
    const {geo, marker}=loss3D;
    const pos=geo.attributes.position, col=geo.attributes.color;
    const n=pos.count;
    const raw=new Float32Array(n);
    let Lmax=0.02;
    for(let i=0;i<n;i++){
      const wx=pos.getX(i), wy=pos.getZ(i);
      const zPre=wx*p.x + p.Whh*p.hp + p.b;
      const hh=Math.tanh(zPre);
      const yh=wy*hh + p.by;
      const Lv=0.5*(yh-p.y)*(yh-p.y);
      raw[i]=Lv; if(Lv>Lmax) Lmax=Lv;
    }
    const scale=1.8/Lmax;
    for(let i=0;i<n;i++){
      const t=raw[i]/Lmax;
      pos.setY(i, raw[i]*scale);
      const r=(0x3a+(0xf0-0x3a)*t)/255, g=(0x7a+(0xa0-0x7a)*t)/255, b=(0xfe+(0x32-0xfe)*t)/255;
      col.setXYZ(i, r, g, b);
    }
    pos.needsUpdate=true; col.needsUpdate=true;
    geo.computeVertexNormals();
    const curZPre=p.Wxh*p.x + p.Whh*p.hp + p.b;
    const curH=Math.tanh(curZPre);
    const curYhat=p.Why*curH + p.by;
    const curL=0.5*(curYhat-p.y)*(curYhat-p.y);
    marker.position.set(p.Wxh, curL*scale, p.Why);
  }

  function render(){
    const p=read();
    sliders.forEach(s=>{ const v=$('rc_'+s+'_v'); if(v) v.textContent=F(parseFloat($('rc_'+s).value),2); });
    // ileri yayılım
    const z=p.Wxh*p.x + p.Whh*p.hp + p.b;
    const h=Math.tanh(z);
    const yhat=p.Why*h + p.by;
    const L=0.5*(yhat-p.y)*(yhat-p.y);
    // geri yayılım
    const dyhat=yhat-p.y;
    const dWhy=dyhat*h, dby=dyhat;
    const dh=dyhat*p.Why;
    const dz=dh*(1-h*h);
    const dWxh=dz*p.x, dWhh=dz*p.hp, db=dz;

    const EQ=(f,sub,val)=>'<div class="rc-eq">'+f+(sub?' = <span class="sb">'+sub+'</span>':'')+' = <span class="rv">'+val+'</span></div>';

    $('rc_fwd').innerHTML =
      EQ('z<sub>h</sub> = W<sub>xh</sub>·x + W<sub>hh</sub>·h₋₁ + b<sub>h</sub>', '('+F(p.Wxh,2)+')('+F(p.x,2)+') + ('+F(p.Whh,2)+')('+F(p.hp,2)+') + '+F(p.b,2), F(z))
      + EQ('h = tanh(z<sub>h</sub>)', 'tanh('+F(z)+')', F(h))
      + EQ('ŷ = W<sub>hy</sub>·h + b<sub>y</sub>', '('+F(p.Why,2)+')('+F(h)+') + '+F(p.by,2), F(yhat))
      + EQ('L = ½(ŷ − y)²', '½('+F(yhat)+' − '+F(p.y,2)+')²', F(L));

    const setTxt=(id,v)=>{ const el=$(id); if(el) el.textContent=v; };
    setTxt('rcS1sub', '('+F(yhat)+' − '+F(p.y,2)+')');
    setTxt('rcS1val', F(dyhat));
    setTxt('rcS2sub1', '('+F(dyhat)+')('+F(h)+')');
    setTxt('rcS2val1', F(dWhy));
    setTxt('rcS2val2', F(dby));
    setTxt('rcS3sub1', '('+F(dyhat)+')('+F(p.Why,2)+')');
    setTxt('rcS3val1', F(dh));
    setTxt('rcS3sub2', '('+F(dh)+')(1 − '+F(h*h)+')');
    setTxt('rcS3val2', F(dz));
    setTxt('rcS4sub1', '('+F(dz)+')('+F(p.x,2)+')');
    setTxt('rcS4val1', F(dWxh));
    setTxt('rcS4sub2', '('+F(dz)+')('+F(p.hp,2)+')');
    setTxt('rcS4val2', F(dWhh));
    setTxt('rcS4val3', F(db));

    const rDecay=p.Whh*(1-h*h);
    const sum5=dWhh*(1+rDecay+rDecay*rDecay+rDecay*rDecay*rDecay);
    setTxt('rcS5r', F(rDecay));
    setTxt('rcS5gT', F(dWhh));
    setTxt('rcS5sum', F(sum5));

    /* ---- ileri seviye: gerçek 3 zaman adımlı BPTT (unrolling) ---- */
    if($('ruFwd')){
      const rx1=parseFloat($('ru_x1').value), rx2=parseFloat($('ru_x2').value), rx3=parseFloat($('ru_x3').value), ry=parseFloat($('ru_y').value);
      const rh0=0;
      const rz1=p.Wxh*rx1 + p.Whh*rh0 + p.b; const rh1=Math.tanh(rz1);
      const rz2=p.Wxh*rx2 + p.Whh*rh1 + p.b; const rh2=Math.tanh(rz2);
      const rz3=p.Wxh*rx3 + p.Whh*rh2 + p.b; const rh3=Math.tanh(rz3);
      const ryhat=p.Why*rh3 + p.by;
      const rL=0.5*(ryhat-ry)*(ryhat-ry);

      setTxt('ruZ1sub', '('+F(p.Wxh,2)+')('+F(rx1,2)+') + ('+F(p.Whh,2)+')('+F(rh0,2)+') + '+F(p.b,2)); setTxt('ruZ1val', F(rz1));
      setTxt('ruF1sub', 'tanh('+F(rz1)+')'); setTxt('ruF1val', F(rh1));
      setTxt('ruZ2sub', '('+F(p.Wxh,2)+')('+F(rx2,2)+') + ('+F(p.Whh,2)+')('+F(rh1)+') + '+F(p.b,2)); setTxt('ruZ2val', F(rz2));
      setTxt('ruF2sub', 'tanh('+F(rz2)+')'); setTxt('ruF2val', F(rh2));
      setTxt('ruZ3sub', '('+F(p.Wxh,2)+')('+F(rx3,2)+') + ('+F(p.Whh,2)+')('+F(rh2)+') + '+F(p.b,2)); setTxt('ruZ3val', F(rz3));
      setTxt('ruF3sub', 'tanh('+F(rz3)+')'); setTxt('ruF3val', F(rh3));
      setTxt('ruZysub', '('+F(p.Why,2)+')('+F(rh3)+') + '+F(p.by,2)); setTxt('ruZyval', F(ryhat));
      setTxt('ruFyval', F(ryhat));
      setTxt('ruFLsub', '½('+F(ryhat)+' − '+F(ry,2)+')²'); setTxt('ruFLval', F(rL));

      const rdyhat=ryhat-ry;
      const rdh3=rdyhat*p.Why, rdz3=rdh3*(1-rh3*rh3);
      const rdh2=rdz3*p.Whh,   rdz2=rdh2*(1-rh2*rh2);
      const rdh1=rdz2*p.Whh,   rdz1=rdh1*(1-rh1*rh1);

      const dWxh3=rdz3*rx3, dWhh3=rdz3*rh2, db3=rdz3;
      const dWxh2=rdz2*rx2, dWhh2=rdz2*rh1, db2=rdz2;
      const dWxh1=rdz1*rx1, dWhh1=rdz1*rh0, db1=rdz1;

      setTxt('ruB3sub', '[('+F(rdyhat)+')('+F(p.Why,2)+')](1 − '+F(rh3*rh3)+')'); setTxt('ruB3val', F(rdz3));
      setTxt('ruB3xsub', '('+F(rdz3)+')('+F(rx3,2)+')'); setTxt('ruB3xval', F(dWxh3));
      setTxt('ruB3hsub', '('+F(rdz3)+')('+F(rh2)+')'); setTxt('ruB3hval', F(dWhh3));
      setTxt('ruB2sub', '('+F(rdz3)+')('+F(p.Whh,2)+')(1 − '+F(rh2*rh2)+')'); setTxt('ruB2val', F(rdz2));
      setTxt('ruB2xsub', '('+F(rdz2)+')('+F(rx2,2)+')'); setTxt('ruB2xval', F(dWxh2));
      setTxt('ruB2hsub', '('+F(rdz2)+')('+F(rh1)+')'); setTxt('ruB2hval', F(dWhh2));
      setTxt('ruB1sub', '('+F(rdz2)+')('+F(p.Whh,2)+')(1 − '+F(rh1*rh1)+')'); setTxt('ruB1val', F(rdz1));
      setTxt('ruB1xsub', '('+F(rdz1)+')('+F(rx1,2)+')'); setTxt('ruB1xval', F(dWxh1));
      setTxt('ruB1hsub', '('+F(rdz1)+')('+F(rh0,2)+')'); setTxt('ruB1hval', F(dWhh1));

      const totWxh=dWxh1+dWxh2+dWxh3, totWhh=dWhh1+dWhh2+dWhh3, totBh=db1+db2+db3;
      $('ruTotal').innerHTML = '✅ <b>Gerçek toplam</b> (3 adımın gerçek katkılarının toplamı — yaklaşık değil):<br>'
        + '∂L/∂W<sub>xh</sub> = '+F(dWxh1)+' + '+F(dWxh2)+' + '+F(dWxh3)+' = <b style="color:var(--accent)">'+F(totWxh)+'</b><br>'
        + '∂L/∂W<sub>hh</sub> = '+F(dWhh1)+' + '+F(dWhh2)+' + '+F(dWhh3)+' = <b style="color:var(--accent)">'+F(totWhh)+'</b><br>'
        + '∂L/∂b<sub>h</sub> = '+F(db1)+' + '+F(db2)+' + '+F(db3)+' = <b style="color:var(--accent)">'+F(totBh)+'</b>';

      const r32=rdz3!==0 ? rdz2/rdz3 : 0;
      const r21=rdz2!==0 ? rdz1/rdz2 : 0;
      setTxt('ruR32', F(r32));
      setTxt('ruR21', F(r21));
    }

    drawStep1(p.y, yhat, L, dyhat);
    drawStep2(p, h, dWhy);
    drawStep3(z, h, dz);
    drawStep4(p, dWxh);
    drawStep5(rDecay, dWhh);
    drawGradRadar([
      {label:'Wxh', val:dWxh}, {label:'Whh', val:dWhh}, {label:'bh', val:db},
      {label:'Why', val:dWhy}, {label:'by', val:dby}
    ]);
    updateLoss3D(p);

    const u=(w,g)=>F(w - p.alpha*g);
    $('rc_upd').innerHTML =
      EQ('W<sub>xh</sub> := W<sub>xh</sub> − α·∂L/∂W<sub>xh</sub>', F(p.Wxh,2)+' − ('+F(p.alpha,2)+')('+F(dWxh)+')', u(p.Wxh,dWxh))
      + EQ('W<sub>hh</sub> := W<sub>hh</sub> − α·∂L/∂W<sub>hh</sub>', F(p.Whh,2)+' − ('+F(p.alpha,2)+')('+F(dWhh)+')', u(p.Whh,dWhh))
      + EQ('b<sub>h</sub> := b<sub>h</sub> − α·∂L/∂b<sub>h</sub>', F(p.b,2)+' − ('+F(p.alpha,2)+')('+F(db)+')', u(p.b,db))
      + EQ('W<sub>hy</sub> := W<sub>hy</sub> − α·∂L/∂W<sub>hy</sub>', F(p.Why,2)+' − ('+F(p.alpha,2)+')('+F(dWhy)+')', u(p.Why,dWhy))
      + EQ('b<sub>y</sub> := b<sub>y</sub> − α·∂L/∂b<sub>y</sub>', F(p.by,2)+' − ('+F(p.alpha,2)+')('+F(dby)+')', u(p.by,dby));

    return {L, dWxh, dWhh, db, dWhy, dby};
  }

  /* ---- eğitim döngüsü: geri yayılımla kendini düzeltip minimuma insin (lineer regresyondaki gibi) ---- */
  const rcCostCv=$('rc_costCanvas');
  let rcIter=0, rcCostHist=[], rcTimer=null;
  const DEFAULTS={Wxh:0.4, Whh:0.3, b:0.1, Why:0.8, by:0.2};

  function drawRcCost(){
    if(!rcCostCv) return;
    const ctx=rcCostCv.getContext('2d');
    const W=rcCostCv.width, H=rcCostCv.height, PAD=30;
    ctx.clearRect(0,0,W,H);
    const n=rcCostHist.length;
    const xmax=Math.max(10,n-1), ymax=Math.max(...rcCostHist,0.0001)*1.15;
    ctx.strokeStyle='#2a2c30'; ctx.lineWidth=1; ctx.fillStyle='#8a9097'; ctx.font='10px Segoe UI';
    for(let j=0;j<=4;j++){ const py=(H-18)-(H-18-8)*(j/4); ctx.globalAlpha=.3; ctx.beginPath(); ctx.moveTo(PAD,py); ctx.lineTo(W-8,py); ctx.stroke(); ctx.globalAlpha=1;
      ctx.fillText(F(ymax*j/4,2), 2, py+3); }
    ctx.fillStyle='#6f757c'; ctx.fillText('iterasyon →', W-62, H-4);
    if(n<2) return;
    const X=v=>PAD+(W-PAD-8)*(v/xmax), Y=v=>(H-18)-(H-18-8)*(v/ymax);
    ctx.strokeStyle='#46c46a'; ctx.lineWidth=2; ctx.beginPath();
    rcCostHist.forEach((c,i)=>{ const px=X(i),py=Y(c); i?ctx.lineTo(px,py):ctx.moveTo(px,py); }); ctx.stroke();
    ctx.fillStyle='#46c46a'; ctx.beginPath(); ctx.arc(X(n-1),Y(rcCostHist[n-1]),3.5,0,7); ctx.fill();
  }
  function rcUpdateUI(L){
    const ie=$('rc_iter'); if(ie) ie.textContent=rcIter;
    const ce=$('rc_curcost'); if(ce) ce.textContent=F(L,4);
    drawRcCost();
  }
  function rcTrainStep(){
    const {L, dWxh, dWhh, db, dWhy, dby}=render();
    const alpha=parseFloat($('rc_alpha').value);
    const set=(id,val)=>{ const el=$(id); if(el) el.value=Math.max(-2,Math.min(2, val)).toFixed(4); };
    set('rc_Wxh', parseFloat($('rc_Wxh').value)-alpha*dWxh);
    set('rc_Whh', parseFloat($('rc_Whh').value)-alpha*dWhh);
    set('rc_b',   parseFloat($('rc_b').value)-alpha*db);
    set('rc_Why', parseFloat($('rc_Why').value)-alpha*dWhy);
    set('rc_by',  parseFloat($('rc_by').value)-alpha*dby);
    rcIter++; rcCostHist.push(L); if(rcCostHist.length>300) rcCostHist.shift();
    const {L:newL}=render();
    rcUpdateUI(newL);
  }
  function rcTrainStop(){ if(rcTimer){clearInterval(rcTimer);rcTimer=null;} const fb=$('rc_fast'); if(fb) fb.classList.remove('on'); }
  // kaydırıcıyı elle oynatınca: eğitimi durdur, sayacı sıfırla, ama ağırlıkları OLDUĞU GİBİ bırak (yeni başlangıç noktası)
  function rcSyncManual(){
    rcTrainStop(); rcIter=0;
    const {L}=render();
    rcCostHist=[L];
    rcUpdateUI(L);
  }
  // ↺ düğmesi: ağırlıkları varsayılana döndür, sayacı sıfırla
  function rcTrainReset(){
    rcTrainStop(); rcIter=0; rcCostHist=[];
    Object.keys(DEFAULTS).forEach(k=>{ const el=$('rc_'+k); if(el) el.value=DEFAULTS[k]; });
    const {L}=render();
    rcCostHist.push(L);
    rcUpdateUI(L);
  }
  sliders.map(s=>'rc_'+s).concat(nums.map(n=>'rc_'+n)).forEach(id=>{
    const el=$(id); if(el) el.addEventListener('input', rcSyncManual);
  });
  ['ru_x1','ru_x2','ru_x3','ru_y'].forEach(id=>{
    const el=$(id); if(el) el.addEventListener('input', render);
  });
  const rcPlayBtn=$('rc_play'), rcFastBtn=$('rc_fast'), rcStopBtn=$('rc_stop'), rcResetBtn=$('rc_reset');
  if(rcPlayBtn) rcPlayBtn.addEventListener('click', ()=>{ rcTrainStop(); rcTrainStep(); });
  if(rcFastBtn) rcFastBtn.addEventListener('click', ()=>{
    if(rcTimer){ rcTrainStop(); return; }
    rcFastBtn.classList.add('on');
    rcTimer=setInterval(rcTrainStep, 110);
  });
  if(rcStopBtn) rcStopBtn.addEventListener('click', rcTrainStop);
  if(rcResetBtn) rcResetBtn.addEventListener('click', rcTrainReset);

  { const {L}=render(); rcCostHist.push(L); rcUpdateUI(L); }
})();

/* ---- RNN'nin farklı kullanım şekilleri: tip seçici (many-to-one = gerçek canlı hücre, diğerleri = önizleme) ---- */
(function(){
  const btns=document.querySelectorAll('.rnn-type-btn');
  if(!btns.length) return;
  const realBlock=document.getElementById('rnnFwdCols');
  const preview=document.getElementById('rnnTypePreview');
  const gAdimSection=document.getElementById('gAdimSection');
  const gAdimPreview=document.getElementById('gAdimPreview');
  const gAdimPreviewType=document.getElementById('gAdimPreviewType');
  const typeNames={o2o:'one-to-one', o2m:'one-to-many', m2mEq:'many-to-many (T_x=T_y)', m2mNeq:'many-to-many (T_x≠T_y)'};
  btns.forEach(b=>{
    b.addEventListener('click', ()=>{
      btns.forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      if(b.dataset.rt==='m2o'){
        if(realBlock) realBlock.style.display='';
        if(preview) preview.style.display='none';
        if(gAdimSection) gAdimSection.style.display='';
        if(gAdimPreview) gAdimPreview.style.display='none';
      } else {
        if(realBlock) realBlock.style.display='none';
        if(preview){
          preview.style.display='block';
          preview.querySelectorAll('.rnn-type-panel').forEach(x=>x.classList.remove('active'));
          const panel=preview.querySelector('.rnn-type-panel[data-rp="'+b.dataset.rt+'"]');
          if(panel) panel.classList.add('active');
        }
        if(gAdimSection) gAdimSection.style.display='none';
        if(gAdimPreview) gAdimPreview.style.display='block';
        if(gAdimPreviewType) gAdimPreviewType.textContent=typeNames[b.dataset.rt]||b.dataset.rt;
      }
    });
  });
})();


/* ---- aktivasyon fonksiyonları explorer ---- */
(function(){
  const cv=document.getElementById('actCanvas'); if(!cv) return;
  const ctx=cv.getContext('2d');
  const zEl=document.getElementById('actZ');
  const F=(v,d=4)=>(isFinite(v)?v:0).toFixed(d);

  const fns={
    sigmoid:{
      name:'Sigmoid  σ(z)', color:'#3a7afe',
      f:z=>1/(1+Math.exp(-z)),
      df:z=>{const s=1/(1+Math.exp(-z)); return s*(1-s);},
      info:`<b>σ(z) = 1 / (1 + e<sup>−z</sup>)</b> &nbsp;·&nbsp; Türev: <b>σ′ = σ(1−σ)</b><br>
            Aralık (0, 1) — olasılık gibi okunur. Türevi <b>en fazla 0.25</b> (z=0'da). Derin bir ağda bu 0.25'ler üst üste çarpılınca gradyan hızla söner → <b>vanishing gradient</b>. Ayrıca çıktısı 0-merkezli değil (hep pozitif). Bugün çoğunlukla yalnızca <b>çıkış katmanında</b> (ikili olasılık) kullanılır.`,
      work:z=>{const s=1/(1+Math.exp(-z)); return 'σ(z)  = 1 / (1 + e^(−z))\n      = 1 / (1 + e^('+F(-z,2)+'))\n      = 1 / (1 + '+F(Math.exp(-z))+')\n      = '+F(s)+'\n\nσ′(z) = σ(z) · (1 − σ(z))\n      = '+F(s)+' · (1 − '+F(s)+')\n      = '+F(s*(1-s));}
    },
    tanh:{
      name:'Tanh', color:'#46c46a',
      f:z=>Math.tanh(z),
      df:z=>1-Math.tanh(z)*Math.tanh(z),
      info:`<b>tanh(z) = (e<sup>z</sup>−e<sup>−z</sup>) / (e<sup>z</sup>+e<sup>−z</sup>)</b> &nbsp;·&nbsp; Türev: <b>1 − tanh²(z)</b><br>
            Aralık (−1, 1) ve <b>0-merkezli</b> (sigmoid'e göre avantaj). Türevi <b>en fazla 1</b> (z=0'da). RNN'de gizli durumun standart aktivasyonu — ama uçlarda (|z| büyük) türev yine 0'a yaklaşır, o yüzden uzun dizilerde vanishing devam eder. BPTT'deki <b>(1 − h²)</b> tam olarak budur.`,
      work:z=>{const t=Math.tanh(z); return 'tanh(z)  = (e^z − e^(−z)) / (e^z + e^(−z))\n         = tanh('+F(z,2)+')\n         = '+F(t)+'\n\ntanh′(z) = 1 − tanh²(z)\n         = 1 − ('+F(t)+')²\n         = 1 − '+F(t*t)+'\n         = '+F(1-t*t);}
    },
    relu:{
      name:'ReLU', color:'#f0a032',
      f:z=>Math.max(0,z),
      df:z=>z>0?1:0,
      info:`<b>ReLU(z) = max(0, z)</b> &nbsp;·&nbsp; Türev: <b>z &gt; 0 ise 1, değilse 0</b><br>
            Basit ve hesaplaması ucuz. Pozitif bölgede türev <b>tam 1</b> → gradyan sönmez; derin ağların favorisi. Riski: bir nöronun girdisi hep negatif kalırsa türev sürekli 0 olur ve nöron <b>"ölür"</b> (artık öğrenmez). Bunu Leaky ReLU hafifletir.`,
      work:z=>{const r=Math.max(0,z); return 'ReLU(z)  = max(0, z)\n         = max(0, '+F(z,2)+')\n         = '+F(r)+'\n\nReLU′(z) = (z > 0) ? 1 : 0\n         = ('+F(z,2)+' > 0) ? 1 : 0\n         = '+(z>0?'1':'0');}
    },
    leaky:{
      name:'Leaky ReLU', color:'#e06a6a',
      f:z=>z>0?z:0.01*z,
      df:z=>z>0?1:0.01,
      info:`<b>Leaky ReLU(z) = (z &gt; 0) ? z : 0.01·z</b> &nbsp;·&nbsp; Türev: <b>(z &gt; 0) ? 1 : 0.01</b><br>
            ReLU'nun "ölü nöron" sorununu çözmek için negatif tarafa <b>küçük bir eğim</b> (0.01) verir. Böylece z &lt; 0'da bile minik de olsa gradyan akmaya devam eder, nöron tamamen susmaz.`,
      work:z=>{const r=z>0?z:0.01*z; return 'Leaky(z)  = (z>0) ? z : 0.01·z\n          = '+(z>0?F(z,2):('0.01·('+F(z,2)+')'))+'\n          = '+F(r)+'\n\nLeaky′(z) = (z>0) ? 1 : 0.01\n          = '+(z>0?'1':'0.01');}
    }
  };
  let cur='sigmoid';

  const W=cv.width, H=cv.height;
  const gx0=36, gx1=W-12, gy0=12, gy1=H-22;
  const ZMIN=-6, ZMAX=6, YMIN=-1.4, YMAX=3.2;
  const X=z=>gx0+(gx1-gx0)*(z-ZMIN)/(ZMAX-ZMIN);
  const Y=v=>gy1-(gy1-gy0)*(v-YMIN)/(YMAX-YMIN);

  function curve(fn,which){
    ctx.beginPath();
    for(let i=0;i<=300;i++){ const z=ZMIN+(ZMAX-ZMIN)*i/300; const v=which==='f'?fn.f(z):fn.df(z); const px=X(z), py=Y(v); i?ctx.lineTo(px,py):ctx.moveTo(px,py); }
    ctx.stroke();
  }
  function draw(){
    const fn=fns[cur];
    ctx.clearRect(0,0,W,H);
    // ızgara
    ctx.strokeStyle='#2a2c30'; ctx.lineWidth=1;
    for(let z=ZMIN; z<=ZMAX; z++){ ctx.beginPath(); ctx.moveTo(X(z),gy0); ctx.lineTo(X(z),gy1); ctx.stroke(); }
    for(let v=Math.ceil(YMIN); v<=YMAX; v++){ ctx.beginPath(); ctx.moveTo(gx0,Y(v)); ctx.lineTo(gx1,Y(v)); ctx.stroke(); }
    // eksenler
    ctx.strokeStyle='#5a6068'; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(gx0,Y(0)); ctx.lineTo(gx1,Y(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(0),gy0); ctx.lineTo(X(0),gy1); ctx.stroke();
    // türev (kesik)
    ctx.setLineDash([5,4]); ctx.strokeStyle='#9aa0a6'; ctx.lineWidth=1.6; curve(fn,'df'); ctx.setLineDash([]);
    // fonksiyon (düz)
    ctx.strokeStyle=fn.color; ctx.lineWidth=2.6; curve(fn,'f');
    // tanjant
    const z0=parseFloat(zEl.value), v0=fn.f(z0), sl=fn.df(z0);
    ctx.strokeStyle='#ffd24a'; ctx.lineWidth=1.6; ctx.setLineDash([3,3]);
    ctx.beginPath(); const za=z0-1.7, zb=z0+1.7;
    ctx.moveTo(X(za),Y(v0+sl*(za-z0))); ctx.lineTo(X(zb),Y(v0+sl*(zb-z0))); ctx.stroke(); ctx.setLineDash([]);
    // nokta
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(X(z0),Y(v0),5,0,7); ctx.fill();
    ctx.strokeStyle=fn.color; ctx.lineWidth=2; ctx.stroke();
    // efsane
    ctx.font='11px Segoe UI';
    ctx.fillStyle=fn.color; ctx.fillText('g(z)', gx1-92, gy0+12);
    ctx.fillStyle='#9aa0a6'; ctx.fillText('g′(z) türev', gx1-92, gy0+28);
    ctx.fillStyle='#ffd24a'; ctx.fillText('tanjant: eğim = g′(z0) = '+F(sl,3), gx0+6, gy1-8);
  }
  function update(){
    const fn=fns[cur];
    document.getElementById('actZv').textContent=F(parseFloat(zEl.value),1);
    document.getElementById('actName').textContent=fn.name;
    document.getElementById('actInfo').innerHTML=fn.info;
    document.getElementById('actWork').innerHTML=fn.work(parseFloat(zEl.value));
    draw();
  }
  document.querySelectorAll('.act-sel').forEach(b=>{
    b.addEventListener('click',()=>{
      cur=b.dataset.fn;
      document.querySelectorAll('.act-sel').forEach(x=>{ x.style.background='var(--panel)'; x.style.color='var(--text)'; x.style.border='1px solid var(--line)'; });
      b.style.background='var(--blue)'; b.style.color='#fff'; b.style.border='none';
      update();
    });
  });
  zEl.addEventListener('input',update);
  update();
})();

/* ---- zincir kuralı: sigmoid pipeline ---- */
(function(){
  const zEl=document.getElementById('chainZ'); if(!zEl) return;
  const F=(v,d=4)=>(isFinite(v)?v:0).toFixed(d);
  function render(){
    const z=parseFloat(zEl.value);
    const u=Math.exp(-z), s=1+u, sig=1/s;
    const du=-u, ds=1, dsg=-1/(s*s);
    const chain=dsg*ds*du, check=sig*(1-sig);
    document.getElementById('chainZv').textContent=F(z,1);
    document.getElementById('chainWork').innerHTML=
      'z = '+F(z,2)+'\n'+
      '  │\n'+
      '  │  durak 1:  u = e^(−z)        ⇒  u = e^(−'+F(z,2)+') = <b>'+F(u)+'</b>\n'+
      '  │            kur  du/dz = −e^(−z) = <b>'+F(du)+'</b>   (negatif: z↑ ⇒ u↓)\n'+
      '  ▼\n'+
      '  │  durak 2:  s = 1 + u         ⇒  s = 1 + '+F(u)+' = <b>'+F(s)+'</b>\n'+
      '  │            kur  ds/du = <b>1</b>\n'+
      '  ▼\n'+
      '  │  durak 3:  σ = 1 / s         ⇒  σ = 1 / '+F(s)+' = <b>'+F(sig)+'</b>\n'+
      '  │            kur  dσ/ds = −1/s² = <b>'+F(dsg)+'</b>\n'+
      '  ▼\n'+
      'σ = <b style="color:#3a7afe">'+F(sig)+'</b>';
    document.getElementById('chainCheck').innerHTML=
      '<b>Zincir kuralı = kurları çarp (sondan başa):</b>\n'+
      'dσ/dz = (dσ/ds) · (ds/du) · (du/dz)\n'+
      '      = ('+F(dsg)+') · (1) · ('+F(du)+')\n'+
      '      = <b style="color:var(--accent)">'+F(chain)+'</b>\n\n'+
      '<b>Kontrol</b> — kısa formül σ(1−σ): '+F(sig)+' · (1 − '+F(sig)+') = <b style="color:var(--accent)">'+F(check)+'</b>   ✓ birebir aynı!\n'+
      'Yukarıdaki grafikte z='+F(z,2)+' noktasındaki sarı tanjantın eğimi de tam bu sayıdır.';
  }
  zEl.addEventListener('input',render);
  render();
})();
/* ---- sol panelden model seçimi ---- */
(function(){
  document.querySelectorAll('.navbtn').forEach(b=>{
    b.addEventListener('click', ()=>{
      document.querySelectorAll('.navbtn').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.model').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const el=document.getElementById('model-'+b.dataset.model);
      if(el) el.classList.add('active');
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });
})();

/* ---- Stanford-tarzı bölüm alt-navigasyonu + scroll-spy ---- */
(function(){
  const sb=document.querySelector('.sidebar'); if(!sb) return;
  const nav=document.createElement('div'); nav.className='subnav';
  let heads=[], links=[];
  let lastModel=null, subnavOpen=true;
  function build(){
    const model=document.querySelector('.model.active'); if(!model) return;
    let hs=[...model.querySelectorAll('.sechead')];
    if(!hs.length) hs=[...model.querySelectorAll('.pts > h3')];
    heads=hs; links=[]; nav.innerHTML='';
    hs.forEach((h,i)=>{
      if(!h.id) h.id='sh-'+model.id+'-'+i;
      const a=document.createElement('a');
      a.textContent=h.textContent.replace(/\s+/g,' ').trim();
      a.addEventListener('click',()=>{ h.scrollIntoView({behavior:'smooth', block:'start'}); });
      nav.appendChild(a); links.push(a);
    });
    const btn=sb.querySelector('.navbtn.active');
    if(btn) btn.insertAdjacentElement('afterend', nav);
    nav.classList.toggle('show', hs.length>0 && subnavOpen);
    spy();
  }
  function spy(){
    if(!heads.length) return;
    const y=140;
    let cur=0;
    heads.forEach((h,i)=>{ if(h.getBoundingClientRect().top<=y) cur=i; });
    links.forEach((a,i)=>a.classList.toggle('cur', i===cur));
  }
  let lastSpy=0;
  window.addEventListener('scroll',()=>{ const n=Date.now(); if(n-lastSpy>80){ lastSpy=n; spy(); } });
  document.querySelectorAll('.navbtn').forEach(b=>b.addEventListener('click',()=>{
    const m=b.dataset.model;
    if(m===lastModel){ subnavOpen=!subnavOpen; } else { subnavOpen=true; lastModel=m; }
    setTimeout(build,40);
  }));
  build();
})();

/* ---- 3b1b-tarzı: türev = eğimin izi (animasyonlu) ---- */
(function(){
  const cv=document.getElementById('dTrace'); if(!cv) return;
  const ctx=cv.getContext('2d');
  const playB=document.getElementById('dPlay');
  const scrub=document.getElementById('dScrub');
  const read=document.getElementById('dRead');
  const Fm=(v,d=2)=>(isFinite(v)?v:0).toFixed(d);
  const funcs={
    par:{f:x=>x*x/4, df:x=>x/2, lbl:'f(x) = x²/4', dlbl:"f'(x) = x/2", yT:[-0.4,4.3], yB:[-2.3,2.3]},
    sig:{f:x=>1/(1+Math.exp(-x)), df:x=>{const s=1/(1+Math.exp(-x)); return s*(1-s);}, lbl:'σ(x)', dlbl:"σ'(x) = σ(1−σ)", yT:[-0.12,1.15], yB:[-0.04,0.3]},
    tanh:{f:x=>Math.tanh(x), df:x=>1-Math.tanh(x)*Math.tanh(x), lbl:'tanh(x)', dlbl:"tanh'(x) = 1−tanh²", yT:[-1.25,1.25], yB:[-0.12,1.15]}
  };
  let cur='par', X=-4, playing=true, last=null;
  const W=cv.width, H=cv.height, PL=46, PR=14;
  const T={y0:16,y1:238}, B={y0:272,y1:454};
  const XMIN=-4, XMAX=4;
  const px=x=>PL+(W-PL-PR)*(x-XMIN)/(XMAX-XMIN);
  const yPix=(v,yr,a)=>a.y1-(a.y1-a.y0)*(v-yr[0])/(yr[1]-yr[0]);

  function panel(a,yr){
    ctx.fillStyle='#131418'; ctx.fillRect(PL,a.y0,W-PL-PR,a.y1-a.y0);
    ctx.strokeStyle='#26282c'; ctx.lineWidth=1;
    for(let gx=XMIN; gx<=XMAX; gx++){ ctx.beginPath(); ctx.moveTo(px(gx),a.y0); ctx.lineTo(px(gx),a.y1); ctx.stroke(); }
    if(yr[0]<0 && yr[1]>0){ ctx.strokeStyle='#4a4f56'; ctx.beginPath(); ctx.moveTo(PL,yPix(0,yr,a)); ctx.lineTo(W-PR,yPix(0,yr,a)); ctx.stroke(); }
    ctx.strokeStyle='#3a3d42'; ctx.strokeRect(PL,a.y0,W-PL-PR,a.y1-a.y0);
  }
  function path(g,yr,a,col,w,xa,xb){
    if(xb<=xa) return;
    ctx.strokeStyle=col; ctx.lineWidth=w; ctx.beginPath();
    const N=220;
    for(let i=0;i<=N;i++){ const x=xa+(xb-xa)*i/N; const Y=yPix(g(x),yr,a); i?ctx.lineTo(px(x),Y):ctx.moveTo(px(x),Y); }
    ctx.stroke();
  }
  function dot(x,y,col,r){ ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x,y,r||4.5,0,7); ctx.fill(); }

  function draw(){
    const fn=funcs[cur];
    ctx.clearRect(0,0,W,H);
    panel(T,fn.yT); panel(B,fn.yB);
    // f: soluk tam eğri + üstüne katedilen kısım parlak
    path(fn.f,fn.yT,T,'rgba(58,122,254,0.35)',2,XMIN,XMAX);
    path(fn.f,fn.yT,T,'#3a7afe',2.6,XMIN,X);
    // türev: sadece katedilen kısım (iz)
    path(fn.df,fn.yB,B,'#46c46a',2.6,XMIN,X);
    const y0=fn.f(X), m=fn.df(X);
    // panolar arası bağlantı
    ctx.setLineDash([3,4]); ctx.strokeStyle='#5a6068'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(px(X),yPix(y0,fn.yT,T)); ctx.lineTo(px(X),yPix(m,fn.yB,B)); ctx.stroke();
    ctx.setLineDash([]);
    // tanjant
    const dx=0.9;
    ctx.strokeStyle='#ffd24a'; ctx.lineWidth=2.4;
    ctx.beginPath();
    ctx.moveTo(px(X-dx),yPix(y0-m*dx,fn.yT,T));
    ctx.lineTo(px(X+dx),yPix(y0+m*dx,fn.yT,T));
    ctx.stroke();
    // noktalar
    dot(px(X),yPix(y0,fn.yT,T),'#fff',5); ctx.strokeStyle='#3a7afe'; ctx.lineWidth=2; ctx.stroke();
    dot(px(X),yPix(m,fn.yB,B),'#46c46a',5);
    // etiketler
    ctx.font='12px Segoe UI';
    ctx.fillStyle='#3a7afe'; ctx.fillText(fn.lbl, PL+8, T.y0+16);
    ctx.fillStyle='#46c46a'; ctx.fillText(fn.dlbl+'   ← eğimin izi', PL+8, B.y0+16);
    ctx.fillStyle='#ffd24a'; ctx.fillText('tanjant eğimi = '+Fm(m,3), W-PR-150, T.y0+16);
    read.innerHTML='x = <b>'+Fm(X)+'</b> &nbsp;&nbsp; f(x) = <b style="color:#3a7afe">'+Fm(y0,3)+'</b> &nbsp;&nbsp; eğim f′(x) = <b style="color:#46c46a">'+Fm(m,3)+'</b>';
  }
  function frame(t){
    if(last===null) last=t;
    const dt=(t-last)/1000; last=t;
    if(playing){
      X+=Math.min(dt,0.1)*1.5; if(X>XMAX) X=XMIN;
      scrub.value=X; draw();
    }
    requestAnimationFrame(frame);
  }
  playB.addEventListener('click',()=>{
    playing=!playing;
    playB.textContent=playing?'⏸ Durdur':'▶ Oynat';
  });
  scrub.addEventListener('input',()=>{
    playing=false; playB.textContent='▶ Oynat';
    X=parseFloat(scrub.value); draw();
  });
  document.querySelectorAll('.dfn-sel').forEach(b=>{
    b.addEventListener('click',()=>{
      cur=b.dataset.f; X=XMIN; scrub.value=X;
      document.querySelectorAll('.dfn-sel').forEach(x=>{ x.style.background='var(--panel)'; x.style.color='var(--text)'; x.style.border='1px solid var(--line)'; });
      b.style.background='var(--blue)'; b.style.color='#fff'; b.style.border='none';
      draw();
    });
  });
  draw();
  requestAnimationFrame(frame);
})();

/* ---- Khan-tarzı alıştırma: ipucu → çözüm + ilerleme ---- */
(function(){
  const m=document.getElementById('model-matematik'); if(!m) return;
  m.querySelectorAll('.acc').forEach(acc=>{
    const hint=acc.querySelector('.hint-body'), sol=acc.querySelector('.sol-body');
    if(!sol) return;
    const hb=acc.querySelector('.hintbtn'), sb=acc.querySelector('.solbtn');
    if(hb) hb.addEventListener('click',()=>{ hint.style.display = hint.style.display==='none' ? 'block' : 'none'; });
    if(sb) sb.addEventListener('click',()=>{
      sol.style.display='block'; sb.style.opacity='0.5';
      if(!acc.dataset.solved){
        acc.dataset.solved='1';
        const box=acc.closest('.pts'); if(!box) return;
        const chip=box.querySelector('.mprog'); if(!chip) return;
        const n=box.querySelectorAll('.acc[data-solved]').length;
        chip.textContent=n+'/'+chip.dataset.total+' çözüldü';
        if(n>=+chip.dataset.total){ chip.style.background='var(--green)'; chip.style.color='#0b2a12'; chip.style.borderColor='var(--green)'; chip.textContent='✓ '+chip.textContent; }
      }
    });
  });
})();

/* ---- Yol Haritası: tech tree (v3: Civ6 yatay + çağlar + Civilopedia) ---- */
(function(){
  const svg=document.getElementById('techSvg'); if(!svg) return;
  const info=document.getElementById('techInfo');
  const prog=document.getElementById('techProg');

  const NODES=[
    {id:'mat',  nm:'📚 Matematik Temeli', tier:0, v:50, pre:[], tab:'matematik',
      d:'e sayısı, türev, zincir/bölüm kuralı, kısmi türeve giriş. Her şeyin dişli yatağı — bütün çarklar buradan güç alır.',
      sci:'Kalkülüs: Newton & Leibniz (1670\'ler, birbirinden bağımsız). e sayısı: Jacob Bernoulli bileşik faiz limitinde buldu (1683); adını, notasyonunu ve teorisini Euler verdi (1727).',
      real:[['💰','Bileşik faiz & finans matematiği'],['🦠','Salgın/nüfus modelleri (üstel yayılım, R₀)'],['☢️','Radyoaktif tarihleme (karbon-14)'],['🚀','Fizik & mühendisliğin tamamı (değişim = türev)']],
      sub:['e sayısı ve üstel kurallar','Türev: tanım + kuvvet kuralı','Zincir kuralı','Bölüm kuralı → σ(1−σ)','Kısmi türev & gradyan']},
    {id:'vek',  nm:'🧮 Vektör & Nokta Çarpım', tier:2, v:50, pre:['mat'], tab:'vektor',
      d:'Yön + büyüklük = vektör. Nokta çarpım = iki vektörün ne kadar aynı yöne baktığı — attention skorlarının tek satırlık sırrı.',
      sci:'Hamilton kuaterniyonları köprüde yürürken buldu ve formülü taşa kazıdı (1843). Grassmann vektör uzayını yazdı, kimse okumadı. Bugünkü sade "nokta çarpım" dili Gibbs\'in Yale ders notlarından (1880\'ler).',
      real:[['🧭','GPS & navigasyon (konum=vektör)'],['🎮','Oyun grafikleri: aydınlanma = nokta çarpım'],['🔍','Benzerlik araması: öneri, yüz tanıma'],['🎯','Attention skorları: QKᵀ']],
      sub:['Vektör: ok + sayı listesi','Nokta çarpım: cebir & geometri','Cosine benzerliği','Matris = vektör rafı → QKᵀ','Kendini test (4 soru)']},
    {id:'lin',  nm:'📈 Lineer Regresyon', tier:1, v:26, pre:['mat'], tab:'linreg',
      d:'Gradyan alçalma + maliyet + türevle öğrenme. "Öğrenmek = yokuş aşağı yürümek" fikrinin en yalın hali.',
      sci:'En küçük kareler: Legendre (1805) & Gauss (1809). Gauss, kaybolan Ceres asteroidinin yörüngesini bu yöntemle hesaplayıp gökbilimcilere yeniden buldurdu — yöntemin ilk büyük zaferi.',
      real:[['📊','İstatistik & ekonometri (tahmin)'],['🌡️','Trend analizi: iklim, satış, fiyat'],['🧭','Tüm ML\'in atası: model+maliyet+optimizasyon kalıbı']],
      sub:['Hipotez h(x)=Θ₀+Θ₁x','Maliyet fonksiyonu E','Kısmi türev ispatları (zincir + limit)','Güncelleme kuralı + α','Canlı simülasyonla oynadım','Kendini test (5 soru)']},
    {id:'akt',  nm:'📊 Aktivasyon Fonksiyonları', tier:1, v:74, pre:['mat'], tab:'aktivasyon',
      d:'Sigmoid/tanh/ReLU eğrileri ve türevleri. Geri yayılımda her çarktan geçen "kur" (yerel türev) burada belirlenir.',
      sci:'Sigmoid (lojistik eğri): Verhulst, nüfus büyümesi için (1838). tanh: hiperbolik fonksiyonlar, Lambert (1768). ReLU\'nun derin ağlardaki zaferi: Glorot & Bengio (2011).',
      real:[['🧠','Yapay nöronun "ateşleme" modeli'],['⚕️','Lojistik regresyon: tıpta risk tahmini'],['🛡️','Olasılık çıktısı: spam/dolandırıcılık tespiti']],
      sub:['Euler (e) hikâyesi → sigmoid','Sigmoid & türevi σ(1−σ)','tanh & türevi 1−tanh²','ReLU / Leaky + ölü nöron','Zincir kuralı canlı (dişli)','Kendini test (4 soru)']},
    {id:'rnn',  nm:'🔁 RNN + BPTT', tier:2, v:26, pre:['lin','akt'], tab:'rnn',
      d:'Dizi + hafıza (gizli durum). Zincir kuralı zamana yayılır; gradyan geçmişe doğru akar.',
      sci:'Backprop: Rumelhart, Hinton & Williams (1986). Basit RNN: Elman (1990). "Ağa hafıza takma" fikrinin ilk çalışan hali.',
      real:[['🎙️','İlk konuşma tanıma sistemleri'],['✍️','El yazısı tanıma (posta/çek okuma)'],['🎵','Dizi üretimi: müzik, metin (erken dönem)']],
      sub:['Gizli durum hₜ (hafıza)','İleri yayılım + kayıp','BPTT domino (tek hücre)','Ağırlık paylaşımı → Σₜ','Kendini test (5 soru)']},
    {id:'emb',  nm:'🔤 Kelime Temsili (Embedding)', tier:3, v:88, pre:['vek'], tab:'embedding',
      d:'Kelime → vektör. Word2vec/GloVe: anlamın sayılara gömülmesi. Attention bu vektörlerin üzerinde çalışır.',
      sci:'Word2vec: Mikolov ve ekibi, Google (2013). "kral − erkek + kadın ≈ kraliçe" ile dünyayı şaşırttı: anlam, vektör aritmetiğine dönüştü.',
      real:[['🔍','Arama motorlarında anlamsal eşleme'],['🎬','Öneri sistemleri (film/ürün benzerliği)'],['🌐','Çok dilli anlam haritaları']],
      sub:['One-hot vs yoğun vektör','Word2vec fikri','Benzerlik (cosine)']},
    {id:'van',  nm:'📉 Vanishing / Exploding', tier:3, v:26, pre:['rnn'], tab:'rnn',
      d:'Whh·(1−h²) çarpanı zaman boyunca üst üste binince gradyan ya söner ya patlar. RNN çağının duvarı.',
      sci:'Teşhis: Sepp Hochreiter\'ın yüksek lisans tezi (1991, Almanca!) ve Bengio (1994). Derin öğrenmenin 20 yıl gecikmesinin baş şüphelisi.',
      real:[['🧱','Derin ağ duvarının teşhisi'],['✂️','Gradient clipping tekniği'],['🛣️','LSTM ve ResNet\'e giden yolun açılması']],
      sub:['Whh·(1−h²) çarpanı','0.5²⁰ vs 1.5²⁰ sezgisi','Gradient clipping']},
    {id:'lstm', nm:'🚪 LSTM / GRU', tier:3, v:62, pre:['van'], tab:'lstm',
      d:'Kapılar + cell-state "otoyolu": gradyanın bozulmadan aktığı yol. Vanishing duvarının ilk büyük çözümü.',
      sci:'Hochreiter & Schmidhuber (1997). Vanishing\'i teşhis eden adam, çözümünü de yazdı: gradyanın bozulmadan aktığı cell-state otoyolu + kapılar.',
      real:[['🌍','Google Translate (2016, GNMT)'],['🗣️','Siri/Alexa dönemi konuşma tanıma'],['📱','Klavye tahmini & otomatik tamamlama']],
      sub:['Cell state otoyolu','Forget / input / output kapıları','GRU farkı','Neden gradyan korunur','Kendini test (5 soru)']},
    {id:'s2s',  nm:'🌉 Seq2Seq + Klasik Attention', tier:4, v:44, pre:['lstm','emb'],
      d:'Encoder–decoder çeviri + Bahdanau attention: "çevirirken kaynağın neresine bakmalıyım?" — attention fikrinin doğduğu yer.',
      sci:'Seq2Seq: Sutskever, Vinyals & Le (2014). Klasik attention: Bahdanau, Cho & Bengio (2014) — "nereye bakmalıyım?" sorusuna öğrenilen cevap.',
      real:[['🔤','Nöral makine çevirisi devrimi'],['📝','Otomatik özetleme'],['💬','İlk nöral sohbet botları']],
      sub:['Encoder–decoder','Bilgi darboğazı sorunu','Bahdanau attention']},
    {id:'soft', nm:'🌡️ Softmax & Temperature', tier:4, v:74, pre:['akt'], tab:'softmax',
      d:'Skorları olasılığa çeviren formül — ve LLM\'lerin "yaratıcılık" düğmesi. Attention ağırlıklarının mutfağı.',
      sci:'Kök: Boltzmann dağılımı e^(−E/kT) (1868) — T gerçekten sıcaklık! "softmax" adını Bridle koydu (1989). Fizikten yapay zekâya 120 yıllık köprü.',
      real:[['🎲','LLM örneklemesi: her kelime bir zar atışı'],['🌡️','temperature API parametresi'],['🖼️','"%97 kedi" güven skorları'],['🎯','Attention dikkat yüzdeleri']],
      sub:['Neden exp? (skor→olasılık)','Softmax formülü','Temperature: keskin↔yaratıcı','√d ölçekleme ipucu','Kendini test (4 soru)']},
    {id:'att',  nm:'🎯 Self-Attention (Q/K/V)', tier:5, v:50, pre:['s2s','vek','soft'], tab:'attention',
      d:'softmax(QKᵀ/√d)·V — her kelime her kelimeye bakar, recurrence tamamen atılır. Makalenin kalbi.',
      sci:'Vaswani ve 7 arkadaşı, Google Brain/Research (2017). "Recurrence\'ı tamamen atalım, yalnız attention kalsın" cesareti — makalenin adı buradan.',
      real:[['⚡','Paralel eğitim: GPU\'ların tam gücü'],['🔗','Uzun menzilli bağlam yakalama'],['🧬','AlphaFold\'a giden temsil gücü']],
      sub:['Q, K, V nedir','Skor: QKᵀ/√d','Softmax ağırlıkları','Ağırlıklı toplam (çıktı)']},
    {id:'mha',  nm:'🧩 Multi-Head Attention', tier:6, v:26, pre:['att'], tab:'multihead',
      d:'Aynı anda farklı ilişki türlerini yakalayan paralel attention kafaları.',
      sci:'Aynı makale (2017): tek attention yerine 8 paralel "kafa" — her biri farklı ilişki türünü öğrenir (sözdizimi, anlam, eşleşme...).',
      real:[['🧩','Zengin dil temsili (BERT/GPT içi)'],['🔬','Yorumlanabilirlik: kafa analizi']],
      sub:['Kafalara bölme','Farklı ilişki uzayları','Birleştirme (concat + W)']},
    {id:'pos',  nm:'📍 Positional Encoding', tier:6, v:74, pre:['att'],
      d:'Recurrence yoksa sıra bilgisi nereden? Sinüs dalgalarıyla konumun vektöre işlenmesi.',
      sci:'Aynı makale (2017): sıra bilgisi sinüs/kosinüs dalgalarıyla vektöre işlendi — recurrence olmadan "kim önce kim sonra" çözüldü.',
      real:[['📐','Sırayı koruyarak tam paralellik'],['🎼','Dalga-tabanlı konum kodlama']],
      sub:['Neden konum bilgisi gerekli','Sinüs/kosinüs kodlama']},
    {id:'blk',  nm:'🏗️ Transformer Bloğu', tier:7, v:50, pre:['mha','pos'],
      d:'Residual + LayerNorm + FFN; encoder/decoder mimarisi. Bütün parçaların tek makinede birleşmesi.',
      sci:'Residual: He ve ekibi (2015, ResNet). LayerNorm: Ba, Kiros & Hinton (2016). Transformer bloğu bu parçaları tek makinede birleştirdi (2017).',
      real:[['🏗️','Yüzlerce katman derinlik mümkün'],['📦','Kopyala-yapıştır ölçeklenen mimari']],
      sub:['Residual bağlantı','LayerNorm','FFN katmanı','Encoder/decoder yığını']},
    {id:'paper',nm:'📜 Attention Is All You Need', tier:8, v:50, pre:['blk'], crown:true,
      d:'2017, Vaswani vd. Bütün çarklar dönünce bu makale ana dilin gibi okunur. BÜYÜK HEDEF.',
      sci:'Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin (Google, 2017). 8 yazar, 15 sayfa — yapay zekânın son on yılını tek başına şekillendirdi.',
      real:[['🏆','BİLİM ZAFERİ: makale ana dilin gibi'],['🌍','Modern YZ çağının kurucu metni']],
      sub:['Makaleyi baştan sona oku','Şekil 1 mimarisini kendi cümlelerinle anlat','Sonuç tablolarını yorumla']},
    {id:'llm',  nm:'🤖 Modern LLM\'ler (GPT)', tier:9, v:50, pre:['paper'],
      d:'Decoder-only + "sonraki kelimeyi tahmin et" + ölçek = bugünkü sohbet modelleri. Ufuk çizgisi.',
      sci:'GPT serisi: Radford & OpenAI (2018→). Ölçekleme yasaları: Kaplan vd. (2020). "Sonraki kelimeyi tahmin et"in ölçekle mucizeye dönüşmesi.',
      real:[['🤖','ChatGPT, Claude, Gemini'],['👨‍💻','Copilot: kod yazan YZ'],['🔬','Bilimsel keşif asistanları']],
      sub:['Decoder-only mimari','Next-token eğitimi','Ölçekleme fikri']}
  ];
  const byId={}; NODES.forEach(n=>byId[n.id]=n);
  const ERAS=[
    {t0:0,t1:1,nm:'📜 TEMELLER ÇAĞI'},
    {t0:2,t1:3,nm:'⚙️ NÖRAL ÇAĞ'},
    {t0:4,t1:5,nm:'🌉 DİZİ MODELLEME ÇAĞI'},
    {t0:6,t1:7,nm:'🎯 TRANSFORMER ÇAĞI'},
    {t0:8,t1:9,nm:'🏆 BİLİM ZAFERİ'}
  ];

  const KD='attn_tt_done_v2', KS='attn_tt_sub_v1';
  let done, subs;
  try{ done=new Set(JSON.parse(localStorage.getItem(KD)||'[]')); }catch(e){ done=new Set(); }
  try{ subs=new Set(JSON.parse(localStorage.getItem(KS)||'[]')); }catch(e){ subs=new Set(); }
  function save(){ try{ localStorage.setItem(KD, JSON.stringify([...done])); localStorage.setItem(KS, JSON.stringify([...subs])); }catch(e){} }

  function subCount(n){ let k=0; n.sub.forEach((_,i)=>{ if(subs.has(n.id+':'+i)) k++; }); return k; }
  function stateOf(n){
    if(done.has(n.id)) return 'done';
    if(n.pre.every(p=>done.has(p))) return 'avail';
    return 'locked';
  }

  const W=1910, H=560;
  const X=n=>125+n.tier*185;
  const Y=n=>100+(H-190)*n.v/100;
  const NW=n=>n.crown?200:176, NH=66;
  let sel=null;

  function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  function render(){
    let s='';
    // çağ bantları
    ERAS.forEach((e,i)=>{
      const x0=X({tier:e.t0})-100, x1=X({tier:e.t1})+100;
      s+='<rect class="era-band'+(i%2?' alt':'')+'" x="'+x0+'" y="10" width="'+(x1-x0)+'" height="'+(H-20)+'" rx="8"/>';
      s+='<text class="era-lbl" x="'+((x0+x1)/2)+'" y="38" text-anchor="middle">'+e.nm+'</text>';
    });
    // kenarlar (Civ tarzı dik hatlar)
    NODES.forEach(n=>{
      n.pre.forEach(p=>{
        const a=byId[p];
        const x1=X(a)+NW(a)/2, y1=Y(a), x2=X(n)-NW(n)/2, y2=Y(n);
        const mx=(x1+x2)/2;
        s+='<path class="'+(done.has(p)?'te-on':'te-off')+'" d="M'+x1+' '+y1+' H'+mx+' V'+y2+' H'+x2+'"/>';
      });
    });
    // düğüm kartları
    NODES.forEach(n=>{
      const st=stateOf(n);
      const k=subCount(n), N=n.sub.length;
      const w=NW(n), x=X(n)-w/2, y=Y(n)-NH/2;
      let sub;
      if(st==='done') sub='✓ tamamlandı ('+N+'/'+N+')';
      else if(st==='avail') sub='⚡ hazır · '+k+'/'+N+(n.tab?' · sitede var':'');
      else sub='🔒 kilitli'+(k?' · '+k+'/'+N:'')+(n.tab?'':' · yakında');
      const chips=n.real.map(r=>r[0]).join(' ');
      if(n.crown) s+='<text x="'+X(n)+'" y="'+(y-12)+'" text-anchor="middle" font-size="11" font-weight="700" fill="#f0a032">★ BİLİM ZAFERİ ★</text>';
      s+='<g class="tn tn-'+st+(sel===n.id?' sel':'')+'" data-id="'+n.id+'">'
        +'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+NH+'" rx="10"/>'
        +'<text x="'+X(n)+'" y="'+(Y(n)-14)+'" text-anchor="middle" font-size="'+(n.crown?12.5:11.5)+'" font-weight="600">'+esc(n.nm)+'</text>'
        +'<text class="tsub" x="'+X(n)+'" y="'+(Y(n)+2)+'" text-anchor="middle">'+esc(sub)+'</text>'
        +'<text class="tchips" x="'+X(n)+'" y="'+(Y(n)+22)+'" text-anchor="middle">'+chips+'</text>'
        +'</g>';
    });
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    svg.innerHTML=s;
    svg.querySelectorAll('.tn').forEach(g=>{
      g.style.cursor='pointer';
      g.addEventListener('click',()=>show(g.dataset.id));
    });
    const nd=NODES.filter(n=>stateOf(n)==='done').length;
    const totS=NODES.reduce((a,n)=>a+n.sub.length,0);
    const kS=NODES.reduce((a,n)=>a+subCount(n),0);
    const next=NODES.filter(n=>stateOf(n)==='avail').map(n=>n.nm).join(' · ');
    prog.innerHTML='⚙️ Açılan teknoloji: <b style="color:#46c46a">'+nd+'/'+NODES.length+'</b> &nbsp;·&nbsp; Alt başlık: <b style="color:#46c46a">'+kS+'/'+totS+'</b>'+(next?' &nbsp;·&nbsp; Araştırılabilir: <b style="color:var(--accent)">'+esc(next)+'</b>':'');
    var _av=new Set(NODES.filter(n=>stateOf(n)==='avail').map(n=>n.id));
    if(window.__ttPrevAv){ var _f=[..._av].filter(x=>!window.__ttPrevAv.has(x)); if(_f.length && window.__ttOnUnlock) window.__ttOnUnlock(_f); }
    window.__ttPrevAv=_av;
  }

  function recompute(n){
    if(n.sub.every((_,i)=>subs.has(n.id+':'+i))) done.add(n.id); else done.delete(n.id);
  }

  function show(id){
    sel=id; render();
    const n=byId[id], st=stateOf(n);
    const unlocks=NODES.filter(m=>m.pre.includes(id));
    const chips=n.pre.length
      ? n.pre.map(p=>'<span style="display:inline-block; margin:2px 4px 2px 0; padding:2px 9px; border-radius:10px; font-size:12px; border:1px solid '+(done.has(p)?'#46c46a; color:#46c46a':'#e06a6a; color:#e06a6a')+'">'+esc(byId[p].nm)+(done.has(p)?' ✓':' ✗')+'</span>').join('')
      : '<span style="color:var(--muted)">yok — kök teknoloji</span>';
    const ul=unlocks.length? unlocks.map(m=>esc(m.nm)).join(' · ') : '—';
    const dis=(st==='locked')?' disabled':'';
    const reals=n.real.map(r=>'<div style="margin:3px 0">'+r[0]+' '+esc(r[1])+'</div>').join('');
    const list=n.sub.map((t,i)=>{
      const c=subs.has(n.id+':'+i);
      return '<label style="display:flex; gap:8px; align-items:flex-start; margin:5px 0; font-size:13px; cursor:pointer">'
        +'<input type="checkbox" data-sub="'+n.id+':'+i+'"'+(c?' checked':'')+dis+' style="margin-top:2px; accent-color:#46c46a">'
        +'<span'+(c?' style="color:#46c46a"':'')+'>'+esc(t)+'</span></label>';
    }).join('');
    let btns='';
    if(n.tab) btns+='<button class="addbtn" data-go="'+n.tab+'" style="background:var(--blue); color:#fff">Sayfada aç →</button> ';
    btns+='<button class="addbtn" data-pedia="'+n.id+'" style="background:var(--accent); color:#1f2023">📖 Civilopedia&#39;da oku</button> ';
    if(st!=='locked') btns+='<button class="addbtn" data-tg="'+n.id+'" style="background:'+(done.has(n.id)?'var(--panel); color:var(--muted); border:1px solid var(--line)':'var(--green); color:#0b2a12')+'">'+(done.has(n.id)?'↩ Hepsini geri al':'✔ Hepsini tamamladım')+'</button>';
    info.innerHTML='<b style="font-size:16px">'+esc(n.nm)+'</b>'
      +' <span style="font-size:12px; color:var(--muted)">('+(st==='done'?'araştırıldı':st==='avail'?'araştırılabilir':'kilitli — önce gerekenleri aç')+')</span>'
      +'<div style="margin:8px 0; line-height:1.6">'+n.d+'</div>'
      +'<div style="font-size:12px; color:var(--accent); font-weight:700; margin:12px 0 4px">👤 KEŞİF — Civilopedia</div>'
      +'<div style="font-size:13px; line-height:1.6; color:#cfd3d8">'+n.sci+'</div>'
      +'<div style="font-size:12px; color:var(--accent); font-weight:700; margin:12px 0 4px">🌍 GERÇEK DÜNYADA NEYİ AÇTI</div>'
      +'<div style="font-size:13px; line-height:1.5; color:#cfd3d8">'+reals+'</div>'
      +'<div style="font-size:12px; color:var(--accent); font-weight:700; margin:12px 0 4px">⛓️ GEREKENLER</div>'
      +'<div style="font-size:13px">'+chips+'</div>'
      +'<div style="font-size:12px; color:var(--accent); font-weight:700; margin:12px 0 4px">📋 ALT BAŞLIKLAR '+(st==='locked'?'(kilit açılınca işaretlenebilir)':'— bitirdiğini işaretle')+'</div>'
      +list
      +'<div style="font-size:12px; color:var(--accent); font-weight:700; margin:12px 0 4px">🔓 BUNU AÇINCA AÇILIR</div>'
      +'<div style="font-size:13px; margin-bottom:10px">'+ul+'</div>'
      +btns;
    info.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{
      const t=document.querySelector('.navbtn[data-model="'+b.dataset.go+'"]'); if(t) t.click();
    }));
    info.querySelectorAll('[data-pedia]').forEach(b=>b.addEventListener('click',()=>{
      const t=document.querySelector('.navbtn[data-model="pedia"]'); if(t) t.click();
      setTimeout(()=>{ const el=document.getElementById('pedia-'+b.dataset.pedia); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); },60);
    }));
    info.querySelectorAll('[data-sub]').forEach(cb=>cb.addEventListener('change',()=>{
      const key=cb.dataset.sub;
      if(cb.checked) subs.add(key); else subs.delete(key);
      recompute(n); save(); show(id);
    }));
    info.querySelectorAll('[data-tg]').forEach(b=>b.addEventListener('click',()=>{
      if(done.has(n.id)){ n.sub.forEach((_,i)=>subs.delete(n.id+':'+i)); done.delete(n.id); }
      else { n.sub.forEach((_,i)=>subs.add(n.id+':'+i)); done.add(n.id); }
      save(); show(n.id);
    }));
    if(window.__ttAfterShow) window.__ttAfterShow(n, st, info);
  }

  render();
  window.__ttShow=show;
  window.__ttAPI={ NODES:NODES, stateOf:stateOf };
  window.__ttGet=function(){ return { done:[...done], subs:[...subs] }; };
  window.__ttImport=function(d,s){ done.clear(); (d||[]).forEach(x=>done.add(x)); subs.clear(); (s||[]).forEach(x=>subs.add(x)); save(); render(); };
})();

/* ---- sol panel: sürüklenebilir genişlik ---- */
(function(){
  const rs=document.getElementById('sbResizer'); if(!rs) return;
  const root=document.documentElement;
  let w=215;
  try{ const s=parseInt(localStorage.getItem('attn_sbw')||'',10); if(s>=150&&s<=420) w=s; }catch(e){}
  root.style.setProperty('--sbw', w+'px');
  let drag=false, sx=0, sw=0;
  rs.addEventListener('pointerdown',e=>{ drag=true; sx=e.clientX; sw=w; rs.classList.add('on'); rs.setPointerCapture(e.pointerId); e.preventDefault(); });
  rs.addEventListener('pointermove',e=>{ if(!drag) return; w=Math.max(150, Math.min(420, sw+(e.clientX-sx))); root.style.setProperty('--sbw', w+'px'); });
  rs.addEventListener('pointerup',()=>{ drag=false; rs.classList.remove('on'); try{ localStorage.setItem('attn_sbw', String(w)); }catch(e){} });
})();

/* ---- RNN 1. bölüm: sim/kartlar sütun genişliği sürüklenebilir ---- */
(function(){
  const rs=document.getElementById('rnnColResizer'); const cols=document.getElementById('rnnFwdCols'); if(!rs||!cols) return;
  const root=document.documentElement;
  let w=540;
  try{ const s=parseInt(localStorage.getItem('attn_rnn_simw')||'',10); if(s>=300&&s<=800) w=s; }catch(e){}
  root.style.setProperty('--rnn-simw', w+'px');
  let drag=false, sx=0, sw=0;
  rs.addEventListener('pointerdown',e=>{ drag=true; sx=e.clientX; sw=w; rs.classList.add('on'); rs.setPointerCapture(e.pointerId); e.preventDefault(); });
  rs.addEventListener('pointermove',e=>{
    if(!drag) return;
    const total=cols.getBoundingClientRect().width;
    const maxW=Math.max(320, total-260);
    w=Math.max(300, Math.min(maxW, sw+(e.clientX-sx)));
    root.style.setProperty('--rnn-simw', w+'px');
  });
  rs.addEventListener('pointerup',()=>{ drag=false; rs.classList.remove('on'); try{ localStorage.setItem('attn_rnn_simw', String(Math.round(w))); }catch(e){} });
})();

/* ---- panel scroll ile ekrandan çıkınca yüzer (açılıp kapanabilir + tamamen kapatılabilir) ---- */
function setupFloatingPanel(ids){
  const anchor=document.getElementById(ids.anchor);
  const panel=document.getElementById(ids.panel);
  const floatWrap=document.getElementById(ids.floatWrap);
  const floatBody=document.getElementById(ids.floatBody);
  const floatHead=document.getElementById(ids.floatHead);
  const floatToggle=document.getElementById(ids.floatToggle);
  const floatClose=document.getElementById(ids.floatClose);
  if(!anchor||!panel||!floatWrap||!floatBody||!floatHead) return;

  let floating=false, collapsed=false, closed=false;

  function setCollapsed(c){
    collapsed=c;
    floatWrap.classList.toggle('rc-float-collapsed', collapsed);
    if(floatToggle) floatToggle.textContent = collapsed ? '▸' : '▾';
  }
  if(ids.startCollapsed) setCollapsed(true);

  /* ---- sürükleme (başlık çubuğundan) ---- */
  const storageKey = ids.storageKey;
  let dragging=false, moved=false, sx=0, sy=0, sLeft=0, sTop=0;
  floatHead.addEventListener('pointerdown', (e)=>{
    if(e.target.closest('.rc-float-toggle,.rc-float-close')) return;
    dragging=true; moved=false;
    const rect=floatWrap.getBoundingClientRect();
    sLeft=rect.left; sTop=rect.top; sx=e.clientX; sy=e.clientY;
    floatHead.setPointerCapture(e.pointerId);
  });
  floatHead.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const dx=e.clientX-sx, dy=e.clientY-sy;
    if(Math.abs(dx)>3||Math.abs(dy)>3) moved=true;
    if(!moved) return;
    let nl=Math.max(4, Math.min(window.innerWidth-floatWrap.offsetWidth-4, sLeft+dx));
    let nt=Math.max(4, Math.min(window.innerHeight-32, sTop+dy));
    floatWrap.style.left=nl+'px'; floatWrap.style.top=nt+'px';
    floatWrap.style.right='auto'; floatWrap.style.bottom='auto';
  });
  function endDrag(){
    if(!dragging) return;
    dragging=false;
    if(moved && storageKey){
      try{ localStorage.setItem(storageKey, JSON.stringify({left:floatWrap.style.left, top:floatWrap.style.top})); }catch(e){}
    }
  }
  floatHead.addEventListener('pointerup', endDrag);
  floatHead.addEventListener('pointercancel', endDrag);
  floatHead.addEventListener('click', ()=>{
    if(moved){ moved=false; return; }
    setCollapsed(!collapsed);
  });
  if(storageKey){
    try{
      const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
      if(saved && saved.left && saved.top){
        floatWrap.style.left=saved.left; floatWrap.style.top=saved.top; floatWrap.style.right='auto';
      }
    }catch(e){}
  }

  function unfloat(){
    floating=false;
    anchor.parentNode.insertBefore(panel, anchor.nextSibling);
    floatWrap.style.display='none';
  }
  if(floatClose) floatClose.addEventListener('click', (e)=>{
    e.stopPropagation();
    closed=true;
    if(floating) unfloat();
  });

  let ticking=false;
  function checkFloat(){
    ticking=false;
    if(document.getElementById('model-rnn') && !document.getElementById('model-rnn').classList.contains('active')) return;
    const top=anchor.getBoundingClientRect().top;
    if(top<0){
      if(closed) return;
      if(!floating){
        floating=true;
        floatBody.appendChild(panel);
        floatWrap.style.display='block';
        // ilk kez açılıyorsa ve sürüklenerek taşınmamışsa, referans panelin altına yerleştir (alt alta)
        if(ids.stackBelow && !floatWrap.style.left){
          const ref=document.getElementById(ids.stackBelow);
          if(ref && ref.style.display!=='none'){
            const r=ref.getBoundingClientRect();
            floatWrap.style.top=(r.bottom+10)+'px';
          }
        }
      }
    } else {
      closed=false;
      if(floating) unfloat();
    }
  }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(checkFloat); } }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  document.querySelectorAll('.navbtn').forEach(b=> b.addEventListener('click', ()=> setTimeout(checkFloat, 50)));
  checkFloat();
}
setupFloatingPanel({anchor:'rcSliderAnchor', panel:'rcSliderPanel', floatWrap:'rcFloatWrap', floatBody:'rcFloatBody', floatHead:'rcFloatHead', floatToggle:'rcFloatToggle', floatClose:'rcFloatClose', storageKey:'attn_rcFloatSliderPos', startCollapsed:true});
setupFloatingPanel({anchor:'rcDiagramAnchor', panel:'rcDiagramPanel', floatWrap:'rcDiagramFloatWrap', floatBody:'rcDiagramFloatBody', floatHead:'rcDiagramFloatHead', floatToggle:'rcDiagramFloatToggle', floatClose:'rcDiagramFloatClose', storageKey:'attn_rcFloatDiagramPos', stackBelow:'rcFloatWrap', startCollapsed:true});

/* ---- sol panel: aç/kapat ---- */
(function(){
  const tg=document.getElementById('sbToggle'); const sb=document.getElementById('sidebar'); if(!tg||!sb) return;
  let collapsed=false;
  try{ collapsed = localStorage.getItem('attn_sbcollapsed')==='1'; }catch(e){}
  function apply(){
    sb.classList.toggle('collapsed', collapsed);
    tg.textContent = collapsed ? '▶' : '◀';
    tg.title = collapsed ? 'Paneli aç' : 'Paneli kapat';
  }
  apply();
  tg.addEventListener('click', ()=>{
    collapsed = !collapsed;
    apply();
    try{ localStorage.setItem('attn_sbcollapsed', collapsed ? '1' : '0'); }catch(e){}
  });
})();

/* ---- Civilopedia gezinme ---- */
(function(){
  document.querySelectorAll('[data-ped-tree]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.pedTree;
    const t=document.querySelector('.navbtn[data-model="yol"]'); if(t) t.click();
    setTimeout(()=>{ if(window.__ttShow) window.__ttShow(id); const el=document.getElementById('techInfo'); if(el) el.scrollIntoView({behavior:'smooth', block:'center'}); },80);
  }));
  document.querySelectorAll('[data-ped-tab]').forEach(b=>b.addEventListener('click',()=>{
    const t=document.querySelector('.navbtn[data-model="'+b.dataset.pedTab+'"]'); if(t) t.click();
    const sc=b.dataset.pedScroll;
    if(sc){ setTimeout(()=>{ const el=document.getElementById(sc); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); },80); }
  }));
})();

/* ---- LSTM: vana paneli + tam hücre ---- */
(function(){
  const pipe=document.getElementById('lstmPipe'); if(!pipe) return;
  const $=id=>document.getElementById(id);
  const F=(v,d=3)=>(isFinite(v)?v:0).toFixed(d);
  const sig=z=>1/(1+Math.exp(-z));
  const wpx=v=>Math.max(1.5, 2+9*Math.min(2, Math.abs(v)));

  /* --- 1) vana paneli --- */
  function valve(x,y,val,label,col){
    return '<circle cx="'+x+'" cy="'+y+'" r="17" fill="#15161a" stroke="'+col+'" stroke-width="2.5"/>'
      +'<circle cx="'+x+'" cy="'+y+'" r="'+(3+12*val)+'" fill="'+col+'" opacity="0.55"/>'
      +'<text x="'+x+'" y="'+(y-24)+'" text-anchor="middle" font-size="11" fill="'+col+'" font-weight="700">'+label+'='+F(val,2)+'</text>';
  }
  function seg(x1,y1,x2,y2,w,col){
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round" opacity="0.85"/>';
  }
  function lbl(x,y,t,col,sz){
    return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+(sz||11)+'" fill="'+(col||'#cfd3d8')+'">'+t+'</text>';
  }
  function drawPipe(){
    const f=parseFloat($('lv_f').value), i=parseFloat($('lv_i').value), o=parseFloat($('lv_o').value);
    const cp=parseFloat($('lv_cp').value), ct=parseFloat($('lv_ct').value);
    ['f','i','o','cp','ct'].forEach(k=>{ $('lv_'+k+'_v').textContent=F(parseFloat($('lv_'+k).value),2); });
    const c=f*cp+i*ct, h=o*Math.tanh(c);
    let s='';
    const Y=88, Yb=190;
    s+=lbl(56,Y-16,'c₋₁ = '+F(cp,2),'#46c46a',12);
    s+=seg(20,Y,140,Y,wpx(cp),'#46c46a');
    s+=valve(163,Y,f,'f','#f0a032');
    s+=seg(186,Y,320,Y,wpx(f*cp),'#46c46a');
    s+=lbl(255,Y-12,'f·c₋₁ = '+F(f*cp,2),'#9aa0a6');
    s+=lbl(120,Yb+18,'c̃ = '+F(ct,2),'#3a7afe',12);
    s+=seg(70,Yb,215,Yb,wpx(ct),'#3a7afe');
    s+=valve(238,Yb,i,'i','#f0a032');
    s+=seg(261,Yb,340,Yb,wpx(i*ct),'#3a7afe');
    s+=seg(340,Yb,340,Y+14,wpx(i*ct),'#3a7afe');
    s+=lbl(310,Yb-12,'i·c̃ = '+F(i*ct,2),'#9aa0a6');
    s+='<circle cx="340" cy="'+Y+'" r="15" fill="#16324f" stroke="#5aa0e0" stroke-width="2"/>'+lbl(340,Y+5,'+','#fff',16);
    s+=seg(355,Y,520,Y,wpx(c),'#46c46a');
    s+=lbl(437,Y-14,'c = '+F(c,3),'#46c46a',12.5);
    s+='<rect x="520" y="'+(Y-16)+'" width="52" height="32" rx="8" fill="#16324f" stroke="#5aa0e0" stroke-width="2"/>'+lbl(546,Y+4,'tanh','#fff');
    s+=seg(572,Y,606,Y,wpx(Math.tanh(c)),'#e06a6a');
    s+=valve(629,Y,o,'o','#f0a032');
    s+=seg(652,Y,740,Y,wpx(h),'#e06a6a');
    s+=lbl(700,Y-14,'h = '+F(h,3),'#e06a6a',12.5);
    s+=seg(437,Y,437,30,Math.max(1.5,wpx(c)*0.6),'#46c46a');
    s+=lbl(437,20,'c → sonraki adıma','#46c46a');
    pipe.setAttribute('viewBox','0 0 780 240');
    pipe.innerHTML=s;
    $('lv_work').innerHTML=
      'c = f·c₋₁ + i·c̃ = ('+F(f,2)+')('+F(cp,2)+') + ('+F(i,2)+')('+F(ct,2)+')   = <b>'+F(c)+'</b>\n'+
      'h = o·tanh(c)  = ('+F(o,2)+')·tanh('+F(c)+') = ('+F(o,2)+')('+F(Math.tanh(c))+')   = <b>'+F(h)+'</b>';
  }
  ['lv_f','lv_i','lv_o','lv_cp','lv_ct'].forEach(id=>$(id).addEventListener('input',drawPipe));
  drawPipe();

  /* --- 2) tam hücre --- */
  const Wgt={ f:[0.5,0.4,0.1], i:[0.6,0.3,0.0], c:[0.8,0.5,0.0], o:[0.7,0.4,0.1] };
  function cell(){
    const x=parseFloat($('lc_x').value), h=parseFloat($('lc_h').value), cp=parseFloat($('lc_c').value);
    ['x','h','c'].forEach(k=>{ $('lc_'+k+'_v').textContent=F(parseFloat($('lc_'+k).value),2); });
    const z=w=>w[0]*x+w[1]*h+w[2];
    const zf=z(Wgt.f), zi=z(Wgt.i), zc=z(Wgt.c), zo=z(Wgt.o);
    const f=sig(zf), i=sig(zi), ct=Math.tanh(zc), o=sig(zo);
    const c=f*cp+i*ct, hn=o*Math.tanh(c);
    const ln=(g,w,zv,val,fn)=>g+' = '+fn+'('+F(w[0],1)+'·x + '+F(w[1],1)+'·h₋₁'+(w[2]?' + '+F(w[2],1):'')+') = '+fn+'('+F(zv)+')   = <b>'+F(val)+'</b>';
    $('lc_work').innerHTML=
      '<b style="color:var(--accent)">Kapılar açıklıklarına karar veriyor:</b>\n'+
      ln('f',Wgt.f,zf,f,'σ')+'   <span style="color:var(--muted)">← eski hafızanın %'+Math.round(f*100)+'’i kalacak</span>\n'+
      ln('i',Wgt.i,zi,i,'σ')+'   <span style="color:var(--muted)">← yeninin %'+Math.round(i*100)+'’i girecek</span>\n'+
      ln('c̃',Wgt.c,zc,ct,'tanh')+'   <span style="color:var(--muted)">← yazılacak içerik</span>\n'+
      ln('o',Wgt.o,zo,o,'σ')+'   <span style="color:var(--muted)">← hafızanın %'+Math.round(o*100)+'’i söylenecek</span>\n'+
      '\n<b style="color:var(--accent)">Hafıza güncelleniyor (bagaj bandı):</b>\n'+
      'c = f·c₋₁ + i·c̃ = ('+F(f)+')('+F(cp,2)+') + ('+F(i)+')('+F(ct)+')   = <b>'+F(c)+'</b>\n'+
      'h = o·tanh(c) = ('+F(o)+')('+F(Math.tanh(c))+')   = <b>'+F(hn)+'</b>';
    const f20=Math.pow(f,20);
    $('lc_grad').innerHTML=
      '<b>Gradyan sağlık raporu:</b>  ∂c/∂c₋₁ = f = <b>'+F(f)+'</b>\n'+
      '20 adım geriye taşınırsa: f²⁰ = <b style="color:'+(f20>0.05?'#46c46a':'#e06a6a')+'">'+f20.toPrecision(3)+'</b>'+
      (f20>0.05?'  → sinyal hayatta! 💪':'  → sinyal ölüyor (f’yi büyütmek için x veya h₋₁’i artır)');
  }
  ['lc_x','lc_h','lc_c'].forEach(id=>$(id).addEventListener('input',cell));
  cell();
})();

/* ---- vektör & nokta çarpım oyuncağı ---- */
(function(){
  const cv=document.getElementById('vecCanvas'); if(!cv) return;
  const ctx=cv.getContext('2d');
  const wk=document.getElementById('vecWork');
  const vd=document.getElementById('vecVerdict');
  const F=(v,d=2)=>(isFinite(v)?v:0).toFixed(d);
  const W=cv.width, H=cv.height, CX=W/2, CY=H/2, S=52; // 1 birim = 52px
  let a={x:2.2,y:1.0}, b={x:1.2,y:2.2}, drag=null;

  const px=v=>CX+v*S, py=v=>CY-v*S;
  const ux=p=>(p-CX)/S, uy=p=>(CY-p)/S;

  function arrow(v,col){
    const x=px(v.x), y=py(v.y);
    ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(CX,CY); ctx.lineTo(x,y); ctx.stroke();
    const ang=Math.atan2(y-CY,x-CX);
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x-12*Math.cos(ang-0.42), y-12*Math.sin(ang-0.42));
    ctx.lineTo(x-12*Math.cos(ang+0.42), y-12*Math.sin(ang+0.42));
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,7,0,7); ctx.fillStyle=col; ctx.globalAlpha=0.35; ctx.fill(); ctx.globalAlpha=1;
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    // ızgara
    ctx.strokeStyle='#26282c'; ctx.lineWidth=1;
    for(let i=-3;i<=3;i++){
      ctx.beginPath(); ctx.moveTo(px(i),0); ctx.lineTo(px(i),H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,py(i)); ctx.lineTo(W,py(i)); ctx.stroke();
    }
    ctx.strokeStyle='#4a4f56'; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(0,CY); ctx.lineTo(W,CY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX,0); ctx.lineTo(CX,H); ctx.stroke();
    const dot=a.x*b.x+a.y*b.y;
    const la=Math.hypot(a.x,a.y), lb=Math.hypot(b.x,b.y);
    const cos=dot/(la*lb||1);
    // izdüşüm: a'nın b üzerine gölgesi
    const t=dot/((lb*lb)||1);
    const fx=b.x*t, fy=b.y*t;
    ctx.setLineDash([4,4]); ctx.strokeStyle='#9aa0a6'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(px(a.x),py(a.y)); ctx.lineTo(px(fx),py(fy)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle=cos>=0?'#46c46a':'#e06a6a'; ctx.lineWidth=5; ctx.globalAlpha=0.7;
    ctx.beginPath(); ctx.moveTo(CX,CY); ctx.lineTo(px(fx),py(fy)); ctx.stroke();
    ctx.globalAlpha=1;
    // açı yayı
    const a1=Math.atan2(-a.y,a.x), a2=Math.atan2(-b.y,b.x);
    ctx.strokeStyle='#ffd24a'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(CX,CY,26,a1,a2, ((a2-a1+Math.PI*2)%(Math.PI*2))>Math.PI);
    ctx.stroke();
    arrow(a,'#3a7afe'); arrow(b,'#f0a032');
    ctx.font='bold 13px Segoe UI';
    ctx.fillStyle='#3a7afe'; ctx.fillText('a', px(a.x)+10, py(a.y)-8);
    ctx.fillStyle='#f0a032'; ctx.fillText('b', px(b.x)+10, py(b.y)-8);
    // panel
    const th=Math.acos(Math.max(-1,Math.min(1,cos)))*180/Math.PI;
    wk.innerHTML=
      'a = ('+F(a.x)+', '+F(a.y)+')    b = ('+F(b.x)+', '+F(b.y)+')\n'+
      '\n<b>Cebir:</b>\na·b = a<sub>x</sub>b<sub>x</sub> + a<sub>y</sub>b<sub>y</sub>\n    = ('+F(a.x)+')('+F(b.x)+') + ('+F(a.y)+')('+F(b.y)+')\n    = <b>'+F(dot)+'</b>\n'+
      '\n<b>Geometri:</b>\n|a| = '+F(la)+'   |b| = '+F(lb)+'   θ = '+F(th,1)+'°\n|a||b|cosθ = '+F(la)+' × '+F(lb)+' × '+F(cos,3)+' = <b>'+F(la*lb*cos)+'</b>  ✓ aynı!\n'+
      '\n<b>cosine benzerliği</b> = '+F(cos,3);
    let verdict, col;
    if(cos>0.7){ verdict='😍 Neredeyse aynı yöne bakıyorlar → <b>çok benzer</b>. Attention burada yüksek skor verirdi.'; col='#46c46a'; }
    else if(cos>0.25){ verdict='🙂 Yönler uyumlu → <b>benzer sayılır</b>.'; col='#46c46a'; }
    else if(cos>-0.25){ verdict='😐 Neredeyse dik → <b>alakasız</b>. Nokta çarpım ~0; gölge noktaya büzüldü.'; col='#9aa0a6'; }
    else { verdict='🙃 Zıt yönler → <b>karşıt</b>. Nokta çarpım negatif; gölge geriye düştü.'; col='#e06a6a'; }
    vd.innerHTML='<span style="color:'+col+'">'+verdict+'</span>';
  }
  function pos(e){
    const r=cv.getBoundingClientRect();
    const sx=cv.width/r.width, sy=cv.height/r.height;
    const c=e.touches?e.touches[0]:e;
    return { x:(c.clientX-r.left)*sx, y:(c.clientY-r.top)*sy };
  }
  function near(p,v){ return Math.hypot(p.x-px(v.x), p.y-py(v.y))<20; }
  function down(e){ const p=pos(e); if(near(p,a)) drag=a; else if(near(p,b)) drag=b; if(drag) e.preventDefault(); }
  function move(e){
    if(!drag) return;
    const p=pos(e);
    drag.x=Math.max(-3.2,Math.min(3.2,ux(p.x)));
    drag.y=Math.max(-3.2,Math.min(3.2,uy(p.y)));
    draw(); e.preventDefault();
  }
  function up(){ drag=null; }
  cv.addEventListener('mousedown',down); cv.addEventListener('mousemove',move);
  window.addEventListener('mouseup',up);
  cv.addEventListener('touchstart',down,{passive:false}); cv.addEventListener('touchmove',move,{passive:false});
  cv.addEventListener('touchend',up);
  cv.style.cursor='grab';
  draw();
})();

/* ---- softmax & temperature oyuncağı ---- */
(function(){
  const bars=document.getElementById('smBars'); if(!bars) return;
  const $=id=>document.getElementById(id);
  const F=(v,d=3)=>(isFinite(v)?v:0).toFixed(d);
  const WORDS=[
    {w:'uyudu',  col:'#46c46a'},
    {w:'kaçtı',  col:'#3a7afe'},
    {w:'havladı',col:'#f0a032'},
    {w:'mor',    col:'#e06a6a'}
  ];
  function calc(){
    const T=parseFloat($('smT').value);
    const logits=WORDS.map((w,i)=>parseFloat($('smL'+i).value));
    const exps=logits.map(z=>Math.exp(z/T));
    const S=exps.reduce((a,b)=>a+b,0);
    const ps=exps.map(e=>e/S);
    return {T,logits,exps,S,ps};
  }
  function render(){
    const r=calc();
    $('smT_v').textContent=F(r.T,2);
    WORDS.forEach((w,i)=>{ $('smL'+i+'_v').textContent=F(r.logits[i],1); });
    bars.innerHTML=WORDS.map((w,i)=>
      '<div style="display:flex; align-items:center; gap:10px; margin:7px 0">'
      +'<span style="min-width:70px; text-align:right; font-size:13px">'+w.w+'</span>'
      +'<div style="flex:1; background:#15161a; border-radius:6px; height:26px; overflow:hidden">'
      +'<div style="width:'+(r.ps[i]*100)+'%; height:100%; background:'+w.col+'; transition:width .25s; border-radius:6px"></div></div>'
      +'<b style="min-width:56px; font-size:13px; color:'+w.col+'">%'+(r.ps[i]*100).toFixed(1)+'</b></div>'
    ).join('');
    $('smWork').innerHTML=
      'T = '+F(r.T,2)+'  →  önce z/T, sonra e üzeri:\n'
      +WORDS.map((w,i)=>(w.w+'        ').slice(0,8)+' z = '+F(r.logits[i],1)+'   e^('+F(r.logits[i]/r.T,2)+') = '+F(r.exps[i])).join('\n')
      +'\ntoplam = '+F(r.S)+'\n'
      +WORDS.map((w,i)=>(w.w+'        ').slice(0,8)+' p = '+F(r.exps[i])+' / '+F(r.S)+' = <b>'+F(r.ps[i])+'</b>').join('\n')
      +'\nΣp = '+F(r.ps.reduce((a,b)=>a+b,0),3)+'   ✓ her zaman 1';
    let v;
    if(r.T<=0.35) v='🥶 <b>Düşük sıcaklık:</b> dağılım keskinleşti — model neredeyse hep en yüksek skoru seçer (greedy). Güvenli ama tekrarcı.';
    else if(r.T<=1.3) v='🙂 <b>Dengeli bölge:</b> güçlü aday öne çıkıyor ama alternatiflere de şans var. Sohbet modellerinin tipik ayarı.';
    else v='🥵 <b>Yüksek sıcaklık:</b> dağılım düzleşti — "mor" bile şans buluyor. Yaratıcı… ya da saçma. LLM "halüsinasyonlarının" bir kaynağı.';
    $('smVerdict').innerHTML=v;
  }
  let hist=[];
  $('smSample').addEventListener('click',()=>{
    const r=calc();
    let u=Math.random(), k=WORDS.length-1;
    for(let i=0;i<r.ps.length;i++){ u-=r.ps[i]; if(u<=0){ k=i; break; } }
    hist.push(WORDS[k].w); if(hist.length>10) hist.shift();
    $('smHist').innerHTML='"Kedi mırıldanarak <b style="color:'+WORDS[k].col+'">'+WORDS[k].w+'</b>."  <span style="color:var(--muted)">son çekilişler: '+hist.join(', ')+'</span>';
  });
  ['smT','smL0','smL1','smL2','smL3'].forEach(id=>$(id).addEventListener('input',render));
  render();
})();

/* ---- embedding: 2D kelime uzayı oyuncağı ---- */
(function(){
  const cv=document.getElementById('embCanvas'); if(!cv) return;
  const ctx=cv.getContext('2d');
  const info=document.getElementById('embInfo');
  const F=(v,d=2)=>(isFinite(v)?v:0).toFixed(d);
  const START=[
    {w:'kral',    x:0.9,  y:-0.7, c:'#f0a032'},
    {w:'kraliçe', x:0.9,  y:0.7,  c:'#f0a032'},
    {w:'adam',    x:-0.6, y:-0.7, c:'#3a7afe'},
    {w:'kadın',   x:-0.6, y:0.7,  c:'#3a7afe'},
    {w:'taht',    x:1.2,  y:-0.1, c:'#f0a032'},
    {w:'elma',    x:-1.4, y:-1.6, c:'#46c46a'},
    {w:'armut',   x:-1.1, y:-1.9, c:'#46c46a'},
    {w:'köpek',   x:-1.9, y:1.3,  c:'#e06a6a'}
  ];
  let words=START.map(o=>({...o}));
  let sel=null, drag=null, ghost=null;
  const S=64, CX=cv.width/2, CY=cv.height/2;
  const px=x=>CX+x*S, py=y=>CY-y*S;
  const ux=p=>(p-CX)/S, uy=p=>(CY-p)/S;
  const cos=(a,b)=>{ const d=a.x*b.x+a.y*b.y; const la=Math.hypot(a.x,a.y), lb=Math.hypot(b.x,b.y); return d/((la*lb)||1); };

  function neighbors(t){
    return words.filter(w=>w!==t).map(w=>({w:w.w, s:cos(t,w)})).sort((a,b)=>b.s-a.s).slice(0,3);
  }
  function draw(){
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.strokeStyle='#26282c'; ctx.lineWidth=1;
    for(let i=-3;i<=3;i++){ ctx.beginPath(); ctx.moveTo(px(i),0); ctx.lineTo(px(i),cv.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,py(i)); ctx.lineTo(cv.width,py(i)); ctx.stroke(); }
    ctx.strokeStyle='#4a4f56'; ctx.beginPath(); ctx.moveTo(0,CY); ctx.lineTo(cv.width,CY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(CX,0); ctx.lineTo(CX,cv.height); ctx.stroke();
    // seçili komşu bağları
    if(sel){
      neighbors(sel).forEach(n=>{
        const w=words.find(x=>x.w===n.w);
        ctx.strokeStyle='rgba(70,196,106,0.5)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(px(sel.x),py(sel.y)); ctx.lineTo(px(w.x),py(w.y)); ctx.stroke();
      });
    }
    // analoji hayaleti
    if(ghost){
      ctx.strokeStyle='#ffd24a'; ctx.lineWidth=2; ctx.setLineDash([5,4]);
      ctx.beginPath(); ctx.moveTo(px(ghost.fx),py(ghost.fy)); ctx.lineTo(px(ghost.x),py(ghost.y)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#ffd24a'; ctx.beginPath(); ctx.arc(px(ghost.x),py(ghost.y),6,0,7); ctx.fill();
      ctx.font='italic 12px Segoe UI'; ctx.fillText('≈ kraliçe?', px(ghost.x)+9, py(ghost.y)+4);
    }
    words.forEach(w=>{
      const on=sel===w;
      ctx.fillStyle=w.c; ctx.beginPath(); ctx.arc(px(w.x),py(w.y),on?7:5,0,7); ctx.fill();
      if(on){ ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke(); }
      ctx.fillStyle='#e7e9ec'; ctx.font=(on?'bold ':'')+'12px Segoe UI';
      ctx.fillText(w.w, px(w.x)+8, py(w.y)-7);
    });
  }
  function showInfo(){
    if(!sel){ info.textContent='Bir kelimeye tıkla → en yakın komşuları burada.'; return; }
    const ns=neighbors(sel);
    info.innerHTML='<b style="color:'+sel.c+'">'+sel.w+'</b> = ('+F(sel.x)+', '+F(sel.y)+')\n\n<b>En yakın komşular (cosine):</b>\n'
      + ns.map((n,i)=>(i+1)+'. '+n.w+'   → '+F(n.s,3)).join('\n')
      + '\n\n<span style="color:var(--muted)">1\'e yakın = neredeyse aynı yön = çok benzer.</span>';
  }
  function pos(e){ const r=cv.getBoundingClientRect(); const c=e.touches?e.touches[0]:e; return {x:(c.clientX-r.left)*cv.width/r.width, y:(c.clientY-r.top)*cv.height/r.height}; }
  function hit(p){ return words.find(w=>Math.hypot(p.x-px(w.x),p.y-py(w.y))<15); }
  function down(e){ const p=pos(e); const w=hit(p); if(w){ drag=w; sel=w; ghost=null; showInfo(); draw(); e.preventDefault(); } }
  function move(e){ if(!drag) return; const p=pos(e); drag.x=Math.max(-3,Math.min(3,ux(p.x))); drag.y=Math.max(-2.6,Math.min(2.6,uy(p.y))); showInfo(); draw(); e.preventDefault(); }
  function up(){ drag=null; }
  cv.addEventListener('mousedown',down); cv.addEventListener('mousemove',move); window.addEventListener('mouseup',up);
  cv.addEventListener('touchstart',down,{passive:false}); cv.addEventListener('touchmove',move,{passive:false}); cv.addEventListener('touchend',up);
  cv.style.cursor='grab';

  document.getElementById('embAnalogy').addEventListener('click',()=>{
    const g=w=>words.find(x=>x.w===w);
    const kral=g('kral'), adam=g('adam'), kadin=g('kadın'), kralice=g('kraliçe');
    const rx=kral.x-adam.x+kadin.x, ry=kral.y-adam.y+kadin.y;
    ghost={x:rx, y:ry, fx:kral.x, fy:kral.y};
    sel=null;
    info.innerHTML='<b>kral − erkek(adam) + kadın</b>\n= ('+F(kral.x)+','+F(kral.y)+') − ('+F(adam.x)+','+F(adam.y)+') + ('+F(kadin.x)+','+F(kadin.y)+')\n= <b style="color:#ffd24a">('+F(rx)+', '+F(ry)+')</b>\n\nkraliçe gerçek konumu: ('+F(kralice.x)+', '+F(kralice.y)+')\n\n<span style="color:#46c46a">→ Sarı nokta kraliçeye çok yakın! Anlam aritmetiği çalışıyor. 🎯</span>';
    draw();
  });
  document.getElementById('embReset').addEventListener('click',()=>{ words=START.map(o=>({...o})); sel=null; ghost=null; showInfo(); draw(); });

  showInfo(); draw();
})();

/* ---- self-attention: dikkat ısı haritası ---- */
(function(){
  const svg=document.getElementById('attSvg'); if(!svg) return;
  const wk=document.getElementById('attWork');
  const F=(v,d=2)=>(isFinite(v)?v:0).toFixed(d);
  const SENT=[
    { toks:['kedi','sütü','çünkü','açtı'],
      emb:[[1.0,0.2],[0.3,1.0],[-0.8,-0.3],[0.9,0.6]] },
    { toks:['banka','para','nehir','kıyı'],
      emb:[[0.9,0.5],[1.0,0.3],[-0.6,0.9],[-0.5,1.0]] }
  ];
  let si=0, sel=null, scale=true;

  function compute(){
    const S=SENT[si], n=S.toks.length, d=2;
    const div=scale?Math.sqrt(d):1;
    // ham skorlar
    const raw=[];
    for(let i=0;i<n;i++){ raw[i]=[]; for(let j=0;j<n;j++){ let s=0; for(let k=0;k<d;k++) s+=S.emb[i][k]*S.emb[j][k]; raw[i][j]=s/div; } }
    // satır softmax
    const A=raw.map(row=>{ const m=Math.max(...row); const ex=row.map(v=>Math.exp(v-m)); const t=ex.reduce((a,b)=>a+b,0); return ex.map(v=>v/t); });
    return {S,n,A,raw};
  }
  function draw(){
    const {S,n,A}=compute();
    const L=72, T=30, C=64;
    const W=L+n*C+14, H=T+n*C+16;
    let s='';
    // sütun başlıkları
    for(let j=0;j<n;j++) s+='<text class="at-col" x="'+(L+j*C+C/2)+'" y="'+(T-10)+'" text-anchor="middle">'+S.toks[j]+'</text>';
    for(let i=0;i<n;i++){
      const dim=(sel!==null && sel!==i);
      // satır başlığı (tıklanabilir)
      s+='<text class="at-row'+(sel===i?' cur':'')+'" data-row="'+i+'" x="'+(L-8)+'" y="'+(T+i*C+C/2+4)+'" text-anchor="end" opacity="'+(dim?0.4:1)+'">'+S.toks[i]+'</text>';
      for(let j=0;j<n;j++){
        const w=A[i][j];
        const op=dim?0.12:(0.12+0.82*w);
        s+='<rect x="'+(L+j*C)+'" y="'+(T+i*C)+'" width="'+(C-3)+'" height="'+(C-3)+'" rx="5" fill="#46c46a" opacity="'+op+'"'+(i===j?' stroke="#e7e9ec" stroke-width="1"':'')+'/>';
        s+='<text class="at-cell" x="'+(L+j*C+(C-3)/2)+'" y="'+(T+i*C+(C-3)/2+4)+'" text-anchor="middle" opacity="'+(dim?0.4:1)+'">%'+Math.round(w*100)+'</text>';
      }
    }
    // sol/üst etiket
    s+='<text class="at-axis" x="'+(L-8)+'" y="16" text-anchor="end">bakan ↓</text>';
    s+='<text class="at-axis" x="'+(L+n*C+8)+'" y="'+(T-10)+'" text-anchor="start">← bakılan</text>';
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    svg.innerHTML=s;
    svg.querySelectorAll('[data-row]').forEach(t=>{ t.style.cursor='pointer'; t.addEventListener('click',()=>{ sel=(sel===+t.dataset.row)?null:+t.dataset.row; draw(); info(); }); });
    // ısı haritasındaki hücreye tıkla da satır seçsin
  }
  function info(){
    const {S,n,A}=compute();
    if(sel===null){
      wk.innerHTML='<b>Nasıl okunur:</b> her <b>satır</b> = o kelimenin dikkat dağılımı (toplam %100). Koyu yeşil = çok dikkat.\nBir kelimeye (soldaki etiket) <b>tıkla</b> → sadece onu izle + ağırlıklı çıktısını gör.\n\nDiyagonal (kendine bakış) genelde güçlüdür; ilgili kelimeler de öne çıkar.';
      return;
    }
    const row=A[sel];
    // ağırlıklı V çıktısı
    let ox=0, oy=0; for(let j=0;j<n;j++){ ox+=row[j]*S.emb[j][0]; oy+=row[j]*S.emb[j][1]; }
    const rank=S.toks.map((t,j)=>({t,w:row[j]})).sort((a,b)=>b.w-a.w);
    wk.innerHTML='<b style="color:#46c46a">"'+S.toks[sel]+'"</b> dikkatini nereye veriyor:\n'
      + rank.map(r=>'  '+(r.t+'      ').slice(0,7)+' %'+Math.round(r.w*100)+'  '+'█'.repeat(Math.round(r.w*20))).join('\n')
      + '\n\n→ En çok <b>"'+rank[0].t+'"</b>ya bakıyor.\n→ Yeni (bağlamsal) temsili = Σ ağırlık×V = <b>('+F(ox)+', '+F(oy)+')</b>\n   yani komşularından yüzdeli bilgi çekilmiş hâli.';
  }
  document.querySelectorAll('.atSent').forEach(b=>b.addEventListener('click',()=>{
    si=+b.dataset.s; sel=null;
    document.querySelectorAll('.atSent').forEach(x=>{ x.style.background='var(--panel)'; x.style.color='var(--text)'; x.style.border='1px solid var(--line)'; });
    b.style.background='var(--blue)'; b.style.color='#fff'; b.style.border='none';
    draw(); info();
  }));
  document.getElementById('atScale').addEventListener('change',e=>{ scale=e.target.checked; draw(); info(); });
  draw(); info();
})();

/* ---- eğlence paketi: unlock animasyonu + Eureka + Harikalar + export/import ---- */
(function(){
  if(!document.getElementById('techWonders')) return;
  const F=v=>v;

  // Eureka boost soruları (konuya başlamadan bilirsen ⚡)
  const BOOST={
    mat:{q:'e sayısının en meşhur özelliği: eˣ\'in türevi nedir?', a:'eˣ — kendi türevidir.'},
    vek:{q:'Birbirine dik iki vektörün nokta çarpımı kaçtır?', a:'0 (cos90°=0).'},
    lin:{q:'Gradyan alçalmada "öğrenmek" hangi yöne yürümektir?', a:'Türevin tersine — yokuş aşağı (hatanın azaldığı yön).'},
    akt:{q:'Sigmoid türevinin (σ(1−σ)) alabileceği en büyük değer?', a:'0.25 (z=0\'da).'},
    rnn:{q:'RNN\'i basit ağdan ayıran, diziyi işlemesini sağlayan şey?', a:'Hafıza — gizli durum hₜ.'},
    emb:{q:'"kral − erkek + kadın" vektör aritmetiği neye yaklaşır?', a:'kraliçe.'},
    van:{q:'Geriye akan gradyan çarpanı sürekli <1 ise uzun dizide ne olur?', a:'Söner → vanishing gradient.'},
    soft:{q:'Softmax çıktılarının toplamı her zaman kaçtır?', a:'1 (bir olasılık dağılımıdır).'},
    lstm:{q:'LSTM\'de gradyanı bozulmadan taşıyan "otoyol" neresi?', a:'Cell state (c) — kapılarla korunan hafıza hattı.'},
    s2s:{q:'Koca cümleyi tek vektöre sıkıştırmanın yarattığı sorun?', a:'Bilgi darboğazı (uzun cümlede kayıp).'},
    att:{q:'QKᵀ matrisinin bir hücresi neyi ölçer?', a:'İki kelimenin benzerliğini (nokta çarpım).'},
    mha:{q:'Multi-head, tek attention yerine ne yapar?', a:'Aynı anda birçok paralel "bakış" (kafa) çalıştırır.'},
    pos:{q:'Recurrence atılınca hangi bilgi eksik kalır, nasıl eklenir?', a:'Sıra bilgisi — sinüs/kosinüs positional encoding ile.'},
    blk:{q:'"x + F(x)" (girdiyi geçir, üstüne düzeltme ekle) fikrinin adı?', a:'Residual (artık) bağlantı.'},
    paper:{q:'"Attention Is All You Need" hangi yıl yayımlandı?', a:'2017.'},
    llm:{q:'GPT tarzı model temelde neyi tahmin ederek eğitilir?', a:'Sonraki kelimeyi (next-token).'}
  };
  const EK='attn_eureka';
  let eureka; try{ eureka=new Set(JSON.parse(localStorage.getItem(EK)||'[]')); }catch(e){ eureka=new Set(); }
  const saveEk=()=>{ try{ localStorage.setItem(EK, JSON.stringify([...eureka])); }catch(e){} };

  // --- toast + konfeti + unlock parlaması ---
  function toast(msg){
    const d=document.createElement('div'); d.className='tt-toast'; d.innerHTML=msg;
    document.body.appendChild(d); setTimeout(()=>d.remove(),3300);
  }
  function confetti(){
    const cols=['#f0a032','#46c46a','#3a7afe','#e06a6a','#ffd24a'];
    for(let i=0;i<18;i++){
      const c=document.createElement('div'); c.className='tt-confetti';
      c.style.left=(45+Math.random()*10)+'vw';
      c.style.background=cols[i%cols.length];
      c.style.animationDelay=(Math.random()*0.25)+'s';
      c.style.transform='translateX('+(Math.random()*200-100)+'px)';
      document.body.appendChild(c); setTimeout(()=>c.remove(),1900);
    }
  }
  window.__ttOnUnlock=function(ids){
    const names=ids.map(id=>{ const n=(window.__ttAPI.NODES).find(x=>x.id===id); return n?n.nm:id; });
    toast('🎉 <b>Yeni teknoloji araştırılabilir!</b><br>'+names.join(' · '));
    confetti();
    ids.forEach(id=>{ const g=document.querySelector('#techSvg .tn[data-id="'+id+'"]'); if(g){ g.classList.add('justUnlocked'); setTimeout(()=>g.classList.remove('justUnlocked'),2200); } });
  };

  // --- Eureka kutusu (düğüm panelinde) ---
  window.__ttAfterShow=function(n, st, info){
    renderWonders();
    const b=BOOST[n.id]; if(!b) return;
    const got=eureka.has(n.id);
    let h='<div style="margin-top:12px; border-top:1px dashed var(--line); padding-top:10px">'
      +'<div style="font-size:12px; color:#ffd24a; font-weight:700">⚡ EUREKA — konuya başlamadan bil, rozet kap'+(got?' ✓ kazanıldı':'')+'</div>'
      +'<div style="font-size:13px; color:#cfd3d8; margin:6px 0">'+b.q+'</div>';
    if(!got){
      h+='<button class="addbtn" id="ekReveal" style="background:var(--panel); color:var(--accent); border:1px solid var(--accent); font-size:12px; padding:4px 10px">Cevabı gör</button>'
        +' <button class="addbtn" id="ekGot" style="background:#ffd24a; color:#1f2023; font-size:12px; padding:4px 10px">✅ Bildim → ⚡ kap</button>'
        +'<div id="ekAns" style="display:none; margin-top:8px; background:#2a2416; border-left:3px solid #ffd24a; padding:8px 12px; border-radius:4px; font-size:13px">'+b.a+'</div>';
    } else {
      h+='<div style="font-size:13px; color:#46c46a">⚡ Bu teknolojiyi önceden sezmiştin — cevap: '+b.a+'</div>';
    }
    h+='</div>';
    info.insertAdjacentHTML('beforeend', h);
    const rv=document.getElementById('ekReveal'), gt=document.getElementById('ekGot');
    if(rv) rv.addEventListener('click',()=>{ document.getElementById('ekAns').style.display='block'; });
    if(gt) gt.addEventListener('click',()=>{ eureka.add(n.id); saveEk(); toast('⚡ <b>Eureka!</b> '+n.nm+' önceden sezildi.'); confetti(); window.__ttShow(n.id); });
  };

  // --- Harikalar paneli ---
  function renderWonders(){
    const box=document.getElementById('techWonders'); if(!box) return;
    const NODES=window.__ttAPI.NODES, done=window.__ttGet().done;
    const built=NODES.filter(n=>done.includes(n.id)).length;
    let s='<div style="font-size:14px; margin-bottom:10px">🏛️ İnşa edilen harika: <b style="color:#46c46a">'+built+'/'+NODES.length+'</b>'
      +' &nbsp;·&nbsp; ⚡ Eureka: <b style="color:#ffd24a">'+eureka.size+'/'+Object.keys(BOOST).length+'</b></div>';
    s+='<div class="wond-grid">'+NODES.map(n=>{
      const on=done.includes(n.id), w=n.real&&n.real[0]?n.real[0]:['🔧',n.nm];
      return '<div class="wond'+(on?' built':'')+'" title="'+n.nm.replace(/"/g,'')+'">'+w[0]+' '+(on?w[1]:'<span style="color:var(--muted)">— kilitli —</span>')+'</div>';
    }).join('')+'</div>';
    box.innerHTML=s;
  }

  // --- export / import ---
  const io=document.getElementById('ttIO');
  document.getElementById('ttExport').addEventListener('click',()=>{
    const st=window.__ttGet();
    io.value=JSON.stringify({d:st.done, s:st.subs, e:[...eureka]});
    io.select();
    try{ navigator.clipboard.writeText(io.value); }catch(e){}
    toast('📤 İlerleme kodu kutuya yazıldı (kopyalandı).');
  });
  document.getElementById('ttImport').addEventListener('click',()=>{
    try{
      const o=JSON.parse(io.value);
      window.__ttImport(o.d||[], o.s||[]);
      eureka=new Set(o.e||[]); saveEk();
      renderWonders();
      toast('📥 İlerleme yüklendi.');
    }catch(e){ toast('⚠️ Kod okunamadı — metni kontrol et.'); }
  });

  renderWonders();
})();

/* ---- multi-head: 3 kafa ısı haritası (ayrı WQ/WK) ---- */
(function(){
  const svg=document.getElementById('mhSvg'); if(!svg) return;
  const wk=document.getElementById('mhWork');
  const toks=['kedi','kuyruk','salladı','çünkü'];
  const emb=[[1.0,0.3],[0.6,0.9],[0.9,0.5],[-0.7,-0.4]];
  const HEADS=[
    {nm:'Kafa 1 · içerik',  col:'#3a7afe', WQ:[[1,0],[0,1]], WK:[[1,0],[0,1]]},
    {nm:'Kafa 2 · ilişki A', col:'#46c46a', WQ:[[1,0],[0,1]], WK:[[0.3,1.3],[-1.3,0.3]]},
    {nm:'Kafa 3 · ilişki B', col:'#f0a032', WQ:[[1,0],[0,1]], WK:[[2.2,0],[0.3,0.1]]}
  ];
  let sel=null;
  const n=toks.length;
  const mul=(W,e)=>[W[0][0]*e[0]+W[0][1]*e[1], W[1][0]*e[0]+W[1][1]*e[1]];
  function attn(h){
    const q=emb.map(e=>mul(h.WQ,e)), k=emb.map(e=>mul(h.WK,e));
    return q.map(qi=>{ const raw=k.map(kj=>(qi[0]*kj[0]+qi[1]*kj[1])/Math.SQRT2);
      const m=Math.max(...raw), ex=raw.map(v=>Math.exp(v-m)), t=ex.reduce((a,b)=>a+b,0); return ex.map(v=>v/t); });
  }
  const mats=HEADS.map(attn);

  function draw(){
    const RL=76, T=34, C=34, GAP=26, GW=n*C;
    const W=RL+HEADS.length*(GW+GAP), H=T+n*C+14;
    let s='';
    HEADS.forEach((h,g)=>{
      const gx=RL+g*(GW+GAP);
      s+='<text x="'+(gx+GW/2)+'" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="'+h.col+'">'+h.nm+'</text>';
      for(let j=0;j<n;j++) s+='<text x="'+(gx+j*C+C/2)+'" y="'+(T-4)+'" text-anchor="middle" font-size="9" fill="#8a9097">'+toks[j].slice(0,3)+'</text>';
      for(let i=0;i<n;i++){
        const dim=(sel!==null&&sel!==i);
        for(let j=0;j<n;j++){
          const w=mats[g][i][j];
          const op=dim?0.1:(0.12+0.82*w);
          s+='<rect x="'+(gx+j*C)+'" y="'+(T+i*C)+'" width="'+(C-3)+'" height="'+(C-3)+'" rx="4" fill="'+h.col+'" opacity="'+op+'"'+(i===j?' stroke="#e7e9ec" stroke-width="0.8"':'')+'/>';
          s+='<text x="'+(gx+j*C+(C-3)/2)+'" y="'+(T+i*C+(C-3)/2+4)+'" text-anchor="middle" font-size="10" font-weight="700" fill="#0a1420" opacity="'+(dim?0.35:1)+'">'+Math.round(w*100)+'</text>';
        }
      }
    });
    for(let i=0;i<n;i++){
      s+='<text class="mh-row" data-row="'+i+'" x="'+(RL-8)+'" y="'+(T+i*C+C/2+4)+'" text-anchor="end" font-size="12" fill="'+(sel===i?'#ffd24a':'#e7e9ec')+'" font-weight="'+(sel===i?'700':'400')+'">'+toks[i]+'</text>';
    }
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    svg.innerHTML=s;
    svg.querySelectorAll('[data-row]').forEach(t=>{ t.style.cursor='pointer'; t.addEventListener('click',()=>{ sel=(sel===+t.dataset.row)?null:+t.dataset.row; draw(); info(); }); });
  }
  function info(){
    if(sel===null){ wk.innerHTML='<b>Bir kelimeye tıkla</b> (soldaki etiket) → o kelimenin <b>3 kafada</b> nereye baktığını gör.\n💡 İpucu: <b>"salladı"</b>ya tıkla — üç kafada üç farklı yere bakıyor!'; return; }
    const lines=HEADS.map((h,g)=>{
      const best=mats[g][sel].map((w,j)=>({t:toks[j],w})).sort((a,b)=>b.w-a.w)[0];
      return '  '+(h.nm+'                ').slice(0,18)+' → <b>'+best.t+'</b> (%'+Math.round(best.w*100)+')';
    });
    let extra='';
    if(toks[sel]==='salladı') extra='\n\n🎯 <b>"salladı"</b> (eylem): Kafa 1 kendine, Kafa 2 <b>kuyruğa</b> (nesnesi!), Kafa 3 <b>kediye</b> (öznesi!) bakıyor. Bir eylem, üç ilişki — tek kafa bunu asla ayıramazdı.';
    wk.innerHTML='<b style="color:#ffd24a">"'+toks[sel]+'"</b> her kafada en çok nereye bakıyor:\n'+lines.join('\n')
      +extra+'\n\n→ Sonra <b>Concat + W_O</b> üçünü tek zengin temsile birleştirir.';
  }
  draw(); info();
})();
