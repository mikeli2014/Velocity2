import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // Node-side scripts (Playwright config, Vite config, e2e tests) run in
  // node and use process / __dirname / etc. Apply node globals there.
  {
    files: ['playwright.config.{js,ts}', 'vite.config.{js,ts}', 'tests/**/*.{js,ts,jsx,tsx}', 'eslint.config.{js,ts}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
])
