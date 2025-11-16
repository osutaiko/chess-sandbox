import * as path from "path";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
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
            src: "./src/assets/fonts/*.ttf",
          },
        ],
      },
    }),
    svgr(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "common": path.resolve(__dirname, "../common/src"),
    },
  },
  build: {
    outDir: "build"
  }
});
