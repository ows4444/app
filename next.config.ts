import { type NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],

  typedRoutes: true,
};

export default nextConfig;
