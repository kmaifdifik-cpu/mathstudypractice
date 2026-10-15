# Setup Guide

## Cloud Gaming

The cloud gaming frontend is ready at `cloud.html`. It includes:
- 26 games loaded from `cloud.json`
- Full WebRTC streaming player
- Input handling (keyboard, mouse, gamepad)
- Session management

### To make it work, you need a backend:

**Option A: Self-host the Stratus API (Recommended)**

1. Get a VPS (Ubuntu/Debian) or use a Node.js hosting service like Railway/Render
2. Install Bun.js:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```
3. Clone/copy the `stratus-api-main` folder to your server
4. Install dependencies:
   ```bash
   cd stratus-api-main/api
   bun install
   ```
5. Install and run malq (the email verification service):
   ```bash
   git clone https://github.com/VillainsRule/malq
   cd malq
   bun install
   bun src/main.ts
   ```
6. In another terminal, run the Stratus API:
   ```bash
   cd stratus-api-main/api
   bun api.js
   ```
7. Update `cloud.html` CONFIG.apiUrl to point to your server (e.g., `http://your-server-ip:3001`)

**Option B: Use the existing API**
- The API at `https://api.stratus.lol` may be available. Update CONFIG.apiUrl in `cloud.html` to use it.

### Quick config: Press `C` on the cloud gaming page to set your API URL and key.

---

## Proxy (Ultraviolet)

### Files needed:
- `uv.bundle.js` — Ultraviolet core
- `uv.config.js` — Configuration (bare server URLs)
- `uv.handler.js` — Request handler
- `uv.sw.js` — Service worker
- `proxy.html` — The proxy interface
- `bare-server.js` — Self-hosted bare server (optional)

### Deploying the bare server:

The bare server routes proxied traffic. You need one for the proxy to work.

**Option A: Use the included bare-server.js**

1. Deploy `bare-server.js` to any Node.js hosting (Railway, Render, Heroku, VPS):
   ```bash
   npm install
   node bare-server.js
   ```
2. Update `uv.config.js` to use your bare server URL:
   ```js
   bare: ['https://your-bare-server.com/'],
   ```

**Option B: Use a public bare server**

The `uv.config.js` already includes several public bare servers, but these may be unreliable. Self-hosting is recommended.

### Deploying the proxy:

1. Upload all files to your static host (Netlify, Vercel, GitHub Pages, etc.)
2. Make sure the file structure is:
   ```
   /uv/uv.bundle.js
   /uv/uv.config.js
   /uv/uv.handler.js
   /uv/uv.sw.js
   /proxy.html
   /bare-server.js
   ```
3. The proxy will automatically use the bare servers listed in `uv.config.js`

### Important notes:
- The proxy requires HTTPS (or localhost) for service workers to work
- If using GitHub Pages, the site must be served over HTTPS (which GitHub Pages provides by default)
- The bare server must support CORS (the included `bare-server.js` does)
- If the proxy doesn't work, check the browser console for errors (Shift+D in the proxy for debug info)

---

## File Structure

```
/
├── index.html          — Main site (links to cloud gaming)
├── cloud.html          — Cloud gaming page (game library + player)
├── cloud.json          — Game data (26 games)
├── uv.config.js        — Ultraviolet configuration
├── bare-server.js      — Self-hosted bare server for the proxy
├── proxy.html          — Full proxy interface (alternative to index.html)
├── sw.js               — Service worker for the main proxy
├── stratus-api-main/   — Cloud gaming backend (Bun.js server)
│   ├── api/
│   │   ├── api.js      — Main API server (Express)
│   │   ├── core.cjs    — Core session logic
│   │   ├── sites.json  — API key configuration
│   │   └── public/
│   │       └── e.html  — Embed player
│   ├── src/            — Frontend source
│   ├── cloud.json      — Full game list (180+ games)
│   └── package.json
└── mathstudypractice-main/ — Your main website files
```
