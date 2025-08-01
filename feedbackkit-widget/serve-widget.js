/*
  Simple static server for the FeedbackKit standalone bundle.
  Usage:
    npm run serve:widget            # serves dist/ on http://localhost:8080
    PORT=9000 npm run serve:widget  # custom port
*/

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html; charset=UTF-8',
  '.css':  'text/css; charset=UTF-8',
  '.js':   'application/javascript; charset=UTF-8',
  '.svg':  'image/svg+xml',
  '.json': 'application/json; charset=UTF-8'
};

const server = http.createServer((req, res) => {
  // Prevent directory traversal
  const unsafePath = path.normalize(req.url.split('?')[0]).replace(/^\/+/, '');
  let filePath = path.join(DIST_DIR, unsafePath);

  // If the request is to a directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 – File not found');
      return;
    }

    const ext = path.extname(filePath);
    const type = MIME[ext] || 'application/octet-stream';
    const headers = { 'Content-Type': type };

    // Long-term caching for JS/CSS (but not HTML)
    if (ext === '.js' || ext === '.css') {
      headers['Cache-Control'] = 'public,max-age=31536000,immutable';
    }

    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\nFeedbackKit Widget served from ${DIST_DIR}`);
  console.log(`Open http://localhost:${PORT}/standalone/test.html`);
}); 