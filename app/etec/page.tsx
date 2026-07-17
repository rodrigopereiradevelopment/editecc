import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Modelo de TCC ETEC — Formatação ABNT Automática | EditeCC",
  description:
    "Estudante da ETEC? O EditeCC formata seu TCC automaticamente nas normas ABNT NBR 14724. Margens, fontes, capa e sumário — tudo pronto. 100% gratuito e offline.",
  keywords: [
    "modelo TCC ETEC", "formatar TCC ETEC", "TCC ETEC",
    "normas ABNT ETEC", "trabalho técnico ETEC", "monografia ETEC",
    "formatação ABNT", "editor TCC grátis",
  ],
  openGraph: {
    title: "Modelo de TCC ETEC — Formatação ABNT Automática",
    description:
      "Formate seu TCC da ETEC automaticamente nas normas ABNT. 100% gratuito, local e sem cadastro.",
    url: "https://editecc.vercel.app/etec",
    siteName: "EditeCC",
    locale: "pt_BR",
    type: "website",
  },
};

export default function EtecPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0c11",
      color: "#e2e8f0",
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Hero */}
      <section style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "80px 24px 60px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-block",
          padding: "6px 16px",
          background: "#161820",
          border: "1px solid #1e2330",
          borderRadius: "20px",
          fontSize: "13px",
          color: "#94a3b8",
          marginBottom: "24px",
        }}>
          Para estudantes da ETEC
        </div>

        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: "800",
          lineHeight: "1.1",
          marginBottom: "20px",
          letterSpacing: "-1px",
        }}>
          Modelo de TCC{" "}
          <span style={{ color: "#3b82f6" }}>ETEC</span>
          {" "}— Formatação{" "}
          <span style={{ color: "#3b82f6" }}>ABNT</span>{" "}
          Automática
        </h1>

        <p style={{
          fontSize: "18px",
          color: "#94a3b8",
          lineHeight: "1.7",
          maxWidth: "600px",
          margin: "0 auto 36px",
        }}>
          Escreva seu TCC tranquilo. O EditeCC cuida de margens, fontes,
          espaçamentos, capa e sumário conforme as normas{" "}
          <strong style={{ color: "#e2e8f0" }}>ABNT NBR 14724:2011</strong>.
          Tudo local, sem internet, sem cadastro.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/editor" style={{
            padding: "14px 32px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            textDecoration: "none",
            cursor: "pointer",
          }}>
            Usar grátis agora
          </Link>
          <a href="https://github.com/rodrigopereiradevelopment/editecc/releases/latest" target="_blank" rel="noopener noreferrer" style={{
            padding: "14px 32px",
            background: "transparent",
            color: "#94a3b8",
            border: "1px solid #1e2330",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "500",
            textDecoration: "none",
            cursor: "pointer",
          }}>
            Baixar app desktop
          </a>
        </div>
      </section>

      {/* O que o EditeCC faz pra ETEC */}
      <section style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "0 24px 80px",
      }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "40px",
          color: "#f1f5f9",
        }}>
          O que o EditeCC faz pelo seu TCC
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}>
          {[
            {
              icon: "📄",
              title: "Capa automática",
              desc: "Preencha os dados e a capa é gerada conforme o modelo da sua ETEC.",
            },
            {
              icon: "📐",
              title: "Margens ABNT",
              desc: "3cm esquerda/superior, 2cm direita/inferior — sem precisar configurar.",
            },
            {
              icon: "🔤",
              title: "Fonte e espaçamento",
              desc: "Arial 12pt, espaçamento 1,5 — aplicado automaticamente.",
            },
            {
              icon: "📑",
              title: "Sumário automático",
              desc: "Gera o sumário a partir dos títulos do seu documento.",
            },
            {
              icon: "📚",
              title: "Referências ABNT",
              desc: "Importe por DOI, ISBN ou BibTeX. Formatação NBR 6023.",
            },
            {
              icon: "💾",
              title: "Exportar PDF e Word",
              desc: "Exporte em PDF para impressão ou em RTF/Word para enviar ao orientador. Margens corretas.",
            },
          ].map((item) => (
            <div key={item.title} style={{
              background: "#111318",
              border: "1px solid #1e2330",
              borderRadius: "10px",
              padding: "20px",
            }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{item.icon}</div>
              <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "6px", color: "#f1f5f9" }}>
                {item.title}
              </h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Passo a passo */}
      <section style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "0 24px 80px",
      }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "40px",
          color: "#f1f5f9",
        }}>
          Como formatar seu TCC em 3 passos
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {[
            { step: "1", title: "Escreva seu texto", desc: "Use o editor como se fosse um Word. Tudo que você digita já sai formatado." },
            { step: "2", title: "Preencha a capa", desc: "Instituição, curso, autores, orientador — a capa é gerada na hora." },
            { step: "3", title: "Exporte em PDF ou Word", desc: "Imprima em PDF com margens corretas, ou exporte em RTF/Word para editar no LibreOffice ou Word." },
          ].map((item) => (
            <div key={item.step} style={{
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#3b82f6",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "700",
                flexShrink: 0,
              }}>
                {item.step}
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px", color: "#f1f5f9" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6" }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Diferenciais */}
      <section style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "0 24px 80px",
        textAlign: "center",
      }}>
        <div style={{
          background: "#111318",
          border: "1px solid #1e2330",
          borderRadius: "12px",
          padding: "40px 32px",
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", color: "#f1f5f9" }}>
            Por que estudantes da ETEC escolhem o EditeCC?
          </h2>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
          }}>
            {[
              "✅ 100% offline",
              "✅ Sem cadastro",
              "✅ Não envia seus dados",
              "✅ Desktop e web",
              "✅ Open source",
            ].map((item) => (
              <span key={item} style={{
                padding: "8px 16px",
                background: "#161820",
                border: "1px solid #1e2330",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#94a3b8",
              }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{
        textAlign: "center",
        padding: "0 24px 80px",
      }}>
        <h2 style={{
          fontSize: "28px",
          fontWeight: "700",
          marginBottom: "16px",
          color: "#f1f5f9",
        }}>
          Comece a escrever agora
        </h2>
        <p style={{ fontSize: "15px", color: "#94a3b8", marginBottom: "24px" }}>
          Sem instalação. Sem cadastro. Sem burocracia.
        </p>
        <Link href="/editor" style={{
          display: "inline-block",
          padding: "14px 40px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          textDecoration: "none",
        }}>
          Abrir o EditeCC →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #1e2330",
        padding: "24px",
        textAlign: "center",
        fontSize: "13px",
        color: "#475569",
      }}>
        EditeCC · Open Source · MIT License
      </footer>
    </div>
  );
}
