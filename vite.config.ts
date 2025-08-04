import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    allowedHosts: ["jong-preview.ngrok.app", "jong-shader.ngrok.app"], // ngrok 도메인 허용
  },
});
