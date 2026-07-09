/**
 * Optional Express proxy for icanhazdadjoke (avoids CORS from the browser).
 * Requires Node.js 18+ (has global fetch) or install node-fetch.
 *
 * Run:
 *   npm init -y
 *   npm install express
 *   node server.js
 *
 * Then open index.html from the project root (served by an HTTP server), or
 * serve the static index.html from this express app by uncommenting the static lines.
 */

import express from 'express';
// If you're on Node <18, uncomment below after `npm i node-fetch`:
// import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// OPTIONAL: serve the index.html and assets from the same server
// import path from 'path';
// app.use(express.static(path.join(process.cwd())));

app.get('/api/dadjoke', async (req, res) => {
  try {
    const r = await fetch('https://icanhazdadjoke.com/', {
      headers: { Accept: 'application/json', 'User-Agent': 'Random-Joke-Generator/1.0' },
    });
    if (!r.ok) return res.status(502).json({ error: 'Bad gateway fetching dad joke' });
    const json = await r.json();
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Joke proxy running at http://localhost:${PORT}/api/dadjoke`);
});
