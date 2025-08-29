#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// Start Vite dev server for Three.js project
const vite = spawn('npx', ['vite', '--config', 'vite.config.three-js.js', '--host'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  env: { ...process.env }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  vite.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  vite.kill('SIGTERM');
  process.exit();
});

vite.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
  process.exit(code);
});