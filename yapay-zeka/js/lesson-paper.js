// 📜 "Attention Is All You Need" makale dersi (#model-paper):
//  Simülasyon: (A) makalenin öğrenme hızı takvimi (formül 3: ısınma + 1/√adım), (B) Tablo 1 — öz-dikkat ↔ RNN ↔ konvolüsyon
//  katman başına işlem ve sıralı adım. Örnekler: ağırlık sayımı, takvim değerleri, Tablo 1 sayıları (Python ile birebir).
(function(){
  const host=document.getElementById('ppSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const tr=n=>Math.round(n).toLocaleString('tr-TR');
  const ex=v=>{const e=v.toExponential(3).split('e');return e[0].replace('.',',')+'·10<sup>'+(+e[1]).toString().replace('-','−')+'</sup>';};
  const lr=(a,d,w)=>Math.pow(d,-0.5)*Math.min(Math.pow(a,-0.5),a*Math.pow(w,-1.5));
  function parametre(d=512,dff=2048,N=6,soz=37000){const dk=4*(d*d+d),ffn=d*dff+dff+dff*d+d,ln=2*d,enc=dk+ffn+2*ln,dec=2*dk+ffn+3*ln,g=soz*d;return [g,enc,dec,g+N*enc+N*dec];}
  window.__pp={lr,parametre};
  // (A) takvim
  function drawLR(){const d=+$('ppD').value,w=+$('ppW').value,a=+$('ppA').value;$('ppDv').textContent=d;$('ppWv').textContent=tr(w);$('ppAv').textContent=tr(a);
    const T=100000,pts=[];let mx=0;for(let i=1;i<=200;i++){const s=Math.round(i/200*T);const v=lr(s,d,w);pts.push([s,v]);if(v>mx)mx=v;}
    const X=s=>40+s/T*420,Y=v=>150-v/mx*130;
    let s='<svg viewBox="0 0 480 175" style="width:100%;max-width:520px;display:block"><rect width="480" height="175" fill="#0d1426" rx="8"/>';
    s+='<polyline fill="none" stroke="#5aa0ff" stroke-width="2.5" points="'+pts.map(p=>X(p[0])+','+Y(p[1])).join(' ')+'"/>';
    s+='<line x1="'+X(w)+'" x2="'+X(w)+'" y1="18" y2="150" stroke="#f0a032" stroke-dasharray="4 3"/><text x="'+(X(w)+4)+'" y="28" font-size="9" fill="#f0a032">ısınma sonu</text>';
    s+='<circle cx="'+X(a)+'" cy="'+Y(lr(a,d,w))+'" r="5" fill="#ffd77a"/>';
    [0,25000,50000,75000,100000].forEach(t=>s+='<text x="'+X(t)+'" y="166" font-size="9" fill="#95a2c2" text-anchor="middle">'+tr(t)+'</text>');
    s+='<text x="36" y="24" font-size="9" fill="#95a2c2" text-anchor="end">'+(mx*1e4).toFixed(1).replace('.',',')+'e−4</text></svg>';
    $('ppLRsvg').innerHTML=s;
    const v=lr(a,d,w),inW=a<w;
    $('ppLRstep').innerHTML='<b class="h">✏️ Adım '+tr(a)+'\'te</b>lr = d<sup>−0,5</sup> · min(adım<sup>−0,5</sup>, adım · ısınma<sup>−1,5</sup>)<br>= '+(Math.pow(d,-0.5)).toFixed(4).replace('.',',')+' · min('+ex(Math.pow(a,-0.5))+', '+ex(a*Math.pow(w,-1.5))+') = <b>'+ex(v)+'</b><br>'+(a===w?'Tam ısınma sonundayız: iki terim eşit, lr <b>tepe noktasında</b>.':inW?'Isınma içindeyiz: ikinci terim küçük → lr adımla <b>doğrusal</b> artıyor.':'Isınma bitti: birinci terim küçük → lr <b>1/√adım</b> ile azalıyor.')+' Tepe değer (adım '+tr(w)+'): '+ex(lr(w,d,w))+'.';
    $('ppLRsoz').innerHTML='<b class="h">🗣️ Ne anlama geliyor?</b>'+(inW?'Eğitimin başında ağırlıklar rastgele, gradyanlar güvenilmez ve Adam\'ın ikinci moment tahmini henüz oturmadı: büyük adım atmak modeli savurabilir. Bu yüzden makale ilk '+tr(w)+' adımda hızı sıfırdan yavaşça açıyor.':'Model yolunu buldu; artık hız yavaşça kısılıyor ki çözümün etrafında savrulmadan yerleşsin. d büyüdükçe bütün eğri aşağı iner: geniş modele daha küçük adım.');
  }
  // (B) Tablo 1
  function drawC(){const n=+$('ppN').value,d=+$('ppDd').value,k=3;$('ppNv').textContent=tr(n);$('ppDdv').textContent=d;
    const rows=[['Öz-dikkat',n*n*d,1,'1'],['RNN',n*d*d,n,tr(n)],['Konvolüsyon (k = 3)',k*n*d*d,1,'log₃ n ≈ '+Math.ceil(Math.log(n)/Math.log(3))]];
    const mx=Math.max(...rows.map(r=>r[1]));
    $('ppCtbl').innerHTML='<table class="tk-tbl"><tr><th>katman</th><th>katman başına işlem</th><th></th><th>sıralı adım</th><th>en uzak iki kelime arası yol</th></tr>'+rows.map((r,i)=>'<tr'+(r[1]===Math.min(...rows.map(x=>x[1]))?' class="on"':'')+'><td>'+r[0]+'</td><td>'+tr(r[1])+'</td><td><span class="gn-bar" style="width:'+Math.max(2,Math.round(r[1]/mx*120))+'px"></span></td><td>'+tr(r[2])+'</td><td>'+(i===0?'1':i===1?tr(n):r[3])+'</td></tr>').join('')+'</table>';
    const ratio=n*d*d/(n*n*d);
    $('ppCstep').innerHTML='<b class="h">✏️ n = '+tr(n)+', d = '+d+'</b>Öz-dikkat: her kelime her kelimeyle d boyutlu nokta çarpımı → n²·d = '+tr(n*n*d)+'. RNN: her adımda d×d matris çarpımı, n adım → n·d² = '+tr(n*d*d)+'. Oran RNN ÷ öz-dikkat = d ÷ n = <b>'+(ratio>=1?ratio.toFixed(1).replace('.',','):ratio.toFixed(3).replace('.',','))+'</b>.';
    $('ppCsoz').innerHTML='<b class="h">🗣️ Ne anlama geliyor?</b>'+(n<d?'Cümle (n) model genişliğinden (d) kısa: öz-dikkat <b>daha az işlem</b> yapıyor. Asıl kazanç ise sıralı adımda: RNN '+tr(n)+' adımı sırayla yapmak zorunda, öz-dikkat hepsini <b>bir anda</b> (GPU\'da paralel) yapar.':n===d?'n = d: işlem sayıları eşit; fark yalnız paralellikte.':'Dizi model genişliğinden uzun: öz-dikkat artık <b>daha çok işlem</b> yapıyor (n² büyüyor). Uzun bağlamın pahalı olmasının nedeni bu; makale bunu "sınırlı öz-dikkat" önerisiyle not etmişti. Yine de sıralı adım 1.');
  }
  ['ppD','ppW','ppA'].forEach(id=>$(id).oninput=drawLR);['ppN','ppDd'].forEach(id=>$(id).oninput=drawC);
  drawLR();drawC();
  // ---- Örnek Çalışmalar ----
  const e1=$('ppEx1');if(e1){const b=parametre(),B=parametre(1024,4096);
    e1.innerHTML='<table class="tk-tbl"><tr><th>parça</th><th>hesap</th><th>ağırlık</th></tr>'+
    '<tr><td>gömme tablosu (paylaşımlı)</td><td>37.000 × 512</td><td>'+tr(b[0])+'</td></tr>'+
    '<tr><td>encoder katmanı</td><td>4·(512·512 + 512) + FFN (512·2048 + 2048 + 2048·512 + 512) + 2 LayerNorm</td><td>'+tr(b[1])+'</td></tr>'+
    '<tr><td>decoder katmanı</td><td>2 dikkat + FFN + 3 LayerNorm</td><td>'+tr(b[2])+'</td></tr>'+
    '<tr><td><b>temel model</b></td><td>gömme + 6 encoder + 6 decoder</td><td><b>'+tr(b[3])+'</b> (makale: 65 milyon)</td></tr>'+
    '<tr><td><b>büyük model</b></td><td>d = 1024, d_ff = 4096</td><td><b>'+tr(B[3])+'</b> (makale: 213 milyon)</td></tr></table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> Makaledeki iki sayıya kendi hesabımızla yaklaşıyoruz: 63,1 ↔ 65 milyon ve 214,2 ↔ 213 milyon. Fark büyük olasılıkla sözlük boyundan (37.000 yaklaşık; makale "yaklaşık 37.000 token" diyor) ve sayım ayrıntılarından; makale sayımın tam dökümünü vermiyor. Ağırlıkların ~%30\'u tek bir gömme tablosunda: giriş, çıkış ve softmax öncesi katman <b>aynı tabloyu paylaşıyor</b> (makale bölüm 3.4).</div>';}
  const e2=$('ppEx2');if(e2){e2.innerHTML='<table class="tk-tbl"><tr><th>adım</th><th>lr</th><th>durum</th></tr>'+[1,100,1000,4000,10000,100000].map(a=>'<tr'+(a===4000?' class="on"':'')+'><td>'+tr(a)+'</td><td>'+ex(lr(a,512,4000))+'</td><td>'+(a<4000?'ısınma (doğrusal artış)':a===4000?'tepe':'1/√adım ile azalma')+'</td></tr>').join('')+'</table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> Hız 4.000 adımda tepeye (≈7·10⁻⁴) çıkıyor, 100.000. adımda (temel modelin eğitimi burada bitiyor) tepenin %20\'sine iniyor. Bugün kullanılan "ısınma + azalma" takvimlerinin (Optimizerlar → Ekstra) ilk yaygın örneklerinden biri bu formül.</div>';}
  const e3=$('ppEx3');if(e3){e3.innerHTML='<table class="tk-tbl"><tr><th>n (dizi)</th><th>öz-dikkat n²·d</th><th>RNN n·d²</th><th>sıralı adım (öz-dikkat ↔ RNN)</th></tr>'+[50,512,4096].map(n=>'<tr><td>'+tr(n)+'</td><td>'+tr(n*n*512)+'</td><td>'+tr(n*512*512)+'</td><td>1 ↔ '+tr(n)+'</td></tr>').join('')+'</table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> 2017\'nin çeviri cümleleri (n ≈ 50) için öz-dikkat RNN\'den ~10 kat az işlem yapıyordu ve paraleldi: makalenin hız iddiasının temeli bu. n = d\'de eşitleniyor; n = 4.096\'da öz-dikkat 8 kat pahalı. Bugünün uzun bağlamlı modellerinde (yüz binlerce token) n² maliyeti en büyük mühendislik sorunlarından biri.</div>';}
})();
