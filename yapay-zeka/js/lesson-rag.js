// 📚 RAG dersi (#model-rag): bilgi getirerek üretim.
//  12 kısa belge (sitedeki derslerden bilgiler) → TF-IDF vektörleri (kelime ya da 3'lü harf) → kosinüs benzerliği →
//  en yakın k belge → isteme konur. Dil modeli yok: "cevap" en ilgili belgedeki en benzer cümle (çıkarımlı) — sayfada açıkça yazılı.
//  Motor sayfadaki Python koduyla (rag.py) birebir aynı.
(function(){
  const host=document.getElementById('ragSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const f3=v=>v.toFixed(3).replace('.',',');
  const BEL=["BPE ilk olarak 1994'te Philip Gage tarafından dosya sıkıştırmak için icat edildi. Sennrich ve arkadaşları 2016'da onu alt-kelime çeviriye taşıdı.",
    "GPT-2 sözlüğü 50.257 parçadan oluşur: 256 bayt, 50.000 birleştirme kuralı ve bir metin sonu işareti.",
    "Transformer mimarisi 2017'de Attention Is All You Need makalesiyle tanıtıldı. Temel modelde 6 encoder ve 6 decoder katmanı vardır.",
    "Makaledeki temel model 8 adet P100 ekran kartında yaklaşık 12 saat eğitildi. Büyük model 3,5 gün sürdü.",
    "LoRA yöntemi 2021'de Hu ve arkadaşları tarafından önerildi. Büyük ağırlıklar dondurulur, yanına küçük A ve B matrisleri eklenip yalnız onlar eğitilir.",
    "DPO 2023'te Rafailov ve arkadaşları tarafından önerildi. Ödül modeli kullanmadan tercih çiftlerinden doğrudan eğitir.",
    "Adam optimizeri 2014'te Kingma ve Ba tarafından yayımlandı. Her ağırlık için ayrı bir adım boyu ayarlar.",
    "Dropout 2012'de Hinton ve öğrencileri tarafından tanıtıldı. Eğitimde nöronların bir kısmı rastgele kapatılır.",
    "Top-p örnekleme 2019'da Holtzman ve arkadaşları tarafından önerildi. Olasılık toplamı p'ye ulaşana kadar en iyi adaylar tutulur.",
    "BERT 2018'de Google tarafından yayımlandı. Kelimelerin yüzde on beşini gizleyip tahmin ederek eğitilir.",
    "LSTM 1997'de Hochreiter ve Schmidhuber tarafından önerildi. Unutma, giriş ve çıkış kapılarıyla uzun hafızayı korur.",
    "Geri yayılım algoritması 1986'da Rumelhart, Hinton ve Williams'ın makalesiyle yaygınlaştı."];
  const SOR=[["BPE ne için icat edildi?",0],["GPT-2'nin sözlüğünde kaç parça var?",1],["Transformer hangi makaleyle tanıtıldı?",2],["Temel model kaç saatte eğitildi?",3],["LoRA'da hangi matrisler eğitilir?",4],["Ödül modeli olmadan tercihle eğitim yapan yöntem hangisi?",5],["Adam'ı kim yayımladı?",6],["Nöronları rastgele kapatma fikri kimden?",7],["Nucleus örneklemeyi kim önerdi?",8],["BERT kelimelerin yüzde kaçını gizler?",9],["Kapılarla uzun hafıza tutan model hangisi?",10],["Geri yayılımı yaygınlaştıran makale hangi yıldan?",11],["Büyük modeli değiştirmeden ucuza uyarlamanın yolu nedir?",4],["Hangi yöntem insan beğenisini ara bir puanlayıcı olmadan kullanır?",5]];
  const kucuk=s=>s.replace(/İ/g,'i').replace(/I/g,'ı').toLowerCase();
  const kelimeler=s=>kucuk(s).split(/[^a-zçğıöşü0-9]+/).filter(Boolean);
  const harf3=s=>{const o=[];for(let w of kelimeler(s)){w='_'+w+'_';const c=[...w];for(let i=0;i+2<c.length;i++)o.push(c.slice(i,i+3).join(''));}return o;};
  function vektorler(M,P){const T=M.map(P),N=T.length,df={};T.forEach(t=>new Set(t).forEach(x=>df[x]=(df[x]||0)+1));
    const idf={};for(const x in df)idf[x]=Math.log((N+1)/(df[x]+1))+1;
    const vek=m=>{const v={};for(const x of P(m))if(x in idf)v[x]=(v[x]||0)+idf[x];let n=0;for(const x of Object.keys(v).sort())n+=v[x]*v[x];n=Math.sqrt(n)||1;const o={};for(const x in v)o[x]=v[x]/n;return o;};
    return [M.map(vek),vek,idf];}
  const kosinus=(a,b)=>{let s=0;for(const x of Object.keys(a).sort())if(x in b)s+=a[x]*b[x];return s;};
  function getir(q,D,vek,k=3){const qv=vek(q);return D.map((d,i)=>[kosinus(qv,d),i]).sort((x,y)=>y[0]-x[0]||x[1]-y[1]).slice(0,k);}
  const cumleler=b=>b.split('. ').map(p=>p.endsWith('.')?p:p+'.');
  const VK={kelime:vektorler(BEL,kelimeler),harf:vektorler(BEL,harf3)};
  window.__rag={BEL,SOR,kelimeler,harf3,vektorler,kosinus,getir,cumleler};

  let yon='harf';
  function draw(){
    const q=$('ragQ').value.trim(),k=+$('ragK').value;$('ragKv').textContent=k;
    host.querySelectorAll('.rag-m').forEach(b=>b.classList.toggle('on',b.dataset.m===yon));
    const [D,vek]=VK[yon],qv=vek(q),all=D.map((d,i)=>[kosinus(qv,d),i]),top=getir(q,D,vek,k),ids=top.map(x=>x[1]);
    const exp=(SOR.find(s=>s[0]===q)||[null,-1])[1];
    $('ragDocs').innerHTML=all.map(([s,i])=>'<div class="rag-doc'+(ids.includes(i)?' on':'')+'"><span class="rag-n">'+(i+1)+'</span><span class="gn-bar" style="width:'+Math.round(s*110)+'px;background:'+(ids.includes(i)?'#f0a032':'#3a4a6e')+'"></span> <b>'+f3(s)+'</b> '+esc(BEL[i])+(i===exp?' <span class="rag-ok">✓ doğru belge</span>':'')+'</div>').join('');
    const terms=Object.keys(qv).filter(x=>x in D[top[0][1]]).sort((a,b)=>qv[b]*D[top[0][1]][b]-qv[a]*D[top[0][1]][a]).slice(0,8);
    $('ragPrompt').textContent='Aşağıdaki bilgilere dayanarak soruyu cevapla. Bilgilerde yoksa "bilmiyorum" de.\n\n'+top.map(([,i],j)=>'['+(j+1)+'] '+BEL[i]).join('\n')+'\n\nSoru: '+q+'\nCevap:';
    // çıkarımlı cevap: en iyi belgenin en benzer cümlesi
    const C=cumleler(BEL[top[0][1]]),[Dc,vc]=vektorler(C,yon==='harf'?harf3:kelimeler),best=getir(q,Dc,vc,1)[0];
    $('ragAns').innerHTML=top[0][0]>0?'«'+esc(C[best[1]])+'» <small>(belge '+(top[0][1]+1)+')</small>':'<i>Hiçbir belgeyle ortak terim yok — bir dil modeli burada "bilmiyorum" demeli.</i>';
    $('ragStep').innerHTML='<b class="h">✏️ Bu soruda</b>Soru '+(yon==='harf'?'3\'lü harf gruplarına':'kelimelere')+' bölündü ('+Object.keys(qv).length+' farklı terim), her terim nadirliğine göre (IDF) ağırlıklandırıldı ve vektörün boyu 1 yapıldı. Her belgeyle kosinüs benzerliği = ortak terimlerin ağırlık çarpımlarının toplamı. En yakın: belge '+(top[0][1]+1)+' ('+f3(top[0][0])+')'+(terms.length?'; en çok katkı veren ortak terimler: '+terms.map(t=>'<code>'+esc(t)+'</code>').join(' '):'')+'. İlk '+k+' belge isteme konuyor.';
    let z='<b class="h">🗣️ Ne anlama geliyor?</b>';
    if(exp>=0) z+=ids.includes(exp)?(top[0][1]===exp?'Doğru belge ilk sırada: dil modeli cevabı önündeki metinden okuyabilir — ezberine güvenmesi gerekmez.':'Doğru belge ilk '+k+' içinde ama ilk sırada değil: model doğru bilgiyi görür ama yanında ilgisiz metin de vardır.'):'Doğru belge <b>getirilmedi</b>: model ya "bilmiyorum" demeli ya da uydurur. RAG\'in en sık hatası budur — arama kaçırırsa üretim kurtaramaz.';
    else z+='Kendi sorun: ilk sıradaki belgenin gerçekten ilgili olup olmadığına bak. Benzerlik puanı "anlam" değil, ortak terim ölçüsü.';
    if(yon==='kelime'&&exp>=0&&!ids.includes(exp)) z+=' <b>3\'lü harf</b> yöntemine geç: Türkçe eklerde kelime eşleşmesi kırılır («kapılarla» ↔ «kapılarıyla»).';
    $('ragSoz').innerHTML=z;
  }
  $('ragPre').innerHTML=SOR.map(s=>'<option>'+esc(s[0])+'</option>').join('');
  $('ragPre').onchange=e=>{$('ragQ').value=e.target.value;draw();};
  $('ragQ').oninput=draw;$('ragK').oninput=draw;
  host.querySelectorAll('.rag-m').forEach(b=>b.onclick=()=>{yon=b.dataset.m;draw();});
  $('ragQ').value=SOR[10][0];$('ragPre').value=SOR[10][0];draw();

  // ---- Örnek Çalışmalar ----
  const e1=$('ragEx1');if(e1){const R=[['kelime',kelimeler],['3\'lü harf',harf3]].map(([ad,P])=>{const [D,vek]=vektorler(BEL,P);let h1=0,h3=0;const miss=[];
      for(const [s,g] of SOR){const r=getir(s,D,vek);if(r[0][1]===g)h1++;else miss.push(s);if(r.some(x=>x[1]===g))h3++;}return [ad,h1,h3,miss];});
    window.__ragEx1=R;
    e1.innerHTML='<table class="tk-tbl"><tr><th>vektör</th><th>ilk sırada</th><th>ilk 3\'te</th><th>ilk sırada kaçan sorular</th></tr>'+R.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+' / 14</td><td>'+r[2]+' / 14</td><td><small>'+r[3].map(esc).join('<br>')+'</small></td></tr>').join('')+'</table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> Kelime eşleşmesi Türkçe eklerde kırılıyor: «örneklemeyi» ≠ «örnekleme», «kapılarla» ≠ «kapılarıyla». 3\'lü harf grupları kökleri yakaladığı için 13/14\'e çıkıyor. Ama son iki soru farklı: <b>aynı anlamı farklı kelimelerle</b> soruyor («değiştirmeden ucuza uyarlama» = LoRA). Terim saymak bunu göremez; gerçek RAG sistemleri bu yüzden anlamı vektöre çeviren <b>embedding modelleri</b> kullanır (Kelime Temsili ve BERT ↔ GPT dersleri) — bu sayfada öyle bir model çalıştırmıyoruz.</div>';}
  const e2=$('ragEx2');if(e2){const [D,vek]=VK.harf;const R=[1,2,3,4,5].map(k=>{let h=0,n=0;for(const [s,g] of SOR){const r=getir(s,D,vek,k);if(r.some(x=>x[1]===g))h++;for(const [,i] of r)n+=BEL[i].split(' ').length;}return [k,h,n/SOR.length];});
    window.__ragEx2=R;
    e2.innerHTML='<table class="tk-tbl"><tr><th>k</th><th>doğru belge isteme girdi</th><th>soru başına bağlam (kelime)</th></tr>'+R.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+' / 14</td><td>'+r[2].toFixed(1).replace('.',',')+'</td></tr>').join('')+'</table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> k büyüdükçe doğru belgenin isteme girme şansı artıyor (k = 4\'te 14/14) ama bağlam 5 kat uzuyor: daha çok token = daha pahalı, daha yavaş ve modelin dikkatini dağıtan ilgisiz metin. Gerçek sistemler çoğu zaman önce geniş bir küme getirip sonra ikinci bir modelle yeniden sıralar (reranking).</div>';}
  const e3=$('ragEx3');if(e3){const P=[],own=[];BEL.forEach((b,i)=>cumleler(b).forEach(c=>{P.push(c);own.push(i);}));const [Dc,vc]=vektorler(P,harf3),[D,vek]=VK.harf;let hc=0,hb=0;
    for(const [s,g] of SOR){if(own[getir(s,Dc,vc,1)[0][1]]===g)hc++;if(getir(s,D,vek,1)[0][1]===g)hb++;}
    window.__ragEx3=[BEL.length,hb,P.length,hc];
    e3.innerHTML='<table class="tk-tbl"><tr><th>parça</th><th>parça sayısı</th><th>ilk sırada doğru</th></tr><tr><td>bütün belge</td><td>'+BEL.length+'</td><td>'+hb+' / 14</td></tr><tr><td>tek cümle</td><td>'+P.length+'</td><td>'+hc+' / 14</td></tr></table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> Cümlelere bölmek burada isabeti '+hb+'\'ten '+hc+'\'ye düşürdü: kısa parçada ortak terim azalıyor, ayrıca «Büyük model 3,5 gün sürdü.» gibi bir cümle tek başına neyin büyük modeli olduğunu söylemiyor. Çok büyük parça ise isteme ilgisiz metin taşır. Parça boyu (çoğu zaman birkaç yüz token, komşu parçalarla biraz örtüşerek) RAG\'in en önemli ayarlarından biri; doğru değer veriye göre denenerek bulunur.</div>';}
})();
