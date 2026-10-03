// Fetches quotes server-side (no CORS issues) and caches them for 60s.
const SYMS=["CL=F","BZ=F","GC=F","SI=F","^GSPC","^IXIC","^DJI","^GDAXI","^FTSE","^STOXX50E","^N225","^HSI","^BSESN","^NSEI"];
async function one(s){
  try{
    const r=await fetch("https://query1.finance.yahoo.com/v8/finance/chart/"+encodeURIComponent(s)+"?interval=1d&range=5d",{headers:{"User-Agent":"Mozilla/5.0"}});
    const m=(await r.json()).chart.result[0].meta;
    return [s,{price:m.regularMarketPrice,prev:m.chartPreviousClose??m.previousClose,time:m.regularMarketTime}];
  }catch(e){return [s,null]}
}
exports.handler=async()=>({
  statusCode:200,
  headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=60"},
  body:JSON.stringify(Object.fromEntries(await Promise.all(SYMS.map(one))))
});
