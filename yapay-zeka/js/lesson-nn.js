/* Neural Network sayfası — ileri yayılım tablosu ve geri yayılım kartları (Simülasyon düzeni/eğitim: lesson-nn-sim.js) */
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
     İleri yayılım: 9 ağırlık kutusu, 4 noktanın tablosu
     ============================================================ */
  const wIds = ['nnW11','nnW12','nnB1','nnW21','nnW22','nnB2','nnW31','nnW32','nnB3'];
  const DEFAULTS = {nnW11:20, nnW12:20, nnB1:-10, nnW21:20, nnW22:20, nnB2:-30, nnW31:20, nnW32:-20, nnB3:-10};

  function readWeights(){
    /* w_{noron}{girdi} — XOR'daki kuralla ayni: ilk rakam HANGI NORONA,
       ikinci rakam HANGI GIRDIDEN. h1=1.noron, h2=2.noron, y=3.noron. */
    return {
      w11: parseFloat($('nnW11').value)||0,
      w12: parseFloat($('nnW12').value)||0,
      b1:  parseFloat($('nnB1').value)||0,
      w21: parseFloat($('nnW21').value)||0,
      w22: parseFloat($('nnW22').value)||0,
      b2:  parseFloat($('nnB2').value)||0,
      w31: parseFloat($('nnW31').value)||0,
      w32: parseFloat($('nnW32').value)||0,
      b3:  parseFloat($('nnB3').value)||0
    };
  }

  function forward(x1, x2, W){
    const z_h1 = W.w11*x1 + W.w12*x2 + W.b1;
    const z_h2 = W.w21*x1 + W.w22*x2 + W.b2;
    const h1 = sigmoid(z_h1), h2 = sigmoid(z_h2);
    const z_y = W.w31*h1 + W.w32*h2 + W.b3;
    const p = sigmoid(z_y);
    /* h1_raw/h2_raw/y_raw/a1/a2 eski adlarla da erisilebilir kalsin —
       renderForward/renderBackprop asagida bu alanlari okuyor. */
    return {h1_raw:z_h1, h2_raw:z_h2, a1:h1, a2:h2, y_raw:z_y, p};
  }

  function lossOf(p, y){
    const eps = 1e-12;
    return -(y*Math.log(p+eps) + (1-y)*Math.log(1-p+eps));
  }

  const fwdTable = $('nnFwdTable');
  const fwdVerdict = $('nnFwdVerdict');

  /* ---------- 5. bolum: "Butun resim" matris zinciri ----------
     Temsilci nokta (1,0) — XOR'daki POINTS[2] ile ayni sira/index. */
  function renderMatrixChain(){
    const el = $('nnfx1'); if(!el) return;   // sayfa henuz yoksa cik
    const W = readWeights();
    const pt = POINTS[window.__nnBigPt===undefined?2:window.__nnBigPt]; // Bütün Resim nokta seçici (varsayılan (1,0))
    const r = forward(pt.x1, pt.x2, W);
    const fv = (id, v, d) => { const e = $(id); if(e) e.textContent = F(v, d===undefined?4:d); };
    fv('nnfx1', pt.x1, 0);  fv('nnfx2', pt.x2, 0);
    fv('mfz1', r.h1_raw);  fv('mfz2', r.h2_raw);
    fv('nnfh1', r.a1);      fv('nnfh2', r.a2);
    fv('mfzy', r.y_raw);   fv('mfp',  r.p);

    const hes = (id, satirlar) => { const e = $(id); if(e) e.innerHTML = satirlar.join('\n'); };
    hes('mfzh_hes', [
      'z_h1 = w11·x1 + w12·x2 + b1 = '+F(W.w11,2)+'×'+pt.x1+' + '+F(W.w12,2)+'×'+pt.x2+' + '+F(W.b1,2)+' = <b>'+F(r.h1_raw,4)+'</b>',
      'z_h2 = w21·x1 + w22·x2 + b2 = '+F(W.w21,2)+'×'+pt.x1+' + '+F(W.w22,2)+'×'+pt.x2+' + '+F(W.b2,2)+' = <b>'+F(r.h2_raw,4)+'</b>'
    ]);
    hes('mfsig_hes', [
      'h1 = σ('+F(r.h1_raw,4)+') = <b>'+F(r.a1,4)+'</b>',
      'h2 = σ('+F(r.h2_raw,4)+') = <b>'+F(r.a2,4)+'</b>'
    ]);
    hes('mfzy_hes', [
      'z_y = w31·h1 + w32·h2 + b3 = '+F(W.w31,2)+'×'+F(r.a1,4)+' + '+F(W.w32,2)+'×'+F(r.a2,4)+' + '+F(W.b3,2)+' = <b>'+F(r.y_raw,4)+'</b>'
    ]);
    hes('mfp_hes', [
      'ŷ = σ('+F(r.y_raw,4)+') = <b>'+F(r.p,4)+'</b>'+(r.p>=0.5?' → tahmin 1':' → tahmin 0')
    ]);
  }

  function renderForward(){
    if(!fwdTable) return;
    const W = readWeights();
    let correct = 0, totalLoss = 0;
    const rows = [];
    rows.push('nokta    h1      h2      ŷ       tahmin/y   kayıp');
    POINTS.forEach(pt=>{
      const r = forward(pt.x1, pt.x2, W);
      const pred = r.p>=0.5 ? 1 : 0;
      const ok = pred===pt.y; if(ok) correct++;
      const L = lossOf(r.p, pt.y); totalLoss += L;
      rows.push('('+pt.x1+','+pt.x2+')    '+F(r.a1,3)+'   '+F(r.a2,3)+'   '+F(r.p,3)+'   '+pred+' / '+pt.y+'     '+F(L,3)+(ok?' ✓':' ✗'));
    });
    fwdTable.textContent = rows.join('\n');
    renderMatrixChain();
    if(window.__nnBigRender) window.__nnBigRender();
    const avgLoss = totalLoss/POINTS.length;
    if(correct===4){
      fwdVerdict.innerHTML = '🎉 <b>4/4 doğru</b> — ortalama kayıp = '+F(avgLoss,4)+'. Bu ağırlıklar XOR\'u çözüyor. Sayıları oynat (örn. w₁₁\'i 5\'e indir) ve 4/4\'ün ne kadar kırılgan olduğunu gör.';
    } else {
      fwdVerdict.innerHTML = '📉 <b>'+correct+'/4 doğru</b> — ortalama kayıp = '+F(avgLoss,4)+'. Bu ağırlıklarla ağ XOR\'u tam çözemiyor. "✋ elle çözüm" ile referans çözüme dönebilir ya da ▶ 1 tur / ⏩ ile eğitebilirsin.';
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
    const dLdw31 = dLdzy * r.a1;
    const dLdw32 = dLdzy * r.a2;
    const dLdb3 = dLdzy;
    const dLdh1 = dLdzy * W.w31;
    const dLdh2 = dLdzy * W.w32;
    const dLdzh1 = dLdh1 * r.a1*(1-r.a1);
    const dLdzh2 = dLdh2 * r.a2*(1-r.a2);
    const dLdw11 = dLdzh1 * pt.x1;
    const dLdw12 = dLdzh1 * pt.x2;
    const dLdb1 = dLdzh1;
    const dLdw21 = dLdzh2 * pt.x1;
    const dLdw22 = dLdzh2 * pt.x2;
    const dLdb2 = dLdzh2;

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
    $('nnBp2Eq').innerHTML = '\\( \\dfrac{\\partial L}{\\partial w_{31}}='+F(dLdzy,4)+'\\times h_1='+F(dLdzy,4)+'\\times'+F(r.a1,4)+'='+F(dLdw31,4)+' \\)<br>'+
      '\\( \\dfrac{\\partial L}{\\partial w_{32}}='+F(dLdzy,4)+'\\times h_2='+F(dLdzy,4)+'\\times'+F(r.a2,4)+'='+F(dLdw32,4)+' \\)<br>'+
      '\\( \\dfrac{\\partial L}{\\partial b_3}='+F(dLdb3,4)+' \\)';
    $('nnBp2Note').innerHTML = '💡 z<sub>y</sub>=w₃₁·h1+w₃₂·h2+b₃ olduğu için her ağırlığın gradyanı, Adım 1\'in sonucu × <b>kendisiyle çarpılan girdi</b> (h1, h2 ya da 1).';
    typeset($('nnBp2Eq'));
    $('nnBp2Detail').innerHTML =
      '<div class="deriv-why" style="margin-top:6px; color:#f0a032"><b>Amaç:</b> Adım 1\'deki sinyali kullanıp w₃₁,w₃₂,b₃\'ün gradyanına ulaşmak.</div>'+
      '<div class="deriv-why" style="margin-top:6px">z<sub>y</sub>\'nin açık hali: \\( z_y=w_{31}h_1+w_{32}h_2+b_3 \\). w₃₁\'e göre türev (h1,h2,b sabit) = h1; b₃\'e göre türev = 1.</div>'+
      '<div class="deriv-why">Zincir kuralı: \\( \\frac{\\partial L}{\\partial w_{31}}=\\frac{\\partial L}{\\partial z_y}\\times\\frac{\\partial z_y}{\\partial w_{31}}=(p-y)\\times h_1 \\) — ve aynı mantık w₃₂, b₃ için.</div>';

    // ---- Geri Adım 3 ----
    $('nnBp3Eq').innerHTML = '\\( \\dfrac{\\partial L}{\\partial z_{h1}}=\\underbrace{'+F(dLdzy,4)+'\\times'+F(W.w31,2)+'}_{\\partial L/\\partial h_1}\\times\\underbrace{h_1(1-h_1)}_{'+F(r.a1*(1-r.a1),4)+'}='+F(dLdzh1,4)+' \\)<br>'+
      '\\( \\dfrac{\\partial L}{\\partial z_{h2}}=\\underbrace{'+F(dLdzy,4)+'\\times'+F(W.w32,2)+'}_{\\partial L/\\partial h_2}\\times\\underbrace{h_2(1-h_2)}_{'+F(r.a2*(1-r.a2),4)+'}='+F(dLdzh2,4)+' \\)';
    $('nnBp3Note').innerHTML = '🔗 Aynı "dişli zinciri" mantığı (RNN\'deki gibi): önce w₃₁,w₃₂ üzerinden gizli katmana geç (∂L/∂h), sonra sigmoid\'in kendi türevi σ(1−σ) ile çarp.';
    typeset($('nnBp3Eq'));
    $('nnBp3Detail').innerHTML =
      '<div class="deriv-why" style="margin-top:6px; color:#f0a032"><b>Amaç:</b> gizli katmandaki ağırlıklara (w₁₁,w₁₂,w₂₁,w₂₂,b₁,b₂) inebilmek için sinyali önce h1,h2\'ye, sonra z<sub>h1</sub>,z<sub>h2</sub>\'ye taşımak.</div>'+
      '<div class="deriv-why" style="margin-top:6px"><b>1. adım:</b> z<sub>y</sub>=w₃₁h1+w₃₂h2+b₃ olduğundan \\( \\partial z_y/\\partial h_1=w_{31} \\) → \\( \\partial L/\\partial h_1=(p-y)\\,w_{31} \\).</div>'+
      '<div class="deriv-why"><b>2. adım:</b> h1=σ(z<sub>h1</sub>) olduğundan sigmoid\'in türevi σ(1−σ) devreye girer (Aktivasyon dersindeki kanıt): \\( \\partial L/\\partial z_{h1}=\\partial L/\\partial h_1\\times h_1(1-h_1) \\).</div>';

    // ---- Geri Adım 4 ----
    const g4=(w,d,xs,xv,res)=>'\\( \\dfrac{\\partial L}{\\partial '+w+'}='+F(d,4)+'\\times '+(xv===null?'1':xv)+'='+F(res,4)+' \\)';
    const q4 = [g4('w_{11}',dLdzh1,'x_1',pt.x1,dLdw11),g4('w_{12}',dLdzh1,'x_2',pt.x2,dLdw12),g4('b_1',dLdzh1,'1',null,dLdb1),
      g4('w_{21}',dLdzh2,'x_1',pt.x1,dLdw21),g4('w_{22}',dLdzh2,'x_2',pt.x2,dLdw22),g4('b_2',dLdzh2,'1',null,dLdb2)];
    $('nnBp4Eq').innerHTML = '<div class="bp4g"><div>'+q4.slice(0,3).join('<br>')+'</div><div>'+q4.slice(3).join('<br>')+'</div></div>';
    $('nnBp4Note').innerHTML = '✅ Artık 9 ağırlığın da gradyanına sahibiz — bu, TEK bir XOR noktası için hesaplanan gradyan. Eğitimde (3) Güncelle) 4 noktanın gradyanı ORTALAMASI alınıp <code>W ← W − α·gradyan</code> ile güncellenir.';
    typeset($('nnBp4Eq'));
    $('nnBp4Detail').innerHTML =
      '<div class="deriv-why" style="margin-top:6px; color:#f0a032"><b>Amaç:</b> Adım 3\'te bulduğumuz ∂L/∂z<sub>h</sub> sinyalini son halkaya, w₁₁,w₁₂,w₂₁,w₂₂,b₁,b₂\'ye taşımak.</div>'+
      '<div class="deriv-why" style="margin-top:6px">z<sub>h1</sub>=w₁₁·x1+w₁₂·x2+b₁ olduğundan w₁₁\'e göre türev = x1, w₁₂\'ye göre = x2, b₁\'e göre = 1 — RNN\'deki W<sub>xh</sub> gradyanının türetmesiyle birebir aynı mantık.</div>'+
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

  window.__nnRender = ()=>{ renderForward(); renderBackprop(); };

  /* ---- ilk render ---- */
  renderForward();
  renderBackprop();
  renderMatrixChain();
})();
