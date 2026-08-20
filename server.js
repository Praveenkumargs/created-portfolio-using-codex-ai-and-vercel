const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const messagesFile = path.join(dataDir, 'contact-messages.json');

const mimeTypes = { '.css': 'text/css', '.js': 'application/javascript', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml' };

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function saveMessage(message) {
  fs.mkdirSync(dataDir, { recursive: true });
  let messages = [];
  if (fs.existsSync(messagesFile)) {
    try { messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8')); } catch { messages = []; }
  }
  messages.push(message);
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/contact') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 20_000) req.destroy();
    });
    req.on('end', () => {
      try {
        const { name, email, message } = JSON.parse(body);
        const clean = {
          name: String(name || '').trim(),
          email: String(email || '').trim(),
          message: String(message || '').trim(),
          receivedAt: new Date().toISOString()
        };
        if (clean.name.length < 2 || !/^\S+@\S+\.\S+$/.test(clean.email) || clean.message.length < 10) {
          return sendJson(res, 400, { ok: false, message: 'Please enter your name, a valid email, and a message of at least 10 characters.' });
        }
        saveMessage(clean);
        sendJson(res, 201, { ok: true, message: 'Thanks — your message has been received. I’ll get back to you soon.' });
      } catch {
        sendJson(res, 400, { ok: false, message: 'Something went wrong. Please try again.' });
      }
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { message: 'Method not allowed' });
  const requested = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
  const filePath = path.normalize(path.join(publicDir, requested));
  if (!filePath.startsWith(publicDir)) return sendJson(res, 403, { message: 'Forbidden' });
  fs.readFile(filePath, (error, content) => {
    if (error) return sendJson(res, 404, { message: 'Not found' });
    res.writeHead(200, { 'Content-Type': `${mimeTypes[path.extname(filePath)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(req.method === 'HEAD' ? undefined : content);
  });
});

server.listen(port, () => console.log(`Portfolio running at http://localhost:${port}`));
