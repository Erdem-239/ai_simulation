/* XOR modülü — "Gizli nöronlar ne öğrendi?" kartı.
   window.XORNET (js/lesson-xor-epoch.js her render'da yazar) ağırlıklarını okur;
   her nöronun girdi uzayındaki (x1,x2) aktivasyon haritasını + kararsızlık çizgisini,
   ve gizli uzaydaki (h1,h2) dönüşümü çizer. epoch ilerledikçe canlı güncellenir. */
(function(){
  'use strict';
  const c1=document.getElementById('xmH1'); if(!c1) return;
  const cv={h1:c1,h2:document.getElementById('xmH2'),out:document.getElementById('xmOut'),hs:document.getElementById('xmHS')};
  const X=[[0,0],[0,1],[1,0],[1,1]], Y=[0,1,1,0];
  const LO=-0.5, HI=1.5;
  const sig=z=>1/(1+Math.exp(-z));
  const $=id=>document.getElementById(id);
  const fmt=(v,d)=>(Object.is(Math.round(v*10**d)/10**d,-0)?0:v).toFixed(d).replace('-','−');
  const FALLBACK={W1:[[1.3,-0.3],[-1.4,1.0]],B1:[-1.2,0.25],W2:[1.2,-0.9],B2:-1.2,epoch:0};
  const net=()=>window.XORNET||FALLBACK;

  /* hangi mantık kapısına benziyor? (4 noktadaki 0/1 çıktıdan) */
  const GATES=[
    ['VEYA (OR)',[0,1,1,1]],['VE (AND)',[0,0,0,1]],['VE DEĞİL (NAND)',[1,1,1,0]],['YA DA DEĞİL (NOR)',[1,0,0,0]],
    ['sadece x₁',[0,0,1,1]],['sadece x₂',[0,1,0,1]],['x₁ değil',[1,1,0,0]],['x₂ değil',[1,0,1,0]],
    ['XOR',[0,1,1,0]],['hep 0',[0,0,0,0]],['hep 1',[1,1,1,1]]];
  function gateOf(acts){
    const b=acts.map(a=>a>=0.5?1:0);
    for(const [n,t] of GATES) if(t.every((v,i)=>v===b[i])) return n;
    return '?';
  }

  const px=(v,W)=>(v-LO)/(HI-LO)*W;
  const py=(v,H)=>H-(v-LO)/(HI-LO)*H;

  function heat(cv,fn,rgb){
    const W=cv.width,H=cv.height,ctx=cv.getContext('2d');
    const n=44, off=document.createElement('canvas'); off.width=n; off.height=n;
    const o=off.getContext('2d'), id=o.createImageData(n,n);
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){
      const x1=LO+(i+.5)/n*(HI-LO), x2=HI-(j+.5)/n*(HI-LO);
      const a=Math.max(0,Math.min(1,fn(x1,x2)));
      const k=(j*n+i)*4;
      id.data[k]=18+(rgb[0]-18)*a; id.data[k+1]=24+(rgb[1]-24)*a; id.data[k+2]=44+(rgb[2]-44)*a; id.data[k+3]=255;
    }
    o.putImageData(id,0,0);
    ctx.imageSmoothingEnabled=true; ctx.clearRect(0,0,W,H); ctx.drawImage(off,0,0,W,H);
    // eksen çizgileri (0 ve 1)
    ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=1;
    [0,1].forEach(v=>{ctx.beginPath();ctx.moveTo(px(v,W),0);ctx.lineTo(px(v,W),H);ctx.stroke();ctx.beginPath();ctx.moveTo(0,py(v,H));ctx.lineTo(W,py(v,H));ctx.stroke();});
  }
  /* a·u + b·v + c = 0 doğrusu (karar sınırı) */
  function line(cv,a,b,c){
    const W=cv.width,H=cv.height,ctx=cv.getContext('2d'); const pts=[];
    const at=(u,v)=>[px(u,W),py(v,H)];
    if(Math.abs(b)>1e-9){ [LO,HI].forEach(u=>{const v=-(a*u+c)/b; pts.push(at(u,v));}); }
    else if(Math.abs(a)>1e-9){ const u=-c/a; pts.push(at(u,LO),at(u,HI)); }
    if(pts.length<2) return;
    ctx.save(); ctx.setLineDash([6,4]); ctx.strokeStyle='#fff'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); ctx.lineTo(pts[1][0],pts[1][1]); ctx.stroke(); ctx.restore();
  }
  function dots(cv,P,labels){
    const W=cv.width,H=cv.height,ctx=cv.getContext('2d');
    P.forEach((p,i)=>{
      const x=px(p[0],W),y=py(p[1],H);
      ctx.beginPath(); ctx.arc(x,y,9,0,7); ctx.fillStyle=Y[i]?'#ffd24a':'#5aa0e0'; ctx.fill();
      ctx.lineWidth=2; ctx.strokeStyle='#0c1224'; ctx.stroke();
      ctx.fillStyle='#0c1224'; ctx.font='bold 10px Segoe UI, Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(labels?labels[i]:String(Y[i]),x,y+.5);
    });
  }
  function axes(cv,xl,yl){
    const W=cv.width,H=cv.height,ctx=cv.getContext('2d');
    ctx.fillStyle='#8fa0c4'; ctx.font='11px Segoe UI, Arial'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillText(xl,W-14,H-5); ctx.textAlign='left'; ctx.fillText(yl,5,13);
  }

  function render(){
    const n=net(), W1=n.W1,B1=n.B1,W2=n.W2,B2=n.B2;
    const hAt=(k,x1,x2)=>sig(W1[k][0]*x1+W1[k][1]*x2+B1[k]);
    const info=[];
    [0,1].forEach(k=>{
      const c=cv[k?'h2':'h1'];
      heat(c,(x1,x2)=>hAt(k,x1,x2),[240,160,50]);
      line(c,W1[k][0],W1[k][1],B1[k]);
      dots(c,X); axes(c,'x₁','x₂');
      const acts=X.map(x=>hAt(k,x[0],x[1]));
      const g=gateOf(acts);
      $('xmT'+(k+1)).innerHTML=
        '<div class="xm-eq">z = <b style="color:'+(W1[k][0]>=0?'#46c46a':'#e06a6a')+'">'+fmt(W1[k][0],2)+'</b>·x₁ + <b style="color:'+(W1[k][1]>=0?'#46c46a':'#e06a6a')+'">'+fmt(W1[k][1],2)+'</b>·x₂ + <b style="color:#c9a0ff">'+fmt(B1[k],2)+'</b></div>'+
        '<div class="xm-act">(0,0)→'+fmt(acts[0],2)+' · (0,1)→'+fmt(acts[1],2)+' · (1,0)→'+fmt(acts[2],2)+' · (1,1)→'+fmt(acts[3],2)+'</div>'+
        '<div class="xm-gate">Şu an bu nöron ≈ <b>'+g+'</b> gibi davranıyor</div>';
    });
    // çıktı: girdi uzayında nihai p
    heat(cv.out,(x1,x2)=>sig(W2[0]*hAt(0,x1,x2)+W2[1]*hAt(1,x1,x2)+B2),[70,196,106]);
    dots(cv.out,X); axes(cv.out,'x₁','x₂');
    const ps=X.map(x=>sig(W2[0]*hAt(0,x[0],x[1])+W2[1]*hAt(1,x[0],x[1])+B2));
    $('xmTo').innerHTML='<div class="xm-eq">p = σ( '+fmt(W2[0],2)+'·h₁ + '+fmt(W2[1],2)+'·h₂ + '+fmt(B2,2)+' )</div>'+
      '<div class="xm-act">(0,0)→'+fmt(ps[0],2)+' · (0,1)→'+fmt(ps[1],2)+' · (1,0)→'+fmt(ps[2],2)+' · (1,1)→'+fmt(ps[3],2)+'</div>'+
      '<div class="xm-gate">Hedef: 0 · 1 · 1 · 0 — ağ girdi uzayını <b>kıvrımlı</b> bir şekilde bölüyor</div>';
    // gizli uzay (h1,h2): noktalar nereye taşındı, çıktı doğrusu
    const H=X.map(x=>[hAt(0,x[0],x[1]),hAt(1,x[0],x[1])]);
    const c=cv.hs, W=c.width,Hh=c.height,ctx=c.getContext('2d');
    ctx.clearRect(0,0,W,Hh);
    heat(c,(u,v)=>sig(W2[0]*u+W2[1]*v+B2),[70,196,106]);
    // gizli uzayda eksen aralığı da [-0.5,1.5] kullanıldığı için sigmoid çıktısı 0-1 dışında da tanımlı
    line(c,W2[0],W2[1],B2);
    dots(c,H,['(0,0)','(0,1)','(1,0)','(1,1)'].map(s=>'')); axes(c,'h₁','h₂');
    // etiketler
    ctx.font='bold 10px Segoe UI, Arial'; ctx.textAlign='left'; ctx.textBaseline='middle';
    H.forEach((p,i)=>{const lab='('+X[i][0]+','+X[i][1]+')'; const x=px(p[0],W),y=py(p[1],Hh);
      ctx.fillStyle='#e6ecff'; ctx.fillText(lab,Math.min(x+12,W-40),i%2?y+15:y-13);});
    const sep=H.every((p,i)=>((W2[0]*p[0]+W2[1]*p[1]+B2)>0)===(Y[i]===1));
    const dd=Math.hypot(H[1][0]-H[2][0],H[1][1]-H[2][1]);
    $('xmTs').innerHTML='<div class="xm-eq">'+(dd<0.2?'(0,1) ve (1,0) neredeyse AYNI yere taşındı (iki "1" yan yana)':'(0,1) ve (1,0) henüz ayrı yerlerde')+'</div>'+
      '<div class="xm-act">h(0,0)=('+fmt(H[0][0],2)+', '+fmt(H[0][1],2)+') · h(0,1)=('+fmt(H[1][0],2)+', '+fmt(H[1][1],2)+') · h(1,0)=('+fmt(H[2][0],2)+', '+fmt(H[2][1],2)+') · h(1,1)=('+fmt(H[3][0],2)+', '+fmt(H[3][1],2)+')</div>'+
      '<div class="xm-gate">'+(sep?'✅ Bu yeni uzayda <b>tek bir düz çizgi</b> 0\'ları ve 1\'leri ayırıyor':'⏳ Henüz tek çizgiyle ayrılamıyor — eğitim devam ediyor')+'</div>';
  }
  window.__xorMapsRender=render;
  render();
})();
