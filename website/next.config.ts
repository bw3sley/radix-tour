import path from "node:path";

import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, ".."),
  serverExternalPackages: ["@takumi-rs/core"],
};

export default config;
