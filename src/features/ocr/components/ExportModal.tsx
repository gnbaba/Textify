import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { ExtractionBlock } from '../../history/hooks/useCloudHistory';
import { X, Copy, Download, Check } from '@phosphor-icons/react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4D694E]/40 px-4 font-mono-industrial text-[#4D694E]">
      <div className="bg-[#FFF3D5] w-full max-w-2xl border-2 border-[#4D694E] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-3 border-b-2 border-[#4D694E] flex justify-between items-center bg-[#4D694E] text-[#FFF3D5]">
          <h3 className="text-xs font-black uppercase tracking-[0.15em]">&lt; EXPORT DOCUMENT PROTOCOL &gt;</h3>
          <button onClick={onClose} className="text-[#FFF3D5]/80 hover:text-white transition">
            <X className="w-4 h-4" weight="bold" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#FFF3D5]/10">
          <label className="block text-[9px] font-bold text-[#4D694E]/60 uppercase tracking-widest mb-2.5">
            /// DOCUMENT PREVIEW ({finalBlocks.length} BLOCKS MOUNTED)
          </label>
          <div className="w-full bg-[#FFF3D5] border-2 border-[#4D694E] p-5 min-h-[260px] shadow-[4px_4px_0px_0px_#4D694E]">
            {finalBlocks.length === 0 ? (
              <p className="text-[#4D694E]/40 text-center italic text-xs uppercase tracking-wide mt-10">
                [ NO BLOCKS SELECTED. SELECT BLOCKS IN THE WORKSPACE BEFORE INITIATING EXPORT ]
              </p>
            ) : (
              <pre className="text-xs font-mono text-[#4D694E] whitespace-pre-wrap leading-relaxed">
                {combinedText}
              </pre>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t-2 border-[#4D694E] flex flex-col md:flex-row justify-between items-center gap-3 bg-[#FFF3D5] font-bold text-[9px] tracking-wide uppercase">
          <button 
            onClick={handleCopyText} 
            disabled={finalBlocks.length === 0}
            className="w-full md:w-auto px-4 py-2 border-2 border-[#4D694E] bg-[#FFF3D5] text-[#4D694E] hover:bg-[#4D694E] hover:text-[#FFF3D5] transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5" weight="bold" /> COPIED TO CLIPBOARD</>
            ) : (
              <><Copy className="w-3.5 h-3.5" weight="bold" /> COPY RAW TEXT</>
            )}
          </button>

          <div className="flex gap-2.5 w-full md:w-auto">
            <button 
              onClick={onClose} 
              className="flex-1 md:flex-none px-4 py-2 border-2 border-[#4D694E] bg-transparent hover:bg-[#4D694E]/10 text-[#4D694E] transition"
            >
              CANCEL
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={finalBlocks.length === 0 || isExporting}
              className="flex-1 md:flex-none px-5 py-2 border-2 border-[#4D694E] bg-[#4D694E] text-[#FFF3D5] hover:bg-[#3a4f3b] transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              {isExporting ? 'GENERATING...' : 'DOWNLOAD PDF'}
              <Download className="w-3.5 h-3.5" weight="bold" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};