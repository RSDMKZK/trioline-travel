import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Serve static assets from public directory if present, otherwise root
const publicDir = join(__dirname, 'public');
if (existsSync(publicDir)) {
  app.use(express.static(publicDir));
}
app.use(express.static(__dirname));

// Health endpoint matching Vercel Serverless Function
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'TRIOLINE TRAVELS Global Operations & Flight Concierge',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Single-page fallback
app.get('*', (req, res) => {
  const publicIndex = join(publicDir, 'index.html');
  if (existsSync(publicIndex)) {
    return res.sendFile(publicIndex);
  }
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
