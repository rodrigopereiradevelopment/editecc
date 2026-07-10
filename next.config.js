/** @type {import('next').NextConfig} */
const webpack = require("webpack");
const isTauriBuild = process.env.TAURI_ENV_PLATFORM !== undefined;

const NODE_MODULES = [
  "fs", "path", "url", "stream", "crypto", "os", "module",
  "fs/promises", "buffer", "process", "events", "util",
  "assert", "tty", "child_process", "net", "tls",
];

const nextConfig = {
  // Static export necessário para o Tauri empacotar o frontend
  ...(isTauriBuild && {
    output: "export",
    distDir: "out",
    images: {
      unoptimized: true,
    },
  }),

  reactStrictMode: true,

  serverExternalPackages: ["@xenova/transformers"],

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      ...Object.fromEntries(NODE_MODULES.map((m) => [m, false])),
    };
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      })
    );
    return config;
  },
};

module.exports = nextConfig;