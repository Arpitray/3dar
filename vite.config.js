import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to all IPv4 and IPv6 interfaces
    host: '[::]',
    port: 5173,
    strictPort: false,
    // Allow ngrok and local domains
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'unmercifully-stellar-stacia.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.dev',
    ],
    
    // Middleware headers for AR/Camera access & CORS
    middlewareMode: false,
    headers: {
      // Required for WebXR/AR access
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Permissions-Policy': 'camera=*, microphone=*',
      // Allow mobile device connections
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    
    // Keep-alive for slow mobile connections
    keepAliveTimeout: 65000,
    headersTimeout: 66000,
  },
  
  publicDir: 'public',
  
  // Optimize for mobile
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
  },
})
