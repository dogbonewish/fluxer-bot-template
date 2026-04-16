import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // fluxer's apis need any casts pretty often, so we just allow it
      '@typescript-eslint/no-explicit-any': 'off',

      // the command/event handlers use dynamic require() to load files at runtime
      '@typescript-eslint/no-require-imports': 'off',

      // unused args prefixed with _ are intentional (e.g. _args, _client)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // empty catch blocks are used throughout intentionally, so only error on non-empty ones
      'no-empty': ['error', { allowEmptyCatch: true }],

      // logger.ts uses \x1b (ansi escape codes) in its strip-ansi regexes — that's fine
      'no-control-regex': 'off',

      // no var, use const/let
      'no-var': 'error',

      // always use === (except null checks)
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },
  {
    ignores: ['build/**', 'node_modules/**'],
  }
);
