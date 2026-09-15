import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // ⭐ Proxy removed — frontend now calls Render backend directly
  }
});
