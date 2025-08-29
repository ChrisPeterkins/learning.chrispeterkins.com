import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/projects/state-management/',
  build: {
    outDir: '../../dist/projects/state-management',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-libs': ['zustand', 'jotai', 'valtio'],
          'redux': ['@reduxjs/toolkit', 'react-redux'],
          'utils': ['immer', 'recharts']
        }
      }
    }
  },
  server: {
    port: 3003
  }
})