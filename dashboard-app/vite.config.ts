import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy official Craft World GraphQL API to bypass CORS
      '/api/game': {
        target: 'https://craft-world.gg',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/game/, '/graphql'),
        secure: false,
      },
      // Proxy official Craft World authentication endpoints
      '/api/auth': {
        target: 'https://craft-world.gg',
        changeOrigin: true,
        secure: false,
      },
      // Proxy Ronin public RPC to query Katana pool reserves on-chain
      '/api/ronin-rpc': {
        target: 'https://api.roninchain.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ronin-rpc/, '/rpc'),
        secure: false,
      },
      // Proxy Thirdweb Embedded Wallet to spoof Origin/Referer headers
      '/api/thirdweb': {
        target: 'https://embedded-wallet.thirdweb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/thirdweb/, ''),
        secure: false,
        headers: {
          'Origin': 'https://craft-world.gg',
          'Referer': 'https://craft-world.gg/'
        }
      }
    }
  }
})
