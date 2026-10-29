import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import cssInjectedByJs from "vite-plugin-css-injected-by-js";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),

    cssInjectedByJs({ styleId: "radix-tour", topExecutionPriority: false }),

    dts({
      include: ["src"],
      exclude: [
        "src/**/*.test.tsx",
        "src/test-setup.ts",
      ],
    }),
  ],
  build: {
    // Ship readable output: minified code raises a Socket.dev supply chain alert.
    minify: false,
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
