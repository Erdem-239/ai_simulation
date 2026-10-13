// Kelime Temsili — ➕ Ekstra: "word2vec'in ek parçaları". (1) CBOW ↔ Skip-gram: aynı cümleden hangi eğitim örnekleri çıkıyor (pencere kaydırıcılı),
// (2) negatif örnekleme hesabı: tam softmax ile maliyet karşılaştırması. Python karşılığı sayfadaki kod kutusunda (çıktı aynı).
(function(){
  const host=document.getElementById('embExtra'); if(!host) return;
  const $=id=>document.getElementById(id);
  const SENT=[
    ['Tehlikeli Oyunlar\'dan: "bir yandan da hiç konuşmak istemiyor"','bir yandan da hiç konuşmak istemiyor'],
    ['kedi dün gece uyudu ve köpek koştu','kedi dün gece uyudu ve köpek koştu'],
    ['kral tahtta oturdu kraliçe yönetti','kral tahtta oturdu kraliçe yönetti']];
  function gen(words,w,method){
    const out=[];
    words.forEach((c,i)=>{
      const nb=[];for(let j=Math.max(0,i-w);j<=Math.min(words.length-1,i+w);j++)if(j!==i)nb.push(words[j]);
      if(method==='skipgram')nb.forEach(k=>out.push([c,k]));else out.push([nb,c]);
    });
    return out;
  }
  const fmt=n=>n.toLocaleString('tr-TR');
  host.innerHTML=
   '<div class="rex-ctl" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:8px">'+
   '<span>Cümle:</span><select id="ex_s" class="rex-sel">'+SENT.map((s,i)=>'<option value="'+i+'">'+s[0]+'</option>').join('')+'</select>'+
   '<span>Yöntem:</span><button class="rex-btn" id="ex_sg">Skip-gram</button><button class="rex-btn" id="ex_cb">CBOW</button>'+
   '<span>Pencere:</span><input type="range" id="ex_w" min="1" max="3" value="1" style="width:110px"><b id="ex_wv">1</b></div>'+
   '<div id="ex_out"></div>'+
   '<div style="font-size:13px;color:#ccd5e8;margin:16px 0 4px"><b>⚡ Negatif örnekleme: neden çok işi azaltır?</b> Her eğitim çiftinde tam softmax, <b>bütün sözlüğü</b> (V aday) puanlar. Negatif örnekleme yalnızca doğru komşuyu ve birkaç rastgele yanlış kelimeyi (k tane) puanlar.</div>'+
   '<div class="rex-ctl" style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:6px">'+
   '<span>Sözlük V:</span><input type="range" id="ng_v" min="3" max="6.5" step="0.05" value="5" style="width:150px"><b id="ng_vv"></b>'+
   '<span>Vektör boyutu D:</span><select id="ng_d" class="rex-sel"><option>50</option><option>100</option><option selected>300</option></select>'+
   '<span>Negatif sayısı k:</span><input type="range" id="ng_k" min="2" max="20" value="10" style="width:110px"><b id="ng_kv"></b></div>'+
   '<div id="ng_out"></div>';
  const S={s:0,m:'skipgram',w:1};
  function draw(){
    const words=SENT[S.s][1].split(' '),res=gen(words,S.w,S.m);
    const sg=gen(words,S.w,'skipgram').length,cb=gen(words,S.w,'cbow').length;
    $('ex_wv').textContent=S.w;
    $('ex_sg').style.background=S.m==='skipgram'?'var(--blue)':'';$('ex_cb').style.background=S.m==='cbow'?'var(--blue)':'';
    const rows=res.map(([a,b],i)=>S.m==='skipgram'?'<tr><td>'+(i+1)+'</td><td><b>'+a+'</b></td><td>→</td><td>'+b+'</td></tr>':'<tr><td>'+(i+1)+'</td><td>'+a.join(' + ')+'</td><td>→</td><td><b>'+b+'</b></td></tr>').join('');
    $('ex_out').innerHTML='<table class="rex-tbl" style="font-size:12.5px"><tr><th>#</th><th>'+(S.m==='skipgram'?'girdi (merkez)':'girdi (komşular birlikte)')+'</th><th></th><th>'+(S.m==='skipgram'?'tahmin edilecek komşu':'tahmin edilecek merkez')+'</th></tr>'+rows+'</table>'+
     '<p style="font-size:13.5px;color:#ccd5e8;line-height:1.7">Bu cümle ve pencere='+S.w+' için: <b>Skip-gram '+sg+' örnek</b>, <b>CBOW '+cb+' örnek</b>. '+
     (S.m==='skipgram'?'Skip-gram her merkez-komşu çiftini <b>ayrı bir soru</b> yapar: pencere büyüdükçe örnek sayısı artar (hesap yükü ↑), ama nadir kelimeler daha çok güncellenir ve çok anlamlı kelimeler daha iyi öğrenilir.':'CBOW komşuların vektörlerini <b>ortalayıp tek soru</b> sorar ("bu komşular → hangi kelime?"): kelime başına tek örnek olduğu için hesap yükü ve veri ihtiyacı daha az, küçük verilerde iyi çalışır; ama ortalama aldığı için nadir ve çok anlamlı kelimeleri öğrenmesi daha zayıftır.')+'</p>';
    window.__embExtra={sg,cb,first:res.slice(0,3),m:S.m,w:S.w};
  }
  function ng(){
    const V=Math.round(Math.pow(10,+$('ng_v').value)),D=+$('ng_d').value,k=+$('ng_k').value;
    $('ng_vv').textContent=fmt(V);$('ng_kv').textContent=k;
    const full=V*D,neg=(1+k)*D,r=Math.round(V/(1+k));
    $('ng_out').innerHTML='<table class="rex-tbl" style="font-size:12.5px"><tr><th>yöntem</th><th>her çift için puanlanan aday</th><th>çarpım-toplam (aday × D)</th></tr>'+
      '<tr><td>tam softmax</td><td>'+fmt(V)+'</td><td><b>'+fmt(full)+'</b></td></tr><tr><td>negatif örnekleme</td><td>1 doğru + '+k+' yanlış = '+(1+k)+'</td><td><b>'+fmt(neg)+'</b></td></tr></table>'+
      '<p style="font-size:13.5px;color:#ccd5e8;line-height:1.7">≈ <b>'+fmt(r)+' kat daha az iş</b> (çift başına). Bedeli: bu artık tam softmax kaybı değil, <b>onun hızlı bir yaklaşığı</b>; yine de iyi kelime vektörleri çıkar. Rastgele yanlış kelimeler, sık geçenler daha olası olacak şekilde seçilir.</p>';
    window.__embNeg={V,D,k,full,neg,r};
  }
  $('ex_s').addEventListener('change',e=>{S.s=+e.target.value;draw();});
  $('ex_sg').addEventListener('click',()=>{S.m='skipgram';draw();});$('ex_cb').addEventListener('click',()=>{S.m='cbow';draw();});
  $('ex_w').addEventListener('input',e=>{S.w=+e.target.value;draw();});
  ['ng_v','ng_d','ng_k'].forEach(id=>$(id).addEventListener('input',ng));
  window.__embExtraGen=gen;
  draw();ng();
})();
