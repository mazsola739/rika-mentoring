import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('.', import.meta.url))
const lessonsDir = resolve(root, 'lessons')

// Every lesson is a folder lessons/<NN-slug>/ with solution/ (the finished app, a page of this site)
// and exercise/ (the learner's starting project: its own Vite app, not part of this build).
// Each lessons/<NN-slug>/solution/index.html is its own entry point with its own bundle.
const lessonEntries = existsSync(lessonsDir)
  ? Object.fromEntries(
      readdirSync(lessonsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && existsSync(resolve(lessonsDir, d.name, 'solution', 'index.html')))
        .map((d) => [`lessons/${d.name}/solution`, resolve(lessonsDir, d.name, 'solution', 'index.html')]),
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
  // Look for dependencies only in the site's own pages, not in the exercise projects.
  optimizeDeps: { entries: ['index.html', 'lessons/*/solution/index.html'] },
  preview: { port: 7020, strictPort: true },
  build: {
    rolldownOptions: {
      input: { main: resolve(root, 'index.html'), ...lessonEntries },
    },
  },
})
