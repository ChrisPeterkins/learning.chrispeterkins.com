import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/projects/data-visualization/',
  build: {
    outDir: '../../dist/projects/data-visualization'
  }
})