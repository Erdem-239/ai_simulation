// Kelime Temsili — "4️⃣ Nedir": 🧭 en temelden sonuca adım adım skip-gram (veri → sayılar → skor → softmax → hata → güncelleme → tüm veri).
// Başlangıç/epoch durumu 7️⃣ Örnek 1 ile AYNI motordan (window.__embLab). Tek çift için yerel kopya üzerinde gradyan adımı gösterir.
(function(){
  const host=document.getElementById('embSteps'); if(!host) return;
  const L=window.__embLab; if(!L) return;
  const $=id=>document.getElementById(id);
  const f=(v,d=3)=>{v=Math.abs(v)<0.5*Math.pow(10,-d)?0:v;return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const {WD,CD,PAIRS}=L;
  const GC=['#46c46a','#f0a032','#3a7afe'];
  const SENT=[];PAIRS.forEach(([i,j])=>SENT.push([i,j]));
  const states={};
  function stateAt(ep){if(states[ep])return states[ep];const st=L.init();for(let e=0;e<ep;e++)L.epoch(st);states[ep]=st;return st;}
  const S={pair:0,ep:0,step:0,lr:0.5,extra:0};
  const STEPS=['📚 Veri','🔢 Sayılar','🎯 Soru','✖️ Skorlar','📊 Olasılık','⬅️ Hata','🔧 Güncelle','🔁 Tümü'];
  host.innerHTML=
   '<div class="rex-ctl" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:8px">'+
   '<span>Örnek çift:</span><select id="es_pair" class="rex-sel"></select>'+
   '<span>Ağın durumu:</span><select id="es_ep" class="rex-sel"><option value="0">epoch 0 (hiç öğrenmemiş)</option><option value="10">epoch 10</option><option value="100">epoch 100</option><option value="500">epoch 500 (eğitilmiş)</option></select></div>'+
   '<div id="es_chips" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px"></div>'+
   '<div style="overflow-x:auto"><svg id="es_net" viewBox="0 0 640 250" style="width:100%;min-width:560px;max-width:720px;display:block;margin:0 auto" role="img" aria-label="Skip-gram ağı: one-hot girdi, 2 boyutlu vektör, 6 komşu çıktısı"></svg></div>'+
   '<div id="es_body" style="margin-top:8px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:12px 14px;color:#ccd5e8;line-height:1.75;font-size:13.5px"></div>'+
   '<div style="display:flex;gap:8px;margin-top:8px"><button class="rex-btn" id="es_prev">◀ Geri</button><button class="rex-btn" id="es_next">İleri ▶</button></div>';
  const sel=$('es_pair');
  PAIRS.forEach(([i,j],k)=>sel.add(new Option(WD[i]+' → '+CD[j],k)));
  const chips=$('es_chips');
  STEPS.forEach((t,i)=>{const b=document.createElement('button');b.className='rex-btn';b.textContent=(i+1)+'. '+t;b.dataset.i=i;chips.appendChild(b);});
  const sm=L.softmax;
  function calc(){
    const st=stateAt(S.ep),[wi,cj]=PAIRS[S.pair];
    // yerel kopya: gösterilen tek-çift güncellemeleri biriktirir (S.extra kez uygulanmış)
    const W=st.W.map(r=>r.slice()),C=st.C.map(r=>r.slice());
    const one=(W,C,lr)=>{const e=W[wi],s=C.map(c=>e[0]*c[0]+e[1]*c[1]),p=sm(s);
      const d=p.map((v,k)=>v-(k===cj?1:0));const ge=[0,0],gc=C.map(()=>[0,0]);
      for(let k=0;k<6;k++)for(let t=0;t<2;t++){ge[t]+=d[k]*C[k][t];gc[k][t]=d[k]*e[t];}
      return {e:e.slice(),s,p,d,ge,gc,loss:-Math.log(p[cj])};};
    const base=one(W,C,S.lr);
    const W2=W.map(r=>r.slice()),C2=C.map(r=>r.slice());
    for(let n=0;n<=S.extra;n++){const r=one(W2,C2,S.lr);for(let t=0;t<2;t++){W2[wi][t]-=S.lr*r.ge[t];}for(let k=0;k<6;k++)for(let t=0;t<2;t++)C2[k][t]-=S.lr*r.gc[k][t];}
    const after=one(W2,C2,S.lr);
    return {st,wi,cj,W,C,base,W2,C2,after};
  }
  function net(c){
    const {base,wi,cj}=c,p=base.p;let s='<defs><marker id="esAr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#95a2c2"/></marker></defs>';
    s+='<text x="10" y="14" font-size="10.5" fill="#95a2c2">girdi: kelime (one-hot)</text><text x="250" y="14" font-size="10.5" fill="#95a2c2">vektör e (2 sayı)</text><text x="480" y="14" font-size="10.5" fill="#95a2c2">6 aday komşu → olasılık</text>';
    // girdi 6 daire
    for(let i=0;i<6;i++){const y=34+i*34,on=i===wi;s+='<circle cx="60" cy="'+y+'" r="11" fill="'+(on?'#ffd54a':'#17203a')+'" stroke="#3a7afe"/><text x="60" y="'+(y+4)+'" text-anchor="middle" font-size="10" font-weight="700" fill="'+(on?'#0e1424':'#95a2c2')+'">'+(on?1:0)+'</text><text x="10" y="'+(y+4)+'" font-size="10.5" fill="#ccd5e8">'+WD[i]+'</text>';}
    // 2 gizli
    const hy=[88,150];
    for(let t=0;t<2;t++)s+='<circle cx="290" cy="'+hy[t]+'" r="20" fill="#17203a" stroke="#c77dff" stroke-width="2"/><text x="290" y="'+(hy[t]+4)+'" text-anchor="middle" font-size="11" font-weight="700" fill="#c77dff">'+f(base.e[t],2)+'</text>';
    // W çizgileri (seçili kelime → e)
    for(let t=0;t<2;t++)s+='<line x1="71" y1="'+(34+wi*34)+'" x2="270" y2="'+hy[t]+'" stroke="#ffd54a" stroke-width="2" marker-end="url(#esAr)"/>';
    s+='<text x="160" y="'+(34+wi*34-8)+'" font-size="10" fill="#ffd54a">W tablosundan satır</text>';
    // çıktı
    for(let k=0;k<6;k++){const y=34+k*34,tg=k===cj;
      for(let t=0;t<2;t++)s+='<line x1="310" y1="'+hy[t]+'" x2="468" y2="'+y+'" stroke="'+(tg?'#46c46a':'#334063')+'" stroke-width="'+(tg?1.8:.9)+'" opacity="'+(tg?.9:.7)+'"/>';
      s+='<rect x="470" y="'+(y-11)+'" width="70" height="22" rx="6" fill="#0e1424" stroke="'+(tg?'#46c46a':'#334063')+'" stroke-width="'+(tg?2:1)+'"/><text x="505" y="'+(y+4)+'" text-anchor="middle" font-size="11" fill="'+(tg?'#46c46a':'#ccd5e8')+'">'+CD[k]+'</text>'+
        '<rect x="548" y="'+(y-6)+'" width="'+(70*p[k])+'" height="12" fill="'+(tg?'#46c46a':'#3a7afe')+'" opacity=".8"/><text x="'+(552+70*p[k])+'" y="'+(y+4)+'" font-size="9.5" fill="#ccd5e8">'+Math.round(p[k]*100)+'%</text>';}
    $('es_net').innerHTML=s;
  }
  const tbl=(head,rows)=>'<table class="rex-tbl" style="margin:6px 0;font-size:12.5px"><tr>'+head.map(h=>'<th style="padding:3px 8px">'+h+'</th>').join('')+'</tr>'+rows.map(r=>'<tr>'+r.map(c=>'<td style="padding:3px 8px">'+c+'</td>').join('')+'</tr>').join('')+'</table>';
  const hl=(txt,on)=>on?'<b style="color:#46c46a">'+txt+'</b>':txt;
  function body(c){
    const {base,after,wi,cj,st}=c,e=base.e;const n=S.step;let h='';
    const WDn=WD[wi],CDn=CD[cj];
    if(n===0){
      h='<p><b>1 · Model neyi görüyor?</b> Yalnızca bu 12 minik cümle. Her cümlede iki kelime yan yana; pencere = 1, yani <b>bir kelimenin yanındaki kelime onun komşusu</b>:</p>'+
        tbl(['cümle','çıkan çift (kelime → komşu)'],PAIRS.map(([i,j],k)=>['"'+WD[i]+' '+CD[j]+'"',hl(WD[i]+' → '+CD[j],k===S.pair)]))+
        '<div class="callout">⚠️ Modele <b>"kedi köpeğe benzer"</b> diye bir şey söylenmiyor. Elinde yalnızca bu çiftler var. Benzerlik, <b>aynı komşuları paylaşmaktan</b> kendiliğinden çıkacak. Gerçek word2vec\'te aynı çiftler milyonlarca cümleden otomatik çıkarılır.</div>';
    }else if(n===1){
      h='<p><b>2 · Her kelimeye sayılar.</b> Bilgisayar kelime bilmez; her kelimeye <b>2 sayılık bir vektör</b> (tablo <b>W</b>), her komşu kelimeye <b>ayrı</b> 2 sayılık bir vektör (tablo <b>C</b>) veriyoruz. Şu an '+(S.ep===0?'<b>rastgele</b> (hiç öğrenmedi)':'<b>epoch '+S.ep+'</b> sonrası değerler')+':</p>'+
        '<div style="display:flex;gap:18px;flex-wrap:wrap"><div>'+tbl(['kelime','W satırı (2 sayı)'],WD.map((w,i)=>[hl(w,i===wi),f(st.W[i][0])+' ; '+f(st.W[i][1])]))+'</div><div>'+tbl(['komşu','C satırı (2 sayı)'],CD.map((w,k)=>[hl(w,k===cj),f(st.C[k][0])+' ; '+f(st.C[k][1])]))+'</div></div>'+
        '<p>Yukarıdaki şemada girdi katmanı <b>one-hot</b>: seçili kelime 1, diğerleri 0. "One-hot × W" demek <b>W\'dan o kelimenin satırını okumak</b> demek; sarı oklar bunu gösteriyor. Ağın <b>ağırlıkları = bu iki tablo</b>; eğitim bunları değiştirecek.</p>';
    }else if(n===2){
      h='<p><b>3 · Bir soru soralım.</b> Eğitim çiftlerinden biri: <b>'+WDn+' → '+CDn+'</b>. Model şunu cevaplamalı: <i>"'+WDn+'" kelimesinin yanında hangi kelime olur?</i></p>'+
        '<p>Girdi: <b>'+WDn+'</b> → tablodan vektörü: <b>e = ('+f(e[0])+' ; '+f(e[1])+')</b>.<br>Doğru cevap: <b>'+CDn+'</b>. Yani istenen olasılık dağılımı: '+CD.map((w,k)=>w+' = '+(k===cj?'1':'0')).join(', ')+'.</p>'+
        '<p>Model henüz her adayı nasıl puanlayacağını bilmiyor; bir sonraki adımda puanlıyor.</p>';
    }else if(n===3){
      h='<p><b>4 · Her adayı puanla.</b> Skor = vektörlerin <b>nokta çarpımı</b>: e · c = e₁·c₁ + e₂·c₂. İki vektör aynı yöne bakıyorsa skor büyük.</p>'+
        tbl(['aday','c','e₁·c₁','e₂·c₂','skor s = e·c'],CD.map((w,k)=>[hl(w,k===cj),f(st.C[k][0])+' ; '+f(st.C[k][1]),f(e[0])+'·'+f(st.C[k][0],2)+' = '+f(e[0]*st.C[k][0]),f(e[1])+'·'+f(st.C[k][1],2)+' = '+f(e[1]*st.C[k][1]),'<b>'+f(base.s[k])+'</b>']))+
        '<p>Skorlar negatif/pozitif herhangi bir sayı olabilir; olasılığa çevirmek lazım.</p>';
    }else if(n===4){
      const ex=base.s.map(v=>Math.exp(v)),sum=ex.reduce((a,b)=>a+b,0);
      h='<p><b>5 · Skorları olasılığa çevir (softmax).</b> p<sub>k</sub> = e<sup>s<sub>k</sub></sup> / Σ e<sup>s</sup>. Hepsi 0–1 arası, toplamı 1.</p>'+
        tbl(['aday','skor s','e<sup>s</sup>','olasılık p'],CD.map((w,k)=>[hl(w,k===cj),f(base.s[k]),f(ex[k]),'<b>'+f(base.p[k])+'</b> (%'+Math.round(base.p[k]*100)+')']))+
        '<p>Toplam e<sup>s</sup> = '+f(sum)+'. <b>Kayıp</b> = doğru komşuya verdiğin olasılığın −ln\'i: L = −ln p<sub>'+CDn+'</sub> = −ln('+f(base.p[cj])+') = <b>'+f(base.loss)+'</b>. Doğruya verilen olasılık ne kadar küçükse kayıp o kadar büyük ('+(S.ep===0?'şu an model tahmin yürütemiyor: hepsine yakın pay veriyor':'şu an model '+(base.p[cj]>0.4?'epey bilmeye başladı':'hâlâ kararsız'))+').</p>';
    }else if(n===4+1){
      const d=base.d;
      h='<p><b>6 · Hata ve gradyan.</b> Her aday için hata: δ<sub>k</sub> = p<sub>k</sub> − y<sub>k</sub> (y: doğruysa 1, değilse 0). Doğru aday için negatif (olasılığı artmalı), yanlışlar için pozitif (azalmalı).</p>'+
        tbl(['aday','p','y','δ = p − y'],CD.map((w,k)=>[hl(w,k===cj),f(base.p[k]),k===cj?1:0,'<b>'+f(d[k])+'</b>']))+
        '<p><b>Kelime vektörünün gradyanı:</b> ∂L/∂e = Σ δ<sub>k</sub>·c<sub>k</sub><br>= '+CD.map((w,k)=>'('+f(d[k])+')·('+f(st.C[k][0],2)+' ; '+f(st.C[k][1],2)+')').join(' + ')+'<br>= <b>('+f(base.ge[0])+' ; '+f(base.ge[1])+')</b></p>'+
        '<p><b>Komşu vektörlerinin gradyanı.</b> Harfler: <b>e</b> = '+WDn+' kelimesinin vektörü = ('+f(e[0])+' ; '+f(e[1])+') (yukarıdaki W tablosundan), <b>c<sub>k</sub></b> = k. adayın kendi vektörü (C tablosundan), <b>δ<sub>k</sub></b> = o adayın hatası (tek sayı). Formül: <b>∂L/∂c<sub>k</sub> = δ<sub>k</sub> · e</b> → e\'nin iki sayısını δ<sub>k</sub> ile çarparsın, gradyan da 2 sayı çıkar. Sonra c<sub>yeni</sub> = c<sub>eski</sub> − α·gradyan (α = '+f(S.lr,1)+').</p>'+
        tbl(['aday','δ','δ · e = gradyan','c eski','c yeni','skor e·c'],CD.map((w,k)=>{
          const cn=[st.C[k][0]-S.lr*base.gc[k][0],st.C[k][1]-S.lr*base.gc[k][1]];
          const s0=e[0]*st.C[k][0]+e[1]*st.C[k][1],s1=e[0]*cn[0]+e[1]*cn[1];
          return [hl(w,k===cj),f(d[k]),'('+f(d[k])+')·('+f(e[0])+' ; '+f(e[1])+') = <b>('+f(base.gc[k][0])+' ; '+f(base.gc[k][1])+')</b>',f(st.C[k][0])+' ; '+f(st.C[k][1]),'<b>'+f(cn[0])+' ; '+f(cn[1])+'</b>',f(s0)+' → <b>'+f(s1)+'</b> '+(s1>s0+1e-9?'<span style="color:#46c46a">arttı</span>':(s1<s0-1e-9?'<span style="color:#e06a6a">azaldı</span>':'aynı'))];}))+
        '<p>📌 <b>Nasıl okunur:</b> doğru aday ('+CDn+') için δ <b>negatif</b> → gradyan e\'nin <b>zıt</b> işaretlisi → eksiyle çevirince c<sub>'+CDn+'</sub> <b>e yönüne</b> kayar; yeni c ile e\'nin nokta çarpımı (skor) <b>artar</b>. Yanlış adaylar için δ <b>pozitif</b> → c, <b>−e yönüne</b> kayar; skorları <b>azalır</b>. Büyüklük de δ ile orantılı: olasılığı çok yanlış olan aday çok oynar; δ ≈ 0 olan (zaten ≈%0 olasılık) hiç oynamaz. δ\'ların toplamı her zaman 0 olduğu için artış ve azalışlar birbirini dengeler.</p>'+
        '<div class="callout">🔑 Hem kelime vektörü hem komşu vektörleri öğrenilir; ikisi birbirine doğru çekilir.</div>';
    }else if(n===6){
      h='<p><b>7 · Güncelle.</b> Gradyanın <b>tersi yönünde</b> küçük bir adım: yeni = eski − α·gradyan (burada α = '+f(S.lr,1)+', adım sayısı: '+(S.extra+1)+').</p>'+
        tbl(['','önce','sonra'],[
         [WDn+' vektörü e',f(e[0])+' ; '+f(e[1]),'<b>'+f(c.W2[wi][0])+' ; '+f(c.W2[wi][1])+'</b>'],
         [CDn+' vektörü c',f(st.C[cj][0])+' ; '+f(st.C[cj][1]),'<b>'+f(c.C2[cj][0])+' ; '+f(c.C2[cj][1])+'</b>'],
         ['p('+CDn+')',f(base.p[cj]),'<b>'+f(after.p[cj])+'</b>'],['kayıp L',f(base.loss),'<b>'+f(after.loss)+'</b>']])+
        '<p>'+(after.loss<base.loss?'✅ Doğru komşunun olasılığı <b>arttı</b>, kayıp <b>düştü</b>: '+WDn+' ile '+CDn+' vektörleri birbirine yaklaştı.':'Bu adımda kayıp değişmedi.')+'</p>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="rex-btn" id="es_more">🔧 Aynı çifte bir adım daha</button><button class="rex-btn" id="es_more10">🔧 +10 adım</button><button class="rex-btn" id="es_reset">↺ sıfırla</button></div>';
    }else{
      const end=stateAt(500),ini=stateAt(0);
      const cs=(a,b)=>L.cos(end.W[a],end.W[b]);
      h='<p><b>8 · Bunu tüm çiftlere, 500 kere.</b> Yukarıdaki adımı 12 çiftin hepsi için yaparız, gradyanların <b>ortalamasıyla</b> güncelleriz (bir "epoch"), bunu 500 kez tekrarlarız. Aynı komşuları paylaşan kelimeler <b>aynı komşu vektörlerine</b> çekildiği için birbirine yaklaşır.</p>'+
        tbl(['','epoch 0','epoch 500'],[['kayıp',f(L.loss(ini)),'<b>'+f(L.loss(end))+'</b> (alt sınır ln 2 = 0,693)'],
          ['kedi ~ köpek (aynı komşular)',f(L.cos(ini.W[0],ini.W[1]),2),'<b>'+f(cs(0,1),2)+'</b>'],['kral ~ kraliçe',f(L.cos(ini.W[2],ini.W[3]),2),'<b>'+f(cs(2,3),2)+'</b>'],
          ['kedi ~ kral (farklı komşular)',f(L.cos(ini.W[0],ini.W[2]),2),'<b>'+f(cs(0,2),2)+'</b>']])+
        '<div class="callout">🎯 Hiçbir yerde "kedi köpeğe benzer" yazmıyordu. Model komşuluk tahmini yaparken <b>benzerliği kendisi buldu</b>. Canlı izlemek için 7️⃣ Örnek Çalışmalar → Örnek 1.</div>';
    }
    return h;
  }
  function render(){
    const c=calc();net(c);
    $('es_body').innerHTML=body(c);
    [...chips.children].forEach(b=>{const on=+b.dataset.i===S.step;b.style.background=on?'var(--blue)':'var(--panel)';b.style.color=on?'#fff':'var(--text)';});
    $('es_prev').disabled=S.step===0;$('es_next').disabled=S.step===STEPS.length-1;
    const m=$('es_more');if(m)m.onclick=()=>{S.extra++;render();};const m10=$("es_more10");if(m10)m10.onclick=()=>{S.extra+=10;render();};const r=$("es_reset");if(r)r.onclick=()=>{S.extra=0;render();};
    window.__embSteps={step:S.step,pair:S.pair,ep:S.ep,base:{s:c.base.s,p:c.base.p,loss:c.base.loss,ge:c.base.ge},after:{p:c.after.p[c.cj],loss:c.after.loss}};
  }
  sel.addEventListener('change',()=>{S.pair=+sel.value;S.extra=0;render();});
  $('es_ep').addEventListener('change',e=>{S.ep=+e.target.value;S.extra=0;render();});
  chips.addEventListener('click',e=>{if(e.target.dataset.i!==undefined){S.step=+e.target.dataset.i;render();}});
  $('es_prev').addEventListener('click',()=>{S.step=Math.max(0,S.step-1);render();});
  $('es_next').addEventListener('click',()=>{S.step=Math.min(STEPS.length-1,S.step+1);render();});
  render();
})();
