import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: [
        "src/**/*.test.tsx",
        "src/**/*.stories.tsx",
        "src/**/stories/**",
        "src/test-setup.ts",
      ],
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
      fileName: (f) => (f === "es" ? "index.js" : "index.cjs"),
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^@radix-ui\//],

      // Bundlers drop module-level directives, so re-add it for React Server Components consumers.
      output: { banner: '"use client";' },
    },
  },
});
