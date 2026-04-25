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
