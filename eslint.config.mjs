import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig, globalIgnores } from "eslint/config";
import { resolve } from "path";
import tseslint from "typescript-eslint";

// ─────────────────────────────────────────────────────────────────────────────
// 2. REUSABLE RULE SETS
// ─────────────────────────────────────────────────────────────────────────────

const IMPORT_RULES = {
  "import/no-cycle": "error",
  "import/order": [
    "error",
    {
      groups: ["builtin", "external", "internal", ["parent", "sibling", "index"], "type"],
      "newlines-between": "always",
      alphabetize: { order: "asc", caseInsensitive: true },
    },
  ],
  "import/consistent-type-specifier-style": ["error", "prefer-inline"],
};

const TYPESCRIPT_RULES = {
  // Correctness
  "@typescript-eslint/no-unnecessary-type-assertion": "error",
  "@typescript-eslint/prefer-return-this-type": "error",
  "@typescript-eslint/no-confusing-void-expression": "error",
  "@typescript-eslint/require-await": "error",

  // Nullish coalescing (but allow primitives as falsy checks are often intentional)
  "@typescript-eslint/prefer-nullish-coalescing": [
    "error",
    { ignorePrimitives: { string: true, number: true, boolean: true } },
  ],

  // Type safety
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-non-null-assertion": "warn",
  "@typescript-eslint/no-empty-object-type": "error",

  // Unused variables (ignore _-prefixed)
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    },
  ],

  // Import style
  "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports", fixStyle: "inline-type-imports" }],

  // Idiomatic patterns
  "@typescript-eslint/prefer-optional-chain": "error",
};

const SPACING_RULES = {
  "lines-between-class-members": [
    "error",
    {
      enforce: [
        { blankLine: "always", prev: "field", next: "field" },
        { blankLine: "always", prev: "field", next: "method" },
        { blankLine: "always", prev: "method", next: "field" },
        { blankLine: "always", prev: "method", next: "method" },
      ],
    },
  ],

  "padding-line-between-statements": [
    "error",
    // Directives (use strict)
    { blankLine: "always", prev: "directive", next: "*" },
    { blankLine: "any", prev: "directive", next: "directive" },
    // Imports
    { blankLine: "always", prev: "import", next: "*" },
    { blankLine: "any", prev: "import", next: "import" },
    // Variable declarations
    { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
    { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
    // Return statements
    { blankLine: "always", prev: "*", next: "return" },
    { blankLine: "any", prev: ["const", "let", "var"], next: "return" },
    // Throw statements
    { blankLine: "always", prev: "*", next: "throw" },
    { blankLine: "any", prev: ["const", "let", "var"], next: "throw" },
    // Control flow
    { blankLine: "always", prev: "*", next: ["if", "for", "while", "do", "switch", "try"] },
    { blankLine: "always", prev: ["if", "for", "while", "do", "switch", "try"], next: "*" },
    { blankLine: "any", prev: ["const", "let", "var"], next: ["if", "for", "while", "do", "switch", "try"] },
    // Declarations
    { blankLine: "always", prev: "*", next: ["function", "class"] },
    { blankLine: "always", prev: ["function", "class"], next: "*" },
    // Multiline expressions
    { blankLine: "always", prev: "multiline-block-like", next: "*" },
    { blankLine: "always", prev: "multiline-expression", next: "*" },
    { blankLine: "always", prev: "*", next: "multiline-block-like" },
    // Exports
    { blankLine: "always", prev: "*", next: "export" },
    { blankLine: "any", prev: "export", next: "export" },
  ],

  "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],
  "padded-blocks": ["error", "never"],
};

const GENERAL_RULES = {
  "no-console": ["warn", { allow: ["warn", "error"] }],
  "no-var": "error",
  "prefer-const": "error",
  "object-shorthand": ["error", "always"],
  "no-duplicate-imports": "error",
  eqeqeq: ["error", "always", { null: "ignore" }],
  "no-throw-literal": "error",
  "no-restricted-imports": [
    "error",
    {
      patterns: ["../*", "./../*"],
    },
  ],
};

const REACT_RULES = {
  "react-hooks/exhaustive-deps": "error",
  "react/self-closing-comp": ["error", { component: true, html: false }],
  "react/no-array-index-key": "warn",
  "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. ARCHITECTURE BOUNDARY ELEMENTS
// ─────────────────────────────────────────────────────────────────────────────

const BOUNDARY_ELEMENTS = [
  {
    type: "tooling",
    pattern: ["eslint.config.mjs", "next.config.ts", "postcss.config.js", "tailwind.config.ts"],
    mode: "file",
  },

  { type: "scripts", pattern: "scripts/**", mode: "folder" },
  { type: "app", pattern: "src/app/**", mode: "folder" },
  { type: "config", pattern: "src/config/**", mode: "folder" },
  { type: "providers", pattern: "src/providers/**", mode: "folder" },

  { type: "feature", pattern: "src/features/*", mode: "folder" },

  { type: "feature-api", pattern: "src/features/*/api/**" },
  { type: "feature-model", pattern: "src/features/*/model/**" },
  { type: "feature-ui", pattern: "src/features/*/ui/**" },
  { type: "feature-hooks", pattern: "src/features/*/hooks/**" },

  { type: "state", pattern: "src/state/**", mode: "folder" },
  { type: "i18n", pattern: "src/i18n/**", mode: "folder" },

  { type: "shared-server", pattern: "src/shared/server/**", mode: "folder" },
  { type: "shared-api", pattern: "src/shared/api/**", mode: "folder" },
  { type: "shared-core", pattern: "src/shared/core/**", mode: "folder" },
  { type: "shared-http", pattern: "src/shared/http/**", mode: "folder" },
  { type: "shared-request", pattern: "src/shared/request/**", mode: "folder" },
  { type: "shared-security", pattern: "src/shared/security/**", mode: "folder" },
  { type: "shared-theme", pattern: "src/shared/theme/**", mode: "folder" },
  { type: "shared-types", pattern: "src/shared/types/**", mode: "folder" },
  { type: "shared-utils", pattern: "src/shared/utils/**", mode: "folder" },
  { type: "shared-lib", pattern: "src/shared/lib/**", mode: "folder" },
  { type: "shared-infra", pattern: "src/shared/infra/**", mode: "folder" },
  { type: "shared-ui", pattern: "src/shared/ui/**", mode: "folder" },

  { type: "client", pattern: "**/*.client.*", mode: "file" },
  { type: "server-runtime", pattern: "**/*.server.*", mode: "file" },
  { type: "proxy", pattern: "src/proxy.ts", mode: "file" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. ARCHITECTURE DEPENDENCY RULES (Layer → Layer)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a rule allowing a layer to import only from a set of target layers.
 * @param {string} fromType - The source layer type
 * @param {string[]} allowedTo - Array of layer types to allow
 * @param {string[]} [disallowedTo] - Array of layer types to explicitly disallow
 * @returns {Object} A rule object for boundaries/dependencies
 */

function createLayerRule(fromType, allowedTo = [], disallowedTo = []) {
  return {
    from: { type: fromType },
    allow: [{ to: { type: fromType } }, ...allowedTo.map((type) => ({ to: { type } }))],
    ...(disallowedTo.length ? { disallow: disallowedTo.map((type) => ({ to: { type } })) } : {}),
  };
}

const BOUNDARY_RULES = [
  createLayerRule("app", [
    "providers",
    "feature",
    "shared-ui",
    "shared-infra",
    "shared-security",
    "shared-theme",
    "shared-request",
    "shared-core",
    "shared-http",
    "shared-api",
    "shared-config",
    "shared-types",
    "shared-lib",
    "state",
    "i18n",
    "server-runtime",
    "client",
  ]),

  createLayerRule("providers", [
    "providers",
    "client",
    "shared-ui",
    "shared-infra",
    "shared-security",
    "shared-theme",
    "shared-request",
    "shared-core",
    "shared-http",
    "shared-api",
    "shared-config",
    "shared-types",
    "shared-lib",
    "state",
  ]),

  createLayerRule(
    "client",
    [
      "client",
      "providers",
      "shared-ui",
      "shared-infra",
      "shared-lib",
      "shared-core",
      "shared-types",
      "shared-theme",
      "shared-request",
    ],
    ["server-runtime"],
  ),

  createLayerRule("shared-server", [
    "shared-server",
    "shared-security",
    "server-runtime",
    "shared-core",
    "shared-types",
  ]),

  createLayerRule("shared-ui", ["shared-lib", "shared-core", "shared-types", "state", "shared-theme"]),
  createLayerRule("shared-infra", [
    "shared-lib",
    "shared-core",
    "shared-types",
    "shared-config",
    "shared-request",
    "shared-api",
  ]),
  createLayerRule("shared-security", ["shared-core", "shared-config", "shared-types", "server-runtime"]),
  createLayerRule("shared-theme", ["shared-types"]),
  createLayerRule("shared-request", ["shared-config", "shared-types"]),
  createLayerRule("shared-http", ["shared-core", "shared-types"]),
  createLayerRule("shared-api", ["shared-core", "shared-types"]),
  createLayerRule("shared-lib", ["shared-core", "shared-config", "shared-types"]),
  createLayerRule("shared-config", ["shared-types"]),
  createLayerRule("shared-types", []),
  createLayerRule("state", ["shared-types"]),
  createLayerRule(
    "feature",
    ["shared-ui", "shared-lib", "shared-core", "shared-config", "shared-types", "state"],
    ["feature"],
  ),
  createLayerRule("i18n", ["shared-lib", "shared-config", "shared-types"]),
  createLayerRule("scripts", ["shared-config"]),
  createLayerRule("tooling", []),

  createLayerRule("server-runtime", [
    "server-runtime",
    "shared-infra",
    "shared-security",
    "shared-core",
    "shared-types",
    "shared-config",
    "shared-theme", // ✅ FIX
  ]),

  // proxy should stay very narrow
  createLayerRule("proxy", [
    "shared-config",
    "shared-types",
    "shared-lib",
    "shared-security",
    "server-runtime", // ⚠️ allowed but see note below
  ]),
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. EXPORT CONFIG
// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig([
  // ─ PRESETS ───────────────────────────────────────────────────────────────
  ...nextVitals,
  ...nextTs,
  prettier,

  // ─ BASE CONFIGURATION ────────────────────────────────────────────────────
  {
    plugins: {
      import: importPlugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
      security,
      sonarjs,
    },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },

    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      ...IMPORT_RULES,
      ...TYPESCRIPT_RULES,
      ...SPACING_RULES,
      ...GENERAL_RULES,
      ...sonarjs.configs.recommended.rules,
      ...security.configs.recommended.rules,
    },
  },

  // ─ REACT RULES ───────────────────────────────────────────────────────────
  {
    files: ["**/*.tsx", "**/*.jsx"],
    rules: REACT_RULES,
  },

  // ─ ARCHITECTURE BOUNDARIES ──────────────────────────────────────────────
  {
    plugins: {
      boundaries,
    },

    settings: {
      "boundaries/root-path": resolve(import.meta.dirname),
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
      "boundaries/dependency-nodes": ["import"],
      "boundaries/elements": BOUNDARY_ELEMENTS,
    },

    rules: {
      "boundaries/no-unknown": "error",
      "boundaries/no-unknown-files": "error",

      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: BOUNDARY_RULES,
        },
      ],
    },
  },

  // ─ TEST OVERRIDES ───────────────────────────────────────────────────────
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "**/__tests__/**", "**/__mocks__/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "boundaries/dependencies": "off",
    },
  },

  // ─ TOOLING OVERRIDES ────────────────────────────────────────────────────
  {
    files: ["eslint.config.mjs", "next.config.ts", "postcss.config.js", "tailwind.config.ts", "scripts/**"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
    },
  },

  // ignore scripts fully as they may need to break boundaries for practical reasons (e.g. build scripts, code generators, etc.)
  {
    files: ["scripts/**"],
    rules: {
      "boundaries/dependencies": "off",
      "sonarjs/slow-regex": "off",
      "security/detect-non-literal-fs-filename": "off",
    },
  },

  // ─ GLOBAL IGNORES ───────────────────────────────────────────────────────
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
