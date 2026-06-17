import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The demo consumes the library source directly via aliases, so you can hack on
// the library and see changes instantly (no build/link step). `base` is set for
// GitHub Pages project sites (https://<user>.github.io/<repo>/). Override with
// the BASE env var for other hosts (Vercel/Netlify use "/").
export default defineConfig({
  base: process.env.BASE ?? "/react-guided-journey/",
  plugins: [react()],
  resolve: {
    alias: {
      "react-guided-journey/styles.css": resolve(__dirname, "../src/styles.css"),
      "react-guided-journey": resolve(__dirname, "../src/index.ts"),
    },
  },
});
