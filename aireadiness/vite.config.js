import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages base for repo: aireadiness (username: tonyawalker311)
export default defineConfig({
  plugins: [react()],
  base: '/aireadiness/'
})
