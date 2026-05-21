import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "contracts/artifacts/**",
    "contracts/cache/**",
  ]),
]);

export default eslintConfig;
