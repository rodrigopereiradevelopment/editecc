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
  title: "EditeCC | Editor de TCC Grátis com Formatação ABNT Automática",
  description:
    "Editor de TCC, monografia e artigo acadêmico com formatação ABNT automática. Margens, fontes, capa, sumário e referências — tudo pronto. 100% gratuito, local, sem cadastro. Baixe em PDF, RTF ou DOC.",
  keywords: [
    "editor TCC", "formatação ABNT", "TCC", "monografia",
    "normas ABNT", "editor acadêmico", "formatar TCC grátis",
    "ABNT automática", "trabalho acadêmico", "Next.js", "Tauri",
  ],
  icons: { icon: "/favicon.svg" },
  verification: {
    google: "53lIeo9YV1FF6kndubgIiNJB1LOa12bMGsZiDHaQngg",
  },
  alternates: {
    canonical: "https://editecc.vercel.app",
  },
  openGraph: {
    title: "EditeCC | Editor de TCC Grátis com Formatação ABNT Automática",
    description:
      "Formate seu TCC, monografia ou artigo acadêmico nas normas ABNT de forma 100% automática e gratuita. Baixe em PDF, RTF ou Word.",
    url: "https://editecc.vercel.app",
    siteName: "EditeCC",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://editecc.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "EditeCC — Editor de TCC com formatação ABNT automática",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EditeCC | Editor de TCC Grátis com Formatação ABNT",
    description:
      "Formate seu TCC automaticamente nas normas ABNT. 100% gratuito, local e sem cadastro.",
    images: ["https://editecc.vercel.app/og-image.png"],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "EditeCC",
              "operatingSystem": "Windows, Linux, macOS, Web",
              "applicationCategory": "EducationalApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "BRL",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
