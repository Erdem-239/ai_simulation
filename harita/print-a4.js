/* A4 yazdırma: tuvali A4 yatay oranına getirip bütün sahneyi sığdırır, WebGL tuvali + HTML etiketlerini tek PNG'ye birleştirip basar.
   hook = {renderer, save():restoreFn, step():true|false(bitti)} — sayfa kendi kamerasını sığdırır. */
window.printA4=function(canvas,render,light,hook){
  var busy=window.__printBusy;if(busy)return;window.__printBusy=1;
  var RATIO=297/210,iwD=Object.getOwnPropertyDescriptor(window,'innerWidth'),ihD=Object.getOwnPropertyDescriptor(window,'innerHeight');
  var vw=window.innerWidth,vh=window.innerHeight,W=2000,H=Math.floor(W/RATIO),cs=canvas.style.cssText;
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
    var mode=(document.getElementById('plb')||{}).value||'auto',SC=0.8,L=[];
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
    var img=document.getElementById('prImg');
    if(!img){img=document.createElement('img');img.id='prImg';document.body.appendChild(img);
      var st=document.createElement('style');
      st.textContent='#prImg{display:none}@page{size:A4 landscape;margin:4mm;background:#fff}@media print{:root,html,body{background:#fff!important;color-scheme:light!important;margin:0!important;height:auto!important;overflow:visible!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}body>*:not(#prImg){display:none!important}#prImg{display:block!important;max-width:100%;max-height:202mm;object-fit:contain;margin:0 auto}#prImg.light{filter:invert(1) hue-rotate(180deg)}}';
      document.head.appendChild(st);}
    img.className=light?'light':'';img.src=c.toDataURL('image/png');
  }
  document.body.appendChild(ov);
  setSize();
  var n=0,ok=0;
  (function loop(){
    n++;var done=true;
    if(hook&&hook.step)done=hook.step();
    ok=done?ok+1:0;
    if(ok>=6||n>260){
      capture();back();
      setTimeout(function(){window.print()},150);return;
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
