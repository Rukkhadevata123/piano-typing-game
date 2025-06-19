import { defineConfig } from 'vite';
import { resolve } from 'path';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: isProd ? '/piano-typing-game/' : '/',
    
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
    
  resolve: {
    alias: {
      '/css': resolve(__dirname, 'src/css'),
      '/js': resolve(__dirname, 'src/js'),
    }
  },
    
  server: {
    port: 3000,
    open: true,
  }
});