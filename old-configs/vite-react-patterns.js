#!/usr/bin/env node

import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const viteProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'projects', 'react-patterns'),
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