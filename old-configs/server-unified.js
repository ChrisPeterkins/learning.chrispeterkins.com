import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

async function createServer() {
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: {
        port: 3003
      }
    },
    appType: 'spa',
    root: __dirname,
  });

  // Use Vite's middleware
  app.use(vite.middlewares);

  // Serve the main landing page
  app.get('/', async (req, res) => {
    try {
      const html = await vite.transformIndexHtml(req.url, 
        `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learning Hub - Chris Peterkins</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>${await vite.ssrLoadModule('/index.css').then(m => m.default || '').catch(() => '')}</style>
</head>
<body>
    ${require('fs').readFileSync(path.join(__dirname, 'index.html'), 'utf-8').match(/<body[^>]*>([\s\S]*)<\/body>/)[1]}
</body>
</html>`);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });

  // Three.js project route
  app.get('/three-js', (req, res) => {
    res.redirect('/three-js/');
  });

  app.get('/three-js/*', async (req, res, next) => {
    const url = req.url.replace('/three-js', '');
    const filepath = path.join(__dirname, 'projects/three-js', url === '/' ? 'index.html' : url);
    
    if (url === '/' || url.endsWith('.html')) {
      try {
        let html = require('fs').readFileSync(filepath, 'utf-8');
        html = await vite.transformIndexHtml(req.url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next();
      }
    } else {
      next();
    }
  });

  // React Patterns project route  
  app.get('/react-patterns', (req, res) => {
    res.redirect('/react-patterns/');
  });

  app.get('/react-patterns/*', async (req, res, next) => {
    const url = req.url.replace('/react-patterns', '');
    const filepath = path.join(__dirname, 'projects/react-patterns', url === '/' ? 'index.html' : url);
    
    if (url === '/' || url.endsWith('.html')) {
      try {
        let html = require('fs').readFileSync(filepath, 'utf-8');
        // Transform paths for React project
        html = html.replace(/src="\/src\//g, 'src="/react-patterns/src/');
        html = html.replace(/href="\/src\//g, 'href="/react-patterns/src/');
        html = await vite.transformIndexHtml(req.url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next();
      }
    } else if (url.startsWith('/src/')) {
      // Serve React source files
      const srcPath = path.join(__dirname, 'projects/react-patterns', url);
      try {
        const content = require('fs').readFileSync(srcPath, 'utf-8');
        const transformed = await vite.transformRequest(srcPath, vite);
        res.status(200).set({ 'Content-Type': 'application/javascript' }).end(transformed.code);
      } catch (e) {
        next();
      }
    } else {
      next();
    }
  });

  // Future projects placeholder routes
  app.get(['/webgl-shaders', '/web-audio'], (req, res) => {
    const projectName = req.path.slice(1).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>${projectName} - Coming Soon</title>
          <style>
              body {
                  font-family: 'Inter', sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background: #0a0f0d;
                  color: #f0f4f2;
              }
              .container {
                  text-align: center;
              }
              h1 {
                  font-size: 3rem;
                  margin-bottom: 1rem;
              }
              p {
                  font-size: 1.2rem;
                  color: #8fa99b;
              }
              a {
                  color: #4ade80;
                  text-decoration: none;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>${projectName}</h1>
              <p>Coming Soon!</p>
              <p><a href="/">← Back to Learning Hub</a></p>
          </div>
      </body>
      </html>
    `);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Unified Learning Hub server running on port ${PORT}`);
  });
}

createServer().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});