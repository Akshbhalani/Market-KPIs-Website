# Markets dashboard (live)
index.html = page. netlify/functions/quotes.js = live prices. netlify/functions/history.js = chart history.
Deploy: push to GitHub, import into Netlify (no build command). Data: Yahoo Finance unofficial endpoints (may be delayed ~15 min, can change without notice).

rates.js = daily rates for all ~160 currencies (open.er-api.com). For a public site, get a free key at exchangerate-api.com and set EXCHANGERATE_API_KEY in Netlify (Site settings > Environment variables).
