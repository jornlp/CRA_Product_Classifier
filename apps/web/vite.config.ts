import { defineConfig } from "vite";
// Relative base: works on a GitHub Pages project site (/<repo>/) and when opened locally.
export default defineConfig({ base: "./", build: { outDir: "dist", emptyOutDir: true } });
