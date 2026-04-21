import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/package",
        destination: "https://www.npmjs.com/package/samengine",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
