import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/package",
        destination: "https://www.npmjs.com/package/samengine",
        permanent: true,
      },
      {
        source: "/source",
        destination: "https://github.com/shadowdara/samengine",
        permanent: true,
      },
    ];
  },

  output: "export",
};

export default nextConfig;
