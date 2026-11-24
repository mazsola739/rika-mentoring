import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite is the development server and the build tool; the React plugin teaches it JSX.
export default defineConfig({
  plugins: [react()],
})
