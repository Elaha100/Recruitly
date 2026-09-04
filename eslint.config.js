import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
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
    rules: {
      // Flags the standard async-fetch-then-setState pattern used by every
      // data hook in this app (useJobs, useCandidates, ...) as an error.
      // That pattern is intentional here, not a bug.
      'react-hooks/set-state-in-effect': 'off',
      // Context files intentionally export both the provider component and
      // its `useX()` hook together, which is the standard React pattern.
      'react-refresh/only-export-components': 'off',
    },
  },
])
