module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
    es2020: true,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'no-restricted-syntax': [
          'warn',
          {
            selector:
              'JSXElement[name.name=/^(Button|button|Link|link|A|a)$/] > JSXText[value=/\\w/]',
            message:
              'Use a COPY constant instead of hardcoded text in interactive elements. Import COPY from "@learn-easy/ui" and use {COPY.keyName}.',
          },
        ],
      },
    },
  ],
  rules: {},
};
