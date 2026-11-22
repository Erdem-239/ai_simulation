// Transformer Bloğu 5️⃣ Simülasyon — "🎬 Toplama turu": 7+5 → 12'yi minik bir encoder-decoder Transformer çözer.
// Ağırlıklar çevrimdışı (numpy + autograd) eğitildi: js/lesson-tf-weights.js (window.TF_CK). Tarayıcı yalnız İLERİ hesabı yapar.
// Görev, sözlük ve 90/10 bölünme Seq2Seq dersindeki LSTM ile AYNI → iki mimari doğrudan karşılaştırılabilir.
(function(){
  const host=document.getElementById('tfTour'); const W=window.TF_CK; if(!host||!W) return;
  const D=W.D, PE=W.PE, PLUS=10, ST=10, EN=11, TEST=new Set(W.test);
  const NE=t=>t<10?String(t):'+';
  const ND=t=>t<10?String(t):(t===ST?'&lt;s&gt;':'&lt;e&gt;');
  const fm=(v,d=2)=>(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',').replace(/^-/,'−');
  const pc=v=>'%'+Math.round(v*100);
  // ---- ileri hesap (Python ile birebir aynı sıra) ----
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>{let s=0;for(let k=0;k<r.length;k++)s+=r[k]*B[k][j];return s;}));
  const add=(A,B)=>A.map((r,i)=>r.map((v,j)=>v+B[i][j]));
  const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  function ln(X,g,b){return X.map(r=>{let mu=0;for(const v of r)mu+=v;mu/=r.length;let va=0;for(const v of r)va+=(v-mu)*(v-mu);va/=r.length;const s=Math.sqrt(va+1e-5);return r.map((v,j)=>(v-mu)/s*g[j]+b[j]);});}
  function smx(r){const m=Math.max(...r),e=r.map(v=>Math.exp(v-m)),t=e.reduce((a,b)=>a+b,0);return e.map(v=>v/t);}
  function attn(P,p,xq,xkv,mask){
    const Q=mm(xq,P[p+'Q']),K=mm(xkv,P[p+'K']),V=mm(xkv,P[p+'V']);
    const S=mm(Q,tr(K)).map((r,i)=>r.map((v,j)=>(mask&&j>i)?-Infinity:v/Math.sqrt(D)));
    const A=S.map(smx), AV=mm(A,V), Z=mm(AV,P[p+'O']);
    return {Q,K,V,S,A,AV,Z};
  }
  function ffn(P,p,X){const h=mm(X,P[p+'F1']).map(r=>r.map((v,j)=>Math.max(0,v+P[p+'f1'][j])));return {h,o:mm(h,P[p+'F2']).map(r=>r.map((v,j)=>v+P[p+'f2'][j]))};}
  function encode(P,src){
    const emb=src.map(t=>P.embE[t].slice()), x=add(emb,PE.slice(0,3));
    const at=attn(P,'e',x,x,false), r1=add(x,at.Z), x1=ln(r1,P.ge1,P.be1);
    const f=ffn(P,'e',x1), r2=add(x1,f.o), M=ln(r2,P.ge2,P.be2);
    return {src,emb,x,at,r1,x1,f,r2,M};
  }
  function decode(P,M,din){
    const n=din.length, emb=din.map(t=>P.embD[t].slice()), y=add(emb,PE.slice(0,n));
    const sa=attn(P,'ds',y,y,true), y1=ln(add(y,sa.Z),P.gd1,P.bd1);
    const ca=attn(P,'dc',y1,M,false), y2=ln(add(y1,ca.Z),P.gd2,P.bd2);
    const f=ffn(P,'d',y2), y3=ln(add(y2,f.o),P.gd3,P.bd3);
    const lg=mm(y3,P.Wo).map(r=>r.map((v,j)=>v+P.bo[j])), p=lg.map(smx);
    return {din,emb,y,sa,y1,ca,y2,f,y3,lg,p};
  }
  function run(ck,a,b){
    const P=ck.W, E=encode(P,[a,PLUS,b]), seq=[ST], turns=[];
    for(let k=0;k<3;k++){const d=decode(P,E.M,seq.slice());const last=d.lg[d.lg.length-1];let best=0;for(let q=1;q<12;q++)if(last[q]>last[best])best=q;d.out=best;turns.push(d);seq.push(best);}
    return {E,turns,out:seq.slice(1),code:seq[1]*144+seq[2]*12+seq[3]};
  }
  const truth=(a,b)=>{const t=a+b;return [Math.floor(t/10),t%10,EN];};
  window.__tfTourParity=()=>{const bad=[];W.ck.forEach((ck,ci)=>{for(let i=0;i<100;i++){const r=run(ck,Math.floor(i/10),i%10);if(r.code!==ck.preds[i])bad.push([ci,i,r.code,ck.preds[i]]);}});return bad;};
  // ---- görsel yardımcılar ----
  const col=v=>{const a=Math.min(1,Math.abs(v)/2);return v>=0?'rgba(90,160,240,'+(0.12+0.6*a)+')':'rgba(224,106,106,'+(0.12+0.6*a)+')';};
  function mat(M,rl,o){o=o||{};const cl=o.cols||M[0].map((_,j)=>j+1);
    let h='<div class="tt-mat">'+(o.title?'<div class="tt-mt">'+o.title+'</div>':'')+'<table class="tt-t"><tr><td></td>'+cl.map(c=>'<th>'+c+'</th>').join('')+'</tr>';
    M.forEach((r,i)=>{h+='<tr'+(o.hl===i?' class="hl"':'')+'><th>'+rl[i]+'</th>'+r.map((v,j)=>{
      if(!isFinite(v))return '<td class="off">maske</td>';
      if(o.pct)return '<td style="background:rgba(70,196,106,'+(0.08+0.8*v)+')">'+pc(v)+'</td>';
      return '<td style="background:'+col(v)+'">'+fm(v)+'</td>';}).join('')+'</tr>';});
    return h+'</table>'+(o.note?'<div class="tt-mn">'+o.note+'</div>':'')+'</div>';}
  const row=(...xs)=>'<div class="tt-row">'+xs.join('<div class="tt-op">→</div>')+'</div>';
  // ---- mimari şeması (aşağıdan yukarı, makaledeki gibi) ----
  function arch(hl){
    const B=(x,y,w,h,t,key,c)=>'<g><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="7" fill="'+c+'" fill-opacity="'+(hl.includes(key)?.35:.1)+'" stroke="'+(hl.includes(key)?'#ffd54a':c)+'" stroke-width="'+(hl.includes(key)?3:1.4)+'"/><text x="'+(x+w/2)+'" y="'+(y+h/2+4)+'" text-anchor="middle" font-size="11.5" fill="#e9edf8" font-weight="'+(hl.includes(key)?700:500)+'">'+t+'</text></g>';
    const L=(x1,y1,x2,y2,c)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(c||'#95a2c2')+'" stroke-width="1.8" marker-end="url(#ttArr)"/>';
    let s='<defs><marker id="ttArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#95a2c2"/></marker></defs>';
    s+='<text x="80" y="16" text-anchor="middle" font-size="12" fill="#95a2c2" font-weight="700">ENCODER</text><text x="250" y="16" text-anchor="middle" font-size="12" fill="#95a2c2" font-weight="700">DECODER</text>';
    s+=B(20,392,120,26,'girdi: 7 + 5','tok','#4ad0e0')+L(80,392,80,382)+B(20,354,120,28,'gömme + konum','eemb','#4ad0e0')+L(80,354,80,342)+
       B(20,306,120,36,'self-attention','eatt','#46c46a')+L(80,306,80,296)+B(20,272,120,24,'Add & Norm','en1','#7a8bb5')+L(80,272,80,262)+
       B(20,230,120,32,'FFN','effn','#c77dff')+L(80,230,80,220)+B(20,196,120,24,'Add & Norm','en2','#7a8bb5')+L(80,196,80,186)+B(20,154,120,32,'🧠 bellek M','mem','#f0a032');
    s+=B(190,392,120,26,'girdi: &lt;s&gt; 1 2','dtok','#4ad0e0')+L(250,392,250,382)+B(190,354,120,28,'gömme + konum','demb','#4ad0e0')+L(250,354,250,342)+
       B(190,306,120,36,'MASKELİ self-attn','datt','#46c46a')+L(250,306,250,296)+B(190,272,120,24,'Add & Norm','dn1','#7a8bb5')+L(250,272,250,262)+
       B(190,226,120,36,'ÇAPRAZ attention','cross','#f0a032')+L(250,226,250,216)+B(190,192,120,24,'Add & Norm','dn2','#7a8bb5')+L(250,192,250,182)+
       B(190,150,120,32,'FFN','dffn','#c77dff')+L(250,150,250,140)+B(190,116,120,24,'Add & Norm','dn3','#7a8bb5')+L(250,116,250,106)+
       B(190,68,120,38,'Linear + Softmax','out','#5aa0e0')+L(250,68,250,48)+B(190,22,120,26,'çıktı: 1 2 &lt;e&gt;','res','#ffd54a');
    s+='<path d="M140,170 L165,170 L165,244 L188,244" fill="none" stroke="#f0a032" stroke-width="2.2" stroke-dasharray="5 3" marker-end="url(#ttArr)"/><text x="150" y="214" font-size="10" fill="#f0a032" transform="rotate(-90 158 214)">K, V</text>';
    s+='<path d="M310,35 L326,35 L326,405 L312,405" fill="none" stroke="#95a2c2" stroke-width="1.4" stroke-dasharray="3 3" marker-end="url(#ttArr)"/><text x="334" y="220" font-size="10" fill="#95a2c2" transform="rotate(90 334 220)">seçilen token geri girer</text>';
    return '<svg viewBox="10 4 340 424" class="tt-arch" role="img" aria-label="Encoder-decoder Transformer şeması">'+s+'</svg>';
  }
  // ---- durum ----
  const st={a:7,b:5,ci:W.ck.length-1,s:0};
  let R=null;
  const sel=document.createElement('div');
  function stepsOf(){
    const E=R.E, t=R.turns, src=['7','+','5'].map((_,i)=>NE(E.src[i])), q=st.a+' + '+st.b;
    const enc=E.at, rowsE=src.map(x=>'«'+x+'»');
    const dLbl=d=>d.din.map(x=>'«'+ND(x)+'»');
    const topk=(p)=>p.map((v,k)=>[v,k]).sort((x,y)=>y[0]-x[0]).slice(0,4).map(([v,k])=>'«'+ND(k)+'» '+pc(v)).join(' · ');
    const best=(r,lbl)=>{let b=0;for(let j=1;j<r.length;j++)if(r[j]>r[b])b=j;return lbl[b];};
    const S=[];
    S.push({t:'0 · Görev: «'+q+'» → iki basamaklı cevap + bitti işareti',hl:['tok','res'],
      body:'<div class="tt-chips">Encoder girdisi: '+src.map(x=>'<span class="tt-tok">'+x+'</span>').join('')+' &nbsp; → &nbsp; Hedef: '+truth(st.a,st.b).map(x=>'<span class="tt-tok y">'+ND(x)+'</span>').join('')+'</div>',
      soz:'Seq2Seq dersindeki görevin <b>aynısı</b>: soru üç token («'+src.join('», «')+'»), cevap hep iki basamak + &lt;e&gt; (5 → «0» «5» &lt;e&gt;). Fark mimaride: LSTM soruyu soldan sağa <b>sırayla</b> okuyup tek bir bağlam vektörüne sıkıştırıyordu; Transformer üç token\'ı <b>aynı anda</b> işler ve decoder, sorunun <b>her token\'ına ayrı ayrı</b> bakabilir (çapraz attention).',
      elde:'Kart boyutu D = '+D+'. Encoder 1 blok, decoder 1 blok, tek kafa. Toplam '+W.np.toLocaleString('tr-TR')+' ağırlık (LSTM ≈ 6.765).'});
    S.push({t:'1 · Gömme: one-hot × E_enc = satır seç',hl:['tok','eemb'],
      body:mat(E.emb,rowsE,{title:'E_enc satırları (3 × '+D+')'}),
      soz:'Video\'daki gibi: «'+src[0]+'» için one-hot\'ta yalnız kendi girişi 1, diğerleri 0; ağırlıklarla çarpınca yalnız <b>o token\'ın satırı</b> kalır. Yani hesap değil, tablodan satır okuma. Aynı tablo (E_enc) her token için tekrar kullanılır.',
      elde:'Her token\'ın kimlik kartı: 3 satır × '+D+' sayı. Henüz sıra bilgisi yok: «7+5» ile «5+7» aynı üç kartı verir.'});
    S.push({t:'2 · Konum: sin/cos dalgaları eklenir',hl:['eemb'],
      body:row(mat(E.emb,rowsE,{title:'gömme'}),mat(PE.slice(0,3),['konum 0','konum 1','konum 2'],{title:'konum (sin/cos)'}),mat(E.x,rowsE,{title:'X = gömme + konum'})),
      soz:'Her konuma sabit bir imza: 1., 3., 5.… sütunlar sinüs, 2., 4., 6.… sütunlar kosinüs dalgasından okunur (Multi-Head dersindeki ısı haritası). İmza <b>toplanır</b>, yapıştırılmaz: kart boyu '+D+' kalır. «'+src[0]+'» ile «'+src[2]+'» farklı konumda olduğu için artık yer değiştirince farklı X verirler.',
      elde:'X (3 × '+D+'): «ne» + «nerede» aynı kartta. Encoder\'a giren budur.'});
    S.push({t:'3 · Encoder self-attention: her token diğerlerine bakar (maskesiz)',hl:['eatt'],
      body:row(mat(enc.Q,rowsE,{title:'Q = X·W_Q'}),mat(enc.K,rowsE,{title:'K = X·W_K'}),mat(enc.V,rowsE,{title:'V = X·W_V'}))+row(mat(enc.S,rowsE,{cols:rowsE,title:'skor Q·Kᵀ ÷ √'+D}),mat(enc.A,rowsE,{cols:rowsE,pct:1,title:'softmax (satır %100)'})),
      soz:'Self-Attention dersindeki adımların aynısı: soru (Q) · etiket (K) → skor, ÷√'+D+', satır softmax. Encoder\'da <b>maske yok</b>: «'+src[0]+'» sağındaki «'+src[2]+'»yi de görür (soru zaten tamamen elimizde). «'+src[0]+'» dikkatinin en çoğunu '+best(enc.A[0],rowsE)+' token’ına ('+pc(Math.max(...enc.A[0]))+'), «+» ise '+best(enc.A[1],rowsE)+' token’ına ('+pc(Math.max(...enc.A[1]))+') veriyor.',
      elde:'Dikkat tablosu A (3 × 3). Karışım A·V·W_O her token için bağlamlı yeni bir kart verir (3 × '+D+').'});
    S.push({t:'4 · Add & Norm: kartın kendisini ekle, sonra dengele',hl:['eatt','en1'],
      body:row(mat(E.x,rowsE,{title:'X (giren)'}),mat(enc.Z,rowsE,{title:'attention çıktısı'}),mat(E.x1,rowsE,{title:'LN(X + attention)'})),
      soz:'Video\'daki <b>residual (atlama) bağlantısı</b>: attention çıktısı kartın yerine geçmez, kartın üstüne <b>eklenir</b>. Böylece «'+src[0]+'» kimliğini ve konumunu kaybetmeden komşu bilgisini taşır. Ardından LayerNorm her satırı ortalama 0, yayılım 1 olacak şekilde dengeler (LayerNorm hesap makinesi sekmesi).',
      elde:'x₁ (3 × '+D+'): kendi bilgisi + baktığı token\'lardan gelen bilgi, ölçeği dengelenmiş.'});
    S.push({t:'5 · FFN + Add & Norm → 🧠 bellek M',hl:['effn','en2','mem'],
      body:row(mat(E.x1,rowsE,{title:'x₁'}),mat(E.f.o,rowsE,{title:'FFN(x₁)  ('+D+'→'+W.F+'→'+D+', ReLU)'}),mat(E.M,rowsE,{title:'M = LN(x₁ + FFN)'})),
      soz:'FFN her satırı <b>ayrı ayrı</b> işler (token\'lar burada karışmaz): '+D+' sayıyı '+W.F+'\'ye açar, ReLU, tekrar '+D+'\'ye indirir. Video\'nun sonunda «ek gizli katmanlı ağlar» dediği parça bu. Sonra yine residual + LayerNorm.',
      elde:'Encoder\'ın çıktısı <b>bellek M (3 × '+D+')</b>: sorunun her token\'ı için bir satır. LSTM\'deki tek bağlam vektörünün aksine burada <b>üç ayrı satır</b> var; decoder hangisine bakacağını kendisi seçer.'});
    t.forEach((d,k)=>{
      const lb=dLbl(d), last=d.din.length-1, outT=ND(d.out), prev=k===0?'':' (önceki turlarda seçilen '+d.din.slice(1).map(x=>'«'+ND(x)+'»').join(', ')+' girdiye eklendi)';
      const lbl12=Array.from({length:12},(_,j)=>ND(j));
      if(k===0){
        S.push({t:'6 · Decoder başlar: &lt;s&gt; işaretinin gömmesi + konum',hl:['dtok','demb'],
          body:row(mat(d.emb,lb,{title:'E_dec[&lt;s&gt;]'}),mat(PE.slice(0,1),['konum 0'],{title:'konum'}),mat(d.y,lb,{title:'y = gömme + konum'})),
          soz:'Video\'da decoder EOS ile başlıyordu; biz Seq2Seq dersindeki gibi ayrı bir başlangıç işareti &lt;s&gt; kullanıyoruz (video da «SOS da olur» diyor). Decoder\'ın <b>kendi</b> gömme tablosu var (E_dec, 12 satır: 0-9, &lt;s&gt;, &lt;e&gt;) ve aynı sin/cos konum imzası eklenir.',
          elde:'Decoder\'ın ilk girdisi: 1 satır × '+D+'. Henüz cevaptan hiçbir şey yazılmadı.'});
      }
      S.push({t:(k===0?'7':k===1?'10':'12')+' · Tur '+(k+1)+' — maskeli self-attention: yazılanlar birbirine bakar',hl:['datt','dn1'],
        body:row(mat(d.sa.S,lb,{cols:lb,title:'skor (sağ üst maskeli)'}),mat(d.sa.A,lb,{cols:lb,pct:1,title:'softmax'}),mat(d.y1,lb,{title:'LN(y + attention)'})),
        soz:k===0?'Şu an decoder\'da tek token var (&lt;s&gt;), bu yüzden kendine %100 bakıyor; video\'da da EOS kendi kendine bakıyordu. Bu katman, cevap uzadıkça «şimdiye kadar ne yazdım» bilgisini taşımak için orada.':
          'Decoder girdisi artık '+lb.join(' ')+prev+'. <b>Maske</b>: her satır yalnız kendisine ve soluna bakar, henüz yazılmamış sağ taraf kapalı (Self-Attention dersindeki 🎭 Maske). Son satır «'+ND(d.din[last])+'» dikkatini '+lb.map((x,j)=>x+' '+pc(d.sa.A[last][j])).join(', ')+' paylaştırıyor.',
        elde:'y₁ ('+d.din.length+' × '+D+'): her yazılmış token, solundakilerle bağlamlanmış.'});
      S.push({t:(k===0?'8':k===1?'10b':'12b')+' · Tur '+(k+1)+' — ÇAPRAZ attention: decoder soruya bakar',hl:['cross','dn2','mem'],
        body:row(mat(d.ca.Q,lb,{title:'Q = y₁·W_Q (decoder\'dan)'}),mat(d.ca.K,rowsE,{title:'K = M·W_K (bellekten)'}))+row(mat(d.ca.S,lb,{cols:rowsE,title:'skor Q·Kᵀ ÷ √'+D,hl:last}),mat(d.ca.A,lb,{cols:rowsE,pct:1,title:'softmax: sorunun hangi token\'ı?',hl:last}),mat(d.y2,lb,{title:'LN(y₁ + çapraz)'})),
        soz:'Video\'daki <b>encoder-decoder attention</b>: soru (Q) decoder\'dan, etiket (K) ve içerik (V) encoder belleğinden gelir. Skor tablosu '+d.din.length+' × 3: satır = yazılan token, sütun = sorunun token\'ı. Maske YOK (soru baştan beri tamamen elimizde). Şu an son satır «'+ND(d.din[last])+'» dikkatini '+rowsE.map((x,j)=>x+' '+pc(d.ca.A[last][j])).join(', ')+' paylaştırıyor: sıradaki basamağı yazarken sorunun en çok '+best(d.ca.A[last],rowsE)+' token\'ına bakıyor.',
        elde:'y₂ ('+d.din.length+' × '+D+'): yazılan her token artık sorudan seçtiği bilgiyi de taşıyor. LSTM\'de bu bilgi tek bir 96 sayılık vektöre sıkışmıştı.'});
      S.push({t:(k===0?'9':k===1?'11':'13')+' · Tur '+(k+1)+' — FFN + Linear + Softmax → «'+outT+'»',hl:['dffn','dn3','out','res'],
        body:row(mat([d.y3[last]],[lb[last]],{title:'son satır (FFN + Add & Norm sonrası)'}),mat([d.lg[last]],['puan'],{cols:lbl12,title:'× W_out + b → 12 puan'}),mat([d.p[last]],['olasılık'],{cols:lbl12,pct:1,title:'softmax'})),
        soz:'Video\'daki son adım: '+D+' sayılık son satır <b>tam bağlı katmana</b> (W_out, '+D+' × 12) girer, sözlüğün 12 token\'ı için birer puan çıkar, softmax yüzdeye çevirir. Yalnız <b>son satır</b> kullanılır: o, «şimdiye kadar yazılanlardan sonra ne gelir?» sorusunun cevabı. En yüksek dört: '+topk(d.p[last])+'.',
        elde:'Seçilen: <b style="color:#ffd54a">«'+outT+'»</b> ('+pc(d.p[last][d.out])+'). '+(k<2?'Bu token decoder girdisine eklenir, tur '+(k+2)+' başlar (aynı ağırlıklar, bir satır daha uzun girdi).':'&lt;e&gt; seçildi: cevap bitti. Video\'daki gibi decoder bitti işaretini kendisi üretince durur.')});
    });
    const ck=W.ck[st.ci], s2=window.S2S_CK, ls=s2?s2.ck[s2.ck.length-1]:null, ok=R.code===ck.preds[st.a*10+st.b]&&R.out.join()===truth(st.a,st.b).join();
    let g='<table class="tt-grid"><tr><td></td>'+[0,1,2,3,4,5,6,7,8,9].map(b=>'<th>'+b+'</th>').join('')+'</tr>';
    for(let a=0;a<10;a++){g+='<tr><th>'+a+'+</th>';for(let b=0;b<10;b++){const c=ck.preds[a*10+b],tt=truth(a,b),okk=c===tt[0]*144+tt[1]*12+tt[2],o1=Math.floor(c/144),o2=Math.floor(c/12)%12;
      g+='<td data-a="'+a+'" data-b="'+b+'" class="'+(okk?'ok':'no')+(TEST.has(a*10+b)?' te':'')+(a===st.a&&b===st.b?' cur':'')+'">'+ND(o1)+ND(o2)+'</td>';}g+='</tr>';}
    g+='</table>';
    S.push({t:'14 · Sonuç: «'+q+'» → «'+R.out.slice(0,2).map(ND).join('')+'» '+(R.out.join()===truth(st.a,st.b).join()?'✅':'❌')+' · LSTM ile karşılaştırma',hl:['res'],
      body:'<div class="tt-cmp"><div>'+g+'<div class="tt-mn">Hücre = modelin cevabı (yeşil doğru, kırmızı yanlış), turuncu kesikli = eğitimde hiç görülmeyen 10 soru. Bir hücreye tıkla → tur o soruyla baştan.</div></div>'+
        '<table class="calc tt-vs"><tr><td></td><td><b>LSTM</b> (Seq2Seq dersi)</td><td><b>Transformer</b> (bu tur)</td></tr>'+
        '<tr><td>soruyu okuma</td><td>sırayla, 3 adım</td><td>aynı anda (paralel)</td></tr>'+
        '<tr><td>decoder soruyu nasıl görüyor</td><td>tek bağlam vektörü (96 sayı)</td><td>bellek M\'nin 3 satırına çapraz attention</td></tr>'+
        '<tr><td>ağırlık sayısı</td><td>≈ 6.765</td><td>'+W.np.toLocaleString('tr-TR')+'</td></tr>'+
        (ls?'<tr><td>son epoch ('+ls.ep+' / '+W.ck[W.ck.length-1].ep+')</td><td>eğitim '+ls.train+'/90 · sınav '+ls.test+'/10</td><td>eğitim '+W.ck[W.ck.length-1].train+'/90 · sınav '+W.ck[W.ck.length-1].test+'/10</td></tr>':'')+'</table></div>',
      soz:'Aynı görev, aynı 90 eğitim / 10 sınav sorusu, iki farklı mimari. Seçili model (epoch '+ck.ep+'): eğitim <b>'+ck.train+'/90</b>, eğitimde hiç görülmeyen sorular <b>'+ck.test+'/10</b>. '+W.honest,
      elde:'Transformer\'ın asıl kazancı bu oyuncakta doğrulukta değil, yapıda: soru paralel işlenir ve decoder her adımda sorunun istediği token\'ına doğrudan bakar. Uzun cümlelerde LSTM\'in tek vektöre sıkıştırma darboğazı bu yüzden ortadan kalkar.'});
    S.forEach((x,i)=>{x.t=(i+1)+' · '+x.t.replace(/^[0-9]+b? · /,'');});
    return S;
  }
  let STEPS=[], timer=null;
  function render(){
    R=run(W.ck[st.ci],st.a,st.b); STEPS=stepsOf(); st.s=Math.max(0,Math.min(st.s,STEPS.length-1));
    const S=STEPS[st.s];
    $q('tt_arch').innerHTML=arch(S.hl);
    $q('tt_chips').innerHTML=STEPS.map((x,i)=>'<button class="tt-chip'+(i===st.s?' on':'')+'" data-i="'+i+'" title="'+x.t.replace(/<[^>]+>/g,'').replace(/"/g,'')+'">'+(i+1)+'</button>').join('');
    $q('tt_step').innerHTML='<div class="tt-h">'+S.t+'</div>'+S.body+'<div class="st-soz">🗣️ '+S.soz+'</div><div class="st-elde">📦 '+S.elde+'</div>';
    $q('tt_pos').textContent='Adım '+(st.s+1)+' / '+STEPS.length;
    $q('tt_prev').disabled=st.s===0; $q('tt_next').disabled=st.s===STEPS.length-1;
  }
  const $q=id=>document.getElementById(id);
  const opts=n=>Array.from({length:n},(_,i)=>'<option value="'+i+'">'+i+'</option>').join('');
  host.innerHTML='<div class="tt-ctl">'+
    '<label>Soru: <select id="tt_a">'+opts(10)+'</select> + <select id="tt_b">'+opts(10)+'</select></label>'+
    '<label>Model: <select id="tt_ck">'+W.ck.map((c,i)=>'<option value="'+i+'">epoch '+c.ep+' (sınav '+c.test+'/10)</option>').join('')+'</select></label>'+
    '<span class="tt-nav"><button class="addbtn" id="tt_prev">◀ Geri</button><button class="addbtn" id="tt_next">İleri ▶</button><button class="addbtn" id="tt_play">▶ Oynat</button><button class="addbtn" id="tt_rst">↺</button><b id="tt_pos"></b></span></div>'+
    '<div class="tt-chiprow" id="tt_chips"></div>'+
    '<div class="tt-grid2"><div class="tt-left"><div id="tt_arch"></div><div class="tt-mn">Sarı çerçeve = bu adımda çalışan parça. Aşağıdan yukarı okunur (makaledeki şema gibi).</div></div><div id="tt_step" class="tt-right"></div></div>';
  $q('tt_a').value=st.a; $q('tt_b').value=st.b; $q('tt_ck').value=st.ci;
  const stop=()=>{if(timer){clearInterval(timer);timer=null;$q('tt_play').textContent='▶ Oynat';}};
  $q('tt_a').onchange=e=>{st.a=+e.target.value;render();};
  $q('tt_b').onchange=e=>{st.b=+e.target.value;render();};
  $q('tt_ck').onchange=e=>{st.ci=+e.target.value;render();};
  $q('tt_prev').onclick=()=>{stop();st.s--;render();};
  $q('tt_next').onclick=()=>{stop();st.s++;render();};
  $q('tt_rst').onclick=()=>{stop();st.s=0;render();};
  $q('tt_play').onclick=()=>{if(timer){stop();return;}if(st.s>=STEPS.length-1)st.s=0;$q('tt_play').textContent='⏸ Durdur';
    timer=setInterval(()=>{if(st.s>=STEPS.length-1){stop();return;}st.s++;render();},4500);};
  host.addEventListener('click',e=>{const c=e.target.closest('.tt-chip');if(c){stop();st.s=+c.dataset.i;render();return;}
    const td=e.target.closest('.tt-grid td[data-a]');if(td){st.a=+td.dataset.a;st.b=+td.dataset.b;$q('tt_a').value=st.a;$q('tt_b').value=st.b;st.s=0;render();}});
  render();
  window.__tfTour={st,run,render,steps:()=>STEPS};
})();

// Transformer Bloğu Simülasyon sekmeleri: toplama turu / residual / LayerNorm
(function(){const tb=document.getElementById('tfTabs');if(!tb)return;
  tb.addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(!b)return;
    tb.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('on',x===b));
    document.querySelectorAll('#model-transformer .at-pane').forEach(p=>p.style.display=p.dataset.p===b.dataset.t?'':'none');});})();
