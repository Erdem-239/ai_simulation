// 📏 Değerlendirme dersi (#model-ev): bir sınavdaki doğruluk ne kadar güvenilir?
//  Simülasyon: gerçek başarısı bilinen iki model (A, B) n soruluk sınava girer — ölçülen oran, %95 güven aralığı,
//  200 tekrarda ölçümlerin dağılımı ve "B, A'dan yüksek ölçüldü" oranı. Örnekler sayfadaki Python koduyla (ev.py) birebir aynı.
(function(){
  const host=document.getElementById('evSim'); if(!host) return;
  const $=id=>document.getElementById(id);
  const P1=v=>'%'+(v*100).toFixed(1).replace('.',',');
  const lcg=t=>{let s=t;return ()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};};
  function sinav(p,n,u){let d=0;for(let i=0;i<n;i++)if(u()<p)d++;return d;}
  function aralik(d,n){const o=d/n,e=1.96*Math.sqrt(o*(1-o)/n);return [o,Math.max(0,o-e),Math.min(1,o+e)];}
  function comb(n,k){let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return r;}
  const gecme=(n,c,k)=>n-c<k?1:1-comb(n-c,k)/comb(n,k);
  window.__ev={lcg,sinav,aralik,gecme};
  const NS=[10,20,50,100,200,500,1000,2000,5000];
  let last=null,rep=null;
  const S=()=>({a:+$('evA').value/100,b:+$('evB').value/100,n:NS[+$('evN').value],seed:+$('evSeed').value});
  function run(){const s=S(),u=lcg(s.seed);last={da:sinav(s.a,s.n,u),db:sinav(s.b,s.n,u)};rep=null;draw();}
  function repeat(){const s=S(),u=lcg(s.seed+1000),A=[],B=[];let bu=0;for(let i=0;i<200;i++){const a=sinav(s.a,s.n,u)/s.n,b=sinav(s.b,s.n,u)/s.n;A.push(a);B.push(b);if(b>a)bu++;}rep={A,B,bu};draw();}
  function bar(lbl,col,p,d,n){const [o,lo,hi]=aralik(d,n),X=v=>20+v*400;
    return '<g><text x="16" y="0" font-size="11" fill="#fff" text-anchor="end">'+lbl+'</text><line x1="'+X(lo)+'" x2="'+X(hi)+'" y1="-4" y2="-4" stroke="'+col+'" stroke-width="6" opacity=".45"/><circle cx="'+X(o)+'" cy="-4" r="5" fill="'+col+'"/><line x1="'+X(p)+'" x2="'+X(p)+'" y1="-12" y2="4" stroke="#fff" stroke-dasharray="2 2"/></g>';}
  function draw(){const s=S();$('evAv').textContent='%'+Math.round(s.a*100);$('evBv').textContent='%'+Math.round(s.b*100);$('evNv').textContent=s.n.toLocaleString('tr-TR');
    let svg='<svg viewBox="0 0 440 '+(rep?190:80)+'" style="width:100%;max-width:520px;display:block"><rect width="440" height="'+(rep?190:80)+'" fill="#0d1426" rx="8"/>';
    [0,0.25,0.5,0.75,1].forEach(v=>svg+='<line x1="'+(20+v*400)+'" x2="'+(20+v*400)+'" y1="8" y2="'+(rep?178:66)+'" stroke="#1f2a46"/><text x="'+(20+v*400)+'" y="'+(rep?188:76)+'" font-size="9" fill="#95a2c2" text-anchor="middle">%'+v*100+'</text>');
    if(last){svg+='<g transform="translate(0,26)">'+bar('A','#5aa0ff',s.a,last.da,s.n)+'</g><g transform="translate(0,50)">'+bar('B','#f0a032',s.b,last.db,s.n)+'</g>';}
    if(rep){const bins=40,h=(arr,col,y0)=>{const c=new Array(bins).fill(0);arr.forEach(v=>c[Math.min(bins-1,Math.floor(v*bins))]++);const m=Math.max(...c);return c.map((k,i)=>k?'<rect x="'+(20+i*10)+'" y="'+(y0-k/m*45)+'" width="9" height="'+(k/m*45)+'" fill="'+col+'" opacity=".7"/>':'').join('');};
      svg+=h(rep.A,'#5aa0ff',122)+h(rep.B,'#f0a032',172)+'<text x="424" y="84" font-size="9.5" fill="#5aa0ff" text-anchor="end">A: 200 ölçüm</text><text x="424" y="134" font-size="9.5" fill="#f0a032" text-anchor="end">B: 200 ölçüm</text>';}
    $('evSvg').innerHTML=svg+'</svg>';
    let st='<b class="h">✏️ '+(last?'Bu sınavda':'Henüz sınav yapılmadı')+'</b>';
    if(last){const a=aralik(last.da,s.n),b=aralik(last.db,s.n);
      st+='A: '+last.da+' / '+s.n+' doğru → '+P1(a[0])+', aralık ± 1,96·√(o(1−o)/n) = ['+P1(a[1])+', '+P1(a[2])+']<br>B: '+last.db+' / '+s.n+' → '+P1(b[0])+', aralık ['+P1(b[1])+', '+P1(b[2])+']<br>Kesikli beyaz çizgi = gerçek başarı (sınav yapan bilmez).';}
    else st+='▶ ile iki model aynı n soruluk sınava girsin.';
    if(rep)st+='<br>200 tekrarda B, A\'dan yüksek ölçüldü: <b>'+P1(rep.bu/200)+'</b>.';
    $('evStep').innerHTML=st;
    let z='<b class="h">🗣️ Ne anlama geliyor?</b>';
    if(last){const a=aralik(last.da,s.n),b=aralik(last.db,s.n),ov=a[2]>=b[1]&&b[2]>=a[1];
      z+=ov?'İki aralık <b>üst üste biniyor</b>: bu sınav A ile B\'yi güvenle ayıramıyor. '+(s.n<1000?'Daha çok soru gerekir.':''):'Aralıklar ayrık: fark büyük olasılıkla gerçek.';
      if((last.db>last.da)!==(s.b>s.a)&&s.a!==s.b)z+=' Dikkat: bu sınavda sıralama <b>tersine döndü</b> — gerçekte daha iyi olan daha düşük ölçüldü.';}
    if(rep)z+=' Dağılımların genişliği n büyüdükçe daralır (yaklaşık 1/√n): soru sayısını 4 katına çıkarmak belirsizliği yarıya indirir.';
    $('evSoz').innerHTML=last||rep?z:'<b class="h">🗣️ Ne anlama geliyor?</b>Bir puan tablosundaki "%72" tek bir sayıdır ama arkasında bir belirsizlik vardır.';}
  $('evRun').onclick=run;$('evRep').onclick=repeat;
  ['evA','evB','evN','evSeed'].forEach(id=>$(id).oninput=()=>{last=null;rep=null;draw();});
  run();

  // ---- Örnek Çalışmalar ----
  const e1=$('evEx1');if(e1){const R=[20,100,500,2000].map(n=>{let u=lcg(7);const [o,a,b]=aralik(sinav(0.72,n,u),n);u=lcg(100+n);let ic=0;for(let i=0;i<1000;i++){const r=aralik(sinav(0.72,n,u),n);if(r[1]<=0.72&&0.72<=r[2])ic++;}return [n,o,a,b,ic/10];});
    window.__evEx1=R;
    e1.innerHTML='<table class="tk-tbl"><tr><th>n</th><th>ölçülen</th><th>%95 aralık</th><th>1000 tekrarda aralık gerçeği içerdi</th></tr>'+R.map(r=>'<tr><td>'+r[0]+'</td><td>'+P1(r[1])+'</td><td>['+P1(r[2])+', '+P1(r[3])+']</td><td>%'+r[4].toFixed(1).replace('.',',')+'</td></tr>').join('')+'</table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> Gerçek başarı %72; 20 soruluk sınav %60 ölçtü ve aralığı %38–%82 kadar geniş. 2.000 soruda aralık ±2 puana iniyor. "%95 güven aralığı", yüz sınavın yaklaşık 95\'inde gerçeği içerir (ölçtük: %93–96; küçük n\'de normal yaklaşım biraz eksik kalıyor). Bir puan tablosunda soru sayısı yazmıyorsa sayıyı yarı güvenle oku.</div>';}
  const e2=$('evEx2');if(e2){const R=[50,200,1000,5000].map(n=>{const u=lcg(n);let b=0;for(let i=0;i<500;i++){if(sinav(0.75,n,u)>sinav(0.72,n,u))b++;}return [n,b/5];});
    window.__evEx2=R;
    e2.innerHTML='<table class="tk-tbl"><tr><th>n</th><th>B\'nin A\'dan yüksek ölçülmesi (500 tekrar)</th></tr>'+R.map(r=>'<tr><td>'+r[0].toLocaleString('tr-TR')+'</td><td>%'+r[1].toFixed(1).replace('.',',')+'</td></tr>').join('')+'</table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> B gerçekte 3 puan daha iyi. 50 soruluk sınavda bu, beşte iki ihtimalle görünmüyor (B > A yalnız %60); 1.000 soruda %94. İki modelin "%1–2" farkla sıralandığı tablolarda sıralama, sınav küçükse şansla değişebilir.</div>';}
  const e3=$('evEx3');if(e3){const u=lcg(3);let t=0,sz=0,tm=0;for(let i=0;i<200;i++){const s=i<60,d=u()<(s?0.98:0.60);if(d){t++;if(s)sz++;else tm++;}}
    window.__evEx3=[t/2,sz/60*100,tm/140*100];
    e3.innerHTML='<table class="tk-tbl"><tr><th>soru grubu</th><th>doğruluk</th></tr><tr><td>bütün sınav (200)</td><td>%'+(t/2).toFixed(1).replace('.',',')+'</td></tr><tr><td>eğitime sızmış 60 soru</td><td>%'+(sz/60*100).toFixed(1).replace('.',',')+'</td></tr><tr><td>temiz 140 soru</td><td>%'+(tm/140*100).toFixed(1).replace('.',',')+'</td></tr></table>'+
    '<div class="callout">💡 <b>Ne öğrendik:</b> Modelin gerçek becerisi %60 ama sınav %71 gösteriyor: soruların %30\'u eğitim verisine sızmış ve ezberlenmiş. Bu yüzden ciddi değerlendirmeler sızıntıyı ayrıca kontrol eder: eğitim verisinde aynı metni arar, soruları yeniden yazar ya da modelin eğitiminden <b>sonra</b> yazılmış sorular kullanır (Aşırı Öğrenme → veri sızıntısı).</div>';}
  const e4=$('evPass');if(e4){e4.innerHTML='<table class="tk-tbl"><tr><th>k</th>'+[1,3,5,10].map(k=>'<th>'+k+'</th>').join('')+'</tr><tr><td>pass@k (10 denemenin 3\'ü doğru)</td>'+[1,3,5,10].map(k=>'<td>'+gecme(10,3,k).toFixed(4).replace('.',',')+'</td>').join('')+'</tr></table>';}
})();
