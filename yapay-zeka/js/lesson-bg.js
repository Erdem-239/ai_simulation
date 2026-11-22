// 🔀 BERT ↔ GPT dersi (#model-bg):
//  (A) dikkat maskesi: encoder (iki yönlü) / decoder (nedensel) / encoder-decoder — kim kime bakabilir + eğitim hedefi
//  (B) boşluk doldurma laboratuvarı: aynı 20 cümlede "yalnız sol" (GPT gibi) ↔ "sol + sağ" (BERT gibi) sayma modelleri
//  Motor sayfadaki Python koduyla (bg.py) birebir aynı.
(function(){
  const host=document.getElementById('bgSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const pc=v=>'%'+(v*100).toFixed(1).replace('.',',');
  const CUM=["kedi süt içti","kedi uyudu","kedi bahçede oynadı","kedi bahçede uyudu","kedi süt içti","kedi top ile oynadı","köpek kemik yedi","köpek bahçede koştu","köpek havladı","köpek bahçede oynadı","çocuk bahçede oynadı","çocuk top ile oynadı","çocuk süt içti","çocuk kitap okudu","çocuk uyudu","kuş ağaçta öttü","kuş uçtu","kuş bahçede öttü","bahçede çiçek açtı","kedi kuş ile oynadı"];
  const parca=c=>['<'].concat(c.split(' '),['>']);
  const SOZ=[];CUM.forEach(c=>c.split(' ').forEach(w=>{if(!SOZ.includes(w))SOZ.push(w);}));
  function sayac(cs){const sol={},iki={};for(const c of cs){const t=parca(c);for(let i=1;i<t.length-1;i++){const a=t[i-1],w=t[i],b=t[i+1],k=a+'\u0001'+b;
    (sol[a]=sol[a]||{})[w]=(sol[a][w]||0)+1;(iki[k]=iki[k]||{})[w]=(iki[k][w]||0)+1;}}return {sol,iki};}
  const ctx=(S,a,b,yon)=>{let c=yon==='iki'?S.iki[a+'\u0001'+b]:null;if(!c)c=S.sol[a]||{};return c;};
  function tahmin(S,a,b,yon){const c=ctx(S,a,b,yon);let best=null,bn=0;for(const w of SOZ){const n=c[w]||0;if(n>bn){bn=n;best=w;}}return best;}
  function dagilim(S,a,b,yon){const c=ctx(S,a,b,yon);let n=0;for(const w in c)n+=c[w];return SOZ.filter(w=>w in c).map(w=>[w,c[w]/n,c[w]]);}
  const S=sayac(CUM);
  window.__bg={CUM,SOZ,sayac,tahmin,dagilim,parca};

  // ---- (A) dikkat maskesi ----
  let arch='enc', cs=5, pos=2;
  const AR={enc:'🔵 Encoder (BERT)',dec:'🟠 Decoder (GPT)',ed:'🟣 Encoder-Decoder (T5)'};
  function mask(){
    const t=['kedi','top','ile','oynadı','.'];
    let h='<div class="tk-h">'+AR[arch]+' — satırdaki kelime, sütundaki kelimeye bakabilir mi?</div><table class="tk-tbl bg-mask"><tr><th>soran ↓ / bakılan →</th>'+t.map(w=>'<th>'+w+'</th>').join('')+'</tr>';
    t.forEach((r,i)=>{h+='<tr><th>'+r+'</th>'+t.map((_,j)=>{const ok=arch==='dec'?j<=i:true;return '<td class="'+(ok?'ok':'no')+'">'+(ok?'✓':'✗')+'</td>';}).join('')+'</tr>';});
    h+='</table>';
    if(arch==='enc')h+='<p class="gn-note">Her kelime <b>hem solunu hem sağını</b> görür (maskesiz dikkat). Eğitim: kelimelerin ~%15\'i <code>[MASK]</code> yapılır, model onları tahmin eder:<br><span class="gn-w">kedi</span> <span class="gn-w new">[MASK]</span> <span class="gn-w">ile</span> <span class="gn-w">oynadı</span> <span class="gn-w">.</span> → «top»</p>';
    else if(arch==='dec')h+='<p class="gn-note">Her kelime yalnız <b>kendisini ve solunu</b> görür (nedensel maske: üst üçgen kapalı). Eğitim: <b>her konumda</b> sıradaki kelimeyi tahmin et:<br>'+t.slice(0,-1).map((w,i)=>'<span class="gn-w">'+t.slice(0,i+1).join(' ')+'</span> → «'+t[i+1]+'»').join('<br>')+'</p>';
    else h+='<p class="gn-note">İki parça: <b>encoder</b> girdiyi maskesiz okur (bu tablo), <b>decoder</b> çıktıyı soldan sağa yazar (kendi içinde nedensel maske) ve her adımda encoder\'ın bütün çıktısına <b>çapraz dikkat</b>le bakar. Eğitim (T5): girdide bir parça silinir, decoder silinen parçayı yazar: «kedi <span class="gn-w new">⟨X⟩</span> oynadı .» → «⟨X⟩ top ile». Çeviri ve özetleme için doğal yapı (Seq2Seq dersindeki gibi).</p>';
    $('bgMask').innerHTML=h;
    host.querySelectorAll('.bg-arch').forEach(b=>b.classList.toggle('on',b.dataset.a===arch));
  }
  // ---- (B) boşluk doldurma ----
  function lab(){
    const t=parca(CUM[cs]);if(pos<1||pos>t.length-2)pos=1;
    $('bgSent').innerHTML=t.map((w,i)=>i===0||i===t.length-1?'<span class="bg-edge">'+esc(w)+'</span>':'<button class="gn-w bg-tok'+(i===pos?' new':'')+'" data-i="'+i+'">'+(i===pos?'[MASK]':esc(w))+'</button>').join(' ');
    host.querySelectorAll('.bg-tok').forEach(b=>b.onclick=()=>{pos=+b.dataset.i;lab();});
    const a=t[pos-1],b=t[pos+1],w=t[pos];
    const col=(yon,ttl)=>{const d=dagilim(S,a,b,yon),g=tahmin(S,a,b,yon),pw=(d.find(x=>x[0]===w)||[0,0])[1];
      return '<div class="bg-col"><div class="tk-h">'+ttl+'</div>'+d.sort((x,y)=>y[1]-x[1]).map(([x,p,n])=>'<div><span class="gn-w'+(x===w?' new':'')+'">'+esc(x)+'</span> <span class="gn-bar" style="width:'+Math.round(p*120)+'px"></span> '+pc(p)+' <small>('+n+')</small>'+(x===g?' ← tahmin':'')+'</div>').join('')+'<p class="gn-note">doğru «'+esc(w)+'»: '+pc(pw)+(g===w?' ✅':' ❌')+'</p></div>';};
    $('bgCols').innerHTML=col('sol','🟠 GPT gibi: yalnız sol «'+esc(a)+'»')+col('iki','🔵 BERT gibi: sol «'+esc(a)+'» + sağ «'+esc(b)+'»');
    const dS=dagilim(S,a,b,'sol'),dI=dagilim(S,a,b,'iki'),seen=!!S.iki[a+'\u0001'+b];
    let st='<b class="h">✏️ Bu boşlukta</b>Gizlenen kelime: «'+esc(w)+'». ';
    st+='GPT tarafı metinde «'+esc(a)+'»dan sonra gelen bütün kelimeleri sayar: '+dS.length+' aday. ';
    st+=seen?'BERT tarafı yalnız «'+esc(a)+' ___ '+esc(b)+'» kalıbının geçtiği yerleri sayar: '+dI.length+' aday.':'«'+esc(a)+' ___ '+esc(b)+'» kalıbı metinde hiç geçmediği için BERT tarafı sola düştü.';
    $('bgStep').innerHTML=st;
    const pS=(dS.find(x=>x[0]===w)||[0,0])[1],pI=(dI.find(x=>x[0]===w)||[0,0])[1];
    let soz='<b class="h">🗣️ Ne anlama geliyor?</b>';
    if(pI>pS+1e-9)soz+='Sağdaki «'+esc(b)+'» tabloyu değiştirdi: doğru kelimenin olasılığı '+pc(pS)+' → '+pc(pI)+'. BERT bir kelimeyi anlamak için cümlenin <b>devamını da</b> kullanabilir — sınıflandırma, arama, boşluk doldurma gibi işlerde güçlü olmasının nedeni bu.';
    else if(Math.abs(pI-pS)<1e-9)soz+='Bu boşlukta sağ taraf yeni bilgi katmadı ('+pc(pS)+'). Her kelimede sağın yardımı olmaz.';
    else soz+='Bu boşlukta sağ taraf yanılttı ('+pc(pS)+' → '+pc(pI)+').';
    soz+=' GPT ise sağı göremez — ama tam da bu yüzden <b>metin üretebilir</b>: üretirken sağ henüz yazılmamıştır.';
    $('bgSoz').innerHTML=soz;
    host.querySelectorAll('.bg-cum').forEach(o=>o.selected=+o.value===cs);
  }
  host.querySelectorAll('.bg-arch').forEach(b=>b.onclick=()=>{arch=b.dataset.a;mask();});
  $('bgCumSel').innerHTML=CUM.map((c,i)=>'<option class="bg-cum" value="'+i+'">'+esc(c)+'</option>').join('');
  $('bgCumSel').onchange=e=>{cs=+e.target.value;pos=1;lab();};
  mask();lab();

  // ---- Örnek Çalışmalar ----
  const e1=$('bgEx1');if(e1){const r=['sol','iki'].map(yon=>{let d=0,n=0,p=0;for(const c of CUM){const t=parca(c);for(let i=1;i<t.length-1;i++){n++;if(tahmin(S,t[i-1],t[i+1],yon)===t[i])d++;p+=(dagilim(S,t[i-1],t[i+1],yon).find(x=>x[0]===t[i])||[0,0])[1];}}return [d,n,p/n];});
    window.__bgEx1=r;
    e1.innerHTML='<table class="tk-tbl"><tr><th>model</th><th>doğru tahmin</th><th>doğru kelimeye ort. olasılık</th></tr><tr><td>🟠 GPT gibi (yalnız sol)</td><td>'+r[0][0]+' / '+r[0][1]+'</td><td>'+r[0][2].toFixed(4).replace('.',',')+'</td></tr><tr><td>🔵 BERT gibi (sol + sağ)</td><td>'+r[1][0]+' / '+r[1][1]+'</td><td>'+r[1][2].toFixed(4).replace('.',',')+'</td></tr></table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> Aynı metinde iki yanı gören model boşlukların '+r[1][0]+'\'ini, yalnız solu gören '+r[0][0]+'\'ini doğru dolduruyor; doğru kelimeye verdiği olasılık neredeyse iki katı. "Anlama" işlerinde (bu kelime ne anlama geliyor, bu cümle olumlu mu) çift yönlü bağlam büyük avantaj.</div>';}
  const e2=$('bgEx2');if(e2){const r=['sol','iki'].map(yon=>{let d=0,n=0;CUM.forEach((c,k)=>{const Sk=sayac(CUM.slice(0,k).concat(CUM.slice(k+1))),t=parca(c);for(let i=1;i<t.length-1;i++){n++;if(tahmin(Sk,t[i-1],t[i+1],yon)===t[i])d++;}});return [d,n];});
    window.__bgEx2=r;
    e2.innerHTML='<table class="tk-tbl"><tr><th>model</th><th>görmediği cümlede doğru</th></tr><tr><td>🟠 GPT gibi</td><td>'+r[0][0]+' / '+r[0][1]+'</td></tr><tr><td>🔵 BERT gibi</td><td>'+r[1][0]+' / '+r[1][1]+'</td></tr></table>'+
    '<div class="callout">💡 <b>Ne öğrendik (dürüst sonuç):</b> Her cümleyi sayımdan çıkarıp yalnız diğer 19 cümleyle tahmin edince avantaj <b>kayboldu</b> ('+r[1][0]+' ↔ '+r[0][0]+'). Nedeni veri azlığı: «sol ___ sağ» kalıbı çok daha ayrıntılı bir bağlam, 19 cümlede çoğu hiç geçmiyor ya da bir kez geçiyor. Sayma modeli benzer kalıpları birleştiremez; gerçek BERT\'in işe yaramasının nedeni, kelimeleri vektörlerle temsil edip <b>benzer bağlamlar arasında genelleyebilmesi</b> ve milyarlarca kelimeyle eğitilmesi (Kelime Temsili dersi).</div>';}
  const e3=$('bgEx3');if(e3){let n=0;CUM.forEach(c=>n+=c.split(' ').length+1);
    e3.innerHTML='<table class="tk-tbl"><tr><th></th><th>bir geçişte tahmin</th><th>neyi tahmin ediyor</th></tr><tr><td>🟠 GPT</td><td>'+n+'</td><td>her konumda sıradaki kelime (cümle sonu dahil)</td></tr><tr><td>🔵 BERT</td><td>≈ '+Math.round(0.15*n)+'</td><td>maskelenen %15</td></tr></table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> Aynı metinden GPT bir geçişte '+n+', BERT yaklaşık '+Math.round(0.15*n)+' öğrenme sinyali alır. BERT her tahminde iki yanı gördüğü için daha zengin bilgiyle öğrenir; GPT her konumdan öğrendiği için veriyi daha verimli kullanır. Ölçek büyüdükçe "her konum" avantajı ve metin üretebilme, decoder-only yapıyı (GPT, Llama, Qwen, gpt-oss…) açık mimarisi bilinen bugünkü sohbet modellerinin baskın yapısı yaptı.</div>';}
})();
