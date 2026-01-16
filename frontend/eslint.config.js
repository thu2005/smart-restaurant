import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
      "no-empty": "warn",  // Downgrade empty blocks to warning
      "no-unreachable": "warn",
      "no-undef": "warn"
    },
    ignores: ["dist/", "node_modules/", ".env*"],
  },
];
