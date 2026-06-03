"use client";

interface FolhaRostoProps {
  autor: string;
  titulo: string;
  subtitulo?: string;
  orientador: string;
  curso: string;
  etec: string;
  local: string;
  ano: string;
}

export function FolhaRosto({
  autor,
  titulo,
  subtitulo,
  orientador,
  curso,
  etec,
  local,
  ano,
}: FolhaRostoProps) {
  return (
    <div className="a4Sheet" style={{ 
      background: "white", 
      color: "black",
      width: "21cm",
      minHeight: "29.7cm",
      margin: "0 auto",
      position: "relative",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)"
    }}>
      <div style={{ 
        padding: "3cm 2cm 2cm 3cm",
        fontFamily: "Arial, Calibri, sans-serif",
        fontSize: "12pt",
        lineHeight: "1.5",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "29.7cm"
      }}>
        {/* Nome do autor */}
        <div style={{ textAlign: "center", marginBottom: "8cm" }}>
          <p style={{ fontSize: "14pt", fontWeight: "bold", textTransform: "uppercase" }}>
            {autor}
          </p>
        </div>

        {/* Título */}
        <div style={{ textAlign: "center", marginBottom: "8cm" }}>
          <p style={{ fontSize: "16pt", fontWeight: "bold", textTransform: "uppercase" }}>
            {titulo}
          </p>
          {subtitulo && (
            <p style={{ fontSize: "14pt", fontStyle: "italic", marginTop: "0.5cm" }}>
              {subtitulo}
            </p>
          )}
        </div>

        {/* Nota explicativa (alinhada à direita a partir do centro) */}
        <div style={{ 
          textAlign: "right", 
          marginLeft: "50%",
          marginBottom: "2cm"
        }}>
          <p style={{ fontSize: "11pt", lineHeight: "1.0" }}>
            Trabalho de Conclusão de Curso apresentado à {etec}<br />
            como requisito parcial para obtenção do título de<br />
            Técnico em {curso}, sob orientação do Prof. {orientador}.
          </p>
        </div>

        {/* Local e ano (centralizados) */}
        <div style={{ textAlign: "center", marginTop: "4cm" }}>
          <p>{local}</p>
          <p>{ano}</p>
        </div>
      </div>
    </div>
  );
}