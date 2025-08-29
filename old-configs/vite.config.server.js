import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: {
    host: '0.0.0.0',
    port: 3002,
    strictPort: true,
    hmr: {
      host: 'learning.chrispeterkins.com',
      port: 80
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        basics: resolve(process.cwd(), 'examples/01-basics/index.html'),
        geometries: resolve(process.cwd(), 'examples/02-geometries/index.html'),
        materials: resolve(process.cwd(), 'examples/03-materials/index.html'),
        lighting: resolve(process.cwd(), 'examples/04-lighting/index.html'),
        animation: resolve(process.cwd(), 'examples/05-animation/index.html'),
        controls: resolve(process.cwd(), 'examples/06-controls/index.html'),
        textures: resolve(process.cwd(), 'examples/07-textures/index.html'),
        models: resolve(process.cwd(), 'examples/08-models/index.html'),
        interaction: resolve(process.cwd(), 'examples/09-interaction/index.html'),
        physics: resolve(process.cwd(), 'examples/10-physics/index.html'),
        shaders: resolve(process.cwd(), 'examples/11-shaders/index.html'),
        gameConepts: resolve(process.cwd(), 'examples/12-game-concepts/index.html'),
      }
    }
  }
});