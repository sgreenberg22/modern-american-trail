import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // The bundle is mostly event text (~170 KB gzipped), which compresses well.
  build: { chunkSizeWarningLimit: 700 }
});
