import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Izinkan request HTTPS dengan sertifikat self-signed / invalid di environment Node (dev server)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_PORT) || 5173

  const rawTarget = env.VITE_API_BASE_URL || 'https://abdullah-ubaid-pabwe2026-latihan-p9-be-golang-gin.s1if.cloud/api'
  let targetOrigin = 'https://abdullah-ubaid-pabwe2026-latihan-p9-be-golang-gin.s1if.cloud'
  try {
    if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://')) {
      targetOrigin = new URL(rawTarget).origin
    }
  } catch {
    // fallback default
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port,
      proxy: {
        '/api': {
          target: targetOrigin,
          changeOrigin: true,
          secure: false, // Mengizinkan sertifikat SSL/HTTPS yang tidak valid (untrusted root / self-signed)
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/main.jsx', 'src/setupTests.js', '**/*.test.{js,jsx}'],
        thresholds: {
          lines: 100,
          statements: 100,
        },
      },
    },
  }
})
