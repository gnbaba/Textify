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
import { LoginModal } from '../../auth/components/LoginModal';
import { DndContext, DragEndEvent, closestCenter, } from '@dnd-kit/core';

import { SortableContext, verticalListSortingStrategy,arrayMove, } from '@dnd-kit/sortable';

import { SortableBlock } from './SortableBlock';

// Compresses image and applies fallback canvas to prevent mobile memory crashes
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1500;
        const MAX_HEIGHT = 1500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          if ('filter' in ctx) {
            try {
              ctx.filter = 'grayscale(100%) brightness(80%) contrast(200%)';
            } catch (e) {
              console.warn("Canvas filter gracefully skipped:", e);
            }
          }

          ctx.drawImage(img, 0, 0, width, height);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            resolve(file); 
          }
        }, 'image/jpeg', 0.8); 
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export const OcrWorkspace: React.FC = () => {
  const { user } = useAuth();
  const { documents, createSession, addToSession } = useCloudHistory(user?.uid);
  const { status, text, progress, process, error } = useOcrProcessor(tesseractOcrService);
  const { activeDocument, setActiveDocument } = useWorkspace();
  
  // Dynamically serves Cloud data for logged-in users, or Local data for guests
  const displayDocument = user ? (activeDocument ? documents.find(d => d.id === activeDocument.id) || null : null) : activeDocument;
  
  const [mode, setMode] = useState<ExtractionMode>('document');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const lastSavedTextRef = useRef<string | null>(null);

  const [blockToDelete, setBlockToDelete] = useState<ExtractionBlock | null>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  
  const [guestScansCount, setGuestScansCount] = useState<number>(0);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  // Manages 3-day cooldown timer for guest limits
  const checkAndResetCooldown = () => {
    const exhaustedDateStr = localStorage.getItem('textify_exhausted_date');
    if (exhaustedDateStr) {
      const exhaustedDate = parseInt(exhaustedDateStr, 10);
      const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
      
      if (Date.now() - exhaustedDate >= THREE_DAYS_MS) {
        localStorage.setItem('textify_guest_scans', '0');
        localStorage.removeItem('textify_exhausted_date');
        setGuestScansCount(0);
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (!user) {
      checkAndResetCooldown();
      const savedScans = parseInt(localStorage.getItem('textify_guest_scans') || '0', 10);
      setGuestScansCount(savedScans);
    }
  }, [user]);

  // Captures OCR result and routes it to Cloud or Local storage
  useEffect(() => {
    const triggerCatcher = async () => {
      if (status !== 'success' || !text) return;
      if (text === lastSavedTextRef.current) return;
      
      lastSavedTextRef.current = text;

      const safeId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);

      try {
        if (displayDocument?.id) {
          if (user) {
            await addToSession(displayDocument.id, text);
          } else {
            setActiveDocument({ 
              ...displayDocument, 
              blocks: [...displayDocument.blocks, { id: safeId, text, timestamp: Date.now() }] 
            });
          }
        } else {
          const title = mode === 'document' ? 'Document Scan' : 'Graphic Scan';
          
          if (user) {
            const newDoc = await createSession(text, title);
            if (newDoc) setActiveDocument(newDoc);
          } else {
            setActiveDocument({
              id: 'guest_session_' + Date.now(),
              title: title,
              blocks: [{ id: safeId, text, timestamp: Date.now() }],
              timestamp: Date.now()
            });
          }
        }
      } catch (err) {
        console.error("Session creation failed:", err);
      }
    };

    triggerCatcher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, text, mode, displayDocument?.id, user]);

  const handleCopyText = async (textToCopy: string, blockId: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed"; 
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(blockId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleToggleSelect = (blockId: string) => {
    setSelectedBlockIds((prev) => 
      prev.includes(blockId) 
        ? prev.filter(id => id !== blockId) 
        : [...prev, blockId]
    );
  };

  useEffect(() => {
    if (displayDocument) {
      const allBlockIds = displayDocument.blocks.map(b => b.id);
      
      setSelectedBlockIds((prev) => {
        const existingSelections = prev.filter(id => allBlockIds.includes(id));
        const newBlocks = allBlockIds.filter(id => !prev.includes(id) && !existingSelections.includes(id));
        return [...existingSelections, ...newBlocks]; 
      });
    } else {
      setSelectedBlockIds([]);
    }
  }, [displayDocument]); 

  // Deletes block from Cloud if logged in, or Local state if guest
  const confirmDeleteBlock = async () => {
    if (!displayDocument || !blockToDelete) return;
    try {
      if (user) {
        const documentRef = doc(db, 'users', user.uid, 'documents', displayDocument.id);
        await updateDoc(documentRef, { blocks: arrayRemove(blockToDelete) });
      } else {
        setActiveDocument({
          ...displayDocument,
          blocks: displayDocument.blocks.filter(b => b.id !== blockToDelete.id)
        });
      }
    } catch (err) {
        console.error('Failed to delete block:', err);
    }
    setBlockToDelete(null);
  };

  const handleProcessImage = async (file: File) => {
    if (status === 'loading' || isPreparing) return;
    setIsPreparing(true);
    lastSavedTextRef.current = '';

    if (!user) {
      checkAndResetCooldown();
      const currentScans = parseInt(localStorage.getItem('textify_guest_scans') || '0', 10);
      
      if (currentScans >= 10) {
        setShowLimitModal(true);
        setIsPreparing(false);
        return; 
      }
      
      const newCount = currentScans + 1;
      localStorage.setItem('textify_guest_scans', newCount.toString());
      setGuestScansCount(newCount);

      if (newCount === 10) {
        localStorage.setItem('textify_exhausted_date', Date.now().toString());
      }
    }

    try {
      const safeFile = await compressImage(file);
      await process(safeFile, mode);
    } catch (error) {
      console.error("Processing error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`OCR FAILED: ${errorMessage}`);
    } finally {
      setIsPreparing(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
  
    if (!over || active.id === over.id) return;
    if (!displayDocument) return;
  
    const oldIndex = displayDocument.blocks.findIndex(
      (block) => block.id === active.id
    );
  
    const newIndex = displayDocument.blocks.findIndex(
      (block) => block.id === over.id
    );
  
    if (oldIndex === -1 || newIndex === -1) return;
  
    const newBlocks = arrayMove(displayDocument.blocks, oldIndex, newIndex);
  
    try {
      if (user) {
        const documentRef = doc(db, 'users', user.uid, 'documents', displayDocument.id);
        await updateDoc(documentRef, { blocks: newBlocks });
      } else {
        setActiveDocument({
          ...displayDocument,
          blocks: newBlocks,
        });
      }
    } catch (err) {
      console.error('Reorder failed:', err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative px-4 md:px-0">
      <div className="mb-6 space-y-4 md:space-y-6">
        
        <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-1 md:bg-[#FFF3D5] md:p-1.5 md:rounded-xl md:shadow-sm md:border md:border-[#4D694E]/20">
          <div className={`flex items-center gap-2 px-5 py-4 md:py-2 rounded-xl md:rounded-lg transition-all border md:border-none ${mode === 'document' ? 'bg-[#4D694E] text-white shadow-md border-[#4D694E]' : 'bg-white md:bg-transparent text-[#4D694E] hover:bg-[#4D694E]/10 border-[#4D694E]/20'}`}>
            <button onClick={() => setMode('document')} className="text-base md:text-sm font-semibold flex-grow text-left">
              Document Mode
            </button>
            <button type="button" className={`group relative flex items-center justify-center w-6 h-6 md:w-5 md:h-5 rounded-full border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white/50 ${mode === 'document' ? 'border-white/40 text-white/80' : 'border-[#4D694E]/40 text-[#4D694E]/70'}`}>
              i
              <div className="absolute bottom-full right-0 md:left-1/2 md:-translate-x-1/2 mb-3 w-56 md:w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible transition-all duration-200 bg-[#4D694E] text-[#FFF3D5] text-xs p-3 md:p-2.5 rounded-lg shadow-xl z-20 pointer-events-none text-left md:text-center font-normal leading-relaxed">
                Reads every scattered word. Best for receipts, posters, and standard documents.
                <div className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4D694E]"></div>
              </div>
            </button>
          </div>

          <div className={`flex items-center gap-2 px-5 py-4 md:py-2 rounded-xl md:rounded-lg transition-all border md:border-none ${mode === 'graphic' ? 'bg-[#4D694E] text-white shadow-md border-[#4D694E]' : 'bg-white md:bg-transparent text-[#4D694E] hover:bg-[#4D694E]/10 border-[#4D694E]/20'}`}>
            <button onClick={() => setMode('graphic')} className="text-base md:text-sm font-semibold flex-grow text-left">
              Graphic Mode
            </button>
            <button type="button" className={`group relative flex items-center justify-center w-6 h-6 md:w-5 md:h-5 rounded-full border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white/50 ${mode === 'graphic' ? 'border-white/40 text-white/80' : 'border-[#4D694E]/40 text-[#4D694E]/70'}`}>
              i
              <div className="absolute bottom-full right-0 md:left-1/2 md:-translate-x-1/2 mb-3 w-56 md:w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible transition-all duration-200 bg-[#4D694E] text-[#FFF3D5] text-xs p-3 md:p-2.5 rounded-lg shadow-xl z-20 pointer-events-none text-left md:text-center font-normal leading-relaxed">
                Reads single blocks of text. Best for heavily stylized logos and graphics.
                <div className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4D694E]"></div>
              </div>
            </button>
          </div>
        </div>

        <ImageDropzone onImageCaptured={handleProcessImage} />

        {!user && (
          <div className="text-center mt-2">
            <span className="text-xs font-bold bg-[#4D694E]/10 text-[#4D694E] px-4 py-2 rounded-full inline-block">
              Guest Scans Remaining: {Math.max(0, 10 - guestScansCount)} / 10
            </span>
          </div>
        )}

        {(status === 'loading' || isPreparing) && (
          <div className="w-full bg-[#4D694E]/20 rounded-full h-3 overflow-hidden">
            <div className="bg-[#4D694E] h-3 transition-all duration-300" style={{ width: `${progress > 0 ? progress : 5}%` }} />
          </div>
        )}

        {status === 'error' && error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-mono break-all animate-in fade-in duration-300 shadow-sm">
            <span className="font-bold uppercase text-xs tracking-wider block mb-1">Processing Failed</span>
            {error}
          </div>
        )}
      </div>

      {displayDocument ? (
        <div className="space-y-6 mt-8 border-t border-[#4D694E]/10 pt-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
             <h2 className="text-xl md:text-2xl font-extrabold text-[#4D694E] truncate pr-4">{displayDocument.title}</h2>
             <span className="text-xs font-bold bg-[#4D694E]/10 text-[#4D694E] px-3 py-1.5 rounded-full self-start md:self-auto whitespace-nowrap">Active Session</span>
          </div>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={displayDocument.blocks.map((block) => block.id)}
              strategy={verticalListSortingStrategy}
            >
                {displayDocument.blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    id={block.id}
                    text={block.text}
                    onCopy={handleCopyText}
                    onDelete={() => setBlockToDelete(block)}
                    isCopied={copiedId === block.id}
                    isSelected={selectedBlockIds.includes(block.id)}
                    onToggleSelect={() => handleToggleSelect(block.id)}
                  />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className="text-center py-12 px-4 animate-in fade-in duration-500">
           <p className="text-[#4D694E]/60 font-medium text-lg">Ready for a new extraction.</p>
           <p className="text-[#4D694E]/40 text-sm mt-2">Tap the area above to start scanning!</p>
        </div>
      )}

      {blockToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Extraction?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Are you sure you want to delete this specific extraction from the thread? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setBlockToDelete(null)} className="px-5 py-3 md:py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button onClick={confirmDeleteBlock} className="px-5 py-3 md:py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200 px-4">
          <div className="bg-[#FFF3D5] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-[#4D694E]/20">
            <div className="p-6 md:p-8 text-center">
              <div className="w-16 h-16 bg-[#4D694E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#4D694E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-[#4D694E] mb-2 tracking-tight">Daily Limit Reached</h3>

              <p className="text-[#4D694E]/80 mb-8 leading-relaxed font-medium text-sm md:text-base">
                You've used all 10 of your free guest scans! Your limits will naturally reset in 3 days, or you can sign in right now to unlock infinite cloud access.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowLimitModal(false);
                    setIsLoginModalOpen(true);
                  }} 
                  className="w-full bg-[#4D694E] text-[#FFF3D5] py-3.5 px-4 rounded-xl font-bold text-base hover:bg-[#3a4f3b] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Sign in with Google
                </button>
                <button onClick={() => setShowLimitModal(false)} className="w-full text-[#4D694E]/70 py-3 px-4 rounded-xl font-bold text-sm hover:bg-[#4D694E]/5 transition-colors">
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};