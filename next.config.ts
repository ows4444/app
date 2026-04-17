import { type NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],

  headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },

  typedRoutes: true,
};

export default nextConfig;
