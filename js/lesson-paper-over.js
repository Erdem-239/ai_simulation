// Makale dersi → Simülasyon: GENEL RESİM. Makaledeki encoder-decoder mimarisi (Şekil 1) — 6 bölüm, bloğun içi (Multi-Head, self/çapraz attention, FFN, Add&Norm) görünür; sayı yok.
window.__ppOverBuild=function(host){
  const B=[ // alttan yukarı
   {n:'① girdiler',c:'#3fc7c1',t:'<b>① Girdiler.</b> Kaynak cümle (Türkçe) encoder\'a, şimdiye kadar yazılan hedef (İngilizce) decoder\'a girer; ikisine de <b>gömme + konum</b> bilgisi eklenir.'},
   {n:'② self-attention',c:'#4aa3ff',t:'<b>② Self-attention (Multi-Head).</b> Her kelime <b>aynı cümledeki</b> ötekilere bakar: <b>h kafa</b> yan yana çalışır (her kafa kendi Q, K, V\'siyle Q·K → softmax → ·V), çıktılar <b>Concat + W<sub>O</sub></b> ile birleşir, sonra Add &amp; Norm. Encoder\'da hepsini görür; decoder\'da <b>maskeli</b>: geleceğe bakamaz.'},
   {n:'③ çapraz attention',c:'#ffd24a',t:'<b>③ Çapraz attention — makaleyi özel kılan köprü.</b> Decoder\'ın çok kafalı attention\'ında <b>Q decoder\'dan, K ve V encoder belleğinden</b> gelir: yazan taraf kaynakta hangi kelimeye bakacağını seçer. Encoder tarafında bu bantta bloğun <b>FFN</b>\'i var; çıktısı <b>bellek M</b> olarak köprüye gider.'},
   {n:'④ karışım + residual',c:'#5fd18a',t:'<b>④ Karışım + residual.</b> Kaynaktan alınan bilgi decoder kartına eklenir ve <b>FFN</b> ile işlenir (Add &amp; Norm). Bu üçlü (maskeli self → çapraz → FFN) decoder\'da <b>N kez</b> tekrarlanır.'},
   {n:'⑤ Linear',c:'#ff9b3d',t:'<b>⑤ Linear.</b> Her pozisyonun kartı, sözlükteki bütün kelimeler için bir <b>puana</b> çevrilir.'},
   {n:'⑥ softmax',c:'#f27a88',t:'<b>⑥ Softmax.</b> Puanlar olasılığa döner; en olası kelime <b>sıradaki kelimedir</b>. Hedefe eklenir ve döngü tekrarlanır.'}];
  const H=142,Y0=10,W=940,X1=232,W1=240,X2=590,W2=320;
  const by=i=>Y0+(5-i)*H;
  const T=(x,y,t,fill,sz,w,al)=>'<text x="'+x+'" y="'+y+'" fill="'+fill+'" font-size="'+sz+'"'+(w?' font-weight="'+w+'"':'')+' text-anchor="'+(al||'middle')+'">'+t+'</text>';
  function simple(x,y,w,h,title,sub,col){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="10" fill="#141c2c" stroke="'+col+'" stroke-width="2"/>'+T(x+w/2,y+h/2-1,title,'#e8ebf2',14,700)+T(x+w/2,y+h/2+16,sub,'#9fb0d0',11);}
  function mha(x,y,w,h,title,sub,col){ // çok kafalı attention kutusu: kafalar + Concat/W_O + Add&Norm
    let s='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="10" fill="#141c2c" stroke="'+col+'" stroke-width="2"/>'+T(x+w/2,y+17,title,'#e8ebf2',13.5,700);
    const n=4,gw=(w-28-(n-1)*6)/n;
    ['kafa 1','kafa 2','…','kafa h'].forEach((l,i)=>{const gx=x+14+i*(gw+6);
      s+='<rect x="'+gx+'" y="'+(y+26)+'" width="'+gw+'" height="34" rx="6" fill="#1c2740" stroke="'+(l==='…'?'#4a5878':col)+'" stroke-width="1.3"/>'+T(gx+gw/2,y+40,l,l==='…'?'#7d8aa6':col,11,700)+(l==='…'?'':T(gx+gw/2,y+54,'Q · K · V','#9fb0d0',9.5));});
    s+=T(x+w/2,y+76,'Concat  →  W_O','#cdd4e4',11);
    s+='<rect x="'+(x+w/2-62)+'" y="'+(y+h-28)+'" width="124" height="18" rx="9" fill="#12301f" stroke="#5fd18a"/>'+T(x+w/2,y+h-15,'Add &amp; Norm','#5fd18a',11,700);
    return s;}
  function ffn(x,y,w,h,col){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="10" fill="#141c2c" stroke="'+col+'" stroke-width="2"/>'+T(x+w/2,y+22,'Feed Forward (FFN)','#e8ebf2',13.5,700)+T(x+w/2,y+38,'her kelimeye ayrı: W₁ → ReLU → W₂','#9fb0d0',10.5)+'<rect x="'+(x+w/2-62)+'" y="'+(y+h-26)+'" width="124" height="18" rx="9" fill="#12301f" stroke="#5fd18a"/>'+T(x+w/2,y+h-13,'Add &amp; Norm','#5fd18a',11,700);}
  function arr(x1,y1,x2,y2,col){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+col+'" stroke-width="2.4" marker-end="url(#ppArr)"/>';}
  let s='<svg viewBox="0 0 '+W+' '+(Y0*2+6*H)+'" style="width:100%;max-width:880px;max-height:80vh;display:block;margin:0 auto" font-family="system-ui,sans-serif"><defs><marker id="ppArr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#cdd4e4"/></marker></defs>';
  B.forEach((b,i)=>{const y=by(i);
    s+='<g class="pp-band" data-b="'+i+'" style="cursor:pointer"><rect x="4" y="'+y+'" width="'+(W-8)+'" height="'+(H-6)+'" rx="12" fill="'+b.c+'" fill-opacity=".07" stroke="'+b.c+'" stroke-opacity=".55" stroke-width="1.5"/>'+T(18,y+(H-6)/2+5,b.n,b.c,15,800,'start')+'</g>';});
  // kapsayıcılar: ENCODER × N (bant 1-2), DECODER × N (bant 1-3)
  s+='<rect x="'+(X1-10)+'" y="'+(by(2)+2)+'" width="'+(W1+20)+'" height="'+(2*H-14)+'" rx="14" fill="none" stroke="#3fc7c1" stroke-width="1.6" stroke-dasharray="7 4"/>'+T(X1+W1-6,by(2)+17,'ENCODER  × N','#3fc7c1',12,800,'end');
  s+='<rect x="'+(X2-10)+'" y="'+(by(3)+2)+'" width="'+(W2+20)+'" height="'+(3*H-14)+'" rx="14" fill="none" stroke="#4aa3ff" stroke-width="1.6" stroke-dasharray="7 4"/>'+T(X2+W2-6,by(3)+17,'DECODER  × N','#4aa3ff',12,800,'end');
  // bant 0
  s+='<g class="pp-el" data-b="0" data-k="in-enc">'+simple(X1,by(0)+34,W1,64,'Kaynak cümle','kedi balığı yedi  +  gömme + konum','#3fc7c1')+'</g><g class="pp-el" data-b="0" data-k="in-dec">'+simple(X2,by(0)+34,W2,64,'Hedef (şimdiye kadar)','&lt;s&gt; cat ate  +  gömme + konum','#4aa3ff')+'</g>';
  // bant 1: self-attention
  s+='<g class="pp-el" data-b="1" data-k="sa-enc">'+mha(X1,by(1)+10,W1,H-26,'Multi-Head Self-Attention','Q, K, V hepsi aynı cümleden','#3fc7c1')+'</g><g class="pp-el" data-b="1" data-k="sa-dec">'+mha(X2,by(1)+10,W2,H-26,'Maskeli Multi-Head Self-Attention','geleceğe bakamaz (maske)','#4aa3ff')+'</g>';
  // bant 2: encoder FFN + decoder çapraz MHA
  s+='<g class="pp-el" data-b="2" data-k="ff-enc">'+ffn(X1,by(2)+28,W1,H-52,'#3fc7c1')+'</g><g class="pp-el" data-b="2" data-k="cross">'+mha(X2,by(2)+10,W2,H-26,'Multi-Head ÇAPRAZ Attention','Q: decoder · K, V: encoder','#ffd24a')+'</g>';
  // bant 3: decoder FFN
  s+='<g class="pp-el" data-b="3" data-k="ff-dec">'+ffn(X2,by(3)+28,W2,H-52,'#5fd18a')+'</g>';
  s+='<g class="pp-el" data-b="4" data-k="linear">'+simple(X2,by(4)+36,W2,60,'Linear','kart → sözlükteki her kelime için puan','#ff9b3d')+'</g>';
  s+='<g class="pp-el" data-b="5" data-k="softmax">'+simple(X2,by(5)+36,W2,60,'softmax','→ sıradaki kelime','#f27a88')+'</g>';
  // oklar
  const ex=X1+W1/2,dx=X2+W2/2;
  const top=(i,y)=>by(i)+y, bot=(i,y,h)=>by(i)+y+h;
  s+='<g class="pp-ar">';
  s+=arr(ex,top(0,34),ex,bot(1,10,H-26),'#3fc7c1')+arr(ex,top(1,10),ex,bot(2,28,H-52),'#3fc7c1');
  s+=arr(dx,top(0,34),dx,bot(1,10,H-26),'#4aa3ff')+arr(dx,top(1,10),dx,bot(2,10,H-26),'#4aa3ff')+arr(dx,top(2,10),dx,bot(3,28,H-52),'#ffd24a')+arr(dx,top(3,28),dx,bot(4,36,60),'#5fd18a')+arr(dx,top(4,36),dx,bot(5,36,60),'#ff9b3d');
  s+='</g>';
  // köprü: encoder çıktısı → çapraz attention (K, V)
  const my=by(2)+75;
  s+='<g class="pp-el pp-x" data-k="bridge"><line x1="'+(X1+W1)+'" y1="'+my+'" x2="'+X2+'" y2="'+my+'" stroke="#ffd24a" stroke-width="2.6" stroke-dasharray="7 4" marker-end="url(#ppArr)"/>'+T((X1+W1+X2)/2,my-8,'bellek M','#ffd24a',11.5,700)+T((X1+W1+X2)/2,my+16,'(K ve V)','#ffd24a',10.5)+'</g>';
  // döngü oku
  s+='<g class="pp-el pp-x" data-k="loop"><path d="M '+(X2+W2)+' '+(by(5)+66)+' C '+(W-30)+' '+(by(5)+66)+' '+(W-30)+' '+(by(0)+66)+' '+(X2+W2)+' '+(by(0)+66)+'" fill="none" stroke="#cdd4e4" stroke-width="1.6" stroke-dasharray="4 4" marker-end="url(#ppArr)"/>'+'<text transform="translate('+(W-12)+','+(by(2)+60)+') rotate(90)" fill="#9fb0d0" font-size="11" text-anchor="middle">üretilen kelime hedefe eklenir</text>'+'</g>';
  s+='</svg>';
  host.innerHTML='<div style="overflow-x:auto"><div style="min-width:420px">'+s+'</div></div>';
  const keyBand={'in-enc':0,'in-dec':0,'sa-enc':1,'sa-dec':1,'ff-enc':2,'cross':2,'ff-dec':3,'linear':4,'softmax':5,'bridge':2};
  function focus(keys){const all=!keys;
    host.querySelectorAll('.pp-el').forEach(g=>{g.style.opacity=(all||keys.indexOf(g.dataset.k)>=0)?1:.22;});
    const ab=new Set(all?[]:keys.map(k=>keyBand[k]));
    host.querySelectorAll('.pp-band').forEach(g=>{g.style.opacity=(all||ab.has(+g.dataset.b))?1:.3;});
    host.querySelectorAll('.pp-ar').forEach(g=>{g.style.opacity=all?1:.3;});}
  return {focus};
};
