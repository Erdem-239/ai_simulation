// Kelime Temsili — "7️⃣ Örnek Çalışmalar": (1) skip-gram'ı KENDİ KENDİNE eğit: 6 kelime, 2 boyutlu vektörler, "yan yana geçen kelimeler yaklaşsın",
// (2) one-hot ve öğrenilmiş embedding'i yan yana kıyasla, (3) gömme tablosu = "one-hot × matris". Python karşılığı ile aynı sayıları üretir.
(function(){
  const $=id=>document.getElementById(id);
  const fm=(v,d=3)=>{const s=(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',');return s.replace(/^-/,'−');};
  const WD=['kedi','köpek','kral','kraliçe','elma','armut'],CD=['uyudu','koştu','yönetti','tahtta','tatlı','taze'];
  const GC=['#46c46a','#f0a032','#3a7afe'];
  const PAIRS=[];for(let i=0;i<6;i++)for(let j=0;j<6;j++)if(Math.floor(i/2)===Math.floor(j/2))PAIRS.push([i,j]);
  const SEED=1,LR=1.0,SC=0.3,MAXEP=500;
  const lcg=s=>()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};
  const softmax=z=>{const m=Math.max(...z),e=z.map(v=>Math.exp(v-m)),s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s);};
  const cos=(a,b)=>{const d=a[0]*b[0]+a[1]*b[1];return d/(Math.hypot(a[0],a[1])*Math.hypot(b[0],b[1]));};
  function init(){const r=lcg(SEED),W=[],C=[];for(let i=0;i<6;i++)W.push([(r()-.5)*2*SC,(r()-.5)*2*SC]);for(let i=0;i<6;i++)C.push([(r()-.5)*2*SC,(r()-.5)*2*SC]);return {W,C};}
  function epoch(st){
    const {W,C}=st,n=PAIRS.length,gW=W.map(()=>[0,0]),gC=C.map(()=>[0,0]);
    PAIRS.forEach(([i,j])=>{
      const s=C.map(c=>W[i][0]*c[0]+W[i][1]*c[1]),p=softmax(s);
      for(let k=0;k<6;k++){const dk=p[k]-(k===j?1:0);for(let d=0;d<2;d++){gW[i][d]+=dk*C[k][d]/n;gC[k][d]+=dk*W[i][d]/n;}}
    });
    for(let i=0;i<6;i++)for(let d=0;d<2;d++){W[i][d]-=LR*gW[i][d];C[i][d]-=LR*gC[i][d];}
  }
  function loss(st){let l=0;PAIRS.forEach(([i,j])=>{const p=softmax(st.C.map(c=>st.W[i][0]*c[0]+st.W[i][1]*c[1]));l-=Math.log(p[j])/PAIRS.length;});return l;}
  const trained=(()=>{const st=init();for(let e=0;e<MAXEP;e++)epoch(st);return st;})();
  window.__embLab={init,epoch,loss,PAIRS,WD,CD,softmax,cos,MAXEP};

  /* ============ Örnek 1 ============ */
  const h1=$('embEx1');
  if(h1){
    let st=init(),ep=0,timer=null;const W0=st.W.map(r=>r.slice());
    h1.innerHTML='<div class="rex-grid"><div class="rex-ctl">'+
      '<div style="font-size:12.5px;color:#ccd5e8;margin-bottom:6px"><b>Eğitim verisi — komşuluk çiftleri</b> (kelime → yanında gördüğü kelime):</div>'+
      '<table class="rex-tbl"><tr><th>kelime</th><th>yanında gördüğü</th></tr>'+[0,1,2].map(g=>'<tr><td style="color:'+GC[g]+'"><b>'+WD[2*g]+', '+WD[2*g+1]+'</b></td><td>'+CD[2*g]+', '+CD[2*g+1]+'</td></tr>').join('')+'</table>'+
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:10px 0"><button class="rex-btn" id="e1Go">▶ eğit (otomatik)</button><button class="rex-btn" id="e1Pause">⏸</button><button class="rex-btn" id="e1S1">🔧 +1 epoch</button><button class="rex-btn" id="e1S10">+10</button><button class="rex-btn" id="e1S100">+100</button><button class="rex-btn" id="e1Fast">⚡ bitir (500)</button><button class="rex-btn" id="e1Rst">↺ başa dön</button></div>'+
      '<div class="rex-stat" id="e1Stat"></div><table class="rex-tbl" id="e1Cos" style="margin-top:8px"></table></div>'+
      '<div><div style="font-size:12.5px;color:#ccd5e8;margin-bottom:4px"><b>2 boyutlu kelime uzayı</b> — soluk nokta: başlangıç, dolu nokta: şimdi</div><svg id="e1Svg" viewBox="0 0 360 330" style="width:100%;max-width:400px"></svg></div></div>';
    const draw=()=>{
      const mx=Math.max(1,...st.W.map(r=>Math.max(Math.abs(r[0]),Math.abs(r[1]))),...W0.map(r=>Math.max(Math.abs(r[0]),Math.abs(r[1]))))*1.15;
      const X=v=>180+v/mx*150,Y=v=>165-v/mx*145;
      let s='<line x1="20" y1="165" x2="340" y2="165" stroke="#334063"/><line x1="180" y1="10" x2="180" y2="320" stroke="#334063"/>';
      WD.forEach((w,i)=>{const g=Math.floor(i/2);
        s+='<circle cx="'+X(W0[i][0])+'" cy="'+Y(W0[i][1])+'" r="4" fill="'+GC[g]+'" opacity=".28"/><line x1="'+X(W0[i][0])+'" y1="'+Y(W0[i][1])+'" x2="'+X(st.W[i][0])+'" y2="'+Y(st.W[i][1])+'" stroke="'+GC[g]+'" opacity=".3" stroke-dasharray="3 3"/>'+
        '<circle cx="'+X(st.W[i][0])+'" cy="'+Y(st.W[i][1])+'" r="6" fill="'+GC[g]+'"/><text x="'+(X(st.W[i][0])+9)+'" y="'+(Y(st.W[i][1])+4)+'" font-size="12" fill="#ccd5e8">'+w+'</text>';});
      $('e1Svg').innerHTML=s;
      const pr=[[0,1],[2,3],[4,5],[0,2],[0,4],[2,4]];
      $('e1Cos').innerHTML='<tr><th>çift</th><th>cosine</th><th></th></tr>'+pr.map(([a,b],k)=>{const c=cos(st.W[a],st.W[b]);return '<tr><td>'+WD[a]+' ~ '+WD[b]+' '+(k<3?'<span style="color:var(--green)">(aynı grup)</span>':'<span style="color:var(--muted)">(farklı grup)</span>')+'</td><td><b>'+fm(c,2)+'</b></td><td>'+(c>0.9?'🟢 komşu':c<-0.2?'🔴 uzak':'⚪')+'</td></tr>';}).join('');
      const L=loss(st);
      $('e1Stat').innerHTML='epoch <b>'+ep+'</b> / '+MAXEP+' · kayıp <b>'+fm(L,3)+'</b> (en düşük olası ≈ '+fm(Math.log(2),3)+': her kelimenin 2 eşit olası komşusu var)';
      window.__embEx1={ep,W:st.W.map(r=>r.slice()),loss:L};
    };
    const stop=()=>{if(timer){cancelAnimationFrame(timer);timer=null;}};
    const loop=()=>{if(ep>=MAXEP){stop();draw();return;}for(let i=0;i<4&&ep<MAXEP;i++){epoch(st);ep++;}draw();timer=requestAnimationFrame(loop);};
    const stepN=n=>()=>{stop();for(let i=0;i<n&&ep<MAXEP;i++){epoch(st);ep++;}draw();};
    $('e1Go').onclick=()=>{if(!timer&&ep<MAXEP)timer=requestAnimationFrame(loop);};$('e1Pause').onclick=stop;
    $('e1S1').onclick=stepN(1);$('e1S10').onclick=stepN(10);$('e1S100').onclick=stepN(100);
    $('e1Fast').onclick=()=>{stop();while(ep<MAXEP){epoch(st);ep++;}draw();};
    $('e1Rst').onclick=()=>{stop();st=init();ep=0;draw();};
    draw();
  }

  /* ============ Örnek 2 ============ */
  const h2=$('embEx2');
  if(h2){
    const oh=(i)=>WD.map((_,k)=>k===i?1:0);
    const tab=(title,f)=>'<div style="flex:1 1 300px"><div style="font-size:12.5px;color:#ccd5e8;margin-bottom:4px"><b>'+title+'</b></div><table class="rex-tbl"><tr><th></th>'+WD.map(w=>'<th>'+w.slice(0,4)+'</th>').join('')+'</tr>'+WD.map((a,i)=>'<tr><td><b>'+a+'</b></td>'+WD.map((b,j)=>{const v=f(i,j);return '<td style="'+(i!==j&&v>0.9?'background:rgba(70,196,106,.22)':'')+'">'+fm(v,2)+'</td>';}).join('')+'</tr>').join('')+'</table></div>';
    h2.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:16px">'+tab('One-hot: benzerlik (cosine)',(i,j)=>i===j?1:0)+tab('Öğrenilmiş embedding: benzerlik (cosine)',(i,j)=>cos(trained.W[i],trained.W[j]))+'</div>'+
      '<table class="rex-tbl" style="margin-top:10px"><tr><th>sözlük boyutu V=50.000, vektör boyutu D=300</th><th>one-hot</th><th>embedding</th></tr><tr><td>bir kelimeyi temsil eden sayı adedi</td><td>50.000 (49.999\'u sıfır)</td><td>300 (hepsi anlamlı)</td></tr><tr><td>bütün tablo (parametre sayısı)</td><td>— (öğrenilecek bir şey yok)</td><td>50.000 × 300 = <b>15.000.000</b></td></tr><tr><td>"kedi" ile "köpek" benzerliği</td><td>0 (dik)</td><td>yüksek (bağlamları ortak)</td></tr></table>'+
      '<div class="callout" style="margin-top:8px">📌 Soldaki tablo <b>boş bir köşegen</b>: one-hot\'ta her kelime kendisiyle 1, diğer herkesle 0 — "kedi" ile "köpek" de, "kedi" ile "kral" da bilgisayara göre <b>eşit derecede alakasız</b>. Sağdaki tabloda aynı grubun kelimeleri <b>1,00</b> (yeşil), farklı gruplar <b>−0,5</b> civarı. Aradaki fark, 500 epoch\'luk komşu tahmininden geldi.</div>';
  }

  /* ============ Örnek 3 ============ */
  const h3=$('embEx3');
  if(h3){
    let sel=0;
    h3.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px" id="e3B">'+WD.map((w,i)=>'<button class="rex-btn" data-i="'+i+'">'+w+'</button>').join('')+'</div><div id="e3T"></div><div class="work" id="e3W" style="margin-top:8px;white-space:pre-wrap;line-height:1.8"></div>';
    const draw=()=>{
      const E=trained.W;
      h3.querySelectorAll('#e3B button').forEach(b=>b.style.outline=(+b.dataset.i===sel)?'2px solid #46c46a':'none');
      $('e3T').innerHTML='<table class="rex-tbl"><tr><th>one-hot satırı</th><th></th><th>gömme matrisi E (6×2)</th></tr>'+
        '<tr><td rowspan="6" style="vertical-align:middle">['+WD.map((_,k)=>k===sel?'<b style="color:var(--green)">1</b>':'0').join(', ')+']</td><td rowspan="6" style="vertical-align:middle">×</td><td>'+WD.map((w,i)=>'<span style="display:block;'+(i===sel?'background:rgba(70,196,106,.22);font-weight:700':'color:var(--muted)')+'">'+w+' = ('+fm(E[i][0],2)+'; '+fm(E[i][1],2)+')</span>').join('')+'</td></tr></table>';
      const v=E[sel];
      $('e3W').innerHTML='sonuç = '+WD.map((_,k)=>(k===sel?'1':'0')+'·E['+(k+1)+']').join(' + ')+'\n       = '+WD.map((_,k)=>k===sel?'('+fm(E[k][0],2)+'; '+fm(E[k][1],2)+')':'0').join(' + ')+'\n       = <b>('+fm(v[0],2)+'; '+fm(v[1],2)+')</b>   ← <b>'+WD[sel]+'</b> kelimesinin vektörü\n\n💡 5 satır sıfırla çarpılıp toplandı, geriye <b>tek bir satır</b> kaldı. Bu yüzden gerçekte matris çarpımı yapılmaz: kelimenin numarasıyla <b>tablodan doğrudan o satır okunur</b> (lookup). Sonuç aynı, hesap 50.000 kat ucuz.';
      window.__embEx3={sel,v};
    };
    h3.querySelectorAll('#e3B button').forEach(b=>b.onclick=()=>{sel=+b.dataset.i;draw();});
    draw();
  }
  window.__embTrained=trained;
})();
