/* eslint-env node */
import { defineConfig } from 'vitest/config'

import eslint from 'vite-plugin-eslint'
import dts from 'vite-plugin-dts'

import pkg from './package.json' assert { type: 'json' }

export default defineConfig({
  plugins: [
    eslint({
      lintOnStart: false,
    }),
    dts({ insertTypesEntry: true, rollupTypes: true, logLevel: 'error' }),
  ],
  build: {
    lib: {
      entry: './lib/index.ts',
      name: pkg.name.split('/').at(-1),
    },
    sourcemap: true,
  },
  test: {
    setupFiles: [
      './vitest.setup.mjs',
    ],
    coverage: {
      enabled: true,
      reporter: ['text', 'lcov'],
    },
  },
})
