import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    open: '/login',
  },
  build: {
    sourcemap: true,
  },
});
