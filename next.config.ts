// next.config.ts
import type { NextConfig } from "next";

const isTauriBuild = process.env.TAURI_ENV_PLATFORM !== undefined;

const nextConfig: NextConfig = {
  // Static export necessário para o Tauri empacotar o frontend
  // Em desenvolvimento web normal, não precisa disso
  ...(isTauriBuild && {
    output: "export",
    distDir: "out",
    images: {
      unoptimized: true, // Next/Image não funciona em static export sem loader
    },
  }),
  
  // Você pode adicionar configurações globais (que valem para Web e Tauri) aqui fora:
  reactStrictMode: true,
};

export default nextConfig;
