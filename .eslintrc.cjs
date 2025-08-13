module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { tsconfigRootDir: __dirname, project: ["./tsconfig.base.json"] },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["dist", "node_modules"],
  rules: {}
};
