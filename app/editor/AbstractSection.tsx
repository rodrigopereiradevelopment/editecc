"use client";

interface AbstractSectionProps {
  value: string;
  onChange: (value: string) => void;
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  language?: "en" | "es" | "fr";
}

const LANGUAGE_LABELS = {
  en: { title: "ABSTRACT", keywords: "Keywords:" },
  es: { title: "RESUMEN", keywords: "Palabras clave:" },
  fr: { title: "RÉSUMÉ", keywords: "Mots-clés:" },
};

export function AbstractSection({
  value,
  onChange,
  keywords,
  onKeywordsChange,
  language = "en",
}: AbstractSectionProps) {
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = raw.split(".").map(p => p.trim()).filter(p => p !== "");
    onKeywordsChange(cleaned);
  };

  const keywordsText = keywords.join(". ") + (keywords.length > 0 ? "." : "");
  const labels = LANGUAGE_LABELS[language];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-2">{labels.title}</h3>
      <div style={{ fontFamily: "Arial, Calibri, sans-serif", fontSize: "10pt", lineHeight: "1.0" }}>
        <textarea
          className="w-full p-3 border rounded resize-y"
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite a versão em língua estrangeira do resumo aqui."
          style={{ fontFamily: "Arial, Calibri, sans-serif", fontSize: "10pt", lineHeight: "1.0" }}
        />
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1">{labels.keywords}</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={keywordsText}
            onChange={handleKeywordsChange}
            placeholder="exemplo: Education. Technology. Technical Education."
            style={{ fontFamily: "Arial, Calibri, sans-serif", fontSize: "10pt" }}
          />
        </div>
      </div>
    </div>
  );
}