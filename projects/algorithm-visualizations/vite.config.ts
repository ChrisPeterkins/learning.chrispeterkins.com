import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/projects/algorithm-visualizations/',
  build: {
    outDir: '../../dist/projects/algorithm-visualizations'
  }
})