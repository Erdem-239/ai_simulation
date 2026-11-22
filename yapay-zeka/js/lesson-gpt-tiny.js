// GPT Test — minik pencereli dil modeli (7 karakterlik sözlük, pencere 4, kart 2 sayı, ara katman 6): Bütün Resim ve Örnek 1 bunu paylaşır.
// Python karşılığı (index.html kod kutuları) ile aynı LCG başlangıcı, aynı toplama sırası: aynı sayılar çıkar.
window.GPTTiny=(function(){
  const V=['1','2','3','4','+','=','.'],IX={},N=4,D=2,H=6,NV=V.length;V.forEach((c,i)=>IX[c]=i);
  const lcg=s=>{let st=s;return()=>{st=(st*1664525+1013904223)%4294967296;return st/4294967296;};};
  const R=(a,b,r,o)=>Array.from({length:a},()=>Array.from({length:b},()=>(r()*2-1)*o));
  function init(seed,sc){seed=seed||1;sc=sc||0.5;const r=lcg(seed),E=R(NV,D,r,sc),Wh=R(N*D,H,r,sc),Wo=R(H,NV,r,sc);return {E,Wh,bh:Array(H).fill(0),Wo,bo:Array(NV).fill(0)};}
  function fwd(M,pen){
    const x=[];pen.forEach(c=>M.E[c].forEach(v=>x.push(v)));
    const u=[];for(let b=0;b<H;b++){let s=M.bh[b];for(let a=0;a<N*D;a++)s+=x[a]*M.Wh[a][b];u.push(s);}
    const h=u.map(Math.tanh),z=[];
    for(let k=0;k<NV;k++){let s=M.bo[k];for(let b=0;b<H;b++)s+=h[b]*M.Wo[b][k];z.push(s);}
    const m=Math.max(...z),e=z.map(v=>Math.exp(v-m));let top=0;e.forEach(v=>top+=v);
    return {x,u,h,z,p:e.map(v=>v/top)};
  }
  function grad(M,pen,y){
    const o=fwd(M,pen),dz=o.p.slice();dz[y]-=1;
    const dWo=o.h.map(hb=>dz.map(d=>hb*d)),dbo=dz.slice();
    const dh=[];for(let b=0;b<H;b++){let s=0;for(let k=0;k<NV;k++)s+=dz[k]*M.Wo[b][k];dh.push(s);}
    const du=dh.map((v,b)=>v*(1-o.h[b]*o.h[b]));
    const dWh=o.x.map(xa=>du.map(d=>xa*d)),dbh=du.slice();
    const dx=[];for(let a=0;a<N*D;a++){let s=0;for(let b=0;b<H;b++)s+=du[b]*M.Wh[a][b];dx.push(s);}
    const dE=Array.from({length:NV},()=>Array(D).fill(0));pen.forEach((c,i)=>{for(let j=0;j<D;j++)dE[c][j]+=dx[i*D+j];});
    return {o,L:-Math.log(o.p[y]),dz,dWo,dbo,dh,du,dWh,dbh,dx,dE};
  }
  function pairs(lines){const P=[];lines.forEach(l=>{const s='.'.repeat(N)+l;for(let k=N;k<s.length;k++)P.push([[...s.slice(k-N,k)].map(c=>IX[c]),IX[s[k]]]);});return P;}
  function batch(M,P){
    const G={E:Array.from({length:NV},()=>Array(D).fill(0)),Wh:Array.from({length:N*D},()=>Array(H).fill(0)),bh:Array(H).fill(0),Wo:Array.from({length:H},()=>Array(NV).fill(0)),bo:Array(NV).fill(0)};let top=0;
    P.forEach(([pen,y])=>{const g=grad(M,pen,y);top+=g.L;
      for(let b=0;b<H;b++)for(let k=0;k<NV;k++)G.Wo[b][k]+=g.dWo[b][k];for(let k=0;k<NV;k++)G.bo[k]+=g.dbo[k];
      for(let a=0;a<N*D;a++)for(let b=0;b<H;b++)G.Wh[a][b]+=g.dWh[a][b];for(let b=0;b<H;b++)G.bh[b]+=g.dbh[b];
      for(let c=0;c<NV;c++)for(let j=0;j<D;j++)G.E[c][j]+=g.dE[c][j];});
    return {L:top/P.length,G};
  }
  function step(M,P,lr){const {L,G}=batch(M,P),n=P.length;
    for(const ad of ['bh','bo'])for(let i=0;i<G[ad].length;i++)M[ad][i]-=lr*G[ad][i]/n;
    for(const ad of ['E','Wh','Wo'])for(let i=0;i<G[ad].length;i++)for(let j=0;j<G[ad][i].length;j++)M[ad][i][j]-=lr*G[ad][i][j]/n;
    return L;}
  const next=(M,s)=>{const p=fwd(M,[...s].map(c=>IX[c])).p;let i=0;p.forEach((v,k)=>{if(v>p[i])i=k;});return {c:V[i],p:p[i],all:p};};
  return {V,IX,N,D,H,NV,init,fwd,grad,pairs,batch,step,next};
})();
