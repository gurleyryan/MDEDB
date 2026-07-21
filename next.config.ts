import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve images as-is. OpenNext on Cloudflare optimizes <Image> through a
  // Cloudflare Images binding we intentionally do not use (billable, and not
  // worth it for a few logos), so we skip optimization to avoid the
  // "env.IMAGES binding is not defined" warning.
  images: { unoptimized: true },
};

export default nextConfig;
