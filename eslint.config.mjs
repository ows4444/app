import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    plugins: {
      boundaries,
    },

    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },

      "boundaries/dependency-nodes": ["import"],

      "boundaries/elements": [
        {
          type: "tooling",
          pattern: ["eslint.config.mjs", "next.config.ts"],
          mode: "file",
        },

        { type: "scripts", pattern: "scripts/**" },

        // App layer
        { type: "app", pattern: "src/app/**" },

        // Config
        { type: "config", pattern: "src/config/**" },

        {
          type: "feature",
          pattern: "src/features/*",
          capture: ["feature"],
        },

        {
          type: "feature-ui",
          pattern: "src/features/*/components/**",
          capture: ["feature"],
        },
        {
          type: "feature-hooks",
          pattern: "src/features/*/hooks/**",
          capture: ["feature"],
        },
        {
          type: "feature-query",
          pattern: "src/features/*/queries/**",
          capture: ["feature"],
        },
        {
          type: "feature-api",
          pattern: "src/features/*/api/**",
          capture: ["feature"],
        },
        {
          type: "feature-mapper",
          pattern: "src/features/*/mappers/**",
          capture: ["feature"],
        },
        {
          type: "feature-server",
          pattern: "src/features/*/server/**",
          capture: ["feature"],
        },

        // Shared
        { type: "shared-lib", pattern: "src/shared/lib/**" },
        { type: "shared-utils", pattern: "src/shared/utils/**" },
        { type: "shared-types", pattern: "src/shared/types/**" },

        // Infra layers
        { type: "providers", pattern: "src/providers/**" },
        { type: "state", pattern: "src/state/**" },
        {
          type: "proxy",
          pattern: ["src/proxy.ts"],
          mode: "file",
        },
      ],
    },

    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",

          rules: [
            /**
             * APP
             */
            {
              from: { type: "app" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "feature-ui" } },
                { to: { type: "feature-hooks" } },
                { to: { type: "feature-server" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
                { to: { type: "providers" } },
                { to: { type: "state" } },
              ],
            },

            /**
             * FEATURE (isolation)
             */
            {
              from: { type: "feature" },
              allow: [
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
                { to: { type: "state" } },
              ],
            },
            {
              from: { type: "feature" },
              // Only disallow cross-feature imports; same-feature imports handled by allow above.
              disallow: [
                {
                  to: {
                    type: "feature",
                    captured: { feature: "!{{from.captured.feature}}" },
                  },
                },
              ],
            },

            /**
             * FEATURE UI
             */
            {
              from: { type: "feature-ui" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "feature-hooks" } },
                { to: { type: "feature-query" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
              ],
            },

            /**
             * HOOKS
             */
            {
              from: { type: "feature-hooks" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "feature-query" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
              ],
            },

            /**
             * QUERY
             */
            {
              from: { type: "feature-query" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "feature-api" } },
                { to: { type: "feature-mapper" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
              ],
            },

            /**
             * API
             */
            {
              from: { type: "feature-api" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
              ],
            },

            /**
             * MAPPER
             */
            {
              from: { type: "feature-mapper" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "shared-utils" } },
              ],
            },

            /**
             * SERVER
             */
            {
              from: { type: "feature-server" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "feature-mapper" } },
                { to: { type: "config" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
              ],
            },

            /**
             * SHARED LIB
             */
            {
              from: { type: "shared-lib" },
              allow: [{ to: { type: "shared-utils" } }],
            },

            /**
             * SHARED UTILS
             */
            {
              from: { type: "shared-utils" },
              allow: [],
            },

            /**
             * PROVIDERS
             */
            {
              from: { type: "providers" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "feature-hooks" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
                { to: { type: "state" } },
              ],
            },

            /**
             * STATE
             */
            {
              from: { type: "state" },
              allow: [
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
              ],
            },

            {
              from: { type: "config" },
              allow: [
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
              ],
            },
            {
              from: { type: "proxy" },
              allow: [
                { to: { type: "config" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
              ],
            },
            {
              from: { type: "scripts" },
              allow: [
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
                { to: { type: "config" } },
              ],
            },
            {
              from: { type: "shared-types" },
              allow: [],
            },
          ],
        },
      ],

      "boundaries/no-unknown": "error",
      "boundaries/no-unknown-files": "error",
    },
  },

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
