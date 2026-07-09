"use client";

interface PageBreakIndicatorProps {
  pageNumber: number;
  isLast?: boolean;
}

export function PageBreakIndicator({ pageNumber, isLast = false }: PageBreakIndicatorProps) {
  if (isLast) return null;
  
  return (
    <div
      className="page-break-indicator"
      style={{
        width: "21cm",
        height: "1px",
        background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
        margin: "0",
        position: "relative",
        pageBreakAfter: "always",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "-8px",
          transform: "translateX(-50%)",
          background: "white",
          padding: "0 8px",
          fontSize: "10px",
          color: "#3b82f6",
          fontFamily: "Arial, sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        Página {pageNumber} → {pageNumber + 1}
      </div>
    </div>
  );
}