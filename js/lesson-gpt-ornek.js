// GPT Test — "7️⃣ Örnek Çalışmalar / Örnek 1": minik pencereli dil modeli dört toplama satırından (metin kendi etiketini verir)
// KENDİ KENDİNE öğrenir; "2+1=3" satırı eğitimden çıkarılınca (ezber ↔ genelleme) model görmediği toplamı bilemez. Python ile aynı sayılar.
(function(){
  const host=document.getElementById('gtEx1'); if(!host||!window.GPTTiny) return;
  const T=window.GPTTiny,$=id=>document.getElementById(id),V=T.V;
  const fm=(v,d=3)=>(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',').replace(/^-/,'−');
  const FULL=["1+1=2.","1+2=3.","2+1=3.","2+2=4."],HO=["1+1=2.","1+2=3.","2+2=4."],MAXEP=3000,LR=1.0,Q=['1+1=','1+2=','2+1=','2+2='];
  let M=T.init(1),P=T.pairs(FULL),ep=0,loss=null,timer=null,hist=[];
  host.innerHTML='<div class="rex-grid"><div class="rex-ctl"><div style="font-size:12.5px;color:#ccd5e8;margin-bottom:6px"><b>Eğitim metni</b> (her karakter, kendinden önceki 4 karakterden tahmin edilir):</div><div class="work" id="ge1Txt" style="white-space:pre;font-size:13px"></div>'+
    '<label style="cursor:pointer;font-size:13px;display:block;margin:8px 0"><input type="checkbox" id="ge1Ho"> 🙈 "2+1=3." satırını eğitimden çıkar (model görmesin)</label>'+
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:8px 0"><button class="rex-btn" id="ge1Go">▶ eğit</button><button class="rex-btn" id="ge1Pause">⏸</button><button class="rex-btn" id="ge1S1">🔧 +1</button><button class="rex-btn" id="ge1S10">+10</button><button class="rex-btn" id="ge1S100">+100</button><button class="rex-btn" id="ge1Fast">⚡ bitir</button><button class="rex-btn" id="ge1Rst">↺ başa dön</button></div>'+
    '<div class="rex-stat" id="ge1Stat"></div><div id="ge1Tab" style="margin-top:8px"></div><div style="margin-top:8px"><button class="rex-btn" id="ge1Gen">✍️ "1+2=" ile üret</button> <span id="ge1GenOut" style="font-family:ui-monospace,monospace;font-size:14px;color:#ffd54a"></span></div></div>'+
    '<div><div style="font-size:12.5px;color:#ccd5e8;margin-bottom:4px"><b>E tablosu</b> (her karakterin 2 sayılık kimlik kartı), eğitimle nasıl yerleşiyor?</div><svg id="ge1Svg" viewBox="0 0 300 240" style="width:100%;max-width:340px;background:#0d1426;border-radius:8px"></svg><div style="font-size:12px;color:#95a2c2;margin-top:4px">kayıp eğrisi (0 → 3000 epoch)</div><svg id="ge1Loss" viewBox="0 0 300 70" style="width:100%;max-width:340px;background:#0d1426;border-radius:8px"></svg></div></div><div class="callout" id="ge1C" style="margin-top:8px"></div>';
  const draw=()=>{
    $('ge1Txt').textContent=($('ge1Ho').checked?HO:FULL).join('\n');
    $('ge1Stat').innerHTML='epoch <b>'+ep+'</b> / '+MAXEP+' · kayıp <b>'+(loss===null?'—':fm(loss,3))+'</b> · perplexity <b>'+(loss===null?'—':fm(Math.exp(loss),2))+'</b> <span style="color:#95a2c2">(ilk: ln 7 = 1,946 → perplexity 7)</span>';
    let h='<table class="rex-tbl"><tr><th>girdi</th><th>modelin tahmini</th><th>olasılık</th><th>doğru</th></tr>',ok=0;
    Q.forEach(q=>{const r=T.next(M,q),tr=q==='2+1='?'3':(q==='1+1='?'2':q==='1+2='?'3':'4'),d=r.c===tr;if(d)ok++;h+='<tr><td><b>'+q+'</b></td><td><b style="color:'+(d?'#46c46a':'#e06a6a')+'">'+r.c+'</b></td><td>%'+fm(r.p*100,1)+'</td><td>'+tr+(q==='2+1='&&$('ge1Ho').checked?' <span style="color:#f0a032">(eğitimde yok)</span>':'')+'</td></tr>';});
    $('ge1Tab').innerHTML=h+'</table>';
    // E dağılımı
    const xs=M.E.map(r=>r[0]),ys=M.E.map(r=>r[1]),mn=a=>Math.min(...a),mx=a=>Math.max(...a),px=v=>25+(v-mn(xs))/((mx(xs)-mn(xs))||1)*250,py=v=>215-(v-mn(ys))/((mx(ys)-mn(ys))||1)*190,COL=['#46c46a','#46c46a','#46c46a','#46c46a','#f0a032','#3a7afe','#c77dff'];
    $('ge1Svg').innerHTML=M.E.map((r,i)=>'<circle cx="'+px(r[0])+'" cy="'+py(r[1])+'" r="13" fill="'+COL[i]+'" fill-opacity=".25" stroke="'+COL[i]+'"/><text x="'+px(r[0])+'" y="'+(py(r[1])+5)+'" text-anchor="middle" font-size="14" font-weight="700" fill="#e8ebf2" font-family="ui-monospace,monospace">'+V[i]+'</text>').join('');
    if(hist.length>1){const lm=Math.max(...hist.map(a=>a[1])),pts=hist.map(([e,l])=>(10+e/MAXEP*280).toFixed(1)+','+(62-l/lm*52).toFixed(1)).join(' ');$('ge1Loss').innerHTML='<polyline points="'+pts+'" fill="none" stroke="#46c46a" stroke-width="2"/>';}else $('ge1Loss').innerHTML='';
    const ho=$('ge1Ho').checked,u=T.next(M,'2+1=');
    $('ge1C').innerHTML=ep===0?'🎯 Eğitimden önce model hiçbir şey bilmiyor: 7 karaktere neredeyse eşit olasılık verir (kayıp ≈ ln 7). ▶ ile eğit ya da 🔧 ile adım adım ilerle.':
      (ho?(ep>=1000?'🙈 <b>Ezber ↔ öğrenme:</b> model gördüğü üç toplamı biliyor ama <b>"2+1="</b> için "'+u.c+'" diyor (%'+fm(u.p*100,0)+'), doğru "3" olasılığı ≈ '+fm(T.next(M,'2+1=').all[T.IX['3']],3)+'. Toplama kuralını <b>öğrenmedi</b>, gördüğü örnekleri ezberledi; bu, GPT Test simülasyonundaki "görmediği toplamlar şans düzeyi" bulgusunun minik hâli.':'⏳ Eğitim sürüyor; model henüz oturmadı.'):
      (ep>=500?'✅ Dört toplamı da doğru tahmin ediyor. Kayıp 0\'a inmez (≈0,23): "1+" sonrası <b>1 mi 2 mi geleceği</b> metinde gerçekten belirsiz (kayıp tabanı), model bunu bilemez, bilmesi de gerekmez. Soldaki kartlara bak: <b>1 ve 2 rakamları</b> ayrışıp yerleşti.':'⏳ Eğitim sürüyor...'));
    window.__gtEx1={ep,loss,M,ho};
  };
  const stepN=n=>{for(let i=0;i<n&&ep<MAXEP;i++){loss=T.step(M,P,LR);ep++;if(ep===1||ep%25===0||ep===MAXEP)hist.push([ep,loss]);}};
  const stop=()=>{if(timer){cancelAnimationFrame(timer);timer=null;}};
  const loop=()=>{if(ep>=MAXEP){stop();draw();return;}stepN(25);draw();timer=requestAnimationFrame(loop);};
  const reset=()=>{stop();M=T.init(1);P=T.pairs($('ge1Ho').checked?HO:FULL);ep=0;loss=null;hist=[];$('ge1GenOut').textContent='';draw();};
  $('ge1Go').onclick=()=>{if(!timer&&ep<MAXEP)timer=requestAnimationFrame(loop);};$('ge1Pause').onclick=stop;
  $('ge1S1').onclick=()=>{stop();stepN(1);draw();};$('ge1S10').onclick=()=>{stop();stepN(10);draw();};$('ge1S100').onclick=()=>{stop();stepN(100);draw();};
  $('ge1Fast').onclick=()=>{stop();stepN(MAXEP-ep);draw();};$('ge1Rst').onclick=reset;$('ge1Ho').onchange=reset;
  $('ge1Gen').onclick=()=>{let s='1+2=',out='1+2=';for(let i=0;i<4;i++){const r=T.next(M,s.slice(-4));out+=r.c;s+=r.c;if(r.c==='.')break;}$('ge1GenOut').textContent=out;};
  window.__gtEx1Reset=reset;draw();
})();
