#!/usr/bin/env node
import { spawn } from 'child_process'

// Run Vite with the unified config
const viteProcess = spawn('npx', ['vite', '--config', 'vite.config.unified.js', '--host'], {
  stdio: 'inherit',
  shell: true
})

viteProcess.on('error', (err) => {
  console.error('Failed to start Vite:', err)
  process.exit(1)
})

viteProcess.on('exit', (code) => {
  process.exit(code)
})