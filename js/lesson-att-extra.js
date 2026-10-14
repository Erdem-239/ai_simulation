// Self-Attention dersi ek bölümler: (4) veri akışı + boyutlar (oyuncağın gerçek sayılarıyla), (5) self vs çapraz dikkat, (6) Transformer'da yeri.
// Hepsi kendi çizimimiz; oyuncakla (js/app.js, "self-attention: dikkat ısı haritası") AYNI iki cümle ve AYNI gömmeler.
(function(){
  const $=id=>document.getElementById(id);
  const fm=(v,d=2)=>(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',').replace(/^-/,'−');
  const SENT=[
    {toks:['kedi','sütü','çünkü','açtı'],emb:[[1.0,0.2],[0.3,1.0],[-0.8,-0.3],[0.9,0.6]]},
    {toks:['banka','para','nehir','kıyı'],emb:[[0.9,0.5],[1.0,0.3],[-0.6,0.9],[-0.5,1.0]]}];
  const WS={
    id:{q:[[1,0],[0,1]],k:[[1,0],[0,1]],v:[[1,0],[0,1]]},
    ex:{q:[[1,0.5],[0,1]],k:[[1,0],[0.5,1]],v:[[0.5,0],[0,1.5]]}};
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)));
  const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  const smx=M=>M.map(r=>{const m=Math.max(...r),e=r.map(v=>Math.exp(v-m)),t=e.reduce((a,b)=>a+b,0);return e.map(v=>v/t);});
  // küçük matris tablosu (heat: 0-1 arası değerler için yeşil ısı)
  const mat=(M,rows,cols,heat)=>{
    let h='<table style="border-collapse:collapse;font-size:12px;margin:2px auto"><tr><td></td>'+(cols||M[0].map(()=>'')).map(c=>'<td style="padding:1px 5px;color:var(--muted);font-size:10.5px;text-align:center">'+c+'</td>').join('')+'</tr>';
    M.forEach((r,i)=>{h+='<tr><td style="padding:1px 6px 1px 0;color:var(--muted);font-size:10.5px;text-align:right">'+(rows?rows[i]:'')+'</td>'+r.map(v=>'<td style="padding:2px 6px;text-align:center;border:1px solid #2a3552;'+(heat?'background:rgba(70,196,106,'+(0.1+0.85*v)+');':'')+'">'+(heat?'%'+Math.round(v*100):fm(v))+'</td>').join('')+'</tr>';});
    return h+'</table>';};
  const card=(title,shape,body,col)=>'<div style="flex:1 1 150px;min-width:140px;border:1px solid '+(col||'#334063')+';border-radius:10px;padding:8px 8px 6px;background:rgba(255,255,255,.02)"><div style="font-size:12.5px;text-align:center"><b>'+title+'</b></div><div style="font-size:10.5px;color:var(--muted);text-align:center;margin-bottom:3px">'+shape+'</div>'+body+'</div>';
  const arrow=t=>'<div style="text-align:center;color:#95a2c2;font-size:12px;margin:5px 0">⬇ '+t+'</div>';

  // ============ 4) VERİ AKIŞI ============
  const flow=$('atFlow');
  if(flow){
    const st={s:0,w:'id'};
    flow.innerHTML=
     '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;font-size:13px"><span>Cümle:</span><button class="addbtn atfS" data-s="0">"kedi · sütü · çünkü · açtı"</button><button class="addbtn atfS" data-s="1">"banka · para · nehir · kıyı"</button>'+
     '<span style="margin-left:8px">W matrisleri:</span><button class="addbtn atfW" data-w="id">birim (oyuncak)</button><button class="addbtn atfW" data-w="ex">örnek W (elle seçilmiş)</button></div>'+
     '<div id="atfOut"></div>';
    const draw=()=>{
      const S=SENT[st.s],X=S.emb,n=X.length,d=2,W=WS[st.w];
      const Q=mm(X,W.q),K=mm(X,W.k),V=mm(X,W.v),raw=mm(Q,tr(K)),sc=raw.map(r=>r.map(v=>v/Math.sqrt(d))),A=smx(sc),Z=mm(A,V);
      const rl=S.toks,dl=['d₁','d₂'],tl=S.toks;
      const wcard=(t,M)=>'<div style="font-size:11px;color:var(--muted);text-align:center;margin-top:4px">'+t+'</div>'+mat(M,['','']);
      const html=
       '<div style="display:flex;justify-content:center">'+card('X — kelime vektörleri','(n×d) = ('+n+'×'+d+')',mat(X,rl,dl),'#4ad0e0')+'</div>'+
       arrow('üç ayrı matrisle çarp: Q = X·W_Q , K = X·W_K , V = X·W_V  (her biri d×d)')+
       '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
         card('Q — sorgu','(n×d)',wcard('W_Q (d×d)',W.q)+mat(Q,rl,dl),'#7aa8ff')+
         card('K — anahtar','(n×d)',wcard('W_K (d×d)',W.k)+mat(K,rl,dl),'#ffd54a')+
         card('V — içerik','(n×d)',wcard('W_V (d×d)',W.v)+mat(V,rl,dl),'#46c46a')+'</div>'+
       arrow('Q · Kᵀ → her kelime her kelimeyle ne kadar uyuşuyor, sonra ÷ √d (= ÷ '+fm(Math.sqrt(d))+')')+
       '<div style="display:flex;justify-content:center">'+card('S — skor tablosu','(n×n) = ('+n+'×'+n+')',mat(sc,rl,tl))+'</div>'+
       arrow('her SATIRA softmax → yüzde (satır toplamı %100)')+
       '<div style="display:flex;justify-content:center">'+card('A — dikkat yüzdeleri','(n×n)',mat(A,rl,tl,true),'#46c46a')+'</div>'+
       arrow('A · V → yüzdelerle içeriklerin karışımı')+
       '<div style="display:flex;justify-content:center">'+card('Z — yeni, bağlamlı vektörler','(n×d) = girdiyle aynı şekil',mat(Z,rl,dl),'#e06a9a')+'</div>';
      $('atfOut').innerHTML=html;
      flow.querySelectorAll('.atfS').forEach(b=>{const on=+b.dataset.s===st.s;b.style.background=on?'var(--blue)':'var(--panel)';b.style.color=on?'#fff':'var(--text)';b.style.border='1px solid var(--line)';});
      flow.querySelectorAll('.atfW').forEach(b=>{const on=b.dataset.w===st.w;b.style.background=on?'var(--blue)':'var(--panel)';b.style.color=on?'#fff':'var(--text)';b.style.border='1px solid var(--line)';});
      window.__attFlow={Q,K,V,A,Z};
    };
    flow.addEventListener('click',e=>{const s=e.target.closest('.atfS'),w=e.target.closest('.atfW');if(s){st.s=+s.dataset.s;draw();}if(w){st.w=w.dataset.w;draw();}});
    draw();
  }

  // ============ 5) SELF mi ÇAPRAZ MI ============
  const cross=$('atCross');
  if(cross){
    const box=(x,y,w,h,t,col,sub)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="rgba(255,255,255,.03)" stroke="'+col+'" stroke-width="2"/><text x="'+(x+w/2)+'" y="'+(y+h/2+(sub?-2:4))+'" text-anchor="middle" font-size="12" fill="#e9edf8" font-weight="700">'+t+'</text>'+(sub?'<text x="'+(x+w/2)+'" y="'+(y+h/2+12)+'" text-anchor="middle" font-size="9.5" fill="#95a2c2">'+sub+'</text>':'');
    const ar=(x1,y1,x2,y2,col)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+col+'" stroke-width="2" marker-end="url(#acArr)"/>';
    // A paneli: self
    let a='<text x="170" y="18" text-anchor="middle" font-size="13" fill="#46c46a" font-weight="700">SELF-attention (bu ders)</text>';
    a+=box(80,34,180,40,'X (aynı cümle)','#4ad0e0','n kelime × d');
    a+=ar(130,74,60,118,'#7aa8ff')+ar(170,74,170,118,'#ffd54a')+ar(210,74,280,118,'#46c46a');
    a+=box(20,118,80,34,'Q','#7aa8ff')+box(130,118,80,34,'K','#ffd54a')+box(240,118,80,34,'V','#46c46a');
    a+=box(60,176,220,40,'skor tablosu n×n','#95a2c2','kare: kelime ↔ kelime');
    a+='<text x="170" y="242" text-anchor="middle" font-size="11" fill="#ccd5e8">her kelime, aynı cümlenin kelimelerine bakar</text>';
    // B paneli: çapraz
    let b='<text x="170" y="18" text-anchor="middle" font-size="13" fill="#f0a032" font-weight="700">ÇAPRAZ (cross) attention</text>';
    b+=box(10,34,140,40,'Y (hedef cümle)','#e06a9a','m kelime × d');
    b+=box(190,34,140,40,'X (kaynak cümle)','#4ad0e0','n kelime × d');
    b+=ar(80,74,60,118,'#7aa8ff')+ar(250,74,170,118,'#ffd54a')+ar(280,74,280,118,'#46c46a');
    b+=box(20,118,80,34,'Q','#7aa8ff')+box(130,118,80,34,'K','#ffd54a')+box(240,118,80,34,'V','#46c46a');
    b+=box(60,176,220,40,'skor tablosu m×n','#95a2c2','dikdörtgen: hedef ↔ kaynak');
    b+='<text x="170" y="242" text-anchor="middle" font-size="11" fill="#ccd5e8">hedef kelime, kaynak kelimelere bakar</text>';
    const defs='<defs><marker id="acArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#95a2c2"/></marker></defs>';
    cross.innerHTML=
     '<div style="display:flex;gap:14px;flex-wrap:wrap">'+
       '<div style="flex:1 1 320px;min-width:0;overflow-x:auto"><svg viewBox="0 0 340 252" style="width:100%;max-width:400px;min-width:300px;display:block;margin:0 auto" role="img" aria-label="Self-attention şeması">'+defs+a+'</svg></div>'+
       '<div style="flex:1 1 320px;min-width:0;overflow-x:auto"><svg viewBox="0 0 340 252" style="width:100%;max-width:400px;min-width:300px;display:block;margin:0 auto" role="img" aria-label="Çapraz attention şeması">'+defs+b+'</svg></div></div>'+
     '<div style="overflow-x:auto"><table class="rex-tbl" style="font-size:12.5px;margin-top:8px"><tr><th></th><th>Self-attention</th><th>Çapraz (cross) attention</th></tr>'+
       '<tr><td>Q nereden?</td><td>X (aynı cümle)</td><td>Y (<b>hedef</b> cümle, decoder)</td></tr>'+
       '<tr><td>K ve V nereden?</td><td>X (aynı cümle)</td><td>X (<b>kaynak</b> cümle, encoder)</td></tr>'+
       '<tr><td>Skor tablosu</td><td>n × n (kare)</td><td>m × n (dikdörtgen)</td></tr>'+
       '<tr><td>Soru</td><td>"Bu cümlede kim kime bakmalı?"</td><td>"Çeviriyi yazarken kaynağın neresine bakayım?"</td></tr>'+
       '<tr><td>Tarihte</td><td>2016-17 civarı, Transformer ile merkeze oturdu</td><td>= <b>Bahdanau (2014)</b> attention\'ının Q/K/V diliyle yazılmış hâli</td></tr></table></div>'+
     '<div class="callout" style="margin-top:8px">🔗 <b>Aradaki tek fark:</b> K ve V\'nin <b>hangi cümleden</b> geldiği. Mekanizma (QKᵀ → softmax → ·V) birebir aynı. Bahdanau\'da decoder durumu "sorgu", encoder durumları hem "anahtar" hem "içerik" rolündeydi; Q/K/V ayrımı bunu açıkça üçe böldü.</div>';
  }

  // ============ 6) BÜYÜK RESİM ============
  const big=$('atBig');
  if(big){
    const C={self:'#46c46a',cross:'#f0a032',ffn:'#c77dff',norm:'#7a8bb5',emb:'#4ad0e0',out:'#5aa0e0'};
    const R=(x,y,w,h,t,col,key,dash)=>'<g'+(key?' data-k="'+key+'" style="cursor:pointer"':'')+'><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+col+'" fill-opacity="'+(key?'.18':'.1')+'" stroke="'+col+'" stroke-width="'+(key?2.4:1.6)+'"'+(dash?' stroke-dasharray="5 3"':'')+'/><text x="'+(x+w/2)+'" y="'+(y+h/2+4)+'" text-anchor="middle" font-size="12" fill="#e9edf8" font-weight="'+(key?700:500)+'">'+t+'</text></g>';
    const L=(x1,y1,x2,y2,col,dash)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(col||'#95a2c2')+'" stroke-width="2"'+(dash?' stroke-dasharray="5 3"':'')+' marker-end="url(#bgArr)"/>';
    let s='<defs><marker id="bgArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#95a2c2"/></marker></defs>';
    // encoder (sol) x:30..270 ; decoder (sağ) x:350..590
    s+='<rect x="14" y="244" width="270" height="224" rx="12" fill="rgba(70,196,106,.04)" stroke="#334063" stroke-dasharray="4 4"/><text transform="translate(30,356) rotate(-90)" text-anchor="middle" font-size="11" fill="#95a2c2">ENCODER bloğu ×N</text>';
    s+='<rect x="346" y="138" width="270" height="330" rx="12" fill="rgba(240,160,50,.04)" stroke="#334063" stroke-dasharray="4 4"/><text transform="translate(602,303) rotate(90)" text-anchor="middle" font-size="11" fill="#95a2c2">DECODER bloğu ×N</text>';
    // encoder öğeleri (alttan yukarı)
    s+=R(50,520,200,28,'Girdi (kaynak cümle)',C.emb)+L(150,520,150,508)+R(50,480,200,28,'Embedding + Positional Enc.',C.emb)+L(150,480,150,452)+
       R(50,410,200,42,'Multi-Head SELF-attention',C.self,'self')+L(150,410,150,392)+R(50,364,200,28,'Add & Norm',C.norm)+L(150,364,150,346)+
       R(50,302,200,44,'Feed Forward (FFN)',C.ffn)+L(150,302,150,284)+R(50,256,200,28,'Add & Norm',C.norm)+L(150,256,150,236)+
       '<text x="150" y="196" text-anchor="middle" font-size="11" fill="#95a2c2">encoder çıktısı (kaynağın bağlamlı vektörleri)</text>';
    // decoder
    s+=R(380,520,200,28,'Çıktı (şimdiye kadar yazılan)',C.emb)+L(480,520,480,508)+R(380,480,200,28,'Embedding + Positional Enc.',C.emb)+L(480,480,480,452)+
       R(380,410,200,42,'MASKELİ Multi-Head SELF-attn',C.self,'masked',true)+L(480,410,480,392)+R(380,364,200,28,'Add & Norm',C.norm)+L(480,364,480,346)+
       R(380,300,200,46,'Multi-Head ÇAPRAZ attention',C.cross,'cross')+L(480,300,480,282)+R(380,254,200,28,'Add & Norm',C.norm)+L(480,254,480,236)+
       R(380,192,200,44,'Feed Forward (FFN)',C.ffn)+L(480,192,480,174)+R(380,146,200,28,'Add & Norm',C.norm)+L(480,146,480,128)+
       R(380,96,200,32,'Linear + Softmax',C.out)+'<text x="480" y="80" text-anchor="middle" font-size="12" fill="#e9edf8" font-weight="700">sıradaki kelimenin olasılıkları</text>';
    // encoder çıktısından çapraz attention'a (K, V)
    s+='<path d="M150,236 L150,206 L312,206 L312,323 L378,323" fill="none" stroke="'+C.cross+'" stroke-width="2.4" stroke-dasharray="5 3" marker-end="url(#bgArr)"/><text x="320" y="200" font-size="10.5" fill="'+C.cross+'">K, V</text>';
    big.innerHTML=
     '<div style="overflow-x:auto"><svg id="atBigSvg" viewBox="0 58 640 502" style="width:100%;max-width:720px;min-width:520px;display:block;margin:0 auto" role="img" aria-label="Transformer mimarisinde attention katmanlarının yeri">'+s+'</svg></div>'+
     '<div id="atBigInfo" class="callout" style="margin-top:8px"></div>'+
     '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;font-size:12.5px;color:#ccd5e8"><span><b style="color:'+C.self+'">■</b> self-attention (bu ders)</span><span><b style="color:'+C.cross+'">■</b> çapraz attention (Bahdanau\'nun torunu)</span><span><b style="color:'+C.ffn+'">■</b> FFN (Transformer Bloğu dersi)</span><span><b style="color:'+C.norm+'">■</b> Add &amp; Norm (residual + LayerNorm)</span></div>';
    const INFO={
      '':'👆 <b>Renkli bir kutuya tıkla.</b> Bu şema Transformer\'ın sadeleştirilmiş çizimi; bu dersin konusu yeşil kutular, turuncu kutu Bahdanau\'nun fikrinin devamı.',
      self:'<b>Multi-Head SELF-attention (encoder).</b> Kaynak cümlenin her kelimesi, aynı cümlenin diğer kelimelerine bakar. Bu derste anlattığımız katman bu; "Multi-Head" ise onun paralel birkaç kopyası (sonraki ders). Bu yığın tek başına kullanılırsa <b>BERT</b> gibi modeller çıkar.',
      masked:'<b>MASKELİ self-attention (decoder).</b> Aynı katman, ama bir kelime yalnızca <b>kendinden öncekilere</b> bakabilir (sonrasını "göremesin" diye skor tablosunun üst üçgeni gizlenir). Çünkü yazarken gelecekteki kelime henüz yok. Decoder yığını tek başına kullanılırsa <b>GPT</b> gibi modeller çıkar.',
      cross:'<b>ÇAPRAZ attention (decoder).</b> Q decoder\'dan, K ve V encoder çıktısından gelir (turuncu kesikli ok). Bahdanau\'nun "çeviri yazarken kaynağın neresine bakayım?" fikrinin Q/K/V ile yazılmış hâli. GPT gibi yalnız-decoder modellerde encoder olmadığı için bu katman yoktur.'};
    const show=k=>{$('atBigInfo').innerHTML=INFO[k||''];};
    show('');
    big.addEventListener('click',e=>{const g=e.target.closest('[data-k]');if(g)show(g.dataset.k);});
  }
})();
