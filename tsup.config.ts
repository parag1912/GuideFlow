import { copyFileSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom"],
  // The stylesheet is not imported by the JS bundle (consumers import it
  // separately as "react-guided-journey/styles.css"), so copy it into dist
  // ourselves after a successful build.
  onSuccess: async () => {
    copyFileSync("src/styles.css", "dist/styles.css");
  },
});
