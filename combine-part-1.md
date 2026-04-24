## .nvmrc

24.12.0

---

## .prettierrc

{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": true,
  "singleQuote": false,
  "jsxSingleQuote": false,
  "trailingComma": "all",
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}

---

## eslint.config.mjs

import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
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
  "@typescript-eslint/no-unnecessary-type-assertion": "error",
  "@typescript-eslint/prefer-return-this-type": "error",
  "@typescript-eslint/no-confusing-void-expression": "error",
  "@typescript-eslint/require-await": "error",
  "@typescript-eslint/prefer-nullish-coalescing": [
    "error",
    { ignorePrimitives: { string: true, number: true, boolean: true } },
  ],
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
  "no-console": ["warn", { allow: ["warn", "error"] }],
  "prettier/prettier": "error",
  "no-var": "error",
  "prefer-const": "error",
  "object-shorthand": ["error", "always"],
  "no-duplicate-imports": "error",
  eqeqeq: ["error", "always", { null: "ignore" }],
  "no-throw-literal": "error",
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
  { type: "app", pattern: "src/app/**", mode: "folder" },
  { type: "config", pattern: "src/config/**", mode: "folder" },
  { type: "providers", pattern: "src/providers/**", mode: "folder" },
  { type: "feature", pattern: "src/features/*", mode: "folder" },
  { type: "feature-api", pattern: "src/features/*/api/**" },
  { type: "feature-model", pattern: "src/features/*/model/**" },
  { type: "feature-ui", pattern: "src/features/*/ui/**" },
  { type: "feature-hooks", pattern: "src/features/*/hooks/**" },
  { type: "feature-service", pattern: "src/features/*/service/**" },
  { type: "state", pattern: "src/state/**", mode: "folder" },
  { type: "i18n", pattern: "src/i18n/**", mode: "folder" },
  { type: "shared-server", pattern: "src/shared/server/**", mode: "folder" },
  { type: "shared-config", pattern: "src/shared/config/**", mode: "folder" },
  { type: "shared-core", pattern: "src/shared/core/**", mode: "folder" },

  { type: "shared-request", pattern: "src/shared/request/**", mode: "folder" },
  { type: "shared-security", pattern: "src/shared/security/**", mode: "folder" },
  { type: "shared-theme", pattern: "src/shared/theme/**", mode: "folder" },
  { type: "shared-types", pattern: "src/shared/types/**", mode: "folder" },
  { type: "shared-utils", pattern: "src/shared/utils/**", mode: "folder" },
  { type: "shared-lib", pattern: "src/shared/lib/**", mode: "folder" },
  { type: "shared-infra", pattern: "src/shared/infra/**", mode: "folder" },
  { type: "shared-ui", pattern: "src/shared/ui/**", mode: "folder" },
  { type: "shared-api-client", pattern: "src/shared/api/client.ts", mode: "file" },
  { type: "shared-api-server", pattern: "src/shared/api/server.ts", mode: "file" },
  { type: "client", pattern: "**/*.client.*", mode: "file" },
  { type: "server-runtime", pattern: "**/*.server.*", mode: "file" },
  { type: "proxy", pattern: "src/proxy.ts", mode: "file" },
];
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
    "shared-config",
    "shared-types",
    "shared-lib",
    "shared-server",
    "state",
    "i18n",
    "server-runtime",
    "client",
    "config",
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
    "shared-config",
    "shared-types",
    "shared-lib",
    "state",
    "config",
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
      "config",
      "shared-request",
      "shared-api-client",
    ],
    ["server-runtime", "shared-api-server"],
  ),
  createLayerRule("shared-server", [
    "shared-server",
    "shared-security",
    "server-runtime",
    "shared-core",
    "shared-types",
    "config",
  ]),
  createLayerRule("shared-ui", ["shared-lib", "shared-core", "shared-types", "state", "shared-theme", "config"]),
  createLayerRule(
    "shared-infra",
    ["shared-lib", "shared-core", "shared-types", "shared-config", "shared-request", "server-runtime", "config"],
    ["feature"],
  ),
  createLayerRule("shared-security", ["shared-core", "shared-config", "shared-types", "server-runtime", "config"]),
  createLayerRule("shared-theme", ["shared-types"]),
  createLayerRule("shared-request", ["shared-config", "shared-types"]),
  createLayerRule("shared-lib", ["shared-core", "shared-config", "shared-types"]),
  createLayerRule("shared-config", ["shared-types", "config"]),
  createLayerRule("shared-types", []),
  createLayerRule("state", ["shared-types"]),
  createLayerRule(
    "feature",
    [
      "shared-ui",
      "shared-lib",
      "shared-core",
      "shared-config",
      "shared-types",
      "state",
      "client",
      "shared-api-client",
      "shared-api-server",
    ],
    ["feature", "shared-infra"],
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
    "shared-theme",
    "shared-api-server",
    "config",
  ]),
  createLayerRule("proxy", [
    "shared-config",
    "shared-types",
    "shared-lib",
    "config",
    "shared-security",
    "server-runtime",
  ]),
];
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      import: importPlugin,
      react: reactPlugin,
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
    files: ["eslint.config.mjs", "next.config.ts", "postcss.config.js", "tailwind.config.ts", "scripts/**"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
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

---

## next-env.d.ts

/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

---

## next.config.ts

import { type NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  typedRoutes: true,
  headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // ❌ DO NOT define CSP here
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

---

## package.json

{
  "name": "app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "dev:debug": "NODE_OPTIONS='--inspect' next dev",
    "typecheck": "tsc --noEmit",
    "analyze": "ANALYZE=true next build",
    "format": "prettier --write .",
    "combine": "tsx scripts/combine.ts",
    "prepare": "husky"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@tanstack/react-query": "^5.99.0",
    "@tanstack/react-query-devtools": "^5.99.0",
    "next": "16.2.3",
    "next-intl": "^4.9.1",
    "pino": "^10.3.1",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-hook-form": "^7.73.1",
    "zod": "^4.3.6",
    "zustand": "^5.0.12"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.2.2",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.5.0",
    "babel-plugin-react-compiler": "1.0.0",
    "eslint": "^9",
    "eslint-config-next": "16.2.3",
    "eslint-config-prettier": "^10.1.8",
    "eslint-import-resolver-typescript": "^4.4.4",
    "eslint-plugin-boundaries": "^6.0.2",
    "eslint-plugin-import": "^2.32.0",
    "eslint-plugin-prettier": "^5.5.5",
    "eslint-plugin-security": "^4.0.0",
    "eslint-plugin-sonarjs": "^4.0.3",
    "eslint-plugin-unused-imports": "^4.4.1",
    "husky": "^9.1.7",
    "lint-staged": "^16.4.0",
    "pino-pretty": "^13.1.3",
    "postcss": "^8.5.10",
    "prettier": "^3.8.3",
    "prettier-plugin-tailwindcss": "^0.7.2",
    "tailwindcss": "^4.2.2",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}

---

## src/app/(protected)/dashboard/page.tsx

import { redirect } from "next/navigation";

import { getUser } from "@/shared/server/auth/get-user";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return <p>dashboard page</p>;
}

---

## src/app/(protected)/layout.tsx

import React from "react";

export const runtime = "nodejs";
export default function ProtectedLayout({ children }: { readonly children: React.ReactNode }) {
  return <>{children}</>;
}

---

## src/app/(protected)/onboarding/page.tsx

export default function OnboardingPage() {
  return <div>Onboarding</div>;
}

---

## src/app/(public)/2fa/page.tsx

export default function TwoFAPage() {
  return <div>Enter OTP</div>;
}

---

## src/app/(public)/layout.tsx

import { redirect } from "next/navigation";

import { getUser } from "@/shared/server/auth/get-user";

export default async function PublicLayout({ children }: { readonly children: React.ReactNode }) {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

---

## src/app/(public)/login/page.tsx

"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useLoginHandler } from "@/features/auth/hooks/use-login";
import { resolvePostLoginRoute } from "@/features/auth/model/auth.routes";
import { emitNotification } from "@/shared/notifications/model/service";

const schema = z.object({
  identifier: z.union([z.email(), z.string().regex(/^9715\d{8}$/)], {
    error: () => ({ message: "Must be a valid email or UAE phone number starting with 9715" }),
  }),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useLoginHandler();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  async function onSubmit(values: FormValues) {
    try {
      const result = await login({
        ...values,
      });

      const route = resolvePostLoginRoute(result.flow);

      router.replace(route);
    } catch {
      emitNotification({ type: "AUTH_LOGIN_FAILED" });
    }
  }

  const loading = isLoading || isSubmitting;

  return (
    <div className="bg-muted flex min-h-screen items-center justify-center px-4">
      <div className="border-base bg-base shadow-base w-full max-w-md rounded-2xl border p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-muted mt-1 text-sm">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Username</label>

            <input
              {...register("identifier")}
              className={`rounded-base border px-3 py-2 text-sm transition outline-none ${
                errors.identifier ? "border-danger" : "border-base focus:border-primary"
              }`}
              placeholder="Enter your email or UAE phone number"
            />

            {errors.identifier && <span className="text-danger text-xs">{errors.identifier.message}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`rounded-base bg-primary mt-2 w-full py-2 text-sm font-medium text-white transition ${
              loading ? "cursor-not-allowed opacity-70" : "hover:opacity-90"
            }`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

---

## src/app/api/auth/login/route.ts

import { headers } from "next/headers";

import { z } from "zod";

export const runtime = "nodejs";

import { serviceClient } from "@/shared/infra/service-client/service-client";
import { createValidatedMutation, extractUpstreamError } from "@/shared/server/route/create-route";

const loginSchema = z.object({
  identifier: z.union([z.email(), z.string().regex(/^9715\d{8}$/)], {
    error: () => ({ message: "Must be a valid email or UAE phone number starting with 9715" }),
  }),
});

export const POST = createValidatedMutation(loginSchema, async (parsed) => {
  const headerStore = await headers();

  const upstream = await serviceClient<unknown>("AUTH", "/auth/login", {
    method: "POST",
    body: JSON.stringify(parsed),
    headers: {
      "x-request-id": headerStore.get("x-request-id") ?? "",
    },
  });

  const error = extractUpstreamError(upstream.data);

  if (error) {
    return Response.json({ error }, { status: upstream.status });
  }

  const res = Response.json(upstream.data, {
    status: upstream.status,
    statusText: upstream.statusText,
  });

  const raw = upstream.headers as unknown as { raw?: () => Record<string, string[]> };
  const cookies = raw?.raw?.()["set-cookie"];

  if (cookies) {
    for (const cookie of cookies) {
      res.headers.append("set-cookie", cookie);
    }
  }

  return res;
});

---

## src/app/api/auth/logout/route.ts

import { serviceClient } from "@/shared/infra/service-client/service-client";
import { createMutation, extractUpstreamError } from "@/shared/server/route/create-route";

export const runtime = "nodejs";

export const POST = createMutation(async (req) => {
  const upstream = await serviceClient<unknown>("AUTH", "/auth/logout", {
    method: "POST",
  });

  const error = extractUpstreamError(upstream.data);

  if (error) {
    return Response.json({ error }, { status: upstream.status });
  }

  const res = Response.json(upstream.data, {
    status: upstream.status,
    statusText: upstream.statusText,
  });

  const raw = upstream.headers as unknown as { raw?: () => Record<string, string[]> };
  const cookies = raw?.raw?.()["set-cookie"];

  if (cookies) {
    for (const cookie of cookies) {
      res.headers.append("set-cookie", cookie);
    }
  }

  return res;
});

---

## src/app/api/auth/me/route.ts

import { serviceClient } from "@/shared/infra/service-client/service-client";
import { createQuery, extractUpstreamError } from "@/shared/server/route/create-route";

export const runtime = "nodejs";

export const GET = createQuery(async () => {
  const upstream = await serviceClient("AUTH", "/auth/me", {
    method: "GET",
  });
  const error = extractUpstreamError(upstream.data);

  if (error) {
    return Response.json({ error }, { status: upstream.status });
  }

  return Response.json(upstream.data, {
    status: upstream.status,
    statusText: upstream.statusText,
  });
});

---

## src/app/error.tsx

"use client";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

import { normalizeError } from "@/shared/core/errors/normalize";
import { appLogger } from "@/shared/infra/logger/with-context.client";

export default function ErrorBoundary({ error }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  const router = useRouter();

  useEffect(() => {
    appLogger.error("App Error", { error: normalizeError(error) });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-xl font-semibold">Something went wrong</h2>

      <button
        onClick={() => {
          router.refresh();
        }}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  );
}

---

## src/app/globals.css

@import "tailwindcss";

:root {
  --color-neutral-0: 255 255 255;
  --color-neutral-900: 15 23 42;

  --color-primary-500: 59 130 246;
  --color-success-500: 34 197 94;
  --color-warning-500: 245 158 11;
  --color-danger-500: 239 68 68;

  --color-bg: var(--color-neutral-0);
  --color-fg: var(--color-neutral-900);

  --color-muted: 248 250 252;
  --color-muted-fg: 100 116 139;

  --color-primary: var(--color-primary-500);
  --color-success: var(--color-success-500);
  --color-warning: var(--color-warning-500);
  --color-danger: var(--color-danger-500);

  --color-primary-fg: 255 255 255;
  --color-danger-fg: 255 255 255;

  --color-border: 226 232 240;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.08);
}

.dark {
  --color-bg: 2 6 23;
  --color-fg: 241 245 249;

  --color-muted: 15 23 42;
  --color-muted-fg: 148 163 184;

  --color-primary: 96 165 250;
  --color-primary-fg: 2 6 23;

  --color-danger: 248 113 113;
  --color-danger-fg: 2 6 23;

  --color-border: 30 41 59;
}

body {
  background: rgb(var(--color-bg));
  color: rgb(var(--color-fg));
  font-feature-settings:
    "rlig" 1,
    "calt" 1;
}

* {
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

@layer utilities {
  .bg-base {
    background-color: rgb(var(--color-bg));
  }

  .text-base {
    color: rgb(var(--color-fg));
  }

  .bg-muted {
    background-color: rgb(var(--color-muted));
  }

  .text-muted {
    color: rgb(var(--color-muted-fg));
  }

  .bg-primary {
    background-color: rgb(var(--color-primary));
  }

  .text-primary {
    color: rgb(var(--color-primary));
  }

  .border-base {
    border-color: rgb(var(--color-border));
  }

  .rounded-base {
    border-radius: var(--radius-md);
  }

  .shadow-base {
    box-shadow: var(--shadow-sm);
  }
}

[data-brand="default"] {
  --color-primary: 59 130 246;
}

[data-brand="green"] {
  --color-primary: 34 197 94;
}

[data-brand="purple"] {
  --color-primary: 168 85 247;
}

---

## src/app/layout.tsx

import { cookies, headers } from "next/headers";
import "./globals.css";

export const runtime = "nodejs";

import { type Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { Providers } from "@/app/providers";
import { decode, verifyCsrf } from "@/shared/security/csrf.server";
import { ThemeScript } from "@/shared/theme/theme-script";
import { getServerTheme } from "@/shared/theme/theme.server";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({ children }: { readonly children: React.ReactNode }) {
  const headerStore = await headers();
  const nonce = headerStore.get("x-nonce") ?? null;
  const initialTheme = await getServerTheme();
  const locale = await getLocale();
  const messages = await getMessages();
  const cookieStore = await cookies();
  const brand = "default";

  const encoded = cookieStore.get("csrf")?.value;
  const payload = encoded && verifyCsrf(encoded) ? decode(encoded) : null;

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-brand={brand}
      className={initialTheme === "dark" ? "dark" : undefined}
    >
      <body>
        <ThemeScript nonce={nonce} />

        {/* <ExternalScript src="https://www.google.com/recaptcha/api.js" nonce={nonce} /> */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers initialTheme={initialTheme} csrfToken={payload?.token ?? null} nonce={nonce}>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

---

## src/app/loading.tsx

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  );
}

---

## src/app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">404 - Not Found</h1>

      <Link href="/" className="text-blue-600 underline">
        Go back home
      </Link>
    </div>
  );
}

---

## src/app/page.tsx

export const dynamic = "force-static";

export default function Home() {
  return <div>Home</div>;
}

---

## src/app/providers.tsx

"use client";

import ClientProviders from "@/providers/providers.client";
import { ThemeProvider } from "@/providers/theme-provider";
import { type Theme } from "@/shared/theme";

export function Providers({
  children,
  initialTheme,
  csrfToken,
  nonce,
}: Readonly<{
  children: React.ReactNode;
  initialTheme: Theme;
  csrfToken: string | null;
  nonce: string | null;
}>) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ClientProviders csrfToken={csrfToken} nonce={nonce}>
        {children}
      </ClientProviders>
    </ThemeProvider>
  );
}

---

## src/app/root-error-boundary.tsx

"use client";

import { createErrorBoundary } from "@/shared/ui/error-boundary/create-error-boundary";

const RootErrorBoundary = createErrorBoundary({ name: "Root" });

export function RootErrorBoundaryProvider({ children }: { readonly children: React.ReactNode }) {
  return <RootErrorBoundary>{children}</RootErrorBoundary>;
}

---

## src/config/client/env.ts

"use client";

export const clientEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

---

## src/config/server/env.ts

import { z } from "zod";

import "server-only";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),

  APP_NAME: z.string(),

  API_SERVICE_URL: z.url(),
  AUTH_SERVICE_URL: z.url(),

  CSRF_SECRET: z.string(),
  SESSION_SECRET: z.string(),

  NEXT_PUBLIC_APP_URL: z.url(),
});

export const env = Object.freeze(schema.parse(process.env));

---

## src/features/auth/api/auth.query.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type AuthFlow } from "@/shared/types/auth-flow";

import { getMeService, loginService } from "../service/auth.service";

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: loginService,
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["auth", "me"] });

      return res;
    },
  });
}

export function useAuth() {
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMeService,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const flow: AuthFlow = query.data?.data.user ? "authenticated" : "unauthenticated";

  return {
    user: query.data?.data.user ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data?.data.user,
    refetch: query.refetch,
    flow,
  };
}

export function useLogout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => fetch("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      qc.setQueryData(["auth", "me"], null);
    },
  });
}

---

## src/features/auth/hooks/use-login.ts

import { useLogin } from "../api/auth.query";
import { resolveAuthFlow } from "../model/auth.flow";

export function useLoginHandler() {
  const mutation = useLogin();

  async function login(data: { identifier: string }) {
    const res = await mutation.mutateAsync(data);

    const flow = resolveAuthFlow(res.meta);

    return {
      flow,
      user: res.data.user,
    };
  }

  return {
    login,
    isLoading: mutation.isPending,
  };
}

---

## src/features/auth/model/auth.flow.ts

import { type AuthFlow } from "@/shared/types/auth-flow";

export function resolveAuthFlow(meta?: { nextStep?: string }): AuthFlow {
  switch (meta?.nextStep) {
    case "2fa_required":
      return "2fa_required";
    case "onboarding_required":
      return "onboarding_required";
    case "authenticated":
      return "authenticated";
    default:
      return "unauthenticated";
  }
}

---

## src/features/auth/model/auth.routes.ts

import { type Route } from "next";

import { type AuthFlow } from "@/shared/types/auth-flow";

export function resolvePostLoginRoute(flow: AuthFlow): Route {
  switch (flow) {
    case "2fa_required":
      return "/2fa";

    case "onboarding_required":
      return "/onboarding";

    case "authenticated":
      return "/dashboard";

    default:
      return "/login";
  }
}

---

## src/features/auth/model/auth.types.ts

export type User = {
  id: string;
  name: string;
};

export type ApiUser = {
  id: string;
  full_name: string;
};

---

## src/features/auth/service/auth.service.ts

import { apiClient } from "@/shared/api/client";

type LoginPayload = {
  identifier: string;
};

type LoginResponse = {
  data: {
    user: {
      id: string;
      full_name: string;
    };
  };
  meta?: {
    nextStep?: string;
  };
};

type MeResponse = {
  data: {
    user: {
      id: string;
      full_name: string;
    };
  };
};

export async function loginService(payload: LoginPayload) {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getMeService() {
  return apiClient<MeResponse>("/auth/me", {
    method: "GET",
  });
}

---

## src/i18n/messages/en.json

{}

---

## src/i18n/request.ts

import { cookies } from "next/headers";

import { getRequestConfig } from "next-intl/server";

import { defaultLocale, locales } from "./routing";

function isLocale(value: string | undefined): value is (typeof locales)[number] {
  return !!value && (locales as readonly string[]).includes(value);
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const raw = store.get("locale")?.value;

  const locale = isLocale(raw) ? raw : defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

---

## src/i18n/routing.ts

export const locales = ["en", "ar"] as const;
export const defaultLocale = "en";

export type Locale = (typeof locales)[number];

---

## src/providers/csrf-provider.tsx

"use client";

import { useEffect } from "react";

import { setCsrfToken } from "@/shared/security/csrf.client";

export function CsrfProvider({ token, children }: { token: string | null; children: React.ReactNode }) {
  if (token) {
    setCsrfToken(token);
  }

  useEffect(() => {
    if (token) {
      setCsrfToken(token);
    }
  }, [token]);

  return children;
}

---

## src/providers/providers.client.tsx

"use client";

import { memo } from "react";

import { CsrfProvider } from "@/providers/csrf-provider";
import { QueryProvider } from "@/providers/query-provider";
import { UIProvider } from "@/providers/ui-provider";
import { NotificationRenderer } from "@/shared/notifications/ui/notification-renderer";
import { NetworkIndicator } from "@/shared/ui/organisms/network-indicator";

export function ClientProviders({
  children,
  csrfToken,
}: Readonly<{ children: React.ReactNode; csrfToken: string | null }>) {
  return (
    <QueryProvider>
      <CsrfProvider token={csrfToken}>
        <UIProvider>{children}</UIProvider>

        <NetworkIndicator />
        <NotificationRenderer />
      </CsrfProvider>
    </QueryProvider>
  );
}

export default memo(ClientProviders);

---

## src/providers/query-provider.tsx

"use client";

import { useState } from "react";

import { QueryClientProvider } from "@tanstack/react-query";

import { createQueryClient } from "@/shared/infra/react-query/get-query-client";

export function QueryProvider({ children }: { readonly children: React.ReactNode }) {
  const [client] = useState(() => createQueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

---

## src/providers/react-query-devtools.ts

"use client";

import dynamic from "next/dynamic";

export const Devtools =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@tanstack/react-query-devtools").then((m) => m.ReactQueryDevtools), { ssr: false })
    : () => null;

---

## src/providers/theme-provider.tsx

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { setStoredTheme, type Theme, type ThemeContextValue } from "@/shared/theme";
import { resolveTheme } from "@/shared/theme/resolve-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialTheme,
}: Readonly<{ children: React.ReactNode; initialTheme: Theme }>) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;

    const apply = (value: Theme) => {
      const resolved = resolveTheme(value);

      root.classList.toggle("dark", resolved === "dark");
    };

    apply(theme);
    setStoredTheme(theme);

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = () => {
      apply("system");
    };

    media.addEventListener("change", handler);

    return () => {
      media.removeEventListener("change", handler);
    };
  }, [theme]);

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const resolved = resolveTheme(prev);
      return resolved === "light" ? "dark" : "light";
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");

  return ctx;
}

---

## src/providers/ui-provider.tsx

"use client";

import { useMemo } from "react";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";

import { ScreenLoader } from "@/shared/ui/organisms/screen-loader";

export function UIProvider({ children }: { readonly children: React.ReactNode }) {
  const isFetching = useIsFetching({
    predicate: (query) => query.meta?.blocking === true,
  });

  const isMutating = useIsMutating({
    predicate: (mutation) => mutation.meta?.blocking === true,
  });

  const isBlocking = useMemo(() => {
    return isFetching > 0 || isMutating > 0;
  }, [isFetching, isMutating]);

  return (
    <>
      <ScreenLoader isLoading={isBlocking} />
      {children}
    </>
  );
}

---

## src/proxy.ts

import crypto from "crypto";

import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/config/server/env";
import { buildCSP } from "@/shared/security/csp";
import { generateCsrfToken } from "@/shared/security/csrf.server";

export function proxy(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;

    const lastSegment = pathname.split("/").pop();
    const isPublicFile = lastSegment?.includes(".") ?? false;

    if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || isPublicFile) {
      return NextResponse.next();
    }

    const nonce = crypto.randomBytes(16).toString("base64");
    const csp = buildCSP(nonce);

    const requestHeaders = new Headers(req.headers);

    requestHeaders.set("x-nonce", nonce);

    if (!requestHeaders.get("x-request-id")) {
      requestHeaders.set("x-request-id", crypto.randomUUID());
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    const csrfCookie = req.cookies.get("csrf")?.value;

    if (!csrfCookie) {
      const encoded = generateCsrfToken();

      response.cookies.set("csrf", encoded, {
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        path: "/",
      });
    }

    const existingLocale = req.cookies.get("locale")?.value;
    const locale = existingLocale || "en";

    if (existingLocale !== locale) {
      response.cookies.set("locale", locale, {
        path: "/",
        sameSite: "lax",
        httpOnly: true,
        secure: env.NODE_ENV === "production",
      });
    }

    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

    return response;
  } catch {
    return new NextResponse("Proxy failure", { status: 500 });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

---

## src/shared/api/client.ts

export { apiClient } from "@/shared/infra/api-client/api-client.client";

---

## src/shared/api/server.ts

import "server-only";

export { apiClient } from "@/shared/infra/api-client/api-client.server";

---

## src/shared/config/services.ts

import { env } from "@/config/server/env";

export const SERVICES = {
  AUTH: env.AUTH_SERVICE_URL,
  API: env.API_SERVICE_URL,
} as const;

if (!SERVICES.AUTH || !SERVICES.API) {
  throw new Error("Missing required service URLs");
}

---

## src/shared/core/errors/error-mapper.ts

import { AppError, HttpError, NetworkError, SessionExpiredError } from "@/shared/core/errors";

export function mapToDomainError(err: unknown): AppError {
  if (err instanceof HttpError) {
    if (err.status === 401) return new SessionExpiredError();

    if (err.status === 403) return new HttpError(403, "Unauthorized");

    return err;
  }

  if (err instanceof AppError) return err;

  if (err instanceof DOMException && err.name === "AbortError") {
    return new NetworkError();
  }

  return new NetworkError();
}

---

## src/shared/core/errors/index.ts

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export class HttpError extends AppError {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message, "HTTP_ERROR", status >= 500);
  }
}

export class NetworkError extends AppError {
  constructor() {
    super("Network error", "NETWORK_ERROR");
  }
}

export class SessionExpiredError extends AppError {
  constructor() {
    super("Session expired", "SESSION_EXPIRED");
  }
}

---

## src/shared/core/errors/normalize.ts

type NormalizedError = {
  message: string;
  name?: string;
  stack?: string;
  status?: number;
  cause?: unknown;

  code?: string;
  meta?: Record<string, unknown>;
};

type ErrorWithMeta = Error & {
  status?: number;
  code?: string;
  meta?: Record<string, unknown>;
};

export function normalizeError(err: unknown): NormalizedError {
  if (err instanceof Error) {
    const e = err as ErrorWithMeta;

    return {
      message: err.message,
      name: err.name,

      ...(e.cause !== undefined ? { cause: e.cause } : undefined),
      // ...(err.stack ? { stack: err.stack } : undefined),

      ...(e.status !== undefined && { status: e.status }),
      ...(e.code !== undefined && { code: e.code }),
      ...(e.meta !== undefined && { meta: e.meta }),
    };
  }

  if (err && typeof err === "object") {
    try {
      return {
        message: JSON.stringify(err),
      };
    } catch {
      return {
        message: "[Unserializable error object]",
      };
    }
  }

  return {
    message: String(err),
  };
}

---

## src/shared/core/types/dot-paths.ts

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends Primitive
    ? `${Prefix}${K & string}`
    : T[K] extends readonly unknown[]
      ? `${Prefix}${K & string}`
      : DotPaths<T[K], `${Prefix}${K & string}.`>;
}[keyof T];

---

## src/shared/infra/api-client/abort/abort.ts

type MergeOptions = {
  timeout?: number;
  parent?: AbortSignal | null;
};

export function createAbortSignal({ parent, timeout }: MergeOptions = {}): AbortSignal {
  const controller = new AbortController();

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const abort = () => {
    if (!controller.signal.aborted) {
      controller.abort();
    }
  };

  if (parent) {
    if (parent.aborted) {
      abort();
    } else {
      parent.addEventListener("abort", abort, { once: true });
    }
  }

  if (timeout != null) {
    timeoutId = setTimeout(abort, timeout);
  }

  controller.signal.addEventListener(
    "abort",
    () => {
      if (timeoutId) clearTimeout(timeoutId);
    },
    { once: true },
  );

  return controller.signal;
}

---

## src/shared/infra/api-client/api-client.base.ts

import { z } from "zod";

import { HttpError } from "@/shared/core/errors";
import { mapToDomainError } from "@/shared/core/errors/error-mapper";
import { normalizeError } from "@/shared/core/errors/normalize";
import { createAbortSignal } from "@/shared/infra/api-client/abort/abort";
import { type Logger } from "@/shared/infra/logger/contracts/logger";

import { apiResponseSchema } from "./api-response.schema";

type ApiOptions = RequestInit & {
  timeout?: number;
  signal?: AbortSignal | null;
};

export async function executeRequest<T>(
  path: string,
  options: ApiOptions = {},
  extraHeaders?: HeadersInit,
  logger?: Logger,
): Promise<T> {
  const start = Date.now();

  const exec = async (): Promise<T> => {
    const base = "";

    const signal = createAbortSignal({
      ...(options.signal !== undefined && {
        parent: options.signal,
      }),
      timeout: options.timeout ?? 8000,
    });
    const res = await fetch(`${base}${path}`, {
      ...options,
      credentials: "include",
      signal,
      headers: {
        ...(options.headers ?? {}),
        ...(extraHeaders ?? {}),
      },
    });

    // ✅ capture rotated CSRF token
    const newCsrfToken = res.headers.get("x-csrf-token");

    if (newCsrfToken && typeof window !== "undefined") {
      const { setCsrfToken } = await import("@/shared/security/csrf.client");

      setCsrfToken(newCsrfToken);
    }

    if (!res.ok) {
      logger?.error("API ERROR", {
        path,
        status: res.status,
        duration: Date.now() - start,
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        const json = await res.json().catch(() => null);
        throw new HttpError(res.status, json?.message ?? "HTTP_ERROR");
      }

      const text = await res.text();
      throw new HttpError(res.status, text || "HTTP_ERROR");
    }

    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const json = await res.json();

      const parsed = apiResponseSchema(z.any()).safeParse(json);

      if (!parsed.success) {
        throw new HttpError(res.status, "INVALID_RESPONSE_FORMAT");
      }

      const { data, error } = parsed.data;

      if (error) {
        throw new HttpError(res.status, error);
      }

      return data as T;
    }

    const text = await res.text();

    return text as unknown as T;
  };

  try {
    const result = await exec();

    if (process.env.NODE_ENV !== "production") {
      logger?.info("API success", {
        path,
        duration: Date.now() - start,
      });
    }

    return result;
  } catch (err) {
    logger?.error("API FAILURE", {
      path,
      duration: Date.now() - start,
      error: normalizeError(err),
    });

    throw mapToDomainError(err);
  }
}

---

## src/shared/infra/api-client/api-client.client.ts

import { apiLogger } from "@/shared/infra/logger/with-context.client";
import { getClientRequestContext } from "@/shared/request/request-context.client";
import { getCsrfToken } from "@/shared/security/csrf.client";

import { executeRequest } from "./api-client.base";

export async function apiClient<T>(
  path: string,
  options?: RequestInit & { retry?: { retries?: number }; cache?: RequestCache },
) {
  const ctx = getClientRequestContext();

  const csrfToken = getCsrfToken();

  const headers: HeadersInit = {
    ...(options?.headers ?? {}),
    ...(ctx ? { "x-request-id": ctx.traceId } : {}),
    ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
  };

  return executeRequest<T>(`/api${path}`, options, headers, apiLogger);
}

---

## src/shared/infra/api-client/api-client.server.ts

import "server-only";

import { apiLogger } from "@/shared/infra/logger/with-context.server";
import { getServerRequestContext } from "@/shared/request/request-context.server";

import { executeRequest } from "./api-client.base";

export async function apiClient<T>(
  path: string,
  options?: RequestInit & { retry?: { retries?: number }; cache?: RequestCache },
) {
  const ctx = await getServerRequestContext();

  const headers: HeadersInit = {
    ...(options?.headers ?? {}),
    ...(ctx ? { "x-request-id": ctx.traceId } : {}),
    ...(ctx?.locale ? { "accept-language": ctx.locale } : {}),
  };

  return executeRequest<T>(path, options, headers, apiLogger);
}

---

## src/shared/infra/api-client/api-response.schema.ts

import { z } from "zod";

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z
      .object({
        nextStep: z.string().optional(),
      })
      .optional(),
    error: z.string().optional(),
  });

---

## src/shared/infra/logger/contracts/logger.ts

export type LogMeta = Record<string, unknown>;

export interface Logger {
  debug(msg: string, meta?: LogMeta): void;
  info(msg: string, meta?: LogMeta): void;
  warn(msg: string, meta?: LogMeta): void;
  error(msg: string, meta?: LogMeta): void;
}

---

## src/shared/infra/logger/logger.client.ts

import { serializeMeta } from "./serializer";

function log(level: string, msg: string, meta?: Record<string, unknown>) {
  const payload = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...serializeMeta(meta),
  };

  if (process.env.NODE_ENV === "development") {
    const method = resolveConsoleMethod(level);

    // eslint-disable-next-line no-console
    console[method as "log"]?.(payload);

    return;
  }

  const method = resolveConsoleMethod(level);

  // eslint-disable-next-line no-console
  console[method as "log"]?.(payload);
}

function resolveConsoleMethod(level: string): "log" | "info" | "warn" | "error" {
  switch (level) {
    case "error":
      return "error";
    case "warn":
      return "warn";
    case "info":
      return "info";
    default:
      return "log";
  }
}

export const baseLogger = {
  child: (ctx: Record<string, unknown>) => ({
    debug: (msg: string, meta?: Record<string, unknown>) => {
      log("debug", msg, { ...ctx, ...meta });
    },

    info: (msg: string, meta?: Record<string, unknown>) => {
      log("info", msg, { ...ctx, ...meta });
    },

    warn: (msg: string, meta?: Record<string, unknown>) => {
      log("warn", msg, { ...ctx, ...meta });
    },

    error: (msg: string, meta?: Record<string, unknown>) => {
      log("error", msg, { ...ctx, ...meta });
    },
  }),
};

---

## src/shared/infra/logger/logger.server.ts

import pino from "pino";

import { env } from "@/config/server/env";

const isProd = env.NODE_ENV === "production";

export const baseLogger = pino({
  level: env.LOG_LEVEL ?? (isProd ? "info" : "debug"),

  base: {
    env: env.NODE_ENV,
    service: "web-app",
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "headers.authorization", "headers.cookie"],
    censor: "[REDACTED]",
  },

  formatters: {
    level(label) {
      return { level: label };
    },
  },

  serializers: {
    err: pino.stdSerializers.err,
  },
});

---

## src/shared/infra/logger/serializer.ts

/* eslint-disable security/detect-object-injection */
import { normalizeError } from "@/shared/core/errors/normalize";

export function serializeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;

  const result: Record<string, unknown> = {};

  for (const key in meta) {
    const value = meta[key];

    if (value instanceof Error) {
      result[key] = normalizeError(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

---

## src/shared/infra/logger/with-context.client.ts

import { baseLogger } from "./logger.client";

function withContext(baseCtx: Record<string, unknown>) {
  return baseLogger.child(baseCtx);
}

export const apiLogger = withContext({ scope: "api" });
export const appLogger = withContext({ scope: "app" });
export const uiLogger = withContext({ scope: "ui" });

---

## src/shared/infra/logger/with-context.server.ts

import { baseLogger } from "./logger.server";
import { serializeMeta } from "./serializer";

function withContext(baseCtx: Record<string, unknown>) {
  const logger = baseLogger.child(baseCtx);

  return {
    debug: (msg: string, meta?: Record<string, unknown>) => {
      logger.debug({ ...serializeMeta(meta) }, msg);
    },

    info: (msg: string, meta?: Record<string, unknown>) => {
      logger.info({ ...serializeMeta(meta) }, msg);
    },

    warn: (msg: string, meta?: Record<string, unknown>) => {
      logger.warn({ ...serializeMeta(meta) }, msg);
    },

    error: (msg: string, meta?: Record<string, unknown>) => {
      logger.error({ ...serializeMeta(meta) }, msg);
    },
  };
}

export const apiLogger = withContext({ scope: "api" });
export const appLogger = withContext({ scope: "app" });
export const routeLogger = withContext({ scope: "route" });

---

## src/shared/infra/react-query/get-query-client.ts

import { QueryCache, QueryClient } from "@tanstack/react-query";

import { isAppError } from "@/shared/core/errors";
import { mapErrorToEvent } from "@/shared/notifications/model/error-to-event";
import { emitNotification } from "@/shared/notifications/model/service";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        networkMode: "online",

        retry: (failureCount, error: unknown) => {
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            return false;
          }

          if (isAppError(error)) {
            if (!error.retryable) return false;

            return failureCount < 2;
          }

          return failureCount < 1;
        },

        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        networkMode: "online",
        onError: (error) => {
          emitNotification(mapErrorToEvent(error));
        },
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        emitNotification(mapErrorToEvent(error));
      },
    }),
  });
}

---

## src/shared/infra/react-query/hydrate.ts

import { dehydrate } from "@tanstack/react-query";

import { createQueryClient } from "./get-query-client";

export async function getDehydratedState(key: readonly unknown[], fn: () => Promise<unknown>) {
  const queryClient = createQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: key,
      queryFn: fn,
    });
  } catch {
    // Ignore errors
  }

  return dehydrate(queryClient, {
    shouldDehydrateQuery: (q) => q.state.status === "success",
  });
}

---

## src/shared/infra/react-query/online-manager.ts

import { onlineManager } from "@tanstack/react-query";

if (typeof window !== "undefined") {
  onlineManager.setEventListener((setOnline) => {
    const update = () => {
      const online = navigator.onLine;

      setOnline(online);
    };

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  });
}

---

## src/shared/infra/service-client/service-client.ts

import "server-only";

import { headers } from "next/headers";

import { env } from "@/config/server/env";
import { HttpError } from "@/shared/core/errors";
import { mapToDomainError } from "@/shared/core/errors/error-mapper";
import { normalizeError } from "@/shared/core/errors/normalize";
import { apiLogger } from "@/shared/infra/logger/with-context.server";

type ServiceName = "AUTH" | "API";

function resolveServiceUrl(service: ServiceName) {
  switch (service) {
    case "AUTH":
      return env.AUTH_SERVICE_URL;
    case "API":
      return env.API_SERVICE_URL;
  }
}

export async function serviceClient<T>(
  service: ServiceName,
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; headers: Headers; status: number; statusText: string }> {
  const start = Date.now();

  try {
    const headerStore = await headers();

    const cookie = headerStore.get("cookie");

    const csrf = headerStore.get("x-csrf-token");

    const traceId = headerStore.get("x-request-id");

    const res = await fetch(`${resolveServiceUrl(service)}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
        ...(traceId ? { "x-request-id": traceId } : {}),
        ...(csrf ? { "x-csrf-token": csrf } : {}),
        ...(cookie ? { cookie } : {}),
      },
      signal: AbortSignal.timeout(5000), // 5 seconds timeout
    });

    const contentType = res.headers.get("content-type") ?? "";

    if (!res.ok) {
      apiLogger.error("SERVICE_ERROR", {
        service,
        path,
        status: res.status,
        duration: Date.now() - start,
      });

      if (contentType.includes("application/json")) {
        const json = await res.json().catch(() => null);
        throw new HttpError(res.status, json?.message ?? "SERVICE_ERROR");
      }

      const text = await res.text();
      throw new HttpError(res.status, text || "SERVICE_ERROR");
    }

    let data: unknown;

    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return {
      data: data as T,
      headers: res.headers,
      status: res.status,
      statusText: res.statusText,
    };
  } catch (err) {
    apiLogger.error("SERVICE_FAILURE", {
      service,
      path,
      duration: Date.now() - start,
      error: normalizeError(err),
    });

    throw mapToDomainError(err);
  }
}

---

## src/shared/notifications/model/error-to-event.ts

import { AppError, NetworkError, SessionExpiredError } from "@/shared/core/errors";

import { type NotificationEvent } from "./types";

export function mapErrorToEvent(error: unknown): NotificationEvent {
  if (error instanceof SessionExpiredError) {
    return { type: "UNKNOWN_ERROR" };
  }

  if (error instanceof NetworkError) {
    return { type: "NETWORK_OFFLINE" };
  }

  if (error instanceof AppError) {
    return { type: "UNKNOWN_ERROR" };
  }

  return { type: "UNKNOWN_ERROR" };
}

---

## src/shared/notifications/model/mapper.ts

import { type Notification, type NotificationEvent } from "./types";

export function mapEventToNotification(event: NotificationEvent): Notification | null {
  switch (event.type) {
    case "AUTH_LOGIN_SUCCESS":
      return {
        id: "auth.success",
        message: "Welcome back",
        level: "success",
        dedupeKey: "auth.success",
        ttl: 3000,
        createdAt: Date.now(),
      };

    case "AUTH_LOGIN_FAILED":
      return {
        id: "auth.failed",
        message: "Invalid credentials",
        level: "error",
        ttl: 4000,
        createdAt: Date.now(),
      };

    case "NETWORK_OFFLINE":
      return {
        id: "network.offline",
        message: "You are offline",
        level: "warning",
        dedupeKey: "network",
        ttl: 5000,
        createdAt: Date.now(),
      };

    case "UNKNOWN_ERROR":
      return {
        id: "unknown.error",
        message: "Something went wrong",
        level: "error",
        ttl: 4000,
        createdAt: Date.now(),
      };

    default:
      return null;
  }
}

---

## src/shared/notifications/model/service.ts

import { mapEventToNotification } from "./mapper";
import { notificationStore } from "./store";
import { type NotificationEvent } from "./types";

export function emitNotification(event: NotificationEvent) {
  const notification = mapEventToNotification(event);

  if (!notification) return;

  notificationStore.push(notification);
}

---

## src/shared/notifications/model/store.ts

type Listener = () => void;

import { type Notification } from "./types";

class NotificationStore {
  private queue: Notification[] = [];

  private listeners: Listener[] = [];

  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  push(notification: Notification) {
    if (notification.dedupeKey && this.queue.some((n) => n.dedupeKey === notification.dedupeKey)) {
      return; // ✅ deterministic dedupe
    }

    const id = `${notification.id}_${Date.now()}`;

    const enriched: Notification = {
      ...notification,
      id,
    };

    this.queue = [...this.queue, enriched];
    this.emit();

    if (notification.ttl) {
      const timer = setTimeout(() => {
        this.remove(id);
        this.timers.delete(id);
      }, notification.ttl);

      this.timers.set(id, timer);
    }
  }

  remove(id: string) {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);

    this.queue = this.queue.filter((n) => n.id !== id);
    this.emit();
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getState() {
    return this.queue;
  }

  private emit() {
    this.listeners.forEach((l) => {
      l();
    });
  }
}

export const notificationStore = new NotificationStore();

---

## src/shared/notifications/model/types.ts

export type NotificationLevel = "info" | "success" | "error" | "warning";

export type NotificationEvent =
  | { type: "AUTH_LOGIN_SUCCESS"; userId: string }
  | { type: "AUTH_LOGIN_FAILED" }
  | { type: "NETWORK_OFFLINE" }
  | { type: "UNKNOWN_ERROR" };

export type Notification = {
  id: string;
  message: string;
  level: NotificationLevel;
  dedupeKey?: string;
  ttl?: number;
  createdAt: number;
};

---

## src/shared/notifications/ui/notification-renderer.tsx

"use client";

import { useEffect, useState } from "react";

import { notificationStore } from "../model/store";

export function NotificationRenderer() {
  const [notifications, setNotifications] = useState(notificationStore.getState());

  useEffect(() => {
    return notificationStore.subscribe(() => {
      setNotifications([...notificationStore.getState()]);
    });
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2" role="status" aria-live="polite">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`rounded-md px-4 py-2 text-sm shadow ${
            n.level === "success"
              ? "bg-green-500 text-white"
              : n.level === "error"
                ? "bg-red-500 text-white"
                : n.level === "warning"
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-800 text-white"
          }`}
          onClick={() => {
            notificationStore.remove(n.id);
          }}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}

---

## src/shared/notifications/ui/notification.theme.ts

export type NotificationTheme = {
  base: {
    style: React.CSSProperties;
    duration: number;
  };

  variants: {
    success: {
      style: React.CSSProperties;
      duration?: number;
    };
    error: {
      style: React.CSSProperties;
      duration?: number;
    };
    info: {
      style: React.CSSProperties;
    };
    warning: {
      style: React.CSSProperties;
    };
  };
};

---

## src/shared/request/request-context.client.ts

export function getClientRequestContext() {
  return {
    traceId:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : (() => {
            throw new Error("crypto.randomUUID is not supported in this environment");
          })(),
    locale: null,
  };
}

---

## src/shared/request/request-context.server.ts

import "server-only";

import { cookies, headers } from "next/headers";

import { cache } from "react";

export const getServerRequestContext = cache(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  const traceId =
    headerStore.get("x-request-id") ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : (() => {
          throw new Error("crypto.randomUUID is not supported in this environment");
        })());

  return {
    traceId,
    locale: cookieStore.get("locale")?.value ?? null,
  };
});

---

## src/shared/security/ExternalScript.tsx

"use client";

import Script from "next/script";

type Props = {
  src: string;
  nonce: string | undefined;
  strategy?: "beforeInteractive" | "afterInteractive" | "lazyOnload";
};

export function ExternalScript({ src, nonce, strategy = "afterInteractive" }: Readonly<Props>) {
  return <Script src={src} nonce={nonce ?? undefined} strategy={strategy} />;
}

---

## src/shared/security/csp.ts

import { env } from "@/config/server/env";

export function buildCSP(nonce: string) {
  const isDev = env.NODE_ENV !== "production";

  const noncePart = `'nonce-${nonce}'`;

  const api = new URL(env.API_SERVICE_URL).origin;
  const auth = new URL(env.AUTH_SERVICE_URL).origin;

  return [
    "default-src 'self'",

    `script-src 'self' ${noncePart} 'strict-dynamic' https://www.google.com https://www.gstatic.com ${
      isDev ? "'unsafe-eval'" : ""
    }`,

    "script-src-attr 'none'",

    `style-src 'self' ${isDev ? "'unsafe-inline'" : noncePart}`,

    "img-src 'self' data: blob:",

    `connect-src 'self' ${api} ${auth}`,
    "font-src 'self' data:",
    `script-src-elem 'self' ${noncePart} https://www.google.com https://www.gstatic.com`,
    "worker-src 'self' blob:",

    "frame-src 'self' https://www.google.com",
    "frame-ancestors 'none'",

    "base-uri 'self'",
    "form-action 'self'",

    "object-src 'none'",

    "upgrade-insecure-requests",
    "report-uri /api/csp-report",

    ...(isDev ? [] : ["require-trusted-types-for 'script'", "trusted-types nextjs nextjs#bundler"]),
  ].join("; ");
}

---

## src/shared/security/csrf.client.ts

let csrfToken: string | null = null;

export function setCsrfToken(token: string) {
  csrfToken = token;
}

export function getCsrfToken() {
  return csrfToken;
}

export function clearCsrfToken() {
  csrfToken = null;
}

---

## src/shared/security/csrf.core.ts

export const CSRF_COOKIE = "csrf";
export const CSRF_HEADER = "x-csrf-token";

export function isSafeMethod(method: string) {
  return ["GET", "HEAD", "OPTIONS"].includes(method);
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

---

## src/shared/security/csrf.guard.ts

import { cookies, headers } from "next/headers";

import { CSRF_HEADER, timingSafeEqual } from "@/shared/security/csrf.core";

import { decode, verifyCsrf } from "./csrf.server";
import { HttpError } from "../core/errors";

export async function assertValidCsrf() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const encoded = cookieStore.get("csrf")?.value;
  const header = headerStore.get(CSRF_HEADER);

  if (!encoded) {
    throw new HttpError(403, "CSRF_COOKIE_MISSING");
  }

  if (!header) {
    throw new HttpError(403, "CSRF_HEADER_MISSING");
  }

  const valid = verifyCsrf(encoded);
  const payload = decode(encoded);

  if (!valid || !payload) {
    throw new HttpError(403, "CSRF_INVALID_OR_EXPIRED");
  }

  const same = timingSafeEqual(payload.token, header);

  if (!same) {
    throw new HttpError(403, "CSRF_TOKEN_MISMATCH");
  }
}

---

## src/shared/security/csrf.server.ts

import crypto from "crypto";
import "server-only";

import { env } from "@/config/server/env";

import { timingSafeEqual } from "./csrf.core";

const CSRF_SECRET = env.CSRF_SECRET;

type CsrfPayload = {
  token: string;
  iat: number;
  exp: number;
};

function sign(value: string): string {
  return crypto.createHmac("sha256", CSRF_SECRET).update(value).digest("hex");
}

function encode(payload: CsrfPayload): string {
  const json = JSON.stringify(payload);
  const signature = sign(json);

  return Buffer.from(`${json}.${signature}`).toString("base64");
}

export function decode(encoded: string): CsrfPayload | null {
  try {
    const raw = Buffer.from(encoded, "base64").toString("utf-8");
    const [json, signature] = raw.split(".");

    if (!json || !signature) return null;

    const expected = sign(json);

    if (!timingSafeEqual(signature, expected)) return null;

    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function generateCsrfToken() {
  const now = Date.now();

  const payload: CsrfPayload = {
    token: crypto.randomBytes(32).toString("hex"),
    iat: now,
    exp: now + 1000 * 60 * 5,
  };

  return encode(payload);
}

export function verifyCsrf(encoded: string): boolean {
  const payload = decode(encoded);

  if (!payload) return false;

  const now = Date.now();

  if (now > payload.exp) return false;

  if (payload.iat > now + 1000 * 10) return false;

  return true;
}

---

## src/shared/security/with-csrf-action.ts

import { assertValidCsrf } from "./csrf.guard";

type AsyncFn<Args extends unknown[], R> = (...args: Args) => Promise<R>;

export function withCsrfAction<Args extends unknown[], R>(fn: AsyncFn<Args, R>): AsyncFn<Args, R> {
  return async (...args: Args): Promise<R> => {
    await assertValidCsrf();

    return fn(...args);
  };
}

---

## src/shared/server/auth/get-user.ts

import { serviceClient } from "@/shared/infra/service-client/service-client";

export async function getUser() {
  try {
    const res = await serviceClient<{ user: { id: string; full_name: string } }>("AUTH", "/auth/me", {
      method: "GET",
    });

    return res.data.user ?? null;
  } catch (err) {
    if (err instanceof Error && "status" in err && (err as any).status === 401) {
      return null;
    }

    throw err;
  }
}

---

## src/shared/server/route/create-route.ts

import { NextResponse } from "next/server";

import { type z } from "zod";

import { env } from "@/config/server/env";
import { isSafeMethod } from "@/shared/security/csrf.core";
import { assertValidCsrf } from "@/shared/security/csrf.guard";
import { decode, generateCsrfToken } from "@/shared/security/csrf.server";

import { type AppRouteHandler } from "./types";

export function createValidatedMutation<T extends z.ZodTypeAny>(
  schema: T,
  handler: (data: z.infer<T>, req: Request, ctx: unknown) => Promise<Response>,
): AppRouteHandler {
  return createMutation(async (req, ctx) => {
    const MAX_BODY_SIZE = 1024 * 10; // 10kb

    const contentLength = req.headers.get("content-length");

    if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
    }

    const body = await req.json();

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    return handler(parsed.data, req, ctx);
  });
}

export function extractUpstreamError(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "error" in data) {
    return (data as any).error;
  }

  return null;
}

// ─────────────────────────────────────────────
// 🔒 MUTATION (CSRF ENFORCED ALWAYS)
// ─────────────────────────────────────────────
export function createMutation(handler: AppRouteHandler): AppRouteHandler {
  return async (req, ctx) => {
    const MAX_BODY_SIZE = 1024 * 10; // 10kb

    const contentLength = req.headers.get("content-length");

    if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
    }

    if (!isSafeMethod(req.method)) {
      try {
        await assertValidCsrf(); // ✅ SINGLE SOURCE OF TRUTH
      } catch {
        return NextResponse.json({ error: "CSRF_VALIDATION_FAILED" }, { status: 403 });
      }
    }

    const res = await handler(req, ctx);

    // 🔁 rotate token after every mutation

    const encoded = generateCsrfToken();
    const payload = decode(encoded);

    const headers = new Headers(res.headers);

    const next = new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });

    if (payload) {
      // httpOnly signed payload
      next.cookies.set("csrf", encoded, {
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        path: "/",
      });

      // ✅ critical fix: sync client immediately
      next.headers.set("x-csrf-token", payload.token);
    } else {
      // fallback safety (should never happen)
      return NextResponse.json({ error: "CSRF_ROTATION_FAILED" }, { status: 500 });
    }

    return next;
  };
}

// ─────────────────────────────────────────────
// 🌐 QUERY (SAFE)
// ─────────────────────────────────────────────
export function createQuery(handler: AppRouteHandler): AppRouteHandler {
  return handler;
}

---

## src/shared/server/route/types.ts

export type AppRouteHandler<TCtx = unknown> = (req: Request, ctx: TCtx) => Promise<Response> | Response;

export type MutationHandler<TCtx = unknown> = AppRouteHandler<TCtx>;
export type QueryHandler<TCtx = unknown> = AppRouteHandler<TCtx>;

---

## src/shared/theme/index.ts

import { resolveTheme } from "./resolve-theme";

export type Theme = "light" | "dark" | "system";

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const THEME_STORAGE_KEY = "theme";

export const DEFAULT_THEME: Theme = "light";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
}

export function setStoredTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  localStorage.setItem(THEME_STORAGE_KEY, theme);

  document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax; Secure`;
}

export function getPreferredTheme(): Theme {
  const stored = getStoredTheme();
  if (stored) return stored;

  return resolveTheme("system");
}

---

## src/shared/theme/resolve-theme.ts

export function resolveTheme(theme: "light" | "dark" | "system"): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return theme;
}

---

## src/shared/theme/theme-script.tsx

export function ThemeScript({ nonce }: Readonly<{ nonce?: string | null }>) {
  const script = `
     (function() {
       try {
         var theme = document.cookie
           .split("; ")
           .find(row => row.startsWith("theme="))
           ?.split("=")[1];

         if (!theme || theme === "system") {
           var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
           theme = dark ? "dark" : "light";
         }

         document.documentElement.classList.toggle("dark", theme === "dark");
       } catch (e) {}
     })();
   `;

  return <script nonce={nonce ?? undefined} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: script }} />;
}

---

## src/shared/theme/theme.server.ts

import { cookies, headers } from "next/headers";

import { type Theme } from "@/shared/theme";

export async function getServerTheme(): Promise<Theme> {
  const cookieStore = await cookies();

  const cookieTheme = cookieStore.get("theme")?.value as Theme | undefined;
  if (cookieTheme) return cookieTheme;

  const headerStore = await headers();
  const secChPrefersColorScheme = headerStore.get("sec-ch-prefers-color-scheme");

  if (secChPrefersColorScheme === "dark") return "dark";

  if (secChPrefersColorScheme === "light") return "light";

  return cookieTheme ?? "light";
}

---

## src/shared/types/auth-flow.ts

export type AuthFlow = "unauthenticated" | "authenticated" | "2fa_required" | "onboarding_required";

---

## src/shared/ui/error-boundary/create-error-boundary.tsx

import React from "react";

import { env } from "@/config/server/env";
import { normalizeError } from "@/shared/core/errors/normalize";

type FallbackProps = {
  reset: () => void;
  error: ReturnType<typeof normalizeError> | null;
  rawError: unknown | null;
};

type Options = {
  name: string;
  fallback?: React.ComponentType<FallbackProps>;
};

export function createErrorBoundary({ name, fallback }: Options) {
  return class GenericErrorBoundary extends React.Component<
    { children: React.ReactNode },
    {
      hasError: boolean;
      error: ReturnType<typeof normalizeError> | null;
      rawError: unknown | null;
      resetKey: number;
    }
  > {
    static readonly displayName = `ErrorBoundary(${name})`;

    override state = {
      hasError: false,
      error: null,
      rawError: null,
      resetKey: 0,
    };

    static getDerivedStateFromError(error: unknown) {
      const normalized = normalizeError(error);

      return {
        hasError: true,
        error: normalized,
        rawError: error,
      };
    }

    override componentDidCatch(error: unknown, info: React.ErrorInfo) {
      if (env.NODE_ENV !== "production") {
        console.error("React ErrorBoundary", normalizeError(error), info);
      }
    }

    reset = () => {
      if (this.state.hasError) {
        this.setState((prev) => ({
          hasError: false,
          error: null,
          rawError: null,
          resetKey: prev.resetKey + 1,
        }));
      }
    };

    override render() {
      if (this.state.hasError) {
        if (fallback) {
          const Fallback = fallback;
          return <Fallback reset={this.reset} error={this.state.error} rawError={this.state.rawError} />;
        }

        return (
          <div className="p-4 text-sm text-red-500">
            Something went wrong in {name}
            <button onClick={this.reset} className="ml-2 underline">
              Retry
            </button>
          </div>
        );
      }

      return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
    }
  };
}

---

## src/shared/ui/organisms/network-indicator.tsx

"use client";

import { useEffect } from "react";

import { onlineManager } from "@tanstack/react-query";

import { emitNotification } from "@/shared/notifications/model/service";

export function NetworkIndicator() {
  useEffect(() => {
    return onlineManager.subscribe((online) => {
      if (!online) {
        emitNotification({ type: "NETWORK_OFFLINE" });
      }
    });
  }, []);

  return null;
}

---

## src/shared/ui/organisms/screen-loader.tsx

export function ScreenLoader({ isLoading }: { readonly isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="pointer-events-none fixed top-0 right-0 left-0 z-[9999] h-1">
      <div className="h-full w-full animate-pulse bg-blue-500" />
    </div>
  );
}

---

## src/shared/utils/format/currency.ts

export function formatCurrency(amount: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

---

## src/shared/utils/format/date.ts

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(date));
}

---

## src/shared/utils/format/number.ts

export function formatNumber(value: number, locale = "en-US", options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(locale, options).format(value);
}

---

## src/shared/utils/guards/is-defined.ts

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

---

## src/shared/utils/guards/is-empty.ts

export function isEmpty(value: unknown): boolean {
  if (value == null) return true;

  if (typeof value === "string") return value.trim().length === 0;

  if (Array.isArray(value)) return value.length === 0;

  if (typeof value === "object") return Object.keys(value).length === 0;

  return false;
}

---

## src/shared/utils/id/generate-id.ts

export function generateId(prefix = ""): string {
  const id = crypto.randomUUID?.();

  return prefix ? `${prefix}_${id}` : id;
}

---

## src/shared/utils/string/capitalize.ts

export function capitalize(text: string) {
  if (!text) return text;

  return text.charAt(0).toUpperCase() + text.slice(1);
}

---

## src/shared/utils/string/slugify.ts

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

---

## src/shared/utils/string/truncate.ts

export function truncate(text: string, length: number) {
  if (text.length <= length) return text;

  return text.slice(0, length).trimEnd() + "…";
}

---

## src/state/ui.store.ts

import { create } from "zustand";

type UIState = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => {
    set((s) => ({ isSidebarOpen: !s.isSidebarOpen }));
  },
}));

---

## tailwind.config.ts

import { type Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/shared/**/*.{ts,tsx}",
    "./src/providers/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        fg: "rgb(var(--color-fg) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
      },
    },
  },
} satisfies Config;

---

## tsconfig.json

{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "**/*.mts"],
  "exclude": ["node_modules"]
}

---
