import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["jong-preview.ngrok.app"], // ngrok 도메인 허용
  },
});
