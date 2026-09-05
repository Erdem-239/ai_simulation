/* XOR modülü — "elle 1 epoch" kartları: canlı eğitim döngüsü + dört grafik.
   2 GİZLİ NÖRONLU ağ; ağırlıklar rastgele/asimetrik bir başlangıçtan gradyan
   alçalma ile öğreniliyor. Amaç: gerçek geri yayılımın dört adımını sayılarla
   izletmek ve ağın kendi kendine XOR'u çözdüğünü göstermek.
   Her render'da ağırlıklar window.XORNET'e yazılır ve hemen yukarıdaki canlı
   mimari şeması (js/lesson-xor-arch.js) yeniden çizdirilir — şema ile kartlar
   TEK bir ağı gösterir. */
(function(){
  'use strict';
  const cv1 = document.getElementById('xe1Canvas');
  if(!cv1) return;

  const X = [[0,0],[0,1],[1,0],[1,1]];
  const Y = [0, 1, 1, 0];
  const LR = 3.0;
  const W1_0 = [[1.3,-0.3],[-1.4,1.0]];   // W1_0[k] = k. gizli nöronun [x1,x2] ağırlıkları
  const B1_0 = [-1.2, 0.25];
  const W2_0 = [1.2, -0.9];               // h1,h2 -> cikti agirliklari
  const B2_0 = -1.2;
  const LN2 = Math.log(2);

  const sig = z => 1/(1+Math.exp(-z));
  const $   = id => document.getElementById(id);
  const N = (v,d) => (Object.is(Math.round(v*10**d)/10**d, -0) ? 0 : v).toFixed(d).replace('-','−');

  let W1, B1, W2, B2, epoch, hist, timer = null;

  function clone(){ return [W1.map(r=>r.slice()), B1.slice(), W2.slice(), B2]; }

  function reset(){
    W1 = W1_0.map(r=>r.slice()); B1 = B1_0.slice(); W2 = W2_0.slice(); B2 = B2_0;
    epoch = 0; hist = [];
    record();
    render();
  }

  /* tam ileri besleme + kayıp + gradyanlar (batch, 4 örnek) */
  function state(){
    const z1 = X.map(x => [0,1].map(k => x[0]*W1[k][0] + x[1]*W1[k][1] + B1[k]));
    const h  = z1.map(row => row.map(sig));
    const z2 = h.map(hi => hi[0]*W2[0] + hi[1]*W2[1] + B2);
    const p  = z2.map(sig);
    const dz2 = p.map((pi,i) => pi - Y[i]);
    const L = -p.reduce((s,pi,i) => s + (Y[i]*Math.log(pi+1e-12) + (1-Y[i])*Math.log(1-pi+1e-12)), 0)/4;

    const dW2 = [0,1].map(k => h.reduce((s,hi,i) => s + hi[k]*dz2[i], 0)/4);
    const dB2 = dz2.reduce((s,e)=>s+e,0)/4;
    const dh  = dz2.map(e => [0,1].map(k => e*W2[k]));
    const dz1 = dh.map((row,i) => row.map((v,k) => v * h[i][k]*(1-h[i][k])));
    const dW1 = [0,1].map(k => [0,1].map(j => X.reduce((s,x,i) => s + x[j]*dz1[i][k], 0)/4));
    const dB1 = [0,1].map(k => dz1.reduce((s,row)=>s+row[k],0)/4);

    return {z1,h,z2,p,dz2,L,dW2,dB2,dh,dz1,dW1,dB1};
  }

  function record(){
    const s = state();
    hist.push({L: s.L});
  }

  function step(){
    const s = state();
    W1 = [0,1].map(k => [0,1].map(j => W1[k][j] - LR*s.dW1[k][j]));
    B1 = [0,1].map(k => B1[k] - LR*s.dB1[k]);
    W2 = [0,1].map(k => W2[k] - LR*s.dW2[k]);
    B2 = B2 - LR*s.dB2;
    epoch++;
    record();
    render();
  }

  function converged(){
    const s = state();
    const ok = s.p.every((pi,i) => (pi>=0.5)===(Y[i]===1));
    return ok && s.L < 0.03;
  }

  function auto(){
    if(timer) return;
    timer = setInterval(() => {
      step();
      if(epoch >= 3000 || converged()){ stop(); }
    }, 30);
  }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }

  /* ---------- çizim yardımcıları ---------- */
  function clr(cv){ const c = cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height); return c; }
  function axis(c, x0, y0, x1, y1){
    c.strokeStyle = '#334063'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x0,y0); c.lineTo(x1,y0); c.stroke();
    c.beginPath(); c.moveTo(x0,y0); c.lineTo(x0,y1); c.stroke();
  }

  /* 1) çıktı katmanının sigmoid eğrisi + dört noktanın (z2,p) konumu */
  function draw1(s){
    const cv = cv1, c = clr(cv);
    const L=30, R=cv.width-8, T=10, B=cv.height-20;
    const zx = z => L + (Math.max(-6,Math.min(6,z))+6)/12 * (R-L);
    const py = p => B - p*(B-T);
    axis(c, L, B, R, T);
    c.strokeStyle='#4a5578'; c.setLineDash([3,3]);
    c.beginPath(); c.moveTo(L,py(0.5)); c.lineTo(R,py(0.5)); c.stroke();
    c.setLineDash([]);
    c.strokeStyle='#5aa0e0'; c.lineWidth=2; c.beginPath();
    for(let i=0;i<=120;i++){ const z=-6+12*i/120; const x=zx(z), y=py(sig(z)); i?c.lineTo(x,y):c.moveTo(x,y); }
    c.stroke();
    s.p.forEach((pi,i) => {
      const x = zx(s.z2[i]), y = py(pi);
      c.fillStyle = Y[i] ? '#46c46a' : '#e06a6a';
      c.beginPath(); c.arc(x,y,4.5,0,7); c.fill();
      c.strokeStyle = '#0c1224'; c.lineWidth=1.2; c.stroke();
    });
    c.fillStyle='#6b7794'; c.font='9px Segoe UI';
    c.fillText('0.5', 6, py(0.5)+3);
    c.textAlign='center'; c.fillText('z₂', (L+R)/2, cv.height-6); c.textAlign='start';
  }

  /* 2) kayıp eğrisi + ln2 tabanı */
  function draw2(){
    const cv = $('xe2Canvas'), c = clr(cv);
    const L=38, R=cv.width-8, T=10, B=cv.height-20;
    const n = hist.length;
    const lo = Math.min(0.01, ...hist.map(h=>h.L)) - 0.004;
    const hi = Math.max(LN2, ...hist.map(h=>h.L)) + 0.004;
    const xx = i => L + (n<2 ? 0 : i/(n-1))*(R-L);
    const yy = v => B - (v-lo)/(hi-lo || 1)*(B-T);
    axis(c, L, B, R, T);
    c.strokeStyle='#e0a84a'; c.setLineDash([4,3]); c.lineWidth=1.4;
    c.beginPath(); c.moveTo(L,yy(LN2)); c.lineTo(R,yy(LN2)); c.stroke();
    c.setLineDash([]);
    c.fillStyle='#e0a84a'; c.font='9px Segoe UI'; c.fillText('ln2', L+3, yy(LN2)-3);
    c.strokeStyle='#f0a032'; c.lineWidth=2; c.beginPath();
    hist.forEach((h,i)=>{ const x=xx(i), y=yy(h.L); i?c.lineTo(x,y):c.moveTo(x,y); });
    c.stroke();
    if(n){ const x=xx(n-1), y=yy(hist[n-1].L); c.fillStyle='#fff'; c.beginPath(); c.arc(x,y,3,0,7); c.fill(); }
    c.fillStyle='#6b7794'; c.font='9px Segoe UI';
    c.fillText(hi.toFixed(2), 2, T+8); c.fillText(lo.toFixed(2), 2, B);
    c.textAlign='center'; c.fillText('epoch', (L+R)/2, cv.height-6); c.textAlign='start';
  }

  /* 3) hata çubukları (p − y), çıktı katmanı */
  function draw3(s){
    const cv = $('xe3Canvas'), c = clr(cv);
    const L=34, R=cv.width-8, T=12, B=cv.height-22;
    const mid=(T+B)/2;
    c.strokeStyle='#334063'; c.lineWidth=1;
    c.beginPath(); c.moveTo(L,mid); c.lineTo(R,mid); c.stroke();
    c.beginPath(); c.moveTo(L,T); c.lineTo(L,B); c.stroke();
    const bw=(R-L)/4*0.46;
    s.dz2.forEach((e,i)=>{
      const cx = L + (R-L)*(i+0.5)/4;
      const h = e*(mid-T);
      c.fillStyle = e>0 ? 'rgba(224,106,106,.75)' : 'rgba(90,160,224,.75)';
      c.fillRect(cx-bw/2, e>0?mid-h:mid, bw, Math.abs(h));
      c.fillStyle='#95a2c2'; c.font='8.5px Segoe UI'; c.textAlign='center';
      c.fillText(`(${X[i][0]},${X[i][1]})`, cx, B+12);
      c.fillStyle = e>0 ? '#e06a6a' : '#5aa0e0';
      c.fillText(N(e,2), cx, e>0 ? mid-h-3 : mid+Math.abs(h)+9);
    });
    c.textAlign='start'; c.fillStyle='#6b7794'; c.font='9px Segoe UI';
    c.fillText('+1', 6, T+8); c.fillText(' 0', 6, mid+3); c.fillText('−1', 6, B);
  }

  /* 4) iki gizli nöronun ayırıcı çizgisi, x1-x2 birim karede */
  function draw4(){
    const cv = $('xe4Canvas'), c = clr(cv);
    const L=26, R=cv.width-10, T=10, B=cv.height-10;
    const px = x => L + x*(R-L), py = y => B - y*(B-T);
    axis(c, L, B, R, T);
    // W1[k][0]*x1 + W1[k][1]*x2 + B1[k] = 0  ->  x2 = -(W1[k][0]*x1+B1[k])/W1[k][1]
    [[0,'#5aa0e0'], [1,'#f0a032']].forEach(([k,col])=>{
      const w0=W1[k][0], w1=W1[k][1], b=B1[k];
      c.strokeStyle=col; c.lineWidth=1.8; c.beginPath();
      let started=false;
      for(let xi=-0.3; xi<=1.3; xi+=0.05){
        if(Math.abs(w1) < 1e-6) continue;
        const y = -(w0*xi+b)/w1;
        if(y < -0.3 || y > 1.3) { started=false; continue; }
        const X_=px(xi), Y_=py(y);
        if(!started){ c.moveTo(X_,Y_); started=true; } else c.lineTo(X_,Y_);
      }
      c.stroke();
    });
    // 4 nokta
    X.forEach((x,i)=>{
      c.fillStyle = Y[i] ? '#46c46a' : '#e06a6a';
      c.beginPath(); c.arc(px(x[0]), py(x[1]), 5, 0, 7); c.fill();
      c.strokeStyle='#0c1224'; c.lineWidth=1.2; c.stroke();
    });
    c.font='9px Segoe UI';
    c.fillStyle='#5aa0e0'; c.fillText('h₁', R-30, T+9);
    c.fillStyle='#f0a032'; c.fillText('h₂', R-14, T+9);
  }

  /* ---------- ekrana yaz ---------- */
  function render(){
    const s = state();
    const tah = s.p.map(pi => pi>=0.5 ? 1 : 0);
    const dogru = tah.filter((t,i)=>t===Y[i]).length;

    // yukarıdaki canlı mimari şeması aynı ağırlıkları okusun
    window.XORNET = {W1: W1.map(r=>r.slice()), B1: B1.slice(), W2: W2.slice(), B2, epoch, L: s.L};
    if(window.__xorArchRender) window.__xorArchRender();

    $('xeState').innerHTML =
      `epoch <b>${epoch}</b>   ·   kayıp L = <b>${N(s.L,6)}</b>\n` +
      `TAHMİNLER:  ` +
      X.map((x,i) => {
        const ok = tah[i]===Y[i];
        return `(${x[0]},${x[1]})→<b style="color:${ok?'#46c46a':'#e06a6a'}">${tah[i]}</b>${ok?'✓':'✗'}`;
      }).join('   ') +
      `   ·   doğru: <b style="color:${dogru===4?'#46c46a':'#f0a032'}">${dogru}/4</b>`;

    // Kart 1
    for(let i=0;i<4;i++){
      $('xe1h1'+i).textContent = N(s.h[i][0],3);
      $('xe1h2'+i).textContent = N(s.h[i][1],3);
      $('xe1p'+i).textContent  = N(s.p[i],4);
      $('xe1t'+i).textContent  = tah[i];
      const ok = tah[i]===Y[i];
      const k = $('xe1k'+i); k.textContent = ok?'✓':'✗'; k.style.color = ok?'#46c46a':'#e06a6a';
    }
    $('xe1c').textContent = `doğru: ${dogru}/4`;
    $('xe1detail').textContent =
      `z₁=[${N(s.z1[3][0],2)}, ${N(s.z1[3][1],2)}] → h=[${N(s.h[3][0],3)}, ${N(s.h[3][1],3)}] → z₂=${N(s.z2[3],2)} → p=${N(s.p[3],3)}`;
    draw1(s);

    // Kart 2
    $('xe2L').textContent = `L = ${N(s.L,6)}\ntaban (ln2) = 0.693147\nfark = ${N(s.L-LN2,6)}`;
    draw2();

    // Kart 3
    for(let i=0;i<4;i++){
      $('xe3p'+i).textContent = N(s.p[i],4);
      $('xe3e'+i).textContent = (s.dz2[i]>=0?'+':'')+N(s.dz2[i],4);
    }
    $('xe3g').textContent =
      `dh ör. (1,1) → [${N(s.dh[3][0],3)}, ${N(s.dh[3][1],3)}]   (gizli katmana geri akan pay)\n\n` +
      `dW₂=[${N(s.dW2[0],3)},${N(s.dW2[1],3)}]  dB₂=${N(s.dB2,3)}\n` +
      `dW₁=[[${N(s.dW1[0][0],3)},${N(s.dW1[0][1],3)}],[${N(s.dW1[1][0],3)},${N(s.dW1[1][1],3)}]]  dB₁=[${N(s.dB1[0],3)},${N(s.dB1[1],3)}]`;
    draw3(s);

    // Kart 4
    const nW1 = [0,1].map(k=>[0,1].map(j=>W1[k][j]-LR*s.dW1[k][j]));
    const nB1 = [0,1].map(k=>B1[k]-LR*s.dB1[k]);
    const nW2 = [0,1].map(k=>W2[k]-LR*s.dW2[k]);
    const nB2 = B2-LR*s.dB2;
    $('xe4u').textContent =
      `W₁: [[${N(W1[0][0],3)},${N(W1[0][1],3)}],[${N(W1[1][0],3)},${N(W1[1][1],3)}]] → [[${N(nW1[0][0],3)},${N(nW1[0][1],3)}],[${N(nW1[1][0],3)},${N(nW1[1][1],3)}]]\n` +
      `b₁: [${N(B1[0],3)},${N(B1[1],3)}] → [${N(nB1[0],3)},${N(nB1[1],3)}]\n` +
      `W₂: [${N(W2[0],3)},${N(W2[1],3)}] → [${N(nW2[0],3)},${N(nW2[1],3)}]\n` +
      `b₂: ${N(B2,3)} → ${N(nB2,3)}`;
    draw4();

    const box = $('xeSonuc');
    if(converged()){
      box.innerHTML = `🏁 <b>Başardı!</b> ${epoch} epoch sonunda ağ <b>4/4</b> doğru — kayıp <b>${N(s.L,5)}</b>, ln2 tabanının çok altında. ` +
        `Gizli katman kendi kendine, hiçbir OR/AND etiketi görmeden, elle kurduğumuz mantığa benzer bir ayrım buldu. ` +
        `Yukarıdaki şemada ağırlıkların nereye oturduğuna bak — TEK nöronlu bir modelde aynı döngü kayıp ln2'de takılı kalırdı (➕ Ekstra'daki oyuncakta "🌊 Sigmoid ile TEK nöron" moduyla görebilirsin); <b>fark birebir bu gizli katman</b>.`;
    } else if(epoch === 0){
      box.innerHTML = `▶ <b>Başlamak için "1 epoch"a bas.</b> İlk epoch'larda kayıp neredeyse hiç düşmüyor gibi görünebilir (ln2 civarında dolaşır) — ` +
        `sabırlı ol, ⏩ ile devam et. Bir noktadan sonra hızla düşmeye başlayacak.`;
    } else {
      box.innerHTML = `🔄 <b>${epoch}. epoch bitti.</b> Şu an <b>${dogru}/4</b> doğru · kayıp <b>${N(s.L,6)}</b> (ln2=0.693147). Devam et.`;
    }
  }

  const on = (id, fn) => { const el = $(id); if(el) el.addEventListener('click', fn); };
  on('xeStep',  () => { stop(); step(); });
  on('xeAuto',  auto);
  on('xeStop',  stop);
  on('xeReset', () => { stop(); reset(); });

  reset();
})();
