import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves this site as a static export at hornethacks.com.
  output: "export",
  trailingSlash: true,
  images: {
    // The default Next.js image optimizer requires a server.
    unoptimized: true,
  },
};

export default nextConfig;
