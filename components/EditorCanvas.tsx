"use client";
import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { Capa } from "@/components/Capa";
import { FolhaRosto } from "@/components/FolhaRosto";
import { FolhaAprovacao } from "@/components/FolhaAprovacao";
import { Dedicatoria } from "@/components/Dedicatoria";
import { Agradecimentos } from "@/components/Agradecimentos";
import { Epigrafe } from "@/components/Epigrafe";
import { ResumoPage } from "@/components/ResumoPage";
import { AbstractPage } from "@/components/AbstractPage";
import { GlossarioPage } from "@/components/GlossarioPage";
import { ApendicePage } from "@/components/ApendicePage";
import { AnexoPage } from "@/components/AnexoPage";
import { NotasRodapePage } from "@/components/NotasRodapePage";
import type { PosTextualItem } from "@/components/PosTextuaisManager";
import type { GlossarioEntry } from "@/components/GlossarioManager";
import type { NotaRodape } from "@/components/NotasRodapeManager";
import { extractFigures, extractTables, formatReference } from "@/lib/abnt/styles";
import type { Reference } from "@/lib/abnt/styles";

interface CoverShape {
  autor: string; titulo: string; subtitulo: string; orientador: string;
  curso: string; etec: string; local: string; ano: string;
}

interface EditorCanvasProps {
  coverData: CoverShape;
  showFolhaRosto: boolean;
  showAprovacao: boolean;
  showDedicatoria: boolean;
  showAgradecimentos: boolean;
  showEpigrafe: boolean;
  showResumoPage: boolean;
  showAbstractPage: boolean;
  showFigList: boolean;
  showGlossario: boolean;
  showApendices: boolean;
  showAnexos: boolean;
  showNotasRodape: boolean;
  dedicatoriaTexto: string;
  agradecimentosTexto: string;
  epigrafeTexto: string;
  epigrafeAutor: string;
  aprovacaoData: string;
  resumo: string;
  palavrasChave: string[];
  abstract: string;
  keywords: string[];
  abstractLang: string;
  refs: Reference[];
  anexos: PosTextualItem[];
  apendices: PosTextualItem[];
  glossario: GlossarioEntry[];
  notasRodape: NotaRodape[];
  editor: Editor | null;
  editorContainerRef: any;
}

export function EditorCanvas({
  coverData, editor, editorContainerRef,
  showFolhaRosto, showAprovacao, showDedicatoria, showAgradecimentos,
  showEpigrafe, showResumoPage, showAbstractPage, showFigList,
  showGlossario, showApendices, showAnexos, showNotasRodape,
  dedicatoriaTexto, agradecimentosTexto, epigrafeTexto, epigrafeAutor,
  aprovacaoData, resumo, palavrasChave, abstract, keywords, abstractLang,
  refs, anexos, apendices, glossario, notasRodape,
}: EditorCanvasProps) {
  return (
    <div ref={editorContainerRef} style={{
      flex: 1, overflow: "auto", background: "var(--bg-elevated)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "28px 20px", gap: "20px",
      counterReset: "page",
    }}>
      <Capa {...coverData} />
      {showFolhaRosto && <FolhaRosto {...coverData} />}
      {showAprovacao && (
        <FolhaAprovacao
          autor={coverData.autor}
          titulo={coverData.titulo}
          subtitulo={coverData.subtitulo}
          curso={coverData.curso}
          orientador={coverData.orientador}
          data={aprovacaoData}
        />
      )}
      {showDedicatoria && <Dedicatoria value={dedicatoriaTexto} />}
      {showAgradecimentos && <Agradecimentos value={agradecimentosTexto} />}
      {showEpigrafe && <Epigrafe texto={epigrafeTexto} autor={epigrafeAutor} />}
      {showResumoPage && <ResumoPage value={resumo} palavrasChave={palavrasChave} />}
      {showAbstractPage && <AbstractPage value={abstract} keywords={keywords} language={abstractLang} />}
      {editor && <EditorContent editor={editor} />}
      {showFigList && (() => {
        const html = editor?.getHTML() || "";
        const figs = extractFigures(html);
        const tbls = extractTables(html);
        if (!figs.length && !tbls.length) return null;
        return (
          <div className="a4-page" style={{ padding: "3cm 2cm 2cm 3cm", marginTop: "20px" }}>
            {figs.length > 0 && (
              <>
                <h1 style={{ fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", textAlign: "center", marginBottom: "1.5em" }}>
                  LISTA DE FIGURAS
                </h1>
                {figs.map((f: any) => (
                  <p key={f.id} style={{ fontSize: "12pt", lineHeight: "1.5", marginBottom: "4pt" }}>
                    FIGURA {f.index} – {f.caption}
                  </p>
                ))}
              </>
            )}
            {tbls.length > 0 && (
              <>
                <h1 style={{ fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", textAlign: "center", margin: "2em 0 1em" }}>
                  LISTA DE TABELAS
                </h1>
                {tbls.map((t: any) => (
                  <p key={t.id} style={{ fontSize: "12pt", lineHeight: "1.5", marginBottom: "4pt" }}>
                    TABELA {t.index} – {t.caption}
                  </p>
                ))}
              </>
            )}
          </div>
        );
      })()}
      {refs.length > 0 && (
        <div className="a4-page" style={{ padding: "3cm 2cm 2cm 3cm", marginTop: "20px" }}>
          <h1 style={{ fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", textAlign: "center", marginBottom: "1.5em" }}>
            REFERÊNCIAS
          </h1>
          {refs.map((r, i) => (
            <p key={i} style={{ fontSize: "12pt", lineHeight: "1.0", marginBottom: "6pt", textAlign: "justify" }}>
              {formatReference(r)}
            </p>
          ))}
        </div>
      )}
      {showGlossario && <GlossarioPage entries={glossario} />}
      {showApendices && apendices.length > 0 && <ApendicePage items={apendices} />}
      {showAnexos && anexos.length > 0 && <AnexoPage items={anexos} />}
      {showNotasRodape && notasRodape.length > 0 && <NotasRodapePage notas={notasRodape} />}
    </div>
  );
}
