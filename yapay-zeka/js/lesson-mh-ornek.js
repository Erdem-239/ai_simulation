// Multi-Head — "7️⃣ Örnek Çalışmalar": (1) pozisyon imzası olmadan attention kelime sırasını göremez (aynı kelimeler, ters sıra),
// (2) kafa sayısı değişince ağırlık sayısı ve skor tablosu sayısı. Python karşılıkları (index.html kod kutuları) ile aynı sayılar.
(function(){
  const $=id=>document.getElementById(id);
  const fm=(v,d=3)=>(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',').replace(/^-/,'−');
  const lcg=s=>{let st=s;return()=>{st=(st*1664525+1013904223)%4294967296;return st/4294967296;};};
  const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)));
  const D=4,KEL={'kedi':[0.9,-0.2,0.4,0.1],'kovaladı':[-0.3,0.8,0.1,0.6],'köpek':[0.7,0.5,-0.4,-0.2]};
  const rmat=t=>{const r=lcg(t);return Array.from({length:D},()=>Array.from({length:D},()=>r()*2-1));};
  const WQ=rmat(1),WK=rmat(2),WV=rmat(3);
  const poz=p=>[Math.sin(p/Math.pow(10000,0/D)),Math.cos(p/Math.pow(10000,0/D)),Math.sin(p/Math.pow(10000,2/D)),Math.cos(p/Math.pow(10000,2/D))];
  const attn=X=>{const Q=mm(X,WQ),K=mm(X,WK),V=mm(X,WV);
    const S=Q.map(q=>K.map(k=>q.reduce((s,v,i)=>s+v*k[i],0)/Math.sqrt(D)));
    const A=S.map(r=>{const m=Math.max(...r),e=r.map(v=>Math.exp(v-m)),s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s);});return mm(A,V);};
  const cumle=(sira,pe)=>{const X=sira.map((k,i)=>pe?KEL[k].map((v,j)=>v+poz(i)[j]):KEL[k].slice()),Z=attn(X),o={};sira.forEach((k,i)=>o[k]=Z[i]);return o;};
  const A_SIRA=['kedi','kovaladı','köpek'],B_SIRA=['köpek','kovaladı','kedi'];

  const h1=$('mhEx1');
  if(h1){
    h1.innerHTML='<div style="font-size:12.5px;color:#ccd5e8;margin-bottom:8px"><b>A:</b> "kedi kovaladı köpek" · <b>B:</b> "köpek kovaladı kedi" (aynı 3 kelime, ters sıra: kim kimi kovaladı değişti). Aynı W matrisleriyle tek kafa attention çalıştırıyoruz. Her kelimenin çıktısını iki cümlede kıyasla.</div>'+
      '<label style="cursor:pointer;font-size:13px"><input type="checkbox" id="me1Pe"> 📍 pozisyon imzasını (sin/cos) ekle</label><div id="me1Out" style="margin-top:8px"></div><div class="callout" id="me1C" style="margin-top:8px"></div>';
    const draw=()=>{
      const pe=$('me1Pe').checked,ca=cumle(A_SIRA,pe),cb=cumle(B_SIRA,pe);let mx=0;
      let h='<table class="rex-tbl"><tr><th>kelime</th><th>çıktısı A cümlesinde</th><th>çıktısı B cümlesinde</th><th>fark (uzaklık)</th></tr>';
      A_SIRA.forEach(k=>{const fk=Math.sqrt(ca[k].reduce((s,v,i)=>s+(v-cb[k][i])*(v-cb[k][i]),0));mx=Math.max(mx,fk);
        h+='<tr><td><b>'+k+'</b></td><td>('+ca[k].map(v=>fm(v,3)).join(' ; ')+')</td><td>('+cb[k].map(v=>fm(v,3)).join(' ; ')+')</td><td><b>'+fm(fk,3)+'</b></td></tr>';});
      $('me1Out').innerHTML=h+'</table>';
      $('me1C').innerHTML=pe?'📍 <b>İmza açık:</b> aynı kelime farklı pozisyonda <b>farklı çıktı</b> veriyor (fark ≈ '+fm(mx,2)+'). Model artık "kedi başta mı sonda mı"yı, yani <b>kim kimi kovaladı</b>\'yı ayırt edebilir.':'⚠️ <b>İmza kapalı:</b> her kelimenin çıktısı iki cümlede <b>birebir aynı</b> (fark = 0). Attention kelimeleri bir <b>küme</b> olarak görüyor, sırayı bilmiyor: "kedi köpeği kovaladı" ile "köpek kediyi kovaladı" onun için aynı. Pozisyon imzasını açıp farkı gör.';
      window.__mhEx1={pe,mx};
    };
    $('me1Pe').onchange=draw;draw();
  }

  const h2=$('mhEx2');
  if(h2){
    const DS=[512,768,1024,4096],HS=[1,2,4,8,12,16,32,64];
    h2.innerHTML='<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-bottom:8px;font-size:13px"><label>d (vektör boyutu) <select id="me2D">'+DS.map(d=>'<option'+(d===768?' selected':'')+'>'+d+'</option>').join('')+'</select></label><label>kafa sayısı H <select id="me2H">'+HS.map(h=>'<option'+(h===12?' selected':'')+'>'+h+'</option>').join('')+'</select></label><label>cümle uzunluğu n <input id="me2N" type="number" min="2" max="512" value="10" style="width:64px"></label></div><div id="me2Out"></div><div class="callout" id="me2C" style="margin-top:8px"></div>';
    const draw=()=>{
      const d=+$('me2D').value,H=+$('me2H').value,n=Math.max(2,Math.min(512,+$('me2N').value||10));
      if(d%H){$('me2Out').innerHTML='<div class="tip">d, H\'ye tam bölünmeli (d/H bir tam sayı olmalı).</div>';$('me2C').innerHTML='';return;}
      const dk=d/H,par=3*d*(H*dk)+(H*dk)*d,skor=H*n*n,tek=4*d*d,loc=x=>x.toLocaleString('tr-TR');
      $('me2Out').innerHTML='<table class="rex-tbl"><tr><th>kafa başına boyut d<sub>k</sub> = d/H</th><td><b>'+dk+'</b></td></tr><tr><th>ağırlık sayısı (W<sub>Q</sub>,W<sub>K</sub>,W<sub>V</sub>,W<sub>O</sub>) = 4·d²</th><td><b>'+loc(par)+'</b></td></tr><tr><th>skor tablosu hücresi (H · n²)</th><td><b>'+loc(skor)+'</b> ('+H+' tablo × '+n+'×'+n+')</td></tr></table>';
      $('me2C').innerHTML='💡 Kafa sayısı <b>H değişse de</b> ağırlık sayısı <b>aynı</b> ('+loc(tek)+'): her kafa, W matrislerinin d<sub>k</sub> sütunluk <b>dilimini</b> kullanır; kafa sayısı arttıkça kafa başına boyut küçülür. Değişen şey: <b>kaç ayrı skor tablosu</b> olduğu ('+H+' tane), yani kaç farklı "bakış" yakalanabileceği. Cümle uzayınca skor hücreleri n² ile büyür (n='+n+' → '+loc(n*n)+' hücre/kafa).';
      window.__mhEx2={d,H,dk,par,skor};
    };
    ['me2D','me2H','me2N'].forEach(i=>$(i).addEventListener('input',draw));draw();
  }
})();
