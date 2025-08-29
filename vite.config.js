import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  server: {
    port: 3002,
    host: '0.0.0.0',
    strictPort: true,
    hmr: false,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'learning.chrispeterkins.com',
      '.chrispeterkins.com'
    ],
    middlewareMode: false,
    fs: {
      strict: false
    }
  },
  appType: 'mpa',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        reactPatterns: path.resolve(__dirname, 'projects/react-patterns/index.html'),
        threeJs: path.resolve(__dirname, 'projects/three-js/index.html'),
        webAudio: path.resolve(__dirname, 'projects/web-audio/index.html'),
        canvasAnimations: path.resolve(__dirname, 'projects/canvas-animations/index.html'),
        typescriptPatterns: path.resolve(__dirname, 'projects/typescript-patterns/index.html'),
        webglShaders: path.resolve(__dirname, 'projects/webgl-shaders/index.html'),
        dataVisualization: path.resolve(__dirname, 'projects/data-visualization/index.html'),
        gameDevelopment: path.resolve(__dirname, 'projects/game-development/index.html'),
        graphqlApis: path.resolve(__dirname, 'projects/graphql-apis/index.html'),
        testingStrategies: path.resolve(__dirname, 'projects/testing-strategies/index.html'),
        algorithmVisualizations: path.resolve(__dirname, 'projects/algorithm-visualizations/index.html'),
        webrtcDeepDive: path.resolve(__dirname, 'projects/webrtc-deep-dive/index.html'),
        webassembly: path.resolve(__dirname, 'projects/webassembly/index.html'),
        stateManagement: path.resolve(__dirname, 'projects/state-management/index.html'),
        creativeCoding: path.resolve(__dirname, 'projects/creative-coding/index.html'),
        proceduralGeneration: path.resolve(__dirname, 'projects/procedural-generation/index.html')
      }
    }
  },
  resolve: {
    alias: {
      '/react-patterns/src': path.resolve(__dirname, 'projects/react-patterns/src'),
      '/three-js/src': path.resolve(__dirname, 'projects/three-js/src'),
      '/web-audio/src': path.resolve(__dirname, 'projects/web-audio/src'),
      '/canvas-animations/src': path.resolve(__dirname, 'projects/canvas-animations/src'),
      '/typescript-patterns/src': path.resolve(__dirname, 'projects/typescript-patterns/src'),
      '/webgl-shaders/src': path.resolve(__dirname, 'projects/webgl-shaders/src'),
      '/data-visualization/src': path.resolve(__dirname, 'projects/data-visualization/src'),
      '/game-development/src': path.resolve(__dirname, 'projects/game-development/src'),
      '/graphql-apis/src': path.resolve(__dirname, 'projects/graphql-apis/src'),
      '/testing-strategies/src': path.resolve(__dirname, 'projects/testing-strategies/src'),
      '/algorithm-visualizations/src': path.resolve(__dirname, 'projects/algorithm-visualizations/src'),
      '/webrtc-deep-dive/src': path.resolve(__dirname, 'projects/webrtc-deep-dive/src'),
      '/webassembly/src': path.resolve(__dirname, 'projects/webassembly/src'),
      '/state-management/src': path.resolve(__dirname, 'projects/state-management/src'),
      '/creative-coding/src': path.resolve(__dirname, 'projects/creative-coding/src'),
      '/procedural-generation/src': path.resolve(__dirname, 'projects/procedural-generation/src')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'three', 'd3']
  }
})