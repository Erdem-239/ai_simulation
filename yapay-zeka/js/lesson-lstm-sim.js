// LSTM — 5️⃣ Simülasyon (RNN Tek Hücre / Neural Network düzeni): üstte girdiler + hedef + 12 ağırlık,
// solda tek kontrol çubuğu (İleri ▶ = lesson-lstm-step.js, ◀ Geri = burada, 🔧 Eğit) + canlı hücre şeması + 1) İleri,
// sağda 2) Geri Adım 1–4 ve 3) Güncelle. Kayıp L = ½(h − y)². app.js drawPipe her çizimde __lstmSimRender'ı çağırır.
(function(){
  const $=id=>document.getElementById(id);
  if(!$('lstmSim')||!$('lsBp1')) return;
  const sig=z=>1/(1+Math.exp(-z));
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const fm=(v,d=3)=>{if(!isFinite(v))return '—';v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=4)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=4)=>v<0?'('+t(v,d)+')':t(v,d);
  const G=['f','i','c','o'], GN={f:'f',i:'i',c:'c̃',o:'o'}, GT={f:'f',i:'i',c:'\\tilde c',o:'o'};
  const ids=[];G.forEach(g=>['W','U','b'].forEach(p=>ids.push('lv_'+p+g)));
  const names=[];G.forEach(g=>['W','U','b'].forEach(p=>names.push(p+'<sub>'+GN[g]+'</sub>')));
  const rv=id=>parseFloat($(id).value);
  const W0=ids.map(rv); // başlangıç ağırlıkları (HTML varsayılanı)
  let W=W0.slice(), ep=0, hist=[], timer=null, writing=false, g=0, hitAt=null;

  function model(Wv){
    const x=rv('lv_x'),hp=rv('lv_hp'),cp=rv('lv_cp'),y=rv('lv_y');
    const w=k=>{const j=G.indexOf(k)*3;return [Wv[j],Wv[j+1],Wv[j+2]];};
    const z={},a={};G.forEach(k=>{const q=w(k);z[k]=q[0]*x+q[1]*hp+q[2];});
    a.f=sig(z.f);a.i=sig(z.i);a.o=sig(z.o);a.c=Math.tanh(z.c);
    const c=a.f*cp+a.i*a.c,tc=Math.tanh(c),h=a.o*tc,dh=h-y,L=0.5*dh*dh;
    const dO=dh*tc,dc=dh*a.o*(1-tc*tc);
    const da={f:dc*cp,i:dc*a.c,c:dc*a.i,o:dO};
    const sl={f:a.f*(1-a.f),i:a.i*(1-a.i),o:a.o*(1-a.o),c:1-a.c*a.c};
    const dz={};G.forEach(k=>dz[k]=da[k]*sl[k]);
    const grad=[];G.forEach(k=>{grad.push(dz[k]*x,dz[k]*hp,dz[k]);});
    return {x,hp,cp,y,z,a,c,tc,h,dh,L,dO,dc,da,sl,dz,grad,dcp:dc*a.f};
  }

  /* ---- 2) Geri Adım kartları ---- */
  let tsPend=false;
  function typeset(){if(tsPend)return;tsPend=true;requestAnimationFrame(()=>{tsPend=false;const M=window.MathJax;if(!M||!M.typesetPromise)return;const els=[1,2,3].map(k=>$('lsBp'+k+'Eq'));try{M.typesetClear&&M.typesetClear(els);}catch(e){}M.typesetPromise(els).catch(()=>{});});}
  function cards(M,heavy){
    const {a,c,tc,h,dh,dO,dc,da,sl,dz}=M;
    if(heavy){
      $('lsBp1Eq').innerHTML='\\( \\begin{aligned}\\tfrac{\\partial L}{\\partial h}&=h-y='+tp(h,3)+'-'+tp(M.y,2)+'=\\mathbf{'+t(dh,4)+'}=\\delta_h\\\\'+
        '\\tfrac{\\partial L}{\\partial o}&=\\delta_h\\cdot\\tanh c='+tp(dh)+'\\cdot'+tp(tc,3)+'=\\mathbf{'+t(dO)+'}\\\\'+
        '\\tfrac{\\partial L}{\\partial c}&=\\delta_h\\cdot o\\,(1-\\tanh^2c)='+tp(dh)+'\\cdot'+t(a.o,3)+'\\cdot'+t(1-tc*tc,3)+'=\\mathbf{'+t(dc)+'}\\end{aligned} \\)';
      $('lsBp2Eq').innerHTML='\\( \\begin{aligned}\\tfrac{\\partial L}{\\partial f}&=\\delta_c\\cdot c_{t-1}='+tp(dc)+'\\cdot'+tp(M.cp,2)+'=\\mathbf{'+t(da.f)+'}\\\\'+
        '\\tfrac{\\partial L}{\\partial i}&=\\delta_c\\cdot\\tilde c='+tp(dc)+'\\cdot'+tp(a.c,3)+'=\\mathbf{'+t(da.i)+'}\\\\'+
        '\\tfrac{\\partial L}{\\partial \\tilde c}&=\\delta_c\\cdot i='+tp(dc)+'\\cdot'+t(a.i,3)+'=\\mathbf{'+t(da.c)+'}\\\\'+
        '\\tfrac{\\partial L}{\\partial c_{t-1}}&=\\delta_c\\cdot f='+tp(dc)+'\\cdot'+t(a.f,3)+'=\\mathbf{'+t(M.dcp)+'}\\end{aligned} \\)';
      $('lsBp3Eq').innerHTML='\\( \\begin{aligned}'+G.map(k=>'\\delta_{'+(k==='c'?'\\tilde c':k)+'}&=\\tfrac{\\partial L}{\\partial '+GT[k]+'}\\cdot '+(k==='c'?'(1-\\tilde c^2)':k+'(1-'+k+')')+'='+tp(da[k])+'\\cdot'+t(sl[k],3)+'=\\mathbf{'+t(dz[k])+'}').join('\\\\')+'\\end{aligned} \\)';
      typeset();
    }
    let tb='<table class="nsim-tbl ls-g4"><tr><th>kutu</th><th>δ</th><th>∂L/∂W = δ·x</th><th>∂L/∂U = δ·h₋₁</th><th>∂L/∂b = δ</th></tr>';
    G.forEach(k=>{tb+='<tr><td>'+GN[k]+'</td><td>'+fm(dz[k],4)+'</td><td>'+fm(dz[k],4)+'·'+fm(M.x,2)+' = <b>'+fm(dz[k]*M.x,4)+'</b></td><td>'+fm(dz[k],4)+'·'+fm(M.hp,2)+' = <b>'+fm(dz[k]*M.hp,4)+'</b></td><td><b>'+fm(dz[k],4)+'</b></td></tr>';});
    $('lsBp4Eq').innerHTML=tb+'</table>';
    $('lsBp1Note').innerHTML='h = o·tanh(c) olduğu için hata <b>iki kola</b> ayrılır: çıkış kapısı o ve hafıza c (son satır = δ<sub>c</sub>). '+(Math.abs(dh)<0.001?'h neredeyse tam hedefte → gradyanlar ≈ 0, öğrenecek bir şey kalmadı.':dh>0?'h hedefin üstünde ('+fm(h)+' > '+fm(M.y,2)+') → küçülmeli.':dh<0?'h hedefin altında ('+fm(h)+' < '+fm(M.y,2)+') → büyümeli.':'h tam hedefte.');
    $('lsBp2Note').innerHTML='Toplamada sinyal her parçaya aynen geçer, çarpımda karşı taraf çarpan olur. <b>Son satır geçmişe giden sinyal:</b> çarpan yalnız <b>f = '+fm(a.f)+'</b> (W yok) — LSTM\'in vanishing\'e çaresi.';
    $('lsBp3Note').innerHTML='Kapılar sigmoid: eğim en çok 0,25 (şu an f '+fm(sl.f)+', i '+fm(sl.i)+', o '+fm(sl.o)+'). Aday tanh: eğim 1−c̃² = '+fm(sl.c)+'. Eğim küçükse o kutu az öğrenir.';
    $('lsBp4Note').innerHTML='Dört kutu aynı kural: <b>gradyan = δ × o ağırlığın çarptığı şey</b> (W için x, U için h₋₁, b için 1). 12 gradyan hazır → 3) Güncelle.';
  }

  /* ---- 3) Güncelle ---- */
  function upd(M){
    const a=alpha(),Wn=W.map((v,i)=>v-a*M.grad[i]),Mn=model(Wn);
    let t='<div class="nsim-when">📈 <b>Ne zaman hedefe ulaştı?</b> '+(hitAt!==null?'h, hedefe (|h − y| < 0,01) <b>tur '+hitAt+'</b>\'de ulaştı; sonrası ince ayar.':ep?'Henüz değil: h = '+fm(M.h)+', hedef '+fm(M.y,2)+' (fark '+fm(Math.abs(M.dh))+').':'Henüz eğitim yok: <b>▶ 1 tur</b> ya da <b>⏩</b> ile başlat. Hücre 12 ağırlığını ayarlayıp h\'yi hedef y\'ye yaklaştıracak.')+'</div>';
    t+='<div style="overflow-x:auto"><table class="nsim-tbl nsim-htbl"><tr><th></th>'+names.map((n,i)=>'<th'+(i%3===0&&i?' class="sep"':'')+'>'+n+'</th>').join('')+'</tr>'+
      '<tr><td>şimdi</td>'+W.map((v,i)=>'<td'+(i%3===0&&i?' class="sep"':'')+'>'+fm(v,3)+'</td>').join('')+'</tr>'+
      '<tr><td>∂L/∂w</td>'+M.grad.map((v,i)=>'<td'+(i%3===0&&i?' class="sep"':'')+'>'+fm(v,4)+'</td>').join('')+'</tr>'+
      '<tr><td>yeni</td>'+Wn.map((v,i)=>'<td'+(i%3===0&&i?' class="sep"':'')+'><b>'+fm(v,3)+'</b></td>').join('')+'</tr></table></div>';
    t+='<div class="nsim-loss">h: '+fm(M.h)+' → <b>'+fm(Mn.h)+'</b> (hedef '+fm(M.y,2)+') · kayıp: '+fm(M.L,5)+' → <b>'+fm(Mn.L,5)+'</b> '+(Mn.L<M.L?'<span style="color:#46c46a">↓ azalır</span>':Mn.L===M.L?'':'<span style="color:#e06a6a">↑ artar (α çok büyük olabilir)</span>')+'</div>';
    t+='<div class="nsim-sub">yeni = şimdi − α·∂L/∂w. ▶ 1 tur "yeni" satırını ağırlık kaydırıcılarına yazar. Not: tek bir örneğe (x, h₋₁, c₋₁ → y) göre eğitiyoruz; gerçek eğitim birçok örnek ve zaman adımı üzerinden gradyanları toplar (7️⃣ Örnek Çalışmalar).</div>';
    $('lsUpd').innerHTML=t;
    const hs=hist.length?hist:[M.L],mx=Math.max(1e-6,...hs),X=i=>28+262*i/Math.max(1,hs.length-1),Y=v=>110-100*v/mx;
    let s='<line x1="28" y1="110" x2="292" y2="110" stroke="#44507a"/><line x1="28" y1="10" x2="28" y2="110" stroke="#44507a"/>';
    if(hs.length>1){let d='',st=Math.ceil(hs.length/300);hs.forEach((v,i)=>{if(i%st&&i!==hs.length-1)return;d+=(d?'L':'M')+X(i).toFixed(1)+','+Y(v).toFixed(1);});s+='<path d="'+d+'" fill="none" stroke="#46c46a" stroke-width="2"/>';
      if(hitAt!==null)s+='<line x1="'+X(hitAt).toFixed(1)+'" y1="10" x2="'+X(hitAt).toFixed(1)+'" y2="110" stroke="#46c46a" stroke-dasharray="2 2"/><text x="'+(X(hitAt)+3).toFixed(1)+'" y="22" font-size="9" fill="#46c46a">hedefte (tur '+hitAt+')</text>';}
    else s+='<text x="160" y="70" text-anchor="middle" font-size="10" fill="#95a2c2">▶ 1 tur ya da ⏩ ile eğit</text>';
    s+='<text x="24" y="14" text-anchor="end" font-size="9" fill="#95a2c2">'+fm(mx,3)+'</text><text x="24" y="112" text-anchor="end" font-size="9" fill="#95a2c2">0</text><text x="292" y="124" text-anchor="end" font-size="9" fill="#95a2c2">tur '+ep+'</text>';
    $('lsLossSvg').innerHTML=s;
    $('lsTrStat').innerHTML='tur <b>'+ep+'</b> · h <b>'+fm(M.h)+'</b> / hedef '+fm(M.y,2)+' · kayıp <b>'+fm(M.L,5)+'</b>';
  }
  const alpha=()=>{const v=parseFloat($('lsAlpha').value);return isFinite(v)&&v>0?v:1;};

  /* ---- ◀ Geri adım adım ---- */
  const BHL=[[],['ht','mulo','tanhe','obox'],['plus','mulf','mului','c0','ct'],['fbox','ibox','gbox','obox'],['x','h0']];
  const BF=['','δ<sub>h</sub> = h − y → <b style="color:#ff8a6a">∂L/∂o, ∂L/∂c</b>','∂L/∂c → <b style="color:#ff8a6a">∂L/∂f, ∂L/∂i, ∂L/∂c̃, ∂L/∂c₋₁</b>','<b style="color:#ff8a6a">δ = ∂L/∂(kapı) × aktivasyon eğimi</b> (dört kutu)','<b style="color:#ff8a6a">12 gradyan = δ × girdi</b> (W·x, U·h₋₁, b)'];
  const BM=['','<b>Geri 1/4:</b> kayıptan h\'ye (h − y), h = o·tanh(c) olduğu için iki kola: o ve c (Geri Adım 1).','<b>Geri 2/4:</b> c = f·c₋₁ + i·c̃ toplamından her kapıya; son kol geçmişe giden <b>gradyan otobanı</b> (Geri Adım 2).','<b>Geri 3/4:</b> her kapının aktivasyon eğimiyle çarp → z\'ye ulaşan δ (Geri Adım 3).','<b>Geri 4/4:</b> δ × girdi = 12 ağırlığın gradyanı (Geri Adım 4). Şimdi 3) Güncelle.'];
  function backShow(scroll){
    window.__lstmPipeHL=BHL[g];
    $('lvStepFormula').innerHTML=BF[g];
    $('lvStepInfo').innerHTML='<span style="color:var(--muted);font-size:12px">Geri adım '+g+' / 4</span><br>'+BM[g];
    for(let k=1;k<=4;k++){const c=$('lsBp'+k);if(c)c.classList.toggle('active',g===k);}
    const c=$('lsBp'+g);if(scroll&&c&&c.offsetParent)c.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  $('lsStepB').onclick=()=>{g=Math.min(4,g+1);window.__lstmBack=g;backShow(true);if(window.__lstmPipeRedraw)window.__lstmPipeRedraw();};
  window.__lstmBackClr=()=>{g=0;for(let k=1;k<=4;k++){const c=$('lsBp'+k);if(c)c.classList.remove('active');}};

  /* ---- eğitim ---- */
  function writeW(){writing=true;ids.forEach((id,i)=>{$(id).value=W[i];});writing=false;if(window.__lstmPipeRedraw)window.__lstmPipeRedraw();}
  function train1(){const M=model(W),a=alpha();if(!hist.length)hist.push(M.L);for(let i=0;i<12;i++)W[i]-=a*M.grad[i];ep++;const Mn=model(W);hist.push(Mn.L);if(hitAt===null&&Math.abs(Mn.dh)<0.01)hitAt=ep;}
  function stop(){if(timer){cancelAnimationFrame(timer);timer=null;}}
  let last=0;
  const loop=tm=>{for(let k=0;k<2;k++)train1();if(tm-last>120){last=tm;writeW();}if(ep>=2000||(hitAt!==null&&ep>=hitAt+200)){stop();writeW();return;}timer=requestAnimationFrame(loop);};
  $('lsTr1').onclick=()=>{stop();train1();writeW();};
  $('lsTrRun').onclick=()=>{if(!timer)timer=requestAnimationFrame(loop);};
  $('lsTrStop').onclick=()=>{stop();writeW();};
  $('lsReset').onclick=()=>{stop();W=W0.slice();ep=0;hist=[];hitAt=null;writeW();};
  ids.forEach(id=>$(id).addEventListener('input',()=>{if(writing)return;W=ids.map(rv);}));
  ['lv_x','lv_hp','lv_cp','lv_y'].forEach(id=>$(id).addEventListener('input',()=>{ep=0;hist=[];hitAt=null;}));
  $('lsAlpha').addEventListener('input',()=>render());

  let lastHeavy=0;
  function render(){
    const M=model(W),now=performance.now(),heavy=!timer||now-lastHeavy>400;
    if(heavy)lastHeavy=now;
    cards(M,heavy);upd(M);
    if(g>0)backShow(false);
    window.__lstmSim={state:()=>({W:W.slice(),ep,L:model(W).L,h:model(W).h,hitAt}),run:n=>{stop();for(let i=0;i<n;i++)train1();writeW();},model:()=>model(W)};
  }
  window.__lstmSimRender=render;
  render();
})();
