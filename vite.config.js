import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    chunkSizeWarningLimit: 1500, // เพิ่ม limit เพื่อไม่ให้ warning เตือน
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase'
            if (id.includes('react')) return 'react-vendor'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('tailwindcss')) return 'tailwind'
            if (id.includes('react-router-dom')) return 'router'
            return 'vendor'
          }
        }
      }
    }
  }
})
