// Neural Network — ağın RESMİ: katman/nöron/ağırlık diyagramı (window.nnNetSvg), tek nöron anatomisi,
// "Kendi ağını kur" aracı, gerçek ölçek (784-128-64-10), Simülasyon'da canlı ağ + karar haritası,
// Simülasyon kısmı ayrı dosyada: js/lesson-nn-sim.js.
(function(){
  const $=id=>document.getElementById(id);
  const sig=z=>1/(1+Math.exp(-z));
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const fm=(v,d=2)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const mix=(a,b,t)=>{t=Math.max(0,Math.min(1,t));const h=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));const A=h(a),B=h(b);return '#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join('');};

  /* ================= genel çizici =================
     spec: {layers:[2,2,1], labels:[[...],[...],[...]], W:[W1,W2] (W[l][j][i]), B:[[b..],[b..]], act:[[..],[..],[..]]|null,
            titles:[..], showW:bool, showB:bool, flow:bool, ellipsis:{layerIndex:true}, W_:width, H_:height, maxShow:8}  */
  window.nnNetSvg=function(spec){
    const L=spec.layers,n=L.length,Wd=spec.width||640,Ht=spec.height||(Math.max(...L.map(v=>Math.min(v,spec.maxShow||8)))*58+90);
    const trunc=L.some((v,i)=>v>(spec.showN?spec.showN[i]:(spec.maxShow||8)));
    const px=i=>n===1?Wd/2:70+(Wd-140)*i/(n-1);
    const shown=L.map((v,i)=>Math.min(v,spec.showN?spec.showN[i]:(spec.maxShow||8)));
    const avail=Ht-(trunc?118:80),py=(i,j)=>{const m=shown[i],gap=Math.min(62,avail/Math.max(m,1));return 36+avail/2-(m-1)*gap/2+j*gap;};
    let s='',nodes='';
    // bağlantılar
    for(let l=0;l<n-1;l++){
      for(let j=0;j<shown[l+1];j++)for(let i=0;i<shown[l];i++){
        const w=spec.W&&spec.W[l]&&spec.W[l][j]?spec.W[l][j][i]:0;
        const col=w>=0?'#5aa0e0':'#e06a6a',wd=spec.W?Math.max(0.5,Math.min(6,0.6+Math.abs(w)*(spec.edgeScale||0.35))):1.2;
        const x1=px(l)+17,y1=py(l,i),x2=px(l+1)-17,y2=py(l+1,j);
        s+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(spec.W?col:'#44507a')+'" stroke-width="'+wd.toFixed(2)+'" stroke-opacity="'+(spec.W?(0.35+Math.min(0.55,Math.abs(w)*0.04)):0.7)+'"'+(spec.flow?' class="nn-edge-flow"':'')+'/>';
        if(spec.showW&&spec.W){const tx=x1+(x2-x1)*(0.28+0.1*((i+j)%2)),ty=y1+(y2-y1)*(0.28+0.1*((i+j)%2));s+='<text x="'+tx+'" y="'+(ty-3)+'" text-anchor="middle" font-size="10" fill="'+col+'" paint-order="stroke" stroke="#0d1426" stroke-width="3">'+fm(w,1)+'</text>';}
      }
    }
    // nöronlar
    for(let l=0;l<n;l++){
      for(let j=0;j<shown[l];j++){
        const a=spec.act&&spec.act[l]?spec.act[l][j]:null,x=px(l),y=py(l,j);
        const fill=a===null||a===undefined?'#1a2238':mix('#1a2238','#f0a032',a);
        const stroke=l===0?'#4ad0e0':l===n-1?'#46c46a':'#f0a032';
        nodes+='<circle cx="'+x+'" cy="'+y+'" r="17" fill="'+fill+'" stroke="'+stroke+'" stroke-width="2.2"/>';
        const lab=spec.labels&&spec.labels[l]&&spec.labels[l][j]?spec.labels[l][j]:'';
        nodes+='<text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" font-size="12" fill="#fff" font-weight="700" paint-order="stroke" stroke="#0d1426" stroke-width="2.5">'+lab+'</text>';
        if(a!==null&&a!==undefined)nodes+='<text x="'+x+'" y="'+(y+31)+'" text-anchor="middle" font-size="10.5" fill="#ccd5e8">'+fm(a,l===0?0:3)+'</text>';
        if(spec.showB&&l>0&&spec.B&&spec.B[l-1])nodes+='<text x="'+x+'" y="'+(y-22)+'" text-anchor="middle" font-size="10" fill="#9aa8cc">b='+fm(spec.B[l-1][j],1)+'</text>';
      }
      if(L[l]>shown[l]){const y=py(l,shown[l]-1)+34;nodes+='<text x="'+px(l)+'" y="'+y+'" text-anchor="middle" font-size="18" fill="#95a2c2">⋮</text><text x="'+px(l)+'" y="'+(y+14)+'" text-anchor="middle" font-size="10" fill="#95a2c2">(toplam '+L[l]+')</text>';}
      if(spec.titles&&spec.titles[l])nodes+='<text x="'+px(l)+'" y="'+(Ht-8)+'" text-anchor="middle" font-size="11.5" fill="#95a2c2">'+spec.titles[l]+'</text>';
    }
    return s+nodes;
  };
  const put=(id,spec)=>{const e=$(id);if(!e)return;const w=spec.width||640,h=spec.height||(Math.max(...spec.layers.map(v=>Math.min(v,spec.maxShow||8)))*58+90);e.setAttribute('viewBox','0 0 '+w+' '+h);e.innerHTML=window.nnNetSvg(spec);};

  /* ================= 1) Giriş: ağın kendisi (akışlı) ================= */
  put('nnHeroNet',{layers:[2,2,1],labels:[['x₁','x₂'],['h₁','h₂'],['ŷ']],W:[[[20,20],[20,20]],[[20,-20]]],B:[[-10,-30],[-10]],titles:['girdi katmanı','gizli katman','çıktı katmanı'],showW:true,showB:true,flow:true,width:560,height:230,edgeScale:0.12});

  put('nnArchSvg',{layers:[2,2,1],labels:[['x₁','x₂'],['h₁','h₂'],['ŷ']],W:[[[20,20],[20,20]],[[20,-20]]],B:[[-10,-30],[-10]],titles:['girdi (2)','gizli (2) · W⁽¹⁾: 2×2','çıktı (1) · W⁽²⁾: 1×2'],showW:true,showB:true,width:560,height:230,edgeScale:0.12});

  /* ================= 2) Tek nöron anatomisi (statik, sayılı) ================= */
  (function(){
    const e=$('nnNeuronAnat');if(!e)return;
    const x1=1,x2=0,w1=20,w2=20,b=-10,z=w1*x1+w2*x2+b,a=sig(z);
    let s='<defs><marker id="nnAn" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#95a2c2"/></marker></defs>';
    const box=(x,y,w,h,t1,t2,col)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="9" fill="#14203a" stroke="'+col+'" stroke-width="2"/><text x="'+(x+w/2)+'" y="'+(y+h/2-(t2?3:-4))+'" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">'+t1+'</text>'+(t2?'<text x="'+(x+w/2)+'" y="'+(y+h/2+14)+'" text-anchor="middle" font-size="11" fill="#ccd5e8">'+t2+'</text>':'');
    s+='<circle cx="50" cy="55" r="22" fill="#12333a" stroke="#4ad0e0" stroke-width="2"/><text x="50" y="52" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">x₁</text><text x="50" y="66" text-anchor="middle" font-size="11" fill="#ccd5e8">= '+x1+'</text>';
    s+='<circle cx="50" cy="145" r="22" fill="#12333a" stroke="#4ad0e0" stroke-width="2"/><text x="50" y="142" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">x₂</text><text x="50" y="156" text-anchor="middle" font-size="11" fill="#ccd5e8">= '+x2+'</text>';
    s+='<line x1="74" y1="55" x2="196" y2="92" stroke="#95a2c2" stroke-width="2" marker-end="url(#nnAn)"/><text x="125" y="62" font-size="12" fill="#5aa0e0" font-weight="700">× w₁ = '+w1+'</text>';
    s+='<line x1="74" y1="145" x2="196" y2="108" stroke="#95a2c2" stroke-width="2" marker-end="url(#nnAn)"/><text x="125" y="146" font-size="12" fill="#5aa0e0" font-weight="700">× w₂ = '+w2+'</text>';
    s+=box(200,72,84,56,'Σ','toplar: '+(w1*x1+w2*x2),'#f0a032');
    s+='<line x1="284" y1="100" x2="320" y2="100" stroke="#95a2c2" stroke-width="2" marker-end="url(#nnAn)"/>';
    s+='<text x="302" y="86" text-anchor="middle" font-size="12" fill="#e0a030" font-weight="700">+ b</text><text x="302" y="122" text-anchor="middle" font-size="11" fill="#e0a030">'+b+'</text>';
    s+=box(324,72,76,56,'z','= '+z,'#f0a032');
    s+='<line x1="400" y1="100" x2="436" y2="100" stroke="#95a2c2" stroke-width="2" marker-end="url(#nnAn)"/>';
    s+=box(440,72,92,56,'g(z)','aktivasyon σ','#c77dff');
    s+='<line x1="532" y1="100" x2="568" y2="100" stroke="#95a2c2" stroke-width="2" marker-end="url(#nnAn)"/>';
    s+='<circle cx="600" cy="100" r="26" fill="'+mix('#1a2238','#f0a032',a)+'" stroke="#46c46a" stroke-width="2.4"/><text x="600" y="97" text-anchor="middle" font-size="12" fill="#fff" font-weight="700">a</text><text x="600" y="112" text-anchor="middle" font-size="10.5" fill="#fff">'+fm(a,4)+'</text>';
    s+='<text x="300" y="200" text-anchor="middle" font-size="12" fill="#95a2c2">a = g(w₁x₁ + w₂x₂ + b)  — nöron: çarp, topla, bias ekle, aktivasyondan geçir</text>';
    e.setAttribute('viewBox','0 0 650 215');e.innerHTML=s;
  })();

  /* ================= 3) Kendi ağını kur ================= */
  (function(){
    const h=$('nnBuild');if(!h)return;
    let L=[3,4,4,2];
    h.innerHTML='<div style="font-size:13px;color:#ccd5e8;margin-bottom:6px">Her katmanın nöron sayısını ayarla (girdi ve çıktı katmanı dahil):</div><div id="nnBuildCtl" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:8px"></div><div style="overflow-x:auto"><svg id="nnBuildSvg" style="min-width:520px;width:100%;max-width:720px;display:block;margin:0 auto"></svg></div><div id="nnBuildInfo" style="margin-top:8px"></div>';
    const rnd=(seed)=>{let s=seed;return ()=>{s=(s*1664525+1013904223)%4294967296;return 2*s/4294967296-1;};};
    function draw(){
      const r=rnd(7);const W=[];for(let l=0;l<L.length-1;l++){const M=[];for(let j=0;j<Math.min(L[l+1],8);j++){const row=[];for(let i=0;i<Math.min(L[l],8);i++)row.push(r()*6);M.push(row);}W.push(M);}
      const ttl=L.map((v,i)=>i===0?'girdi ('+v+')':i===L.length-1?'çıktı ('+v+')':'gizli '+i+' ('+v+')');
      put('nnBuildSvg',{layers:L,W:W,titles:ttl,width:Math.max(560,L.length*150),maxShow:8,edgeScale:0.3});
      let tot=0,rows='';
      for(let i=1;i<L.length;i++){const w=L[i]*L[i-1],b=L[i];tot+=w+b;rows+='<tr><td>W<sup>('+i+')</sup></td><td>'+L[i]+' × '+L[i-1]+'</td><td>'+w+' + '+b+'</td><td><b>'+(w+b)+'</b></td></tr>';}
      $('nnBuildInfo').innerHTML='<table class="rex-tbl"><tr><th>katman geçişi</th><th>W matrisi şekli</th><th>ağırlık + bias</th><th>parametre</th></tr>'+rows+'<tr><td colspan="3"><b>toplam öğrenilebilir parametre</b></td><td><b>'+tot+'</b></td></tr></table><div class="callout" style="margin-top:8px">Çizgi kalınlığı |w|, mavi = pozitif, kırmızı = negatif (ağırlıklar rastgele). '+(L.length-1>=2?'Girdi ile çıktı arasında <b>'+(L.length-2)+' gizli katman</b> var: ağ '+(L.length-2)+' kez "yeniden temsil" yapıyor.':'Gizli katman yok: bu sadece tek katmanlı bir perceptron — XOR\'u çözemez.')+'</div>';
      window.__nnBuild={L:L.slice(),tot};
    }
    function ctl(){
      let c='';L.forEach((v,i)=>{c+='<span style="display:inline-flex;align-items:center;gap:4px;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:3px 6px"><span style="font-size:12px;color:var(--muted)">'+(i===0?'girdi':i===L.length-1?'çıktı':'gizli '+i)+'</span><button class="rex-btn nb-m" data-i="'+i+'">−</button><b>'+v+'</b><button class="rex-btn nb-p" data-i="'+i+'">+</button></span>';});
      c+='<button class="rex-btn" id="nbAddL">+ gizli katman</button><button class="rex-btn" id="nbDelL">− gizli katman</button>';
      $('nnBuildCtl').innerHTML=c;
      h.querySelectorAll('.nb-m').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(L[i]>1){L[i]--;upd();}});
      h.querySelectorAll('.nb-p').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(L[i]<8){L[i]++;upd();}});
      $('nbAddL').onclick=()=>{if(L.length<7){L.splice(L.length-1,0,4);upd();}};
      $('nbDelL').onclick=()=>{if(L.length>2){L.splice(L.length-2,1);upd();}};
    }
    const upd=()=>{ctl();draw();};upd();
  })();

  /* ================= 4) Gerçek ölçek ================= */
  put('nnReal',{layers:[784,128,64,10],labels:[[],[],[],['0','1','2','3','4','5','6','7','8','9']],titles:['784 piksel (28×28)','128 nöron','64 nöron','10 rakam'],width:640,height:450,maxShow:8,showN:[8,8,8,10],edgeScale:0.2});

  // 5) Simülasyon (canlı ağ, adım adım, eğitim) → js/lesson-nn-sim.js
})();
