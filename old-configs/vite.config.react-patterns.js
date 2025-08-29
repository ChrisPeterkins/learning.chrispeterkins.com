import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'projects/react-patterns'),
  base: '/react-patterns/',
  server: {
    port: 3003,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      port: 3003
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
})