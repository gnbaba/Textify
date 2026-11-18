import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { ExtractionBlock } from '../../history/hooks/useCloudHistory';
import { X, Copy, Download, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: ExtractionBlock[];
  selectedIds: string[];
  documentTitle: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  blocks,
  selectedIds,
  documentTitle,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(documentTitle || 'Textify Extraction', 20, 20);

      doc.setFont('helvetica', 'normal');
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

      doc.save(`${documentTitle.replace(/\s+/g, '_')}_Textify.pdf`);
      onClose();
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Failed to generate PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#20251F]/50 backdrop-blur-sm px-4 font-mono-industrial text-[#20251F]">
      <div className="bg-[#FFFDF7] w-full max-w-2xl border border-[#20251F] shadow-drafting-lg flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-3 border-b border-[#20251F]/15 flex justify-between items-center bg-[#20251F] text-[#FFFDF7]">
          <h3 className="text-xs font-black uppercase tracking-[0.15em]">[ EXPORT DOCUMENT ]</h3>
          <button onClick={onClose} className="text-[#FFFDF7]/70 hover:text-[#E96C3F] transition-colors cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#F3EFE3]/20">
          <label className="block text-[9px] font-bold text-[#20251F]/60 uppercase tracking-widest mb-2.5">
            [ DOCUMENT PREVIEW &bull; {finalBlocks.length} BLOCKS MOUNTED ]
          </label>
          <div className="w-full bg-[#FFFDF7] border border-[#20251F]/20 p-5 min-h-[260px] shadow-drafting-sm">
            {finalBlocks.length === 0 ? (
              <p className="text-[#20251F]/40 text-center italic text-xs uppercase tracking-wide mt-10">
                [ NO BLOCKS SELECTED. SELECT BLOCKS IN THE WORKSPACE BEFORE INITIATING EXPORT ]
              </p>
            ) : (
              <pre className="text-xs font-mono text-[#20251F] whitespace-pre-wrap leading-relaxed">
                {combinedText}
              </pre>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#20251F]/15 flex flex-col md:flex-row justify-between items-center gap-3 bg-[#FFFDF7] font-bold text-[9px] tracking-wide uppercase">
          <button 
            onClick={handleCopyText} 
            disabled={finalBlocks.length === 0}
            className="w-full md:w-auto px-4 py-2 border border-[#20251F]/20 bg-[#FFFDF7] text-[#20251F] hover:bg-[#20251F] hover:text-[#FFFDF7] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-drafting-sm cursor-pointer"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5" /> COPIED TO CLIPBOARD</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> COPY RAW TEXT</>
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