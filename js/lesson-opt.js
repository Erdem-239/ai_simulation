// ⚡ Optimizerlar dersi (#model-opt):
//  Simülasyon: aynı kayıp yüzeyinde GD / Momentum / Adam yan yana, isteğe bağlı mini-batch gürültüsü,
//              canlı "adım adım" ve sözel anlatım kutuları.
//  Ekstra: öğrenme hızı takvimi (warmup + kosinüs).
//  Örnek Çalışmalar: (1) XOR'da 5 ayar × 12 başlangıç — hız ↔ güvenilirlik,
//                    (2) mini-batch: aynı veri, yığın boyu 8 / 2 / 1,
//                    (3) Adam her ağırlığa kendi adımını verir (dik ve yatık iki ağırlık).
// Örnek sayıları sayfadaki Python kutularıyla birebir aynı (Python'da çalıştırılıp doğrulandı).
(function(){
  const host=document.getElementById('optSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const fm=(v,d=3)=>{if(!isFinite(v))return '∞';v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};

  /* ================= SİMÜLASYON ================= */
  const SURF={
    vadi:{nm:'dar vadi', f:(x,y)=>0.05*x*x+2*y*y, g:(x,y)=>[0.1*x,4*y], box:[-10,10,-3,3], start:[-9,1.5], min:[0,0],
      a:{gd:0.4,mom:0.1,adam:0.3}, txt:'Bir yönde çok dik (y), öbür yönde çok yatık (x) bir vadi: derin öğrenmede kayıp yüzeyleri çoğu zaman böyledir.'},
    muz:{nm:'muz vadisi (Rosenbrock)', f:(x,y)=>(1-x)*(1-x)+10*(y-x*x)*(y-x*x), g:(x,y)=>[-2*(1-x)-40*x*(y-x*x),20*(y-x*x)], box:[-2,2,-1,3], start:[-1.5,2.5], min:[1,1],
      a:{gd:0.01,mom:0.004,adam:0.05}, txt:'Kıvrılan dar bir oluk: dibe inmek kolay, oluğun içinde (1,1) noktasına yürümek zor.'}
  };
  const OPT=[{k:'gd',nm:'GD',c:'#5aa0ff'},{k:'mom',nm:'Momentum',c:'#f0a032'},{k:'adam',nm:'Adam',c:'#46c46a'}];
  let S={surf:'vadi',beta:0.9,noise:0,alpha:{},on:{gd:true,mom:true,adam:true},sel:'adam',runs:{},timer:null,t:0};
  const W=520,H=340,cv=$('optCv'),ctx=cv.getContext('2d');
  let bg=null;
  function toPx(x,y){const b=SURF[S.surf].box;return [(x-b[0])/(b[1]-b[0])*W,H-(y-b[2])/(b[3]-b[2])*H];}
  function toW(px,py){const b=SURF[S.surf].box;return [b[0]+px/W*(b[1]-b[0]),b[2]+(H-py)/H*(b[3]-b[2])];}
  function makeBg(){
    const s=SURF[S.surf],im=ctx.createImageData(W,H);let mx=0;const vals=new Float32Array(W*H);
    for(let j=0;j<H;j++)for(let i=0;i<W;i++){const [x,y]=toW(i,j);const v=Math.log(1+s.f(x,y));vals[j*W+i]=v;if(v>mx)mx=v;}
    for(let k=0;k<W*H;k++){const t=vals[k]/mx;const band=(Math.floor(t*14)%2)?0.92:1;
      im.data[4*k]=Math.round((18+70*t)*band);im.data[4*k+1]=Math.round((26+40*(1-t))*band);im.data[4*k+2]=Math.round((60+90*(1-t))*band);im.data[4*k+3]=255;}
    bg=im;
  }
  // tohumlu gürültü (mini-batch taklidi)
  function rng(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};}
  function gauss(r){const u=Math.max(r(),1e-12),v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
  function reset(){
    const st=SURF[S.surf].start;S.t=0;
    OPT.forEach((o,i)=>{S.runs[o.k]={p:[st[0],st[1]],m:[0,0],v:[0,0],path:[[st[0],st[1]]],last:null,r:rng(11+i*7)};});
    draw();
  }
  function stepAll(){
    const s=SURF[S.surf];S.t++;
    OPT.forEach(o=>{
      if(!S.on[o.k])return;const R=S.runs[o.k];if(!isFinite(R.p[0])||Math.abs(R.p[0])>1e6)return;
      let g=s.g(R.p[0],R.p[1]);
      if(S.noise>0){g=[g[0]+S.noise*gauss(R.r)*(1+Math.abs(g[0])),g[1]+S.noise*gauss(R.r)*(1+Math.abs(g[1]))];}
      const a=S.alpha[o.k],t=S.t,old=[R.p[0],R.p[1]],info={g:g.slice(),a};
      if(o.k==='gd'){R.p=[R.p[0]-a*g[0],R.p[1]-a*g[1]];}
      else if(o.k==='mom'){R.m=[S.beta*R.m[0]+g[0],S.beta*R.m[1]+g[1]];R.p=[R.p[0]-a*R.m[0],R.p[1]-a*R.m[1]];info.m=R.m.slice();}
      else{const b1=0.9,b2=0.999,eps=1e-8,st=[0,0];
        for(let i=0;i<2;i++){R.m[i]=b1*R.m[i]+(1-b1)*g[i];R.v[i]=b2*R.v[i]+(1-b2)*g[i]*g[i];const mh=R.m[i]/(1-Math.pow(b1,t)),vh=R.v[i]/(1-Math.pow(b2,t));st[i]=a*mh/(Math.sqrt(vh)+eps);}
        R.p=[R.p[0]-st[0],R.p[1]-st[1]];info.m=R.m.slice();info.v=R.v.slice();info.st=st;}
      info.old=old;info.nw=R.p.slice();R.last=info;R.path.push(R.p.slice());
    });
    draw();
  }
  function flips(path,ax){let n=0;const L=path.length;for(let i=Math.max(2,L-20);i<L;i++){const d1=path[i][ax]-path[i-1][ax],d0=path[i-1][ax]-path[i-2][ax];if(d1*d0<0)n++;}return n;}
  function draw(){
    if(!bg)makeBg();ctx.putImageData(bg,0,0);
    const s=SURF[S.surf],[mx,my]=toPx(s.min[0],s.min[1]);
    ctx.fillStyle='#fff';ctx.font='bold 14px sans-serif';ctx.fillText('★',mx-6,my+5);
    OPT.forEach(o=>{if(!S.on[o.k])return;const R=S.runs[o.k];ctx.strokeStyle=o.c;ctx.lineWidth=2;ctx.beginPath();
      R.path.forEach((p,i)=>{const [px,py]=toPx(Math.max(-1e4,Math.min(1e4,p[0])),Math.max(-1e4,Math.min(1e4,p[1])));i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.stroke();
      const [px,py]=toPx(R.p[0],R.p[1]);ctx.fillStyle=o.c;ctx.beginPath();ctx.arc(px,py,5,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();});
    const [sx,sy]=toPx(s.start[0],s.start[1]);ctx.strokeStyle='#fff';ctx.strokeRect(sx-4,sy-4,8,8);
    // tablo
    let t='<table class="rex-tbl"><tr><th>optimizer</th><th>α</th><th>konum (x ; y)</th><th>kayıp</th><th>son 20 adımda y yön değiştirdi</th></tr>';
    OPT.forEach(o=>{const R=S.runs[o.k];const L=s.f(R.p[0],R.p[1]);const bad=!(L<1e6);
      t+='<tr style="opacity:'+(S.on[o.k]?1:.4)+'"><td><span class="nl-sw" style="background:'+o.c+'"></span><b>'+o.nm+'</b></td><td>'+fm(S.alpha[o.k],3)+'</td><td>'+(bad?'çok uzakta':fm(R.p[0],3)+' ; '+fm(R.p[1],3))+'</td><td><b>'+(L>1e6?'patladı':fm(L,4))+'</b></td><td>'+flips(R.path,1)+' kez</td></tr>';});
    $('optTbl').innerHTML=t+'</table><div class="nl-legend">adım: <b>'+S.t+'</b> · ★ = en dip nokta · beyaz kare = başlangıç (grafiğe tıklayarak değiştir)</div>';
    teach();
  }
  function teach(){
    const s=SURF[S.surf],o=OPT.find(q=>q.k===S.sel),R=S.runs[o.k],I=R.last;
    let st='';
    if(!I){st='Henüz adım atılmadı. <b>▶ 1 adım</b>\'a bas: burada seçili optimizerın ('+o.nm+') o adımda yaptığı hesap sayılarla yazılacak.';}
    else{
      const gx=fm(I.g[0],3),gy=fm(I.g[1],3);
      st='① Bulunduğu nokta ('+fm(I.old[0],3)+' ; '+fm(I.old[1],3)+'), eğim (gradyan) g = ('+gx+' ; '+gy+')'+(S.noise>0?' <i>(gürültülü: mini-batch taklidi)</i>':'')+'<br>';
      if(o.k==='gd')st+='② Adım = α·g = '+fm(I.a,3)+'·('+gx+' ; '+gy+') = ('+fm(I.a*I.g[0],3)+' ; '+fm(I.a*I.g[1],3)+')<br>③ Yeni nokta = eski − adım = <b>('+fm(I.nw[0],3)+' ; '+fm(I.nw[1],3)+')</b>';
      else if(o.k==='mom')st+='② Hız: v = β·v + g = ('+fm(I.m[0],3)+' ; '+fm(I.m[1],3)+')  (β = '+fm(S.beta,2)+')<br>③ Adım = α·v, yeni nokta = <b>('+fm(I.nw[0],3)+' ; '+fm(I.nw[1],3)+')</b>';
      else st+='② Ortalama yön m = 0,9·m + 0,1·g = ('+fm(I.m[0],4)+' ; '+fm(I.m[1],4)+')<br>③ Ortalama büyüklük v = 0,999·v + 0,001·g² = ('+fm(I.v[0],5)+' ; '+fm(I.v[1],5)+')<br>④ Adım = α·m̂/√v̂ = ('+fm(I.st[0],4)+' ; '+fm(I.st[1],4)+')  → yeni nokta <b>('+fm(I.nw[0],3)+' ; '+fm(I.nw[1],3)+')</b>';
    }
    $('optStep').innerHTML='<b class="h">✏️ Adım adım — '+o.nm+' (son adım)</b>'+st;
    // canlı sözel
    let sz='';
    if(S.t===0)sz=s.txt+' Üç top aynı noktadan bırakılacak; renkli izler hangi yoldan indiklerini gösterecek.';
    else{
      const Ls=OPT.filter(q=>S.on[q.k]).map(q=>({q,L:s.f(S.runs[q.k].p[0],S.runs[q.k].p[1])})).sort((a,b)=>a.L-b.L);
      if(Ls.length)sz='Şu an en aşağıda <b>'+Ls[0].q.nm+'</b> (kayıp '+fm(Ls[0].L,4)+')'+(Ls.length>1?', en yukarıda <b>'+Ls[Ls.length-1].q.nm+'</b> ('+(Ls[Ls.length-1].L>1e6?'patladı':fm(Ls[Ls.length-1].L,4))+')':'')+'. ';
      const g=S.runs.gd,gL=s.f(g.p[0],g.p[1]);if(S.on.gd&&!(gL<1e6))sz+='GD <b>patladı</b>: α bu yüzey için fazla büyük, her adım bir öncekinden daha uzağa fırlattı (kaydırıcıyı küçült, ↺ baştan). ';
      else if(S.on.gd&&g.path.length>3){const f=flips(g.path,1);sz+=f>5?'GD dik yönde (y) zikzak çiziyor: son 20 adımda '+f+' kez yön değiştirdi — eğim büyük olduğu için her adım karşı yamaca aşıyor, yatık yönde (x) ise neredeyse ilerlemiyor. ':'GD şu an düzgün iniyor. ';}
      if(S.on.mom)sz+='Momentum bir top gibi hız biriktiriyor: zikzaklar birbirini götürüyor, aynı yöne giden adımlar birikiyor. ';
      if(S.on.adam&&S.runs.adam.last&&S.runs.adam.last.st){const a=S.runs.adam.last.st;sz+='Adam her eksene kendi adımını veriyor: son adım x\'te '+fm(Math.abs(a[0]),3)+', y\'de '+fm(Math.abs(a[1]),3)+' — eğim büyüklüğü farklı olsa da adımlar aynı mertebede.';}
      if(S.noise>0)sz+=' Gürültü açık: her adımda eğim biraz yanlış ölçülüyor (mini-batch böyle çalışır); izler titriyor ama genel yön doğru.';
    }
    $('optSoz').innerHTML='<b class="h">🗣️ Ne anlama geliyor? (canlı)</b>'+sz;
  }
  function setSurf(k){S.surf=k;bg=null;Object.assign(S.alpha,SURF[k].a);OPT.forEach(o=>{$('optA_'+o.k).value=S.alpha[o.k];});
    document.querySelectorAll('.opt-surf').forEach(b=>b.classList.toggle('on',b.dataset.s===k));stop();reset();}
  function stop(){if(S.timer){clearInterval(S.timer);S.timer=null;}}
  host.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.classList.contains('opt-surf'))setSurf(b.dataset.s);
    else if(b.id==='optStep1'){stop();stepAll();}
    else if(b.id==='optStep10'){stop();for(let i=0;i<10;i++)stepAll();}
    else if(b.id==='optPlay'){if(S.timer)stop();else S.timer=setInterval(()=>{stepAll();if(S.t>=600)stop();},60);}
    else if(b.id==='optReset'){stop();reset();}
    else if(b.classList.contains('opt-sel')){S.sel=b.dataset.k;document.querySelectorAll('.opt-sel').forEach(x=>x.classList.toggle('on',x===b));teach();}
  });
  OPT.forEach(o=>{
    $('optA_'+o.k).addEventListener('input',e=>{S.alpha[o.k]=+e.target.value;draw();});
    $('optOn_'+o.k).addEventListener('change',e=>{S.on[o.k]=e.target.checked;draw();});
  });
  $('optBeta').addEventListener('input',e=>{S.beta=+e.target.value;$('optBetaV').textContent=fm(S.beta,2);});
  $('optNoise').addEventListener('input',e=>{S.noise=+e.target.value;$('optNoiseV').textContent=fm(S.noise,2);});
  cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect();const p=toW((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H);SURF[S.surf].start=p;stop();reset();});
  setSurf('vadi');
  window.__opt={S,stepAll,reset,setSurf};

  /* ================= EKSTRA: öğrenme hızı takvimi ================= */
  const lr=$('optLr');
  if(lr){
    const upd=()=>{
      const T=+$('optLrT').value,Wm=+$('optLrW').value,peak=+$('optLrP').value,s=+$('optLrS').value;
      $('optLrTv').textContent=T;$('optLrWv').textContent=Wm;$('optLrPv').textContent=fm(peak,4);$('optLrSv').textContent=s;
      const f=t=>t<Wm?peak*(t+1)/Wm:peak*0.5*(1+Math.cos(Math.PI*(t-Wm)/Math.max(1,T-Wm)));
      let d='';for(let t=0;t<=T;t+=Math.max(1,Math.round(T/200))){const x=30+(t/T)*270,y=110-95*f(t)/peak;d+=(d?'L':'M')+x.toFixed(1)+','+y.toFixed(1);}
      const sx=30+(Math.min(s,T)/T)*270,sy=110-95*f(Math.min(s,T))/peak;
      $('optLrSvg').innerHTML='<line x1="30" y1="110" x2="300" y2="110" stroke="#44507a"/><path d="'+d+'" fill="none" stroke="#46c46a" stroke-width="2"/><line x1="'+(30+Wm/T*270)+'" y1="10" x2="'+(30+Wm/T*270)+'" y2="110" stroke="#f0a032" stroke-dasharray="3 3"/><text x="'+(32+Wm/T*270)+'" y="20" font-size="9" fill="#f0a032">ısınma biter</text><circle cx="'+sx+'" cy="'+sy+'" r="4" fill="#ffd77a"/><text x="30" y="124" font-size="9" fill="#95a2c2">0</text><text x="300" y="124" text-anchor="end" font-size="9" fill="#95a2c2">'+T+'. adım</text>';
      $('optLrOut').innerHTML='Adım '+s+'\'te öğrenme hızı α = <b>'+fm(f(Math.min(s,T)),5)+'</b> '+(s<Wm?'(ısınma: rastgele başlangıçta dev adım atmasın diye yavaş yavaş açılıyor)':'(kosinüs azalması: sona doğru küçük, ince ayar adımları)');
    };
    ['optLrT','optLrW','optLrP','optLrS'].forEach(id=>$(id).addEventListener('input',upd));upd();
  }

  /* ================= ÖRNEK 1: XOR, 5 ayar × 12 başlangıç ================= */
  const X4=[[0,0],[0,1],[1,0],[1,1]],Y4=[0,1,1,0],sig=z=>1/(1+Math.exp(-z));
  const lcg=seed=>{let s=seed;return ()=>{s=(s*1664525+1013904223)%4294967296;return Math.round((2*s/4294967296-1)*10)/10;};};
  const mk=seed=>{const u=lcg(seed+1);const W1=[[u(),u()],[u(),u()]],b1=[u(),u()],W2=[u(),u()],b2=u();return [W1[0][0],W1[0][1],W1[1][0],W1[1][1],b1[0],b1[1],W2[0],W2[1],b2];};
  function lg(p){const g=new Array(9).fill(0);let L=0;
    for(let n=0;n<4;n++){const [x1,x2]=X4[n],t=Y4[n];const h=[sig(p[0]*x1+p[1]*x2+p[4]),sig(p[2]*x1+p[3]*x2+p[5])];
      const q=sig(p[8]+p[6]*h[0]+p[7]*h[1]);L+=-(t?Math.log(q):Math.log(1-q))/4;const dz=q-t;
      g[6]+=dz*h[0]/4;g[7]+=dz*h[1]/4;g[8]+=dz/4;
      for(let j=0;j<2;j++){const dh=dz*p[6+j]*h[j]*(1-h[j]);g[2*j]+=dh*x1/4;g[2*j+1]+=dh*x2/4;g[4+j]+=dh/4;}}
    return [L,g];}
  function hit(seed,opt,a,b1,T=4000,th=0.05){const p=mk(seed),m=new Array(9).fill(0),v=new Array(9).fill(0);
    for(let t=1;t<=T;t++){const [L,g]=lg(p);if(L<th)return t-1;
      for(let i=0;i<9;i++){if(opt==='gd')p[i]-=a*g[i];else if(opt==='mom'){m[i]=b1*m[i]+g[i];p[i]-=a*m[i];}
        else{m[i]=b1*m[i]+(1-b1)*g[i];v[i]=0.999*v[i]+0.001*g[i]*g[i];p[i]-=a*(m[i]/(1-Math.pow(b1,t)))/(Math.sqrt(v[i]/(1-Math.pow(0.999,t)))+1e-8);}}}
    return null;}
  const CF=[['GD','α = 1','gd',1,0.9],['Momentum','α = 0,1 · β = 0,9','mom',0.1,0.9],['Momentum','α = 0,3 · β = 0,9','mom',0.3,0.9],['Adam','α = 0,01','adam',0.01,0.9],['Adam','α = 0,05','adam',0.05,0.9]];
  const e1=$('optEx1');
  if(e1){
    e1.innerHTML='<button class="rex-btn" id="optEx1go">▶ 5 ayar × 12 başlangıç eğit (≈1 sn)</button><div id="optEx1t" style="margin-top:8px"></div>';
    window.__optEx1=()=>CF.map(c=>{const r=[];for(let s=0;s<12;s++)r.push(hit(s,c[2],c[3],c[4]));return r;});
    $('optEx1go').onclick=()=>{$('optEx1t').textContent='⏳ eğitiliyor…';setTimeout(()=>{
      const R=window.__optEx1();
      let t='<div style="overflow-x:auto"><table class="rex-tbl"><tr><th>ayar</th>'+[...Array(12).keys()].map(i=>'<th>#'+i+'</th>').join('')+'<th>çözen</th><th>orta hız</th></tr>';
      R.forEach((r,j)=>{const ok=r.filter(x=>x!==null).sort((a,b)=>a-b);t+='<tr><td><b>'+CF[j][0]+'</b> '+CF[j][1]+'</td>'+r.map(x=>'<td style="color:'+(x===null?'#e06a6a':'#46c46a')+'">'+(x===null?'✗':x)+'</td>').join('')+'<td><b>'+ok.length+'/12</b></td><td>'+(ok.length?ok[Math.floor(ok.length/2)]+' tur':'—')+'</td></tr>';});
      $('optEx1t').innerHTML=t+'</table></div><div class="callout" style="margin-top:8px">Sayı = kaybın 0,05\'in altına indiği tur; ✗ = 4000 turda inemedi (yerel tuzak, kayıp ≈0,347). <b>Okuma:</b> büyük adımlı ayarlar (Momentum α=0,3, Adam α=0,05) çözdüklerinde 3-4 kat hızlı, ama daha sık tuzağa düşüyor. Adam bu minik ağda GD\'den <i>daha az</i> güvenilir çıktı. #8 ve #9 başlangıçları hiçbir ayarla çözülmedi. Ders: optimizer bir sihirli değnek değil; hız ile güvenilirlik arasında bir ayar.</div>';
      window.__optEx1res=R;},30);};
  }

  /* ================= ÖRNEK 2: mini-batch ================= */
  const D=[[1,1.9],[2,2.6],[3,3.1],[4,4.4],[5,4.9],[6,5.8],[7,6.2],[8,7.5]],m8=8;
  const Ec=(a,b)=>{let s=0;for(const [x,y] of D)s+=(a+b*x-y)*(a+b*x-y);return s/(2*m8);};
  function mb(B,alfa=0.02,ep=60,seed=7){let a=0,b=0,s=seed,upd=0;const h=[Ec(a,b)];
    const r=()=>{s=(s*1664525+1013904223)%4294967296;return s;};
    for(let e=0;e<ep;e++){const idx=[...Array(m8).keys()];for(let i=m8-1;i>0;i--){const j=r()%(i+1);[idx[i],idx[j]]=[idx[j],idx[i]];}
      for(let k=0;k<m8;k+=B){const bt=idx.slice(k,k+B);let d0=0,d1=0;for(const i of bt){const [x,y]=D[i],e2=a+b*x-y;d0+=e2;d1+=e2*x;}d0/=bt.length;d1/=bt.length;a-=alfa*d0;b-=alfa*d1;upd++;}
      h.push(Ec(a,b));}
    return {a,b,h,upd};}
  const e2=$('optEx2');
  if(e2){
    const BS=[[8,'#5aa0ff','tam yığın (8)'],[2,'#f0a032','mini-batch (2)'],[1,'#e06a6a','SGD (1)']],R=BS.map(b=>mb(b[0]));
    window.__optEx2=R;
    const X=e=>34+(300-44)*e/60,Y=v=>140-125*Math.min(1,Math.max(0,(Math.log10(Math.max(v,1e-2))+2)/2.6));
    let s='<line x1="34" y1="140" x2="300" y2="140" stroke="#44507a"/>';
    R.forEach((r,j)=>{let d='';r.h.forEach((v,i)=>{d+=(d?'L':'M')+X(i).toFixed(1)+','+Y(v).toFixed(1);});s+='<path d="'+d+'" fill="none" stroke="'+BS[j][1]+'" stroke-width="2"/>';});
    s+='<text x="34" y="154" font-size="9" fill="#95a2c2">epoch 0</text><text x="300" y="154" text-anchor="end" font-size="9" fill="#95a2c2">60</text><text x="4" y="12" font-size="9" fill="#95a2c2">maliyet E (log)</text>';
    let t='<table class="rex-tbl"><tr><th>yığın</th><th>60 epoch\'ta güncelleme</th><th>E (1.)</th><th>E (10.)</th><th>E (60.)</th></tr>';
    R.forEach((r,j)=>{t+='<tr><td><span class="nl-sw" style="background:'+BS[j][1]+'"></span>'+BS[j][2]+'</td><td>'+r.upd+'</td><td>'+fm(r.h[1],4)+'</td><td>'+fm(r.h[10],4)+'</td><td><b>'+fm(r.h[60],4)+'</b></td></tr>';});
    e2.innerHTML='<div class="nl-grid"><div><svg viewBox="0 0 310 160" style="width:100%;max-width:420px">'+s+'</svg></div><div>'+t+'</table><div class="callout" style="margin-top:8px">Aynı α = 0,02, aynı 60 epoch (her epoch veriyi bir kez görür). Küçük yığın epoch başına <b>daha çok güncelleme</b> yapar: SGD 480 adımda 0,0196\'ya inerken tam yığın 60 adımda 0,0650\'de. Bedeli <b>gürültü</b>: kırmızı eğri yer yer yukarı zıplıyor (tek bir noktaya bakıp atılan adım bütün veri için yanlış olabilir). Gerçek modellerde yığın milyonlarca örneklik veriden seçilen yüzlerce-binlerce örnektir; GPU\'ya sığan en verimli boy aranır.</div></div></div>';
  }

  /* ================= ÖRNEK 3: Adam her ağırlığa kendi adımını verir ================= */
  const e3=$('optEx3');
  if(e3){
    const gr=w=>[100*w[0],0.01*w[1]],Lf=w=>50*w[0]*w[0]+0.005*w[1]*w[1];
    const gd=[],ad=[];let w=[1,1];for(let t=1;t<=200;t++){const g=gr(w);w=[w[0]-0.009*g[0],w[1]-0.009*g[1]];gd.push({t,g,w:w.slice(),L:Lf(w)});}
    w=[1,1];const m=[0,0],v=[0,0];
    for(let t=1;t<=200;t++){const g=gr(w),st=[0,0];for(let i=0;i<2;i++){m[i]=0.9*m[i]+0.1*g[i];v[i]=0.999*v[i]+0.001*g[i]*g[i];st[i]=0.1*(m[i]/(1-Math.pow(0.9,t)))/(Math.sqrt(v[i]/(1-Math.pow(0.999,t)))+1e-8);}w=[w[0]-st[0],w[1]-st[1]];ad.push({t,g,st,w:w.slice(),L:Lf(w)});}
    window.__optEx3={gd,ad};
    let t='<table class="rex-tbl"><tr><th>adım</th><th>eğim g₁ / g₂</th><th>GD (α=0,009) w₁ / w₂</th><th>Adam (α=0,1) adım₁ / adım₂</th><th>Adam w₁ / w₂</th></tr>';
    for(let i=0;i<5;i++)t+='<tr><td>'+(i+1)+'</td><td>'+fm(gd[i].g[0],2)+' / '+fm(gd[i].g[1],4)+'</td><td>'+fm(gd[i].w[0],5)+' / <b>'+fm(gd[i].w[1],5)+'</b></td><td>'+fm(ad[i].st[0],4)+' / <b>'+fm(ad[i].st[1],4)+'</b></td><td>'+fm(ad[i].w[0],4)+' / '+fm(ad[i].w[1],4)+'</td></tr>';
    t+='<tr><td>200</td><td>—</td><td>'+fm(gd[199].w[0],5)+' / <b>'+fm(gd[199].w[1],4)+'</b></td><td>—</td><td>'+fm(ad[199].w[0],5)+' / <b>'+fm(ad[199].w[1],5)+'</b></td></tr></table>';
    e3.innerHTML='<div style="overflow-x:auto">'+t+'</div><div class="callout" style="margin-top:8px">Kayıp L = 50·w₁² + 0,005·w₂²: w₁ yönü 10.000 kat daha dik. GD\'de tek bir α var: dik yönde patlamasın diye küçük seçilmek zorunda (α &lt; 0,02), bu yüzden w₂ 200 adımda 1\'den yalnız <b>0,98</b>\'e iniyor. Adam her ağırlığın eğimini kendi ortalama büyüklüğüne bölüyor (m̂/√v̂ ≈ ±1): iki ağırlık da her adımda ≈0,1 yürüyor, 200 adımda ikisi de ≈0. Derin ağlarda milyonlarca ağırlığın eğimleri çok farklı ölçeklerde olduğu için Adam bu yüzden varsayılan seçim oldu.</div>';
  }
})();
