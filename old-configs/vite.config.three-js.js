import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname, 'projects/three-js'),
  server: {
    port: 3003,
    host: '0.0.0.0',
    strictPort: true,
    fs: {
      strict: false,
      allow: [
        resolve(__dirname, 'projects/three-js'),
        resolve(__dirname, 'node_modules'),
        resolve(__dirname)
      ]
    }
  },
  resolve: {
    alias: {
      'three': resolve(__dirname, 'node_modules/three/build/three.module.js'),
      'three/examples': resolve(__dirname, 'node_modules/three/examples')
    }
  },
  optimizeDeps: {
    include: ['three'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  build: {
    target: 'es2020',
    outDir: resolve(__dirname, 'dist/three-js'),
    emptyOutDir: true
  }
})