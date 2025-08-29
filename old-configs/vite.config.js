import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        basics: resolve(__dirname, 'examples/01-basics/index.html'),
        geometries: resolve(__dirname, 'examples/02-geometries/index.html'),
        materials: resolve(__dirname, 'examples/03-materials/index.html'),
        lighting: resolve(__dirname, 'examples/04-lighting/index.html'),
        animation: resolve(__dirname, 'examples/05-animation/index.html'),
        controls: resolve(__dirname, 'examples/06-controls/index.html'),
        textures: resolve(__dirname, 'examples/07-textures/index.html'),
        models: resolve(__dirname, 'examples/08-models/index.html'),
        interaction: resolve(__dirname, 'examples/09-interaction/index.html'),
        physics: resolve(__dirname, 'examples/10-physics/index.html'),
        shaders: resolve(__dirname, 'examples/11-shaders/index.html'),
        gameConepts: resolve(__dirname, 'examples/12-game-concepts/index.html'),
      }
    }
  }
});