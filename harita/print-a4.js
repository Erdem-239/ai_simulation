/* A4 yazdırma: tuvali A4 yatay oranına getirip bütün sahneyi sığdırır, WebGL tuvali + HTML etiketlerini tek PNG'ye birleştirip basar.
   hook = {renderer, save():restoreFn, step():true|false(bitti)} — sayfa kendi kamerasını sığdırır. */
window.printA4=function(canvas,render,light,hook,extra){
  var busy=window.__printBusy;if(busy)return;window.__printBusy=1;
  var RATIO=297/210,AR=(extra&&extra.aspect)||RATIO,iwD=Object.getOwnPropertyDescriptor(window,'innerWidth'),ihD=Object.getOwnPropertyDescriptor(window,'innerHeight');
  var vw=window.innerWidth,vh=window.innerHeight,W=2000,H=Math.floor(W/AR),cs=canvas.style.cssText;
  var ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;z-index:99999;background:#0b0e14e6;color:#e7ecf5;display:flex;align-items:center;justify-content:center;font:600 16px sans-serif';
  ov.textContent='A4 için sahne sığdırılıyor…';
  var restore=hook&&hook.save?hook.save():null,r=hook&&hook.renderer,pr0=r?r.getPixelRatio():1;
  function setSize(){
    Object.defineProperty(window,'innerWidth',{configurable:true,get:function(){return W}});
    Object.defineProperty(window,'innerHeight',{configurable:true,get:function(){return H}});
    canvas.style.width=W+'px';canvas.style.height=H+'px';
    window.dispatchEvent(new Event('resize'));
    if(r){r.setPixelRatio(1.5);r.setSize(W,H,false)}
  }
  function back(){
    Object.defineProperty(window,'innerWidth',iwD);Object.defineProperty(window,'innerHeight',ihD);
    canvas.style.cssText=cs;if(r)r.setPixelRatio(pr0);
    window.dispatchEvent(new Event('resize'));
    if(restore)restore();
    if(ov.parentNode)ov.parentNode.removeChild(ov);window.__printBusy=0;
  }
  function capture(){
    render();
    var cw=canvas.width,ch=canvas.height,cr=canvas.getBoundingClientRect(),k=cw/cr.width;
    var c=document.createElement('canvas');c.width=cw;c.height=ch;var g=c.getContext('2d');
    g.fillStyle='#0b0e14';g.fillRect(0,0,cw,ch);g.drawImage(canvas,0,0);
    var mode=(document.getElementById('plb')||{}).value||'auto',SC=parseFloat((document.getElementById('pls')||{}).value)||1.4,L=[];
    if(mode!=='none')document.querySelectorAll('.lb').forEach(function(el){
      var cs2=getComputedStyle(el);if(cs2.display==='none'||cs2.visibility==='hidden'||parseFloat(cs2.opacity)<0.08)return;
      var rc=el.getBoundingClientRect();if(rc.right<cr.left||rc.left>cr.right||rc.bottom<cr.top||rc.top>cr.bottom)return;
      var w=rc.width*k*SC,h=rc.height*k*SC;
      L.push({t:el.textContent.trim(),x:(rc.left-cr.left)*k+rc.width*k*(1-SC)/2,y:(rc.top-cr.top)*k+rc.height*k*(1-SC)/2,w:w,h:h,o:Math.min(1,parseFloat(cs2.opacity)),c:cs2.borderTopColor||'#4a5468'});
    });
    if(mode==='auto'){ /* kısa etiketler önce; üst üste binenleri atla (bloklar görünür kalsın) */
      L.sort(function(a,b){return a.t.length-b.t.length});var kept=[],pad=6*k;
      L.forEach(function(a){var hit=kept.some(function(b){return a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y});if(!hit)kept.push(a)});
      L=kept;
    }
    L.forEach(function(a){
      var fs=Math.max(9,11*k*0.85*SC);
      g.globalAlpha=a.o*0.9;g.fillStyle='#10151f';g.strokeStyle=a.c;g.lineWidth=1.5*k*0.85*SC;
      g.beginPath();if(g.roundRect)g.roundRect(a.x,a.y,a.w,a.h,6*k*0.85*SC);else g.rect(a.x,a.y,a.w,a.h);g.fill();g.stroke();
      g.globalAlpha=a.o;g.fillStyle='#e7ecf5';g.font='600 '+fs+'px sans-serif';g.textBaseline='middle';
      g.fillText(a.t,a.x+7*k*0.85*SC,a.y+a.h/2,Math.max(10,a.w-12*k*0.85*SC));g.globalAlpha=1;
    });
    return c;
  }
  document.body.appendChild(ov);
  setSize();
  var n=0,ok=0;
  (function loop(){
    n++;var done=true;
    if(hook&&hook.step)done=hook.step();
    ok=done?ok+1:0;
    if(ok>=6||n>260){
      var arch=capture();back();
      var finish=function(pages){window.printA4Pages(pages,light);window.__printBusy=0;setTimeout(function(){window.print()},150)};
      if(extra&&extra.snaps){
        window.__printBusy=1;
        var ov2=document.createElement('div');ov2.style.cssText=ov.style.cssText;ov2.textContent='Adım adım görseller hazırlanıyor…';document.body.appendChild(ov2);
        extra.snaps.then(function(list){return window.printA4Compose(arch,list,extra)}).then(function(pages){ov2.remove();finish(pages)},
          function(){ov2.remove();finish([arch])});
      }else finish([arch]);
      return;
    }
    requestAnimationFrame(loop);
  })();
};
/* ortak yardımcı: kutunun 8 köşesinin ekrandaki (NDC) genişlik/yükseklik/merkezi */
window.printA4Ndc=function(box,camera){
  var V=box.min.constructor,mnx=9,mxx=-9,mny=9,mxy=-9,i,v;
  camera.updateMatrixWorld();
  for(i=0;i<8;i++){v=new V((i&1)?box.max.x:box.min.x,(i&2)?box.max.y:box.min.y,(i&4)?box.max.z:box.min.z).project(camera);
    mnx=Math.min(mnx,v.x);mxx=Math.max(mxx,v.x);mny=Math.min(mny,v.y);mxy=Math.max(mxy,v.y)}
  return {w:(mxx-mnx)/2,h:(mxy-mny)/2,cx:(mxx+mnx)/2,cy:(mxy+mny)/2};
};
/* ekranda ortalamak için gereken dünya kayması (NDC merkez sapmasından) */
window.printA4Shift=function(m,camera,tgt){
  var V=camera.position.constructor,d=camera.position.distanceTo(tgt),t=Math.tan(camera.fov*Math.PI/360)*d;
  var r=new V().setFromMatrixColumn(camera.matrixWorld,0),u=new V().setFromMatrixColumn(camera.matrixWorld,1);
  return r.multiplyScalar(m.cx*t*camera.aspect).add(u.multiplyScalar(m.cy*t));
};

/* sayfaları <img class="prPg"> olarak koyar (her biri bir A4 yatay sayfa) */
window.printA4Pages=function(pages,light){
  [].forEach.call(document.querySelectorAll('.prPg,#prImg'),function(e){e.remove()});
  var st=document.getElementById('prStyle');
  if(!st){st=document.createElement('style');st.id='prStyle';
    st.textContent='.prPg{display:none}@page{size:A4 landscape;margin:0}@media print{:root,html,body{background:#fff!important;color-scheme:light!important;margin:0!important;height:auto!important;overflow:visible!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}body>*:not(.prPg){display:none!important}.prPg{display:block!important;width:297mm;height:209.5mm;object-fit:cover;margin:0;page-break-after:always;break-after:page}.prPg:last-of-type{page-break-after:avoid;break-after:avoid}.prPg.light{filter:invert(1) hue-rotate(180deg)}}';
    document.head.appendChild(st)}
  pages.forEach(function(c){var im=document.createElement('img');im.className='prPg'+(light?' light':'');im.src=c.toDataURL('image/png');document.body.appendChild(im)});
  window.__prPages=pages.length;
};
/* animasyon sayfasındaki sahneleri gizli bir karede resme çevirir: kind 'gpt2' | 'gptoss', mode 'mid' (hesap sürerken) | 'end' (tamamlanmış) */
window.printA4Snaps=function(kind,mode){
  return new Promise(function(res,rej){
    var f=document.createElement('iframe'),id=Date.now(),to;
    f.style.cssText='position:fixed;left:-99999px;top:0;width:1100px;height:800px;border:0';
    function done(v,err){clearTimeout(to);window.removeEventListener('message',on);f.remove();err?rej(err):res(v)}
    function on(e){var d=e.data;if(!d)return;
      if(d.type==='snapReady')f.contentWindow.postMessage({type:'snapReq',id:id,kind:kind,mode:mode},'*');
      else if(d.type==='snapRes'&&d.id===id)done(d.list)}
    window.addEventListener('message',on);
    to=setTimeout(function(){done(null,new Error('zaman aşımı'))},90000);
    f.src=new URL('matris-animasyon.html?snap=1&_='+id,location.href).href;
    document.body.appendChild(f);
  });
};
/* mimari görselinin altına adım görsellerini akıtır (2 sütun, sığmayan sonraki sayfaya geçer); sayfa tuvalleri döner */
window.printA4Compose=function(arch,list,extra){
  var PW=3000,PH=Math.round(PW*210/297),mm=PW/297,m=6*mm,gap=4*mm,cap=6*mm,per=(extra&&extra.perPage)||4;
  var cw=(PW-2*m-gap)/2;if(per>=6)cw*=0.84;
  var ch=cw*470/1000+cap,x0=(PW-(2*cw+gap))/2;
  return Promise.all(list.map(function(it){return new Promise(function(r){var im=new Image();im.onload=function(){r(im)};im.onerror=function(){r(null)};im.src=it.url})})).then(function(imgs){
    var pages=[],g,pc;
    function newPage(){pc=document.createElement('canvas');pc.width=PW;pc.height=PH;g=pc.getContext('2d');g.fillStyle='#0b0e14';g.fillRect(0,0,PW,PH);pages.push(pc)}
    newPage();
    var aw=PW-2*m,ah=aw*arch.height/arch.width;g.drawImage(arch,m,m,aw,ah);
    var y=m+ah+gap;
    g.fillStyle='#ffc82e';g.font='700 '+Math.round(4.2*mm)+'px sans-serif';g.textBaseline='top';
    g.fillText('Adım adım: işlemler ve görselleri',x0,y);y+=5.5*mm+gap/2;
    list.forEach(function(it,k){
      var col=k%2;
      if(col===0&&k>0)y+=ch+gap;
      if(col===0&&y+ch>PH-m){newPage();y=m}
      var x=x0+col*(cw+gap);
      g.fillStyle='#12151c';g.strokeStyle='#323a4a';g.lineWidth=3;
      g.fillRect(x,y,cw,ch);g.strokeRect(x,y,cw,ch);
      if(imgs[k])g.drawImage(imgs[k],x,y+cap,cw,cw*470/1000);
      g.fillStyle='#e7ecf5';g.font='700 '+Math.round(3.6*mm)+'px sans-serif';g.textBaseline='middle';
      g.fillText(it.tag,x+1.5*mm,y+cap/2,cw-3*mm);
    });
    return pages;
  });
};
