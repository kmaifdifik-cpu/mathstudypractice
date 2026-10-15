/**
 * ClassroomSpot bare server (Bare v3, Ultraviolet-compatible).
 *
 * Zero dependencies — plain Node.js. Deploy anywhere Node runs
 * (Render, Railway, VPS...), then put the URL in uv.config.js `bare`.
 *
 * Deploy on Render (free):
 *   1. dashboard.render.com -> New -> Blueprint
 *   2. Select your repo (render.yaml is already in it)
 *   3. Deploy, then copy the https://....onrender.com URL
 *   4. Set it as the `bare` URL in uv.config.js and redeploy the site
 */
const http = require("http");
const https = require("https");

const PORT = process.env.PORT || 8080;

// Hop-by-hop headers must never be forwarded either direction.
const HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "content-length",
]);

function cleanHeaders(src) {
  const out = {};
  for (const k of Object.keys(src || {})) {
    if (!HOP.has(k.toLowerCase())) out[k] = src[k];
  }
  return out;
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Expose-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (!req.url.startsWith("/v1/")) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("classroomspot bare v3 — ok");
    return;
  }

  const proto = req.headers["x-bare-protocol"];
  const host = req.headers["x-bare-host"];
  const path = req.headers["x-bare-path"] || "/";
  const port = parseInt(
    req.headers["x-bare-port"] || (proto === "https:" ? "443" : "80"),
    10
  );

  let fwdHeaders = {};
  try {
    fwdHeaders = JSON.parse(req.headers["x-bare-headers"] || "{}");
  } catch {
    fwdHeaders = {};
  }

  if (!proto || !host || (proto !== "http:" && proto !== "https:")) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("bad bare headers");
    return;
  }

  const outHeaders = cleanHeaders(fwdHeaders);
  outHeaders["host"] = host;
  outHeaders["connection"] = "close";

  const transport = proto === "https:" ? https : http;
  const preq = transport.request(
    { hostname: host, port, path, method: req.method, headers: outHeaders },
    (pres) => {
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "*",
        "x-bare-status": String(pres.statusCode),
        "x-bare-status-text": pres.statusMessage || "",
        "x-bare-headers": JSON.stringify(cleanHeaders(pres.headers)),
      });
      pres.pipe(res);
    }
  );

  preq.on("error", () => {
    try {
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end("upstream error");
    } catch {}
  });
  preq.setTimeout(25000, () => {
    try {
      preq.destroy();
    } catch {}
  });

  req.pipe(preq);
});

server.listen(PORT, () => console.log(`classroomspot bare v3 on :${PORT}`));
