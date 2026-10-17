// RNN — Ekstra: "r^T sezgisi" (0,5²⁰ ve 1,5²⁰) ve "gradient clipping" mini-demoları (Yol Haritası'ndaki Vanishing/Exploding durağı burayı gösterir).
(function(){
  const $=id=>document.getElementById(id);
  const fm=(v,d=3)=>v.toFixed(d).replace('.',',').replace(/^-/,'−');
  const sci=v=>{if(v===0)return '0';const e=Math.floor(Math.log10(Math.abs(v)));if(e>-3&&e<5)return fm(v,Math.abs(v)<1?4:2);return fm(v/Math.pow(10,e),2)+'·10<sup>'+String(e).replace('-','−')+'</sup>';};
  const h1=$('rnnVanR');
  if(h1){
    h1.innerHTML='<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;font-size:13px;margin-bottom:8px"><label>çarpan r = <b id="rv_rv">0,90</b> <input id="rv_r" type="range" min="0.3" max="1.8" step="0.01" value="0.9" style="width:180px"></label><label>zaman adımı T = <b id="rv_tv">20</b> <input id="rv_t" type="range" min="1" max="60" step="1" value="20" style="width:180px"></label></div><div class="work" id="rv_out" style="white-space:pre-wrap;line-height:1.8;font-size:12.5px"></div><div style="margin:8px 0"><div style="height:16px;border-radius:6px;background:var(--panel);overflow:hidden"><div id="rv_bar" style="height:100%;width:50%;background:#46c46a;transition:.15s"></div></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#95a2c2"><span>10⁻⁶ (söndü)</span><span>1 (korundu)</span><span>10⁶ (patladı)</span></div></div><div class="callout" id="rv_c"></div><div style="font-size:12.5px;color:#ccd5e8">Hazır örnekler: <button class="rex-btn rv_p" data-r="0.5" data-t="20">0,5²⁰</button> <button class="rex-btn rv_p" data-r="1.5" data-t="20">1,5²⁰</button> <button class="rex-btn rv_p" data-r="0.9" data-t="20">0,9²⁰</button> <button class="rex-btn rv_p" data-r="1.1" data-t="20">1,1²⁰</button> <button class="rex-btn rv_p" data-r="1" data-t="60">1,0⁶⁰</button></div>';
    const draw=()=>{
      const r=+$('rv_r').value,T=+$('rv_t').value,g=Math.pow(r,T);
      $('rv_rv').textContent=fm(r,2);$('rv_tv').textContent=T;
      $('rv_out').innerHTML='r<sup>T</sup> = '+fm(r,2)+'<sup>'+T+'</sup> = <b>'+sci(g)+'</b>\nuzak geçmişe (T adım geri) ulaşan gradyan payı: <b>'+(g<1?'%'+(g*100<0.01?'0,00…':fm(g*100,2)):'×'+sci(g)+' büyümüş')+'</b>';
      const lg=Math.max(-6,Math.min(6,Math.log10(g)));$('rv_bar').style.width=((lg+6)/12*100)+'%';$('rv_bar').style.background=g<0.01?'#e06a6a':g>100?'#f0a032':'#46c46a';
      $('rv_c').innerHTML=g<0.01?'📉 <b>Vanishing:</b> r < 1 olduğunda çarpan üst üste binince <b>0\'a gider</b>: '+T+' adım öncesinin gradyanı neredeyse yok, uzak geçmiş öğrenilemez.':g>100?'💥 <b>Exploding:</b> r > 1 olduğunda çarpan <b>patlar</b>: gradyan o kadar büyür ki ağırlık güncellemesi kararsızlaşır (NaN\'e kadar gidebilir).':'⚖️ <b>Dengeli bölge:</b> r ≈ 1 civarında gradyan ne söner ne patlar. Ama bu bıçak sırtı: r\'yi çok az kıpırdatınca (ya da T\'yi artırınca) üstteki iki uca düşer. LSTM\'in cell-state otoyolu tam bunu kalıcı yapmak için tasarlandı (çarpan 1\'e kilitli yol).';
    };
    ['rv_r','rv_t'].forEach(i=>$(i).addEventListener('input',draw));
    h1.querySelectorAll('.rv_p').forEach(b=>b.onclick=()=>{$('rv_r').value=b.dataset.r;$('rv_t').value=b.dataset.t;draw();});
    draw();
  }
  const h2=$('rnnClip');
  if(h2){
    h2.innerHTML='<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;font-size:13px;margin-bottom:8px">gradyan g = (<input id="cl_g1" type="number" step="1" value="30" style="width:64px">, <input id="cl_g2" type="number" step="1" value="-40" style="width:64px">)<label>eşik c = <input id="cl_c" type="number" step="1" min="0.1" value="5" style="width:64px"></label></div><div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center"><svg id="cl_svg" viewBox="0 0 220 220" style="width:220px;background:#0d1426;border-radius:8px"></svg><div style="flex:1;min-width:220px"><div class="work" id="cl_out" style="white-space:pre-wrap;line-height:1.8;font-size:12.5px"></div><div class="callout" id="cl_c2" style="margin-top:6px"></div></div></div>';
    const draw=()=>{
      const g1=parseFloat($('cl_g1').value)||0,g2=parseFloat($('cl_g2').value)||0,c=Math.max(0.1,parseFloat($('cl_c').value)||5),n=Math.hypot(g1,g2),k=n>c?c/n:1,a=[g1*k,g2*k];
      $('cl_out').innerHTML='‖g‖ = √('+fm(g1,1)+'² + '+fm(g2,1)+'²) = <b>'+fm(n,2)+'</b>\nölçek = min(1, c/‖g‖) = min(1, '+fm(c,1)+'/'+fm(n,2)+') = <b>'+fm(k,3)+'</b>\nkırpılmış g = ('+fm(a[0],2)+' ; '+fm(a[1],2)+')   ← büyüklüğü: '+fm(Math.hypot(a[0],a[1]),2);
      const sc=90/Math.max(n,c,1),X=v=>110+v*sc,Y=v=>110-v*sc;
      $('cl_svg').innerHTML='<defs><marker id="clA" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#46c46a"/></marker><marker id="clB" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#e06a6a"/></marker></defs><circle cx="110" cy="110" r="'+(c*sc)+'" fill="none" stroke="#95a2c2" stroke-dasharray="4 3"/><line x1="10" y1="110" x2="210" y2="110" stroke="#334063"/><line x1="110" y1="10" x2="110" y2="210" stroke="#334063"/><line x1="110" y1="110" x2="'+X(g1)+'" y2="'+Y(g2)+'" stroke="#e06a6a" stroke-width="2" marker-end="url(#clB)"/><line x1="110" y1="110" x2="'+X(a[0])+'" y2="'+Y(a[1])+'" stroke="#46c46a" stroke-width="3" marker-end="url(#clA)"/><text x="12" y="20" font-size="10" fill="#e06a6a">ham g</text><text x="12" y="34" font-size="10" fill="#46c46a">kırpılmış</text><text x="12" y="48" font-size="10" fill="#95a2c2">kesik daire: eşik c</text>';
      $('cl_c2').innerHTML=n>c?'✂️ Gradyan eşiği aştı (‖g‖ = '+fm(n,1)+' > c = '+fm(c,1)+'): <b>yönü aynen korunup</b> boyu eşiğe kısaltıldı. Exploding gradyan tek adımda ağırlıkları fırlatmasın diye kullanılan en basit önlem.':'✅ Gradyan eşiğin içinde: dokunulmadı. Clipping yalnız <b>aşan</b> gradyanları kısaltır, normal adımları değiştirmez.';
      window.__rnnClip={n,k,a};
    };
    ['cl_g1','cl_g2','cl_c'].forEach(i=>$(i).addEventListener('input',draw));draw();
  }
})();
