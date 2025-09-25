module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    // Add your new rule here:
    // quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    quotes: 'off',
  },
};
