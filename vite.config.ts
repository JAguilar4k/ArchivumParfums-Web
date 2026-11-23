import { existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// The API and this client share one .env: archivum-api-hexagonal/.env of a clone of
// ArchivumParfums-Hexagonal next to this one, as instalar.bat leaves them. Vite only gives the
// browser the VITE_ variables, so the secrets of the API stay out of the client.
// Without that file, as in CI or in a clone on its own, the .env of this folder applies.
const sharedEnvDir = fileURLToPath(new URL('../ArchivumParfums-Hexagonal/archivum-api-hexagonal/', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  envDir: existsSync(`${sharedEnvDir}.env`) ? sharedEnvDir : undefined,
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
