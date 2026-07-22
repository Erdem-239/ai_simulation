/* Türev — 4 canlı simülasyon:
   1) Köprüden top atma  h(t)=45-5t²,  h'(t)=-10t  (hız = türev, ivme = 2. türev)
   2) Kurabiye tezgahı    K(x)=4x-0.05x², K'(x)=4-0.1x  (marjinal kâr = türev)
   3) h→0 limit tanımı     f(x)=x², sekant→tanjant
   4) En ucuz köprü        C(L)=0.5L²+200/L,  C'(L)=L-200/L²  (türev=0)  */
(function(){
  'use strict';
  const F = (v,d=3) => (isFinite(v) ? v.toFixed(d) : '—');

  /* ----- ortak grid çizici ----- */
  function drawAxes(ctx, W, H, xMin, xMax, yMin, yMax, {xLabel='', yLabel='', xTicks=5, yTicks=4}={}){
    const pad = {l:44, r:14, t:16, b:32};
    const gx0=pad.l, gx1=W-pad.r, gy0=pad.t, gy1=H-pad.b;
    const X = x => gx0 + (gx1-gx0)*(x-xMin)/(xMax-xMin);
    const Y = y => gy1 - (gy1-gy0)*(y-yMin)/(yMax-yMin);
    ctx.fillStyle='#12141a'; ctx.fillRect(0,0,W,H);
    // grid + ticks
    ctx.strokeStyle='#2a2e36'; ctx.lineWidth=1; ctx.fillStyle='#8a9099'; ctx.font='11px Segoe UI, Arial';
    ctx.textAlign='center';
    for(let i=0;i<=xTicks;i++){
      const xv = xMin + (xMax-xMin)*i/xTicks;
      const px = X(xv);
      ctx.beginPath(); ctx.moveTo(px,gy0); ctx.lineTo(px,gy1); ctx.stroke();
      ctx.fillText(xv.toFixed(xv===Math.floor(xv)?0:1), px, gy1+14);
    }
    ctx.textAlign='right';
    for(let j=0;j<=yTicks;j++){
      const yv = yMin + (yMax-yMin)*j/yTicks;
      const py = Y(yv);
      ctx.beginPath(); ctx.moveTo(gx0,py); ctx.lineTo(gx1,py); ctx.stroke();
      ctx.fillText(yv.toFixed(yv===Math.floor(yv)?0:1), gx0-6, py+3);
    }
    // axes
    ctx.strokeStyle='#5a6068'; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(gx0,gy1); ctx.lineTo(gx1,gy1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx0,gy0); ctx.lineTo(gx0,gy1); ctx.stroke();
    // labels
    ctx.fillStyle='#c0c5cc'; ctx.font='12px Segoe UI, Arial';
    if(xLabel){ ctx.textAlign='right'; ctx.fillText(xLabel, gx1-4, gy1-6); }
    if(yLabel){ ctx.textAlign='left'; ctx.fillText(yLabel, gx0+6, gy0+12); }
    return {X, Y, gx0, gx1, gy0, gy1};
  }

  function drawCurve(ctx, X, Y, fn, xMin, xMax, color, width=2, dash=null){
    ctx.strokeStyle = color; ctx.lineWidth = width;
    if(dash) ctx.setLineDash(dash); else ctx.setLineDash([]);
    ctx.beginPath();
    let first = true;
    const step = (xMax-xMin)/300;
    for(let x=xMin; x<=xMax+1e-9; x+=step){
      const y = fn(x);
      if(!isFinite(y)) continue;
      const px = X(x), py = Y(y);
      if(first){ ctx.moveTo(px,py); first=false; } else ctx.lineTo(px,py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* ==========================================================================
     SİM 1: Köprüden top atma
     ========================================================================== */
  (function bridge(){
    const cv = document.getElementById('tvBridgeCanvas');
    if(!cv) return;
    const tIn = document.getElementById('tvBridgeT');
    const tVal = document.getElementById('tvBridgeTv');
    const read = document.getElementById('tvBridgeRead');
    const play = document.getElementById('tvBridgePlay');
    const ctx = cv.getContext('2d');
    const H0 = 45, G = 10;
    const h = t => H0 - 0.5*G*t*t;
    const hPrime = t => -G*t;
    let animId = null;

    function render(){
      const W=cv.width, H=cv.height;
      // left: gerçek dünya sahnesi
      const sceneW = 200;
      ctx.fillStyle='#12141a'; ctx.fillRect(0,0,W,H);
      // köprü çiz
      ctx.strokeStyle='#5a6068'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(20,50); ctx.lineTo(sceneW-20,50); ctx.stroke();
      // support pillars
      ctx.fillStyle='#3a4048'; ctx.fillRect(24,50,10,H-70);
      ctx.fillRect(sceneW-34,50,10,H-70);
      // yerden
      ctx.strokeStyle='#46c46a'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(10,H-20); ctx.lineTo(sceneW-10,H-20); ctx.stroke();
      // yükseklik ekseni (sahne içinde)
      const t = parseFloat(tIn.value);
      const curH = Math.max(0, h(t));
      const ballY = 50 + (H-70) * (1 - curH/H0);
      ctx.fillStyle='#f0a032'; ctx.beginPath(); ctx.arc(sceneW/2, ballY, 10, 0, Math.PI*2); ctx.fill();
      // yükseklik etiketi
      ctx.fillStyle='#e7e9ec'; ctx.font='12px Segoe UI'; ctx.textAlign='center';
      ctx.fillText(F(curH,1)+' m', sceneW/2, ballY-16);
      // hız oku (aşağı doğru)
      const v = Math.abs(hPrime(t));
      if(v > 0.5){
        ctx.strokeStyle='#e06a6a'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(sceneW/2+18, ballY); ctx.lineTo(sceneW/2+18, ballY + Math.min(40, v*1.5)); ctx.stroke();
        // arrow head
        const ay = ballY + Math.min(40, v*1.5);
        ctx.beginPath(); ctx.moveTo(sceneW/2+18, ay); ctx.lineTo(sceneW/2+14, ay-6); ctx.lineTo(sceneW/2+22, ay-6); ctx.closePath();
        ctx.fillStyle='#e06a6a'; ctx.fill();
        ctx.fillStyle='#e06a6a'; ctx.font='11px Segoe UI'; ctx.textAlign='left';
        ctx.fillText(F(v,1)+' m/s', sceneW/2+26, ay-8);
      }

      // right: h(t) grafik
      const gCtx = {W: W - sceneW - 8, H: H, off: sceneW + 8};
      ctx.save();
      ctx.translate(gCtx.off, 0);
      const ax = drawAxes(ctx, gCtx.W, gCtx.H, 0, 3, 0, 50, {xLabel:'t (s)', yLabel:'h (m)', xTicks:6, yTicks:5});
      // eğri
      drawCurve(ctx, ax.X, ax.Y, h, 0, 3, '#3a7afe', 2);
      // tanjant (o anki eğim)
      const slope = hPrime(t);
      const y0 = h(t);
      const tanFn = xx => y0 + slope*(xx - t);
      drawCurve(ctx, ax.X, ax.Y, tanFn, Math.max(0, t-0.8), Math.min(3, t+0.8), '#ffd24a', 2.2);
      // nokta
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(ax.X(t), ax.Y(y0), 5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='#ffd24a'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.restore();

      // read-out
      read.innerHTML =
        '<b>Yükseklik:</b> h(t) = 45 − 5·t² = 45 − 5·('+F(t,2)+')² = <b style="color:#3a7afe">'+F(curH,2)+' m</b>'+
        '<br><b>Anlık hız (türev):</b> h′(t) = −10·t = −10·'+F(t,2)+' = <b style="color:#e06a6a">'+F(hPrime(t),2)+' m/s</b>'+
        '<br><span style="color:var(--muted); font-size:12px">↳ negatif işaret: top aşağı doğru gidiyor. Büyüklük artıyor çünkü ivmeleniyor (h″(t) = −10 = yerçekimi).</span>';
    }

    tIn.addEventListener('input', ()=>{ tVal.textContent = F(parseFloat(tIn.value),2)+' s'; render(); });
    play.addEventListener('click', ()=>{
      if(animId){ cancelAnimationFrame(animId); animId=null; play.textContent='▶ Bırak'; return; }
      let t0 = performance.now();
      tIn.value = 0; tVal.textContent = '0.00 s'; render();
      play.textContent='⏸ Durdur';
      const tick = ()=>{
        const dt = (performance.now() - t0) / 1000;
        if(dt >= 3){ tIn.value = 3; tVal.textContent='3.00 s'; render(); animId=null; play.textContent='▶ Bırak'; return; }
        tIn.value = dt; tVal.textContent = F(dt,2)+' s'; render();
        animId = requestAnimationFrame(tick);
      };
      animId = requestAnimationFrame(tick);
    });
    render();
  })();

  /* ==========================================================================
     SİM 2: Kurabiye tezgahı
     ========================================================================== */
  (function cookie(){
    const cv = document.getElementById('tvCookieCanvas');
    if(!cv) return;
    const xIn = document.getElementById('tvCookieX');
    const xVal = document.getElementById('tvCookieXv');
    const read = document.getElementById('tvCookieRead');
    const ctx = cv.getContext('2d');
    const K = x => 4*x - 0.05*x*x;
    const Kp = x => 4 - 0.1*x;

    function render(){
      const W=cv.width, H=cv.height;
      const ax = drawAxes(ctx, W, H, 0, 60, 0, 90, {xLabel:'x (kurabiye)', yLabel:'K (TL)', xTicks:6, yTicks:6});
      // eğri
      drawCurve(ctx, ax.X, ax.Y, K, 0, 60, '#d4a94a', 2);
      // tepe noktası dikey işaret (x=40, K'=0)
      const peakX = 40;
      ctx.strokeStyle='#46c46a'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(ax.X(peakX), ax.gy0); ctx.lineTo(ax.X(peakX), ax.gy1); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='#46c46a'; ctx.font='11px Segoe UI'; ctx.textAlign='center';
      ctx.fillText('x=40 (tepe)', ax.X(peakX), ax.gy0-2);

      const x = parseFloat(xIn.value);
      const y0 = K(x), slope = Kp(x);
      // tanjant
      const tanFn = xx => y0 + slope*(xx-x);
      drawCurve(ctx, ax.X, ax.Y, tanFn, Math.max(0, x-14), Math.min(60, x+14), '#ffd24a', 2.2);
      // nokta
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(ax.X(x), ax.Y(y0), 5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='#ffd24a'; ctx.lineWidth=1.5; ctx.stroke();

      // color-coded verdict
      let verdict, vColor;
      if(Math.abs(slope) < 0.1){ verdict='türev ≈ 0 → tam tepede, üretme kararını değiştirme'; vColor='#46c46a'; }
      else if(slope > 0){ verdict='türev > 0 → bir kurabiye daha KÂR getirir, üretimi artır'; vColor='#3a7afe'; }
      else { verdict='türev < 0 → bir kurabiye daha ZARAR getirir, üretimi azalt'; vColor='#e06a6a'; }

      read.innerHTML =
        '<b>Toplam kâr:</b> K(x) = 4x − 0.05x² = 4·'+x+' − 0.05·'+x+'² = <b style="color:#d4a94a">'+F(y0,2)+' TL</b>'+
        '<br><b>Marjinal kâr (türev):</b> K′(x) = 4 − 0.1x = 4 − 0.1·'+x+' = <b style="color:'+vColor+'">'+F(slope,3)+' TL/kurabiye</b>'+
        '<br><span style="color:'+vColor+'; font-weight:600">🎯 '+verdict+'</span>';
    }
    xIn.addEventListener('input', ()=>{ xVal.textContent = xIn.value+' kurabiye'; render(); });
    render();
  })();

  /* ==========================================================================
     SİM 3: h→0 limit tanımı (f(x)=x²)
     ========================================================================== */
  (function lim(){
    const cv = document.getElementById('tvLimCanvas');
    if(!cv) return;
    const xIn = document.getElementById('tvLimX');
    const hIn = document.getElementById('tvLimH');
    const xVal = document.getElementById('tvLimXv');
    const hVal = document.getElementById('tvLimHv');
    const read = document.getElementById('tvLimRead');
    const ctx = cv.getContext('2d');
    const f = x => x*x;
    const fp = x => 2*x;

    function render(){
      const W=cv.width, H=cv.height;
      const ax = drawAxes(ctx, W, H, -3, 3, -1, 9, {xLabel:'x', yLabel:'f(x)=x²', xTicks:6, yTicks:5});
      drawCurve(ctx, ax.X, ax.Y, f, -3, 3, '#3a7afe', 2);
      const x = parseFloat(xIn.value);
      const h = parseFloat(hIn.value);
      const y0 = f(x), y1 = f(x+h);
      const sec = (y1-y0)/h;
      const trueSlope = fp(x);
      // tanjant (yeşil, arka planda)
      const tanFn = xx => y0 + trueSlope*(xx-x);
      drawCurve(ctx, ax.X, ax.Y, tanFn, Math.max(-3, x-1.5), Math.min(3, x+1.5), '#46c46a', 2, [6,4]);
      // sekant (mavi kesik)
      const secFn = xx => y0 + sec*(xx-x);
      drawCurve(ctx, ax.X, ax.Y, secFn, Math.max(-3, x-0.5), Math.min(3, x+h+0.5), '#5aa0e0', 2.2);
      // iki nokta
      ctx.fillStyle='#fff';
      ctx.beginPath(); ctx.arc(ax.X(x), ax.Y(y0), 5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='#ffd24a'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='#ffd24a';
      ctx.beginPath(); ctx.arc(ax.X(x+h), ax.Y(y1), 5, 0, Math.PI*2); ctx.fill();
      // h etiketi
      ctx.strokeStyle='#f0a032'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(ax.X(x), ax.Y(y0)); ctx.lineTo(ax.X(x+h), ax.Y(y0));
      ctx.moveTo(ax.X(x+h), ax.Y(y0)); ctx.lineTo(ax.X(x+h), ax.Y(y1)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='#f0a032'; ctx.font='11px Segoe UI'; ctx.textAlign='center';
      ctx.fillText('h='+F(h,2), (ax.X(x)+ax.X(x+h))/2, ax.Y(y0)+14);

      const err = Math.abs(sec - trueSlope);
      read.innerHTML =
        '<b>Sekant eğimi:</b> [f(x+h)−f(x)] / h = ['+F(y1,3)+' − '+F(y0,3)+'] / '+F(h,3)+' = <b style="color:#5aa0e0">'+F(sec,4)+'</b>'+
        '<br><b>Gerçek türev (limit):</b> f′(x) = 2x = 2·'+F(x,2)+' = <b style="color:#46c46a">'+F(trueSlope,4)+'</b>'+
        '<br><span style="color:var(--muted); font-size:12px">↳ hata: '+F(err,4)+' — h küçüldükçe hata da küçülür (h → 0 için hata → 0)</span>';
    }
    xIn.addEventListener('input', ()=>{ xVal.textContent = F(parseFloat(xIn.value),2); render(); });
    hIn.addEventListener('input', ()=>{ hVal.textContent = F(parseFloat(hIn.value),2); render(); });
    render();
  })();

  /* ==========================================================================
     SİM 4: En ucuz köprü — türev = 0
     ========================================================================== */
  (function opt(){
    const cv = document.getElementById('tvOptCanvas');
    if(!cv) return;
    const LIn = document.getElementById('tvOptL');
    const LVal = document.getElementById('tvOptLv');
    const read = document.getElementById('tvOptRead');
    const solve = document.getElementById('tvOptSolve');
    const ctx = cv.getContext('2d');
    const C = L => 0.5*L*L + 200/L;
    const Cp = L => L - 200/(L*L);
    const optL = Math.pow(200, 1/3);
    let animId = null;

    function render(){
      const W=cv.width, H=cv.height;
      const ax = drawAxes(ctx, W, H, 2, 14, 0, 200, {xLabel:'L (m)', yLabel:'C (TL)', xTicks:6, yTicks:5});
      drawCurve(ctx, ax.X, ax.Y, C, 2, 14, '#e06a6a', 2);
      // optimum dikey işaret
      ctx.strokeStyle='#46c46a'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(ax.X(optL), ax.gy0); ctx.lineTo(ax.X(optL), ax.gy1); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='#46c46a'; ctx.font='11px Segoe UI'; ctx.textAlign='center';
      ctx.fillText('L≈'+F(optL,2)+' (optimum)', ax.X(optL), ax.gy0-2);

      const L = parseFloat(LIn.value);
      const y0 = C(L), slope = Cp(L);
      const tanFn = xx => y0 + slope*(xx-L);
      drawCurve(ctx, ax.X, ax.Y, tanFn, Math.max(2, L-3), Math.min(14, L+3), '#ffd24a', 2.2);
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(ax.X(L), ax.Y(y0), 5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='#ffd24a'; ctx.lineWidth=1.5; ctx.stroke();

      let dir, dColor;
      if(Math.abs(slope) < 0.5){ dir='türev ≈ 0 → optimuma çok yakın'; dColor='#46c46a'; }
      else if(slope > 0){ dir='türev > 0 → L\'yi AZALT (daha kısa köprü daha ucuz)'; dColor='#3a7afe'; }
      else { dir='türev < 0 → L\'yi ARTIR (daha uzun köprü daha ucuz)'; dColor='#e06a6a'; }

      read.innerHTML =
        '<b>Toplam maliyet:</b> C(L) = 0.5·L² + 200/L = '+F(0.5*L*L,2)+' + '+F(200/L,2)+' = <b style="color:#e06a6a">'+F(y0,2)+' TL</b>'+
        '<br><b>Türev:</b> C′(L) = L − 200/L² = '+F(L,2)+' − '+F(200/(L*L),2)+' = <b style="color:'+dColor+'">'+F(slope,3)+'</b>'+
        '<br><span style="color:'+dColor+'; font-weight:600">🎯 '+dir+'</span>';
    }

    LIn.addEventListener('input', ()=>{ LVal.textContent = F(parseFloat(LIn.value),1)+' m'; render(); });
    solve.addEventListener('click', ()=>{
      if(animId) return;
      // gradient descent
      let L = parseFloat(LIn.value);
      const alpha = 0.4;
      let step = 0;
      const tick = ()=>{
        const g = Cp(L);
        if(Math.abs(g) < 0.005 || step > 40){ animId=null; return; }
        L = Math.max(2, Math.min(14, L - alpha*g));
        LIn.value = L; LVal.textContent = F(L,1)+' m'; render();
        step++;
        animId = setTimeout(tick, 120);
      };
      tick();
    });
    render();
  })();
})();
