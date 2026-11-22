// 🎯 Aşırı öğrenme & düzenlileştirme dersi (#model-ovf):
//  Simülasyon: gürültülü sin verisine polinom uydur — derece, λ (ağırlık küçültme) ve veri sayısı;
//              eğitim ↔ doğrulama hatası, U eğrisi, canlı öğretmen kutuları.
//  Örnek Çalışmalar: (1) erken durdurma (Adam, 20.000 tur), (2) weight decay λ karşılaştırması,
//                    (3) daha çok veri (n = 12/24/48/96). Python kutularıyla birebir aynı sayılar.
(function(){
  const host=document.getElementById('ovfSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const fm=(v,d=3)=>{if(!isFinite(v))return '∞';if(Math.abs(v)>=1e4)return Math.round(v).toLocaleString('tr-TR');v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const lcg=seed=>{let s=seed;return ()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};};
  const gauss=u=>{const a=Math.max(u(),1e-12),b=u();return Math.sqrt(-2*Math.log(a))*Math.cos(2*Math.PI*b);};
  const f=x=>Math.sin(Math.PI*x);
  function train(n,seed=2,sig=0.25){const u=lcg(seed),p=[];for(let i=0;i<n;i++){const x=-0.95+1.9*(i+u())/n;p.push([x,f(x)+sig*gauss(u)]);}return p;}
  function valid(n=200,seed=99,sig=0.25){const u=lcg(seed),p=[];for(let i=0;i<n;i++){const x=-0.95+1.9*u();p.push([x,f(x)+sig*gauss(u)]);}return p;}
  const VA=valid();
  function solve(A,b){const n=b.length,M=A.map((r,i)=>r.concat([b[i]]));
    for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;[M[c],M[p]]=[M[p],M[c]];
      for(let r=0;r<n;r++)if(r!==c){const k=M[r][c]/M[c][c];for(let j=c;j<=n;j++)M[r][j]-=k*M[c][j];}}
    return M.map((r,i)=>r[n]/r[i]);}
  function fit(P,d,lam){const n=P.length,F=P.map(([x])=>{const r=[];for(let k=0;k<=d;k++)r.push(Math.pow(x,k));return r;}),A=[],b=[];
    for(let a=0;a<=d;a++){const row=[];for(let c=0;c<=d;c++){let s=0;for(let i=0;i<n;i++)s+=F[i][a]*F[i][c];row.push(s/n+(a===c&&a>0?lam:0));}A.push(row);let s=0;for(let i=0;i<n;i++)s+=F[i][a]*P[i][1];b.push(s/n);}
    return solve(A,b);}
  const ev=(w,x)=>{let s=0;for(let k=0;k<w.length;k++)s+=w[k]*Math.pow(x,k);return s;};
  const mse=(w,P)=>{let s=0;for(const [x,y] of P){const e=ev(w,x)-y;s+=e*e;}return s/P.length;};
  const norm=w=>Math.sqrt(w.reduce((s,c)=>s+c*c,0));

  /* ================= SİMÜLASYON ================= */
  const LAMS=[0,1e-4,1e-3,1e-2,1e-1,1];
  let S={d:3,li:0,n:12};
  const cv=$('ovfCv'),ctx=cv.getContext('2d'),W=520,H=320;
  const PX=x=>(x+1)/2*W,PY=y=>H/2-y*(H/4.4);
  function draw(){
    const TR=train(S.n),lam=LAMS[S.li],w=fit(TR,S.d,lam),et=mse(w,TR),eva=mse(w,VA),nw=norm(w);
    ctx.fillStyle='#0d1426';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#2a3558';ctx.beginPath();ctx.moveTo(0,PY(0));ctx.lineTo(W,PY(0));ctx.stroke();
    VA.forEach(([x,y])=>{ctx.fillStyle='rgba(240,160,50,.45)';ctx.fillRect(PX(x)-1.5,PY(y)-1.5,3,3);});
    ctx.setLineDash([6,5]);ctx.strokeStyle='#95a2c2';ctx.lineWidth=1.5;ctx.beginPath();for(let i=0;i<=200;i++){const x=-1+i/100;i?ctx.lineTo(PX(x),PY(f(x))):ctx.moveTo(PX(x),PY(f(x)));}ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle='#46c46a';ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=380;i++){const x=-0.95+1.9*i/380,y=Math.max(-2.3,Math.min(2.3,ev(w,x)));i?ctx.lineTo(PX(x),PY(y)):ctx.moveTo(PX(x),PY(y));}ctx.stroke();
    TR.forEach(([x,y])=>{ctx.fillStyle='#5aa0ff';ctx.beginPath();ctx.arc(PX(x),PY(y),4.5,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();});
    // U eğrisi
    const rows=[];for(let d=1;d<=11;d++){const ww=fit(TR,d,lam);rows.push([d,mse(ww,TR),mse(ww,VA)]);}
    const LX=d=>30+(d-1)/10*260,LY=v=>110-100*Math.min(1,Math.max(0,(Math.log10(Math.max(v,1e-3))+3)/4.5));
    let u='<line x1="30" y1="110" x2="290" y2="110" stroke="#44507a"/>';
    [-2,-1,0,1].forEach(e=>{const y=LY(Math.pow(10,e));u+='<line x1="30" y1="'+y+'" x2="290" y2="'+y+'" stroke="#1f2a46"/><text x="26" y="'+(y+3)+'" font-size="8" text-anchor="end" fill="#95a2c2">10<tspan font-size="6" dy="-3">'+(''+e).replace('-','−')+'</tspan></text>';});
    u+='<line x1="30" y1="'+LY(0.0625)+'" x2="290" y2="'+LY(0.0625)+'" stroke="#95a2c2" stroke-dasharray="3 3"/>';
    [[1,'#5aa0ff'],[2,'#f0a032']].forEach(([k,c])=>{let d='';rows.forEach(r=>{d+=(d?'L':'M')+LX(r[0])+','+LY(r[k]);});u+='<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="2"/>';rows.forEach(r=>{u+='<circle cx="'+LX(r[0])+'" cy="'+LY(r[k])+'" r="2.2" fill="'+c+'"/>';});});
    u+='<line x1="'+LX(S.d)+'" y1="8" x2="'+LX(S.d)+'" y2="110" stroke="#46c46a"/>';
    for(let d=1;d<=11;d+=2)u+='<text x="'+LX(d)+'" y="122" font-size="8" text-anchor="middle" fill="#95a2c2">'+d+'</text>';
    u+='<text x="160" y="132" font-size="8" text-anchor="middle" fill="#95a2c2">polinom derecesi (model kapasitesi)</text>';
    $('ovfU').innerHTML=u;
    const bestD=rows.reduce((a,r)=>r[2]<a[2]?r:a,rows[0])[0];
    $('ovfNum').innerHTML='<b class="h">✏️ Şu anki sayılar</b>derece <b>'+S.d+'</b> → '+(S.d+1)+' ağırlık · eğitim noktası <b>'+S.n+'</b> · λ = <b>'+(lam?lam.toExponential(0).replace('e-','·10⁻'):'0')+'</b><br>'+
      '① Eğitim hatası (mavi noktalar) = <b>'+fm(et,4)+'</b><br>② Doğrulama hatası (turuncu, modelin hiç görmediği 200 nokta) = <b>'+fm(eva,4)+'</b><br>③ Ağırlıkların büyüklüğü |w| = <b>'+fm(nw,2)+'</b><br>④ Gürültü tabanı σ² = 0,25² = <b>0,0625</b> (kesikli çizgi): hiçbir model doğrulamada bunun altına sürekli inemez.';
    let sz='';
    if(et>0.15)sz='<b>Eksik öğrenme (underfit):</b> eğitim hatası bile yüksek ('+fm(et,3)+'). Model veriyi anlatacak kadar esnek değil — derece '+S.d+' bir sinüsün kıvrımını çizemiyor. Dereceyi artır.';
    else if(eva>Math.max(0.15,2.5*et))sz='<b>Aşırı öğrenme (overfit):</b> eğitimde neredeyse kusursuz ('+fm(et,4)+') ama görmediği noktalarda '+fm(eva/Math.max(et,1e-9),0)+' kat daha kötü ('+fm(eva,3)+'). Yeşil eğri mavi noktaların <i>gürültüsünü</i> de ezberlemek için kıvrılıyor; ağırlıklar şişmiş (|w| = '+fm(nw,1)+'). Çare: dereceyi düşür, λ\'yı aç ya da daha çok veri ekle.';
    else sz='<b>İyi denge:</b> eğitim '+fm(et,3)+', doğrulama '+fm(eva,3)+' — ikisi de gürültü tabanına (0,0625) yakın. Model sinüsün şeklini yakalıyor, gürültüyü ezberlemiyor.';
    sz+=' Bu veri ve λ ile doğrulamada en iyi derece: <b>'+bestD+'</b>.';
    $('ovfSoz').innerHTML='<b class="h">🗣️ Ne anlama geliyor? (canlı)</b>'+sz;
    $('ovfDv').textContent=S.d;$('ovfLv').textContent=lam?lam.toExponential(0).replace('e-','·10⁻'):'0';
    document.querySelectorAll('.ovf-n').forEach(b=>b.classList.toggle('on',+b.dataset.n===S.n));
  }
  $('ovfD').addEventListener('input',e=>{S.d=+e.target.value;draw();});
  $('ovfL').addEventListener('input',e=>{S.li=+e.target.value;draw();});
  host.addEventListener('click',e=>{const b=e.target.closest('.ovf-n');if(b){S.n=+b.dataset.n;draw();}
    const p=e.target.closest('.ovf-pre');if(p){S.d=+p.dataset.d;S.li=+p.dataset.l;S.n=+p.dataset.n;$('ovfD').value=S.d;$('ovfL').value=S.li;draw();}});
  draw();
  window.__ovf={train,valid,fit,mse,S,draw};

  /* ================= ÖRNEK 1 + 2: Adam ile eğitim, erken durdurma ve weight decay ================= */
  const TR12=train(12);
  function gdTrain(d,lam,lr,T,rec){const w=new Array(d+1).fill(0),m=w.slice(),v=w.slice(),out={},hist=[];let best=[9,0];
    const F=TR12.map(([x])=>{const r=[1];for(let k=0;k<d;k++)r.push(r[k]*x);return r;});
    for(let t=1;t<=T;t++){const g=new Array(d+1).fill(0);
      for(let i=0;i<TR12.length;i++){let e=0;for(let k=0;k<=d;k++)e+=w[k]*F[i][k];e-=TR12[i][1];for(let k=0;k<=d;k++)g[k]+=2*e*F[i][k]/TR12.length;}
      for(let k=1;k<=d;k++)g[k]+=2*lam*w[k];
      for(let k=0;k<=d;k++){m[k]=0.9*m[k]+0.1*g[k];v[k]=0.999*v[k]+0.001*g[k]*g[k];w[k]-=lr*(m[k]/(1-Math.pow(0.9,t)))/(Math.sqrt(v[k]/(1-Math.pow(0.999,t)))+1e-8);}
      const vm=mse(w,VA);if(vm<best[0])best=[vm,t];
      if(rec&&(t<20||t%20===0))hist.push([t,mse(w,TR12),vm]);}
    return {w,best,tr:mse(w,TR12),va:mse(w,VA),hist};}
  window.__ovfGd=gdTrain;
  const e1=$('ovfEx1');
  if(e1){
    e1.innerHTML='<button class="rex-btn" id="ovfEx1go">▶ 20.000 tur eğit (≈1 sn)</button><div id="ovfEx1o" style="margin-top:8px"></div>';
    $('ovfEx1go').onclick=()=>{$('ovfEx1o').textContent='⏳ eğitiliyor…';setTimeout(()=>{
      const r=gdTrain(11,0,0.05,20000,true);window.__ovfEx1=r;
      const X=t=>34+(300-44)*Math.log10(t)/Math.log10(20000),Y=v=>140-125*Math.min(1,Math.max(0,(Math.log10(Math.max(v,1e-2))+2)/2.4));
      let s='<line x1="34" y1="140" x2="300" y2="140" stroke="#44507a"/>';
      [[1,'#5aa0ff','eğitim'],[2,'#f0a032','doğrulama']].forEach(([k,c])=>{let d='';r.hist.forEach(h=>{d+=(d?'L':'M')+X(h[0]).toFixed(1)+','+Y(h[k]).toFixed(1);});s+='<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="2"/>';});
      s+='<line x1="'+X(r.best[1])+'" y1="10" x2="'+X(r.best[1])+'" y2="140" stroke="#46c46a" stroke-dasharray="4 3"/><text x="'+(X(r.best[1])+3)+'" y="20" font-size="9" fill="#46c46a">dur! ('+r.best[1]+'. tur)</text>';
      [1,10,100,1000,10000].forEach(t=>{s+='<text x="'+X(t)+'" y="152" font-size="8" text-anchor="middle" fill="#95a2c2">'+t+'</text>';});
      const at=t=>r.hist.find(h=>h[0]===t);
      let tb='<table class="rex-tbl"><tr><th>tur</th><th>eğitim</th><th>doğrulama</th></tr>';[100,300,1000,3000,10000,20000].forEach(t=>{const h=at(t);tb+='<tr><td>'+t+'</td><td>'+fm(h[1],4)+'</td><td>'+fm(h[2],4)+'</td></tr>';});
      $('ovfEx1o').innerHTML='<div class="nl-grid"><div><svg viewBox="0 0 310 160" style="width:100%;max-width:420px">'+s+'</svg><div class="nl-legend"><span><span class="nl-sw" style="background:#5aa0ff"></span>eğitim</span><span><span class="nl-sw" style="background:#f0a032"></span>doğrulama</span> (tur ekseni log)</div></div><div>'+tb+'</table><div class="callout" style="margin-top:8px">Eğitim hatası hep düşüyor (0,0187\'ye kadar). Doğrulama hatası <b>'+r.best[1]+'. turda '+fm(r.best[0],4)+'</b> ile dibe vurup sonra yükseliyor (20.000. turda '+fm(r.va,4)+'): model önce sinüsün şeklini, sonra gürültüyü öğrendi. <b>Erken durdurma</b> = doğrulama hatası artmaya başlayınca eğitimi kesip en iyi andaki ağırlıkları saklamak.</div></div></div>';},30);};
  }
  const e2=$('ovfEx2');
  if(e2){
    e2.innerHTML='<button class="rex-btn" id="ovfEx2go">▶ 4 farklı λ ile 20.000 tur eğit (≈2 sn)</button><div id="ovfEx2o" style="margin-top:8px"></div>';
    $('ovfEx2go').onclick=()=>{$('ovfEx2o').textContent='⏳ eğitiliyor…';setTimeout(()=>{
      const L=[[0,'#e06a6a'],[0.001,'#46c46a'],[0.01,'#f0a032'],[0.1,'#a34ad1']],R=L.map(([l])=>gdTrain(11,l,0.05,20000,false));window.__ovfEx2=R;
      const PX2=x=>(x+1)/2*300,PY2=y=>80-y*34;let s='';
      TR12.forEach(([x,y])=>{s+='<circle cx="'+PX2(x)+'" cy="'+PY2(y)+'" r="3" fill="#5aa0ff"/>';});
      R.forEach((r,j)=>{let d='';for(let i=0;i<=150;i++){const x=-0.95+1.9*i/150,y=Math.max(-2.3,Math.min(2.3,ev(r.w,x)));d+=(d?'L':'M')+PX2(x).toFixed(1)+','+PY2(y).toFixed(1);}s+='<path d="'+d+'" fill="none" stroke="'+L[j][1]+'" stroke-width="1.8"/>';});
      let tb='<table class="rex-tbl"><tr><th>λ</th><th>eğitim</th><th>doğrulama</th><th>|w|</th></tr>';R.forEach((r,j)=>{tb+='<tr><td><span class="nl-sw" style="background:'+L[j][1]+'"></span>'+fm(L[j][0],3)+'</td><td>'+fm(r.tr,4)+'</td><td><b>'+fm(r.va,4)+'</b></td><td>'+fm(norm(r.w),2)+'</td></tr>';});
      $('ovfEx2o').innerHTML='<div class="nl-grid"><div><svg viewBox="0 0 300 160" style="width:100%;max-width:420px">'+s+'</svg></div><div>'+tb+'</table><div class="callout" style="margin-top:8px">Aynı derece-11 model, aynı 20.000 tur; tek fark kayba eklenen <b>λ·|w|²</b> cezası. λ = 0 iken ağırlıklar 130\'a şişiyor ve doğrulama 0,55. Küçük bir ceza (λ = 0,001) ağırlıkları 4\'e indiriyor, doğrulama 0,078 — erken durdurmanın en iyisiyle neredeyse aynı. Çok büyük ceza (0,1) modeli düzleştirip yeniden <b>eksik öğrenmeye</b> itiyor.</div></div></div>';},30);};
  }
  /* ================= ÖRNEK 3: daha çok veri ================= */
  const e3=$('ovfEx3');
  if(e3){
    let tb='<table class="rex-tbl"><tr><th>eğitim noktası</th><th>derece 3</th><th>derece 9</th><th>derece 11</th></tr>';const out=[];
    [12,24,48,96].forEach(n=>{const t=train(n),row=[n];tb+='<tr><td><b>'+n+'</b></td>';[3,9,11].forEach(d=>{const w=fit(t,d,0),a=mse(w,t),b=mse(w,VA);row.push([a,b]);tb+='<td>'+fm(a,4)+' / <b style="color:'+(b>0.15?'#e06a6a':'#46c46a')+'">'+fm(b,4)+'</b></td>';});tb+='</tr>';out.push(row);});
    window.__ovfEx3=out;
    e3.innerHTML='<div style="overflow-x:auto">'+tb+'</table></div><div class="nl-legend">hücre = eğitim hatası / <b>doğrulama hatası</b> (λ = 0, kapalı form çözüm)</div><div class="callout" style="margin-top:8px">12 noktada derece 11 model her noktadan geçiyor (eğitim 0) ama doğrulamada felaket (376). Aynı model 24 noktayla 0,088\'e iniyor: <b>daha çok veri, esnek modelin gürültüyü ezberlemesini zorlaştırır</b> (her kıvrım artık birçok noktaya uymak zorunda). Dev dil modellerinin milyarlarca parametreye rağmen genelleyebilmesinin bir nedeni de trilyonlarca token\'lık veri.</div>';
  }
})();
