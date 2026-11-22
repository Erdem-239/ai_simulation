// ✂️ İnce Ayar dersi → Ekstra: «Eğitmeden düzenle» (#ftEdit)
//  Dersin kendi minik modeli (tam ince ayarlı model, window.__ftEX.F — lesson-ft.js) üzerinde,
//  EĞİTİM YAPMADAN bir gizli nöronun çıkış ağırlıklarını (W2 satırı) çarpanla ölçekleyip davranışın nasıl
//  değiştiğini gösterir. Tüm sayılar canlı hesaplanır, sayfada sabit sayı yok.
(function(){
  const host=document.getElementById('ftEdit'); if(!host||!window.__ft) return;
  const F=window.__ft, SOZ=F.SOZ, V=SOZ.length, N=6, H=24, IX={}; SOZ.forEach((w,i)=>IX[w]=i);
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const fm=(v,d=3)=>(v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');
  const Q=[['soru : kedi ne yer ?','ince ayarda gördü'],['soru : köpek ne yer ?','ince ayarda gördü'],['soru : at ne yer ?','ince ayarda gördü'],
    ['soru : kuş uçar mı ?','ince ayarda gördü'],['soru : kedi uçar mı ?','ince ayarda gördü'],['soru : kuş ne yer ?','görmedi'],
    ['soru : balık yüzer mi ?','görmedi'],['kuş','ön eğitim'],['balık','ön eğitim']];
  const HEDEF=5, DOGRU='cevap : yem .';
  const FAK=[-1,0,0.5,1.5,2];
  let M=null, B=null, j=1, a=0, busy=false;

  const pen=t=>Array(N).fill('|').concat(t.split(' ')).slice(-N).map(w=>IX[w]);
  function aktif(P,istem){const u=P.b1[0].slice();pen(istem).forEach((w,k)=>{const r=P.W1[k*V+w];for(let c=0;c<H;c++)u[c]+=r[c];});return u.map(x=>x>0);}
  // düzenlenmiş model: yalnız W2'nin j. satırı çarpılır (öteki tablolar paylaşılır, kopya yok)
  const duzenle=(j0,f)=>({W1:M.W1,b1:M.b1,b2:M.b2,W2:M.W2.map((r,i)=>i===j0?r.map(x=>x*f):r)});
  const cikti=(P)=>Q.map(q=>F.uret(P,q[0]));

  function hazir(){
    if(M) return true;
    if(window.__ftFillEx) window.__ftFillEx();
    if(!window.__ftEX) return false;
    M=window.__ftEX.F; B=cikti(M);
    B.ko=F.kayip(M,F.DO); B.ka=F.kayip(M,F.DA);
    return true;
  }

  function kur(){
    host.innerHTML=
    '<div class="callout" style="margin:0 0 10px">🎯 <b>Soru:</b> Bir modeli <b>eğitmeden</b>, ağırlıklarından birini elle değiştirerek davranışını düzeltebilir miyiz? Aşağıdaki model, bu dersin tam ince ayarlı modeli. «soru : kuş ne yer ?» sorusunu görmedi ve <b>«ot»</b> diye uyduruyor; bilinen doğru cevap «yem».</div>'+
    '<div class="ed-ctl"><label>Gizli nöron <b id="edJv">1</b> / '+H+' <input type="range" id="edJ" min="1" max="'+H+'" value="1"></label>'+
    '<label>Çarpan <b id="edAv">×0</b> <input type="range" id="edA" min="-1" max="2" step="0.25" value="0"></label>'+
    '<span><button class="rex-btn" id="edSus">✂️ Nöronu sustur (×0)</button><button class="rex-btn" id="edGeri">↺ Geri al (×1)</button></span></div>'+
    '<div class="ed-wrap"><div id="edTbl"></div><div id="edSoz" class="gn-note"></div></div>'+
    '<h4 style="margin:14px 0 6px;color:#e8ecf5">🔍 Bütün tek-nöron düzenlemeleri tara</h4>'+
    '<p class="gn-note" style="margin:0 0 6px">'+H+' nöron × '+FAK.length+' çarpan ('+FAK.map(x=>'×'+String(x).replace('.',',').replace('-','−')).join(', ')+') = <b>'+(H*FAK.length)+'</b> düzenleme; her biri için 9 istemin çıktısı baştan hesaplanır. Aranan: «kuş ne yer ?» cevabını değiştiren, ama <b>öteki 8 istemi bozmayan</b> düzenleme.</p>'+
    '<button class="rex-btn" id="edTara">▶ Taramayı başlat</button> <span id="edDur" style="font-size:12px;color:#95a2c2"></span>'+
    '<div id="edSon"></div>';
    const J=document.getElementById('edJ'),A=document.getElementById('edA');
    J.oninput=()=>{j=+J.value;draw();}; A.oninput=()=>{a=+A.value;draw();};
    document.getElementById('edSus').onclick=()=>{a=0;A.value=0;draw();};
    document.getElementById('edGeri').onclick=()=>{a=1;A.value=1;draw();};
    document.getElementById('edTara').onclick=tara;
    draw();
  }

  function draw(){
    document.getElementById('edJv').textContent=j;
    document.getElementById('edAv').textContent='×'+String(a).replace('.',',').replace('-','−');
    const E=duzenle(j-1,a), O=cikti(E), ko=F.kayip(E,F.DO), ka=F.kayip(E,F.DA);
    let ch=0,t='<div style="overflow-x:auto"><table class="tk-tbl"><tr><th>istem</th><th>düzenlemeden önce</th><th>düzenlemeden sonra</th></tr>';
    const akt=Q.reduce((n,q,i)=>{const tk=B[i].split(' '),ctx=[q[0]];for(let k=0;k<tk.length;k++)ctx.push(q[0]+' '+tk.slice(0,k+1).join(' '));return n+(ctx.some(c=>aktif(M,c)[j-1])?1:0);},0);
    Q.forEach((q,i)=>{const d=O[i]!==B[i];if(d)ch++;
      t+='<tr'+(d?' class="on"':'')+'><td>'+esc(q[0])+' <small>('+q[1]+')</small></td><td>'+esc(B[i])+'</td><td>'+esc(O[i])+(d?' ◀':'')+'</td></tr>';});
    t+='<tr><td><b>ön eğitim metni kaybı</b> <small>(büyürse: bozuldu)</small></td><td>'+fm(B.ko)+'</td><td>'+fm(ko)+'</td></tr>'+
       '<tr><td><b>ince ayar verisi kaybı</b></td><td>'+fm(B.ka)+'</td><td>'+fm(ka)+'</td></tr></table></div>';
    document.getElementById('edTbl').innerHTML=t;
    let s='<b>🗣️ Ne anlama geliyor?</b><br>';
    if(a===1)s+='Çarpan ×1: hiçbir şey değişmedi, bu <b>ilk model</b>. Bir nöron seç, çarpanı oynat.';
    else{
      s+='Nöron <b>'+j+'</b>, 9 istemin <b>'+akt+'</b> tanesinde cevap üretilirken en az bir adımda aktif (ReLU çıkışı 0\'dan büyük). Hiç aktif olmadığı istemlerde çıkış ağırlığını nasıl değiştirirsen değiştir <b>sonuç aynı kalır</b>. ';
      s+=ch===0?'Bu düzenleme hiçbir istemin çıktısını değiştirmedi.':'Düzenleme <b>'+ch+' / 9</b> istemin çıktısını değiştirdi'+(O[HEDEF]!==B[HEDEF]?' («kuş ne yer ?» dahil)':' («kuş ne yer ?» değişmedi)')+'.';
      if(O[HEDEF]===DOGRU)s+=' 🎯 «kuş ne yer ?» artık <b>doğru cevabı</b> veriyor.';
      else if(O[HEDEF]!==B[HEDEF])s+=' «kuş ne yer ?» cevabı değişti ama <b>doğru cevap («yem») değil</b>.';
      const other=ch-(O[HEDEF]!==B[HEDEF]?1:0);
      if(other>0)s+=' Hedef dışında <b>'+other+'</b> istem de değişti: bu <b>yan etki</b>.';
    }
    document.getElementById('edSoz').innerHTML=s;
  }

  function tara(){
    if(busy) return; busy=true;
    const btn=document.getElementById('edTara'),dur=document.getElementById('edDur'),son=document.getElementById('edSon');
    btn.disabled=true; son.innerHTML=''; const res=[]; let c=0; const t0=Date.now();
    const adim=()=>{
      if(c>=H){bitir(res);busy=false;btn.disabled=false;dur.textContent='bitti ('+((Date.now()-t0)/1000).toFixed(1).replace('.',',')+' sn)';return;}
      for(const f of FAK){const E=duzenle(c,f),O=cikti(E);
        const degisen=O.reduce((n,x,i)=>n+(i!==HEDEF&&x!==B[i]?1:0),0);
        res.push({j:c+1,f,kus:O[HEDEF],degisen,hedef:O[HEDEF]!==B[HEDEF]});}
      c++; dur.textContent='⏳ nöron '+c+' / '+H; setTimeout(adim,0);
    };
    adim();
  }

  function bitir(res){
    const toplam=res.length, deg=res.filter(r=>r.hedef), temiz=deg.filter(r=>r.degisen===0), dogru=res.filter(r=>r.kus===DOGRU);
    const fx=f=>'×'+String(f).replace('.',',').replace('-','−');
    let h='<div class="callout">📊 <b>Tarama sonucu ('+toplam+' düzenleme):</b><br>• «kuş ne yer ?» cevabını değiştiren: <b>'+deg.length+'</b><br>'+
      '• Bunlardan öteki 8 istemi <b>hiç bozmayanlar</b>: <b>'+temiz.length+'</b><br>• Doğru cevabı («yem») veren: <b>'+dogru.length+'</b></div>';
    if(temiz.length){h+='<div style="overflow-x:auto"><table class="tk-tbl"><tr><th>nöron</th><th>çarpan</th><th>«kuş ne yer ?» cevabı</th></tr>'+
      temiz.slice(0,8).map(r=>'<tr><td>'+r.j+'</td><td>'+fx(r.f)+'</td><td>'+esc(r.kus)+(r.kus===DOGRU?' 🎯':'')+'</td></tr>').join('')+'</table></div>'+
      (temiz.length>8?'<p class="gn-note" style="margin:2px 0">… ve '+(temiz.length-8)+' tane daha.</p>':'');}
    h+='<div class="callout">💡 <b>Ne öğrendik:</b> ';
    if(dogru.length===0)h+='Bu tarama <b>hiçbir düzenlemeyle doğru cevaba ulaşamadı</b>: kolu bulmak ile doğru cevabı bulmak ayrı şey. ';
    else h+='Taramada doğru cevaba ulaşan '+dogru.length+' düzenleme bulundu; yine de yan etkilerine bakmak gerekir. ';
    h+='Aynı anda iki şey ölçmek gerekiyor: <b>hedef düzeldi mi</b> ve <b>başka bir şey bozuldu mu</b>. Eğitim bunu gradyanla yapar; doğrudan düzenlemede ikisini deneyerek ölçersin (burada 9 istem, '+toplam+' deneme).</div>';
    document.getElementById('edSon').innerHTML=h;
  }

  function dene(){ if(hazir()){kur();return true;} return false; }
  const head=host.closest('.pts')&&host.closest('.pts').querySelector('.sahne-head');
  let kuruldu=false;
  const ac=()=>setTimeout(()=>{ if(!kuruldu&&dene()) kuruldu=true; else if(!kuruldu) setTimeout(ac,200); },80);
  if(head) head.addEventListener('click',ac);
  host.innerHTML='<p class="gn-note">⏳ Bu başlığı açınca model tarayıcıda hazırlanır (≈1 sn).</p>';
  window.__ftEdit={duzenle:(j0,f)=>M?duzenle(j0,f):null,cikti:()=>M?B.slice():null};
})();
