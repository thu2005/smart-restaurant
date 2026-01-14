import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        // Node.js globals
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        global: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
      },
      ecmaVersion: 2022,
      sourceType: "commonjs", // Backend uses CommonJS
    },
    rules: {
      "no-console": "off", // Allow console.log in backend
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-case-declarations": "warn", // Allow case declarations
    },
    ignores: ["node_modules/", "dist/", "uploads/", "prisma/migrations/"],
  },
];
