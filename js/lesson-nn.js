/* Neural Network sayfası — ileri yayılım simülasyonu, geri yayılım adım adım, canlı eğitim */
(function(){
  'use strict';
  const root = document.getElementById('model-neural');
  if(!root) return;

  const $ = id => document.getElementById(id);
  const F = (v,d=3) => (isFinite(v) ? v.toFixed(d) : '—');
  const sigmoid = z => 1/(1+Math.exp(-z));
  function typeset(el){
    if(!el || !window.MathJax || !MathJax.typesetPromise) return;
    try{ MathJax.typesetClear && MathJax.typesetClear([el]); }catch(e){}
    MathJax.typesetPromise([el]).catch(()=>{});
  }

  const POINTS = [
    {x1:0, x2:0, y:0},
    {x1:0, x2:1, y:1},
    {x1:1, x2:0, y:1},
    {x1:1, x2:1, y:0}
  ];

  /* ============================================================
     BÖLÜM 2 — İleri yayılım simülasyonu (düzenlenebilir ağırlıklar)
     ============================================================ */
  const wIds = ['nnW1_11','nnW1_21','nnB1_1','nnW1_12','nnW1_22','nnB1_2','nnW2_1','nnW2_2','nnB2'];
  const DEFAULTS = {nnW1_11:20, nnW1_21:20, nnB1_1:-10, nnW1_12:20, nnW1_22:20, nnB1_2:-30, nnW2_1:20, nnW2_2:-20, nnB2:-10};

  function readWeights(){
    return {
      w11: parseFloat($('nnW1_11').value)||0,
      w21: parseFloat($('nnW1_21').value)||0,
      b1_1: parseFloat($('nnB1_1').value)||0,
      w12: parseFloat($('nnW1_12').value)||0,
      w22: parseFloat($('nnW1_22').value)||0,
      b1_2: parseFloat($('nnB1_2').value)||0,
      w2_1: parseFloat($('nnW2_1').value)||0,
      w2_2: parseFloat($('nnW2_2').value)||0,
      b2: parseFloat($('nnB2').value)||0
    };
  }

  function forward(x1, x2, W){
    const h1_raw = W.w11*x1 + W.w21*x2 + W.b1_1;
    const h2_raw = W.w12*x1 + W.w22*x2 + W.b1_2;
    const a1 = sigmoid(h1_raw), a2 = sigmoid(h2_raw);
    const y_raw = W.w2_1*a1 + W.w2_2*a2 + W.b2;
    const p = sigmoid(y_raw);
    return {h1_raw, h2_raw, a1, a2, y_raw, p};
  }

  function lossOf(p, y){
    const eps = 1e-12;
    return -(y*Math.log(p+eps) + (1-y)*Math.log(1-p+eps));
  }

  const fwdTable = $('nnFwdTable');
  const fwdVerdict = $('nnFwdVerdict');

  function renderForward(){
    if(!fwdTable) return;
    const W = readWeights();
    let correct = 0, totalLoss = 0;
    const rows = [];
    rows.push('nokta       z_h1     a1(σ)    z_h2     a2(σ)    z_y      p=ŷ     tahmin  gerçek  kayıp');
    POINTS.forEach(pt=>{
      const r = forward(pt.x1, pt.x2, W);
      const pred = r.p>=0.5 ? 1 : 0;
      const ok = pred===pt.y; if(ok) correct++;
      const L = lossOf(r.p, pt.y); totalLoss += L;
      rows.push(
        '('+pt.x1+','+pt.x2+')      '+F(r.h1_raw,2).padStart(7)+'  '+F(r.a1,3).padStart(6)+'   '+
        F(r.h2_raw,2).padStart(7)+'  '+F(r.a2,3).padStart(6)+'   '+F(r.y_raw,2).padStart(6)+'  '+
        F(r.p,3).padStart(6)+'    '+pred+'      '+pt.y+'      '+F(L,3)+(ok?' ✓':' ✗')
      );
    });
    fwdTable.textContent = rows.join('\n');
    const avgLoss = totalLoss/POINTS.length;
    if(correct===4){
      fwdVerdict.innerHTML = '🎉 <b>4/4 doğru</b> — ortalama kayıp = '+F(avgLoss,4)+'. Bu ağırlıklar XOR\'u çözüyor. Sayıları biraz oynat (örn. w1_11\'i 5\'e indir), 4/4\'ün ne kadar kırılgan olduğunu gör.';
    } else {
      fwdVerdict.innerHTML = '📉 <b>'+correct+'/4 doğru</b> — ortalama kayıp = '+F(avgLoss,4)+'. Bu ağırlıklarla ağ XOR\'u tam çözemiyor. "↺ Varsayılana dön" ile referans çözüme geri dönebilirsin.';
    }
  }

  const resetBtn = $('nnFwdReset');
  if(resetBtn){
    resetBtn.addEventListener('click', ()=>{
      wIds.forEach(id=>{ $(id).value = DEFAULTS[id]; });
      renderForward();
      renderBackprop();
    });
  }
  wIds.forEach(id=>{
    const el = $(id);
    if(el) el.addEventListener('input', ()=>{ renderForward(); renderBackprop(); });
  });

  /* ============================================================
     BÖLÜM 3 — Geri yayılım, adım adım (tek nokta, aynı ağırlıklar)
     ============================================================ */
  let bpPointIdx = 0; // varsayılan: (0,0) -> y=0, HTML'deki aktif buton ile eşleşir

  function renderBackprop(){
    const e1 = $('nnBp1Eq'); if(!e1) return; // sayfa henüz yoksa çık
    const W = readWeights();
    const pt = POINTS[bpPointIdx];
    const r = forward(pt.x1, pt.x2, W);

    const dLdzy = r.p - pt.y;
    const dLdW2_1 = dLdzy * r.a1;
    const dLdW2_2 = dLdzy * r.a2;
    const dLdb2 = dLdzy;
    const dLda1 = dLdzy * W.w2_1;
    const dLda2 = dLdzy * W.w2_2;
    const dLdzh1 = dLda1 * r.a1*(1-r.a1);
    const dLdzh2 = dLda2 * r.a2*(1-r.a2);
    const dLdw11 = dLdzh1 * pt.x1;
    const dLdw21 = dLdzh1 * pt.x2;
    const dLdb1_1 = dLdzh1;
    const dLdw12 = dLdzh2 * pt.x1;
    const dLdw22 = dLdzh2 * pt.x2;
    const dLdb1_2 = dLdzh2;

    // ---- Geri Adım 1 ----
    $('nnBp1Eq').innerHTML = '\\( \\dfrac{\\partial L}{\\partial z_y}=(\\hat y-y) = ('+F(r.p,4)+' - '+pt.y+') = '+F(dLdzy,4)+' \\)';
    $('nnBp1Note').innerHTML = '📍 Nokta: <b>('+pt.x1+','+pt.x2+')</b>, gerçek y='+pt.y+'. Aktivasyon dersinde kanıtladığımız <code>dL/dz=p−y</code> — burada da birebir aynı, sadece z artık ağın SON katmanının z\'si (z<sub>y</sub>).';
    typeset($('nnBp1Eq'));
    $('nnBp1Detail').innerHTML =
      '<div class="deriv-why" style="margin-top:6px; color:#f0a032"><b>Amaç:</b> kayıptan çıktı katmanına kadar geri-sinyali bulmak.</div>'+
      '<div class="deriv-why" style="margin-top:6px">Kayıp fonksiyonu log-loss: \\( L=-\\big(y\\ln p + (1-y)\\ln(1-p)\\big) \\), \\(p=\\sigma(z_y)\\). Aktivasyon dersinde gösterdiğimiz gibi bu ikisi birleşince temizce sadeleşiyor:</div>'+
      '<div class="eq" style="margin:4px 0">\\( \\dfrac{\\partial L}{\\partial z_y}=p-y \\)</div>'+
      '<div class="deriv-why">Sayılarımızla: p='+F(r.p,4)+', y='+pt.y+' → <b>'+F(dLdzy,4)+'</b>. İşaret, tahminin gerçeğe göre hangi yönde kaydırılması gerektiğini söylüyor.</div>';

    // ---- Geri Adım 2 ----
    $('nnBp2Eq').innerHTML = '\\( \\dfrac{\\partial L}{\\partial w_1^{(2)}}='+F(dLdzy,4)+'\\times a_1='+F(dLdzy,4)+'\\times'+F(r.a1,4)+'='+F(dLdW2_1,4)+' \\)<br>'+
      '\\( \\dfrac{\\partial L}{\\partial w_2^{(2)}}='+F(dLdzy,4)+'\\times a_2='+F(dLdzy,4)+'\\times'+F(r.a2,4)+'='+F(dLdW2_2,4)+' \\)<br>'+
      '\\( \\dfrac{\\partial L}{\\partial b^{(2)}}='+F(dLdb2,4)+' \\)';
    $('nnBp2Note').innerHTML = '💡 z<sub>y</sub>=w1⁽²⁾·a1+w2⁽²⁾·a2+b⁽²⁾ olduğu için her ağırlığın gradyanı, Adım 1\'in sonucu × <b>kendisiyle çarpılan girdi</b> (a1, a2 ya da 1).';
    typeset($('nnBp2Eq'));
    $('nnBp2Detail').innerHTML =
      '<div class="deriv-why" style="margin-top:6px; color:#f0a032"><b>Amaç:</b> Adım 1\'deki sinyali kullanıp W⁽²⁾, b⁽²⁾\'nin gradyanına ulaşmak.</div>'+
      '<div class="deriv-why" style="margin-top:6px">z<sub>y</sub>\'nin açık hali: \\( z_y=w_1^{(2)}a_1+w_2^{(2)}a_2+b^{(2)} \\). w1⁽²⁾\'ye göre türev (a1,a2,b sabit) = a1; b\'ye göre türev = 1.</div>'+
      '<div class="deriv-why">Zincir kuralı: \\( \\frac{\\partial L}{\\partial w_1^{(2)}}=\\frac{\\partial L}{\\partial z_y}\\times\\frac{\\partial z_y}{\\partial w_1^{(2)}}=(p-y)\\times a_1 \\) — ve aynı mantık w2⁽²⁾, b⁽²⁾ için.</div>';

    // ---- Geri Adım 3 ----
    $('nnBp3Eq').innerHTML = '\\( \\dfrac{\\partial L}{\\partial z_{h1}}=\\underbrace{'+F(dLdzy,4)+'\\times'+F(W.w2_1,2)+'}_{\\partial L/\\partial a_1}\\times\\underbrace{a_1(1-a_1)}_{'+F(r.a1*(1-r.a1),4)+'}='+F(dLdzh1,4)+' \\)<br>'+
      '\\( \\dfrac{\\partial L}{\\partial z_{h2}}=\\underbrace{'+F(dLdzy,4)+'\\times'+F(W.w2_2,2)+'}_{\\partial L/\\partial a_2}\\times\\underbrace{a_2(1-a_2)}_{'+F(r.a2*(1-r.a2),4)+'}='+F(dLdzh2,4)+' \\)';
    $('nnBp3Note').innerHTML = '🔗 Aynı "dişli zinciri" mantığı (RNN\'deki gibi): önce W⁽²⁾ üzerinden gizli katmana geç (∂L/∂a), sonra sigmoid\'in kendi türevi σ(1−σ) ile çarp.';
    typeset($('nnBp3Eq'));
    $('nnBp3Detail').innerHTML =
      '<div class="deriv-why" style="margin-top:6px; color:#f0a032"><b>Amaç:</b> gizli katmandaki ağırlıklara (W⁽¹⁾, b⁽¹⁾) inebilmek için sinyali önce a1,a2\'ye, sonra z<sub>h1</sub>,z<sub>h2</sub>\'ye taşımak.</div>'+
      '<div class="deriv-why" style="margin-top:6px"><b>1. adım:</b> z<sub>y</sub>=w1⁽²⁾a1+w2⁽²⁾a2+b⁽²⁾ olduğundan \\( \\partial z_y/\\partial a_1=w_1^{(2)} \\) → \\( \\partial L/\\partial a_1=(p-y)\\,w_1^{(2)} \\).</div>'+
      '<div class="deriv-why"><b>2. adım:</b> a1=σ(z<sub>h1</sub>) olduğundan sigmoid\'in türevi σ(1−σ) devreye girer (Aktivasyon dersindeki kanıt): \\( \\partial L/\\partial z_{h1}=\\partial L/\\partial a_1\\times a_1(1-a_1) \\).</div>';

    // ---- Geri Adım 4 ----
    $('nnBp4Eq').innerHTML = '\\( \\dfrac{\\partial L}{\\partial w_{11}}='+F(dLdzh1,4)+'\\times x_1='+F(dLdzh1,4)+'\\times'+pt.x1+'='+F(dLdw11,4)+' \\)<br>'+
      '\\( \\dfrac{\\partial L}{\\partial w_{21}}='+F(dLdzh1,4)+'\\times x_2='+F(dLdw21,4)+' \\), &nbsp; \\( \\dfrac{\\partial L}{\\partial b_1}='+F(dLdb1_1,4)+' \\)<br>'+
      '\\( \\dfrac{\\partial L}{\\partial w_{12}}='+F(dLdzh2,4)+'\\times x_1='+F(dLdw12,4)+' \\), &nbsp; \\( \\dfrac{\\partial L}{\\partial w_{22}}='+F(dLdw22,4)+' \\), &nbsp; \\( \\dfrac{\\partial L}{\\partial b_2}='+F(dLdb1_2,4)+' \\)';
    $('nnBp4Note').innerHTML = '✅ Artık 9 ağırlığın da gradyanına sahibiz — bu, TEK bir XOR noktası için hesaplanan gradyan. Gerçek eğitimde (Bölüm 4\'te göreceğin gibi) 4 noktanın gradyanı ORTALAMASI alınıp <code>W ← W − α·gradyan</code> ile güncellenir.';
    typeset($('nnBp4Eq'));
    $('nnBp4Detail').innerHTML =
      '<div class="deriv-why" style="margin-top:6px; color:#f0a032"><b>Amaç:</b> Adım 3\'te bulduğumuz ∂L/∂z<sub>h</sub> sinyalini son halkaya, W⁽¹⁾ ve b⁽¹⁾\'e taşımak.</div>'+
      '<div class="deriv-why" style="margin-top:6px">z<sub>h1</sub>=w11·x1+w21·x2+b1 olduğundan w11\'e göre türev = x1, w21\'e göre = x2, b1\'e göre = 1 — RNN\'deki W<sub>xh</sub> gradyanının türetmesiyle birebir aynı mantık.</div>'+
      '<div class="deriv-why">Zincir kuralı: \\( \\partial L/\\partial w_{11}=\\partial L/\\partial z_{h1}\\times x_1 \\). Aynı adım h2 tarafı için de tekrarlanır.</div>';
  }

  document.querySelectorAll('.nnbp-pt').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      bpPointIdx = parseInt(btn.dataset.pt,10);
      document.querySelectorAll('.nnbp-pt').forEach(b=>{ b.style.background='var(--panel)'; b.style.color='var(--text)'; b.style.border='1px solid var(--line)'; });
      btn.style.background='var(--blue)'; btn.style.color='#fff'; btn.style.border='none';
      renderBackprop();
    });
  });

  /* ============================================================
     BÖLÜM 4 — Canlı eğitim: rastgele ağırlıklar, kendi kendine öğren
     ============================================================ */
  const trainBtn = $('nnTrainBtn');
  const trainLog = $('nnTrainLog');
  const trainCanvas = $('nnTrainCanvas');
  const trainWeights = $('nnTrainWeights');
  const trainTable = $('nnTrainTable');
  const trainVerdict = $('nnTrainVerdict');

  function randInit(){
    const rnd = () => (Math.random()*2-1); // -1..1
    return {
      w11: rnd(), w21: rnd(), b1_1: 0,
      w12: rnd(), w22: rnd(), b1_2: 0,
      w2_1: rnd(), w2_2: rnd(), b2: 0
    };
  }

  function trainRun(epochs, lr){
    let W = randInit();
    const lossHistory = [];
    for(let ep=0; ep<epochs; ep++){
      // ---- ileri yayılım + gradyan biriktir (tam-batch: 4 nokta ortalaması) ----
      let gW11=0,gW21=0,gB1_1=0,gW12=0,gW22=0,gB1_2=0,gW2_1=0,gW2_2=0,gB2=0, epLoss=0;
      POINTS.forEach(pt=>{
        const r = forward(pt.x1, pt.x2, W);
        epLoss += lossOf(r.p, pt.y);
        const dLdzy = r.p - pt.y;
        gW2_1 += dLdzy*r.a1; gW2_2 += dLdzy*r.a2; gB2 += dLdzy;
        const dLda1 = dLdzy*W.w2_1, dLda2 = dLdzy*W.w2_2;
        const dLdzh1 = dLda1*r.a1*(1-r.a1), dLdzh2 = dLda2*r.a2*(1-r.a2);
        gW11 += dLdzh1*pt.x1; gW21 += dLdzh1*pt.x2; gB1_1 += dLdzh1;
        gW12 += dLdzh2*pt.x1; gW22 += dLdzh2*pt.x2; gB1_2 += dLdzh2;
      });
      const n = POINTS.length;
      W = {
        w11: W.w11 - lr*gW11/n, w21: W.w21 - lr*gW21/n, b1_1: W.b1_1 - lr*gB1_1/n,
        w12: W.w12 - lr*gW12/n, w22: W.w22 - lr*gW22/n, b1_2: W.b1_2 - lr*gB1_2/n,
        w2_1: W.w2_1 - lr*gW2_1/n, w2_2: W.w2_2 - lr*gW2_2/n, b2: W.b2 - lr*gB2/n
      };
      if(ep % 40 === 0 || ep===epochs-1) lossHistory.push(epLoss/n);
    }
    // final değerlendirme
    let correct = 0; const preds = POINTS.map(pt=>{
      const r = forward(pt.x1, pt.x2, W);
      const pred = r.p>=0.5?1:0; if(pred===pt.y) correct++;
      return {pt, r, pred};
    });
    return {W, lossHistory, correct, preds};
  }

  function drawLossChart(lossHistory){
    if(!trainCanvas) return;
    const ctx = trainCanvas.getContext('2d');
    const w = trainCanvas.width, h = trainCanvas.height;
    ctx.fillStyle = '#1a1b1e'; ctx.fillRect(0,0,w,h);
    const padL=42, padB=26, padT=12, padR=12;
    const plotW = w-padL-padR, plotH = h-padT-padB;
    const maxLoss = Math.max(0.05, ...lossHistory);
    ctx.strokeStyle = '#3a3d42'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(padL,padT); ctx.lineTo(padL,padT+plotH); ctx.lineTo(padL+plotW,padT+plotH); ctx.stroke();
    ctx.fillStyle='#9aa0a6'; ctx.font='10px Segoe UI'; ctx.textAlign='right';
    ctx.fillText(F(maxLoss,2), padL-4, padT+8);
    ctx.fillText('0', padL-4, padT+plotH);
    ctx.textAlign='center';
    ctx.fillText('epoch →', padL+plotW/2, h-6);
    ctx.strokeStyle = '#f0a032'; ctx.lineWidth=2; ctx.beginPath();
    lossHistory.forEach((L,i)=>{
      const px = padL + (i/(lossHistory.length-1||1))*plotW;
      const py = padT + plotH - Math.min(1,L/maxLoss)*plotH;
      if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    });
    ctx.stroke();
  }

  function runTraining(){
    if(!trainBtn) return;
    trainBtn.disabled = true;
    trainBtn.textContent = '⏳ Eğitiliyor...';
    trainLog.textContent = '';
    const maxAttempts = 10;
    let attempt = 0, result = null;
    const logLines = [];
    while(attempt < maxAttempts){
      attempt++;
      result = trainRun(4000, 5.0);
      logLines.push('Deneme '+attempt+': '+result.correct+'/4 doğru, ortalama kayıp='+F(result.lossHistory[result.lossHistory.length-1],4)+(result.correct===4?' → başarılı! ✓':' → yetersiz, yeniden deneniyor…'));
      if(result.correct===4) break;
    }
    trainLog.textContent = logLines.join('\n');
    drawLossChart(result.lossHistory);
    const W = result.W;
    trainWeights.textContent =
      'W⁽¹⁾ (girdi→gizli):\n'+
      '  w11='+F(W.w11,3)+'  w21='+F(W.w21,3)+'  b1='+F(W.b1_1,3)+'\n'+
      '  w12='+F(W.w12,3)+'  w22='+F(W.w22,3)+'  b2='+F(W.b1_2,3)+'\n\n'+
      'W⁽²⁾ (gizli→çıktı):\n'+
      '  w1='+F(W.w2_1,3)+'  w2='+F(W.w2_2,3)+'  b='+F(W.b2,3);
    const rows = ['nokta      p=ŷ      tahmin  gerçek'];
    result.preds.forEach(({pt,r,pred})=>{
      rows.push('('+pt.x1+','+pt.x2+')      '+F(r.p,4)+'   '+pred+'      '+pt.y+'   '+(pred===pt.y?'✓':'✗'));
    });
    trainTable.textContent = rows.join('\n');
    if(result.correct===4){
      trainVerdict.innerHTML = '🎉 <b>'+attempt+'. denemede</b> ağ, XOR\'u <b>tamamen kendi kendine</b> öğrendi — rastgele başladı, hiçbir ağırlığı biz seçmedik. Bulduğu sayılar (yukarıda) bizim elle seçtiğimiz W⁽¹⁾=20,20,-10 / -10,-30 gibi TEMİZ değerlerle aynı olmak zorunda değil — önemli olan <b>işlevin</b> aynı olması: 4 noktayı da doğru sınıflandırıyor.';
    } else {
      trainVerdict.innerHTML = '⚠️ '+maxAttempts+' denemede de tam çözüme ulaşamadı ('+result.correct+'/4 en iyi). Bu nadir ama mümkün — butona tekrar bas, yeni rastgele başlangıçlarla dene.';
    }
    trainBtn.disabled = false;
    trainBtn.textContent = '🎲 Rastgele başlat ve eğit (4000 tur)';
  }

  if(trainBtn) trainBtn.addEventListener('click', ()=> setTimeout(runTraining, 10));

  /* ---- ilk render ---- */
  renderForward();
  renderBackprop();
})();
