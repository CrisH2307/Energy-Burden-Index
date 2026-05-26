import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ArcGIS JS API generates many chunks — suppress warnings
    chunkSizeWarningLimit: 5000,
  },
})
