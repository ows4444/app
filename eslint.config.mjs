import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
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
];

const SHARED_LAYERS = [
  "shared",
  "shared-ui",
  "shared-api",
  "shared-infra",
  "shared-utils",
  "shared-types",
  "shared-core",
  "shared-http",
  "shared-i18n",
  "shared-react",
  "shared-request",
  "shared-security",
  "shared-theme",
];

const crossFeatureDisallow = CROSS_FEATURE_SUB_LAYERS.flatMap((type) => [
  {
    from: { type },
    allow: [
      {
        to: {
          type,
          captured: { feature: "{{from.captured.feature}}" }, // ✅ allow same feature
        },
      },
    ],
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
    plugins: { import: importPlugin },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    files: ["**/*.ts", "**/*.tsx"],
    rules: {
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
        { blankLine: "always", prev: "directive", next: "*" },
        { blankLine: "any", prev: "directive", next: "directive" },
        { blankLine: "always", prev: "import", next: "*" },
        { blankLine: "any", prev: "import", next: "import" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "any", prev: ["const", "let", "var"], next: "return" },
        { blankLine: "always", prev: "*", next: "throw" },
        { blankLine: "any", prev: ["const", "let", "var"], next: "throw" },
        { blankLine: "always", prev: "*", next: ["if", "for", "while", "do", "switch", "try"] },
        { blankLine: "always", prev: ["if", "for", "while", "do", "switch", "try"], next: "*" },
        { blankLine: "any", prev: ["const", "let", "var"], next: ["if", "for", "while", "do", "switch", "try"] },
        { blankLine: "always", prev: "*", next: ["function", "class"] },
        { blankLine: "always", prev: ["function", "class"], next: "*" },
        { blankLine: "always", prev: "multiline-block-like", next: "*" },
        { blankLine: "always", prev: "multiline-expression", next: "*" },
        { blankLine: "always", prev: "*", next: "multiline-block-like" },
        { blankLine: "always", prev: "*", next: "export" },
        { blankLine: "any", prev: "export", next: "export" },
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
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
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

        // ── SHARED (complete coverage) ─────────────────────────────

        { type: "shared-ui", pattern: "src/shared/ui/**", mode: "folder" },
        { type: "shared-api", pattern: "src/shared/api/**", mode: "folder" },
        { type: "shared-infra", pattern: "src/shared/infrastructure/**", mode: "folder" },
        { type: "shared-utils", pattern: "src/shared/utils/**", mode: "folder" },
        { type: "shared-types", pattern: "src/shared/types/**", mode: "folder" },

        // NEW (fix unknown errors)
        { type: "shared-core", pattern: "src/shared/core/**", mode: "folder" },
        { type: "shared-http", pattern: "src/shared/http/**", mode: "folder" },
        { type: "shared-i18n", pattern: "src/shared/i18n/**", mode: "folder" },
        { type: "shared-react", pattern: "src/shared/react/**", mode: "folder" },
        { type: "shared-request", pattern: "src/shared/request/**", mode: "folder" },
        { type: "shared-security", pattern: "src/shared/security/**", mode: "folder" },
        { type: "shared-theme", pattern: "src/shared/theme/**", mode: "folder" },

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
                { to: { type: "feature-ui" } }, // page-level component composition
                { to: { type: "feature-hooks" } },
                { to: { type: "feature-server" } },
                { to: { type: SHARED_LAYERS } },
                { to: { type: "providers" } },
                { to: { type: "state" } },
              ],
            },

            {
              from: { type: SHARED_LAYERS },
              allow: [{ to: { type: SHARED_LAYERS } }],
            },

            // ── FEATURE API (data fetching, no business logic) ────────────────
            {
              from: { type: "feature-api" },
              allow: [
                { to: { type: "config" } }, // API clients need base URL / auth config
                { to: { type: SHARED_LAYERS } },
              ],
            },

            // ── FEATURE MAPPER (pure data transformation) ─────────────────────
            {
              from: { type: "feature-mapper" },
              allow: [{ to: { type: SHARED_LAYERS } }],
            },

            // ── FEATURE QUERY (TanStack Query / SWR hooks around the API) ─────
            {
              from: { type: "feature-query" },
              allow: [
                { to: { type: "feature-api" } },
                { to: { type: "feature-mapper" } },
                { to: { type: SHARED_LAYERS } },
              ],
            },

            // ── FEATURE HOOKS (business logic hooks, may read from state) ─────
            {
              from: { type: "feature-hooks" },
              allow: [{ to: { type: "feature-query" } }, { to: { type: SHARED_LAYERS } }, { to: { type: "state" } }],
            },

            // ── FEATURE UI (components — must never call API layer directly) ──
            {
              from: { type: "feature-ui" },
              allow: [
                { to: { type: "feature-hooks" } },
                { to: { type: "feature-query" } },
                { to: { type: "shared-ui" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-types" } },
                { to: { type: "state" } },
              ],
              // Components call hooks, not raw fetch — keeps the layer honest
              disallow: [{ to: { type: "feature-api" } }],
            },

            // ── FEATURE SERVER (Next.js Server Actions / route handlers) ──────
            {
              from: { type: "feature-server" },
              allow: [{ to: { type: "feature-mapper" } }, { to: { type: "config" } }, { to: { type: SHARED_LAYERS } }],
            },

            // ── FEATURE catch-all (misc files inside a feature folder) ────────
            {
              from: { type: "feature" },
              allow: [
                { to: { type: "feature", captured: { feature: "{{from.captured.feature}}" } } }, // ✅ SAME feature allowed
                { to: { type: "shared" } },
                { to: { type: SHARED_LAYERS } },
                { to: { type: "state" } },
              ],
              disallow: [
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

            // ── ALLOW SAME-FEATURE ACCESS FOR SUB-LAYERS ───────────────────
            ...CROSS_FEATURE_SUB_LAYERS.map((type) => ({
              from: { type },
              allow: [
                {
                  to: {
                    type: "feature",
                    captured: { feature: "{{from.captured.feature}}" },
                  },
                },
              ],
            })),

            // ── PROVIDERS ────────────────────────────────────────────────────
            {
              from: { type: "providers" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "feature-hooks" } },
                { to: { type: SHARED_LAYERS } },
                { to: { type: "state" } },
                { to: { type: "config" } },
              ],
            },

            // ── STATE (Zustand / Jotai / Redux slices) ────────────────────────
            {
              from: { type: "state" },
              allow: [{ to: { type: "shared-types" } }, { to: { type: "shared-infra" } }],
            },

            // ── SHARED — strict bottom-up chain; no shared layer may import app/feature ──

            // shared-types: truly leaf — zero outbound deps
            { from: { type: "shared-types" }, allow: [] },

            // shared-infra (fetch client, auth SDK wrappers, logger, etc.)
            // Infra lives closest to the network and is the one shared layer
            // that legitimately needs runtime config (base URLs, API keys).
            {
              from: { type: "shared-infra" },
              allow: [
                { to: { type: "config" } },
                { to: { type: "shared-api" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-types" } },
              ],
            },

            {
              from: { type: "shared-api" },
              allow: [
                //
                { to: { type: "shared-infra" } },
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
              allow: [{ to: { type: "state" } }, { to: { type: "shared-utils" } }, { to: { type: "shared-types" } }],
            },

            {
              from: { type: "config" },
              allow: [
                //
                { to: { type: "shared-types" } },
              ],
            },

            {
              from: { type: "proxy" },
              allow: [{ to: { type: "config" } }, { to: { type: SHARED_LAYERS } }],
            },

            {
              from: { type: "scripts" },
              allow: [
                //
                { to: { type: "config" } },
              ],
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
