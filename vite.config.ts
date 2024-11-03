import * as path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import Unfonts from "unplugin-fonts/vite";
 
export default defineConfig({
  plugins: [
    react(),
    Unfonts({
      custom: {
        families: [
          {
            name: "Geist",
            src: "./src/assets/fonts/geist/*.tff",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
