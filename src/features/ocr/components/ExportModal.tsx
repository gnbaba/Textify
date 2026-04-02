import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { ExtractionBlock } from '../../history/hooks/useCloudHistory';

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

  // Filter out unselected blocks, but maintain the dragged order!
  const finalBlocks = blocks.filter((block) => selectedIds.includes(block.id));
  
  // Stitch together with double newlines for readable spacing
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

      // Set up fonts and margins
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(documentTitle || 'Textify Extraction', 20, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      // PDF formatting logic: Wrap text and handle multiple pages
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const maxWidth = 170;
      let cursorY = 35; // Start below the title

      const lines = doc.splitTextToSize(combinedText, maxWidth);

      for (let i = 0; i < lines.length; i++) {
        if (cursorY > pageHeight - margin) {
          doc.addPage();
          cursorY = margin; // Reset Y back to the top
        }
        doc.text(lines[i], margin, cursorY);
        cursorY += 6; // Standard line height
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#4D694E]/10 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-extrabold text-[#4D694E]">Export Document</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-100/50">
          <label className="block text-xs font-bold text-[#4D694E] uppercase tracking-wider mb-2">
            Document Preview ({finalBlocks.length} Blocks Selected)
          </label>
          <div className="w-full bg-white border border-[#4D694E]/20 rounded-xl p-5 shadow-inner min-h-[300px]">
            {finalBlocks.length === 0 ? (
              <p className="text-gray-400 text-center italic mt-10">No blocks selected. Close and select at least one block to export.</p>
            ) : (
              <p className="text-sm font-mono text-gray-800 whitespace-pre-wrap leading-relaxed">
                {combinedText}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#4D694E]/10 flex flex-col md:flex-row justify-between items-center gap-3 bg-white">
          <button 
            onClick={handleCopyText} 
            disabled={finalBlocks.length === 0}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-sm text-[#4D694E] bg-[#4D694E]/10 hover:bg-[#4D694E]/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {copied ? 'Copied to Clipboard!' : 'Copy Raw Text'}
          </button>

          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={onClose} className="flex-1 md:flex-none px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition">
              Cancel
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={finalBlocks.length === 0 || isExporting}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm text-[#FFF3D5] bg-[#4D694E] hover:bg-[#3a4f3b] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-md flex items-center justify-center gap-2"
            >
              {isExporting ? 'Generating...' : 'Download PDF'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};