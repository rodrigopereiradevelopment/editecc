/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;