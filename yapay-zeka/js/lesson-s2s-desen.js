/* Seq2Seq — D) 🧬 Sorular ağda nasıl iz bırakıyor? (desen karşılaştırma)
   Her toplama sorusunun bağlam paketindeki h² (encoder Katman 2'nin son h'si, 24 sayı) = o sorunun "izi".
   100 sorunun izi cevaba göre sıralı ısı haritası; iki soruyu seçip benzerliğini (cosine) ölç. */
(function(){
  const host=document.getElementById('s2sDesen'); const D=window.S2S_CK;
  if(!host||!D||!window.__s2sRun) return;
  const H=D.H, EPS=D.ck.map(c=>c.ep);
  const st={ci:D.ck.length-1, center:true, A:[7,5], B:[3,9], pick:'A'};
  const cache={};
  function data(ci){
    if(cache[ci]) return cache[ci];
    const V=[],S=[],Q=[];
    for(let a=0;a<10;a++)for(let b=0;b<10;b++){const r=window.__s2sRun(D.ck[ci],a,b);V.push(r.ctx.h2.slice());S.push(a+b);Q.push([a,b]);}
    const m=new Array(H).fill(0);V.forEach(v=>v.forEach((x,i)=>m[i]+=x/V.length));
    const C=V.map(v=>v.map((x,i)=>x-m[i]));
    return cache[ci]={V,C,S,Q,m};
  }
  const cos=(u,v)=>{let a=0,b=0,c=0;for(let i=0;i<u.length;i++){a+=u[i]*v[i];b+=u[i]*u[i];c+=v[i]*v[i];}return a/Math.sqrt(b*c||1);};
  const fm=(x,d)=>(x<0?'−':'')+Math.abs(x).toFixed(d).replace('.',',');
  function stats(d,M){
    let ws=0,wn=0,bs=0,bn=0,nn=0,nn1=0;
    for(let i=0;i<100;i++){let best=-2,bj=-1;for(let j=0;j<100;j++){if(j===i)continue;const c=cos(M[i],M[j]);if(j>i){if(d.S[i]===d.S[j]){ws+=c;wn++;}else{bs+=c;bn++;}}if(c>best){best=c;bj=j;}}
      if(d.S[bj]===d.S[i])nn++;else if(Math.abs(d.S[bj]-d.S[i])===1)nn1++;}
    return {same:ws/wn,diff:bs/bn,nn,nn1};
  }
  const order=[...Array(100).keys()].sort((x,y)=>{const sx=Math.floor(x/10)+x%10,sy=Math.floor(y/10)+y%10;return sx-sy||x-y;});
  const idx=q=>q[0]*10+q[1];
  const col=(v,mx)=>{const a=Math.min(1,Math.abs(v)/mx);return (v>=0?'rgba(70,196,106,':'rgba(224,106,106,')+(0.08+0.92*a)+')';};
  function strip(vec,mx){let s='<div style="display:flex;gap:1px">';vec.forEach((v,k)=>{s+='<div title="nöron '+(k+1)+': '+fm(v,3)+'" style="flex:1;max-width:14px;min-width:4px;height:18px;border-radius:2px;background:'+col(v,mx)+'"></div>';});return s+'</div>';}

  host.innerHTML=
   '<p style="font-size:13.5px;color:#ccd5e8;line-height:1.7;margin:0 0 8px">Ağırlıklar (E bölümü) her soruda <b>aynıdır</b>. Değişen, sorunun ağda bıraktığı <b>iz</b>: encoder soruyu okuyup bitirince bağlam paketindeki 24 sayı (<b>Katman 2\'nin son h\'si</b>). Aşağıda 100 sorunun izi <b>cevaba göre sıralı</b>, alt alta. Ağ toplamayı öğrendiyse, cevabı aynı olan soruların izi birbirine benzemeli.</p>'+
   '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px"><span style="font-size:13px">Model:</span><span id="sd_ck"></span>'+
   '<label style="font-size:12.5px;margin-left:10px;cursor:pointer"><input type="checkbox" id="sd_cent" checked> ortak kısmı çıkar</label></div>'+
   '<div id="sd_stats" class="callout" style="margin:0 0 10px"></div>'+
   '<div class="sd-grid" style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:start">'+
     '<div><div style="font-size:12px;color:var(--muted);margin-bottom:4px">satır = soru (cevaba göre gruplu) · sütun = 24 nöron · tıkla = seç</div>'+
       '<div style="display:flex;gap:6px"><canvas id="sd_lab" width="40" height="560"></canvas><canvas id="sd_cv" width="336" height="560" style="max-width:calc(100vw - 110px);cursor:pointer;border:1px solid var(--line);border-radius:4px"></canvas></div></div>'+
     '<div style="min-width:0"><div style="font-size:13.5px;font-weight:700;margin-bottom:6px">🔍 İki soruyu karşılaştır</div>'+
       '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px" id="sd_chips"></div>'+
       '<div style="font-size:12.5px;color:var(--muted);margin-bottom:6px">Haritada bir satıra tıklayınca seçili kutuya (<b id="sd_pk">A</b>) yazılır. <button class="addbtn" id="sd_sw" style="padding:2px 8px;font-size:12px;background:var(--panel);color:var(--text);border:1px solid var(--line)">A ↔ B</button></div>'+
       '<div id="sd_cmp"></div></div>'+
   '</div>'+
   '<div class="callout" style="margin-top:10px">💡 <b>Ne öğrendik:</b> <span id="sd_learn"></span></div>';
  const ckb=document.getElementById('sd_ck');
  EPS.forEach((e,i)=>{const b=document.createElement('button');b.className='addbtn';b.textContent='epoch '+e;b.dataset.i=i;b.style.marginRight='4px';ckb.appendChild(b);});
  ckb.addEventListener('click',e=>{if(e.target.dataset.i!==undefined){st.ci=+e.target.dataset.i;render();}});
  document.getElementById('sd_cent').addEventListener('change',e=>{st.center=e.target.checked;render();});
  const CH=[[[7,5],[5,7],'aynı soru, ters sıra'],[[7,5],[3,9],'farklı soru, aynı cevap (12)'],[[7,5],[6,5],'yakın cevap (11)'],[[7,5],[2,3],'uzak cevap (5)']];
  const chips=document.getElementById('sd_chips');
  CH.forEach(c=>{const b=document.createElement('button');b.className='addbtn';b.style.cssText='font-size:12px;padding:3px 8px;background:var(--panel);color:var(--text);border:1px solid var(--line)';b.innerHTML=c[0].join('+')+' ↔ '+c[1].join('+')+' <span style="color:var(--muted)">('+c[2]+')</span>';b.onclick=()=>{st.A=c[0];st.B=c[1];render();};chips.appendChild(b);});
  document.getElementById('sd_sw').onclick=()=>{st.pick=st.pick==='A'?'B':'A';render();};
  const cv=document.getElementById('sd_cv'),lb=document.getElementById('sd_lab'),RH=5.6;
  cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),y=(e.clientY-r.top)*cv.height/r.height;const k=Math.max(0,Math.min(99,Math.floor(y/RH)));const q=[Math.floor(order[k]/10),order[k]%10];if(st.pick==='A')st.A=q;else st.B=q;st.pick=st.pick==='A'?'B':'A';render();});

  function render(){
    const d=data(st.ci),M=st.center?d.C:d.V;
    let mx=0;M.forEach(v=>v.forEach(x=>{if(Math.abs(x)>mx)mx=Math.abs(x);}));mx=mx||1;
    [...ckb.children].forEach(b=>{const on=+b.dataset.i===st.ci;b.style.background=on?'#c77dff':'var(--panel)';b.style.color=on?'#fff':'var(--text)';b.style.border='1px solid var(--line)';});
    // ısı haritası
    const g=cv.getContext('2d'),cw=cv.width/H;g.clearRect(0,0,cv.width,cv.height);
    const gl=lb.getContext('2d');gl.clearRect(0,0,lb.width,lb.height);gl.font='10px sans-serif';gl.textAlign='right';gl.textBaseline='middle';
    let prev=-1,start=0;
    order.forEach((q,k)=>{const s=d.S[q];
      if(s!==prev){if(prev>=0){gl.fillStyle='#95a2c2';gl.fillText('='+prev,36,(start+k)/2*RH);g.fillStyle='rgba(255,255,255,.55)';g.fillRect(0,k*RH-0.6,cv.width,1.2);}prev=s;start=k;}
      M[q].forEach((v,j)=>{g.fillStyle=col(v,mx);g.fillRect(j*cw,k*RH,cw-0.5,RH-0.4);});});
    gl.fillStyle='#95a2c2';gl.fillText('='+prev,36,(start+100)/2*RH);
    [['A','#ffd54a'],['B','#5ad0ff']].forEach(([nm,c])=>{const k=order.indexOf(idx(st[nm]));g.strokeStyle=c;g.lineWidth=2;g.strokeRect(1,k*RH,cv.width-2,RH);});
    // istatistik
    const s=stats(d,M);
    document.getElementById('sd_stats').innerHTML='<b>epoch '+EPS[st.ci]+':</b> cevabı <b>aynı</b> olan soruların izleri arasında ortalama benzerlik <b>'+fm(s.same,2)+'</b> · cevabı <b>farklı</b> olanlar arasında <b>'+fm(s.diff,2)+'</b> · 100 sorunun <b>'+s.nn+'</b>\'inde izine en çok benzeyen soru aynı cevaplı'+(s.nn1?', <b>'+s.nn1+'</b>\'inde cevabı yalnız 1 farklı':'')+'. <span style="color:var(--muted)">(benzerlik = cosine: 1 aynı yön, 0 ilgisiz, −1 zıt)</span>';
    document.getElementById('sd_pk').textContent=st.pick;
    // karşılaştırma
    const va=M[idx(st.A)],vb=M[idx(st.B)],c=cos(va,vb),sa=st.A[0]+st.A[1],sb=st.B[0]+st.B[1];
    const verd=c>0.8?'izler <b>çok benzer</b>':c>0.4?'izler <b>kısmen benzer</b>':c>-0.4?'izler <b>ilgisiz</b>':'izler <b>zıt</b>';
    document.getElementById('sd_cmp').innerHTML=
      '<div style="margin-bottom:6px"><span style="display:inline-block;width:70px;color:#ffd54a;font-weight:700">A: '+st.A.join('+')+'</span><span style="color:var(--muted);font-size:12px">cevap '+sa+'</span>'+strip(va,mx)+'</div>'+
      '<div style="margin-bottom:8px"><span style="display:inline-block;width:70px;color:#5ad0ff;font-weight:700">B: '+st.B.join('+')+'</span><span style="color:var(--muted);font-size:12px">cevap '+sb+'</span>'+strip(vb,mx)+'</div>'+
      '<div style="font-size:14px">Benzerlik (cosine): <b style="font-size:16px">'+fm(c,2)+'</b> → '+verd+(sa===sb?' · cevapları <b>aynı</b> ('+sa+')':' · cevapları <b>farklı</b> ('+sa+' / '+sb+')')+'</div>';
    // ne öğrendik
    let L;
    if(EPS[st.ci]===0)L='Eğitimden önce (epoch 0) izler rastgele: aynı cevaplı sorular, farklı cevaplılardan daha çok benzemiyor (ikisi de ≈0). Ağın henüz "12" diye bir kavramı yok.';
    else L='Eğitimden sonra harita <b>cevap gruplarına göre bantlaşıyor</b>: aynı cevaplı soruların izi neredeyse aynı (≈'+fm(s.same,2)+'), farklılarınki ilgisiz (≈'+fm(s.diff,2)+'). Yani decoder\'a giden 24 sayı, soruyu (7 ve 5\'i ayrı ayrı) değil <b>cevabı</b> taşıyor. Yakın cevaplar (12 ve 11) da birbirine benziyor: en yakın komşusu yanlış gruptan çıkan soruların neredeyse hepsinde fark yalnız 1.';
    if(!st.center)L+=' <i>Şu an "ortak kısmı çıkar" kapalı: 100 sorunun hepsinde aynı olan ortak kısım baskın, bu yüzden her şey birbirine benzer görünüyor. Kutuyu işaretle, soruya özgü iz kalsın.</i>';
    document.getElementById('sd_learn').innerHTML=L;
  }
  window.__s2sDesenRender=()=>render();
  // A bölümündeki soru seçilirse onu A olarak al
  window.__s2sDesenSync=function(){const s=window.__s2sAdd;if(s){st.A=[s.a,s.b];render();}};
  window.__s2sDesenStats=ci=>{const d=data(ci);return stats(d,d.C);};
  render();
})();
