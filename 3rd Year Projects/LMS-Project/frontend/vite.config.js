import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- YEH SERVER CONFIGURATION ADD KAREIN ---
  server: {
    proxy: {
      // Jab bhi URL mein '/api' ho
      '/api': {
        // Usko is address par bhej do
        target: 'http://localhost:5001',
        // Origin ko badal do taaki security errors na aayein
        changeOrigin: true,
      },
    },
  },
});