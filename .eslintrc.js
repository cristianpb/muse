module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module'
  },
  env: {
    es6: true,
    browser: true,
    node: true
  },
  extends: [
    //'eslint:recommended'
    'plugin:svelte/recommended'
  ],
  plugins: [
    'svelte'
  ],
  ignorePatterns: [
    '__sapper__/',
    'build/',
    'cypress/',
  ],
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte/svelte'
    }
  ],
  rules: {
    // semi: ['error', 'never'] // uncomment if you want to remove ;
  },
  settings: {
    // ...
  }
}
