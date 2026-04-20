import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

/**
 * CoFHE / `tfhe` loads `tfhe_bg.wasm` via `new URL('tfhe_bg.wasm', import.meta.url)`.
 * Pre-bundling breaks that path (WASM request can hit the SPA shell and return HTML →
 * "expected magic word 00 61 73 6d, found 3c 21 44 4f"). Keep these packages external to deps optimization.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "wasm-mime-dev",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.includes(".wasm")) {
            res.setHeader("Content-Type", "application/wasm");
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: [
      // Exact match only — otherwise `tweetnacl/nacl-fast.js` wrongly resolves under the shim path.
      {
        find: /^tweetnacl$/,
        replacement: path.resolve(__dirname, "./src/shims/tweetnacl.ts"),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
  optimizeDeps: {
    exclude: ["tfhe", "@cofhe/sdk"],
    // CJS package; when @cofhe/sdk is excluded, bare imports must be pre-bundled
    // or `import { constructClient }` fails (no named export in the browser).
    include: ["iframe-shared-storage"],
  },
  server: {
    port: 3000,
  },
  worker: {
    format: "es",
  },
});
