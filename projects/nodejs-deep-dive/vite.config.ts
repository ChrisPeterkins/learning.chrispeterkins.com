import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/projects/nodejs-deep-dive/',
  build: {
    outDir: '../../dist/projects/nodejs-deep-dive'
  }
})