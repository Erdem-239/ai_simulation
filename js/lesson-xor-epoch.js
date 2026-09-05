/* XOR modülü — "elle 1 epoch" kartları: canlı eğitim döngüsü + dört grafik.
   TEK nöronlu model (kasıtlı): XOR'u çözemez. Amaç, gradyan alçalmanın dört
   adımını sayılarla izletmek ve sonunda "en uygun ağırlıklar" olarak
   w=[0,0], b=0 çıktığını — yani modelin pes ettiğini — göstermek.
   Kayıp tabanı ln2 ≈ 0.6931 = "her şeye 0.5 de" seviyesi. */
(function(){
  'use strict';
  const cv1 = document.getElementById('xe1Canvas');
  if(!cv1) return;

  const X = [[0,0],[0,1],[1,0],[1,1]];
  const Y = [0, 1, 1, 0];
  const LR = 0.5;
  const W0 = [0.7, -0.3], B0 = 0.1;
  const LN2 = Math.log(2);

  const sig = z => 1/(1+Math.exp(-z));
  const $   = id => document.getElementById(id);
  // eksi işaretini tipografik "−" yap, "−0.00" çirkinliğini engelle
  const N = (v,d) => (Object.is(Math.round(v*10**d)/10**d, -0) ? 0 : v).toFixed(d).replace('-','−');

  let w, b, epoch, hist, timer = null;

  function reset(){
    w = W0.slice(); b = B0; epoch = 0;
    hist = [];
    record();
    render();
  }

  /* o anki durumun tüm ara değerleri */
  function state(){
    const z = X.map(x => x[0]*w[0] + x[1]*w[1] + b);
    const p = z.map(sig);
    const err = p.map((pi,i) => pi - Y[i]);
    const L = -p.reduce((s,pi,i) => s + (Y[i]*Math.log(pi+1e-12) + (1-Y[i])*Math.log(1-pi+1e-12)), 0)/4;
    const gw = [0,1].map(j => X.reduce((s,x,i) => s + x[j]*err[i], 0)/4);
    const gb = err.reduce((s,e) => s+e, 0)/4;
    return {z, p, err, L, gw, gb};
  }

  function record(){
    const s = state();
    hist.push({L: s.L, w1: w[0], w2: w[1], b: b});
  }

  function step(){
    const s = state();
    w = [w[0] - LR*s.gw[0], w[1] - LR*s.gw[1]];
    b = b - LR*s.gb;
    epoch++;
    record();
    render();
    return s.L;
  }

  /* Yakınsama ölçütü: kaybın ln2'ye yapışması TEK BAŞINA yetmiyor — kayıp
     ~100. epoch'ta tabana çok yaklaşıyor ama ağırlıklar hâlâ 0.03 civarında.
     "Hepsi sıfır" diyebilmek için ağırlıkların da sıfıra inmesini bekliyoruz. */
  function converged(){
    const L = hist[hist.length-1].L;
    return Math.abs(L - LN2) < 1e-6 && Math.max(Math.abs(w[0]), Math.abs(w[1]), Math.abs(b)) < 0.002;
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
  function clr(cv){
    const c = cv.getContext('2d');
    c.clearRect(0,0,cv.width,cv.height);
    return c;
  }
  function axis(c, x0, y0, x1, y1){
    c.strokeStyle = '#334063'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x0,y0); c.lineTo(x1,y0); c.stroke();      // yatay
    c.beginPath(); c.moveTo(x0,y0); c.lineTo(x0,y1); c.stroke();      // dikey
  }

  /* 1) sigmoid eğrisi + dört noktanın (z,p) konumu */
  function draw1(s){
    const cv = cv1, c = clr(cv);
    const L=30, R=cv.width-8, T=10, B=cv.height-20;
    const zx = z => L + (z+6)/12 * (R-L);
    const py = p => B - p*(B-T);
    axis(c, L, B, R, T);
    // p=0.5 kesikli
    c.strokeStyle='#4a5578'; c.setLineDash([3,3]);
    c.beginPath(); c.moveTo(L,py(0.5)); c.lineTo(R,py(0.5)); c.stroke();
    c.setLineDash([]);
    // sigmoid
    c.strokeStyle='#5aa0e0'; c.lineWidth=2; c.beginPath();
    for(let i=0;i<=120;i++){ const z=-6+12*i/120; const x=zx(z), y=py(sig(z)); i?c.lineTo(x,y):c.moveTo(x,y); }
    c.stroke();
    // noktalar
    s.p.forEach((pi,i) => {
      const x = zx(Math.max(-6, Math.min(6, s.z[i]))), y = py(pi);
      c.fillStyle = Y[i] ? '#46c46a' : '#e06a6a';
      c.beginPath(); c.arc(x,y,4.5,0,7); c.fill();
      c.strokeStyle = '#0c1224'; c.lineWidth=1.2; c.stroke();
    });
    c.fillStyle='#6b7794'; c.font='9px Segoe UI';
    c.fillText('0.5', 6, py(0.5)+3);
    c.fillText('1', 14, py(1)+3); c.fillText('0', 14, py(0)+3);
    c.textAlign='center'; c.fillText('z', (L+R)/2, cv.height-6); c.textAlign='start';
  }

  /* 2) kayıp eğrisi + ln2 tabanı */
  function draw2(){
    const cv = $('xe2Canvas'), c = clr(cv);
    const L=38, R=cv.width-8, T=10, B=cv.height-20;
    const n = hist.length;
    const lo = Math.min(LN2, ...hist.map(h=>h.L)) - 0.004;
    const hi = Math.max(...hist.map(h=>h.L)) + 0.004;
    const xx = i => L + (n<2 ? 0 : i/(n-1))*(R-L);
    const yy = v => B - (v-lo)/(hi-lo || 1)*(B-T);
    axis(c, L, B, R, T);
    // ln2 tabani
    c.strokeStyle='#e0a84a'; c.setLineDash([4,3]); c.lineWidth=1.4;
    c.beginPath(); c.moveTo(L,yy(LN2)); c.lineTo(R,yy(LN2)); c.stroke();
    c.setLineDash([]);
    c.fillStyle='#e0a84a'; c.font='9px Segoe UI';
    c.fillText('ln2', L+3, yy(LN2)-3);
    // kayip egrisi
    c.strokeStyle='#f0a032'; c.lineWidth=2; c.beginPath();
    hist.forEach((h,i)=>{ const x=xx(i), y=yy(h.L); i?c.lineTo(x,y):c.moveTo(x,y); });
    c.stroke();
    if(n){ const x=xx(n-1), y=yy(hist[n-1].L); c.fillStyle='#fff'; c.beginPath(); c.arc(x,y,3,0,7); c.fill(); }
    c.fillStyle='#6b7794'; c.font='9px Segoe UI';
    c.fillText(hi.toFixed(3), 2, T+8);
    c.fillText(lo.toFixed(3), 2, B);
    c.textAlign='center'; c.fillText('epoch', (L+R)/2, cv.height-6); c.textAlign='start';
  }

  /* 3) hata çubukları (p − y) */
  function draw3(s){
    const cv = $('xe3Canvas'), c = clr(cv);
    const L=34, R=cv.width-8, T=12, B=cv.height-22;
    const mid = (T+B)/2;
    c.strokeStyle='#334063'; c.lineWidth=1;
    c.beginPath(); c.moveTo(L,mid); c.lineTo(R,mid); c.stroke();
    c.beginPath(); c.moveTo(L,T); c.lineTo(L,B); c.stroke();
    const bw = (R-L)/4*0.46;
    s.err.forEach((e,i)=>{
      const cx = L + (R-L)*(i+0.5)/4;
      const h = e * (mid-T);               // hata en fazla ±1; e>0 → YUKARI
      c.fillStyle = e>0 ? 'rgba(224,106,106,.75)' : 'rgba(90,160,224,.75)';
      c.fillRect(cx-bw/2, e>0 ? mid-h : mid, bw, Math.abs(h));
      c.fillStyle='#95a2c2'; c.font='8.5px Segoe UI'; c.textAlign='center';
      c.fillText(`(${X[i][0]},${X[i][1]})`, cx, B+12);
      // etiket çubuğun DIŞINA: pozitifse tepesinin üstüne, negatifse dibinin altına
      c.fillStyle = e>0 ? '#e06a6a' : '#5aa0e0';
      c.fillText(N(e,2), cx, e>0 ? mid-h-3 : mid+Math.abs(h)+9);
    });
    c.textAlign='start'; c.fillStyle='#6b7794'; c.font='9px Segoe UI';
    c.fillText('+1', 6, T+8); c.fillText(' 0', 6, mid+3); c.fillText('−1', 6, B);
  }

  /* 4) ağırlıkların yolculuğu */
  function draw4(){
    const cv = $('xe4Canvas'), c = clr(cv);
    const L=34, R=cv.width-8, T=10, B=cv.height-20;
    const n = hist.length;
    const vals = hist.flatMap(h=>[h.w1,h.w2,h.b]);
    const lo = Math.min(-0.05, ...vals), hi = Math.max(0.05, ...vals);
    const xx = i => L + (n<2 ? 0 : i/(n-1))*(R-L);
    const yy = v => B - (v-lo)/(hi-lo || 1)*(B-T);
    axis(c, L, B, R, T);
    // sifir cizgisi
    c.strokeStyle='#4a5578'; c.setLineDash([3,3]);
    c.beginPath(); c.moveTo(L,yy(0)); c.lineTo(R,yy(0)); c.stroke();
    c.setLineDash([]);
    const series = [['w1','#5aa0e0'], ['w2','#f0a032'], ['b','#46c46a']];
    series.forEach(([k,col])=>{
      c.strokeStyle=col; c.lineWidth=1.8; c.beginPath();
      hist.forEach((h,i)=>{ const x=xx(i), y=yy(h[k]); i?c.lineTo(x,y):c.moveTo(x,y); });
      c.stroke();
    });
    c.font='9px Segoe UI';
    c.fillStyle='#5aa0e0'; c.fillText('w₁', R-56, T+9);
    c.fillStyle='#f0a032'; c.fillText('w₂', R-36, T+9);
    c.fillStyle='#46c46a'; c.fillText('b',  R-18, T+9);
    c.fillStyle='#6b7794';
    c.fillText(hi.toFixed(2), 2, T+8); c.fillText('0', 20, yy(0)+3); c.fillText(lo.toFixed(2), 2, B);
    c.textAlign='center'; c.fillText('epoch', (L+R)/2, cv.height-6); c.textAlign='start';
  }

  /* ---------- ekrana yaz ---------- */
  function render(){
    const s = state();

    // tahminler: p ≥ 0.5 → 1
    const tah = s.p.map(pi => pi >= 0.5 ? 1 : 0);
    const dogru = tah.filter((t,i) => t === Y[i]).length;

    // durum şeridi — "tahmin nerede?" sorusunun tek bakışta cevabı
    $('xeState').innerHTML =
      `epoch <b>${epoch}</b>   ·   w = [${N(w[0],4)}, ${N(w[1],4)}]   ·   b = ${N(b,4)}   ·   kayıp L = <b>${N(s.L,6)}</b>\n` +
      `TAHMİNLER:  ` +
      X.map((x,i) => {
        const ok = tah[i] === Y[i];
        return `(${x[0]},${x[1]})→<b style="color:${ok?'#46c46a':'#e06a6a'}">${tah[i]}</b>${ok?'✓':'✗'}`;
      }).join('   ') +
      `   ·   doğru: <b style="color:${dogru===4?'#46c46a':'#f0a032'}">${dogru}/4</b>`;

    // Kart 1
    for(let i=0;i<4;i++){
      $('xe1z'+i).textContent = N(s.z[i],3);
      $('xe1p'+i).textContent = N(s.p[i],4);
      $('xe1t'+i).textContent = tah[i];
      const ok = tah[i] === Y[i];
      const k = $('xe1k'+i);
      k.textContent = ok ? '✓' : '✗';
      k.style.color = ok ? '#46c46a' : '#e06a6a';
    }
    $('xe1c').textContent =
      `ör. (1,1):  1(${N(w[0],3)}) + 1(${N(w[1],3)}) + ${N(b,3)} = ${N(s.z[3],3)}   →   doğru: ${dogru}/4`;
    draw1(s);

    // Kart 2
    const fark = s.L - LN2;
    $('xe2L').textContent = `L = ${N(s.L,6)}\ntaban (ln2) = 0.693147\nfark = ${N(fark,6)}`;
    draw2();

    // Kart 3
    for(let i=0;i<4;i++){
      $('xe3p'+i).textContent = N(s.p[i],4);
      $('xe3e'+i).textContent = (s.err[i]>=0?'+':'') + N(s.err[i],4);
    }
    $('xe3g').textContent =
      `grad_w₁ = ${(s.gw[0]>=0?'+':'')}${N(s.gw[0],4)}   ← x₁=1 olanlar\n` +
      `grad_w₂ = ${(s.gw[1]>=0?'+':'')}${N(s.gw[1],4)}   ← x₂=1 olanlar\n` +
      `grad_b  = ${(s.gb>=0?'+':'')}${N(s.gb,4)}   ← hepsi`;
    draw3(s);

    // Kart 4 — bu adımda yapılacak güncelleme
    const nw = [w[0]-LR*s.gw[0], w[1]-LR*s.gw[1]], nb = b-LR*s.gb;
    $('xe4u').textContent =
      `w₁ : ${N(w[0],4)} − (0.5 × ${N(s.gw[0],4)}) = ${N(nw[0],4)}\n` +
      `w₂ : ${N(w[1],4)} − (0.5 × ${N(s.gw[1],4)}) = ${N(nw[1],4)}\n` +
      `b  : ${N(b,4)} − (0.5 × ${N(s.gb,4)}) = ${N(nb,4)}`;
    draw4();

    // sonuç kutusu
    const box = $('xeSonuc');
    if(converged()){
      box.innerHTML = `🏁 <b>Eğitim bitti — ve sonuç şaşırtıcı.</b> ${epoch} epoch sonunda makinenin bulduğu "en uygun ağırlıklar": ` +
        `<b>w = [${N(w[0],4)}, ${N(w[1],4)}]</b>, <b>b = ${N(b,4)}</b> — yani <b>hepsi sıfır</b>. Kayıp <b>ln2 = 0.6931</b>'de takıldı: ` +
        `bu, "her noktaya %50 diyorum" demenin kaybı. Dört noktaya da p=0.5 dediği için skoru <b>${dogru}/4</b> — yazı tura atmakla aynı. ` +
        `Tek doğruyla XOR ayrılamadığı için gradyan alçalmanın yapabileceği en iyi şey buydu: <b>pes etmek</b>. ` +
        `Yukarıdaki 2 nöronlu ağın 4/4 yaptığını hatırla — fark, gizli katman.`;
    } else if(epoch === 0){
      box.innerHTML = `▶ <b>Başlamak için "1 epoch"a bas.</b> Her basışta dört kart da o turun sayılarıyla güncellenir. ` +
        `Tahminleri yukarıdaki <b>TAHMİNLER</b> satırından ve <b>Adım 1</b> kartının "tahmin" sütunundan takip et. ` +
        `Sonra <b>⏩ hızlı</b> ile bırak dönsün.`;
    } else {
      box.innerHTML = `🔄 <b>${epoch}. epoch bitti.</b> Şu an <b>${dogru}/4</b> doğru · ağırlıklar <b>[${N(w[0],4)}, ${N(w[1],4)}]</b>, b = <b>${N(b,4)}</b> · ` +
        `kayıp <b>${N(s.L,6)}</b> — tabana (ln2 = 0.693147) <b>${N(fark,6)}</b> kaldı. Devam et.`;
    }
  }

  const on = (id, fn) => { const el = $(id); if(el) el.addEventListener('click', fn); };
  on('xeStep',  () => { stop(); step(); });
  on('xeAuto',  auto);
  on('xeStop',  stop);
  on('xeReset', () => { stop(); reset(); });

  reset();
})();
