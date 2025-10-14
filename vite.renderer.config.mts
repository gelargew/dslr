import * as path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      assetFileExtensions: ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.webp', '.webm'],
      publicDir: 'public',
      output: {
        assetFileExtensions: ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.webp', '.webm'],
      },
    },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
