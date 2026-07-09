# Random Joke Generator

This repo contains a small Random Joke Generator demo: a browser client that fetches jokes from JokeAPI and an optional Node.js Express proxy to fetch dad jokes from icanhazdadjoke (avoids CORS).

Files added:
- index.html — single-file client you can open in the browser
- server.js — optional Express proxy for icanhazdadjoke
- README.md — this file

Quick start (client-only):
1. Open index.html in your browser (works as-is using JokeAPI).

Quick start (with proxy for dad jokes):
1. Install dependencies:
   - Node 18+ is recommended. If using older Node, install node-fetch and adjust server.js.
   - npm init -y
   - npm install express
2. Run the proxy:
   - node server.js
3. Open index.html in a browser. When you click "Get dad joke (icanhazdadjoke via proxy)", the client will call /api/dadjoke which the server proxies to icanhazdadjoke.

Notes:
- JokeAPI (https://v2.jokeapi.dev) returns two types of jokes: "single" and "twopart". This demo handles both.
- icanhazdadjoke requires the Accept header and often disallows cross-origin requests; the proxy demonstrates how to fetch it server-side.
