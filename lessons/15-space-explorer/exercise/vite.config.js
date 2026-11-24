import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite is the development server and the build tool; the React plugin teaches it JSX.
export default defineConfig({
  plugins: [react()],
  // The pretend space API (src/mocks, with all its drawings) makes the built file bigger than usual.
  // That is fine here, so Vite does not need to warn about it.
  build: { chunkSizeWarningLimit: 1000 },
})
