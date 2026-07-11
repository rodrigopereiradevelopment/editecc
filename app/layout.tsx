import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EditeCC — Editor de TCC com formatação ABNT",
  description:
    "Editor de textos acadêmicos com formatação ABNT automática. Margens, fontes, espaçamentos e capa — tudo pré-configurado. 100% gratuito, local e sem cadastro.",
  icons: { icon: "/favicon.svg" },
  verification: {
    google: "COLE_AQUI_O_CODIGO_DO_GOOGLE",
  },
  openGraph: {
    title: "EditeCC — Editor de TCC com formatação ABNT",
    description:
      "Formate seu TCC automaticamente nas normas ABNT. 100% gratuito, local e sem cadastro.",
    url: "https://editecc.vercel.app",
    siteName: "EditeCC",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EditeCC — Editor de TCC com formatação ABNT",
    description:
      "Formate seu TCC automaticamente nas normas ABNT. 100% gratuito, local e sem cadastro.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
