// Live quotes for the cards: price, previous close, trading day and the last trading session's points for the mini chart.
const SYMS=["^GSPC","^IXIC","^DJI","YM=F","^GDAXI","^FTSE","^STOXX50E","^STOXX","^N225","^HSI","000001.SS","399001.SZ","^BSESN","^NSEI","CL=F","BZ=F","GC=F","SI=F","INR=X","EURUSD=X","GBPUSD=X","JPY=X","CHF=X","AUDUSD=X","CAD=X","CNY=X","AED=X","EURINR=X","GBPINR=X"];
const key=(ms,off)=>new Date(ms+off*1000).toISOString().slice(0,10); // exchange-local date
async function chart(s,range,interval){
  const r=await fetch("https://query1.finance.yahoo.com/v8/finance/chart/"+encodeURIComponent(s)+"?interval="+interval+"&range="+range,{headers:{"User-Agent":"Mozilla/5.0"}});
  return (await r.json()).chart.result[0];
}
async function one(s){
  try{
    const fut=/=[FX]$/.test(s),res=await chart(s,"5d","15m"),m=res.meta,off=m.gmtoffset||0,c=res.indicators.quote[0].close,t=[],p=[];
    (res.timestamp||[]).forEach((x,i)=>{if(c[i]!=null){t.push(x*1000);p.push(c[i])}});
    const L=t.length-1,idx=[];
    if(fut){const cut=t[L]-864e5;t.forEach((x,i)=>{if(x>=cut)idx.push(i)})}      // futures: last 24h
    else{const d=key(t[L],off);t.forEach((x,i)=>{if(key(x,off)===d)idx.push(i)})} // others: last trading day
    // open = inside today's regular session AND data is fresh (stale data means weekend/holiday/closed)
    const now=Date.now()/1000,cp=m.currentTradingPeriod&&m.currentTradingPeriod.regular,inWin=cp?now>=cp.start&&now<=cp.end:true,open=inWin&&now-t[L]/1000<7200;
    let prev;
    if(fut){try{prev=(await chart(s,"1d","15m")).meta.chartPreviousClose}catch(e){}}
    if(prev==null){const k=idx[0]-1;prev=k>=0?p[k]:m.chartPreviousClose}
    return [s,{price:m.regularMarketPrice??p[L],prev,time:m.regularMarketTime,day:key(t[L],off),open,spark:idx.map(i=>p[i])}];
  }catch(e){return [s,null]}
}
exports.handler=async()=>({
  statusCode:200,
  headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=60"},
  body:JSON.stringify(Object.fromEntries(await Promise.all(SYMS.map(one))))
});
