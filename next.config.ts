import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins: [
        "visualclube.com.br",
        "*.visualclube.com.br",
        "cluberize.com.br",
        "*.cluberize.com.br",
        "localhost:3000",
        "*.localhost:3000",
      ],
    },
  },
};

export default nextConfig;
