# Markets dashboard (live)
Files: index.html (page) + netlify/functions/quotes.js (fetches prices).
Deploy free: push this folder to GitHub -> netlify.com -> "Add new site" -> Import from Git -> Deploy (no build command, publish dir = .).
Data: Yahoo Finance's unofficial public endpoint (no key). It can change or rate-limit without notice; for a commercial site use a licensed provider and edit quotes.js only.
