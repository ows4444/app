import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";
import { defineConfig, globalIgnores } from "eslint/config";
import { resolve } from "path";
import tseslint from "typescript-eslint";

const CROSS_FEATURE_SUB_LAYERS = [
  "feature-ui",
  "feature-hooks",
  "feature-query",
  "feature-api",
  "feature-mapper",
  "feature-server",
  "feature-config",
  "feature-root",
  "feature-constants",
  "feature-types",
];

const crossFeatureDisallow = CROSS_FEATURE_SUB_LAYERS.flatMap((type) => [
  {
    from: { type },
    disallow: [
      {
        to: {
          type,
          captured: { feature: "!{{from.captured.feature}}" },
        },
      },
    ],
  },
]);

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,

  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },

    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"], "type"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/consistent-type-specifier-style": ["error", "prefer-inline"],

      // --- MODERN TS ---
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/prefer-return-this-type": "error",
      "@typescript-eslint/no-confusing-void-expression": "error",
      "@typescript-eslint/require-await": "error",

      // --- FIXED ---
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        { ignorePrimitives: { string: true, number: true, boolean: true } },
      ],

      "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
      "padding-line-between-statements": [
        "error",
        { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        {
          blankLine: "always",
          prev: "*",
          next: ["if", "for", "while", "switch", "try", "return", "throw", "function", "class", "export"],
        },
      ],

      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],
      "padded-blocks": ["error", "never"],

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-empty-object-type": "error",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // Idiomatic nullish patterns
      "@typescript-eslint/prefer-optional-chain": "error",
    },
  },

  {
    files: ["**/*.tsx", "**/*.jsx"],
    rules: {
      "react-hooks/exhaustive-deps": "error",
      "react/self-closing-comp": ["error", { component: true, html: false }],
      "react/no-array-index-key": "warn",
      "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
    },
  },

  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-var": "error",
      "prefer-const": "error",
      "object-shorthand": ["error", "always"],
      "no-duplicate-imports": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-throw-literal": "error",
    },
  },

  // ─── 5. Architecture boundaries ────────────────────────────────────────────
  {
    plugins: { boundaries },

    settings: {
      "boundaries/root-path": resolve(import.meta.dirname),
      "import/resolver": {
        typescript: { alwaysTryTypes: true },
      },

      "boundaries/dependency-nodes": ["import"],

      "boundaries/elements": [
        // ── TOOLING ──────────────────────────────────────────────────────────
        {
          type: "tooling",
          pattern: ["eslint.config.mjs", "next.config.ts", "postcss.config.js", "tailwind.config.ts"],
          mode: "file",
        },
        { type: "scripts", pattern: "scripts/**", mode: "folder" },

        // ── CORE ─────────────────────────────────────────────────────────────
        { type: "app", pattern: "src/app/**", mode: "folder" },
        { type: "config", pattern: "src/config/**", mode: "folder" },

        // ── SHARED — specific first so catch-all doesn't swallow them ────────
        { type: "shared-ui", pattern: "src/shared/ui/**", mode: "folder" },
        { type: "shared-infra", pattern: "src/shared/lib/infra/**", mode: "folder" },
        { type: "shared-lib-utils", pattern: "src/shared/lib/utils/**", mode: "folder" },
        // Merged: was duplicated with two different paths in original config
        {
          type: "shared-types",
          pattern: ["src/shared/lib/types/**", "src/shared/types/**"],
          mode: "folder",
        },
        // Catch-all for everything else under shared/lib (after specifics above)
        { type: "shared-lib", pattern: "src/shared/lib/**", mode: "folder" },
        { type: "shared-utils", pattern: "src/shared/utils/**", mode: "folder" },

        // ── FEATURE — specific first, catch-all last ──────────────────────────
        {
          type: "feature-ui",
          pattern: "src/features/*/components/**",
          capture: ["feature"],
          mode: "folder",
        },
        {
          type: "feature-hooks",
          pattern: "src/features/*/hooks/**",
          capture: ["feature"],
          mode: "folder",
        },
        {
          type: "feature-query",
          pattern: "src/features/*/queries/**",
          capture: ["feature"],
          mode: "folder",
        },
        {
          type: "feature-api",
          pattern: "src/features/*/api/**",
          capture: ["feature"],
          mode: "folder",
        },
        {
          type: "feature-mapper",
          pattern: "src/features/*/mappers/**",
          capture: ["feature"],
          mode: "folder",
        },
        {
          type: "feature-server",
          pattern: "src/features/*/server/**",
          capture: ["feature"],
          mode: "folder",
        },
        {
          type: "feature-config",
          pattern: "src/features/*/config/**",
          capture: ["feature"],
          mode: "folder",
        },
        {
          type: "feature-constants",
          pattern: "src/features/*/constants.{ts,tsx}",
          capture: ["feature"],
          mode: "file",
        },
        {
          type: "feature-types",
          pattern: "src/features/*/types.{ts,tsx}",
          capture: ["feature"],
          mode: "file",
        },
        {
          type: "feature-root",
          pattern: "src/features/*/index.{ts,tsx}",
          capture: ["feature"],
          mode: "file",
        },
        // Catch-all for anything else directly inside a feature folder
        {
          type: "feature",
          pattern: "src/features/*",
          capture: ["feature"],
          mode: "folder",
        },

        // ── INFRA ─────────────────────────────────────────────────────────────
        { type: "providers", pattern: "src/providers/**", mode: "folder" },
        { type: "state", pattern: "src/state/**", mode: "folder" },
        { type: "proxy", pattern: ["src/proxy.ts"], mode: "file" },
      ],
    },

    rules: {
      "boundaries/no-unknown": "error",
      "boundaries/no-unknown-files": "error",

      "boundaries/dependencies": [
        "error",
        {
          // Everything is forbidden by default; only listed rules open channels.
          default: "disallow",

          rules: [
            // ── APP (top of the dependency graph) ───────────────────────────
            // App routes/pages compose from every public layer.
            {
              from: { type: "app" },
              allow: [
                { to: { type: "config" } },
                { to: { type: "feature" } },
                { to: { type: "feature-root" } },
                { to: { type: "feature-ui" } }, // page-level component composition
                { to: { type: "feature-types" } },
                { to: { type: "feature-constants" } },
                { to: { type: "feature-hooks" } },
                { to: { type: "feature-server" } },
                { to: { type: "shared-ui" } },
                { to: { type: "shared-infra" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-types" } },
                { to: { type: "providers" } },
                { to: { type: "state" } },
              ],
            },

            // ── FEATURE ROOT (public surface / barrel file) ──────────────────
            // index.ts re-exports from every internal sub-layer of the same feature.
            {
              from: { type: "feature-root" },
              allow: [
                { to: { type: "feature-ui" } },
                { to: { type: "feature-hooks" } },
                { to: { type: "feature-query" } },
                { to: { type: "feature-api" } },
                { to: { type: "feature-mapper" } },
                { to: { type: "feature-server" } },
                { to: { type: "feature-config" } },
                { to: { type: "feature-types" } },
                { to: { type: "feature-constants" } },
              ],
            },

            // ── FEATURE CORE (pure primitives, no outbound deps) ─────────────
            // types.ts: zero dependencies — importing anything here is a smell
            { from: { type: "feature-types" }, allow: [] },

            // constants.ts: only needs types
            {
              from: { type: "feature-constants" },
              allow: [{ to: { type: "feature-types" } }],
            },

            // ── FEATURE CONFIG ────────────────────────────────────────────────
            {
              from: { type: "feature-config" },
              allow: [
                { to: { type: "feature-types" } },
                { to: { type: "feature-constants" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-types" } },
              ],
            },

            // ── FEATURE API (data fetching, no business logic) ────────────────
            {
              from: { type: "feature-api" },
              allow: [
                { to: { type: "feature-types" } },
                { to: { type: "feature-constants" } },
                { to: { type: "config" } }, // API clients need base URL / auth config
                { to: { type: "shared-lib" } },
                { to: { type: "shared-infra" } },
                { to: { type: "shared-types" } },
              ],
            },

            // ── FEATURE MAPPER (pure data transformation) ─────────────────────
            {
              from: { type: "feature-mapper" },
              allow: [
                { to: { type: "feature-types" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-types" } },
              ],
            },

            // ── FEATURE QUERY (TanStack Query / SWR hooks around the API) ─────
            {
              from: { type: "feature-query" },
              allow: [
                { to: { type: "feature-api" } },
                { to: { type: "feature-constants" } },
                { to: { type: "feature-mapper" } },
                { to: { type: "feature-types" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-infra" } },
                { to: { type: "shared-types" } },
              ],
            },

            // ── FEATURE HOOKS (business logic hooks, may read from state) ─────
            {
              from: { type: "feature-hooks" },
              allow: [
                { to: { type: "feature-query" } },
                { to: { type: "feature-types" } },
                { to: { type: "feature-constants" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-types" } },
                { to: { type: "state" } },
              ],
            },

            // ── FEATURE UI (components — must never call API layer directly) ──
            {
              from: { type: "feature-ui" },
              allow: [
                { to: { type: "feature-hooks" } },
                { to: { type: "feature-query" } },
                { to: { type: "feature-types" } },
                { to: { type: "feature-constants" } },
                { to: { type: "shared-ui" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-types" } },
                { to: { type: "state" } },
              ],
              // Components call hooks, not raw fetch — keeps the layer honest
              disallow: [{ to: { type: "feature-api" } }],
            },

            // ── FEATURE SERVER (Next.js Server Actions / route handlers) ──────
            {
              from: { type: "feature-server" },
              allow: [
                { to: { type: "feature-mapper" } },
                { to: { type: "feature-types" } },
                { to: { type: "feature-constants" } },
                { to: { type: "config" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-infra" } },
                { to: { type: "shared-types" } },
              ],
            },

            // ── FEATURE catch-all (misc files inside a feature folder) ────────
            {
              from: { type: "feature" },
              allow: [
                { to: { type: "shared-infra" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-types" } },
                { to: { type: "state" } },
              ],
              disallow: [
                // No direct cross-feature imports — use the public index barrel
                {
                  to: {
                    type: "feature",
                    captured: { feature: "!{{from.captured.feature}}" },
                  },
                },
              ],
            },

            // ── CROSS-FEATURE ISOLATION FOR ALL SUB-LAYERS ───────────────────
            // Prevents auth/hooks → cart/hooks etc. at the sub-layer level.
            // Generated from CROSS_FEATURE_SUB_LAYERS above.
            ...crossFeatureDisallow,

            // ── PROVIDERS ────────────────────────────────────────────────────
            {
              from: { type: "providers" },
              allow: [
                { to: { type: "config" } },
                { to: { type: "feature-root" } },
                { to: { type: "feature-hooks" } },
                { to: { type: "feature-types" } },
                { to: { type: "shared-infra" } },
                { to: { type: "shared-types" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-ui" } },
                { to: { type: "state" } },
              ],
            },

            // ── STATE (Zustand / Jotai / Redux slices) ────────────────────────
            {
              from: { type: "state" },
              allow: [
                { to: { type: "shared-lib" } },
                { to: { type: "shared-types" } },
                { to: { type: "feature-types" } }, // slices may type their shape against feature types
              ],
            },

            // ── SHARED — strict bottom-up chain; no shared layer may import app/feature ──

            // shared-types: truly leaf — zero outbound deps
            { from: { type: "shared-types" }, allow: [] },

            // shared-lib-utils: only needs types
            {
              from: { type: "shared-lib-utils" },
              allow: [{ to: { type: "shared-types" } }],
            },

            // shared-lib (general utilities, formatters, etc.)
            {
              from: { type: "shared-lib" },
              allow: [
                { to: { type: "shared-lib" } }, // intra-lib imports (e.g. lib/date → lib/format)
                { to: { type: "shared-lib-utils" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-types" } },
              ],
              // shared-lib must NOT touch config — accept values as parameters
              // or read process.env directly. This keeps shared-lib isomorphic.
            },

            // shared-infra (fetch client, auth SDK wrappers, logger, etc.)
            // Infra lives closest to the network and is the one shared layer
            // that legitimately needs runtime config (base URLs, API keys).
            {
              from: { type: "shared-infra" },
              allow: [
                { to: { type: "config" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-types" } },
              ],
            },

            // shared-utils (pure FP helpers, string/number/array utils)
            {
              from: { type: "shared-utils" },
              allow: [{ to: { type: "shared-utils" } }, { to: { type: "shared-types" } }],
            },

            // shared-ui (design system / Radix wrappers)
            {
              from: { type: "shared-ui" },
              allow: [
                { to: { type: "shared-utils" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-types" } },
              ],
            },

            {
              from: { type: "config" },
              allow: [{ to: { type: "shared-lib" } }, { to: { type: "shared-types" } }],
            },

            {
              from: { type: "proxy" },
              allow: [{ to: { type: "config" } }, { to: { type: "shared-lib" } }, { to: { type: "shared-infra" } }],
            },

            {
              from: { type: "scripts" },
              allow: [{ to: { type: "config" } }, { to: { type: "shared-lib" } }],
            },

            { from: { type: "tooling" }, allow: [] },
          ],
        },
      ],
    },
  },

  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "**/__tests__/**", "**/__mocks__/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "boundaries/dependencies": "off",
    },
  },

  {
    files: ["eslint.config.mjs", "next.config.ts", "postcss.config.js", "tailwind.config.ts", "scripts/**"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
    },
  },

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
