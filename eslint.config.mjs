import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig, globalIgnores } from "eslint/config";
import { resolve } from "path";
import tseslint from "typescript-eslint";

const IMPORT_RULES = {
  "import/no-cycle": "error",
  "import/order": [
    "error",
    {
      groups: ["builtin", "external", "internal", ["parent", "sibling", "index"], "type"],
      pathGroups: [
        {
          pattern: "next/**",
          group: "external",
          position: "before",
        },
        {
          pattern: "react",
          group: "external",
          position: "before",
        },
      ],
      pathGroupsExcludedImportTypes: [],
      "newlines-between": "always",
      alphabetize: {
        order: "asc",
        caseInsensitive: true,
      },
    },
  ],
  "import/consistent-type-specifier-style": ["error", "prefer-inline"],
};
const TYPESCRIPT_RULES = {
  "@typescript-eslint/prefer-return-this-type": "error",
  "@typescript-eslint/no-confusing-void-expression": "error",
  // "@typescript-eslint/require-await": "error",
  "@typescript-eslint/prefer-nullish-coalescing": [
    "error",
    { ignorePrimitives: { string: true, number: true, boolean: true } },
  ],

  "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],
  "@typescript-eslint/no-non-null-assertion": "warn",
  "@typescript-eslint/no-empty-object-type": "error",
  "@typescript-eslint/no-unused-vars": "off",
  "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports", fixStyle: "inline-type-imports" }],
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
};
const GENERAL_RULES = {
  "no-console": ["error", { allow: ["error"] }],
  "prettier/prettier": "error",
  "no-var": "error",
  "prefer-const": "error",
  "object-shorthand": ["error", "always"],
  "no-duplicate-imports": "error",
  eqeqeq: ["error", "always", { null: "ignore" }],
  "no-throw-literal": "error",
  "no-process-env": "error",
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        "**/*.server.*",
        "@/shared/infra/**",
        "@/shared/api/**",
        "@/shared/security/**",
        "@/shared/infra",
        "@/shared/api",
        "@/shared/security",
      ],
    },
  ],
};
const REACT_RULES = {
  "react-hooks/exhaustive-deps": "error",
  "react/self-closing-comp": ["error", { component: true, html: false }],
  "react/no-array-index-key": "warn",
  "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
};

const BOUNDARY_ELEMENTS = [
  {
    type: "tooling",
    pattern: ["eslint.config.mjs", "next.config.ts", "postcss.config.js", "tailwind.config.ts"],
    mode: "file",
  },
  { type: "scripts", pattern: "scripts/**", mode: "folder" },

  { type: "rsc", pattern: "src/app/**/!(*.client).*", mode: "file" },
  { type: "route", pattern: "src/app/**/route.ts", mode: "file" },

  { type: "feature", pattern: "src/features/**", mode: "folder" },
  { type: "shared-core", pattern: "src/shared/core/**", mode: "folder" },
  { type: "shared-ports", pattern: "src/shared/ports/**", mode: "folder" },
  { type: "shared-api", pattern: "src/shared/api/**", mode: "folder" },
  { type: "shared-infra", pattern: "src/shared/infra/**", mode: "folder" },
  { type: "shared-security", pattern: "src/shared/security/**", mode: "folder" },
  { type: "shared-ui", pattern: "src/shared/ui/**", mode: "folder" },
  { type: "shared-utils", pattern: "src/shared/utils/**", mode: "folder" },
  { type: "providers", pattern: "src/providers/**", mode: "folder" },
  { type: "config", pattern: "src/config/**", mode: "folder" },
  { type: "state", pattern: "src/state/**", mode: "folder" },
  { type: "server", pattern: "**/*.server.*", mode: "file" },
  { type: "client", pattern: "**/*.client.*", mode: "file" },
  { type: "proxy", pattern: ["src/proxy.ts", "src/app/**/route.ts"], mode: "file" },
];

const LAYERS = {
  rsc: ["feature", "shared-ui", "providers", "config", "state"],
  route: ["shared-core", "shared-api", "shared-infra", "shared-security", "config"],

  providers: ["shared-core", "shared-utils", "config", "shared-ui", "state"],

  feature: ["shared-core", "shared-ui", "shared-utils", "state"],

  "shared-api": ["shared-infra", "shared-core", "shared-ports"],
  "shared-infra": ["shared-core", "shared-ports"],
  "shared-security": ["shared-core", "shared-ports"],
  "shared-ui": ["shared-core", "shared-utils", "state"],
  "shared-utils": ["shared-core"],
  "shared-core": [],
  "shared-ports": [],

  config: ["shared-core"],
  state: ["shared-core"],

  client: ["shared-ui", "shared-utils", "state", "config"],

  server: ["shared-core", "shared-ports", "shared-api", "shared-infra", "shared-security", "config"],

  proxy: ["shared-core", "shared-security", "shared-infra", "shared-api", "config"],
  tooling: ["config"],
  scripts: ["config", "shared-core", "shared-utils"],
};

const NO_SELF_IMPORT = ["feature"];

function buildBoundaryRules(layers) {
  const all = Object.keys(layers);

  return Object.entries(layers).map(([from, allow]) => {
    const disallow = all.filter((l) => l !== from && !allow.includes(l));

    if (from === "client") {
      const forbidden = ["server", "shared-infra", "shared-api", "shared-security"];
      forbidden.forEach((f) => {
        if (!disallow.includes(f)) disallow.push(f);
      });
    }

    if (from === "route") {
      const forbidden = ["shared-ui", "feature", "state"];
      forbidden.forEach((f) => {
        if (!disallow.includes(f)) disallow.push(f);
      });
    }

    return createLayerRule(from, allow, disallow);
  });
}

export function createLayerRule(from, allow = [], disallow = []) {
  const allowSelf = !NO_SELF_IMPORT.includes(from);
  return {
    from: { type: from },

    allow: [...(allowSelf ? [{ to: { type: from } }] : []), ...allow.map((t) => ({ to: { type: t } }))],
    ...(disallow.length && {
      disallow: disallow.map((t) => ({ to: { type: t } })),
    }),
  };
}

const BOUNDARY_RULES = buildBoundaryRules(LAYERS);
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      import: importPlugin,
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
      prettier: prettierPlugin,
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
      "security/detect-object-injection": "off",
      "sonarjs/cognitive-complexity": "off",
    },
  },
  {
    files: ["**/*.tsx", "**/*.jsx"],
    rules: REACT_RULES,
  },
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
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "**/__tests__/**", "**/__mocks__/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "boundaries/dependencies": "off",
    },
  },
  {
    files: ["**/*.server.ts", "src/app/**/route.ts"],
    rules: {
      "no-process-env": "off",
    },
  },
  {
    files: ["**/*.client.ts", "**/*.client.tsx"],
    rules: {
      "no-process-env": "error",
    },
  },
  {
    files: ["eslint.config.mjs", "next.config.ts", "postcss.config.js", "tailwind.config.ts", "scripts/**"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
      "no-process-env": "off",
    },
  },
  {
    files: ["scripts/**"],
    rules: {
      "boundaries/dependencies": "off",
      "sonarjs/slow-regex": "off",
      "security/detect-non-literal-fs-filename": "off",
      "sonarjs/no-alphabetical-sort": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
