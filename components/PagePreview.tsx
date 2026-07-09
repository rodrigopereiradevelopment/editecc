"use client";

import { splitContentIntoPages } from "@/lib/abnt/pageBreak";

interface PagePreviewProps {
  html: string;
  onClose: () => void;
}

export function PagePreview({ html, onClose }: PagePreviewProps) {
  const pages = splitContentIntoPages(html);
  
  return (
    <div className="page-preview-overlay">
      <div className="page-preview-header">
        <h2>Visualização de Páginas</h2>
        <p>{pages.length} {pages.length === 1 ? 'página' : 'páginas'}</p>
        <button onClick={onClose} className="close-button">
          Fechar
        </button>
      </div>
      <div className="page-preview-content">
        {pages.map((pageHtml, index) => (
          <div key={index} className="a4-page preview-page">
            <div 
              className="page-content"
              dangerouslySetInnerHTML={{ __html: pageHtml }}
            />
            <div className="page-number">{index + 1}</div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .page-preview-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: auto;
        }
        .page-preview-header {
          background: white;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 1001;
        }
        .page-preview-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        .page-preview-header p {
          margin: 0;
          color: #6b7280;
        }
        .close-button {
          margin-left: auto;
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .close-button:hover {
          background: #2563eb;
        }
        .page-preview-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .preview-page {
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
          position: relative;
        }
        .page-content {
          min-height: 24.7cm;
        }
        .page-number {
          position: absolute;
          bottom: 1.5cm;
          right: 2cm;
          font-family: Arial, sans-serif;
          font-size: 12pt;
          color: #111;
        }
      `}</style>
    </div>
  );
}