import type { NextConfig } from "next";

function cleanBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

const nextConfig: NextConfig = {
  async rewrites() {
    const envTarget = (process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();

    // Default targets to avoid manual dashboard setup:
    // - Local dev: proxy to local API.
    // - Production/Vercel: proxy to the deployed backend domain.
    const defaultTarget =
      process.env.VERCEL || process.env.NODE_ENV === "production"
        ? "https://backend-liard-eta-86.vercel.app"
        : "http://localhost:5000";

    const target = cleanBaseUrl(envTarget || defaultTarget);

    return [
      // Proxy API calls from the frontend origin to the backend origin.
      // This prevents production builds from calling localhost and avoids CORS issues by
      // keeping browser requests same-origin (`/api/...`).
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
