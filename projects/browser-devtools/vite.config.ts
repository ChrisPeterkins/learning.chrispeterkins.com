import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/projects/browser-devtools/',
  build: {
    outDir: '../../dist/projects/browser-devtools'
  }
})