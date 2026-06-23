"use client";

const line = (w: string, h = "12px") => ({
  height: h, width: w, borderRadius: "6px",
  background: "var(--border-color)",
  animation: "shimmer 1.8s ease-in-out infinite",
});

export function EditorSkeleton() {
  return (
    <div style={{ display: "flex", height: "100vh", minWidth: "1024px", overflow: "auto" }}>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Sidebar skeleton */}
      <aside style={{
        width: "280px", background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-color)",
        display: "flex", flexDirection: "column", flexShrink: 0, padding: "14px", gap: "14px",
      }}>
        <div style={line("80px")} />
        <div style={{ ...line("100%"), height: "30px" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={line(i % 2 === 0 ? "90%" : "70%")} />
          ))}
        </div>
      </aside>

      {/* Main skeleton */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{
          background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)",
          padding: "6px 10px", display: "flex", gap: "6px", alignItems: "center", height: "40px",
        }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ ...line("28px"), height: "28px", borderRadius: "5px" }} />
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
            <div style={{ ...line("70px"), height: "28px", borderRadius: "6px" }} />
            <div style={{ ...line("90px"), height: "28px", borderRadius: "6px" }} />
          </div>
        </div>

        {/* Canvas */}
        <div style={{
          flex: 1, overflow: "auto", background: "var(--bg-elevated)",
          display: "flex", justifyContent: "center", padding: "28px 20px",
        }}>
          <div style={{
            width: "21cm", minHeight: "29.7cm", background: "white",
            borderRadius: "4px", padding: "3cm 2cm 2cm 3cm",
            display: "flex", flexDirection: "column", gap: "16px",
            boxShadow: "0 8px 48px rgba(0,0,0,0.55)",
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} style={{
                ...line(i === 1 ? "60%" : i === 2 ? "40%" : i % 2 === 0 ? "90%" : "75%"),
                height: i <= 2 ? "14px" : "10px",
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
