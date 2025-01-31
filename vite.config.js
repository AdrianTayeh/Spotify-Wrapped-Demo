// filepath: /Users/adriantayeh/Documents/Webbutveckling/Javascript2/spotify-wrapped/vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  publicDir: 'public'
});