(function(){
  // ---- veri / durum ----
  let data = [[6,4],[8,6]];
  let t0=0, t1=0, alpha=0.01, iter=0;
  let costHist=[], timer=null, mode=null, phase=0, dragIdx=-1;
  let tmp={h:[], E:0, d0:0, d1:0, n0:0, n1:0};

  const $=id=>document.getElementById(id);
  function m(){ return data.length; }
  function cost(a,b){ let s=0; for(const[x,y]of data){const e=a+b*x-y; s+=e*e;} return data.length?s/(2*m()):0; }
  function fmt(v,d=5){ return (isFinite(v)?v:0).toFixed(d); }

  // ---- koordinat dönüşümü (fit grafiği) ----
  const fc=$('fit'), fx=fc.getContext('2d');
  const cc=$('cost'), cx=cc.getContext('2d');
  const PAD=38, XMAX=10, YMAX=10;
  const Xf  = v => PAD+(fc.width-PAD-12)*(v/XMAX);
  const Yf  = v => (fc.height-PAD)-(fc.height-PAD-8)*(v/YMAX);
  const invX= p => (p-PAD)/(fc.width-PAD-12)*XMAX;
  const invY= p => ((fc.height-PAD)-p)/(fc.height-PAD-8)*YMAX;
  const clamp=v => Math.max(0, Math.min(10, Math.round(v*100)/100));

  // ---- hesap (commit etmeden) ----
  function computeAll(){
    tmp.h=data.map(([x,])=>t0+t1*x);
    tmp.E=cost(t0,t1);
    tmp.d0=data.reduce((s,[x,y])=>s+(t0+t1*x-y),0)/m();
    tmp.d1=data.reduce((s,[x,y])=>s+(t0+t1*x-y)*x,0)/m();
    tmp.n0=t0-alpha*tmp.d0; tmp.n1=t1-alpha*tmp.d1;
  }

  // ---- nokta editörü ----
  function renderPointsEditor(){
    const row=$('ptrow'); row.innerHTML='';
    data.forEach((p,i)=>{
      const cell=document.createElement('div'); cell.className='ptcell';
      cell.innerHTML='<label>x</label><input type="number" step="0.1" value="'+p[0]+'" data-i="'+i+'" data-c="0">'+
                     '<label>y</label><input type="number" step="0.1" value="'+p[1]+'" data-i="'+i+'" data-c="1">'+
                     '<button class="rm" data-rm="'+i+'" title="sil">×</button>';
      row.appendChild(cell);
    });
    $('ptcount').textContent=data.length;
    row.querySelectorAll('input').forEach(inp=>{
      inp.addEventListener('input',e=>{
        const i=+e.target.dataset.i, c=+e.target.dataset.c, val=parseFloat(e.target.value);
        if(!isNaN(val)){ data[i][c]=val; rebuildStep1(); fullReset(); }
      });
    });
    row.querySelectorAll('.rm').forEach(b=>{
      b.addEventListener('click',e=>{
        if(data.length<=2){ alert('En az 2 nokta gerekir.'); return; }
        data.splice(+e.target.dataset.rm,1); renderPointsEditor(); rebuildStep1(); fullReset();
      });
    });
  }
  function updateEditorValues(){
    $('ptrow').querySelectorAll('input').forEach(inp=>{
      inp.value=data[+inp.dataset.i][+inp.dataset.c];
    });
  }

  // ---- Adım 1 dinamik satırları ----
  function rebuildStep1(){
    const box=$('s1eqs'); box.innerHTML='';
    data.forEach((p,i)=>{
      const d=document.createElement('div'); d.className='eq';
      d.innerHTML='\\( h_{'+(i+1)+'}(x_{'+(i+1)+'})=\\Theta_0+\\Theta_1\\cdot '+p[0]+
                  ' = \\) <span class="v" id="h'+i+'">0.00000</span>';
      box.appendChild(d);
    });
    typesetMath(box);
  }
  // sadece verilen elemandaki LaTeX'i (yeniden) diz
  function typesetMath(el){
    if(window.MathJax && MathJax.typesetPromise){
      try{ MathJax.typesetClear && MathJax.typesetClear([el]); }catch(e){}
      MathJax.typesetPromise([el]).catch(()=>{});
    }
  }

  // ---- DOM güncelleme ----
  function refreshStatic(){
    $('cur0').textContent=fmt(t0); $('cur1').textContent=fmt(t1);
    const s0=$('th0slider'), s1=$('th1slider');
    if(s0){ s0.value=t0; $('th0val').textContent=t0.toFixed(2); }
    if(s1){ s1.value=t1; $('th1val').textContent=t1.toFixed(2); }
    $('hx').innerHTML='h(x) = Θ<sub>0</sub> + Θ<sub>1</sub>·x = <b>'+fmt(t0)+'</b> + <b>'+fmt(t1)+'</b>·x';
    $('iter').textContent=iter; $('curcost').textContent=fmt(cost(t0,t1),4);
    const s0t=$('s0text'); if(s0t) s0t.innerHTML = (iter===0)
      ? 'Θ<sub>0</sub> ve Θ<sub>1</sub> başlangıçta sıfıra ayarlandı.'
      : 'Şu an kullanılan Θ değerleri (iterasyon '+iter+' sonrası):';
    const eL=t0, eR=t0+t1*10;
    const wl='h(x) = '+fmt(t0,4)+' + '+fmt(t1,4)+'·x &nbsp;ile:<br>'+
      '• sol uç → x=0:&nbsp;&nbsp; y = '+fmt(t0,4)+' + '+fmt(t1,4)+'·0&nbsp;&nbsp; = '+fmt(t0,4)+' + 0 = <b>'+fmt(eL,4)+'</b><br>'+
      '• sağ uç → x=10: y = '+fmt(t0,4)+' + '+fmt(t1,4)+'·10 = '+fmt(t0,4)+' + '+fmt(t1*10,4)+' = <b>'+fmt(eR,4)+'</b>';
    const wlEl=$('workline'); if(wlEl) wlEl.innerHTML=wl;
    $('endLp').textContent=eL.toFixed(2); $('endRp').textContent=eR.toFixed(2);
  }
  function showH(){ data.forEach((p,i)=>{ const el=$('h'+i); if(el) el.textContent=fmt(tmp.h[i]); }); }

  // ---- mevcut Θ için tüm kutuları + ayrıntılı hesabı doldur ----
  function recompute(){
    computeAll();
    data.forEach((p,i)=>{ const el=$('h'+i); if(el) el.textContent=fmt(tmp.h[i]); });
    $('E').textContent=fmt(tmp.E);
    $('d0').textContent=fmt(tmp.d0); $('d1').textContent=fmt(tmp.d1);
    $('n0').textContent=fmt(tmp.n0); $('n1').textContent=fmt(tmp.n1);
    { const e0=$('n0echo'), e1=$('n1echo'); if(e0) e0.textContent=fmt(tmp.n0,4); if(e1) e1.textContent=fmt(tmp.n1,4); }
    updateWork(); refreshStatic(); draw();
  }
  // ---- ayrıntılı hesabın canlı dökümü (mevcut sayılarla) ----
  function updateWork(){
    const mm=m(), errs=data.map(([x,y],i)=>tmp.h[i]-y), sq=errs.map(e=>e*e);
    const sumSq=sq.reduce((a,b)=>a+b,0), sErr=errs.reduce((a,b)=>a+b,0);
    const sErrX=data.reduce((a,[x,y],i)=>a+errs[i]*x,0);
    let w1='Θ₀='+fmt(t0,4)+', Θ₁='+fmt(t1,4)+' ile her nokta:<br>';
    data.forEach((p,i)=>{ w1+='h'+(i+1)+' = '+fmt(t0,4)+' + '+fmt(t1,4)+'·'+p[0]+' = <b>'+fmt(tmp.h[i],4)+'</b><br>'; });
    $('work1').innerHTML=w1;
    let w2='m = '+mm+'<br>';
    w2+='hatalar (hᵢ−yᵢ): '+data.map(([x,y],i)=>'('+fmt(tmp.h[i],3)+'−'+y+') = '+fmt(errs[i],3)).join(' ; ')+'<br>';
    w2+='kareler: '+sq.map(e=>fmt(e,3)).join(' + ')+' = '+fmt(sumSq,3)+'<br>';
    w2+='E = 1 / (2·'+mm+') × '+fmt(sumSq,3)+' = <b>'+fmt(tmp.E,5)+'</b>';
    $('work2').innerHTML=w2;
    let w3='∂E/∂Θ₀ = 1/'+mm+' × ['+errs.map(e=>'('+fmt(e,3)+')').join(' + ')+'] = 1/'+mm+'×('+fmt(sErr,3)+') = <b>'+fmt(tmp.d0,5)+'</b><br>';
    w3+='∂E/∂Θ₁ = 1/'+mm+' × ['+data.map(([x,y],i)=>'('+fmt(errs[i],3)+'·'+x+')').join(' + ')+'] = 1/'+mm+'×('+fmt(sErrX,3)+') = <b>'+fmt(tmp.d1,5)+'</b>';
    $('work3').innerHTML=w3;
    let w4='Θ₀ := '+fmt(t0,4)+' − '+alpha+'×('+fmt(tmp.d0,4)+') = <b>'+fmt(tmp.n0,5)+'</b><br>';
    w4+='Θ₁ := '+fmt(t1,4)+' − '+alpha+'×('+fmt(tmp.d1,4)+') = <b>'+fmt(tmp.n1,5)+'</b>';
    $('work4').innerHTML=w4;
    // limit yönteminin sayısal kanıtı (h=0.001 ile)
    const wlimEl=$('worklimit');
    if(wlimEl){
      const hh=0.001, E0=cost(t0,t1);
      const E0h=cost(t0+hh,t1), E1h=cost(t0,t1+hh);
      const ap0=(E0h-E0)/hh, ap1=(E1h-E0)/hh;
      let wl='h = 0.001  (çok küçük bir adım)<br><br>';
      wl+='<u>Θ₀ için:</u><br>';
      wl+='E(Θ₀)&nbsp;&nbsp; = '+E0.toFixed(6)+'<br>';
      wl+='E(Θ₀+h) = '+E0h.toFixed(6)+'<br>';
      wl+='[E(Θ₀+h) − E(Θ₀)] / h = ('+E0h.toFixed(6)+' − '+E0.toFixed(6)+') / 0.001 = <b>'+ap0.toFixed(5)+'</b><br>';
      wl+='→ gerçek türev ∂E/∂Θ₀ = <b>'+fmt(tmp.d0,5)+'</b> &nbsp;(neredeyse aynı ✓)<br><br>';
      wl+='<u>Θ₁ için:</u><br>';
      wl+='E(Θ₁+h) = '+E1h.toFixed(6)+'<br>';
      wl+='[E(Θ₁+h) − E(Θ₁)] / h = ('+E1h.toFixed(6)+' − '+E0.toFixed(6)+') / 0.001 = <b>'+ap1.toFixed(5)+'</b><br>';
      wl+='→ gerçek türev ∂E/∂Θ₁ = <b>'+fmt(tmp.d1,5)+'</b> &nbsp;(neredeyse aynı ✓)';
      wlimEl.innerHTML=wl;
    }
  }
  // ---- iterasyon ----
  function commit(){ computeAll(); t0=tmp.n0; t1=tmp.n1; iter++; costHist.push(cost(t0,t1)); }
  function fullStep(){ phase=0; commit(); recompute(); }
  // ▶ : faz faz — her basışta SADECE o adımın hesabını göster, sonrakiler boş (—) kalır
  function phaseTick(){
    if(phase===0){
      computeAll(); updateWork();
      ['E','d0','d1','n0','n1','n0echo','n1echo'].forEach(id=>{ const el=$(id); if(el) el.textContent='—'; });
      data.forEach((p,i)=>{ const el=$('h'+i); if(el) el.textContent=fmt(tmp.h[i]); });
      setActive('s1');
    } else if(phase===1){
      $('E').textContent=fmt(tmp.E); setActive('s2');
    } else if(phase===2){
      $('d0').textContent=fmt(tmp.d0); $('d1').textContent=fmt(tmp.d1); setActive('s3');
    } else if(phase===3){
      $('n0').textContent=fmt(tmp.n0); $('n1').textContent=fmt(tmp.n1);
      const e0=$('n0echo'), e1=$('n1echo'); if(e0) e0.textContent=fmt(tmp.n0,4); if(e1) e1.textContent=fmt(tmp.n1,4);
      t0=tmp.n0; t1=tmp.n1; iter++; costHist.push(cost(t0,t1));
      refreshStatic(); draw(); setActive('s4');
    }
    phase=(phase+1)%4;
  }
  function setActive(id){ ['s0','s1','s2','s3','s4'].forEach(s=>$(s).classList.toggle('active', s===id)); }

  // ---- motor ----
  function stopAll(){ if(timer){clearInterval(timer);timer=null;} mode=null; ['play','fast'].forEach(b=>$(b).classList.remove('on')); }
  function play(){ stopAll(); phaseTick(); }   // her basışta tek faz
  function fast(){ stopAll(); mode='fast'; phase=0; $('fast').classList.add('on'); setActive('s4');
    timer=setInterval(()=>{ for(let k=0;k<25;k++) commit(); recompute(); }, 50); }

  // sayaç/parametre sıfırlama (nokta sayısı değişmeden)
  function softReset(){ stopAll(); t0=0;t1=0;iter=0;phase=0; costHist=[cost(0,0)];
    setActive('s0'); recompute(); }
  // nokta sayısı değişince (Adım1 iskeleti yeniden kurulduktan sonra)
  function fullReset(){ softReset(); }

  // ---- çizim ----
  function axes(ctx,W,H,xmax,ymax,xlab,ylab){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#3a3d42'; ctx.lineWidth=1; ctx.fillStyle='#8a9097'; ctx.font='11px Segoe UI';
    for(let i=0;i<=xmax;i++){ const px=PAD+(W-PAD-12)*(i/xmax);
      ctx.globalAlpha=.25; ctx.beginPath(); ctx.moveTo(px,8); ctx.lineTo(px,H-PAD); ctx.stroke(); ctx.globalAlpha=1;
      ctx.fillText(i, px-3, H-PAD+14); }
    for(let j=0;j<=5;j++){ const v=ymax*j/5; const py=(H-PAD)-(H-PAD-8)*(j/5);
      ctx.globalAlpha=.25; ctx.beginPath(); ctx.moveTo(PAD,py); ctx.lineTo(W-12,py); ctx.stroke(); ctx.globalAlpha=1;
      ctx.fillText((Math.round(v*100)/100), 4, py+3); }
    ctx.fillStyle='#6f757c'; ctx.fillText(xlab, W/2-10, H-6);
    ctx.save(); ctx.translate(10,H/2); ctx.rotate(-Math.PI/2); ctx.fillText(ylab,0,0); ctx.restore();
  }
  function drawFit(){
    const W=fc.width,H=fc.height;
    axes(fx,W,H,XMAX,YMAX,'x','y');
    fx.strokeStyle='#cfd3d8'; fx.lineWidth=2; fx.beginPath();
    fx.moveTo(Xf(0),Yf(t0)); fx.lineTo(Xf(10),Yf(t0+t1*10)); fx.stroke();
    data.forEach((p,i)=>{ fx.fillStyle=(i===dragIdx?'#f0a032':'#2f9bff');
      fx.beginPath(); fx.arc(Xf(p[0]),Yf(p[1]),6,0,7); fx.fill(); });
  }
  function drawCost(){
    const W=cc.width,H=cc.height, n=costHist.length;
    const xmax=Math.max(10,n-1), ymax=Math.max(...costHist,0.0001)*1.1;
    axes(cx,W,H,xmax,ymax,'iterasyon','maliyet');
    const X=v=>PAD+(W-PAD-12)*(v/xmax), Y=v=>(H-PAD)-(H-PAD-8)*(v/ymax);
    cx.strokeStyle='#46c46a'; cx.lineWidth=2; cx.beginPath();
    costHist.forEach((c,i)=>{ const px=X(i),py=Y(c); i?cx.lineTo(px,py):cx.moveTo(px,py); }); cx.stroke();
    cx.fillStyle='#46c46a'; cx.beginPath(); cx.arc(X(n-1),Y(costHist[n-1]),3.5,0,7); cx.fill();
  }
  function draw(){ drawFit(); drawCost(); }

  // ---- grafikte tıkla/sürükle ----
  function evtPx(e){ const r=fc.getBoundingClientRect();
    return [(e.clientX-r.left)*(fc.width/r.width), (e.clientY-r.top)*(fc.height/r.height)]; }
  fc.addEventListener('mousedown', e=>{
    const [px,py]=evtPx(e); let idx=-1;
    data.forEach((p,i)=>{ if(Math.hypot(Xf(p[0])-px,Yf(p[1])-py)<14) idx=i; });
    if(idx<0){ data.push([clamp(invX(px)),clamp(invY(py))]); idx=data.length-1;
      renderPointsEditor(); rebuildStep1(); fullReset(); }
    dragIdx=idx; drawFit();
  });
  window.addEventListener('mousemove', e=>{
    if(dragIdx<0) return;
    const [px,py]=evtPx(e);
    data[dragIdx]=[clamp(invX(px)),clamp(invY(py))];
    updateEditorValues(); softReset();
  });
  window.addEventListener('mouseup', ()=>{ if(dragIdx>=0){ dragIdx=-1; rebuildStep1(); recompute(); } });

  // ---- alpha ----
  function setAlpha(a){ alpha=Math.min(0.035,Math.max(0.005,Math.round(a*1000)/1000)); $('aVal').textContent=alpha.toFixed(3); }

  // ---- adım kutusu aç/kapa ----
  document.querySelectorAll('.stephead').forEach(h=>{
    h.addEventListener('click', ()=> h.closest('.step').classList.toggle('open'));
  });
  // ---- ispat panelleri (accordion) aç/kapa ----
  document.querySelectorAll('.acc-head').forEach(h=>{
    h.addEventListener('click', e=>{ e.stopPropagation(); h.closest('.acc').classList.toggle('open'); });
  });

  // ---- sekmeler ----
  document.querySelectorAll('.tab').forEach(t=>{
    t.onclick=()=>{ document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.tabpane').forEach(x=>x.classList.remove('active'));
      t.classList.add('active'); $(t.dataset.t).classList.add('active'); };
  });

  // ---- buton bağlama ----
  $('aMinus').onclick=()=>setAlpha(alpha-0.005);
  $('aPlus').onclick =()=>setAlpha(alpha+0.005);
  $('play').onclick=play; $('fast').onclick=fast;
  $('step').onclick=()=>{ stopAll(); setActive('s4'); fullStep(); };
  $('stop').onclick=stopAll; $('reset').onclick=softReset;
  $('addpt').onclick=()=>{ data.push([Math.round(Math.random()*80)/10, Math.round(Math.random()*80)/10]);
    renderPointsEditor(); rebuildStep1(); fullReset(); };
  // Θ'yı elle ayarla (kaydırıcılar)
  function manualTheta(){ stopAll(); t0=parseFloat($('th0slider').value); t1=parseFloat($('th1slider').value);
    iter=0; phase=0; costHist=[cost(t0,t1)]; setActive('s0'); recompute(); }
  $('th0slider').oninput=manualTheta;
  $('th1slider').oninput=manualTheta;
  $('delpt').onclick=()=>{ if(data.length<=2){ alert('En az 2 nokta gerekir.'); return; }
    data.pop(); renderPointsEditor(); rebuildStep1(); fullReset(); };

  // ---- başlangıç ----
  renderPointsEditor(); rebuildStep1(); setAlpha(0.01); softReset();
})();
