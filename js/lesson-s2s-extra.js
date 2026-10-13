// Seq2Seq — ➕ Ekstra: "teacher forcing" ve "beam search" canlı demoları (5️⃣ Simülasyon'daki eğitilmiş toplama modeli ile).
// Python karşılığıyla (bağımsız numpy beam search) aynı sayılar çıkar.
(function(){
  const host=document.getElementById('s2sExtra'); if(!host||!window.__s2sRun||!window.__s2sBeam||!window.S2S_CK) return;
  const D=window.S2S_CK,run=window.__s2sRun,beam=window.__s2sBeam,$=id=>document.getElementById(id);
  const EN=12,NAME=t=>t<10?String(t):(t===10?'+':(t===11?'&lt;s&gt;':'&lt;e&gt;'));
  const fm=v=>v.toFixed(3).replace('.',',').replace(/^-/,'−');
  const truth=(a,b)=>{const s=a+b;return [Math.floor(s/10),s%10,EN];};
  const S={a:7,b:5,ci:3,mode:'tf',wrong:3,bw:3};
  host.innerHTML=
   '<div class="rex-ctl" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:8px">'+
   '<span>Soru:</span><select id="xe_a" class="rex-sel"></select><b>+</b><select id="xe_b" class="rex-sel"></select>'+
   '<span>Model:</span><select id="xe_ck" class="rex-sel">'+D.ck.map((c,i)=>'<option value="'+i+'">epoch '+c.ep+'</option>').join('')+'</select></div>'+
   '<div style="font-size:13.5px;color:#ccd5e8;margin:8px 0 4px"><b>🎓 Teacher forcing:</b> decoder her adımda girdi olarak <b>neyi</b> görüyor?</div>'+
   '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:6px"><button class="rex-btn" id="xe_m1">Eğitimdeki gibi: doğru rakamı ver</button><button class="rex-btn" id="xe_m2">Test zamanı: kendi çıktısını ver</button><button class="rex-btn" id="xe_m3">Hata sok: 1. basamak olarak</button><select id="xe_w" class="rex-sel"></select><span>ver</span></div>'+
   '<div id="xe_tf"></div>'+
   '<div style="font-size:13.5px;color:#ccd5e8;margin:16px 0 4px"><b>🔎 Beam search:</b> her adımda yalnızca en olası kelimeyi (greedy) mi seçelim, yoksa birkaç adayı birlikte mi yürütelim?</div>'+
   '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><span>Beam genişliği:</span><select id="xe_bw" class="rex-sel"><option>1</option><option>2</option><option selected>3</option><option>5</option></select><span style="color:var(--muted);font-size:12px">(1 = greedy)</span></div>'+
   '<div id="xe_bm"></div>';
  for(let i=0;i<10;i++){$('xe_a').add(new Option(i,i));$('xe_b').add(new Option(i,i));$('xe_w').add(new Option(i,i));}
  $('xe_a').value=S.a;$('xe_b').value=S.b;$('xe_w').value=S.wrong;$('xe_ck').value=S.ci;
  function tf(){
    const ck=D.ck[S.ci],t=truth(S.a,S.b);
    let feed;if(S.mode==='tf')feed=[t[0],t[1]];else if(S.mode==='wrong')feed=[S.wrong,undefined];
    const r=run(ck,S.a,S.b,feed);
    ['xe_m1','xe_m2','xe_m3'].forEach((id,i)=>$(id).style.background=['tf','own','wrong'][i]===S.mode?'var(--blue)':'');
    const rows=r.dec.map((d,i)=>{const ok=d.out===t[i];return '<tr><td>'+(i+1)+'</td><td>'+NAME(d.inp)+(S.mode==='tf'&&i>0?' <span style="color:var(--muted)">(doğru)</span>':(S.mode==='wrong'&&i===1?' <span style="color:#e06a6a">(sokulan hata)</span>':(i>0?' <span style="color:var(--muted)">(kendi çıktısı)</span>':'')))+'</td><td><b>'+NAME(d.out)+'</b> (%'+Math.round(d.p*100)+')</td><td>'+NAME(t[i])+'</td><td>'+(ok?'✅':'❌')+'</td></tr>';}).join('');
    const out=r.dec.slice(0,2).map(d=>NAME(d.out)).join('');
    $('xe_tf').innerHTML='<table class="rex-tbl" style="font-size:12.5px"><tr><th>adım</th><th>decoder girdisi</th><th>modelin çıktısı</th><th>doğrusu</th><th></th></tr>'+rows+'</table>'+
     '<p style="font-size:13.5px;color:#ccd5e8;line-height:1.7">'+(S.mode==='tf'?'<b>Eğitimde</b> decoder\'a her adımda <b>doğru önceki rakam</b> verilir: model her adımı bağımsız bir "bir sonraki rakam" sorusu olarak öğrenir (hızlı ve kararlı). Hata, gradyanla bu çıktılara göre hesaplanır.':(S.mode==='own'?'<b>Test zamanında</b> doğru cevap yoktur: decoder kendi önceki çıktısını girdi yapar. İlk çıktı doğruysa zincir doğru gider.':'Burada 1. basamak yerine <b>'+S.wrong+'</b> verildi, ikinci adım bu hatalı girdiyi görüyor ve cevap <b>"'+out+'"</b> çıktı. Test zamanında bir erken hata sonrakileri de bozabilir; buna <b>exposure bias</b> denir: model eğitimde hep doğru geçmişi görüp hiç hatalı geçmişle karşılaşmamıştır.'))+'</p>';
    window.__s2sTF={mode:S.mode,out:r.dec.map(d=>d.out),ok:r.dec.map((d,i)=>d.out===t[i])};
  }
  function bm(){
    const ck=D.ck[S.ci],t=truth(S.a,S.b),code=x=>x[0]*169+x[1]*13+x[2],tc=code(t);
    const hy=beam(ck,S.a,S.b,S.bw);
    const rows=hy.map((h,i)=>'<tr><td>'+(i+1)+'</td><td><b>'+h.seq.map(NAME).join(' ')+'</b></td><td>'+fm(h.lp)+'</td><td>%'+(h.p*100).toFixed(1).replace('.',',')+'</td><td>'+(code(h.seq)===tc?'✅ doğru':'')+'</td></tr>').join('');
    let gOK=0,bOK=0,diff=[];
    for(let a=0;a<10;a++)for(let b=0;b<10;b++){const tt=code(truth(a,b)),g=beam(ck,a,b,1)[0].seq,bb=beam(ck,a,b,S.bw)[0].seq;
      if(code(g)===tt)gOK++;if(code(bb)===tt)bOK++;if(code(g)!==code(bb))diff.push(a+'+'+b);}
    $('xe_bm').innerHTML='<table class="rex-tbl" style="font-size:12.5px"><tr><th>sıra</th><th>dizi (rakamlar + bitiş)</th><th>log olasılık</th><th>olasılık</th><th></th></tr>'+rows+'</table>'+
     '<p style="font-size:13.5px;color:#ccd5e8;line-height:1.7">Beam search, her adımda <b>'+S.bw+' aday</b> diziyi birlikte tutar, tüm olası uzantılarını puanlar ve toplam olasılığı en yüksek '+S.bw+' diziyi sürdürür. Greedy her adımda tek en iyiyi seçer ve geri dönemez; bir adımda "en iyi görünen" seçim sonradan kötü bir diziye götürebilir.</p>'+
     '<div class="callout">📊 <b>Bu modelde (epoch '+ck.ep+'), 100 sorunun hepsi için:</b> greedy <b>'+gOK+'/100</b> doğru, beam('+S.bw+') <b>'+bOK+'/100</b> doğru; ikisinin <b>farklı cevap</b> verdiği soru sayısı <b>'+diff.length+'</b>'+(diff.length?' ('+diff.slice(0,8).join(', ')+(diff.length>8?'…':'')+')':'')+'. '+(ck.ep>=150?'İyi eğitilmiş modelde dağılım zaten çok keskin (çoğu adımda %99+), bu yüzden beam ile greedy aynı sonucu verir; beam, olasılıkların yayıldığı (kararsız) durumlarda fark yaratır. Epoch 30\'u seçip dene.':'Eğitimin ortasındaki bu modelde olasılıklar yayılmış; farklı cevaplar da çıkabilir (daha iyi olduğu garanti değil).')+'</div>';
    window.__s2sBM={hy:hy.map(h=>({seq:h.seq,lp:h.lp})),gOK,bOK,nd:diff.length};
  }
  function all(){tf();bm();}
  $('xe_a').addEventListener('change',e=>{S.a=+e.target.value;all();});$('xe_b').addEventListener('change',e=>{S.b=+e.target.value;all();});
  $('xe_ck').addEventListener('change',e=>{S.ci=+e.target.value;all();});
  $('xe_m1').addEventListener('click',()=>{S.mode='tf';tf();});$('xe_m2').addEventListener('click',()=>{S.mode='own';tf();});$('xe_m3').addEventListener('click',()=>{S.mode='wrong';tf();});
  $('xe_w').addEventListener('change',e=>{S.wrong=+e.target.value;S.mode='wrong';tf();});
  $('xe_bw').addEventListener('change',e=>{S.bw=+e.target.value;bm();});
  all();
})();
