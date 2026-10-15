/**
 * Bare Server for Ultraviolet Proxy
 * 
 * This is a minimal bare server that Ultraviolet uses to route proxied traffic.
 * Deploy this on any Node.js hosting (Railway, Render, Heroku, a VPS, etc.)
 * and update your uv.config.js with the URL.
 * 
 * Installation:
 *   npm install @tomphttp/bare-server-node
 *   node bare-server.js
 * 
 * Or use this simplified version with no dependencies:
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;

  // Health check
  if (url === '/health' || url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    return;
  }

  // Bare proxy endpoint: /bare?url=<encoded-url>
  const parsed = new URL(url, `http://${req.headers.host}`);
  const targetUrl = parsed.searchParams.get('url');

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing url parameter' }));
    return;
  }

  // Only allow http/https
  let target;
  try {
    target = new URL(targetUrl);
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Invalid protocol');
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid URL' }));
    return;
  }

  const proxyReq = {
    hostname: target.hostname,
    port: target.port || (target.protocol === 'https:' ? 443 : 80),
    path: target.pathname + target.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: target.host,
      'user-agent': req.headers['user-agent'] || 'Mozilla/5.0',
    },
  };

  // Hop-by-hop headers to remove
  const hopByHop = ['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'transfer-encoding', 'upgrade'];
  hopByHop.forEach(h => delete proxyReq.headers[h]);

  const transport = target.protocol === 'https:' ? https : http;

  const proxyRequest = transport.request(proxyReq, (proxyRes) => {
    // Remove CSP and other restrictive headers
    const headers = { ...proxyRes.headers };
    const removeHeaders = [
      'content-security-policy',
      'content-security-policy-report-only',
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security',
      'cross-origin-embedder-policy',
      'cross-origin-opener-policy',
      'cross-origin-resource-policy',
    ];
    removeHeaders.forEach(h => delete headers[h]);

    // Forward set-cookie with CORS
    if (headers['set-cookie']) {
      headers['access-control-allow-origin'] = '*';
    }

    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  proxyRequest.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad Gateway', message: err.message }));
  });

  req.pipe(proxyRequest);
});

server.listen(PORT, () => {
  console.log(`Bare server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
