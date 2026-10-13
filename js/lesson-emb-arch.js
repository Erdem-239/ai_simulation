// Kelime Temsili — Bütün Resim: "hangi model?" mimari şeması + notasyon. Şema, aşağıdaki kutulardaki (eb_*) girdilerden canlı beslenir.
(function(){
  const host=document.getElementById('embArch'); if(!host) return;
  const $=id=>document.getElementById(id);
  const WD=['kedi','köpek','kral','kraliçe','elma','armut'],CD=['uyudu','yönetti','tatlı'];
  const f=(v,d=2)=>(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',').replace(/^-/,'−');
  host.innerHTML='<div style="overflow-x:auto"><svg id="ea_svg" viewBox="0 0 800 360" style="min-width:700px;width:100%;max-width:900px;display:block;margin:0 auto" role="img" aria-label="Skip-gram modelinin mimarisi: one-hot girdi, W tablosu, kelime vektörü e, C tablosu, skorlar, softmax ile tahmin p, gerçek y, kayıp L"></svg></div>'+
    '<div id="ea_txt" style="font-size:13px;color:#ccd5e8;line-height:1.7;margin-top:6px"></div>';
  function val(id,d){const e=$(id);return e&&e.value!==''?parseFloat(String(e.value).replace(',','.')):d;}
  function draw(){
    const wi=$('eb_w')?+$('eb_w').value:0,yi=$('eb_y')?+$('eb_y').value:0;
    const e=[val('eb_e0',0.8),val('eb_e1',0.3)],C=[0,1,2].map(k=>[val('eb_c'+k+'a',0),val('eb_c'+k+'b',0)]);
    const s=C.map(c=>e[0]*c[0]+e[1]*c[1]),m=Math.max(...s),ex=s.map(v=>Math.exp(v-m)),z=ex.reduce((a,b)=>a+b,0),p=ex.map(v=>v/z),L=-Math.log(p[yi]);
    const col=v=>v>=0?'rgba(70,196,106,'+(0.2+0.8*Math.min(1,Math.abs(v)))+')':'rgba(224,106,106,'+(0.2+0.8*Math.min(1,Math.abs(v)))+')';
    let g='<defs><marker id="eaM" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#95a2c2"/></marker></defs>';
    const hd=(x,t,sub)=>'<text x="'+x+'" y="14" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffd54a">'+t+'</text><text x="'+x+'" y="28" text-anchor="middle" font-size="9.5" fill="#95a2c2">'+sub+'</text>';
    g+=hd(70,'GİRDİ  x','merkez kelime (one-hot, V=6)')+hd(255,'VEKTÖR  e','D=2 sayı')+hd(450,'SKOR  s','her aday için e·c')+hd(580,'TAHMİN  p','softmax: olasılık')+hd(680,'GERÇEK  y','doğru komşu')+hd(765,'KAYIP  L','−ln p_y');
    const xy=k=>56+k*44,hy=[150,210],sy=k=>110+k*70;
    // W oku
    WD.forEach((w,k)=>{const on=k===wi;g+='<circle cx="70" cy="'+xy(k)+'" r="12" fill="'+(on?'#ffd54a':'#17203a')+'" stroke="#3a7afe"/><text x="70" y="'+(xy(k)+4)+'" text-anchor="middle" font-size="10" font-weight="700" fill="'+(on?'#0e1424':'#95a2c2')+'">'+(on?1:0)+'</text><text x="52" y="'+(xy(k)+4)+'" text-anchor="end" font-size="11" fill="#ccd5e8">'+w+'</text>';});
    hy.forEach((y,t)=>{g+='<line x1="82" y1="'+xy(wi)+'" x2="237" y2="'+y+'" stroke="#ffd54a" stroke-width="2" marker-end="url(#eaM)"/><circle cx="255" cy="'+y+'" r="17" fill="'+col(e[t])+'" stroke="#c77dff" stroke-width="2"/><text x="255" y="'+(y+4)+'" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">'+f(e[t])+'</text>';});
    g+='<text x="160" y="'+((xy(wi)+180)/2-4)+'" text-anchor="middle" font-size="10" fill="#ffd54a" stroke="#0e1424" stroke-width="4" paint-order="stroke">× W (6×2 tablo): satır oku</text>';
    // C: e -> s
    C.forEach((c,k)=>{hy.forEach(y=>{g+='<line x1="272" y1="'+y+'" x2="432" y2="'+sy(k)+'" stroke="'+(k===yi?'#46c46a':'#3a4a74')+'" stroke-width="'+(k===yi?1.6:.8)+'" opacity=".8"/>';});
      g+='<circle cx="450" cy="'+sy(k)+'" r="19" fill="'+col(s[k])+'" stroke="'+(k===yi?'#46c46a':'#334063')+'" stroke-width="2"/><text x="450" y="'+(sy(k)+4)+'" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">'+f(s[k])+'</text>';
      g+='<text x="428" y="'+(sy(k)-24)+'" text-anchor="end" font-size="9.5" fill="#95a2c2" stroke="#0e1424" stroke-width="3" paint-order="stroke">c<tspan font-size="7" dy="2">'+(k+1)+'</tspan><tspan dy="-2"> = ('+f(c[0],1)+'; '+f(c[1],1)+') '+CD[k]+'</tspan></text>';
      // softmax -> p
      g+='<line x1="470" y1="'+sy(k)+'" x2="548" y2="'+sy(k)+'" stroke="#95a2c2" marker-end="url(#eaM)"/><rect x="552" y="'+(sy(k)-9)+'" width="'+(56*p[k])+'" height="18" fill="'+(k===yi?'#46c46a':'#3a7afe')+'" opacity=".85"/><rect x="552" y="'+(sy(k)-9)+'" width="56" height="18" fill="none" stroke="#334063"/><text x="612" y="'+(sy(k)+4)+'" font-size="10.5" font-weight="700" fill="#ccd5e8">'+f(p[k],3)+'</text>';
      // y
      g+='<circle cx="680" cy="'+sy(k)+'" r="10" fill="'+(k===yi?'#46c46a':'#17203a')+'" stroke="#334063"/><text x="680" y="'+(sy(k)+4)+'" text-anchor="middle" font-size="10" font-weight="700" fill="'+(k===yi?'#0e1424':'#95a2c2')+'">'+(k===yi?1:0)+'</text>';
    });
    g+='<text x="540" y="'+(sy(0)-24)+'" text-anchor="middle" font-size="10" fill="#95a2c2">softmax</text>';
    g+='<text x="350" y="'+(sy(2)+44)+'" text-anchor="middle" font-size="10" fill="#95a2c2">e · C  (C: 2×3 tablo, 3 aday)</text>';
    g+='<rect x="738" y="'+(sy(1)-18)+'" width="54" height="36" rx="8" fill="#17203a" stroke="#ffd54a"/><text x="765" y="'+(sy(1)+5)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#ffd54a">'+f(L,3)+'</text>';
    g+='<line x1="700" y1="'+(sy(yi))+'" x2="736" y2="'+(sy(1))+'" stroke="#ffd54a" stroke-dasharray="3 3"/>';
    g+='<text x="20" y="352" font-size="10.5" fill="#95a2c2">Tahmin p ile gerçek y karşılaştırılır; fark (δ = p − y) geri yolda hem e\'ye hem c\'lere gider.</text>';
    $('ea_svg').innerHTML=g;
    $('ea_txt').innerHTML='🔎 <b>Şu an:</b> girdi <b>'+WD[wi]+'</b>, gerçek komşu <b>'+CD[yi]+'</b>. Model <b>"'+WD[wi]+'" yanında hangi kelime olur?</b> sorusuna şu <b>tahmini</b> veriyor: '+CD.map((w,k)=>w+' %'+Math.round(p[k]*100)).join(', ')+'. Doğrusu '+CD[yi]+' olduğu için kayıp L = −ln('+f(p[yi],3)+') = <b>'+f(L,3)+'</b>.';
    window.__embArch={s,p,L,wi,yi};
  }
  const refresh=()=>setTimeout(draw,0);
  const map=$('embBigMap');
  document.addEventListener('input',e=>{if(e.target&&e.target.id&&e.target.id.indexOf('eb_')===0)refresh();});
  document.addEventListener('change',e=>{if(e.target&&e.target.id&&e.target.id.indexOf('eb_')===0)refresh();});
  draw();setTimeout(draw,400);
})();
