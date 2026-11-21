import { Check, Copy, Download, FileJson, FileText, Printer, Table, X } from 'lucide-react';
import React, { useState } from 'react';
import type { ExtractionBlock } from '../../history/hooks/useCloudHistory';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: ExtractionBlock[];
  selectedIds: string[];
  documentTitle: string;
}

let cachedNotoSansBase64: string | null = null;

async function getNotoSansBase64(): Promise<string> {
  if (cachedNotoSansBase64) return cachedNotoSansBase64;
  const res = await fetch('/fonts/NotoSans-Regular.ttf');
  if (!res.ok) {
    throw new Error('Failed to load PDF font binary');
  }
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
  }
  cachedNotoSansBase64 = btoa(binary);
  return cachedNotoSansBase64;
}

const sanitizeFileName = (name: string): string => {
  return (name || 'Textify_Extraction').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const sanitizeCsvField = (field: string): string => {
  let val = field.replace(/^[\s\t\r]*[=+@-]/, "'$&");
  if (val.includes('"') || val.includes(',') || val.includes('\n') || val.includes('\r')) {
    val = `"${val.replace(/"/g, '""')}"`;
  }
  return val;
};

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  blocks,
  selectedIds,
  documentTitle,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);

  if (!isOpen) return null;

  const finalBlocks = blocks.filter((block) => selectedIds.includes(block.id));
  const combinedText = finalBlocks.map((b) => b.text).join('\n\n');

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(combinedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setFontError(null);
    try {
      const fontBase64 = await getNotoSansBase64();
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64);
      doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
      doc.setFont('NotoSans', 'normal');

      doc.setFontSize(16);
      doc.text(documentTitle || 'Textify Extraction', 20, 20);

      doc.setFontSize(11);

      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const maxWidth = 170;
      let cursorY = 35;

      const lines = doc.splitTextToSize(combinedText, maxWidth);

      for (let i = 0; i < lines.length; i++) {
        if (cursorY > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(lines[i], margin, cursorY);
        cursorY += 6;
      }

      doc.save(`${sanitizeFileName(documentTitle)}_Textify.pdf`);
      onClose();
    } catch (error) {
      console.error('PDF Generation failed', error);
      setFontError('Failed to load PDF font. Please check your connection.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      title: documentTitle || 'Textify Extraction',
      exportedAt: new Date().toISOString(),
      blocks: finalBlocks.map((b, idx) => ({
        id: b.id,
        text: b.text,
        timestamp: b.timestamp,
        order: b.order ?? (idx + 1) * 1000,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    downloadBlob(blob, `${sanitizeFileName(documentTitle)}_Textify.json`);
  };

  const handleExportMarkdown = () => {
    const mdContent =
      `# ${documentTitle || 'Textify Extraction'}\n\n` +
      finalBlocks.map((b) => b.text).join('\n\n---\n\n');
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${sanitizeFileName(documentTitle)}_Textify.md`);
  };

  const handleExportCSV = () => {
    const headers = ['Order', 'Block ID', 'Timestamp', 'Text'];
    const rows = finalBlocks.map((b, idx) => [
      (b.order ?? (idx + 1) * 1000).toString(),
      b.id,
      new Date(b.timestamp).toISOString(),
      b.text,
    ]);
    const csvContent =
      '\uFEFF' +
      [
        headers.map(sanitizeCsvField).join(','),
        ...rows.map((row) => row.map(sanitizeCsvField).join(',')),
      ].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${sanitizeFileName(documentTitle)}_Textify.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#20251F]/50 backdrop-blur-sm px-4 font-mono-industrial text-[#20251F]">
      <div className="bg-[#FFFDF7] w-full max-w-2xl border border-[#20251F] shadow-drafting-lg flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3 border-b border-[#20251F]/15 flex justify-between items-center bg-[#20251F] text-[#FFFDF7]">
          <h3 className="text-xs font-black uppercase tracking-[0.15em]">[ EXPORT DOCUMENT ]</h3>
          <button
            onClick={onClose}
            className="text-[#FFFDF7]/70 hover:text-[#E96C3F] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#F3EFE3]/20">
          {fontError && (
            <div
              role="alert"
              className="mb-4 p-3 bg-[#E96C3F]/10 border border-[#E96C3F] text-[#E96C3F] text-xs font-mono font-bold uppercase"
            >
              {fontError}
            </div>
          )}

          <div className="flex justify-between items-center mb-2.5">
            <label className="block text-[9px] font-bold text-[#20251F]/60 uppercase tracking-widest">
              [ DOCUMENT PREVIEW &bull; {finalBlocks.length} BLOCKS MOUNTED ]
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                disabled={finalBlocks.length === 0}
                className="px-2.5 py-1 text-[9px] font-bold tracking-wide uppercase border border-[#20251F]/20 hover:border-[#20251F] bg-[#FFFDF7] flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                title="Download JSON"
              >
                <FileJson className="w-3 h-3 text-[#214C3A]" /> JSON
              </button>
              <button
                type="button"
                onClick={handleExportMarkdown}
                disabled={finalBlocks.length === 0}
                className="px-2.5 py-1 text-[9px] font-bold tracking-wide uppercase border border-[#20251F]/20 hover:border-[#20251F] bg-[#FFFDF7] flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                title="Download Markdown"
              >
                <FileText className="w-3 h-3 text-[#214C3A]" /> MD
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={finalBlocks.length === 0}
                className="px-2.5 py-1 text-[9px] font-bold tracking-wide uppercase border border-[#20251F]/20 hover:border-[#20251F] bg-[#FFFDF7] flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                title="Download CSV"
              >
                <Table className="w-3 h-3 text-[#214C3A]" /> CSV
              </button>
              <button
                type="button"
                onClick={handlePrint}
                disabled={finalBlocks.length === 0}
                className="px-2.5 py-1 text-[9px] font-bold tracking-wide uppercase border border-[#20251F]/20 hover:border-[#20251F] bg-[#FFFDF7] flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                title="Print via OS Dialog (CJK/Emoji support)"
              >
                <Printer className="w-3 h-3 text-[#214C3A]" /> PRINT
              </button>
            </div>
          </div>

          <div className="w-full bg-[#FFFDF7] border border-[#20251F]/20 p-5 min-h-[240px] shadow-drafting-sm">
            {finalBlocks.length === 0 ? (
              <p className="text-[#20251F]/40 text-center italic text-xs uppercase tracking-wide mt-10">
                [ NO BLOCKS SELECTED. SELECT BLOCKS IN THE WORKSPACE BEFORE INITIATING EXPORT ]
              </p>
            ) : (
              <pre className="text-xs font-mono text-[#20251F] whitespace-pre-wrap leading-relaxed select-text">
                {combinedText}
              </pre>
            )}
          </div>
          <p className="mt-2 text-[8px] font-mono text-[#20251F]/50 uppercase tracking-wide text-right">
            PRINT USES OS RENDERING FOR NATIVE CJK / EMOJI GLYPH FIDELITY
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#20251F]/15 flex flex-col md:flex-row justify-between items-center gap-3 bg-[#FFFDF7] font-bold text-[9px] tracking-wide uppercase">
          <button
            onClick={handleCopyText}
            disabled={finalBlocks.length === 0}
            className="w-full md:w-auto px-4 py-2 border border-[#20251F]/20 bg-[#FFFDF7] text-[#20251F] hover:bg-[#20251F] hover:text-[#FFFDF7] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-drafting-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> COPIED TO CLIPBOARD
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> COPY RAW TEXT
              </>
            )}
          </button>

          <div className="flex gap-2.5 w-full md:w-auto">
            <button
              onClick={onClose}
              className="flex-1 md:flex-none px-4 py-2 border border-[#20251F]/20 bg-transparent hover:border-[#20251F] text-[#20251F] transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              onClick={handleExportPDF}
              disabled={finalBlocks.length === 0 || isExporting}
              className="flex-1 md:flex-none px-5 py-2 bg-[#214C3A] text-[#FFFDF7] hover:bg-[#183a2b] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-drafting-sm cursor-pointer"
            >
              {isExporting ? 'GENERATING...' : 'DOWNLOAD PDF'}
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
