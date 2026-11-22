// Vektör & Nokta Çarpım — "Örnek Çalışmalar": üç elle-hesaplanabilir, canlı örnek.
//  1) Hangi kelime en yakın? (2 özellikli kelime vektörleri, nokta çarpım vs cosine, kral−erkek+kadın)
//  2) Arama motoru: uzunluk tuzağı (sayım vektörleri; nokta çarpım uzun belgeyi kayırır, cosine kayırmaz)
//  3) Attention skor tablosu softmax(QKᵀ/√d) — bir sorgunun açısını döndür, satırın nasıl değiştiğini izle
// Python karşılığı (index.html'deki kod kutuları) ile aynı sayıları üretir.
(function(){
  const $=id=>document.getElementById(id);
  const fm=(v,d=3)=>{const s=(Math.abs(v)<0.5*Math.pow(10,-d)?0:v).toFixed(d).replace('.',',');return s.replace(/^-/,'−');};
  const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
  const norm=a=>Math.sqrt(dot(a,a));
  const cos=(a,b)=>dot(a,b)/(norm(a)*norm(b));
  const bar=(v,mx,col)=>'<span style="display:inline-block;height:9px;border-radius:3px;background:'+col+';width:'+Math.max(2,Math.round(70*Math.abs(v)/mx))+'px;vertical-align:middle"></span>';

  /* ================= Örnek 1 ================= */
  const W={'kral':[0.9,0.9],'kraliçe':[0.9,-0.9],'prens':[0.5,0.8],'prenses':[0.5,-0.8],'erkek':[0.05,0.9],'kadın':[0.05,-0.9],'kedi':[-0.6,0.1],'elma':[-0.7,-0.2]};
  const e1=$('vkEx1');
  if(e1){
    e1.innerHTML='<div class="rex-grid"><div class="rex-ctl">'+
      '<div style="font-size:13px;color:#ccd5e8;margin-bottom:6px">Sorgu kelimesi: <select id="vk1q" class="rex-sel">'+Object.keys(W).map(k=>'<option>'+k+'</option>').join('')+'</select></div>'+
      '<table class="rex-tbl" id="vk1t"></table>'+
      '<div class="callout" id="vk1a" style="margin-top:10px"></div></div>'+
      '<div><div style="font-size:12.5px;color:#ccd5e8;margin-bottom:4px">Kelimeler 2 özellikli bir düzlemde: yatay = <b>kraliyet</b>, dikey = <b>erkeklik</b></div><svg id="vk1s" viewBox="0 0 300 300" style="width:100%;max-width:340px"></svg></div></div>';
    const draw=()=>{
      const q=$('vk1q').value,v=W[q];
      const rows=Object.keys(W).filter(k=>k!==q).map(k=>({k,d:dot(v,W[k]),c:cos(v,W[k])})).sort((a,b)=>b.c-a.c);
      let h='<tr><th>kelime</th><th>a·b (çarp-topla)</th><th>cosine</th><th></th></tr>';
      rows.forEach((r,i)=>{h+='<tr'+(i===0?' style="background:rgba(70,196,106,.12)"':'')+'><td><b>'+r.k+'</b> '+(i===0?'🏆':'')+'</td><td>'+fm(v[0])+'·'+fm(W[r.k][0])+' + '+fm(v[1])+'·'+fm(W[r.k][1])+' = <b>'+fm(r.d)+'</b></td><td><b>'+fm(r.c)+'</b></td><td>'+bar(r.c,1,r.c>=0?'#46c46a':'#e06a6a')+'</td></tr>';});
      $('vk1t').innerHTML=h;
      const s=(x,y)=>[150+x*130,150-y*130];
      let g='<line x1="10" y1="150" x2="290" y2="150" stroke="#334063"/><line x1="150" y1="10" x2="150" y2="290" stroke="#334063"/>';
      Object.keys(W).forEach(k=>{const [x,y]=s(...W[k]),sel=k===q,best=rows[0].k===k;g+='<line x1="150" y1="150" x2="'+x+'" y2="'+y+'" stroke="'+(sel?'#3a7afe':best?'#46c46a':'#5a6a96')+'" stroke-width="'+(sel||best?3:1.5)+'"/><circle cx="'+x+'" cy="'+y+'" r="4" fill="'+(sel?'#3a7afe':best?'#46c46a':'#95a2c2')+'"/><text x="'+(x+(x>150?6:-6))+'" y="'+(y+(y>150?14:-6))+'" font-size="11" text-anchor="'+(x>150?'start':'end')+'" fill="#ccd5e8">'+k+'</text>';});
      $('vk1s').innerHTML=g;
      const ar=['kral','erkek','kadın'].map(k=>W[k]),vv=[ar[0][0]-ar[1][0]+ar[2][0],ar[0][1]-ar[1][1]+ar[2][1]];
      const best=Object.keys(W).filter(k=>!['kral','erkek','kadın'].includes(k)).sort((a,b)=>cos(vv,W[b])-cos(vv,W[a]))[0];
      $('vk1a').innerHTML='🧮 <b>Vektör aritmetiği:</b> kral − erkek + kadın = ('+fm(ar[0][0],2)+' − '+fm(ar[1][0],2)+' + '+fm(ar[2][0],2)+', '+fm(ar[0][1],2)+' − '+fm(ar[1][1],2)+' + '+fm(ar[2][1],2)+') = ('+fm(vv[0],2)+', '+fm(vv[1],2)+') → en yakın kelime: <b>'+best+'</b>. (Gerçek word2vec\'te sonuç tam değil, <i>yaklaşık</i> çıkar; burada 2 özellikli oyuncak olduğu için birebir.)';
      window.__vk1={q,rows:rows.map(r=>[r.k,r.d,r.c]),best};
    };
    $('vk1q').onchange=draw;$('vk1q').value='kral';draw();
  }

  /* ================= Örnek 2 ================= */
  const e2=$('vkEx2');
  if(e2){
    const V=['kedi','köpek','mama'];
    const init={q:[1,0,1],A:[1,0,1],B:[3,6,5],C:[0,1,1]};
    const NM={A:'A — kısa: "kedi mama"',B:'B — uzun, çoğu köpek hakkında',C:'C — "köpek mama"'};
    let h='<div style="font-size:12.5px;color:#ccd5e8;margin-bottom:6px">Her satır, belgede ilgili kelimenin <b>kaç kez geçtiği</b>. Sayıları değiştir!</div><table class="rex-tbl"><tr><th></th>'+V.map(v=>'<th>'+v+'</th>').join('')+'<th>a·b</th><th>cosine</th></tr>';
    ['q','A','B','C'].forEach(k=>{h+='<tr><td><b>'+(k==='q'?'🔍 sorgu: "kedi mama"':NM[k])+'</b></td>'+[0,1,2].map(i=>'<td><input type="number" min="0" max="20" step="1" value="'+init[k][i]+'" id="vk2_'+k+i+'" style="width:52px"></td>').join('')+(k==='q'?'<td colspan="2"></td>':'<td id="vk2d_'+k+'"></td><td id="vk2c_'+k+'"></td>')+'</tr>';});
    h+='</table><div id="vk2r" class="callout" style="margin-top:10px"></div>';
    e2.innerHTML=h;
    const upd=()=>{
      const g=k=>[0,1,2].map(i=>Math.max(0,parseFloat($('vk2_'+k+i).value)||0));
      const q=g('q'),res=['A','B','C'].map(k=>{const d=g(k),n=norm(d);return {k,dp:dot(q,d),c:n?dot(q,d)/(norm(q)*n):0};});
      res.forEach(r=>{$('vk2d_'+r.k).innerHTML='<b>'+r.dp+'</b>';$('vk2c_'+r.k).innerHTML='<b>'+fm(r.c)+'</b>';});
      const bd=res.slice().sort((a,b)=>b.dp-a.dp)[0].k,bc=res.slice().sort((a,b)=>b.c-a.c)[0].k;
      $('vk2r').innerHTML='🏆 <b>Nokta çarpıma göre</b> birinci: <b>'+bd+'</b> · <b>cosine\'e göre</b> birinci: <b>'+bc+'</b>. '+(bd!==bc?'İkisi <b>farklı</b> çıktı — uzun belge, sırf kelimeleri çok olduğu için nokta çarpımda öne geçti; cosine boyu atıp yalnızca <i>yöne</i> bakıyor.':'Şu an ikisi aynı belgeyi seçiyor. B\'nin sayılarını büyütüp küçültmeyi dene.');
      window.__vk2={res};
    };
    e2.querySelectorAll('input').forEach(i=>i.addEventListener('input',upd));upd();
  }

  /* ================= Örnek 3 ================= */
  const e3=$('vkEx3');
  if(e3){
    const tok=['kedi','uyudu','süt'],K=[[1,0],[0,1],[1,1]];
    e3.innerHTML='<div style="font-size:13px;color:#ccd5e8;margin-bottom:6px">"uyudu" kelimesinin <b>sorgu okunu</b> (boyu 2) döndür: <input type="range" id="vk3a" min="0" max="180" step="1" value="90" style="width:200px"> <b id="vk3av">90°</b></div>'+
      '<div id="vk3t" style="overflow-x:auto"></div><div class="callout" id="vk3c" style="margin-top:10px"></div>';
    const upd=()=>{
      const fi=+$('vk3a').value;$('vk3av').textContent=fi+'°';
      const r=fi*Math.PI/180,Q=[[1,0],[2*Math.cos(r),2*Math.sin(r)],[1,1]],d=2;
      const sm=s=>{const m=Math.max(...s),e=s.map(x=>Math.exp(x-m)),t=e.reduce((a,b)=>a+b,0);return e.map(x=>x/t);};
      let h='<table class="rex-tbl"><tr><th>sorgu ↓ / anahtar →</th>'+tok.map((t,i)=>'<th>'+t+' k=('+K[i].join(', ')+')</th>').join('')+'<th>softmax (satır toplamı 1)</th></tr>';
      const out=[];
      Q.forEach((q,i)=>{
        const sc=K.map(k=>dot(q,k)/Math.sqrt(d)),p=sm(sc);out.push({sc,p});
        h+='<tr><td><b>'+tok[i]+'</b> q=('+fm(q[0],2)+', '+fm(q[1],2)+')</td>'+sc.map(x=>'<td>'+fm(x)+'</td>').join('')+'<td>'+p.map(x=>'<b>'+fm(x)+'</b>').join(' · ')+'<br>'+p.map((x,j)=>bar(x,1,['#3a7afe','#f0a032','#46c46a'][j])).join(' ')+'</td></tr>';
      });
      $('vk3t').innerHTML=h+'</table>';
      const p=out[1].p,mx=p.indexOf(Math.max(...p));
      $('vk3c').innerHTML='🔎 "uyudu" şu an en çok <b>'+tok[mx]+'</b> kelimesine bakıyor (%'+Math.round(p[mx]*100)+'). Oku 0°\'ye çevir → "kedi" ve "süt" eşit pay alır; 90°\'de "uyudu" ve "süt"; arada ağırlık kayar. Skor = q·k ÷ √d (d=2), sonra her satır softmax.';
      window.__vk3={out};
    };
    $('vk3a').addEventListener('input',upd);upd();
  }
})();
