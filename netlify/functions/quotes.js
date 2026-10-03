// Live quotes: price, previous close, and today's intraday points for the mini charts.
const SYMS=["^GSPC","^IXIC","^DJI","YM=F","^GDAXI","^FTSE","^STOXX50E","^STOXX","^N225","^HSI","^BSESN","^NSEI","CL=F","BZ=F","GC=F","SI=F","INR=X"];
async function one(s){
  try{
    const r=await fetch("https://query1.finance.yahoo.com/v8/finance/chart/"+encodeURIComponent(s)+"?interval=15m&range=1d",{headers:{"User-Agent":"Mozilla/5.0"}});
    const res=(await r.json()).chart.result[0],m=res.meta;
    const spark=(res.indicators.quote[0].close||[]).filter(x=>x!=null);
    return [s,{price:m.regularMarketPrice,prev:m.chartPreviousClose??m.previousClose,time:m.regularMarketTime,spark}];
  }catch(e){return [s,null]}
}
exports.handler=async()=>({
  statusCode:200,
  headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=60"},
  body:JSON.stringify(Object.fromEntries(await Promise.all(SYMS.map(one))))
});
