// Self-Attention — "7️⃣ Örnek Çalışmalar / Örnek 2": √d ölçeğini ölçerek gör.
// Rastgele q ve 5 k (her sayı varyans 1), d ∈ {4,16,64,256}; 2000 denemede ham skor yayılımı ve softmax keskinliği,
// √d ile bölünmüş/bölünmemiş. Python karşılığı (index.html'deki kod kutusu) aynı LCG ile birebir aynı sayıları verir.
(function(){
  const host=document.getElementById('attEx2'); if(!host) return;
  const $=id=>document.getElementById(id);
  const fm=(v,d=2)=>v.toFixed(d).replace('.',',');
  const lcg=s=>{let st=s;return()=>{st=(st*1664525+1013904223)%4294967296;return st/4294967296;};};
  const softmax=z=>{const m=Math.max(...z),e=z.map(v=>Math.exp(v-m)),s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s);};
  const N=5,TR=2000,DS=[4,16,64,256];
  function run(d,scale){
    const r=lcg(7+d);let mx=0,keskin=0,ent=0,sd=0;const c=Math.sqrt(3);
    for(let n=0;n<TR;n++){
      const q=[];for(let i=0;i<d;i++)q.push((r()*2-1)*c);
      let sc=[];
      for(let j=0;j<N;j++){let s=0;for(let i=0;i<d;i++){const k=(r()*2-1)*c;s+=q[i]*k;}sc.push(s);}
      if(scale)sc=sc.map(v=>v/Math.sqrt(d));
      const mean=sc.reduce((a,b)=>a+b,0)/N;sd+=Math.sqrt(sc.reduce((a,v)=>a+(v-mean)*(v-mean),0)/N);
      const p=softmax(sc),m=Math.max(...p);mx+=m;if(m>0.99)keskin++;ent+=-p.reduce((a,v)=>a+(v>0?v*Math.log(v):0),0);
    }
    return {sd:sd/TR,mx:mx/TR,kes:keskin/TR,ent:ent/TR};
  }
  const bar=(v,col)=>'<span style="display:inline-block;height:9px;border-radius:3px;background:'+col+';width:'+Math.max(2,Math.round(110*v))+'px;vertical-align:middle"></span>';
  host.innerHTML='<div style="font-size:12.5px;color:#ccd5e8;margin-bottom:8px">Her denemede rastgele bir <b>q</b> ve 5 rastgele <b>k</b> (d sayılık, her sayı ortalama 0 / varyans 1). Skor = q·k. 2000 deneme yapılır; tabloda ortalamalar var. <b>ort. en büyük yüzde</b> = softmax\'in en çok baktığı yere verdiği pay (5 anahtarda ideal "belirsiz" durum %20, tamamen kilitlenmiş %100).</div>'+
    '<div style="display:flex;gap:8px;margin:8px 0"><button class="rex-btn" id="ae2Go">▶ ölç (2000 deneme × 4 boyut)</button></div><div id="ae2Out"></div><div class="callout" id="ae2C" style="margin-top:8px;display:none"></div>';
  $('ae2Go').onclick=()=>{
    const rows=DS.map(d=>({d,a:run(d,false),b:run(d,true)}));
    let h='<table class="rex-tbl"><tr><th rowspan="2">d</th><th colspan="4">ölçeksiz (q·k)</th><th colspan="4">√d ile bölünmüş</th></tr><tr><th>skor yayılımı</th><th>ort. en büyük yüzde</th><th>%99+ kilitlenen</th><th>entropi</th><th>skor yayılımı</th><th>ort. en büyük yüzde</th><th>%99+ kilitlenen</th><th>entropi</th></tr>';
    rows.forEach(r=>{h+='<tr><td><b>'+r.d+'</b></td><td>'+fm(r.a.sd)+'</td><td>'+fm(r.a.mx,3)+'<br>'+bar(r.a.mx,'#e06a6a')+'</td><td>%'+fm(r.a.kes*100,1)+'</td><td>'+fm(r.a.ent,3)+'</td><td>'+fm(r.b.sd)+'</td><td>'+fm(r.b.mx,3)+'<br>'+bar(r.b.mx,'#46c46a')+'</td><td>%'+fm(r.b.kes*100,1)+'</td><td>'+fm(r.b.ent,3)+'</td></tr>';});
    $('ae2Out').innerHTML=h+'</table>';
    const last=rows[rows.length-1];
    $('ae2C').style.display='block';
    $('ae2C').innerHTML='💡 <b>Sezgi:</b> ölçeksiz skorların yayılımı <b>√d ile büyür</b> ('+fm(rows[0].a.sd)+' → '+fm(last.a.sd)+'); d='+last.d+'\'da softmax denemelerin <b>%'+fm(last.a.kes*100,0)+'\'inde</b> tek anahtara %99\'dan fazla kilitleniyor — dikkat <b>keskinleşiyor, gradyan sönüyor</b> (softmax doyması). √d ile bölünce skor yayılımı d\'den bağımsız ≈ '+fm(last.b.sd)+' kalıyor ve dikkat ılık (entropi ≈ '+fm(last.b.ent,2)+', ln5 = 1,61).';
    window.__attEx2={rows};
  };
})();
