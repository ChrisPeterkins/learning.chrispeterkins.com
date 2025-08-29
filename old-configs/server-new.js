import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;
const isDev = process.env.NODE_ENV !== 'production';

// Serve static files
app.use(express.static(__dirname));

// Serve the main landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Three.js project
app.get('/three-js', (req, res) => {
    res.redirect('/three-js/');
});

app.get('/three-js/', (req, res) => {
    const indexPath = path.join(__dirname, 'projects/three-js/index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Three.js project not found');
    }
});

// Serve Three.js static files
app.use('/three-js', express.static(path.join(__dirname, 'projects/three-js')));

// React Patterns project  
app.get('/react-patterns', (req, res) => {
    res.redirect('/react-patterns/');
});

app.get('/react-patterns/', (req, res) => {
    const indexPath = path.join(__dirname, 'projects/react-patterns/index.html');
    if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf-8');
        // Fix paths for React app
        html = html.replace('src="/src/main.tsx"', 'src="/react-patterns/src/main.tsx"');
        html = html.replace('href="/src/', 'href="/react-patterns/src/');
        res.send(html);
    } else {
        res.status(404).send('React Patterns project not found');
    }
});

// Serve React Patterns static files and source
app.use('/react-patterns', express.static(path.join(__dirname, 'projects/react-patterns')));

// In development, we need to handle TypeScript/JSX files
if (isDev) {
    // Import Vite for development
    import('vite').then(({ createServer }) => {
        createServer({
            root: __dirname,
            server: {
                middlewareMode: true,
                hmr: {
                    port: 3003
                }
            },
            appType: 'custom'
        }).then(vite => {
            // Use Vite middleware for transforming modules
            app.use(vite.middlewares);
        });
    });
}

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

// 404 handler
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
                    background: #0a0f0d;
                    color: #f0f4f2;
                }
                .container {
                    text-align: center;
                }
                h1 {
                    font-size: 4rem;
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
                <h1>404</h1>
                <p>Page not found</p>
                <p><a href="/">← Back to Learning Hub</a></p>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Learning Hub server running on port ${PORT} in ${isDev ? 'development' : 'production'} mode`);
});