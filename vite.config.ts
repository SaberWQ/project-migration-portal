import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ваш плагин для React

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'project-migration-portal.onrender.com'
    ]
  }
})
