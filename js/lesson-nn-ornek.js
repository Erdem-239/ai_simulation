// Neural Network — "7️⃣ Örnek Çalışmalar" (kendi kendine öğrenen):
//  1) Katman genişliği: 2-k-1 ağ XOR'u 12 başlangıçla dener (k=2,3,4,8) — daha geniş katman = daha güvenilir öğrenme
//  2) Parametre sayacı: katman boyutlarını yaz, W matris şekillerini ve toplam parametre sayısını gör (elle hesap)
//  3) Elle hesap: (1,0) noktası için matris zinciri z=Wx+b → h → ŷ  (sayfa yüklenirken hesaplanır)
// Başlangıç değerleri Python'daki LCG ile aynı; Python kod kutusuyla aynı sayıları üretir.
(function(){
  const $=id=>document.getElementById(id);
  const sig=z=>1/(1+Math.exp(-z));
  const z0=(v,d)=>Math.abs(v)<0.5*Math.pow(10,-d)?0:v;
  const fm=(v,d=3)=>{v=z0(v,d);return (v<0?'−':'')+Math.abs(v).toFixed(d).replace('.',',');};
  const X=[[0,0],[0,1],[1,0],[1,1]],Y=[0,1,1,0];
  const lcg=seed=>{let s=seed;return ()=>{s=(s*1664525+1013904223)%4294967296;return Math.round((2*s/4294967296-1)*10)/10;};};
  const mkNet=(k,seed)=>{const u=lcg(seed+1);const W1=[],b1=[],W2=[];for(let j=0;j<k;j++)W1.push([u(),u()]);for(let j=0;j<k;j++)b1.push(u());for(let j=0;j<k;j++)W2.push(u());return {k,W1,b1,W2,b2:u()};};
  function step(N){
    const k=N.k,gW1=[],gb1=new Array(k).fill(0),gW2=new Array(k).fill(0);let gb2=0,L=0;for(let j=0;j<k;j++)gW1.push([0,0]);
    X.forEach((x,i)=>{
      const h=[];for(let j=0;j<k;j++)h.push(sig(N.W1[j][0]*x[0]+N.W1[j][1]*x[1]+N.b1[j]));
      let zy=N.b2;for(let j=0;j<k;j++)zy+=N.W2[j]*h[j];
      const p=sig(zy),t=Y[i];L+=-(t?Math.log(p):Math.log(1-p))/4;const dz=p-t;
      for(let j=0;j<k;j++){gW2[j]+=dz*h[j]/4;const dh=dz*N.W2[j]*h[j]*(1-h[j]);gW1[j][0]+=dh*x[0]/4;gW1[j][1]+=dh*x[1]/4;gb1[j]+=dh/4;}
      gb2+=dz/4;});
    for(let j=0;j<k;j++){N.W1[j][0]-=gW1[j][0];N.W1[j][1]-=gW1[j][1];N.b1[j]-=gb1[j];N.W2[j]-=gW2[j];}
    N.b2-=gb2;return L;
  }
  const train=(k,seed,tur)=>{const N=mkNet(k,seed);let L=0;const h=[];for(let t=0;t<tur;t++){L=step(N);h.push(L);}return {L,h};};

  /* ===== Örnek 1 ===== */
  const e1=$('nnEx1');
  if(e1){
    const KS=[2,3,4,8],TUR=4000;
    e1.innerHTML='<div style="font-size:13px;color:#ccd5e8;margin-bottom:6px">Gizli katman genişliği k: '+KS.map(k=>'<button class="rex-btn nn1k" data-k="'+k+'">k = '+k+'</button>').join('')+' <button class="rex-btn" id="nn1all">🎲 12 başlangıçla dene</button></div><div id="nn1t"></div>';
    let sel=2;
    const show=(k,res)=>{
      const ps=3*k+1+0;// W1: 2k, b1: k, W2: k, b2: 1 → 4k+1
      let t='<div class="rex-stat">2-<b>'+k+'</b>-1 ağ · W⁽¹⁾ boyutu <b>'+k+'×2</b> · W⁽²⁾ boyutu <b>1×'+k+'</b> · toplam parametre = '+k+'·2 + '+k+' + '+k+' + 1 = <b>'+(4*k+1)+'</b></div>';
      if(res){
        t+='<table class="rex-tbl" style="margin-top:8px"><tr><th>başlangıç #</th>'+res.map((r,i)=>'<th>'+i+'</th>').join('')+'</tr><tr><td>kayıp ('+TUR+'. tur)</td>'+res.map(r=>'<td style="color:'+(r<0.05?'#46c46a':'#e06a6a')+'">'+fm(r,3)+'</td>').join('')+'</tr></table>';
        const ok=res.filter(r=>r<0.05).length;
        t+='<div class="callout" style="margin-top:8px">k = '+k+': 12 başlangıçtan <b>'+ok+'</b> tanesi XOR\'u çözdü'+(ok<12?' (kırmızılar yerel tuzakta takıldı — Python\'daki sayıyla aynı)':' — hiçbiri takılmadı')+'. '+(k===2?'En dar ağ en kırılgan: iki nöron tam yetiyor ama başlangıç şansızsa takılıyor.':'Katman genişledikçe (daha çok "kapı", daha çok yol) gradyan inişi tuzağa düşme şansını azaltıyor; bunun bedeli parametre sayısı ve hesap.')+'</div>';
      } else t+='<div class="callout" style="margin-top:8px">🎲 düğmesi aynı ağı 12 farklı rastgele başlangıçtan '+TUR+' tur eğitir ve kaçının XOR\'u çözdüğünü sayar.</div>';
      $('nn1t').innerHTML=t;
      document.querySelectorAll('.nn1k').forEach(b=>{b.style.outline=+b.dataset.k===sel?'2px solid var(--accent)':'none';});
    };
    window.__nn1=(k)=>{const res=[];for(let s=0;s<12;s++)res.push(train(k,s,TUR).L);return res;};
    document.querySelectorAll('.nn1k').forEach(b=>b.onclick=()=>{sel=+b.dataset.k;show(sel,null);});
    $('nn1all').onclick=()=>{$('nn1all').textContent='⏳ …';setTimeout(()=>{const r=window.__nn1(sel);show(sel,r);window.__nn1res=r;$('nn1all').textContent='🎲 12 başlangıçla dene';},30);};
    show(2,null);
  }

  /* ===== Örnek 2 ===== */
  const e2=$('nnEx2');
  if(e2){
    e2.innerHTML='<div style="font-size:13px;color:#ccd5e8;margin-bottom:6px">Katman boyutları (virgülle): <input id="nn2in" value="2,2,1" style="width:160px"> <button class="rex-btn" data-p="2,2,1">XOR (2-2-1)</button><button class="rex-btn" data-p="784,128,10">el yazısı (784-128-10)</button><button class="rex-btn" data-p="4,16,16,3">küçük sınıflandırıcı</button></div><div id="nn2t" style="margin-top:8px"></div>';
    const upd=()=>{
      const L=$('nn2in').value.split(',').map(v=>parseInt(v)).filter(v=>v>0);
      if(L.length<2){$('nn2t').innerHTML='En az iki katman yaz.';return;}
      let tot=0,t='<table class="rex-tbl"><tr><th>katman</th><th>W matrisi</th><th>b</th><th>parametre</th></tr>';
      for(let i=1;i<L.length;i++){const w=L[i]*L[i-1],b=L[i];tot+=w+b;t+='<tr><td>'+L[i-1]+' → '+L[i]+'</td><td>'+L[i]+'×'+L[i-1]+' = '+w.toLocaleString('tr-TR')+'</td><td>'+b+'</td><td><b>'+(w+b).toLocaleString('tr-TR')+'</b></td></tr>';}
      $('nn2t').innerHTML=t+'<tr><td colspan="3"><b>toplam</b></td><td><b>'+tot.toLocaleString('tr-TR')+'</b></td></tr></table><div class="callout" style="margin-top:8px">Kural: <b>W<sup>(i)</sup> boyutu = (çıkış sayısı) × (giriş sayısı)</b>, bias çıkış sayısı kadar. Boyutlar zincirde komşu katmanlarla eşleşmeli (matris çarpımı kuralı). '+(tot>100000?'Bu bile küçük bir ağ: GPT tipi modellerde bu sayı milyarlar.':'')+'</div>';
      window.__nn2={L,tot};
    };
    $('nn2in').addEventListener('input',upd);e2.querySelectorAll('button[data-p]').forEach(b=>b.onclick=()=>{$('nn2in').value=b.dataset.p;upd();});upd();
  }
})();
