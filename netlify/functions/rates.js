// Daily exchange rates for ALL currencies (USD base), cached in memory and at the Netlify CDN.
// Free, no key: open.er-api.com (attribution required, see index.html). Better for a public site:
// create a free key at exchangerate-api.com and set it in Netlify as EXCHANGERATE_API_KEY.
let cache=null;
exports.handler=async()=>{
  try{
    if(!cache||Date.now()-cache.t>6*36e5){
      const k=process.env.EXCHANGERATE_API_KEY;
      const url=k?"https://v6.exchangerate-api.com/v6/"+k+"/latest/USD":"https://open.er-api.com/v6/latest/USD";
      const j=await (await fetch(url)).json(),rates=j.rates||j.conversion_rates;
      if(!rates)throw new Error("no rates");
      cache={t:Date.now(),body:JSON.stringify({rates,updated:j.time_last_update_utc||null})};
    }
    return {statusCode:200,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=3600","Netlify-CDN-Cache-Control":"public, max-age=21600, stale-while-revalidate=86400"},body:cache.body};
  }catch(e){return {statusCode:502,body:JSON.stringify({error:"rates unavailable"})}}
};
