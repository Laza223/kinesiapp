import { defineConfig, configDefaults } from 'vitest/config'
import path from 'node:path'

const alias = { '@': path.resolve(__dirname, './src') }

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: { alias },
  test: {
    // Una sola base compartida: los archivos de integración corren de a uno para no pisarse.
    // (En Vitest 3 es una opción de la raíz, no por proyecto.)
    fileParallelism: false,
    unstubEnvs: true,
    unstubGlobals: true,
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
          exclude: [...configDefaults.exclude, '.tmp/**'],
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'integration',
          environment: 'node',
          include: ['tests/integration/**/*.test.ts'],
          setupFiles: ['./tests/setup-integration.ts'],
          testTimeout: 20_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
})
