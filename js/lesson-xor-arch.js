/* XOR modülü — ayrıntılı mimari şeması.
   Her nöronun İKİ işini (Σ = ağırlıklı toplam, σ = sigmoid) ayrı ayrı gösterir
   ve seçilen girdiye göre bütün ara değerleri canlı günceller.
   Ağırlıklar, Ekstra kümesindeki Python kodunun BİREBİR aynısı. */
(function(){
  'use strict';
  const svg = document.getElementById('xaSvg');
  if(!svg) return;

  // --- ağ (Ekstra'daki forward() ile aynı sayılar) ---
  const W1 = [[20, 20], [20, 20]];
  const b1 = [-10, -30];
  const W2 = [20, -20];
  const b2 = -10;

  const sigmoid = z => 1 / (1 + Math.exp(-z));
  const $  = id => document.getElementById(id);
  const F  = (v, d) => v.toFixed(d);
  // −0.00 gibi çirkin çıktıları engelle
  const N  = (v, d) => (Object.is(Math.round(v * 10**d) / 10**d, -0) ? 0 : v).toFixed(d).replace('-', '−');

  const work    = $('xaWork');
  const verdict = $('xaVerdict');
  const btns    = [...document.querySelectorAll('.xa-btn')];

  const XOR = (a, b) => (a ^ b);

  let cur = [0, 1];

  /* σ bölmesinin arka planı: ateşlediyse yeşil, sustuysa kırmızı */
  function tint(id, v){
    const el = $(id);
    if(!el) return;
    el.setAttribute('fill', v >= 0.5 ? '#173a22' : '#3a1414');
    el.setAttribute('fill-opacity', v >= 0.5 ? '0.45' : '0.35');
  }

  function render(){
    const [x1, x2] = cur;

    const z1 = W1[0][0]*x1 + W1[0][1]*x2 + b1[0];
    const z2 = W1[1][0]*x1 + W1[1][1]*x2 + b1[1];
    const h1 = sigmoid(z1), h2 = sigmoid(z2);
    const zy = W2[0]*h1 + W2[1]*h2 + b2;
    const y  = sigmoid(zy);

    const hedef = XOR(x1, x2);
    const tahmin = y >= 0.5 ? 1 : 0;

    // --- şemadaki sayılar ---
    $('xax1').textContent = x1;
    $('xax2').textContent = x2;
    $('xaz1').textContent = N(z1, 2);
    $('xaz2').textContent = N(z2, 2);
    $('xazy').textContent = N(zy, 2);
    $('xah1').textContent = N(h1, 3);
    $('xah2').textContent = N(h2, 3);
    $('xayv').textContent = N(y, 3);
    tint('xasig1bg', h1);
    tint('xasig2bg', h2);
    tint('xasigybg', y);

    // --- adım adım hesap dökümü (predict'in içi) ---
    work.textContent =
`GİRDİ:  x₁ = ${x1} ,  x₂ = ${x2}          (XOR'un doğru cevabı: ${hedef})

① GİZLİ KATMAN — h₁ nöronu   "en az biri 1 mi?" (OR)
   Σ :  z₁ = 20·${x1} + 20·${x2} + (−10) = ${N(z1,2)}
   σ :  h₁ = σ(${N(z1,2)}) = ${N(h1,4)}          ${z1 > 0 ? '← z pozitif, sigmoid 1\'e yapışıyor' : '← z negatif, sigmoid 0\'a yapışıyor'}

② GİZLİ KATMAN — h₂ nöronu   "ikisi birden 1 mi?" (AND)
   Σ :  z₂ = 20·${x1} + 20·${x2} + (−30) = ${N(z2,2)}
   σ :  h₂ = σ(${N(z2,2)}) = ${N(h2,4)}          ${z2 > 0 ? '← z pozitif, sigmoid 1\'e yapışıyor' : '← z negatif, sigmoid 0\'a yapışıyor'}

③ ÇIKTI KATMANI              "h₁ VE (DEĞİL h₂)"
   Σ :  z_y = 20·${N(h1,3)} + (−20)·${N(h2,3)} + (−10) = ${N(zy,2)}
   σ :  ŷ  = σ(${N(zy,2)}) = ${N(y,4)}

KARAR:  ŷ = ${N(y,4)} ${y >= 0.5 ? '≥' : '<'} 0.5  →  tahmin = ${tahmin}`;

    const dogru = tahmin === hedef;
    verdict.innerHTML = dogru
      ? `✅ <b>Doğru.</b> Tahmin <b>${tahmin}</b>, gerçek cevap <b>${hedef}</b> — ${tahmin === 1 ? '🟢 yeşil' : '🔴 kırmızı'} nokta. ` +
        (x1 === x2
          ? (x1 === 0
             ? 'Burada <b>h₁ sustu</b> (hiçbir girdi 1 değil) → çıktı da sustu.'
             : 'Burada <b>ikisi de ateşledi</b>; ama h₂\'nin ağırlığı <b>−20</b> olduğu için h₁\'in katkısını iptal etti → çıktı sustu. XOR\'un "ama ikisi birden değil" kısmı tam olarak bu.')
          : 'Burada <b>h₁ ateşledi, h₂ sustu</b> → çıktı serbest kaldı. XOR\'un "ya biri ya öbürü" durumu.')
      : `❌ <b>Yanlış.</b> Tahmin ${tahmin}, gerçek ${hedef}.`;

    btns.forEach(b => {
      const on = b.dataset.xa === `${x1},${x2}`;
      b.style.background = on ? 'var(--accent)' : 'var(--panel)';
      b.style.color      = on ? '#1a1204' : 'var(--text)';
      b.style.border     = on ? 'none' : '1px solid var(--line)';
    });
  }

  btns.forEach(b => b.addEventListener('click', () => {
    cur = b.dataset.xa.split(',').map(Number);
    render();
  }));

  render();
})();
