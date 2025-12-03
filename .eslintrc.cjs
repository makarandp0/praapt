/* eslint-disable no-undef */
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { sourceType: 'module', ecmaVersion: 'latest', ecmaFeatures: { jsx: true } },
  plugins: ['@typescript-eslint', 'import', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/prop-types': 'off', // Disabled for TypeScript projects - type checking is handled by TypeScript
    '@typescript-eslint/explicit-module-boundary-types': 'off' // Let TypeScript infer return types
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: { project: true },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] }
    }
  },
  ignorePatterns: ['**/dist/**', '**/node_modules/**']
};
