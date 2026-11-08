// Multi-Head 5️⃣ Simülasyon — "🧱 Makaledeki blok" (Vaswani vd. 2017, 2. şeklin sağ yarısı, kendi çizimimiz)
// + Simülasyon sekme geçişi (#mhTabs).
(function(){
  const host=document.getElementById('mhBlk');
  if(host){
    const C={q:'#7aa8ff',k:'#ffd54a',v:'#46c46a',lin:'#4ad0e0',sdpa:'#c77dff',cat:'#f0a032',out:'#e06a9a'};
    // h kopyayı arkada gölge kutularla göster
    const B=(x,y,w,h,t,col,key,stack,sub)=>{let g='<g data-k="'+key+'" style="cursor:pointer">';
      for(let s=stack||0;s>0;s--) g+='<rect x="'+(x+s*6)+'" y="'+(y-s*6)+'" width="'+w+'" height="'+h+'" rx="8" fill="#141c30" stroke="'+col+'" stroke-opacity=".55" stroke-width="1.4"/>';
      g+='<rect class="sd-b" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+col+'" fill-opacity=".16" stroke="'+col+'" stroke-width="2.2"/>'+
        '<text x="'+(x+w/2)+'" y="'+(y+h/2+(sub?-2:5))+'" text-anchor="middle" font-size="13" fill="#e9edf8" font-weight="700">'+t+'</text>'+
        (sub?'<text x="'+(x+w/2)+'" y="'+(y+h/2+13)+'" text-anchor="middle" font-size="10.5" fill="#b9c3dc">'+sub+'</text>':'')+'</g>';return g;};
    const A=(x1,y1,x2,y2)=>'<path d="M'+x1+','+y1+' L'+x2+','+y2+'" stroke="#95a2c2" stroke-width="2" fill="none" marker-end="url(#mbArr)"/>';
    let s='<defs><marker id="mbArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#95a2c2"/></marker></defs>';
    // alttan yukarı: V K Q → Linear ×h → Scaled Dot-Product Attention ×h → Concat → Linear → çıktı
    s+=B(40,500,70,36,'V',C.v,'v')+B(150,500,70,36,'K',C.k,'k')+B(260,500,70,36,'Q',C.q,'q');
    s+=A(75,500,75,470)+A(185,500,185,470)+A(295,500,295,470);
    s+=B(40,430,70,40,'Linear',C.lin,'lin',2,'W_V')+B(150,430,70,40,'Linear',C.lin,'lin',2,'W_K')+B(260,430,70,40,'Linear',C.lin,'lin',2,'W_Q');
    s+=A(75,418,120,372)+A(185,418,185,372)+A(295,418,250,372);
    s+=B(60,312,250,60,'Scaled Dot-Product','#c77dff','sdpa',3,'Attention (h kez, paralel)');
    s+='<text x="342" y="300" font-size="12" fill="#c77dff" font-weight="700">× h</text>';
    s+=A(185,298,185,262)+B(110,222,150,40,'Concat',C.cat,'cat',0,'yan yana yapıştır');
    s+=A(185,222,185,186)+B(110,146,150,40,'Linear',C.lin,'wo',0,'W_O');
    s+=A(185,146,185,110)+B(110,70,150,40,'çıktı',C.out,'out');
    host.innerHTML='<div class="sd-wrap"><div style="overflow-x:auto"><svg viewBox="30 40 340 506" style="width:100%;max-width:340px;min-width:260px;display:block;margin:0 auto" role="img" aria-label="Multi-Head Attention blok şeması">'+s+'</svg></div>'+
      '<div><div id="mhBlkInfo" class="callout" style="margin:0"></div>'+
      '<div class="sd-f">MultiHead(Q,K,V) = <span data-k="cat" style="color:'+C.cat+'">Concat</span>(<span data-k="sdpa" style="color:'+C.sdpa+'">kafa₁, …, kafa<sub>h</sub></span>)·<span data-k="wo" style="color:'+C.lin+'">W<sub>O</sub></span><br>kafa<sub>i</sub> = Attention(<span data-k="lin" style="color:'+C.lin+'">QW<sub>i</sub><sup>Q</sup>, KW<sub>i</sub><sup>K</sup>, VW<sub>i</sub><sup>V</sup></span>)</div></div></div>';
    const INFO={
      '':'👆 <b>Bir kutuya tıkla.</b> Aşağıdan yukarı okunur. Arkadaki gölge kutular aynı parçanın <b>h kopyası</b>: her kafanın kendi ağırlıkları var. Ortadaki mor kutu, Self-Attention dersindeki bloğun kendisi.',
      v:'<b>V, K, Q girişleri.</b> Self-attention\'da üçü de aynı X\'ten gelir (n × d<sub>model</sub>, makalede d = 512). Çapraz attention\'da Q decoder\'dan, K ve V encoder\'dan gelir.',
      k:'<b>K girişi.</b> Bütün kafalar aynı K girdisini alır; farklılık bir sonraki Linear\'daki kafaya özel W<sub>K</sub> ile başlar.',
      q:'<b>Q girişi.</b> Bütün kafalar aynı Q girdisini alır; her kafa onu kendi W<sub>Q</sub>\'suyla farklı bir "soru"ya çevirir.',
      lin:'<b>Linear ×h: kafaya özel izdüşüm.</b> Kafa i, girdiyi kendi W<sub>i</sub><sup>Q</sup>, W<sub>i</sub><sup>K</sup>, W<sub>i</sub><sup>V</sup> (d × d<sub>k</sub>) ile küçük bir alt uzaya indirir. Makalede 8 kafa, d<sub>k</sub> = 512 ÷ 8 = 64. Kafalar ancak farklı W\'lerle farklı şeylere bakabilir. (Gerçek kodda bu 8 matris tek büyük 512×512 matrisin sütun dilimleridir.)',
      sdpa:'<b>Scaled Dot-Product Attention, h kez paralel.</b> Her kafa kendi Q<sub>i</sub>, K<sub>i</sub>, V<sub>i</sub>\'siyle softmax(Q<sub>i</sub>K<sub>i</sub>ᵀ/√d<sub>k</sub>)·V<sub>i</sub> hesaplar → kendi n×n dikkat tablosu, kendi n × d<sub>k</sub> çıktısı. "🔬 Üç kafa" sekmesindeki üç ısı haritası bu adımın çıktısı.',
      cat:'<b>Concat: yan yana yapıştır.</b> h tane n × d<sub>k</sub> çıktı uç uca eklenir → n × (h·d<sub>k</sub>) = n × d<sub>model</sub>. Hiçbir hesap yok; kelime satırları karışmaz, her satırda 8 kafanın görüşü yan yana durur.',
      wo:'<b>Linear W<sub>O</sub> (d × d).</b> Yapıştırılmış kafa görüşlerini <b>karıştırır</b>: çıktının her sayısı bütün kafalardan bilgi alır. Kafalar arası tek iletişim noktası budur. (Bütün Resim\'de geri yayılım burada ikiye bölünür.)',
      out:'<b>Çıktı, n × d<sub>model</sub></b> (girdiyle aynı şekil). Ağırlık sayısı: 4 matris × d² = 4·512² ≈ 1 milyon; kafa sayısından bağımsız (Örnek Çalışmalar Örnek 2).'};
    const show=k=>{document.getElementById('mhBlkInfo').innerHTML=INFO[k||''];host.querySelectorAll('.sd-b').forEach(r=>r.setAttribute('stroke-width',r.parentNode.dataset.k===k?4:2.2));};
    show('');
    host.addEventListener('click',e=>{const g=e.target.closest('[data-k]');if(g)show(g.dataset.k);});
  }
  const tb=document.getElementById('mhTabs');
  if(tb) tb.addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(!b)return;
    tb.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('on',x===b));
    document.querySelectorAll('#model-multihead .at-pane').forEach(p=>p.style.display=p.dataset.p===b.dataset.t?'':'none');});
})();
