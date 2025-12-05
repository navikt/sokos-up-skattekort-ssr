import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import prefixer from "postcss-prefix-selector";

// https://astro.build/config
export default defineConfig({
  base: "/skattekort-ssr",
  compressHTML: true,
  build: {
    inlineStylesheets: "always",
  },
  vite: {
    css: {
      postcss: {
        plugins: [
          prefixer({
            prefix: ".sokos-up-skattekort-ssr",
            ignoreFiles: [/module.css/],
          }),
        ],
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("@navikt/ds-react")) {
              return "navikt-ds";
            }
          },
        },
      },
    },
  },
  integrations: [
    react(),
    {
      name: "importmap-externals",
      hooks: {
        "astro:build:setup": ({ vite, target }) => {
          if (target === "client") {
            vite.build.rollupOptions["external"] = [
              "react",
              "react-dom",
              "react/jsx-runtime",
            ];
          }
        },
      },
    },
  ],
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
