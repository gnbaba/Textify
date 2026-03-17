import React, { useState, useEffect, useRef } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { useOcrProcessor } from '../hooks/useOcrProcessor';
import { tesseractOcrService } from '../services/tesseractOcrService';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCloudHistory, ExtractionBlock } from '../../history/hooks/useCloudHistory';
import { useWorkspace } from '../../../shared/context/WorkspaceContext';
import type { ExtractionMode } from '../types/ocrTypes';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export const OcrWorkspace: React.FC = () => {
  const { user } = useAuth();
  const { documents, createSession, addToSession } = useCloudHistory(user?.uid);
  const { status, text, progress, process } = useOcrProcessor(tesseractOcrService);
  const { activeDocument, setActiveDocument } = useWorkspace();
  
  const [mode, setMode] = useState<ExtractionMode>('document');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const lastSavedTextRef = useRef<string | null>(null);

  // State to handle the custom block delete modal
  const [blockToDelete, setBlockToDelete] = useState<ExtractionBlock | null>(null);

  const liveActiveDocument = activeDocument 
    ? documents.find(d => d.id === activeDocument.id) || null 
    : null;

  useEffect(() => {
    if (status === 'success' && text && text !== lastSavedTextRef.current) {
      lastSavedTextRef.current = text;
      
      if (liveActiveDocument) {
        addToSession(liveActiveDocument.id, text);
      } else {
        const title = mode === 'document' ? 'Document Scan' : 'Graphic Scan';
        createSession(text, title).then(newDoc => {
          if (newDoc) setActiveDocument(newDoc);
        });
      }
    }
  }, [status, text, mode, liveActiveDocument, createSession, addToSession, setActiveDocument]);

  const handleCopyText = async (textToCopy: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(blockId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Executes the actual deletion when confirmed in the modal
  const confirmDeleteBlock = async () => {
    if (!user || !liveActiveDocument || !blockToDelete) return;
    try {
        const documentRef = doc(db, 'users', user.uid, 'documents', liveActiveDocument.id);
        await updateDoc(documentRef, { blocks: arrayRemove(blockToDelete) });
    } catch (err) {
        console.error('Failed to delete block:', err);
    }
    setBlockToDelete(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      <div className="mb-6 space-y-6">
        <div className="flex justify-center mb-2">
          <div className="bg-[#FFF3D5] p-1 rounded-xl inline-flex shadow-sm border border-[#4D694E]/20">
            <button onClick={() => setMode('document')} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${mode === 'document' ? 'bg-[#4D694E] text-white shadow-md' : 'text-[#4D694E] hover:bg-[#4D694E]/10'}`}>
              <span>Document Mode</span>
              <div className={`group relative flex items-center justify-center w-5 h-5 rounded-full border text-xs font-bold ${mode === 'document' ? 'border-white/40 text-white/80' : 'border-[#4D694E]/40 text-[#4D694E]/70'}`}>
                i
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-[#4D694E] text-[#FFF3D5] text-xs p-2.5 rounded-lg shadow-xl z-10 pointer-events-none text-center font-normal leading-relaxed">
                  Reads every scattered word. Best for receipts, posters, and standard documents.
                </div>
              </div>
            </button>

            <button onClick={() => setMode('graphic')} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${mode === 'graphic' ? 'bg-[#4D694E] text-white shadow-md' : 'text-[#4D694E] hover:bg-[#4D694E]/10'}`}>
              <span>Graphic Mode</span>
              <div className={`group relative flex items-center justify-center w-5 h-5 rounded-full border text-xs font-bold ${mode === 'graphic' ? 'border-white/40 text-white/80' : 'border-[#4D694E]/40 text-[#4D694E]/70'}`}>
                i
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-[#4D694E] text-[#FFF3D5] text-xs p-2.5 rounded-lg shadow-xl z-10 pointer-events-none text-center font-normal leading-relaxed">
                  Reads single blocks of text. Best for heavily stylized logos and graphics.
                </div>
              </div>
            </button>
          </div>
        </div>

        <ImageDropzone onImageCaptured={(file) => process(file, mode)} />

        {status === 'loading' && (
          <div className="w-full bg-[#4D694E]/20 rounded-full h-3 overflow-hidden">
            <div className="bg-[#4D694E] h-3 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {liveActiveDocument ? (
        <div className="space-y-6 mt-8 border-t border-[#4D694E]/10 pt-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-extrabold text-[#4D694E]">{liveActiveDocument.title}</h2>
             <span className="text-xs font-bold bg-[#4D694E]/10 text-[#4D694E] px-3 py-1.5 rounded-full">Active Session</span>
          </div>

          {liveActiveDocument.blocks.map((block) => (
            <div key={block.id} className="bg-white rounded-xl border border-[#4D694E]/20 shadow-sm overflow-hidden mb-6">
              <div className="p-5">
                <textarea readOnly value={block.text} className="w-full h-48 p-4 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#4D694E] bg-[#FFF3D5]/30 border border-[#4D694E]/20 text-gray-800 font-mono text-sm leading-relaxed" />
              </div>
              
              <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                <button onClick={() => setBlockToDelete(block)} className="text-red-500 hover:text-red-600 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-semibold text-sm" title="Delete this extraction">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   <span>Delete</span>
                </button>
                <button onClick={() => handleCopyText(block.text, block.id)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 shadow-sm ${copiedId === block.id ? 'bg-[#4D694E] text-[#FFF3D5]' : 'bg-white border border-[#4D694E]/20 text-[#4D694E] hover:bg-[#4D694E]/5'}`}>
                  <span>{copiedId === block.id ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 animate-in fade-in duration-500">
           <p className="text-[#4D694E]/60 font-medium">Ready for a new extraction.</p>
           <p className="text-[#4D694E]/40 text-sm mt-1">Drop an image above to start a session!</p>
        </div>
      )}

      {/* Delete Extraction Modal */}
      {blockToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Extraction?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Are you sure you want to delete this specific extraction from the thread? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setBlockToDelete(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteBlock}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};