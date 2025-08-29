import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/projects/testing-strategies/',
  build: {
    outDir: '../../dist/projects/testing-strategies'
  }
})