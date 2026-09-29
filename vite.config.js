import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ВСЕ ЗАПРОСЫ НА /API БУДУТ АВТОМАТИЧЕСКИ ПЕРЕНАПРАВЛЯТЬСЯ В DOCKER НА NGINX БЕЗ ОШИБОК CORS
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})