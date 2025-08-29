import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/projects/graphql-apis/',
  build: {
    outDir: '../../dist/projects/graphql-apis'
  }
})