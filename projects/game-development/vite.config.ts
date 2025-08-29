import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/projects/game-development/',
  build: {
    outDir: '../../dist/projects/game-development'
  }
})