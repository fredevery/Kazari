module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: ['./tsconfig.json', './tsconfig.main.json', './tsconfig.renderer.json', './tsconfig.preload.json']
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-refresh'
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-refresh/only-export-components': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  overrides: [
    {
      files: ['src/main/**/*.ts'],
      env: {
        node: true,
        browser: false
      }
    },
    {
      files: ['src/renderer/**/*.tsx', 'src/renderer/**/*.ts'],
      env: {
        browser: true,
        node: false
      }
    },
    {
      files: ['src/preload/**/*.ts'],
      env: {
        node: true,
        browser: true
      }
    },
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true
      }
    }
  ]
};
