/* RNN modülü — her türetme pop-up'ının (data-pop / .xt-src) altına "💬 Ne anlama geliyor?"
   sözel açıklaması ekler. Pop-up motoru (js/lesson-linreg.js ac()) kaynağın innerHTML'ini
   kopyaladığı için kaynağa bir kez eklemek yeter. Metinler sembolik (sayısız) — canlı sayılar
   zaten 📍/🔗/📐 köprülerinde. Anahtar: <tür>_<ad>[<adım>], tür: t,r,m,o,d (bkz. app.js). */
(function(){
  'use strict';
  const root=document.getElementById('model-rnn'); if(!root) return;
  // tür başına: adım n'de kendi çıktısı / girdisi var mı, kaç adım
  const HASOUT={t:()=>true, r:n=>n===3, m:()=>true, o:()=>true, d:n=>n>=3};
  const HASIN ={t:()=>true, r:()=>true,  m:()=>true, o:n=>n===1, d:n=>n<=2};
  const LAST  ={t:1, r:3, m:3, o:3, d:4};
  const S='<sub>', E='</sub>';

  function text(type,kind,n,m){
    const hasOut=HASOUT[type](n||1), hasIn=HASIN[type](n||1);
    switch(kind){
      case 'zh': {
        let t='Hücre burada iki soruya birden ham cevap veriyor: <b>şimdi ne görüyorum</b> (W'+S+'xh'+E+'·x) ve <b>daha önce ne hatırlıyorum</b> (W'+S+'hh'+E+'·h'+S+'−1'+E+'). İkisini ve sapmayı toplar; henüz sıkıştırılmamış bir "puan" (z'+S+'h'+E+') çıkar.';
        if(!hasIn) t+=' Bu adımda dışarıdan girdi yok — puan yalnız hafızadan ve sapmadan oluşur.';
        if(type!=='t' && n===1) t+=' t=1\'de önceki hafıza h'+S+'0'+E+'=0 olduğu için hafıza katkısı sıfır.';
        return t; }
      case 'tanh': {
        let t='z'+S+'h'+E+' puanını −1 ile 1 arasına sıkıştırıp <b>yeni hafızayı (h)</b> üretir. Bu h hem çıktıyı okumak için hem de bir sonraki adıma taşınmak için kullanılır — ağın "kısa süreli belleği" bu. z'+S+'h'+E+' çok büyük ya da çok küçükse h ±1\'e yapışır (doyma).';
        if(!hasOut) t+=' Bu adımın kendi çıktısı yok; h yalnızca sonraki adıma taşınır.';
        return t; }
      case 'zy': return 'Hafızadan <b>çıktıyı okur</b>: h\'yi W'+S+'hy'+E+' ile çarpıp b'+S+'y'+E+' ekler. Hafızada tutulan bilgi burada tahmine çevrilir.';
      case 'yhat': return 'Modelin <b>tahmini</b>. Regresyonda ekstra bir aktivasyon yok, doğrudan z'+S+'y'+E+'.';
      case 'L': return '<b>"Ne kadar yanlışım?"</b> sorusunun tek sayılık cevabı: tahminle gerçek cevabın farkının karesinin yarısı. 0 ise mükemmel, büyüdükçe daha yanlış. Geri yayılım buradan başlar ve ağırlıkları bu sayıyı küçültecek yöne iter.';
      case 'Ltot': return 'Çıktısı olan her adımın kaybı toplanır: ağın <b>tüm diziyi birden</b> ne kadar iyi tahmin ettiğinin tek ölçüsü. Her adımın kaybı toplamda 1 katsayısıyla girdiği için geri sinyal her adımdan ayrı ayrı başlayabilir.';
      case 'Lyhat': return '<b>Hata sinyalinin başlangıcı.</b> ŷ−y pozitifse fazla tahmin ettik (azaltmalıyız), negatifse az tahmin ettik (artırmalıyız); büyüklüğü de hatanın büyüklüğü.';
      case 'yhatzy': return 'Çıktı aktivasyonu özdeşlik olduğu için sinyal z'+S+'y'+E+'\'ye <b>aynen</b> geçer — bu halkada ne büyür ne küçülür.';
      case 'zyWhy': return 'W'+S+'hy'+E+'\'yi biraz artırırsan çıktı <b>h kadar</b> değişir. Hafıza büyükse bu ağırlık çıktıyı çok etkiler ve gradyanı büyük çıkar; h≈0 ise bu ağırlığı oynatmanın etkisi neredeyse yok.';
      case 'zyby': return 'b'+S+'y'+E+' çıktıya doğrudan eklenir, etkisi 1 birim. Bu yüzden gradyanı, z'+S+'y'+E+'\'ye ulaşan sinyalin kendisi.';
      case 'zyh': return 'Hata sinyalinin çıktı katmanından <b>hafızaya</b> geçişi: h değişirse çıktı W'+S+'hy'+E+' kadar değişir, o yüzden sinyal W'+S+'hy'+E+' ile çarpılarak h\'ye taşınır.';
      case 'hzh': return '<b>Tanh\'ın eğimi</b> (1−h²). h ±1\'e yakınsa (doymuş) eğim ≈0: sinyal burada söner. h≈0 ise eğim ≈1: sinyal geçer. Vanishing gradient\'in iki kaynağından biri bu çarpan.';
      case 'zhWxh': return 'W'+S+'xh'+E+'\'yi artırmanın etkisi <b>o adımın girdisi x kadar</b>. Girdi büyükse bu ağırlık çok etkili; girdi 0 ise bu adımdan W'+S+'xh'+E+'\'ye hiç gradyan gelmez.'+(type==='o'||type==='d'?' (Bu türde girdi her adımda yok; yaprak yalnızca girdili adımlarda var.)':'');
      case 'zhWhh': return 'W'+S+'hh'+E+'\'nin etkisi <b>önceki hafıza kadar</b>. Önceki hafıza boşsa (t=1\'de h'+S+'0'+E+'=0) bu adımdan W'+S+'hh'+E+'\'ye gradyan gelmez; hafıza dolduysa gelir.';
      case 'zhbh': return 'b'+S+'h'+E+' toplamaya doğrudan eklenir, etkisi 1. Gradyanı, bu adıma ulaşan sinyalin kendisi.';
      case 'zhhp': return '<b>Zincirin kapısı:</b> tek hücrede h'+S+'−1'+E+' dışarıdan verilen bir girdi, sinyal burada biter. Hücre bir zincirin parçasıysa aynı sinyal W'+S+'hh'+E+' ile çarpılıp bir önceki adıma akar — buna BPTT denir.';
      case 'bptt': return '<b>Zamanda geriye sıçrama (BPTT):</b> sinyal t='+n+'\'den t='+(n-1)+'\'e geçerken W'+S+'hh'+E+' ile çarpılır (sonra o adımın tanh türeviyle). Aynı çarpan her sıçramada tekrar ettiği için sinyal W'+S+'hh'+E+'(1−h²) &lt; 1 ise erir (vanishing), &gt; 1 ise büyür (exploding).';
      case 'hsum': {
        let t='Bu hafıza <b>iki işe</b> hizmet ediyor: kendi adımının çıktısı ve bir sonraki adım. Geri sinyal de iki yoldan gelir ve <b>toplanır</b>.';
        if(!hasOut) t='Bu adımın kendi çıktısı yok; hafıza yalnızca bir sonraki adıma hizmet ediyor, yani geri sinyalin tek kaynağı gelecekten gelen <b>BPTT</b>.';
        else if(n===LAST[type]) t='Bu son adım: gelecek yok, geri sinyalin tek kaynağı kendi çıktısı.';
        return t; }
      case 'from': return n===1
        ? '<b>Hafıza hattının başı:</b> t=1\'de önceki hafıza yok (h'+S+'0'+E+'=0), z'+S+'h'+E+' yalnız ilk girdi ve sapmadan oluşur. Aynı üç ağırlık (W'+S+'xh'+E+', W'+S+'hh'+E+', b'+S+'h'+E+') bütün adımlarda yeniden kullanılır.'
        : '<b>Hafıza hattı:</b> önceki adımın hafızası (h'+S+(n-1)+E+') bu adımın girdisiyle (x'+S+n+E+') birleşiyor. Ağın zaman içinde bilgiyi taşıdığı yol bu ok; aynı üç ağırlık her adımda yeniden kullanılıyor.';
    }
    return null;
  }

  function parse(key){
    const type=key[0]; let rest=key.slice(2), m;
    if((m=rest.match(/^zh(\d)h(\d)_from$/))) return [type,'from',+m[1]];
    if((m=rest.match(/^zh(\d)h(\d)$/)))      return [type,'bptt',+m[1]];
    if((m=rest.match(/^zhh(\d)$/)))          return [type,'bptt',+m[1]];
    if(rest==='zhhp')                        return [type,'zhhp',1];
    if((m=rest.match(/^h(\d)zh(\d)$/)))      return [type,'hzh',+m[1]];
    if((m=rest.match(/^hsum(\d)$/)))         return [type,'hsum',+m[1]];
    if(rest==='Ltot')                        return [type,'Ltot'];
    if((m=rest.match(/^(zh|tanh|zy|yhat|L|Lyhat|yhatzy|zyWhy|zyby|zyh|hzh|zhWxh|zhWhh|zhbh)(\d)?$/))) return [type,m[1],m[2]?+m[2]:1];
    if((m=rest.match(/^zh(\d)(Wxh|Whh|bh)$/))) return [type,'zh'+m[2],+m[1]];
    if((m=rest.match(/^zyh(\d)$/)))          return [type,'zyh',+m[1]];
    return null;
  }

  let done=0, miss=[];
  root.querySelectorAll('.xt-src[id^="xtsrc-"]').forEach(src=>{
    const key=src.id.slice('xtsrc-'.length), p=parse(key);
    const t=p && text(p[0],p[1],p[2]);
    if(!t){ miss.push(key); return; }
    /* "🗣️ Sözel anlatım" açılıp kapanır sekme: canlı yuva (app.js rnnBridges doldurur) + genel anlam */
    const acc=document.createElement('div'); acc.className='xp-sozacc';
    acc.innerHTML='<div class="xp-sozhead">🗣️ Sözel anlatım <span class="chev">▸</span></div>'
      +'<div class="xp-sozbody"><div class="xp-vslot" data-vs="'+key+'"></div>'
      +'<div class="xp-soz"><b>Genel olarak:</b> '+t+'</div></div>';
    src.appendChild(acc); done++;
  });
  window.__rnnSozCount={done:done, miss:miss};

  /* sekmeyi aç/kapa (pop-up içinde de çalışır; tercih oturum boyunca hatırlanır) */
  const PREF='rnnSozOpen';
  const getPref=()=>{ try{ return sessionStorage.getItem(PREF)==='1'; }catch(_){ return false; } };
  const setPref=v=>{ try{ sessionStorage.setItem(PREF,v?'1':'0'); }catch(_){} };
  document.addEventListener('click',e=>{
    const h=e.target.closest && e.target.closest('.xp-sozhead'); if(!h) return;
    const acc=h.parentNode; acc.classList.toggle('open'); setPref(acc.classList.contains('open'));
    // pop-up yüksekliği değişti → motorun scroll dinleyicisi yeniden konumlar
    document.dispatchEvent(new Event('scroll'));
  });
  window.addEventListener('load',()=>{
    const pop=document.getElementById('xtPop'); if(!pop) return;
    new MutationObserver(()=>{ if(getPref()) pop.querySelectorAll('.xp-sozacc:not(.open)').forEach(a=>a.classList.add('open')); })
      .observe(pop,{childList:true});
  });
})();
