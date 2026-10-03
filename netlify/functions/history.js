// History for the detail chart. ?s=SYMBOL&r=1D|5D|15D|1M|3M|6M|1Y|YTD|MAX&fx=1 (multiply by USD/INR)
const MAP={"1D":["5d","5m"],"5D":["5d","15m"],"15D":["1mo","60m"],"1M":["1mo","1d"],"3M":["3mo","1d"],"6M":["6mo","1d"],"1Y":["1y","1d"],"YTD":["ytd","1d"],"MAX":["max","1mo"]};
async function get(s,r){
  const [range,interval]=MAP[r];
  const j=await (await fetch("https://query1.finance.yahoo.com/v8/finance/chart/"+encodeURIComponent(s)+"?range="+range+"&interval="+interval,{headers:{"User-Agent":"Mozilla/5.0"}})).json();
  const x=j.chart.result[0],c=x.indicators.quote[0].close,t=[],p=[];
  (x.timestamp||[]).forEach((ts,i)=>{if(c[i]!=null){t.push(ts*1000);p.push(c[i])}});
  return {t,p,off:x.meta.gmtoffset||0};
}
exports.handler=async(e)=>{
  const q=e.queryStringParameters||{},r=MAP[q.r]?q.r:"1D";
  try{
    let d=await get(q.s,r);
    if(r==="1D"&&d.t.length){ // last trading session only (works when the market is closed)
      const key=(ms)=>new Date(ms+d.off*1000).toISOString().slice(0,10),L=d.t.length-1,fut=q.s.endsWith("=F"),day=key(d.t[L]),cut=d.t[L]-864e5;
      const ix=d.t.map((x,i)=>i).filter(i=>fut?d.t[i]>=cut:key(d.t[i])===day);
      d.t=ix.map(i=>d.t[i]);d.p=ix.map(i=>d.p[i]);
    }
    if(r==="15D"){const cut=Date.now()-15*864e5,k=d.t.findIndex(x=>x>=cut);if(k>0){d.t=d.t.slice(k);d.p=d.p.slice(k)}}
    if(q.fx==="1"){
      const f=await get("INR=X",r);let j=0;
      d.p=d.p.map((v,i)=>{while(j+1<f.t.length&&f.t[j+1]<=d.t[i])j++;return v*f.p[j]});
    }
    return {statusCode:200,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age="+(r==="1D"?60:300)},body:JSON.stringify(d)};
  }catch(err){return {statusCode:502,body:JSON.stringify({error:"fetch failed"})}}
};
