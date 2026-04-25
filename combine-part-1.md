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

## README.md

# Project Structure

``` bash ls
src/
├── app/                     # Next.js routes (layouts, pages, API handlers)
│   ├── (public)/            # Public (unauthenticated) routes, e.g. login, landing
│   │   ├── layout.tsx
│   │   └── ... (pages, loading, etc.)
│   ├── (protected)/         # Authenticated user routes (dashboard, settings)
│   │   ├── layout.tsx
│   │   └── ...
│   ├── (admin)/             # Admin-only routes
│   │   ├── layout.tsx
│   │   └── ...
│   └── api/                 # BFF API routes (route.ts handlers)
│       ├── auth/            # e.g. auth/login, auth/logout endpoints
│       ├── proxy/           # catch-all proxy if needed
│       └── csp-report/      # example endpoint
│
├── config/                  # App-wide config (env vars, i18n, endpoints)
│   ├── env/                 # e.g. server.ts, client.ts env loaders
│   ├── i18n/                # i18n routing and requests
│   └── services/            # service endpoints, timeouts, feature flags
│
├── entities/                # Data models and schemas (e.g. user.schema.ts, types)
│   └── user/
│       ├── model/
│       └── types.ts
│
├── features/                # Feature modules (each owns its UI, logic, API, state)
│   ├── auth/
│   │   ├── ui/            # e.g. login form, 2FA component
│   │   ├── hooks/         # e.g. useLogin, useLogout
│   │   ├── services/      # e.g. authService.ts for API calls
│   │   ├── api/           # Next.js route handlers (if feature has its own API)
│   │   ├── model/         # Redux or Zustand slices, flows, etc.
│   │   └── types.ts
│   └── notifications/
│       ├── ui/
│       ├── hooks/
│       ├── services/
│       └── types.ts
│   └── ... (other features like billing, orders, etc.)
│
├── shared/                  # Cross-feature reusable code
│   ├── ui/                  # Shared React components (atoms/molecules/organisms)
│   │   ├── atoms/           # e.g. Button, Input
│   │   ├── molecules/       # e.g. Header, Footer
│   │   └── organisms/       # e.g. DashboardShell, PageHeader
│   ├── api/                 # Shared API client code
│   │   ├── client/          # e.g. HTTP client wrappers
│   │   ├── server/          # server-side fetch clients or adapters
│   │   └── contracts/       # shared API request/response schemas
│   ├── providers/           # App-level React providers (QueryProvider, ThemeProvider, AuthProvider)
│   ├── utils/               # Utility functions (guards, formatters, ids, string helpers)
│   ├── types/               # Shared TypeScript types (e.g. AuthFlow, DotPaths)
│   ├── errors/              # Error normalization/mapping
│   └── ...
│
├── server/                  # Server-only logic (not shipped to client)
│   ├── http/                # Upstream HTTP clients or context (e.g. custom fetch)
│   ├── security/            # CSRF, CSP, session guards, rate limiting
│   ├── observability/       # Logging and tracing utilities
│   ├── proxy/               # Proxy validators and response helpers
│   └── cache/               # Server-side cache (e.g. Redis) and revalidation logic
│
├── styles/                  # Global CSS/SCSS, theming, Tailwind config, etc.
└── ...                      # Other files (tests/, global state, etc.)
```

---

## eslint.config.mjs

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
    "@upstash/redis": "^1.37.0",
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

## src/app/(protected)/dashboard/loading.tsx

export default function Loading() {
  return (
    <div className="p-4">
      <p>Loading dashboard...</p>
    </div>
  );
}

---

## src/app/(protected)/dashboard/page.tsx

import { Suspense } from "react";

import { getUser } from "@/features/auth/server/get-auth";

async function DashboardContent() {
  const user = await getUser();
  return <p>Welcome {user?.full_name}</p>;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p>Loading dashboard...</p>}>
      <DashboardContent />
    </Suspense>
  );
}

---

## src/app/(protected)/layout.tsx

import { redirect } from "next/navigation";

import React from "react";

import { getUser } from "@/features/auth/server/get-auth";

export const runtime = "nodejs";

export default async function ProtectedLayout({ children }: { readonly children: React.ReactNode }) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

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

import { getUser } from "@/features/auth/server/get-auth";

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
import { emitNotification } from "@/features/notifications/model/service";

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
import {
  createValidatedMutation,
  extractUpstreamError,
  normalizeErrorResponse,
} from "@/shared/server/route/create-route";
import { serviceClient } from "@/server/http/upstream.client";
export const runtime = "nodejs";
const loginSchema = z.object({
  identifier: z.union([z.email(), z.string().regex(/^9715\d{8}$/)], {
    error: () => ({ message: "Must be a valid email or UAE phone number starting with 9715" }),
  }),
});
export const POST = createValidatedMutation(loginSchema, async (parsed, req) => {
  const headerStore = await headers();
  const upstream = await serviceClient<unknown>("AUTH", "/auth/login", {
    method: "POST",
    body: JSON.stringify(parsed),
    headers: {
      "content-type": "application/json",
      "x-request-id": headerStore.get("x-request-id") ?? "",
      cookie: req.headers.get("cookie") ?? "",
      authorization: req.headers.get("authorization") ?? "",
    },
  });
  const error = extractUpstreamError(upstream.data);
  if (error) {
    return Response.json(normalizeErrorResponse(error), { status: upstream.status });
  }
  const res = Response.json(upstream.data, {
    status: upstream.status,
    headers: {
      "Cache-Control": "no-store",
      Vary: "Cookie",
    },
  });
  if ("cookies" in upstream && upstream.cookies) {
    for (const cookie of upstream.cookies) {
      res.headers.append("set-cookie", cookie);
    }
  }
  return res;
});

---

## src/app/api/auth/logout/route.ts

import { serviceClient } from "@/server/http/upstream.client";
import { createMutation, extractUpstreamError, normalizeErrorResponse } from "@/shared/server/route/create-route";
export const runtime = "nodejs";
export const POST = createMutation(async (req) => {
  const upstream = await serviceClient<unknown>("AUTH", "/auth/logout", {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      authorization: req.headers.get("authorization") ?? "",
    },
  });
  const error = extractUpstreamError(upstream.data);
  if (error) {
    return Response.json(normalizeErrorResponse(error), { status: upstream.status });
  }
  const res = Response.json(upstream.data, {
    status: upstream.status,
    headers: {
      "Cache-Control": "no-store",
      Vary: "Cookie",
    },
  });
  if ("cookies" in upstream && upstream.cookies) {
    for (const cookie of upstream.cookies) {
      res.headers.append("set-cookie", cookie);
    }
  }
  return res;
});

---

## src/app/api/auth/me/route.ts

import { serviceClient } from "@/server/http/upstream.client";
import { createQuery, extractUpstreamError, normalizeErrorResponse } from "@/shared/server/route/create-route";
export const runtime = "nodejs";
export const GET = createQuery(async (req) => {
  const upstream = await serviceClient("AUTH", "/auth/me", {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      authorization: req.headers.get("authorization") ?? "",
    },
  });
  const error = extractUpstreamError(upstream.data);
  if (error) {
    return Response.json(normalizeErrorResponse(error), { status: upstream.status });
  }
  return Response.json(upstream.data, {
    status: upstream.status,
    headers: {
      "Cache-Control": "no-store",
      Vary: "Cookie",
    },
  });
});

---

## src/app/api/csp-report/route.ts

import { appLogger } from "@/server/observability/logger/with-context.server";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    appLogger.warn("CSP_VIOLATION", {
      violation: body,
      type: "csp",
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}

---

## src/app/api/proxy/[...path]/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { createMutation } from "@/shared/server/route/create-route";
import { errorResponse } from "@/shared/server/route/error-response";
import { type AppRouteHandler } from "@/shared/server/route/types";
import { serviceClient } from "@/server/http/upstream.client";
import {
  validateOrigin,
  validateRoutePolicy,
  validateQuery,
  validateAuth,
  validateBody,
  validateRateLimit,
} from "@/server/proxy/validators";
async function baseHandler(req: Request, ctx: { params: { path: string[] } }) {
  const { params } = ctx;
  const nextReq = req as unknown as NextRequest;
  const checks = [
    () => validateOrigin(nextReq),
    () => validateRoutePolicy(nextReq, params),
    () => validateQuery(nextReq),
    () => validateAuth(nextReq),
    () => validateBody(nextReq),
  ];
  const rateLimitFailure = await validateRateLimit(nextReq);
  if (rateLimitFailure) return rateLimitFailure;
  const failure = checks.map((c) => c()).find(Boolean);
  if (failure) return failure;
  const safePath = params.path.map((segment) => encodeURIComponent(segment)).join("/");
  const headers: Record<string, string> = {};
  for (const [key, value] of req.headers) {
    const k = key.toLowerCase();
    if (
      k === "content-type" ||
      k === "accept" ||
      k === "authorization" ||
      k === "x-request-id" ||
      k === "x-csrf-token" ||
      k === "accept-language" ||
      k === "user-agent"
    ) {
      headers[k as keyof typeof headers] = value;
    }
  }
  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers["cookie"] = cookie;
  }
  try {
    const body = !["GET", "HEAD"].includes(req.method) ? await req.text() : undefined;
    const upstream = await serviceClient<unknown>("API", `/${safePath}`, {
      method: req.method,
      headers,
      ...(body ? { body } : {}),
    });
    const res = NextResponse.json(upstream.data, {
      status: upstream.status,
      headers: {
        "Cache-Control": "no-store",
        Vary: "Cookie",
      },
    });
    if ("cookies" in upstream && upstream.cookies) {
      for (const cookie of upstream.cookies) {
        res.headers.append("set-cookie", cookie);
      }
    }
    return res;
  } catch (err) {
    const isTimeout = err instanceof DOMException && err.name === "AbortError";
    return errorResponse("UPSTREAM_FAILURE", isTimeout ? "Upstream timeout" : "Upstream service unavailable", 502);
  }
}
const mutationHandler = createMutation(baseHandler as AppRouteHandler);
async function adapt(handler: AppRouteHandler, req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const resolved = await ctx.params;
  return handler(req, { params: resolved });
}
export const GET = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) =>
  adapt(baseHandler as AppRouteHandler, req, ctx);
export const POST = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) =>
  adapt(mutationHandler, req, ctx);
export const PUT = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => adapt(mutationHandler, req, ctx);
export const PATCH = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) =>
  adapt(mutationHandler, req, ctx);
export const DELETE = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) =>
  adapt(mutationHandler, req, ctx);

---

## src/app/error.tsx

"use client";

import { useEffect } from "react";

import { normalizeError } from "@/shared/core/errors/normalize";
import { appLogger } from "@/server/observability/logger/with-context.client";

export default function ErrorBoundary({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    appLogger.error("App Error", { error: normalizeError(error) });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-xl font-semibold">Something went wrong</h2>

      <button
        onClick={() => {
          reset();
        }}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  );
}

---

## src/app/layout.tsx

import { headers } from "next/headers";
import "./globals.css";

export const runtime = "nodejs";

import { type Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { Providers } from "@/app/providers";
import { ThemeScript } from "@/shared/theme/theme-script";
import { getServerTheme } from "@/shared/theme/theme.server";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({ children }: { readonly children: React.ReactNode }) {
  const headerStore = await headers();
  const nonce = headerStore.get("x-nonce");

  /**
   * ⚠️ Do not hard crash production on CSP failure
   */
  if (!nonce && process.env.NODE_ENV === "production") {
    console.error("Missing CSP nonce — middleware misconfiguration");
  }

  const safeNonce = nonce ?? null;

  const initialTheme = await getServerTheme();
  const locale = await getLocale();
  const messages = await getMessages();

  const brand = "default";

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-brand={brand}
      className={initialTheme === "dark" ? "dark" : undefined}
    >
      <body>
        <ThemeScript nonce={safeNonce} />

        {/* <ExternalScript src="https://www.google.com/recaptcha/api.js" nonce={safeNonce} /> */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers initialTheme={initialTheme}>{children}</Providers>
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

import ClientProviders from "@/providers/providers.client";
import { ThemeProvider } from "@/providers/theme-provider";
import { type Theme } from "@/shared/theme";

export function Providers({
  children,
  initialTheme,
}: Readonly<{
  children: React.ReactNode;
  initialTheme: Theme;
}>) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ClientProviders>{children}</ClientProviders>
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

## src/config/i18n/request.ts

import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "./routing";
function isLocale(value: string | undefined): value is (typeof locales)[number] {
  return !!value && (locales as readonly string[]).includes(value);
}
export const runtime = "nodejs";
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

## src/config/i18n/routing.ts

export const locales = ["en", "ar"] as const;
export const defaultLocale = "en";
export type Locale = (typeof locales)[number];

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
  UPSTASH_REDIS_URL: z.string(),
  UPSTASH_REDIS_TOKEN: z.string(),
  NEXT_PUBLIC_APP_URL: z.url(),
});
export const env = Object.freeze(schema.parse(process.env));

---

## src/config/services.ts

import { env } from "@/config/server/env";
export const SERVICES = {
  AUTH: env.AUTH_SERVICE_URL,
  API: env.API_SERVICE_URL,
} as const;
if (!SERVICES.AUTH || !SERVICES.API) {
  throw new Error("Missing required service URLs");
}

---

## src/entities/user/index.ts



---

## src/entities/user/model/schema.ts



---

## src/entities/user/model/types.ts

export type User = {
  id: string;
  name: string;
};
export type ApiUser = {
  id: string;
  full_name: string;
};

---

## src/features/auth/hooks/use-login.ts

import { useMutation } from "@tanstack/react-query";
import { resolveAuthFlow } from "../model/auth.flow";
import { loginService } from "../service/auth.service";
export function useLoginHandler() {
  const mutation = useMutation({ mutationFn: loginService });
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

## src/features/auth/server/get-auth.ts

import { serviceClient } from "@/server/http/upstream.client";
import { HttpError } from "@/shared/core/errors";
export async function getUser() {
  try {
    const res = await serviceClient<{ user: { id: string; full_name: string } }>("AUTH", "/auth/me", {
      method: "GET",
    });
    return res.data.user ?? null;
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      return null;
    }
    throw err;
  }
}

---

## src/features/auth/service/auth.service.ts

import { apiClient } from "@/shared/api/client/api-client";
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

## src/features/notifications/model/error-to-event.ts

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

## src/features/notifications/model/mapper.ts

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

## src/features/notifications/model/service.ts

import { mapEventToNotification } from "./mapper";
import { notificationStore } from "./store";
import { type NotificationEvent } from "./types";
export function emitNotification(event: NotificationEvent) {
  const notification = mapEventToNotification(event);
  if (!notification) return;
  notificationStore.push(notification);
}

---

## src/features/notifications/model/store.ts

type Listener = () => void;
import { type Notification } from "./types";
class NotificationStore {
  private queue: Notification[] = [];
  private listeners: Listener[] = [];
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  push(notification: Notification) {
    if (notification.dedupeKey && this.queue.some((n) => n.dedupeKey === notification.dedupeKey)) {
      return;
    }
    const id = `${notification.id}_${Date.now()}`;
    const enriched: Notification = {
      ...notification,
      id,
    };
    this.queue = [...this.queue, enriched];
    this.emit();
    if (notification.ttl) {
      const existing = this.timers.get(id);
      if (existing) {
        clearTimeout(existing);
      }
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

## src/features/notifications/model/types.ts

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

## src/features/notifications/ui/notification-renderer.tsx

"use client";

import { useEffect, useState } from "react";

import { notificationStore } from "../model/store";

function getNotificationClass(level: string) {
  switch (level) {
    case "success":
      return "bg-green-500 text-white";
    case "error":
      return "bg-red-500 text-white";
    case "warning":
      return "bg-yellow-500 text-black";
    default:
      return "bg-gray-800 text-white";
  }
}

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
          className={`rounded-md px-4 py-2 text-sm shadow ${getNotificationClass(n.level)}`}
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

## src/features/notifications/ui/notification.theme.ts

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

## src/i18n/messages/en.json

{}

---

## src/providers/providers.client.tsx

"use client";

import { memo } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { UIProvider } from "@/providers/ui-provider";
import { NetworkIndicator } from "@/shared/ui/organisms/network-indicator";
import { NotificationRenderer } from "@/features/notifications/ui/notification-renderer";

export function ClientProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryProvider>
      <UIProvider>{children}</UIProvider>

      <NetworkIndicator />
      <NotificationRenderer />
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
import { runWithRequestContext } from "./shared/request/request-context.server";
import { generateCsrfToken } from "./server/security/csrf.server";
import { appLogger } from "./server/observability/logger/with-context.server";
export const runtime = "nodejs";
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
    if (!nonce) {
      return new NextResponse("Failed to generate CSP nonce", { status: 500 });
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);
    if (!requestHeaders.get("x-request-id")) {
      requestHeaders.set("x-request-id", crypto.randomUUID());
    }
    const traceId = String(requestHeaders.get("x-request-id"));
    return runWithRequestContext(traceId, () => {
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
          sameSite: "strict",
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
      if (env.NODE_ENV !== "production") {
        appLogger.debug("REQ", {
          path: req.nextUrl.pathname,
          method: req.method,
          traceId: requestHeaders.get("x-request-id"),
        });
      }
      response.headers.set(
        "Report-To",
        JSON.stringify({
          group: "csp-endpoint",
          max_age: 10886400,
          endpoints: [{ url: "/api/csp-report" }],
        }),
      );
      response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
      response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
      response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
      return response;
    });
  } catch {
    return new NextResponse("Proxy failure", { status: 500 });
  }
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

---

## src/server/cache/client.ts

import "server-only";
import { Redis } from "@upstash/redis";
import { env } from "@/config/server/env";
export const runtime = "nodejs";
export const redis = new Redis({
  url: env.UPSTASH_REDIS_URL,
  token: env.UPSTASH_REDIS_TOKEN,
});

---

## src/server/cache/rate-limit-store.ts

import "server-only";
import { redis } from "./client";
import { RateLimitStore } from "../security/ports/rate-limit-store";
export const runtime = "nodejs";
export const redisRateLimitStore: RateLimitStore = {
  incr: (key) => redis.incr(key),
  expire: (key, seconds) => redis.expire(key, seconds),
};

---

## src/server/http/upstream.client.ts

import "server-only";
import { headers } from "next/headers";
import { env } from "@/config/server/env";
import { HttpError } from "@/shared/core/errors";
import { mapToDomainError } from "@/shared/core/errors/error-mapper";
import { normalizeError } from "@/shared/core/errors/normalize";
import { withCircuitBreaker } from "../resilience/circuit-breaker";
import { apiLogger } from "../observability/logger/with-context.server";
type ServiceName = "AUTH" | "API";
function resolveServiceUrl(service: ServiceName) {
  switch (service) {
    case "AUTH":
      return env.AUTH_SERVICE_URL;
    case "API":
      return env.API_SERVICE_URL;
  }
}
function extractSetCookies(headers: Headers): string[] {
  const anyHeaders = headers as Headers & {
    getSetCookie?: () => string[];
  };
  if (typeof anyHeaders.getSetCookie === "function") {
    return anyHeaders.getSetCookie();
  }
  const cookies: string[] = [];
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      cookies.push(value);
    }
  });
  return cookies;
}
async function fetchWithRetry(url: string, init: RequestInit, retries = 2): Promise<Response> {
  let attempt = 0;
  while (true) {
    try {
      return await fetch(url, init);
    } catch (err) {
      if (attempt >= retries || init.method !== "GET") {
        throw err;
      }
      const delay = 100 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
      attempt++;
    }
  }
}
export async function serviceClient<T>(
  service: ServiceName,
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; cookies: string[]; status: number; statusText: string }> {
  const start = Date.now();
  try {
    const headerStore = await headers();
    const cookie = headerStore.get("cookie");
    const csrf = headerStore.get("x-csrf-token");
    const traceId = headerStore.get("x-request-id");
    const locale = headerStore.get("accept-language");
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);
    let res: Response;
    try {
      res = await withCircuitBreaker(service, () =>
        fetchWithRetry(`${resolveServiceUrl(service)}${path}`, {
          ...options,
          cache: "no-store",
          headers: {
            ...(options.headers ?? {}),
            ...(traceId ? { "x-request-id": traceId } : {}),
            ...(traceId ? { "x-trace-id": traceId } : {}),
            ...(csrf ? { "x-csrf-token": csrf } : {}),
            ...(cookie ? { cookie } : {}),
            ...(locale ? { "accept-language": locale } : {}),
          },
          signal: options.signal ?? controller.signal,
        }),
      );
    } finally {
      clearTimeout(timeout);
    }
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
    const normalized =
      typeof data === "object" && data !== null && "data" in data ? (data as { data: T }).data : (data as T);
    return {
      data: normalized,
      cookies: extractSetCookies(res.headers),
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

## src/server/observability/logger/contracts/logger.ts

export type LogMeta = Record<string, unknown>;
export interface Logger {
  debug(msg: string, meta?: LogMeta): void;
  info(msg: string, meta?: LogMeta): void;
  warn(msg: string, meta?: LogMeta): void;
  error(msg: string, meta?: LogMeta): void;
}

---

## src/server/observability/logger/logger.client.ts

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

## src/server/observability/logger/logger.server.ts

import pino from "pino";
import "server-only";
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

## src/server/observability/logger/serializer.ts

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

## src/server/observability/logger/with-context.client.ts

import { baseLogger } from "./logger.client";
function withContext(baseCtx: Record<string, unknown>) {
  return baseLogger.child(baseCtx);
}
export const apiLogger = withContext({ scope: "api" });
export const appLogger = withContext({ scope: "app" });
export const uiLogger = withContext({ scope: "ui" });

---

## src/server/observability/logger/with-context.server.ts

import { getTraceId } from "@/shared/request/request-context.server";
import "server-only";
import { baseLogger } from "./logger.server";
import { serializeMeta } from "./serializer";
function withContext(baseCtx: Record<string, unknown>) {
  const logger = baseLogger.child(baseCtx);
  return {
    debug: (msg: string, meta?: Record<string, unknown>) => {
      logger.debug({ traceId: getTraceId(), ...serializeMeta(meta) }, msg);
    },
    info: (msg: string, meta?: Record<string, unknown>) => {
      logger.info({ traceId: getTraceId(), ...serializeMeta(meta) }, msg);
    },
    warn: (msg: string, meta?: Record<string, unknown>) => {
      logger.warn({ traceId: getTraceId(), ...serializeMeta(meta) }, msg);
    },
    error: (msg: string, meta?: Record<string, unknown>) => {
      logger.error({ traceId: getTraceId(), ...serializeMeta(meta) }, msg);
    },
  };
}
export const apiLogger = withContext({ scope: "api" });
export const appLogger = withContext({ scope: "app" });
export const routeLogger = withContext({ scope: "route" });

---

## src/server/proxy/proxy-handler.ts



---

## src/server/proxy/proxy-policy.ts



---

## src/server/proxy/response.ts

import { NextResponse } from "next/server";
import { extractUpstreamError } from "@/shared/server/route/create-route";
import { errorResponse } from "@/shared/server/route/error-response";
export async function handleJsonResponse(upstream: Response) {
  const json = await upstream.json();
  const error = extractUpstreamError(json);
  if (error) {
    return errorResponse("UPSTREAM_ERROR", error, upstream.status);
  }
  return NextResponse.json(json, {
    status: upstream.status,
    headers: {
      "Cache-Control": "no-store",
      Vary: "Cookie",
    },
  });
}

---

## src/server/proxy/validators.ts

import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/config/server/env";
import { decode } from "../security/csrf.server";
import { rateLimit } from "../security/rate-limit";
import { redisRateLimitStore } from "../cache/rate-limit-store";
export const runtime = "nodejs";
export function validateOrigin(req: NextRequest) {
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) return null;
  try {
    const allowed = new URL(env.NEXT_PUBLIC_APP_URL).origin;
    const incoming = new URL(origin).origin;
    if (incoming !== allowed) {
      return NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Forbidden origin" } }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Invalid origin header" } }, { status: 403 });
  }
  return null;
}
export function validateAuth(req: NextRequest) {
  const cookie = req.headers.get("cookie");
  if (!cookie) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Missing auth context" } }, { status: 401 });
  }
  const csrf = cookie
    .split("; ")
    .find((c) => c.startsWith("csrf="))
    ?.split("=")[1];
  if (!csrf || !decode(csrf)) {
    return NextResponse.json(
      { error: { code: "INVALID_SESSION", message: "Invalid session context" } },
      { status: 401 },
    );
  }
  return null;
}
export async function validateRateLimit(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const auth = req.headers.get("authorization") ?? "";
  const key = `${ip}:${auth.slice(0, 20)}`;
  const rl = await rateLimit(key, redisRateLimitStore);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests" } },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } },
    );
  }
  return null;
}
export function validateQuery(req: NextRequest) {
  for (const [key, value] of req.nextUrl.searchParams.entries()) {
    if (key.length > 50 || value.length > 500) {
      return NextResponse.json(
        { error: { code: "INVALID_QUERY", message: "Invalid query parameters" } },
        { status: 400 },
      );
    }
  }
  return null;
}
export function validateBody(req: NextRequest) {
  const MAX_BODY_SIZE = 1024 * 10;
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Payload too large" } }, { status: 413 });
  }
  if (!["GET", "HEAD"].includes(req.method)) {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Only JSON supported" } },
        { status: 415 },
      );
    }
  }
  return null;
}
export function validateRoutePolicy(req: NextRequest, params: { path: string[] }) {
  const ROUTE_POLICY: Record<string, string[]> = {
    auth: ["GET", "POST"],
    users: ["GET"],
  };
  const [firstSegment] = params.path;
  if (!firstSegment || !(firstSegment in ROUTE_POLICY)) {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Access denied" } }, { status: 403 });
  }
  const policy = Object.prototype.hasOwnProperty.call(ROUTE_POLICY, firstSegment)
    ? ROUTE_POLICY[firstSegment as keyof typeof ROUTE_POLICY]
    : undefined;
  if (!policy?.includes(req.method)) {
    return NextResponse.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" } }, { status: 405 });
  }
  return null;
}

---

## src/server/resilience/circuit-breaker.ts

type State = "CLOSED" | "OPEN" | "HALF_OPEN";
type Circuit = {
  failures: number;
  state: State;
  nextTry: number;
};
import "server-only";
import { redis } from "../cache/client";
export const runtime = "nodejs";
const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT = 10_000;
const keyFor = (key: string) => `circuit:${key}`;
export async function withCircuitBreaker<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const redisKey = keyFor(key);
  const circuit = (await redis.get<Circuit>(redisKey)) ?? {
    failures: 0,
    state: "CLOSED",
    nextTry: 0,
  };
  if (circuit.state === "OPEN") {
    if (now < circuit.nextTry) {
      throw new Error("CIRCUIT_OPEN");
    }
    circuit.state = "HALF_OPEN";
  }
  return fn()
    .then(async (res) => {
      circuit.failures = 0;
      circuit.state = "CLOSED";
      await redis.set(redisKey, circuit, { ex: 60 });
      return res;
    })
    .catch(async (err) => {
      circuit.failures++;
      if (circuit.failures >= FAILURE_THRESHOLD) {
        circuit.state = "OPEN";
        circuit.nextTry = now + RESET_TIMEOUT;
      }
      await redis.set(redisKey, circuit, { ex: 60 });
      throw err;
    });
}

---

## src/server/security/csrf.core.ts

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

## src/server/security/csrf.guard.ts

import { HttpError } from "@/shared/core/errors";
import { CSRF_HEADER, timingSafeEqual } from "./csrf.core";
import { decode, verifyCsrf } from "./csrf.server";
export function assertValidCsrf(req: Request) {
  const cookie = req.headers.get("cookie");
  const header = req.headers.get(CSRF_HEADER);
  const encoded = cookie
    ?.split("; ")
    .find((c) => c.startsWith("csrf="))
    ?.split("=")[1];
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

## src/server/security/csrf.server.ts

import crypto from "crypto";
import "server-only";
import { env } from "@/config/server/env";
import { timingSafeEqual } from "./csrf.core";
export const runtime = "nodejs";
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

## src/server/security/ports/rate-limit-store.ts

export interface RateLimitStore {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<0 | 1>;
}

---

## src/server/security/rate-limit.ts

import { type RateLimitStore } from "./ports/rate-limit-store";
const WINDOW = 60_000; // 1 min
const LIMIT = 60;
export async function rateLimit(key: string, store: RateLimitStore) {
  const now = Date.now();
  const bucket = Math.floor(now / WINDOW);
  const redisKey = `rate:${key}:${bucket}`;
  const count = await store.incr(redisKey);
  if (count === 1) {
    await store.expire(redisKey, Math.ceil(WINDOW / 1000));
  }
  if (count > LIMIT) {
    return {
      allowed: false,
      retryAfter: Math.ceil(WINDOW / 1000),
    };
  }
  return { allowed: true };
}

---

## src/shared/api/client/api-client.ts

import { executeRequest } from "@/server/infra/api-client/api-client.base";
import { apiLogger } from "@/server/observability/logger/with-context.client";
import { getClientRequestContext } from "@/shared/request/request-context.client";
import { getCsrfToken } from "@/shared/security/csrf.client";
export async function apiClient<T>(path: string, options?: RequestInit & { cache?: RequestCache }) {
  const ctx = getClientRequestContext();
  const csrfToken = getCsrfToken();
  const headers: HeadersInit = {
    ...(options?.headers ?? {}),
    ...(ctx ? { "x-request-id": ctx.traceId } : {}),
    ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
  };
  return executeRequest<T>(`/api${path}`, options, apiLogger, undefined, headers);
}

---

## src/shared/api/core/abort/abort.ts

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

## src/shared/api/core/api-client.base.ts

import { Logger } from "@/server/observability/logger/contracts/logger";
import { syncCsrfToken } from "@/shared/api/core/csrf";
import { performFetch } from "@/shared/api/core/fetch";
import { handleResponse } from "@/shared/api/core/response";
import { type z } from "zod";
type ApiOptions = RequestInit & {
  timeout?: number;
  signal?: AbortSignal | null;
};
export async function executeRequest<T>(
  path: string,
  options: ApiOptions = {},
  logger: Logger,
  schema?: z.ZodType<T>,
  extraHeaders?: HeadersInit,
): Promise<T> {
  const start = Date.now();
  const res = await performFetch(path, options, extraHeaders);
  syncCsrfToken(res);
  return handleResponse<T>(res, schema, logger, path, start);
}

---

## src/shared/api/core/api-response.schema.ts

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

## src/shared/api/core/csrf.ts

export async function syncCsrfToken(res: Response) {
  const token = res.headers.get("x-csrf-token");
  if (token && typeof window !== "undefined") {
    const { setCsrfToken } = await import("@/shared/security/csrf.client");
    setCsrfToken(token);
  }
}

---

## src/shared/api/core/fetch.ts

import { createAbortSignal } from "@/server/infra/api-client/abort/abort";
export async function performFetch(path: string, options: RequestInit = {}, extraHeaders?: HeadersInit) {
  const base = typeof window === "undefined" ? (process.env.NEXT_PUBLIC_APP_URL ?? "") : "";
  const signal = createAbortSignal({
    parent: options.signal ?? null,
    timeout: 8000,
  });
  return fetch(`${base}${path}`, {
    ...options,
    credentials: "include",
    signal,
    cache: options.cache ?? "no-store",
    headers: {
      ...(options.headers ?? {}),
      ...(extraHeaders ?? {}),
    },
  });
}

---

## src/shared/api/core/response.ts

import { z } from "zod";
import { HttpError } from "@/shared/core/errors";
import { Logger } from "@/server/observability/logger/contracts/logger";
import { apiResponseSchema } from "@/server/infra/api-client/api-response.schema";
export async function handleResponse<T>(
  res: Response,
  schema: z.ZodType<T> | undefined,
  logger: Logger,
  path: string,
  start: number,
): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!res.ok) {
    logger.error("API ERROR", { path, status: res.status, duration: Date.now() - start });
    throw await handleErrorResponse(res, contentType, schema);
  }
  if (contentType.includes("application/json")) {
    const json = await res.json();
    const parsed = apiResponseSchema(schema ?? z.unknown()).safeParse(json);
    if (!parsed.success) {
      throw new HttpError(res.status, "INVALID_RESPONSE_FORMAT");
    }
    if (parsed.data.error) {
      throw new HttpError(res.status, parsed.data.error);
    }
    return parsed.data.data as T;
  }
  if (schema) {
    throw new HttpError(res.status, "EXPECTED_JSON_RESPONSE");
  }
  return (await res.text()) as T;
}
async function handleErrorResponse(res: Response, contentType: string, schema?: z.ZodTypeAny) {
  if (contentType.includes("application/json")) {
    const json = await res.json().catch(() => null);
    if (schema) {
      const parsed = schema.safeParse(json);
      if (!parsed.success) throw new HttpError(res.status, "INVALID_RESPONSE");
      return parsed.data;
    }
    throw new HttpError(res.status, json?.message ?? "HTTP_ERROR");
  }
  const text = await res.text();
  throw new HttpError(res.status, text || "HTTP_ERROR");
}

---

## src/shared/api/server/api-client.ts

import { executeRequest } from "@/server/infra/api-client/api-client.base";
import { apiLogger } from "@/server/observability/logger/with-context.server";
import "server-only";
export async function apiClient<T>(path: string, options?: RequestInit) {
  return executeRequest<T>(path, options, apiLogger);
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

## src/shared/infra/react-query/get-query-client.ts

import { QueryCache, QueryClient } from "@tanstack/react-query";
import { isAppError } from "@/shared/core/errors";
import { mapErrorToEvent } from "@/features/notifications/model/error-to-event";
import { emitNotification } from "@/features/notifications/model/service";
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
    queryCache: new QueryCache({}),
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

## src/shared/request/request-context.client.ts

let traceId: string | null = null;
export function getClientRequestContext() {
  if (!traceId) {
    traceId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `client-${Date.now()}`;
  }
  return {
    traceId,
    locale: null,
  };
}

---

## src/shared/request/request-context.server.ts

import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { cookies, headers } from "next/headers";
import { cache } from "react";
export const runtime = "nodejs";
const storage = new AsyncLocalStorage<{ traceId: string }>();
export const getServerRequestContext = cache(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const traceId =
    headerStore.get("x-request-id") ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "fallback-trace-id");
  return {
    traceId,
    locale: cookieStore.get("locale")?.value ?? null,
  };
});
export function runWithRequestContext<T>(traceId: string, fn: () => T): T {
  return storage.run({ traceId }, fn);
}
export function getTraceId(): string | undefined {
  return storage.getStore()?.traceId;
}

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
  if (!nonce) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CSP nonce is required for external scripts");
    }
  }

  return <Script src={src} nonce={nonce} strategy={strategy} />;
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
    `style-src 'self' ${noncePart} ${isDev ? "'unsafe-inline'" : ""}`,
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
    "report-to csp-endpoint",
    "report-uri /api/csp-report",
  ].join("; ");
}

---

## src/shared/security/csrf.client.ts

let csrfToken: string | null = null;
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? (match.split("=")[1] ?? null) : null;
}
export function setCsrfToken(token: string) {
  csrfToken = token;
}
export function getCsrfToken() {
  return csrfToken ?? readCookie("csrf");
}
export function clearCsrfToken() {
  csrfToken = null;
}

---

## src/shared/security/with-csrf-action.ts

import { assertValidCsrf } from "@/server/security/csrf.guard";
type AsyncFn<Args extends unknown[], R> = (...args: Args) => Promise<R>;
export function withCsrfAction<Args extends unknown[], R>(fn: AsyncFn<Args, R>): AsyncFn<Args, R> {
  return async (...args: Args): Promise<R> => {
    assertValidCsrf(args[1] as Request);
    return fn(...args);
  };
}

---

## src/shared/server/action/create-action.ts

"use server";
import { assertValidCsrf } from "@/server/security/csrf.guard";
import { type z } from "zod";
const MAX_BODY_SIZE = 1024 * 10; // 10kb
export async function createServerAction<T extends z.ZodTypeAny, R>(
  schema: T,
  handler: (data: z.infer<T>) => Promise<R>,
) {
  return async (input: unknown): Promise<R> => {
    const raw = JSON.stringify(input);
    if (raw.length > MAX_BODY_SIZE) {
      throw new Error("PAYLOAD_TOO_LARGE");
    }
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      throw new Error("INVALID_INPUT");
    }
    try {
      const req = (globalThis as unknown as { __request?: Request }).__request;
      if (req) {
        assertValidCsrf(req);
      }
    } catch {
      throw new Error("CSRF_VALIDATION_FAILED");
    }
    return handler(parsed.data);
  };
}

---

## src/shared/server/route/create-route.ts

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/config/server/env";
import { type AppRouteHandler } from "./types";
import { isSafeMethod } from "@/server/security/csrf.core";
import { assertValidCsrf } from "@/server/security/csrf.guard";
import { decode, generateCsrfToken } from "@/server/security/csrf.server";
export const runtime = "nodejs";
export function createValidatedMutation<T extends z.ZodTypeAny>(
  schema: T,
  handler: (data: z.infer<T>, req: Request, ctx: unknown) => Promise<Response>,
): AppRouteHandler {
  return createMutation(async (req, ctx) => {
    const MAX_BODY_SIZE = 1024 * 10; // 10kb
    const contentLength = req.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Payload too large" } }, { status: 413 });
    }
    const raw = await req.text();
    if (raw.length > MAX_BODY_SIZE) {
      return NextResponse.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Payload too large" } }, { status: 413 });
    }
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Invalid request payload" } },
        { status: 400 },
      );
    }
    return handler(parsed.data, req, ctx);
  });
}
export function extractUpstreamError(data: unknown): string | null {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as Record<string, unknown>).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return null;
}
export function normalizeErrorResponse(error: string) {
  return {
    error: {
      code: "UPSTREAM_ERROR",
      message: error,
    },
  };
}
export function createMutation(handler: AppRouteHandler): AppRouteHandler {
  return async (req, ctx) => {
    const MAX_BODY_SIZE = 1024 * 10; // 10kb
    const contentLength = req.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Payload too large" } }, { status: 413 });
    }
    if (!isSafeMethod(req.method)) {
      try {
        assertValidCsrf(req);
      } catch {
        return NextResponse.json(
          {
            error: {
              code: "CSRF_VALIDATION_FAILED",
              message: "Invalid CSRF token",
            },
          },
          { status: 403 },
        );
      }
    }
    const res = await handler(req, ctx);
    const encoded = generateCsrfToken();
    const payload = decode(encoded);
    const responseHeaders = new Headers(res.headers);
    const next = new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
    const headerStore = await headers();
    const traceId = headerStore.get("x-request-id");
    if (traceId) {
      next.headers.set("x-request-id", traceId);
    }
    if (payload) {
      next.cookies.set("csrf", encoded, {
        httpOnly: true,
        sameSite: "strict",
        secure: env.NODE_ENV === "production",
        path: "/",
      });
      next.headers.set("x-csrf-token", payload.token);
    } else {
      return NextResponse.json({ error: "CSRF_ROTATION_FAILED" }, { status: 500 });
    }
    return next;
  };
}
export function createQuery(handler: AppRouteHandler): AppRouteHandler {
  return handler;
}

---

## src/shared/server/route/error-response.ts

import { NextResponse } from "next/server";
export function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
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
  if (!nonce && process.env.NODE_ENV === "production") {
    throw new Error("CSP nonce is required for inline script");
  }

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
export const runtime = "nodejs";
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
import { emitNotification } from "@/features/notifications/model/service";

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
  const id =
    // eslint-disable-next-line sonarjs/pseudo-random
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
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
