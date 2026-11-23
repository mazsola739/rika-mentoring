import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('.', import.meta.url))
const appsDir = resolve(root, 'apps')

// Minden apps/<slug>/index.html egy önálló micro frontend: saját belépési pont, saját bundle.
const appEntries = existsSync(appsDir)
  ? Object.fromEntries(
      readdirSync(appsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && existsSync(resolve(appsDir, d.name, 'index.html')))
        .map((d) => [`apps/${d.name}`, resolve(appsDir, d.name, 'index.html')]),
    )
  : {}

export default defineConfig({
  // Relatív base: a build bármelyik GitHub Pages alútvonalon működik.
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@shared': resolve(root, 'shared') },
  },
  // Local dev address: http://localhost:7020. strictPort: fail instead of moving to another port.
  server: { port: 7020, strictPort: true },
  preview: { port: 7020, strictPort: true },
  build: {
    rolldownOptions: {
      input: { main: resolve(root, 'index.html'), ...appEntries },
    },
  },
})
