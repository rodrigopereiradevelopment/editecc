"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import FeedbackButton from "../components/FeedbackButton";

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
    desc: "Gera uma apresentação em PowerPoint a partir da estrutura do seu trabalho, extraindo títulos e pontos principais de cada seção.",
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
  { n: "01", title: "Baixe ou Acesse", desc: "Instale o app desktop (Windows, Linux, macOS) ou use a versão web direto no navegador." },
  { n: "02", title: "Escreva o Conteúdo", desc: "Use os estilos ABNT pré-definidos. O editor formata enquanto você escreve." },
  { n: "03", title: "Exporte o PDF", desc: "Clique em Exportar PDF. O documento sai pronto, formatado e dentro das normas ABNT." },
  { n: "04", title: "Gere Slides", desc: "Clique em Slides e o EditeCC resume cada seção e exporta para PowerPoint automaticamente." },
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
        background: "var(--lp-border)", borderRadius: "4px",
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
          background: "var(--lp-surface)", borderRadius: "4px 4px 0 0",
          padding: "8px 14px",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: "800", fontSize: "11px", fontFamily: "sans-serif" }}>E</span>
          </div>
          <span style={{ color: "var(--lp-heading)", fontWeight: "700", fontSize: "12px", fontFamily: "DM Sans, sans-serif" }}>
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
      background: "var(--lp-surface)",
      border: "1px solid var(--lp-border)",
      borderRadius: "10px",
      transition: "all 0.4s ease",
      transitionDelay: `${index * 60}ms`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      cursor: "default",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#2563eb40";
        (e.currentTarget as HTMLDivElement).style.background = "var(--lp-surface-hover)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--lp-border)";
        (e.currentTarget as HTMLDivElement).style.background = "var(--lp-surface)";
      }}
    >
      <div style={{
        width: "40px", height: "40px", borderRadius: "8px",
        background: "var(--lp-surface-hover)", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "18px", marginBottom: "14px",
        fontFamily: "serif", color: "#3b82f6",
      }}>
        {icon}
      </div>
      <h3 style={{ color: "var(--lp-card-title)", fontSize: "14px", fontWeight: "600", marginBottom: "8px", fontFamily: "DM Sans, sans-serif" }}>
        {title}
      </h3>
      <p style={{ color: "var(--lp-body)", fontSize: "13px", lineHeight: "1.6", fontFamily: "DM Sans, sans-serif" }}>
        {desc}
      </p>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    try {
      return (localStorage.getItem("editecc-theme") as "dark" | "light") || "dark";
    } catch { return "dark"; }
  });
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    document.body.classList.toggle("theme-light", theme === "light");
    localStorage.setItem("editecc-theme", theme);
    return () => document.body.classList.remove("theme-light");
  }, [theme]);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // Fetch GitHub stars
  useEffect(() => {
    fetch("https://api.github.com/repos/rodrigopereiradevelopment/editecc")
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --hero-color: #f1f5f9;
          --nav-bg: rgba(10,12,17,0.85);
          --nav-border: #1e2330;
          --lp-heading: #f1f5f9;
          --lp-body: #475569;
          --lp-muted: #64748b;
          --lp-surface: #0d0f15;
          --lp-border: #1e2330;
          --lp-card-title: #e2e8f0;
          --lp-stat-label: #334155;
          --lp-surface-hover: #0f1420;
          --lp-surface-code: #0a0c11;
          --lp-hero-strong: #94a3b8;
          --lp-step-icon-0: #1e3a5f;
          --lp-step-icon-1: #1e2330;
          --lp-step-icon-2: #0f2a1e;
          --lp-code-text: #94a3b8;
        }
        .theme-light {
          --hero-color: #0f172a;
          --nav-bg: rgba(248,250,252,0.9);
          --nav-border: #e2e8f0;
          --lp-heading: #0f172a;
          --lp-body: #334155;
          --lp-muted: #64748b;
          --lp-surface: #ffffff;
          --lp-border: #e2e8f0;
          --lp-card-title: #1e293b;
          --lp-stat-label: #475569;
          --lp-surface-hover: #f1f5f9;
          --lp-surface-code: #e2e8f0;
          --lp-hero-strong: #1e293b;
          --lp-step-icon-0: #dbeafe;
          --lp-step-icon-1: #e2e8f0;
          --lp-step-icon-2: #d1fae5;
          --lp-code-text: #334155;
        }

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
          color: var(--hero-color);
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
          color: var(--lp-muted);
          padding: 14px 20px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          border: 1px solid var(--lp-border);
        }

        .cta-secondary:hover {
          color: var(--lp-card-title);
          border-color: var(--lp-stat-label);
          background: var(--lp-surface);
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

        .typing-text {
          display: inline;
          animation: typeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .typing-text.delay-1 { animation-delay: 0.5s; }
        .typing-text.delay-2 { animation-delay: 1s; }

        @keyframes typeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="noise-overlay" />

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--nav-bg)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--nav-border)",
        padding: "0 clamp(20px, 5vw, 80px)",
        display: "flex", alignItems: "center", height: "60px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "7px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: "800", fontSize: "13px" }}>E</span>
          </div>
          <span style={{ fontWeight: "700", fontSize: "16px", letterSpacing: "-0.3px", color: "var(--hero-color)" }}>
            Edite<span style={{ color: "#3b82f6" }}>CC</span>
          </span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            suppressHydrationWarning
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              background: "none", border: "1px solid var(--lp-border)", color: "var(--lp-body)",
              cursor: "pointer", padding: "6px 10px", borderRadius: "6px",
              fontSize: "13px", display: "flex", alignItems: "center", gap: "4px",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--lp-card-title)"; e.currentTarget.style.borderColor = "var(--lp-stat-label)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--lp-body)"; e.currentTarget.style.borderColor = "var(--lp-border)"; }}
          >
            {mounted ? (theme === "dark" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )) : <span style={{ width: 14, height: 14 }} />}
          </button>
          <a href="https://github.com/rodrigopereiradevelopment/editecc" target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--lp-body)", fontSize: "13px", textDecoration: "none", padding: "6px 12px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--lp-card-title)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--lp-body)")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
          <a href="https://github.com/rodrigopereiradevelopment/editecc/releases/tag/v1.0.1" target="_blank" rel="noopener noreferrer" className="cta-primary" style={{ padding: "7px 16px", fontSize: "13px" }}>
            Baixar Grátis
          </a>
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
                background: "var(--lp-surface)", border: "1px solid var(--lp-border)",
                padding: "5px 12px", borderRadius: "20px", marginBottom: "24px",
                opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(10px)",
                transition: "all 0.5s ease 0.1s",
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                <span style={{ fontSize: "12px", color: "var(--lp-muted)" }}>Open Source · MIT License</span>
              </div>

              <h1 className="hero-title" style={{
                marginBottom: "24px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "none" : "translateY(30px)",
                transition: "all 0.6s ease 0.2s",
              }}>
                Escreva seu<br />
                TCC. A <span className="accent">formatação</span><br />
                fica por nossa conta.
              </h1>

              <p style={{
                color: "var(--lp-muted)", fontSize: "17px", lineHeight: "1.7",
                marginBottom: "36px", maxWidth: "460px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "none" : "translateY(20px)",
                transition: "all 0.6s ease 0.35s",
              }}>
                Editor de textos com formatação <strong style={{ color: "var(--lp-hero-strong)" }}>ABNT automática</strong>. Margens, fontes, espaçamentos, capa e sumário — tudo pré-configurado. Você só escreve.
              </p>

              <div style={{
                display: "flex", gap: "12px", flexWrap: "wrap",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "none" : "translateY(20px)",
                transition: "all 0.6s ease 0.5s",
              }}>
                <a href="https://github.com/rodrigopereiradevelopment/editecc/releases/tag/v1.0.1" target="_blank" rel="noopener noreferrer" className="cta-primary">
                  Baixar grátis
                </a>
                <Link href="/editor" className="cta-secondary">
                  Abrir versão Web
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>

              {/* Stats */}
              <div style={{
                display: "flex", gap: "32px", marginTop: "48px",
                opacity: mounted ? 1 : 0, transition: "all 0.6s ease 0.65s",
              }}>
                {[
                  ["ABNT", "NBR 14724:2011"],
                  ["100%", "Local & Gratuito"],
                  ...(stars !== null ? [[`⭐ ${stars}`, "GitHub Stars"]] : []),
                ].map(([n, l]) => (
                  <div key={n}>
                    <div style={{ color: "var(--lp-heading)", fontWeight: "700", fontSize: "20px", fontFamily: "Playfair Display, serif" }}>{n}</div>
                    <div style={{ color: "var(--lp-stat-label)", fontSize: "11px", marginTop: "2px" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Screenshot do editor */}
            <div style={{
              flex: "1 1 400px",
              maxWidth: "520px",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateX(40px)",
              transition: "all 0.8s ease 0.5s",
            }}>
              <div style={{
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid var(--lp-border)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              }}>
                <img
                  src="/screenshot-editor.png"
                  alt="Editor EditeCC com formatação ABNT"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>
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
              fontWeight: "700", color: "var(--lp-heading)",
              marginBottom: "48px", lineHeight: "1.2",
            }}>
              Tudo que você precisa.<br />
              <span style={{ color: "var(--lp-stat-label)" }}>Nada que você não precisa.</span>
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

        {/* ── ANTES VS DEPOIS ── */}
        <section style={{ padding: "80px clamp(20px, 5vw, 80px)", borderTop: "1px solid var(--lp-border)" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <p className="section-label">A diferença</p>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: "700", color: "var(--lp-heading)", marginBottom: "48px", lineHeight: "1.2" }}>
              Ninguém compra uma ferramenta.<br />
              <span style={{ color: "var(--lp-stat-label)" }}>A pessoa compra o tempo economizado.</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Google Docs / Word */}
              <div style={{
                background: "var(--lp-surface)", border: "1px solid var(--lp-border)",
                borderRadius: "12px", padding: "32px",
              }}>
                <h3 style={{ color: "var(--lp-card-title)", fontSize: "18px", fontWeight: "600", marginBottom: "20px", fontFamily: "Playfair Display, serif" }}>
                  Google Docs / Word
                </h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {[
                    "Perder tempo configurando margens",
                    "Procurar tutorial de ABNT no YouTube",
                    "Ajustar fonte, espaçamento e recuo manualmente",
                    "Corrigir erros antes da entrega",
                    "Gerar sumário do zero",
                    "Conferir formatação na raça",
                  ].map((item, i) => (
                    <li key={i} style={{ color: "var(--lp-body)", fontSize: "14px", lineHeight: "1.8", display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "#ef4444", fontSize: "16px" }}>✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* EditeCC */}
              <div style={{
                background: "var(--lp-surface)", border: "1px solid #2563eb40",
                borderRadius: "12px", padding: "32px",
              }}>
                <h3 style={{ color: "#3b82f6", fontSize: "18px", fontWeight: "600", marginBottom: "20px", fontFamily: "Playfair Display, serif" }}>
                  EditeCC
                </h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {[
                    "Começar a escrever imediatamente",
                    "Formatação ABNT automática",
                    "Sumário gerado sozinho",
                    "PDF pronto para entregar",
                  ].map((item, i) => (
                    <li key={i} style={{ color: "var(--lp-body)", fontSize: "14px", lineHeight: "1.8", display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "#10b981", fontSize: "16px" }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── DEMO ANIMADA ── */}
        <section style={{ padding: "80px clamp(20px, 5vw, 80px)", borderTop: "1px solid var(--lp-border)" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <p className="section-label">DEMO</p>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: "700", color: "var(--lp-heading)", marginBottom: "16px", lineHeight: "1.2" }}>
              Veja o EditeCC em ação.
            </h2>
            <p style={{ color: "var(--lp-body)", fontSize: "15px", marginBottom: "40px", maxWidth: "500px" }}>
              Do primeiro parágrafo ao PDF formatado em menos de 1 minuto.
            </p>
            {/* Mockup animado do editor */}
            <div style={{
              background: "var(--lp-surface)",
              border: "1px solid var(--lp-border)",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}>
              {/* Barra de ferramentas simulada */}
              <div style={{
                background: "var(--lp-surface-hover)",
                borderBottom: "1px solid var(--lp-border)",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "white", fontWeight: "800", fontSize: "11px" }}>E</span>
                </div>
                <span style={{ color: "var(--lp-card-title)", fontWeight: "700", fontSize: "13px", fontFamily: "DM Sans, sans-serif" }}>
                  Edite<span style={{ color: "#3b82f6" }}>CC</span>
                </span>
                <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                  {["Texto Corrente", "Título 1", "Citação"].map((label, i) => (
                    <span key={i} style={{
                      padding: "4px 10px",
                      background: i === 0 ? "#2563eb20" : "transparent",
                      border: `1px solid ${i === 0 ? "#2563eb40" : "var(--lp-border)"}`,
                      borderRadius: "4px",
                      fontSize: "11px",
                      color: i === 0 ? "#3b82f6" : "var(--lp-muted)",
                    }}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              {/* Área do editor com texto digitando */}
              <div style={{ padding: "32px", fontFamily: "DM Sans, sans-serif", color: "var(--lp-body)", lineHeight: "1.8", fontSize: "14px" }}>
                <p style={{ textIndent: "2.5cm", marginBottom: "12px", color: "var(--lp-card-title)" }}>
                  <span className="typing-text">1. INTRODUÇÃO</span>
                </p>
                <p style={{ textIndent: "2.5cm", marginBottom: "12px" }}>
                  <span className="typing-text delay-1">O presente trabalho tem como objetivo o desenvolvimento de uma aplicação web para comparação de preços em supermercados da região de Mogi Mirim.</span>
                </p>
                <p style={{ textIndent: "2.5cm", marginBottom: "12px" }}>
                  <span className="typing-text delay-2">Nesse contexto, o sistema surge como resposta às necessidades dos consumidores que buscam economia e praticidade no dia a dia.</span>
                </p>
                {/* Indicador de formatação automática */}
                <div style={{
                  position: "relative",
                  marginTop: "20px",
                  padding: "12px 16px",
                  background: "#10b98110",
                  border: "1px solid #10b98130",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: 0.8,
                }}>
                  <span style={{ color: "#10b981", fontSize: "16px" }}>✓</span>
                  <span style={{ fontSize: "13px", color: "#10b981" }}>
                    Formatação ABNT aplicada automaticamente
                  </span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <Link href="/editor" className="cta-secondary" style={{ display: "inline-flex" }}>
                Experimente agora
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── O QUE É ABNT? ── */}
        <section style={{ padding: "80px clamp(20px, 5vw, 80px)", borderTop: "1px solid var(--lp-border)" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
            <p className="section-label">EDUCAÇÃO</p>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "700", color: "var(--lp-heading)", marginBottom: "24px", lineHeight: "1.2" }}>
              O que é ABNT?
            </h2>
            <p style={{ color: "var(--lp-body)", fontSize: "16px", lineHeight: "1.8", maxWidth: "600px", margin: "0 auto 16px" }}>
              A <strong style={{ color: "var(--lp-hero-strong)" }}>ABNT</strong> (Associação Brasileira de Normas Técnicas) define como trabalhos acadêmicos devem ser apresentados.
            </p>
            <p style={{ color: "var(--lp-body)", fontSize: "16px", lineHeight: "1.8", maxWidth: "600px", margin: "0 auto 16px" }}>
              Margens, espaçamento, citações, referências, capa — tudo segue a norma <strong style={{ color: "var(--lp-hero-strong)" }}>NBR 14724:2011</strong>.
            </p>
            <p style={{ color: "var(--lp-body)", fontSize: "16px", lineHeight: "1.8", maxWidth: "600px", margin: "0 auto 16px" }}>
              Por isso universidades, ETECs, FATECs e faculdades exigem que trabalhos sejam entregues seguindo esse padrão.
            </p>
            <p style={{ color: "var(--lp-body)", fontSize: "16px", lineHeight: "1.8", maxWidth: "600px", margin: "0 auto" }}>
              O EditeCC já aplica essas regras <strong style={{ color: "#3b82f6" }}>automaticamente</strong>. Você só precisa escrever.
            </p>
          </div>
        </section>

        {/* ── COMO FUNCIONA ── */}
        <section style={{ padding: "80px clamp(20px, 5vw, 80px)", borderTop: "1px solid var(--lp-border)" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <p className="section-label">Como funciona</p>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: "700", color: "var(--lp-heading)", marginBottom: "56px", lineHeight: "1.2" }}>
              Do zero ao PDF em quatro passos.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{
                  display: "flex", gap: "32px", alignItems: "flex-start",
                  padding: "32px 0",
                  borderBottom: i < STEPS.length - 1 ? "1px solid var(--lp-border)" : "none",
                }}>
                  <div style={{
                    fontFamily: "DM Mono, monospace",
                    fontSize: "11px", color: "var(--lp-stat-label)",
                    paddingTop: "4px", minWidth: "28px",
                  }}>
                    {s.n}
                  </div>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "8px",
                    background: i === 0 ? "var(--lp-step-icon-0)" : i === 1 ? "var(--lp-step-icon-1)" : "var(--lp-step-icon-2)",
                    border: `1px solid ${i === 0 ? "#2563eb40" : i === 1 ? "var(--lp-border)" : "#10b98130"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    color: i === 0 ? "#3b82f6" : i === 1 ? "var(--lp-body)" : "#10b981",
                    fontSize: "18px",
                  }}>
                    {i === 0 ? "◫" : i === 1 ? "¶" : "↓"}
                  </div>
                  <div>
                    <h3 style={{ color: "var(--lp-card-title)", fontSize: "18px", fontWeight: "600", marginBottom: "8px", fontFamily: "Playfair Display, serif" }}>
                      {s.title}
                    </h3>
                    <p style={{ color: "var(--lp-body)", fontSize: "14px", lineHeight: "1.7" }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRIVACIDADE ── */}
        <section style={{ padding: "80px clamp(20px, 5vw, 80px)", borderTop: "1px solid var(--lp-border)" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
            <p className="section-label">PRIVACIDADE</p>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "700", color: "var(--lp-heading)", marginBottom: "24px", lineHeight: "1.2" }}>
              Seus dados nunca saem do seu computador.
            </h2>
            <div style={{ display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap", marginTop: "32px" }}>
              {[
                { icon: "🔒", title: "Sem conta", desc: "Não precisa cadastrar email ou senha." },
                { icon: "☁", title: "Sem servidor", desc: "Nada é enviado para a nuvem." },
                { icon: "💾", title: "Sem armazenamento", desc: "Tudo fica no seu dispositivo." },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: "center", maxWidth: "200px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>{item.icon}</div>
                  <h3 style={{ color: "var(--lp-card-title)", fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>{item.title}</h3>
                  <p style={{ color: "var(--lp-body)", fontSize: "14px", lineHeight: "1.6" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA OPEN SOURCE ── */}
        <section style={{ padding: "80px clamp(20px, 5vw, 80px)" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{
              background: "var(--lp-surface)",
              border: "1px solid var(--lp-border)",
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
                background: "var(--lp-surface-code)", border: "1px solid var(--lp-border)",
                padding: "5px 14px", borderRadius: "20px", marginBottom: "24px",
                fontSize: "12px", color: "#10b981",
              }}>
                ⬡ Open Source · MIT License
              </div>
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "700", color: "var(--lp-heading)", marginBottom: "16px", lineHeight: "1.2" }}>
                Baixe agora. É grátis.
              </h2>
              <p style={{ color: "var(--lp-body)", fontSize: "15px", lineHeight: "1.7", marginBottom: "36px", maxWidth: "480px", margin: "0 auto 36px" }}>
                Disponível para Windows, Linux e macOS. Código-fonte aberto no GitHub.
              </p>
              {/* Botões de download */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "12px" }}>
                <a href="https://github.com/rodrigopereiradevelopment/editecc/releases/download/v1.0.1/EditeCC_1.0.1_x64-setup.exe" target="_blank" rel="noopener noreferrer" className="cta-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  Windows
                </a>
                <a href="https://github.com/rodrigopereiradevelopment/editecc/releases/download/v1.0.1/EditeCC_1.0.1_amd64.deb" target="_blank" rel="noopener noreferrer" className="cta-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  Linux
                </a>
                <a href="https://github.com/rodrigopereiradevelopment/editecc/releases/download/v1.0.1/EditeCC_1.0.1_aarch64.dmg" target="_blank" rel="noopener noreferrer" className="cta-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  macOS
                </a>
              </div>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <a href="https://github.com/rodrigopereiradevelopment/editecc/releases/tag/v1.0.1" target="_blank" rel="noopener noreferrer" style={{ color: "var(--lp-muted)", fontSize: "13px", textDecoration: "underline" }}>
                  outras versões (AppImage, RPM, MSI...)
                </a>
              </div>
              {/* Web + GitHub */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/editor" className="cta-secondary">
                  Abrir versão Web
                </Link>
                <a href="https://github.com/rodrigopereiradevelopment/editecc" target="_blank" rel="noopener noreferrer" className="cta-secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  Código-fonte no GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUEM FEZ ── */}
        <section style={{ padding: "80px clamp(20px, 5vw, 80px)", borderTop: "1px solid var(--lp-border)" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "32px",
              fontWeight: "700",
              color: "white",
              fontFamily: "Playfair Display, serif",
            }}>
              R
            </div>
            <h2 style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "24px",
              fontWeight: "700",
              color: "var(--lp-heading)",
              marginBottom: "8px",
            }}>
              Criado por Rodrigo Pereira
            </h2>
            <p style={{
              color: "var(--lp-muted)",
              fontSize: "15px",
              marginBottom: "20px",
            }}>
              Técnico em Desenvolvimento de Sistemas
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="https://github.com/rodrigopereiradevelopment"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  background: "var(--lp-surface)",
                  border: "1px solid var(--lp-border)",
                  borderRadius: "8px",
                  color: "var(--lp-body)",
                  fontSize: "13px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/rodrigopereiradevelopment"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  background: "var(--lp-surface)",
                  border: "1px solid var(--lp-border)",
                  borderRadius: "8px",
                  color: "var(--lp-body)",
                  fontSize: "13px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
            </div>
            <p style={{
              color: "var(--lp-stat-label)",
              fontSize: "12px",
              marginTop: "24px",
              fontFamily: "DM Mono, monospace",
            }}>
              Open Source · MIT License
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          padding: "24px clamp(20px, 5vw, 80px)",
          borderTop: "1px solid var(--lp-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "5px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: "800", fontSize: "10px" }}>E</span>
            </div>
            <span style={{ color: "var(--lp-body)", fontSize: "13px" }}>
              EditeCC · MIT License · rodrigopereiradevelopment
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <FeedbackButton />
            <span style={{ color: "var(--lp-stat-label)", fontSize: "12px", fontFamily: "DM Mono, monospace" }}>
              v1.0.1 · ABNT NBR 14724:2011
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}
