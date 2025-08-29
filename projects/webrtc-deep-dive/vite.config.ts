import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/projects/webrtc-deep-dive/',
  build: {
    outDir: '../../dist/projects/webrtc-deep-dive'
  }
})