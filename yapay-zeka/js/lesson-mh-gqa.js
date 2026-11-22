// Multi-Head → Simülasyon → 🧮 GQA sekmesi (gpt-oss'un gerçek şekilleri: 64 sorgu kafası, K/V kafası seçilebilir, kafa boyutu 64).
(function(){
  const host=document.getElementById('mhGqa'); if(!host) return;
  const Q=64, DK=64;
  const COL=['#4aa3ff','#ff9b3d','#5fd18a','#e56bb0','#b58cff','#ffd24a','#4fd0d0','#ff6b6b'];
  let kv=8, sel=19;
  const group=q=>Math.ceil(q/(Q/kv));          // q: 1..64
  const col=g=>COL[(g-1)%COL.length];
  function draw(){
    const per=Q/kv, g=group(sel);
    let h='<div class="gq-btns">'
      +[[64,'MHA — her Q kafasının kendi K/V\'si'],[8,'GQA — gpt-oss: 8 K/V kafası'],[1,'MQA — hepsi tek K/V']].map(([n,t])=>
        '<button class="addbtn'+(kv===n?' on':'')+'" data-kv="'+n+'">'+t+'</button>').join('')+'</div>';
    h+='<div class="gq-lab">64 sorgu (Q) kafası — birine tıkla</div><div class="gq-q">';
    for(let q=1;q<=Q;q++){const gg=group(q); h+='<button class="gq-chip'+(gg===g?' on':'')+(q===sel?' me':'')+'" data-q="'+q+'" style="--c:'+col(gg)+'">'+q+'</button>';}
    h+='</div><div class="gq-lab">'+kv+' K/V kafası (her biri K ve V tablosu dilimi, 64 sütun)</div><div class="gq-kv">';
    for(let k=1;k<=kv;k++){h+='<div class="gq-kb'+(k===g?' on':'')+'" style="--c:'+col(k)+'">K/V<br><b>'+k+'</b></div>';}
    h+='</div>';
    const cache=2*kv*DK;
    h+='<div class="work gq-txt">'
      +'<b>Q'+sel+'</b> kafası → <b>K/V'+g+'</b> kafasına bakıyor. Kural: K/V no = yukarı yuvarla(Q no ÷ '+per+') = ⌈'+sel+' ÷ '+per+'⌉ = <b>'+g+'</b>.<br>'
      +'Bu K/V\'yi paylaşan Q kafaları: <b>Q'+((g-1)*per+1)+' … Q'+(g*per)+'</b> ('+per+' kafa). Hepsi aynı K ve V tablosunu okur ama <b>her biri kendi Q\'suyla</b> soruyor → '+per+' ayrı dikkat tablosu çıkar.<br>'
      +'🧠 KV önbelleği: token başına, katman başına <b>2 × '+kv+' × '+DK+' = '+cache.toLocaleString('tr-TR')+' sayı</b>'
      +(kv===64?' (en büyük)':' — MHA\'nın '+(64/kv)+'\'de biri')+'.'
      +'</div>';
    host.innerHTML=h;
  }
  host.addEventListener('click',e=>{
    const b=e.target.closest('[data-kv]'); if(b){kv=+b.dataset.kv; draw(); return;}
    const c=e.target.closest('[data-q]'); if(c){sel=+c.dataset.q; draw();}
  });
  draw();
})();
