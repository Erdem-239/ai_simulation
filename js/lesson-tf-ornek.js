// Transformer Bloğu — "7️⃣ Örnek Çalışmalar": (1) N katmanlı ağda gradyan: residual YOK / VAR (ölçerek),
// (2) GPT-2 ağırlıklarını katman katman say (resmî sayılarla aynı çıkar). Python karşılıkları (index.html) ile aynı sayılar.
(function(){
  const $=id=>document.getElementById(id);
  const lcg=s=>{let st=s;return()=>{st=(st*1664525+1013904223)%4294967296;return st/4294967296;};};
  const loc=x=>x.toLocaleString('tr-TR');
  const sci=v=>{const e=Math.floor(Math.log10(Math.abs(v))),m=v/Math.pow(10,e);return m.toFixed(2).replace('.',',')+'·10<sup>'+String(e).replace('-','−')+'</sup>';};
  const D=8;
  function oran(N,res){
    const r=lcg(11),s=0.9/Math.sqrt(D)*Math.sqrt(3),Ws=[];
    for(let l=0;l<N;l++)Ws.push(Array.from({length:D},()=>Array.from({length:D},()=>(r()*2-1)*s)));
    const r2=lcg(99);let x=Array.from({length:D},()=>r2()*2-1);const pre=[];
    for(const W of Ws){const u=W.map(row=>row.reduce((a,v,j)=>a+v*x[j],0));pre.push(u);const f=u.map(Math.tanh);x=res?x.map((v,i)=>v+f[i]):f;}
    let g=Array(D).fill(1);const g0=Math.sqrt(D);
    for(let l=N-1;l>=0;l--){const W=Ws[l],u=pre[l],dt=g.map((gv,i)=>gv*(1-Math.tanh(u[i])*Math.tanh(u[i])));
      const dx=Array.from({length:D},(_,j)=>W.reduce((a,row,i)=>a+row[j]*dt[i],0));g=res?g.map((v,i)=>v+dx[i]):dx;}
    return Math.sqrt(g.reduce((a,v)=>a+v*v,0))/g0;
  }
  const h1=$('tfEx1');
  if(h1){
    h1.innerHTML='<div style="font-size:12.5px;color:#ccd5e8;margin-bottom:8px">Her katman: 8 sayılık vektör × rastgele 8×8 matris → tanh (hafif söndürücü ölçek). İki ağ yan yana: <b>residual yok</b> (x ← F(x)) ve <b>residual var</b> (x ← x + F(x)). Çıkıştaki gradyan (hepsi 1) geri yayılır; <b>girişe ulaşan gradyanın büyüklüğü / çıkıştakine</b> oranı ölçülür.</div><button class="rex-btn" id="te1Go">▶ ölç (5 farklı derinlik)</button><div id="te1Out" style="margin-top:8px"></div><div class="callout" id="te1C" style="margin-top:8px;display:none"></div>';
    $('te1Go').onclick=()=>{
      const rows=[1,5,10,20,50].map(N=>({N,a:oran(N,false),b:oran(N,true)}));
      let h='<table class="rex-tbl"><tr><th>katman sayısı</th><th>❌ residual YOK</th><th>✅ residual VAR</th></tr>';
      rows.forEach(r=>h+='<tr><td><b>'+r.N+'</b></td><td>'+sci(r.a)+'</td><td>'+sci(r.b)+'</td></tr>');
      $('te1Out').innerHTML=h+'</table>';
      const l=rows[rows.length-1];
      $('te1C').style.display='block';
      $('te1C').innerHTML='💡 <b>Sezgi:</b> residual olmadan gradyan katman katman <b>söner</b> (50 katmanda '+sci(l.a)+': giriş neredeyse hiç öğrenemez). Residual ile oran hiç düşmüyor ('+sci(rows[0].b)+' → '+sci(l.b)+'): kestirme yol (türev <b>1 + F\'(x)</b>) gradyanı sönmeden taşıyor. Dürüst not: bu oyuncakta residual gradyanı biraz da <b>büyütüyor</b>; gerçek Transformer\'larda bunu LayerNorm ve küçük başlangıç ağırlıkları dengeler.';
      window.__tfEx1={rows};
    };
  }
  const h2=$('tfEx2');
  if(h2){
    const PRE={'GPT-2 small':[768,3072,12,50257,1024],'GPT-2 medium':[1024,4096,24,50257,1024],'GPT-2 large':[1280,5120,36,50257,1024],'GPT-2 XL':[1600,6400,48,50257,1024]};
    h2.innerHTML='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">'+Object.keys(PRE).map(k=>'<button class="rex-btn te2P" data-p="'+k+'">'+k+'</button>').join('')+'</div>'+
      '<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:13px;margin-bottom:8px">'+[['d','te2d','kelime vektörü d'],['ffn','te2f','FFN ara boyutu'],['blok','te2b','blok sayısı'],['vocab','te2v','sözlük'],['ctx','te2c','bağlam']].map(([n,i,l])=>'<label>'+l+' <input id="'+i+'" type="number" style="width:84px"></label>').join('')+'</div><div id="te2Out"></div><div class="callout" id="te2C" style="margin-top:8px"></div>';
    const set=a=>{['te2d','te2f','te2b','te2v','te2c'].forEach((i,k)=>$(i).value=a[k]);draw();};
    const draw=()=>{
      const d=+$('te2d').value,ffn=+$('te2f').value,blok=+$('te2b').value,vocab=+$('te2v').value,ctx=+$('te2c').value;
      const att=4*(d*d+d),fa=d*ffn+ffn+ffn*d+d,ln=4*d,bb=att+fa+ln,gom=vocab*d+ctx*d,top=blok*bb+gom+2*d;
      $('te2Out').innerHTML='<table class="rex-tbl"><tr><th>attention (W<sub>Q</sub>,W<sub>K</sub>,W<sub>V</sub>,W<sub>O</sub> + bias)</th><td>'+loc(att)+' ('+Math.round(att/bb*100)+'% blok)</td></tr><tr><th>FFN (W<sub>1</sub>,W<sub>2</sub> + bias)</th><td>'+loc(fa)+' ('+Math.round(fa/bb*100)+'% blok)</td></tr><tr><th>LayerNorm (2 adet, γ ve β)</th><td>'+loc(ln)+'</td></tr><tr><th>1 blok</th><td><b>'+loc(bb)+'</b></td></tr><tr><th>'+blok+' blok</th><td>'+loc(blok*bb)+'</td></tr><tr><th>gömme tabloları (token + konum)</th><td>'+loc(gom)+'</td></tr><tr><th>TOPLAM</th><td><b>'+loc(top)+'</b></td></tr></table>';
      $('te2C').innerHTML='💡 Bloğun <b>üçte ikisi FFN</b>, üçte biri attention (FFN ara boyutu 4d olduğunda). Çıkış tablosu gömme tablosuyla <b>paylaşıldığı</b> için ayrıca sayılmadı. GPT-2 small için sonuç <b>124.439.808</b>, resmî sayıyla aynı.';
      window.__tfEx2={att,fa,bb,gom,top};
    };
    h2.querySelectorAll('.te2P').forEach(b=>b.onclick=()=>set(PRE[b.dataset.p]));
    ['te2d','te2f','te2b','te2v','te2c'].forEach(i=>$(i).addEventListener('input',draw));
    set(PRE['GPT-2 small']);
  }
})();

// LayerNorm hesap makinesi (Simülasyon): 4 sayı gir, ortalama/σ/normalize sonucu canlı gör (ε=1e-5, öğrenilen γ ve β ayarlı).
(function(){
  const h=document.getElementById('tfLnSim'); if(!h) return;
  const $=id=>document.getElementById(id);
  const fm=(v,d=3)=>(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',').replace(/^-/,'−');
  const V0=[2.5,-1.0,4.0,0.5];
  h.innerHTML='<div style="font-size:13px;color:#ccd5e8;margin-bottom:8px">Bir kelimenin 4 sayısını yaz (ya da hazır değerleri kullan). LayerNorm ortalamayı çıkarıp σ\'ya böler; γ ve β ile sonra ölçek/kaydırma ekleyebilirsin (modelin öğrendiği iki sayı).</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">'+V0.map((v,i)=>'<input id="ln_v'+i+'" type="number" step="0.5" value="'+v+'" style="width:76px">').join('')+'<label style="font-size:13px">γ <input id="ln_g" type="number" step="0.1" value="1" style="width:64px"></label><label style="font-size:13px">β <input id="ln_b" type="number" step="0.1" value="0" style="width:64px"></label></div><div class="work" id="ln_out" style="white-space:pre-wrap;line-height:1.9;font-size:12.5px"></div>';
  const draw=()=>{
    const v=[0,1,2,3].map(i=>parseFloat($('ln_v'+i).value)||0),g=parseFloat($('ln_g').value),b=parseFloat($('ln_b').value),gg=isNaN(g)?1:g,bb=isNaN(b)?0:b;
    const mu=v.reduce((a,c)=>a+c,0)/4,va=v.reduce((a,c)=>a+(c-mu)*(c-mu),0)/4,s=Math.sqrt(va+1e-5),n=v.map(a=>(a-mu)/s),o=n.map(a=>gg*a+bb);
    const nm=n.reduce((a,c)=>a+c,0)/4,ns=Math.sqrt(n.reduce((a,c)=>a+(c-nm)*(c-nm),0)/4);
    $('ln_out').innerHTML='ham vektör      = ('+v.map(a=>fm(a,2)).join(' ; ')+')\nortalama μ      = '+fm(mu,3)+'\nvaryans σ²      = '+fm(va,3)+'  →  σ = '+fm(s,3)+'\nnormalize       = (z−μ)/σ = ('+n.map(a=>fm(a,2)).join(' ; ')+')   ← ortalama '+fm(nm,3)+', std '+fm(ns,3)+'\nγ·n+β çıktısı   = ('+o.map(a=>fm(a,2)).join(' ; ')+')'+(va<1e-6?'\n⚠️ Dört sayı eşit: σ≈0, normalize sonucu 0 (ε bölmeyi korur).':'');
    window.__tfLn={v,mu,va,n,o};
  };
  ['ln_v0','ln_v1','ln_v2','ln_v3','ln_g','ln_b'].forEach(i=>$(i).addEventListener('input',draw));draw();
})();
