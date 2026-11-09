// Makale dersi → Simülasyon: yalnız GENEL RESİM. Makaledeki encoder-decoder mimarisi, 6 ayrı bölüm (bant), ayrıntı yok.
(function(){
  const host=document.getElementById('ppOver'); if(!host) return;
  const B=[ // alttan yukarı
   {n:'① girdiler',c:'#3fc7c1',t:'<b>① Girdiler.</b> Kaynak cümle (Türkçe) encoder\'a, şimdiye kadar yazılan hedef (İngilizce) decoder\'a girer; ikisine de <b>gömme + konum</b> bilgisi eklenir.'},
   {n:'② encoder · maskeli self',c:'#4aa3ff',t:'<b>② Encoder ve maskeli self-attention.</b> Encoder kaynağı okuyup bağlamlı bir <b>bellek</b> çıkarır (self-attention + FFN, ×N). Decoder kendi yazdıklarına bakar ama <b>geleceğe bakamaz</b> (maske).'},
   {n:'③ çapraz attention',c:'#ffd24a',t:'<b>③ Çapraz attention — makaleyi özel kılan köprü.</b> Q decoder\'dan, K ve V encoder belleğinden gelir: yazan taraf kaynakta <b>hangi kelimeye bakacağını</b> seçer.'},
   {n:'④ karışım + residual',c:'#5fd18a',t:'<b>④ Karışım + residual.</b> Kaynaktan alınan bilgi decoder kartına eklenir, FFN ile işlenir (Add &amp; Norm). Bu üçlü blok decoder\'da <b>N kez</b> tekrarlanır.'},
   {n:'⑤ Linear',c:'#ff9b3d',t:'<b>⑤ Linear.</b> Her pozisyonun kartı, sözlükteki bütün kelimeler için bir <b>puana</b> çevrilir.'},
   {n:'⑥ softmax',c:'#f27a88',t:'<b>⑥ Softmax.</b> Puanlar olasılığa döner; en olası kelime <b>sıradaki kelimedir</b>. Hedefe eklenir ve döngü tekrarlanır.'}];
  const H=84,Y0=14,W=920,X1=270,X2=580;
  const by=i=>Y0+(5-i)*H;
  function box(x,y,w,h,txt,col,sub){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="10" fill="#141c2c" stroke="'+col+'" stroke-width="2"/><text x="'+(x+w/2)+'" y="'+(y+h/2+(sub?-3:5))+'" fill="#e8ebf2" font-size="14" font-weight="700" text-anchor="middle">'+txt+'</text>'+(sub?'<text x="'+(x+w/2)+'" y="'+(y+h/2+15)+'" fill="#9fb0d0" font-size="11" text-anchor="middle">'+sub+'</text>':'');}
  function arr(x1,y1,x2,y2,col){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+col+'" stroke-width="2.4" marker-end="url(#ppArr)"/>';}
  let s='<svg viewBox="0 0 '+W+' '+(Y0*2+6*H)+'" style="width:100%;display:block" font-family="system-ui,sans-serif"><defs><marker id="ppArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#cdd4e4"/></marker></defs>';
  B.forEach((b,i)=>{const y=by(i);
    s+='<g class="pp-band" data-b="'+i+'" style="cursor:pointer"><rect x="4" y="'+y+'" width="'+(W-8)+'" height="'+(H-6)+'" rx="12" fill="'+b.c+'" fill-opacity=".07" stroke="'+b.c+'" stroke-opacity=".55" stroke-width="1.5"/>';
    s+='<text x="20" y="'+(y+H/2)+'" fill="'+b.c+'" font-size="15" font-weight="800">'+b.n+'</text></g>';});
  // kolon başlıkları
  s+='<text x="'+(X1+90)+'" y="'+(by(0)+H-2)+'" fill="#3fc7c1" font-size="12" font-weight="700" text-anchor="middle" opacity=".0">ENCODER</text>';
  // encoder: bant 0 ve 1
  const cEnc='#3fc7c1',cDec='#4aa3ff';
  s+='<g class="pp-el" data-b="0">'+box(X1,by(0)+14,200,52,'Kaynak cümle','#3fc7c1','kedi balığı yedi + gömme + konum')+'</g>';
  s+='<g class="pp-el" data-b="0">'+box(X2,by(0)+14,230,52,'Hedef (şimdiye kadar)','#4aa3ff','&lt;s&gt; cat ate + gömme + konum')+'</g>';
  s+='<g class="pp-el" data-b="1">'+box(X1,by(1)+10,200,60,'ENCODER  × N','#3fc7c1','self-attention · FFN · Add&amp;Norm')+'</g>';
  s+='<g class="pp-el" data-b="1">'+box(X2,by(1)+10,230,60,'Maskeli self-attention','#4aa3ff','Add &amp; Norm')+'</g>';
  s+='<g class="pp-el" data-b="2">'+box(X2,by(2)+10,230,60,'ÇAPRAZ attention','#ffd24a','Q: decoder · K, V: encoder')+'</g>';
  s+='<g class="pp-el" data-b="3">'+box(X2,by(3)+10,230,60,'FFN + Add &amp; Norm','#5fd18a','karışım + residual')+'</g>';
  s+='<g class="pp-el" data-b="4">'+box(X2,by(4)+14,230,52,'Linear','#ff9b3d','kart → sözlük puanları')+'</g>';
  s+='<g class="pp-el" data-b="5">'+box(X2,by(5)+14,230,52,'softmax','#f27a88','→ sıradaki kelime')+'</g>';
  // oklar
  s+=arr(X1+100,by(0)+14,X1+100,by(1)+70,'#3fc7c1')+arr(X2+115,by(0)+14,X2+115,by(1)+70,'#4aa3ff')+arr(X2+115,by(1)+10,X2+115,by(2)+70,'#4aa3ff');
  s+=arr(X2+115,by(2)+10,X2+115,by(3)+70,'#ffd24a')+arr(X2+115,by(3)+10,X2+115,by(4)+66,'#5fd18a')+arr(X2+115,by(4)+14,X2+115,by(5)+66,'#ff9b3d');
  // köprü: encoder -> çapraz attention (bellek)
  s+='<path d="M '+(X1+100)+' '+(by(1)+10)+' L '+(X1+100)+' '+(by(2)+40)+' L '+(X2)+' '+(by(2)+40)+'" fill="none" stroke="#ffd24a" stroke-width="2.4" stroke-dasharray="7 4" marker-end="url(#ppArr)"/>';
  s+='<text x="'+(X1+110)+'" y="'+(by(2)+34)+'" fill="#ffd24a" font-size="12">bellek M (K ve V)</text>';
  // döngü oku
  s+='<path d="M '+(X2+232)+' '+(by(5)+40)+' C '+(W-30)+' '+(by(5)+40)+' '+(W-30)+' '+(by(0)+40)+' '+(X2+232)+' '+(by(0)+40)+'" fill="none" stroke="#cdd4e4" stroke-width="1.6" stroke-dasharray="4 4" marker-end="url(#ppArr)"/><text x="'+(W-24)+'" y="'+(by(2)+50)+'" fill="#9fb0d0" font-size="11" transform="rotate(90 '+(W-24)+' '+(by(2)+50)+')" >üretilen kelime hedefe eklenir</text>';
  s+='</svg>';
  host.innerHTML='<div id="ppOverBtns" style="display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px"></div><div style="overflow-x:auto"><div style="min-width:640px">'+s+'</div></div><div id="ppOverCap" class="callout" style="margin-top:8px;min-height:44px"></div>';
  const btns=host.querySelector('#ppOverBtns'),cap=host.querySelector('#ppOverCap');
  const ALL='<b>Genel resim.</b> Sol sütun <b>encoder</b> (kaynağı okur), sağ sütun <b>decoder</b> (hedefi yazar). Altı bölüm aşağıdan yukarı akar; bir bölüme tıkla, ne yaptığını gör. Ayrıntılı adım adım tur ➕ Ekstra\'da.';
  let cur=-1;
  function show(i){cur=i;
    host.querySelectorAll('.pp-band').forEach(g=>{const on=i<0||+g.dataset.b===i;g.style.opacity=on?1:.28;});
    host.querySelectorAll('.pp-el').forEach(g=>{const on=i<0||+g.dataset.b===i||(i===2&&+g.dataset.b===1&&false);g.style.opacity=on?1:.25;});
    btns.querySelectorAll('button').forEach((b,k)=>b.classList.toggle('on',k-1===i));
    cap.innerHTML=i<0?ALL:B[i].t;}
  btns.innerHTML='<button class="rex-btn on">Hepsi</button>'+B.map((b,i)=>'<button class="rex-btn" style="border-color:'+b.c+'">'+b.n+'</button>').join('');
  btns.onclick=e=>{const k=[...btns.children].indexOf(e.target.closest('button'));if(k>=0)show(k-1);};
  host.querySelectorAll('.pp-band,.pp-el').forEach(g=>g.onclick=()=>show(cur===+g.dataset.b?-1:+g.dataset.b));
  show(-1);
})();
