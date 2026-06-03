"use client";

interface ResumoSectionProps {
  value: string;
  onChange: (value: string) => void;
  palavrasChave: string[];
  onPalavrasChaveChange: (palavras: string[]) => void;
}

export function ResumoSection({
  value,
  onChange,
  palavrasChave,
  onPalavrasChaveChange,
}: ResumoSectionProps) {
  const handlePalavrasChaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Separa por ponto, remove espaços extras, filtra vazios
    const cleaned = raw.split(".").map(p => p.trim()).filter(p => p !== "");
    onPalavrasChaveChange(cleaned);
  };

  const palavrasChaveText = palavrasChave.join(". ") + (palavrasChave.length > 0 ? "." : "");

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-2">RESUMO</h3>
      <div style={{ fontFamily: "Arial, Calibri, sans-serif", fontSize: "10pt", lineHeight: "1.0" }}>
        <textarea
          className="w-full p-3 border rounded resize-y"
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite o resumo do seu TCC aqui. Deve ser um parágrafo único, com frases concisas, verbos na terceira pessoa do singular e voz ativa."
          style={{ fontFamily: "Arial, Calibri, sans-serif", fontSize: "10pt", lineHeight: "1.0" }}
        />
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1">Palavras-chave:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={palavrasChaveText}
            onChange={handlePalavrasChaveChange}
            placeholder="exemplo: Educação. Tecnologia. Ensino Técnico. (separar por ponto)"
            style={{ fontFamily: "Arial, Calibri, sans-serif", fontSize: "10pt" }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Separe as palavras-chave por ponto. Exemplo: "Educação. Tecnologia. Ensino Técnico."
          </p>
        </div>
      </div>
    </div>
  );
}