/** @type {import('next').NextConfig} */
const path = require("path");
const isTauriBuild = process.env.TAURI_ENV_PLATFORM !== undefined;

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

  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;