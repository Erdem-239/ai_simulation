// Softmax — "7️⃣ Örnek Çalışmalar": (1) 4 skoru çapraz-entropiyle KENDİ KENDİNE eğit (öğrenilen = verideki oranlar),
// (2) temperature tablosu + 1000 çekiliş, (3) naif oranlama / ham e^z / kararlı softmax yan yana (negatif ve dev skorlar).
// Python karşılığı (index.html'deki kod kutuları) ile aynı sayıları üretir.
(function(){
  const $=id=>document.getElementById(id);
  const fm=(v,d=3)=>{if(!isFinite(v))return String(v).replace('Infinity','∞').replace('-Infinity','−∞');const s=(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',');return s.replace(/^-/,'−');};
  const W=['uyudu','kaçtı','havladı','mor'],COL=['#46c46a','#f0a032','#3a7afe','#e06a6a'];
  const softmax=(z,T)=>{T=T||1;const m=Math.max(...z),e=z.map(v=>Math.exp((v-m)/T)),s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s);};
  const ent=p=>-p.reduce((a,v)=>a+(v>0?v*Math.log(v):0),0);
  const bar=(v,col)=>'<span style="display:inline-block;height:10px;border-radius:3px;background:'+col+';width:'+Math.max(2,Math.round(150*v))+'px;vertical-align:middle"></span>';

  /* ============ Örnek 1 ============ */
  const h1=$('smEx1');
  if(h1){
    const SAY=[6,3,1,0],N=10,FR=SAY.map(c=>c/N),LR=0.5,MAXEP=1500;
    let z=[0,0,0,0],ep=0,loss=null,timer=null;
    const kayip=z=>{const p=softmax(z);return -SAY.reduce((a,c,i)=>a+(c?c*Math.log(p[i]):0),0)/N;};
    const H=ent(FR);
    h1.innerHTML='<div class="rex-grid"><div class="rex-ctl">'+
      '<table class="rex-tbl"><tr><th>aday</th><th>10 cümlede gelen</th><th>gerçek oran</th></tr>'+W.map((w,i)=>'<tr><td><b>'+w+'</b></td><td>'+SAY[i]+' kez</td><td>'+fm(FR[i],2)+'</td></tr>').join('')+'</table>'+
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:10px 0"><button class="rex-btn" id="s1Go">▶ eğit (otomatik)</button><button class="rex-btn" id="s1Pause">⏸</button><button class="rex-btn" id="s1S1">🔧 +1 epoch</button><button class="rex-btn" id="s1S10">+10</button><button class="rex-btn" id="s1S100">+100</button><button class="rex-btn" id="s1Fast">⚡ bitir (1500)</button><button class="rex-btn" id="s1Rst">↺ başa dön</button></div>'+
      '<div class="rex-stat" id="s1Stat"></div></div>'+
      '<div><div style="font-size:12.5px;color:#ccd5e8;margin-bottom:4px"><b>Modelin olasılıkları</b> (renkli çubuk) <b>ve gerçek oran</b> (açık çubuk)</div><div id="s1Bars"></div><div class="work" id="s1Work" style="margin-top:8px;white-space:pre-wrap;line-height:1.8"></div></div></div>';
    const draw=()=>{
      const p=softmax(z);loss=kayip(z);
      $('s1Bars').innerHTML='<table class="rex-tbl">'+W.map((w,i)=>'<tr><td><b>'+w+'</b></td><td>'+bar(p[i],COL[i])+'<br>'+bar(FR[i],'rgba(255,255,255,.28)')+'</td><td><b>'+fm(p[i],3)+'</b><br><span style="color:var(--muted)">'+fm(FR[i],2)+'</span></td></tr>').join('')+'</table>';
      const g=p.map((v,i)=>v-FR[i]);
      $('s1Work').innerHTML='skorlar z = ('+z.map(v=>fm(v,2)).join(', ')+')\ngradyan p − y = ('+g.map(v=>fm(v,3)).join(', ')+')   ← her epoch: z := z − 0,5·(p − y)';
      $('s1Stat').innerHTML='epoch <b>'+ep+'</b> / '+MAXEP+' · kayıp <b>'+fm(loss,3)+'</b> · en düşük olası kayıp (verinin entropisi) <b>'+fm(H,3)+'</b>';
      window.__smEx1={ep,z:z.slice(),p,loss};
    };
    const epoch=()=>{const p=softmax(z);z=z.map((v,i)=>v-LR*(p[i]-FR[i]));ep++;};
    const stop=()=>{if(timer){cancelAnimationFrame(timer);timer=null;}};
    const loop=()=>{if(ep>=MAXEP){stop();draw();return;}for(let i=0;i<10&&ep<MAXEP;i++)epoch();draw();timer=requestAnimationFrame(loop);};
    const stepN=n=>()=>{stop();for(let i=0;i<n&&ep<MAXEP;i++)epoch();draw();};
    $('s1Go').onclick=()=>{if(!timer&&ep<MAXEP)timer=requestAnimationFrame(loop);};$('s1Pause').onclick=stop;
    $('s1S1').onclick=stepN(1);$('s1S10').onclick=stepN(10);$('s1S100').onclick=stepN(100);
    $('s1Fast').onclick=()=>{stop();while(ep<MAXEP)epoch();draw();};
    $('s1Rst').onclick=()=>{stop();z=[0,0,0,0];ep=0;loss=null;draw();};
    draw();
  }

  /* ============ Örnek 2 ============ */
  const h2=$('smEx2');
  if(h2){
    const Z=[2.0,1.0,-0.5,-2.0],TS=[0.2,0.5,1,2,5];let sel=2;
    const lcg=s=>()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};
    let rows='<tr><th>T</th>'+W.map(w=>'<th>'+w+'</th>').join('')+'<th>belirsizlik (entropi)</th></tr>';
    TS.forEach(T=>{const p=softmax(Z,T);rows+='<tr data-t="'+T+'" style="cursor:pointer"><td><b>'+fm(T,1)+'</b></td>'+p.map(v=>'<td>'+fm(v,3)+'</td>').join('')+'<td>'+fm(ent(p),2)+'</td></tr>';});
    h2.innerHTML='<div style="font-size:12.5px;color:#ccd5e8;margin-bottom:6px">Aynı skorlar z = (2,0; 1,0; −0,5; −2,0), farklı sıcaklıklar. Bir satıra tıkla → o T ile <b>1000 kez</b> kelime çek (sabit tohumlu, her seferinde aynı sonuç).</div>'+
      '<table class="rex-tbl" id="s2T">'+rows+'</table><div class="work" id="s2R" style="margin-top:8px;white-space:pre-wrap;line-height:1.8"></div><div class="callout" id="s2C" style="margin-top:8px"></div>';
    const run=T=>{
      const p=softmax(Z,T),r=lcg(12345),c=[0,0,0,0];
      for(let k=0;k<1000;k++){const u=r();let a=0,j=0;for(;j<4;j++){a+=p[j];if(u<a)break;}c[Math.min(j,3)]++;}
      $('s2R').innerHTML='<b>T = '+fm(T,1)+'</b> ile 1000 çekiliş:\n'+W.map((w,i)=>(w+'        ').slice(0,9)+' çekilen <b>'+c[i]+'</b>  ·  beklenen '+fm(p[i]*1000,0)).join('\n');
      $('s2C').innerHTML=T<=0.5?'🧊 <b>Soğuk (T küçük):</b> neredeyse hep aynı kelime ("'+W[c.indexOf(Math.max(...c))]+'") — güvenli, ama tekrarcı; 1000 çekilişte '+c.filter(v=>v>0).length+' farklı kelime.':T>=2?'🔥 <b>Sıcak (T büyük):</b> dağılım düzleşti — "mor" gibi saçma adaylar bile '+c[3]+' kez seçildi. Yaratıcı… ya da anlamsız.':'🌡️ <b>T=1:</b> modelin dürüst dağılımı — çoğunlukla "uyudu", ara sıra "kaçtı", nadiren diğerleri.';
      h2.querySelectorAll('tr[data-t]').forEach(tr=>tr.style.background=(+tr.dataset.t===T)?'rgba(70,196,106,.14)':'');
      window.__smEx2={T,c,p};
    };
    h2.querySelectorAll('tr[data-t]').forEach(tr=>tr.onclick=()=>{sel=+tr.dataset.t;run(sel);});
    run(TS[sel]);
  }

  /* ============ Örnek 3 ============ */
  const h3=$('smEx3');
  if(h3){
    h3.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin-bottom:8px">'+
      [0,1,2].map(i=>'<label style="display:flex;gap:6px;align-items:center;font-size:13px">z<sub>'+(i+1)+'</sub> <input type="number" id="s3z'+i+'" step="1" value="'+[2,1,-2][i]+'" style="width:84px"></label>').join('')+
      '<button class="rex-btn" id="s3a">🧪 negatif skor [2, 1, −2]</button><button class="rex-btn" id="s3b">💥 dev skorlar [1000, 1001, 1002]</button><button class="rex-btn" id="s3c">🎯 normal [2, 1, 0,1]</button></div>'+
      '<table class="rex-tbl" id="s3T"></table><div class="callout" id="s3C" style="margin-top:8px"></div>';
    const upd=()=>{
      const z=[0,1,2].map(i=>parseFloat($('s3z'+i).value)||0);
      const S=z.reduce((a,b)=>a+b,0),naif=z.map(v=>v/S);
      const e=z.map(Math.exp),Se=e.reduce((a,b)=>a+b,0),ham=e.map(v=>v/Se),st=softmax(z);
      const bad=a=>a.some(v=>!isFinite(v)||v<0||v>1);
      const cell=a=>a.map(v=>fm(v,4)).join(' · ');
      $('s3T').innerHTML='<tr><th>yöntem</th><th>çıktı</th><th>toplam</th><th>geçerli olasılık mı?</th></tr>'+
        [['1) Naif oranlama: z<sub>i</sub> / Σz',naif],['2) Ham softmax: e<sup>z</sup> / Σe<sup>z</sup>',ham],['3) Kararlı softmax: e<sup>z−max</sup> / Σe<sup>z−max</sup>',st]].map(([n,a])=>{const b=bad(a);return '<tr><td>'+n+'</td><td>'+cell(a)+'</td><td>'+fm(a.reduce((x,y)=>x+y,0),3)+'</td><td>'+(b?'❌ hayır':'✅ evet')+'</td></tr>';}).join('');
      const b1=bad(naif),b2=bad(ham);
      $('s3C').innerHTML=(b1?'📛 <b>Naif oranlama çöktü:</b> negatif skor negatif "olasılık" verdi ya da toplam 0 oldu. ':'')+(b2?'💥 <b>Ham e<sup>z</sup> taştı:</b> e<sup>'+Math.max(...z)+'</sup> bilgisayarın sayı sınırını aşıyor (∞), ∞/∞ = NaN. ':'')+(!b1&&!b2?'✅ Bu skorlarda üçü de çalışıyor — ama negatif ya da çok büyük skor deneyip kırılma noktalarını gör. ':'')+'<br><b>Çare:</b> her skordan en büyüğünü çıkar. Softmax\'in sonucu değişmez (pay ve paydadaki e<sup>−max</sup> sadeleşir) ama en büyük terim e<sup>0</sup> = 1 olur, hiçbir şey taşmaz.';
      window.__smEx3={z,naif,ham,st};
    };
    [0,1,2].forEach(i=>$('s3z'+i).addEventListener('input',upd));
    const set=a=>{a.forEach((v,i)=>$('s3z'+i).value=v);upd();};
    $('s3a').onclick=()=>set([2,1,-2]);$('s3b').onclick=()=>set([1000,1001,1002]);$('s3c').onclick=()=>set([2,1,0.1]);
    upd();
  }
})();
