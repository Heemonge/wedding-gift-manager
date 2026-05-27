import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/wedding-gift-manager" : "",
  allowedDevOrigins: ["http://121.140.163.233:3000"],
};

export default nextConfig;
