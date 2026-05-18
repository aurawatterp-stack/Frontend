import type { NextConfig } from "next";

function cleanBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

const nextConfig: NextConfig = {
  async rewrites() {
    const rawTarget =
      process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const target = rawTarget.trim();
    if (!target) return [];

    const base = cleanBaseUrl(target);
    return [
      // Proxy API calls from the frontend origin to the backend origin.
      // This prevents production builds from accidentally calling localhost.
      {
        source: "/api/:path*",
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
