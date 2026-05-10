import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: ["bin/**", "node_modules/**", "sdks/**"],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];
