import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/projects/performance-lab/',
  build: {
    outDir: '../../dist/projects/performance-lab',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'virtualization': ['react-window'],
          'monitoring': ['web-vitals', 'react-intersection-observer']
        }
      }
    }
  },
  server: {
    port: 3001
  }
})