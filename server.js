import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Serve main landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Three.js routes
app.get('/projects/three-js', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/three-js/index.html'));
});

app.get('/projects/three-js/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/three-js/index.html'));
});

// Serve Three.js examples
app.get('/examples/*', (req, res) => {
  const filePath = path.join(__dirname, 'dist', req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Example not found');
    }
  });
});

// React Patterns routes - handle all sub-routes for React Router
app.get('/projects/react-patterns', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/react-patterns/index.html'));
});

app.get('/projects/react-patterns/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/react-patterns/index.html'));
});

// Web Audio routes - handle all sub-routes for React Router
app.get('/projects/web-audio', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/web-audio/index.html'));
});

app.get('/projects/web-audio/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/web-audio/index.html'));
});

// Canvas Animations routes - handle all sub-routes for React Router
app.get('/projects/canvas-animations', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/canvas-animations/index.html'));
});

app.get('/projects/canvas-animations/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/canvas-animations/index.html'));
});

// TypeScript Patterns routes - handle all sub-routes for React Router
app.get('/projects/typescript-patterns', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/typescript-patterns/index.html'));
});

app.get('/projects/typescript-patterns/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/typescript-patterns/index.html'));
});

// WebGL Shaders routes - handle all sub-routes for React Router
app.get('/projects/webgl-shaders', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/webgl-shaders/index.html'));
});

app.get('/projects/webgl-shaders/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/webgl-shaders/index.html'));
});

// Node.js Deep Dive routes - handle all sub-routes for React Router
app.get('/projects/nodejs-deep-dive', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/nodejs-deep-dive/index.html'));
});

app.get('/projects/nodejs-deep-dive/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/nodejs-deep-dive/index.html'));
});

// CSS Grid & Animations routes - handle all sub-routes for React Router
app.get('/projects/css-animations', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/css-animations/index.html'));
});

app.get('/projects/css-animations/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/css-animations/index.html'));
});

// Browser DevTools routes - handle all sub-routes for React Router
app.get('/projects/browser-devtools', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/browser-devtools/index.html'));
});

app.get('/projects/browser-devtools/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/browser-devtools/index.html'));
});

// Service Workers & PWAs routes - handle all sub-routes for React Router
app.get('/projects/service-workers-pwas', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/service-workers-pwas/index.html'));
});

app.get('/projects/service-workers-pwas/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/service-workers-pwas/index.html'));
});

// Performance Lab routes - handle all sub-routes for React Router  
app.get('/projects/performance-lab', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/performance-lab/index.html'));
});

app.get('/projects/performance-lab/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/performance-lab/index.html'));
});

// State Management routes - handle all sub-routes for React Router
app.get('/projects/state-management', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/state-management/index.html'));
});

app.get('/projects/state-management/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/state-management/index.html'));
});

// Creative Coding routes - handle all sub-routes for React Router
app.get('/projects/creative-coding', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/creative-coding/index.html'));
});

app.get('/projects/creative-coding/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/creative-coding/index.html'));
});

// Procedural Generation routes - handle all sub-routes for React Router
app.get('/projects/procedural-generation', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/procedural-generation/index.html'));
});

app.get('/projects/procedural-generation/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/projects/procedural-generation/index.html'));
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Not Found</title>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #004225 0%, #002615 100%);
          color: #f0f4f2;
        }
        .container {
          text-align: center;
        }
        h1 {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        a {
          color: #4ade80;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404</h1>
        <p>Page not found</p>
        <p><a href="/">← Back to Learning Hub</a></p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Learning Hub production server running on port ${PORT}`);
});