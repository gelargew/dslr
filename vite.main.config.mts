import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: "src/main.ts",
      formats: ["cjs"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      external: [
        "electron",
        "@libsql/client",
        "@google-cloud/storage",
        // Node.js built-ins
        "path",
        "fs",
        "fs/promises",
        "crypto",
        "os",
        "util",
        "buffer",
        "stream",
        "events",
        "url",
        "querystring",
        "http",
        "https",
        "net",
        "tls",
        "zlib"
      ],
    },
    outDir: ".vite/build",
    emptyOutDir: false,
  },
});
