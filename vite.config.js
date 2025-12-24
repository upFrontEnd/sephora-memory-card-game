import { defineConfig } from "vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  publicDir: "public",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {},
    },
  },
  server: {
    open: true,
    port: 3000,
    host: "0.0.0.0",
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      plugins: [
        visualizer({
          filename: "dist/stats.html",
          open: true,
          gzipSize: true,
          brotliSize: true,
          template: "treemap",
        }),
      ],
    },
  },
});
