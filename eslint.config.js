import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],
      "no-unused-vars": [
        "error",
        {
          args: "after-used",
        },
      ],
      "prefer-const": "error",
      quotes: ["error", "double"],
      semi: ["error", "always"],
      indent: ["error", 2],
      "space-before-function-paren": ["error", "never"],
    },
  },
  {
    ignores: ["coverage/**", "node_modules/**", "dist/**"],
  },
];

