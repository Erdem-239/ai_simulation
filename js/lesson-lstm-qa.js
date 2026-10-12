// LSTM — "Adım adım soru-cevap: bir hücre içeride ne yapıyor?" (Simülasyon aşaması)
// Her adımda bir soru + 3 şık; cevaplayınca açıklama (MathJax + canlı sayılar) ve şemada ilgili parça vurgulanır.
// Girdiler (x, h₋₁, c₋₁) ve ağırlıklar Simülasyon'daki "tam hücre" ile aynı (js/app.js Wgt). Son adımda
// "çıktıyı sonraki adımın girdisi yap" ile h_t, c_t → h₋₁, c₋₁ olur (yinelemeyi gösterir).
(function(){
  const host=document.getElementById('lstmQA'); if(!host) return;
  const $=id=>document.getElementById(id);
  const sig=z=>1/(1+Math.exp(-z));
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const f=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const t=(v,d=3)=>{v=z0(v,d);return (v<0?'-':'')+Math.abs(v).toFixed(d).replace('.','{,}');};
  const tp=(v,d=3)=>v<0?'('+t(v,d)+')':t(v,d);
  const W={f:[0.5,0.4,0.1],i:[0.6,0.3,0.0],c:[0.8,0.5,0.0],o:[0.7,0.4,0.1]};
  const S={x:1.0,h:0.3,c:0.8};
  let cur=0,picked={},tm=null;

  function calc(){
    const {x,h,c:c0}=S,z={};
    for(const k of 'fico')z[k]=W[k][0]*x+W[k][1]*h+W[k][2];
    const F=sig(z.f),I=sig(z.i),G=Math.tanh(z.c),O=sig(z.o),fc=F*c0,ic=I*G,c=fc+ic,tc=Math.tanh(c),ht=O*tc;
    return {x,h,c0,z,F,I,G,O,fc,ic,c,tc,ht};
  }
  const zl=(k,n,q,nm)=>nm+'=W_'+k+'x+U_'+k+'h_{t-1}+b_'+k+'='+t(W[k][0],1)+'\\cdot'+tp(q.x,2)+'+'+t(W[k][1],1)+'\\cdot'+tp(q.h,2)+(W[k][2]?'+'+t(W[k][2],1):'')+'=\\mathbf{'+t(q.z[k],3)+'}';

  // her adım: soru, şıklar (ilki doğru değil: doğru index 'ok'), vurgu, açıklama
  const STEPS=[
   {hl:['x','h0','c0'],q:'Bir LSTM hücresine bu adımda <b>hangi üç şey</b> giriyor?',
    o:['Yalnız yeni kelime x<sub>t</sub>','x<sub>t</sub> (yeni kelime), h<sub>t−1</sub> (önceki çıktı) ve c<sub>t−1</sub> (uzun hafıza)','x<sub>t</sub> ve h<sub>t</sub>'],ok:1,
    a:q=>'<b>x<sub>t</sub> = '+f(q.x,2)+'</b> o anki girdi (yeni kelime), <b>h<sub>t−1</sub> = '+f(q.h,2)+'</b> bir önceki adımın çıktısı ("kısa hafıza"), <b>c<sub>t−1</sub> = '+f(q.c0,2)+'</b> cell state — bagaj bandındaki uzun süreli hafıza. İlk ikisi kapılara girer; c<sub>t−1</sub> ise otobanda yoluna devam eder. Şemada sarı halkalarla işaretli.'},
   {hl:['x','h0','fbox','ibox','gbox','obox'],q:'x<sub>t</sub> ile h<sub>t−1</sub> kapılara girmeden önce <b>ne yapılır</b>?',
    o:['Doğrudan toplanır','Her biri kendi ağırlığıyla çarpılıp toplanır, bias eklenir (dört kez, dört farklı ağırlık setiyle)','Birbirinden çıkarılır'],ok:1,
    a:q=>'Dört kutunun (f, i, c̃, o) <b>hepsi aynı iki girdiye</b> bakar ama her birinin <b>kendi ağırlıkları</b> var — bu yüzden dört farklı karar çıkar. Örneğin unutma kapısının ham skoru: \\( '+zl('f',0,q,'z_f')+' \\). x ve h<sub>t−1</sub> şemada aynı alt otobana biner, oradan dört kutuya dağılır.'},
   {hl:['fbox'],q:'<b>Unutma kapısı f</b> neyi belirler?',
    o:['Yeni gelen bilginin değerini','Eski hafızanın <b>ne kadarının kalacağını</b> (0 ile 1 arasında bir oran)','Çıktının işaretini'],ok:1,
    a:q=>'f = σ(z<sub>f</sub>), sigmoid olduğu için 0–1 arası: \\( f=\\sigma('+tp(q.z.f,3)+')=\\mathbf{'+t(q.F,3)+'} \\). Yani eski hafızanın <b>%'+Math.round(q.F*100)+'\'i kalacak</b>. f=0 olsaydı hafıza tamamen silinir, f=1 olsaydı hiç dokunulmazdı.'},
   {hl:['ibox','gbox'],q:'<b>Giriş kapısı i</b> ile <b>aday c̃</b> neden iki ayrı hesap?',
    o:['İkisi de aynı şeyi hesaplar','i bir <b>oran</b> (sigmoid: ne kadar girsin), c̃ ise <b>içerik</b> (tanh: ne yazılsın, −1…+1)','c̃ yalnızca ağırlık günceller'],ok:1,
    a:q=>'Kapı "ne kadar", aday "ne" sorusunu cevaplar. \\( i=\\sigma('+tp(q.z.i,3)+')=\\mathbf{'+t(q.I,3)+'} \\) (yeninin %'+Math.round(q.I*100)+'\'i girecek) ve \\( \\tilde c=\\tanh('+tp(q.z.c,3)+')=\\mathbf{'+t(q.G,3)+'} \\) (yazılmak istenen içerik).'},
   {hl:['c0','mulf'],q:'Eski hafıza c<sub>t−1</sub> ile f <b>nasıl birleşir</b>?',
    o:['Toplanır','<b>Çarpılır</b> (eleman eleman): f eski hafızayı ölçekler','Çıkarılır'],ok:1,
    a:q=>'Vana gibi: \\( f\\cdot c_{t-1}='+tp(q.F,3)+'\\cdot'+tp(q.c0,2)+'=\\mathbf{'+t(q.fc,3)+'} \\). Eski hafızanın <b>korunan kısmı</b> bu. f küçük olsaydı sonuç sıfıra yaklaşırdı — hafıza unutulurdu.'},
   {hl:['mului'],q:'Yeni bilgi hafızaya <b>nasıl hazırlanır</b>?',
    o:['i ile c̃ çarpılır (i bilginin ne kadarını geçireceğini söyler)','i ile c̃ toplanır','c̃ doğrudan hafızaya yazılır'],ok:0,
    a:q=>'\\( i\\cdot\\tilde c='+tp(q.I,3)+'\\cdot'+tp(q.G,3)+'=\\mathbf{'+t(q.ic,3)+'} \\). Giriş kapısı kısıksa aday içerik büyük olsa da hafızaya çok az girer.'},
   {hl:['plus','ct'],q:'Yeni cell state <b>c<sub>t</sub></b> nasıl oluşur?',
    o:['f·c<sub>t−1</sub> ile i·c̃ <b>çarpılır</b>','f·c<sub>t−1</sub> ile i·c̃ <b>toplanır</b> (W ile çarpma yok!)','Her ikisi tanh\'tan geçer, sonra çarpılır'],ok:1,
    a:q=>'\\( c_t=f\\,c_{t-1}+i\\,\\tilde c='+t(q.fc,3)+'+'+tp(q.ic,3)+'=\\mathbf{'+t(q.c,3)+'} \\). <b>Toplama</b> olduğu için hafıza yolunda W çarpımı yok; geri yayılımda gradyanın ölmemesinin sırrı (∂c<sub>t</sub>/∂c<sub>t−1</sub> = f). c<sub>t</sub> sonraki adıma <b>olduğu gibi</b> gider.'},
   {hl:['obox','mulo'],q:'<b>Çıkış kapısı o</b> ne işe yarar?',
    o:['Hafızayı siler','Hafızanın <b>ne kadarının dışarı (h<sub>t</sub> olarak) söyleneceğini</b> seçer','Yeni bilgiyi hafızaya yazar'],ok:1,
    a:q=>'\\( o=\\sigma('+tp(q.z.o,3)+')=\\mathbf{'+t(q.O,3)+'} \\): hafızanın <b>%'+Math.round(q.O*100)+'\'i</b> dışarı söylenecek. Hücre bir şeyi hatırlayıp (c) yine de söylemeyebilir (o küçükse) — hafıza ile çıktı ayrı şeyler.'},
   {hl:['tanhe','mulo','ht'],q:'<b>h<sub>t</sub></b> nasıl bulunur ve <b>sonraki adıma ne gider</b>?',
    o:['h<sub>t</sub> = c<sub>t</sub>; yalnız h<sub>t</sub> gider','h<sub>t</sub> = o·tanh(c<sub>t</sub>); sonraki adıma <b>hem h<sub>t</sub> hem c<sub>t</sub></b> gider','h<sub>t</sub> = o·c<sub>t</sub>; hiçbir şey gitmez'],ok:1,
    a:q=>'\\( \\tanh(c_t)='+t(q.tc,3)+',\\quad h_t=o\\cdot\\tanh(c_t)='+tp(q.O,3)+'\\cdot'+tp(q.tc,3)+'=\\mathbf{'+t(q.ht,3)+'} \\). Sonraki adımda <b>h<sub>t</sub> yeni h<sub>t−1</sub></b>, <b>c<sub>t</sub> yeni c<sub>t−1</sub></b> olur ve x<sub>t+1</sub> gelir — LSTM tam olarak bu döngüyü tekrar eder.'}
  ];

  const pend={};
  function tx(el){if(pend.tm)clearTimeout(pend.tm);pend.tm=setTimeout(()=>{const M=window.MathJax;if(!M||!M.startup||!M.startup.promise)return;M.startup.promise.then(()=>{if(!M.typesetPromise)return;if(M.typesetClear)M.typesetClear([el]);return M.typesetPromise([el]);}).catch(()=>{});},60);}

  host.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:10px 22px;margin-bottom:8px;font-size:13px;color:#ccd5e8"><span>x<sub>t</sub> = <input type="range" id="qaX" min="-2" max="2" step="0.05" value="1" style="width:120px"> <b id="qaXv">1,00</b></span><span>h<sub>t−1</sub> = <input type="range" id="qaH" min="-1" max="1" step="0.05" value="0.3" style="width:120px"> <b id="qaHv">0,30</b></span><span>c<sub>t−1</sub> = <input type="range" id="qaC" min="-2" max="2" step="0.05" value="0.8" style="width:120px"> <b id="qaCv">0,80</b></span></div><div style="overflow-x:auto"><svg id="qaSvg" style="min-width:560px;width:100%;max-width:780px;display:block;margin:0 auto"></svg></div><div id="qaList" style="margin-top:10px"></div>';

  function draw(){
    const q=calc(),stp=STEPS[Math.min(cur,STEPS.length-1)];
    $('qaSvg').setAttribute('viewBox','0 0 760 390');
    $('qaSvg').innerHTML=window.lstmCellSvg('qa_',{f:q.F,i:q.I,o:q.O,cp:q.c0,ct:q.G,fc:q.fc,ic:q.ic,c:q.c,tc:q.tc,h:q.ht},stp.hl);
    let h='';
    for(let i=0;i<=cur&&i<STEPS.length;i++){
      const s=STEPS[i],ans=picked[i]!==undefined,right=ans&&picked[i]===s.ok;
      h+='<div style="border:1px solid var(--line);border-left:4px solid '+(ans?(right?'#46c46a':'#e0a030'):'#5aa0e0')+';border-radius:10px;padding:10px 12px;margin-bottom:8px;background:rgba(255,255,255,.02)"><div style="font-size:12px;color:var(--muted);margin-bottom:3px">Adım '+(i+1)+' / '+STEPS.length+'</div><div style="font-size:14.5px;color:#fff;margin-bottom:6px">❓ '+s.q+'</div>';
      s.o.forEach((o,j)=>{
        const sel=picked[i]===j,good=ans&&j===s.ok;
        h+='<button class="qa-opt" data-i="'+i+'" data-j="'+j+'" '+(ans?'disabled':'')+' style="display:block;width:100%;text-align:left;margin:4px 0;padding:7px 10px;border-radius:8px;border:1px solid '+(good?'#46c46a':sel?'#e06a6a':'var(--line)')+';background:'+(good?'rgba(70,196,106,.14)':sel?'rgba(224,106,106,.12)':'var(--panel)')+';color:var(--text);cursor:'+(ans?'default':'pointer')+';font-size:13.5px">'+'ABC'[j]+') '+o+(good?' ✓':sel&&!good?' ✗':'')+'</button>';
      });
      if(ans)h+='<div class="callout" style="margin-top:8px"><b>'+(right?'✅ Doğru.':'💡 Doğru cevap '+'ABC'[s.ok]+'.')+'</b> '+s.a(q)+'</div>';
      h+='</div>';
    }
    if(cur<STEPS.length&&picked[cur]!==undefined){
      h+='<button class="rex-btn" id="qaNext">'+(cur===STEPS.length-1?'🏁 Bitir':'Sonraki soru ▶')+'</button> ';
    }
    if(cur>=STEPS.length){
      h+='<div class="callout"><b>🏁 Bir adım tamam:</b> x='+f(q.x,2)+', h₋₁='+f(q.h,2)+', c₋₁='+f(q.c0,2)+' girdisinden <b>c<sub>t</sub> = '+f(q.c,3)+'</b>, <b>h<sub>t</sub> = '+f(q.ht,3)+'</b> çıktı. Şimdi bir sonraki kelimeyi getirelim: bu çıktılar yeni h₋₁ ve c₋₁ olacak.</div><button class="rex-btn" id="qaLoop">↻ Çıktıyı sonraki adımın girdisi yap</button> ';
    }
    h+='<button class="rex-btn" id="qaReset">↺ başa dön</button>';
    $('qaList').innerHTML=h;
    $('qaXv').textContent=f(S.x,2);$('qaHv').textContent=f(S.h,2);$('qaCv').textContent=f(S.c,2);
    host.querySelectorAll('.qa-opt').forEach(b=>b.onclick=()=>{picked[+b.dataset.i]=+b.dataset.j;draw();});
    const nx=$('qaNext');if(nx)nx.onclick=()=>{cur++;draw();};
    const lp=$('qaLoop');if(lp)lp.onclick=()=>{const q2=calc();S.h=Math.max(-1,Math.min(1,q2.ht));S.c=Math.max(-2,Math.min(2,q2.c));$('qaH').value=S.h;$('qaC').value=S.c;cur=0;picked={};draw();};
    $('qaReset').onclick=()=>{cur=0;picked={};draw();};
    window.__lqa={cur,q};
    tx($('qaList'));
  }
  [['qaX','x'],['qaH','h'],['qaC','c']].forEach(([id,k])=>$(id).addEventListener('input',()=>{S[k]=parseFloat($(id).value);draw();}));
  draw();
})();
