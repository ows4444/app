import { resolve } from "path";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import prettier from "eslint-config-prettier";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: { boundaries },

    settings: {
      "boundaries/root-path": resolve(import.meta.dirname),

      "import/resolver": {
        typescript: { alwaysTryTypes: true },
      },

      "boundaries/dependency-nodes": ["import"],

      "boundaries/elements": [
        /** TOOLING */
        {
          type: "tooling",
          pattern: ["eslint.config.mjs", "next.config.ts", "postcss.config.js", "tailwind.config.ts"],
          mode: "file",
        },
        { type: "scripts", pattern: "scripts/**", mode: "folder" },

        /** CORE */
        { type: "app", pattern: "src/app/**", mode: "folder" },
        { type: "config", pattern: "src/config/**", mode: "folder" },

        /** SHARED (specific → generic) */
        { type: "shared-ui", pattern: "src/shared/ui/**", mode: "folder" },
        { type: "shared-infra", pattern: "src/shared/lib/infra/**", mode: "folder" },
        { type: "shared-lib-utils", pattern: "src/shared/lib/utils/**", mode: "folder" },
        { type: "shared-types", pattern: "src/shared/lib/types/**", mode: "folder" },
        { type: "shared-lib", pattern: "src/shared/lib/**", mode: "folder" },
        { type: "shared-utils", pattern: "src/shared/utils/**", mode: "folder" },
        { type: "shared-types", pattern: "src/shared/types/**", mode: "folder" },

        /** FEATURE (specific → generic) */
        { type: "feature-ui", pattern: "src/features/*/components/**", capture: ["feature"], mode: "folder" },
        { type: "feature-hooks", pattern: "src/features/*/hooks/**", capture: ["feature"], mode: "folder" },
        { type: "feature-query", pattern: "src/features/*/queries/**", capture: ["feature"], mode: "folder" },
        { type: "feature-api", pattern: "src/features/*/api/**", capture: ["feature"], mode: "folder" },
        { type: "feature-mapper", pattern: "src/features/*/mappers/**", capture: ["feature"], mode: "folder" },
        { type: "feature-server", pattern: "src/features/*/server/**", capture: ["feature"], mode: "folder" },
        { type: "feature-config", pattern: "src/features/*/config/**", capture: ["feature"], mode: "folder" },

        { type: "feature-constants", pattern: "src/features/*/constants.{ts,tsx}", capture: ["feature"], mode: "file" },
        { type: "feature-types", pattern: "src/features/*/types.{ts,tsx}", capture: ["feature"], mode: "file" },
        { type: "feature-root", pattern: "src/features/*/index.{ts,tsx}", capture: ["feature"], mode: "file" },

        { type: "feature", pattern: "src/features/*", capture: ["feature"], mode: "folder" },

        /** INFRA */
        { type: "providers", pattern: "src/providers/**", mode: "folder" },
        { type: "state", pattern: "src/state/**", mode: "folder" },
        { type: "proxy", pattern: ["src/proxy.ts"], mode: "file" },
      ],
    },

    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",

          rules: [
            /**
             * APP (top layer)
             */
            {
              from: { type: "app" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "feature-root" } },
                { to: { type: "feature-types" } },
                { to: { type: "feature-constants" } },
                { to: { type: "feature-hooks" } },
                { to: { type: "feature-server" } },
                { to: { type: "shared-infra" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-lib" } },
                { to: { type: "providers" } },
                { to: { type: "state" } },
              ],
            },

            /**
             * FEATURE CORE (pure)
             */
            { from: { type: "feature-types" }, allow: [] },
            { from: { type: "feature-constants" }, allow: [{ to: { type: "feature-types" } }] },

            {
              from: { type: "feature-config" },
              allow: [
                { to: { type: "feature-types" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-lib" } },
              ],
            },

            /**
             * FEATURE (default behavior)
             */
            {
              from: { type: "feature" },
              allow: [
                { to: { type: "shared-infra" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-lib" } },
                { to: { type: "state" } },
              ],
            },
            {
              from: { type: "feature" },
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
             * FEATURE LAYERS (collapsed)
             */
            {
              from: { type: "feature-ui" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "feature-hooks" } },
                { to: { type: "feature-query" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-lib" } },
              ],
              disallow: [{ to: { type: "feature-api" } }],
            },

            {
              from: { type: "feature-hooks" },
              allow: [{ to: { type: "feature" } }, { to: { type: "feature-query" } }, { to: { type: "shared-lib" } }],
            },

            {
              from: { type: "feature-query" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "feature-api" } },
                { to: { type: "feature-constants" } },
                { to: { type: "feature-mapper" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-infra" } },
              ],
            },

            {
              from: { type: "feature-api" },
              allow: [{ to: { type: "feature" } }, { to: { type: "feature-types" } }, { to: { type: "shared-lib" } }],
            },

            {
              from: { type: "feature-mapper" },
              allow: [{ to: { type: "feature" } }, { to: { type: "feature-types" } }, { to: { type: "shared-lib" } }],
            },

            {
              from: { type: "feature-server" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "feature-mapper" } },
                { to: { type: "feature-types" } },
                { to: { type: "config" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-infra" } },
              ],
            },

            /**
             * INFRA
             */
            {
              from: { type: "providers" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "feature-root" } },
                { to: { type: "feature-hooks" } },
                { to: { type: "shared-infra" } },
                { to: { type: "shared-types" } },
                { to: { type: "shared-lib" } },
                { to: { type: "shared-ui" } },
                { to: { type: "state" } },
              ],
            },

            {
              from: { type: "state" },
              allow: [{ to: { type: "shared-lib" } }],
            },

            /**
             * SHARED
             */
            { from: { type: "shared-types" }, allow: [] },

            {
              from: { type: "shared-lib" },
              allow: [
                { to: { type: "shared-lib" } },
                { to: { type: "shared-utils" } },
                { to: { type: "shared-types" } },
              ],
            },

            {
              from: { type: "shared-infra" },
              allow: [{ to: { type: "shared-lib" } }, { to: { type: "shared-utils" } }],
            },

            {
              from: { type: "shared-utils" },
              allow: [{ to: { type: "shared-lib" } }, { to: { type: "shared-utils" } }],
            },

            /**
             * MISC
             */
            {
              from: { type: "config" },
              allow: [{ to: { type: "shared-lib" } }],
            },
            {
              from: { type: "proxy" },
              allow: [{ to: { type: "config" } }, { to: { type: "shared-lib" } }, { to: { type: "shared-infra" } }],
            },
            {
              from: { type: "scripts" },
              allow: [{ to: { type: "config" } }, { to: { type: "shared-lib" } }],
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
