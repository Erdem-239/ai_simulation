/* XOR modülü — CANLI mimari şeması.
   Aşağıdaki dört eğitim kartıyla AYNI ağı gösterir: ağırlıklar
   js/lesson-xor-epoch.js tarafından window.XORNET üzerinden yayımlanır,
   her epoch'ta bu şema yeniden çizilir. Her nöronun iki işi (Σ = ağırlıklı
   toplam, σ = sigmoid) ayrı bölmelerde, seçilen girdiye göre canlı. */
(function(){
  'use strict';
  const svg = document.getElementById('xaSvg');
  if(!svg) return;

  const sigmoid = z => 1 / (1 + Math.exp(-z));
  const $ = id => document.getElementById(id);
  // −0.00 gibi çirkin çıktıları engelle
  const N = (v, d) => (Object.is(Math.round(v * 10**d) / 10**d, -0) ? 0 : v).toFixed(d).replace('-', '−');

  const work    = $('xaWork');
  const verdict = $('xaVerdict');
  const btns    = [...document.querySelectorAll('.xa-btn')];

  const XOR = (a, b) => (a ^ b);

  let cur = [1, 1];

  /* Eğitim modülü henüz konuşmadıysa başlangıç ağırlıklarını kullan. */
  const FALLBACK = { W1:[[1.3,-0.3],[-1.4,1.0]], B1:[-1.2,0.25], W2:[1.2,-0.9], B2:-1.2, epoch:0, L:Math.log(2) };
  const net = () => window.XORNET || FALLBACK;

  /* σ bölmesinin arka planı: ateşlediyse yeşil, sustuysa kırmızı */
  function tint(id, v){
    const el = $(id);
    if(!el) return;
    el.setAttribute('fill', v >= 0.5 ? '#173a22' : '#3a1414');
    el.setAttribute('fill-opacity', v >= 0.5 ? '0.45' : '0.35');
  }

  /* bağlantı etiketi: değeri yaz, işaretine göre renklendir */
  function wlab(id, v){
    const el = $(id);
    if(!el) return;
    el.textContent = 'w=' + N(v, 2);
    el.setAttribute('fill', v >= 0 ? '#46c46a' : '#e06a6a');
  }

  /* "1.30·x₁−0.30·x₂−1.20" biçiminde kısa Σ formülü */
  function lin(w0, w1, b, n0, n1){
    const t = (v, nm) => (v < 0 ? '−' : '+') + N(Math.abs(v), 2) + (nm ? '·' + nm : '');
    return N(w0, 2) + '·' + n0 + t(w1, n1) + t(b, '');
  }

  function render(){
    const { W1, B1, W2, B2, epoch, L } = net();
    const [x1, x2] = cur;

    const z1 = W1[0][0]*x1 + W1[0][1]*x2 + B1[0];
    const z2 = W1[1][0]*x1 + W1[1][1]*x2 + B1[1];
    const h1 = sigmoid(z1), h2 = sigmoid(z2);
    const zy = W2[0]*h1 + W2[1]*h2 + B2;
    const p  = sigmoid(zy);

    const hedef  = XOR(x1, x2);
    const tahmin = p >= 0.5 ? 1 : 0;
    const dogru  = tahmin === hedef;

    // --- şemadaki sayılar ---
    $('xax1').textContent = x1;
    $('xax2').textContent = x2;
    $('xaz1').textContent = N(z1, 2);
    $('xaz2').textContent = N(z2, 2);
    $('xazy').textContent = N(zy, 2);
    $('xah1').textContent = N(h1, 3);
    $('xah2').textContent = N(h2, 3);
    $('xayv').textContent = N(p, 3);
    $('xaf1').textContent = lin(W1[0][0], W1[0][1], B1[0], 'x₁', 'x₂');
    $('xaf2').textContent = lin(W1[1][0], W1[1][1], B1[1], 'x₁', 'x₂');
    $('xafy').textContent = lin(W2[0], W2[1], B2, 'h₁', 'h₂');
    $('xaEpoch').textContent = `epoch ${epoch} · L = ${N(L, 3)}`;

    wlab('xaw11', W1[0][0]);  // x₁ → h₁
    wlab('xaw12', W1[0][1]);  // x₂ → h₁
    wlab('xaw21', W1[1][0]);  // x₁ → h₂
    wlab('xaw22', W1[1][1]);  // x₂ → h₂
    wlab('xav1',  W2[0]);     // h₁ → çıktı
    wlab('xav2',  W2[1]);     // h₂ → çıktı

    tint('xasig1bg', h1);
    tint('xasig2bg', h2);
    tint('xasigybg', p);

    const tgt = $('xaTgt');
    tgt.textContent = `tahmin ${tahmin} · doğru cevap y = ${hedef} ${dogru ? '✓' : '✗'}`;
    tgt.setAttribute('fill', dogru ? '#46c46a' : '#e06a6a');

    // --- adım adım hesap dökümü ---
    if(work){
      work.textContent =
`GİRDİ:  x₁ = ${x1} ,  x₂ = ${x2}          (XOR'un doğru cevabı: ${hedef})
AĞIRLIKLAR: eğitimin ${epoch}. epoch'undaki hâli

① GİZLİ NÖRON h₁
   Σ :  z₁ = ${N(W1[0][0],2)}·${x1} + (${N(W1[0][1],2)})·${x2} + (${N(B1[0],2)}) = ${N(z1,2)}
   σ :  h₁ = σ(${N(z1,2)}) = ${N(h1,4)}          ${z1 > 0 ? '← z pozitif, sigmoid 1\'e doğru' : '← z negatif, sigmoid 0\'a doğru'}

② GİZLİ NÖRON h₂
   Σ :  z₂ = ${N(W1[1][0],2)}·${x1} + (${N(W1[1][1],2)})·${x2} + (${N(B1[1],2)}) = ${N(z2,2)}
   σ :  h₂ = σ(${N(z2,2)}) = ${N(h2,4)}          ${z2 > 0 ? '← z pozitif, sigmoid 1\'e doğru' : '← z negatif, sigmoid 0\'a doğru'}

③ ÇIKTI NÖRONU
   Σ :  z_y = ${N(W2[0],2)}·${N(h1,3)} + (${N(W2[1],2)})·${N(h2,3)} + (${N(B2,2)}) = ${N(zy,2)}
   σ :  p  = σ(${N(zy,2)}) = ${N(p,4)}

KARAR:  p = ${N(p,4)} ${p >= 0.5 ? '≥' : '<'} 0.5  →  tahmin = ${tahmin}`;
    }

    if(verdict){
      verdict.innerHTML = dogru
        ? `✅ <b>Bu girdide doğru.</b> Tahmin <b>${tahmin}</b>, gerçek cevap <b>${hedef}</b>` +
          (epoch === 0
            ? ` — ama dikkat: <b>henüz hiç eğitilmedi.</b> Rastgele başlangıç dört noktanın bazılarını şans eseri tutturabilir; aşağıdaki "doğru: n/4" satırı bütün resmi verir.`
            : ` — ${tahmin === 1 ? '🟢 yeşil' : '🔴 kırmızı'} nokta.`)
        : `❌ <b>Bu girdide yanlış.</b> Tahmin ${tahmin}, gerçek ${hedef}. ` +
          (epoch === 0
            ? `Normal — ağırlıklar henüz rastgele. Aşağıdan <b>▶ 1 epoch</b> / <b>⏩ hızlı</b> ile eğit, bu satırın düzelmesini izle.`
            : `Eğitim sürüyor; ⏩ ile devam et.`);
    }

    btns.forEach(b => {
      const on = b.dataset.xa === `${x1},${x2}`;
      b.style.background = on ? 'var(--accent)' : 'var(--panel)';
      b.style.color      = on ? '#1a1204' : 'var(--text)';
      b.style.border     = on ? 'none' : '1px solid var(--line)';
    });
  }

  /* eğitim modülü her epoch'ta bunu çağırır */
  window.__xorArchRender = render;

  btns.forEach(b => b.addEventListener('click', () => {
    cur = b.dataset.xa.split(',').map(Number);
    render();
  }));

  render();
})();
