/* RNN — ağırlık paneli ekrandan çıkınca altta beliren minimal kaydırıcı şeridi.
   Panel yerinden OYNATILMAZ (eski setupFloatingPanel bu yüzden sayfayı zıplatıyordu);
   şerit ayrı, küçük kaydırıcılar taşır ve ana kaydırıcılarla iki yönlü eşleşir:
   şeritte oynayınca ana kaydırıcıya yazıp 'input' olayı tetikler (render aynı yoldan çalışır),
   eğitim/hazır ayar ana kaydırıcıyı değiştirince şerit kendini günceller. */
(function(){
  const $=id=>document.getElementById(id);
  const bar=$('rcWBar'), row=$('rcWBarRow'), panel=$('rcSliderPanel');
  if(!bar||!row||!panel) return;
  const W=[['Wxh','W<sub>xh</sub>'],['Whh','W<sub>hh</sub>'],['b','b<sub>h</sub>'],['Why','W<sub>hy</sub>'],['by','b<sub>y</sub>'],['alpha','α']];
  const items=[];
  W.forEach(([k,lab])=>{
    const src=$('rc_'+k); if(!src) return;
    const cell=document.createElement('label'); cell.className='rc-wbar-cell';
    cell.innerHTML='<span class="rc-wbar-lab">'+lab+'</span>';
    const inp=document.createElement('input'); inp.type='range';
    ['min','max','step'].forEach(a=>inp.setAttribute(a, src.getAttribute(a)));
    inp.value=src.value;
    const val=document.createElement('b'); val.className='rc-wbar-val';
    cell.appendChild(inp); cell.appendChild(val); row.appendChild(cell);
    const fmt=()=>{ val.textContent=(+src.value).toFixed(2); };
    inp.addEventListener('input',()=>{ src.value=inp.value; src.dispatchEvent(new Event('input',{bubbles:true})); fmt(); });
    src.addEventListener('input',()=>{ if(document.activeElement!==inp) inp.value=src.value; fmt(); });
    fmt(); items.push({src,inp,fmt});
  });
  // eğitim (rcTrainCommit) ağırlıkları olay tetiklemeden yazar → görünürken düzenli eşitle
  function sync(){ items.forEach(o=>{ if(document.activeElement!==o.inp && o.inp.value!==o.src.value){ o.inp.value=o.src.value; } o.fmt(); }); }

  let hiddenByUser=false;
  const onScreen=el=>{ if(!el||!el.offsetParent) return false; const r=el.getBoundingClientRect(); return r.bottom>0 && r.top<innerHeight; };
  function check(){
    const model=$('model-rnn');
    const active=model && model.classList.contains('active');
    const panelVisible=onScreen(panel);
    if(panelVisible) hiddenByUser=false;
    // yalnız Simülasyon veya Bütün Resim ekrandayken (ağırlıkların etkisini gördüğün yerler)
    const work=onScreen($('rnnSimTek')) || onScreen($('rnnBigPictureBody'));
    const show=active && work && !panelVisible && !hiddenByUser;
    if(show){ sync(); }
    bar.hidden=!show;
  }
  let tick=false;
  const req=()=>{ if(!tick){ tick=true; requestAnimationFrame(()=>{ tick=false; check(); }); } };
  addEventListener('scroll',req,{passive:true}); addEventListener('resize',req);
  document.addEventListener('click',()=>setTimeout(req,60));
  setInterval(()=>{ if(!bar.hidden) sync(); },300);
  $('rcWBarHide').addEventListener('click',e=>{ e.preventDefault(); hiddenByUser=true; bar.hidden=true; });
  $('rcWBarGo').addEventListener('click',e=>{ e.preventDefault(); panel.scrollIntoView({behavior:'smooth',block:'center'}); });
  req();
})();
