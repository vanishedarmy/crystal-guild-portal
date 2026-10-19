import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const cardHallTheme = '/card-hall/card-hall-snes.css?v=cg197snes1';

// Keep the tabletop theme after Vite's generated CSS in development and builds.
// Otherwise, generic profile and game styles may overwrite the SNES design.
const cardHallThemeLast = {
  name: 'crystal-guild-card-hall-theme-last',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      const link = `<link rel="stylesheet" href="${cardHallTheme}">`;
      return html.replace(link, '').replace('</head>', `    ${link}\n  </head>`);
    },
  },
};

export default defineConfig({
  plugins: [react(), cardHallThemeLast],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8080",
    },
  },
});
