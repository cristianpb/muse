module.exports = {
  root: true,
  ignorePatterns: ["dist/*", "cypress/*", "build/*"],
  extends: ["eslint:recommended", "plugin:svelte/recommended", "prettier"],
  rules: {
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    extraFileExtensions: [".svelte"],
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
};
