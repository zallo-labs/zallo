module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "standard",
    "plugin:prettier/recommended",
    "plugin:node/recommended",
  ],
  //https://www.npmjs.com/package/@typescript-eslint/parser
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "2021",
  },
  rules: {},
};
