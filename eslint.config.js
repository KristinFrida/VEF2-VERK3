// eslint.config.cjs
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    quotes: ['error', 'single'],
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error', 'info'],
      },
    ],
  },
  ignorePatterns: ['node_modules/', 'dist/'],
};
