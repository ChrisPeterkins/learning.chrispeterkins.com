const { spawn } = require('child_process');

const PORT = process.env.PORT || 3002;

// Start Vite preview server on the specified port
const viteProcess = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString(), '--host'], {
  cwd: '/var/www/learning.chrispeterkins.com',
  env: { ...process.env, PORT: PORT },
  stdio: 'inherit'
});

viteProcess.on('error', (err) => {
  console.error('Failed to start Vite server:', err);
  process.exit(1);
});

viteProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Vite process exited with code ${code}`);
    process.exit(code);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  viteProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  viteProcess.kill('SIGINT');
});

console.log(`Starting Vite preview server on port ${PORT}...`);