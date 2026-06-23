"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ─── DADOS ────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "⌥",
    title: "Folha A4 com Margens ABNT",
    desc: "Canvas que simula a folha real: 3cm esquerda/superior, 2cm direita/inferior. Exatamente como a NBR 14724 exige.",
  },
  {
    icon: "¶",
    title: "Estilos Pré-definidos",
    desc: "Título 1/2/3, Texto Corrente, Citação Longa e Referência. Seleciona e aplica — sem configurar fonte, tamanho ou recuo manualmente.",
  },
  {
    icon: "◫",
    title: "Capa Automática",
    desc: "Preencha os dados em um formulário e a capa é gerada com posicionamento correto: instituição, autor, título, cidade e ano.",
  },
  {
    icon: "≡",
    title: "Sumário Dinâmico",
    desc: "Atualiza em tempo real conforme você adiciona seções. Clique em qualquer item para ir direto para a seção.",
  },
  {
    icon: "✓",
    title: "Validador ABNT",
    desc: "Detecta citações longas mal formatadas, resumo fora do tamanho ideal (150–500 palavras) e seções obrigatórias faltando.",
  },
  {
    icon: "⬡",
    title: "100% Local",
    desc: "Autosave com IndexedDB. Seus dados ficam no seu dispositivo. Nenhum servidor, nenhuma nuvem, nenhum cadastro.",
  },
  {
    icon: "▤",
    title: "Slides Automáticos",
    desc: "Gera apresentações PPTX a partir dos títulos H1/H2. Usa IA local (Transformers.js) para resumir cada seção.",
  },
  {
    icon: "♿",
    title: "Acessível por Teclado",
    desc: "Navegação completa por Tab, skip link, focus-visible, aria-labels e suporte a leitores de tela (WCAG 2.2).",
  },
  {
    icon: "→",
    title: "Onboarding Inteligente",
    desc: "Tela de boas-vindas na primeira vez: crie ou importe um TCC em segundos. Estados vazios guiam cada etapa.",
  },
];

const STEPS = [
  { n: "01", title: "Preencha a Capa", desc: "Instituição, autor e título no painel lateral. A capa é gerada automaticamente." },
  { n: "02", title: "Escreva o Conteúdo", desc: "Use os estilos ABNT pré-definidos. O editor formata enquanto você escreve." },
  { n: "03", title: "Gere Slides", desc: "Clique em Slides e o EditeCC resume cada seção com IA local e exporta para PPTX." },
  { n: "04", title: "Exporte o PDF", desc: "Clique em Exportar PDF. O documento sai pronto, formatado e dentro das normas." },
];

// ─── PAPER MOCKUP (folha A4 em miniatura) ────────────────────────────────────
function PaperMockup() {
  return (
    <div style={{
      position: "relative",
      width: "320px",
      flexShrink: 0,
    }}>
      {/* Sombra/folha de baixo */}
      <div style={{
        position: "absolute", top: "12px", left: "12px",
        width: "100%", height: "100%",
        background: "#1e2330", borderRadius: "4px",
      }} />
      {/* Folha principal */}
      <div style={{
        position: "relative",
        background: "#f8f6f0",
        borderRadius: "4px",
        padding: "28px 24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        fontFamily: "'Times New Roman', serif",
        color: "#1a1a1a",
        animation: "float 4s ease-in-out infinite",
      }}>
        {/* Barra de app simulada */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          background: "#0d0f15", borderRadius: "4px 4px 0 0",
          padding: "8px 14px",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: "800", fontSize: "11px", fontFamily: "sans-serif" }}>E</span>
          </div>
          <span style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "12px", fontFamily: "DM Sans, sans-serif" }}>
            Edite<span style={{ color: "#3b82f6" }}>CC</span>
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
            {["#ef4444","#f59e0b","#10b981"].map((c, i) => (
              <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
            ))}
          </div>
        </div>

        {/* Conteúdo da folha */}
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "7pt", fontWeight: "bold", textTransform: "uppercase", textAlign: "center", lineHeight: "1.5", marginBottom: "6px" }}>
            ETEC PEDRO FERREIRA ALVES
          </p>
          <p style={{ fontSize: "7pt", fontWeight: "bold", textTransform: "uppercase", textAlign: "center", lineHeight: "1.5", marginBottom: "14px" }}>
            RODRIGO PEREIRA
          </p>
          <p style={{ fontSize: "7pt", fontWeight: "bold", textTransform: "uppercase", textAlign: "center", lineHeight: "1.5", marginBottom: "4px" }}>
            ARCA: SISTEMA DE COMPARAÇÃO DE PREÇOS EM SUPERMERCADOS
          </p>
          <div style={{ margin: "14px 0", borderTop: "0.5px solid #ccc" }} />
          <p style={{ fontSize: "7pt", fontWeight: "bold", textTransform: "uppercase", lineHeight: "1.5", marginBottom: "4px" }}>1. INTRODUÇÃO</p>
          <p style={{ fontSize: "6.5pt", lineHeight: "1.5", textAlign: "justify", textIndent: "10px", color: "#333", marginBottom: "6px" }}>
            O presente trabalho tem como objetivo o desenvolvimento de uma aplicação para comparação de preços em supermercados da região de Mogi Mirim.
          </p>
          {/* Citação longa */}
          <div style={{ marginLeft: "28px", marginBottom: "6px" }}>
            <p style={{ fontSize: "5.5pt", lineHeight: "1.2", textAlign: "justify", color: "#555" }}>
              "A tecnologia da informação tem transformado profundamente os hábitos de consumo da população brasileira, criando novas oportunidades para soluções digitais." (SILVA, 2023, p. 45)
            </p>
          </div>
          <p style={{ fontSize: "6.5pt", lineHeight: "1.5", textAlign: "justify", textIndent: "10px", color: "#333" }}>
            Nesse contexto, o sistema ARCA surge como resposta às necessidades dos consumidores que buscam economia e praticidade.
          </p>
          {/* Highlight de estilo ativo */}
          <div style={{
            position: "absolute", right: "10px", top: "60px",
            background: "#2563eb", color: "white",
            fontSize: "8px", padding: "2px 6px", borderRadius: "3px",
            fontFamily: "DM Sans, sans-serif", fontWeight: "600",
          }}>
            Texto Corrente
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURE CARD ────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, index }: { icon: string; title: string; desc: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      padding: "24px",
      background: "#0d0f15",
      border: "1px solid #1e2330",
      borderRadius: "10px",
      transition: "all 0.4s ease",
      transitionDelay: `${index * 60}ms`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      cursor: "default",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#2563eb40";
        (e.currentTarget as HTMLDivElement).style.background = "#0f1420";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#1e2330";
        (e.currentTarget as HTMLDivElement).style.background = "#0d0f15";
      }}
    >
      <div style={{
        width: "40px", height: "40px", borderRadius: "8px",
        background: "#1e2330", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "18px", marginBottom: "14px",
        fontFamily: "serif", color: "#3b82f6",
      }}>
        {icon}
      </div>
      <h3 style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: "600", marginBottom: "8px", fontFamily: "DM Sans, sans-serif" }}>
        {title}
      </h3>
      <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.6", fontFamily: "DM Sans, sans-serif" }}>
        {desc}
      </p>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0c11;
          color: #e2e8f0;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2330; border-radius: 3px; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-10px) rotate(-1deg); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(48px, 7vw, 88px);
          font-weight: 900;
          line-height: 1.0;
          letter-spacing: -2px;
          color: #f1f5f9;
        }

        .hero-title .accent {
          background: linear-gradient(90deg, #3b82f6, #818cf8, #3b82f6);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #2563eb;
          color: white;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .cta-primary:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.4);
        }

        .cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          padding: 14px 20px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          border: 1px solid #1e2330;
        }

        .cta-secondary:hover {
          color: #e2e8f0;
          border-color: #334155;
          background: #0d0f15;
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #3b82f6;
          margin-bottom: 12px;
        }

        .noise-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="noise-overlay" />

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(10,12,17,0.85)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #1e2330",
        padding: "0 clamp(20px, 5vw, 80px)",
        display: "flex", alignItems: "center", height: "60px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "7px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: "800", fontSize: "13px" }}>E</span>
          </div>
          <span style={{ fontWeight: "700", fontSize: "16px", letterSpacing: "-0.3px", color: "#f1f5f9" }}>
            Edite<span style={{ color: "#3b82f6" }}>CC</span>
          </span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <a href="https://github.com/rodrigopereiradevelopment/editecc" target="_blank" rel="noopener noreferrer"
            style={{ color: "#475569", fontSize: "13px", textDecoration: "none", padding: "6px 12px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#e2e8f0")}
            onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
          <Link href="/editor" className="cta-primary" style={{ padding: "7px 16px", fontSize: "13px" }}>
            Abrir Editor →
          </Link>
        </div>
      </nav>

      <main>
        {/* ── HERO ── */}
        <section style={{
          minHeight: "100vh",
          padding: "0 clamp(20px, 5vw, 80px)",
          display: "flex", alignItems: "center",
          paddingTop: "60px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Glow de fundo */}
          <div style={{
            position: "absolute", top: "20%", left: "30%",
            width: "600px", height: "600px",
            background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{
            display: "flex", alignItems: "center",
            gap: "60px", maxWidth: "1200px", margin: "0 auto", width: "100%",
            flexWrap: "wrap",
          }}>
            {/* Texto */}
            <div style={{ flex: "1 1 400px", maxWidth: "580px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "#0d0f15", border: "1px solid #1e2330",
                padding: "5px 12px", borderRadius: "20px", marginBottom: "24px",
                opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(10px)",
                transition: "all 0.5s ease 0.1s",
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                <span style={{ fontSize: "12px", color: "#64748b" }}>Open Source · MIT License</span>
              </div>

              <h1 className="hero-title" style={{
                marginBottom: "24px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "none" : "translateY(30px)",
                transition: "all 0.6s ease 0.2s",
              }}>
                Escreva seu<br />
                TCC <span className="accent">sem</span><br />
                sofrimento.
              </h1>

              <p style={{
                color: "#64748b", fontSize: "17px", lineHeight: "1.7",
                marginBottom: "36px", maxWidth: "460px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "none" : "translateY(20px)",
                transition: "all 0.6s ease 0.35s",
              }}>
                Editor de textos com formatação <strong style={{ color: "#94a3b8" }}>ABNT automática</strong>. Margens, fontes, espaçamentos e capa — tudo pré-configurado. Você só escreve.
              </p>

              <div style={{
                display: "flex", gap: "12px", flexWrap: "wrap",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "none" : "translateY(20px)",
                transition: "all 0.6s ease 0.5s",
              }}>
                <Link href="/editor" className="cta-primary">
                  Abrir Editor
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
                <a href="https://github.com/rodrigopereiradevelopment/editecc" target="_blank" rel="noopener noreferrer" className="cta-secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  Ver no GitHub
                </a>
              </div>

              {/* Stats */}
              <div style={{
                display: "flex", gap: "32px", marginTop: "48px",
                opacity: mounted ? 1 : 0, transition: "all 0.6s ease 0.65s",
              }}>
                {[["ABNT", "NBR 14724:2011"], ["100%", "Local & Gratuito"], ["0", "APIs Externas"]].map(([n, l]) => (
                  <div key={n}>
                    <div style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "20px", fontFamily: "Playfair Display, serif" }}>{n}</div>
                    <div style={{ color: "#334155", fontSize: "11px", marginTop: "2px" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paper mockup */}
            <div style={{
              flex: "0 0 auto",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateX(40px)",
              transition: "all 0.8s ease 0.4s",
            }}>
              <PaperMockup />
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ padding: "100px clamp(20px, 5vw, 80px)" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <p className="section-label">Funcionalidades</p>
            <h2 style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: "700", color: "#f1f5f9",
              marginBottom: "48px", lineHeight: "1.2",
            }}>
              Tudo que você precisa.<br />
              <span style={{ color: "#334155" }}>Nada que você não precisa.</span>
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}>
              {FEATURES.map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ── */}
        <section style={{ padding: "80px clamp(20px, 5vw, 80px)", borderTop: "1px solid #1e2330" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <p className="section-label">Como funciona</p>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: "700", color: "#f1f5f9", marginBottom: "56px", lineHeight: "1.2" }}>
              Do zero ao PDF em três passos.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{
                  display: "flex", gap: "32px", alignItems: "flex-start",
                  padding: "32px 0",
                  borderBottom: i < STEPS.length - 1 ? "1px solid #1e2330" : "none",
                }}>
                  <div style={{
                    fontFamily: "DM Mono, monospace",
                    fontSize: "11px", color: "#1e2d3d",
                    paddingTop: "4px", minWidth: "28px",
                  }}>
                    {s.n}
                  </div>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "8px",
                    background: i === 0 ? "#1e3a5f" : i === 1 ? "#1e2330" : "#0f2a1e",
                    border: `1px solid ${i === 0 ? "#2563eb40" : i === 1 ? "#1e2330" : "#10b98130"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    color: i === 0 ? "#3b82f6" : i === 1 ? "#475569" : "#10b981",
                    fontSize: "18px",
                  }}>
                    {i === 0 ? "◫" : i === 1 ? "¶" : "↓"}
                  </div>
                  <div>
                    <h3 style={{ color: "#e2e8f0", fontSize: "18px", fontWeight: "600", marginBottom: "8px", fontFamily: "Playfair Display, serif" }}>
                      {s.title}
                    </h3>
                    <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.7" }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA OPEN SOURCE ── */}
        <section style={{ padding: "80px clamp(20px, 5vw, 80px)" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{
              background: "#0d0f15",
              border: "1px solid #1e2330",
              borderRadius: "16px",
              padding: "56px",
              textAlign: "center",
              position: "relative", overflow: "hidden",
            }}>
              {/* Glow */}
              <div style={{
                position: "absolute", top: "-50%", left: "25%",
                width: "50%", height: "200%",
                background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "#0a0c11", border: "1px solid #1e2330",
                padding: "5px 14px", borderRadius: "20px", marginBottom: "24px",
                fontSize: "12px", color: "#10b981",
              }}>
                ⬡ Open Source · MIT License
              </div>
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "700", color: "#f1f5f9", marginBottom: "16px", lineHeight: "1.2" }}>
                Clone, adapte, contribua.
              </h2>
              <p style={{ color: "#475569", fontSize: "15px", lineHeight: "1.7", marginBottom: "36px", maxWidth: "480px", margin: "0 auto 36px" }}>
                O EditeCC é open source. Qualquer aluno ou desenvolvedor pode clonar o repositório e usar ou contribuir com melhorias.
              </p>
              <div style={{ background: "#0a0c11", border: "1px solid #1e2330", borderRadius: "8px", padding: "14px 20px", fontFamily: "DM Mono, monospace", fontSize: "13px", color: "#64748b", marginBottom: "32px", textAlign: "left" }}>
                <span style={{ color: "#334155" }}>$ </span>
                <span style={{ color: "#94a3b8" }}>git clone </span>
                <span style={{ color: "#3b82f6" }}>https://github.com/rodrigopereiradevelopment/editecc</span>
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/editor" className="cta-primary">
                  Experimentar agora
                </Link>
                <a href="https://github.com/rodrigopereiradevelopment/editecc" target="_blank" rel="noopener noreferrer" className="cta-secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          padding: "24px clamp(20px, 5vw, 80px)",
          borderTop: "1px solid #1e2330",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "5px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: "800", fontSize: "10px" }}>E</span>
            </div>
            <span style={{ color: "#334155", fontSize: "13px" }}>
              EditeCC · MIT License · rodrigopereiradevelopment
            </span>
          </div>
          <span style={{ color: "#1e2d3d", fontSize: "12px", fontFamily: "DM Mono, monospace" }}>
              v0.9.3 · ABNT NBR 14724:2011
          </span>
        </footer>
      </main>
    </>
  );
}
