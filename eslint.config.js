import typescriptEslint from 'typescript-eslint';

export default [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: typescriptEslint.parser,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
    },
  },
];
