import React, { useState, useEffect, useRef } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { useOcrProcessor } from '../hooks/useOcrProcessor';
import { routingOcrService } from '../services/routingOcrService';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCloudHistory, ExtractionBlock } from '../../history/hooks/useCloudHistory';
import { useWorkspace } from '../../../shared/context/WorkspaceContext';
import type { ExtractionMode } from '../types/ocrTypes';
import { OpenCVPreprocessorService } from '../services/opencvPreprocessorService';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { LoginModal } from '../../auth/components/LoginModal';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableBlock } from './SortableBlock';
import { ExportModal } from './ExportModal';
import { Warning, X, LockKey, Lightning, FileText } from '@phosphor-icons/react';

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
        }, 'image/jpeg', 0.95); 
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export const OcrWorkspace: React.FC = () => {
  const { user } = useAuth();
  const { documents, createSession, addToSession } = useCloudHistory(user?.uid);
  const { status, text, progress, process, error } = useOcrProcessor(routingOcrService);
  const { activeDocument, setActiveDocument } = useWorkspace();
  
  const displayDocument = user ? (activeDocument ? documents.find(d => d.id === activeDocument.id) || null : null) : activeDocument;
  
  const [mode, setMode] = useState<ExtractionMode>('document');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const lastSavedTextRef = useRef<string | null>(null);

  // Preprocessing and Crop Editor states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeImageSrc, setActiveImageSrc] = useState<string | null>(null);
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragType: 'move' | 'nw' | 'ne' | 'se' | 'sw' | null;
    startX: number;
    startY: number;
    startCrop: { x: number; y: number; w: number; h: number };
  } | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImgRef = useRef<HTMLImageElement | null>(null);

  const handleCropMouseDown = (e: React.MouseEvent, type: 'move' | 'nw' | 'ne' | 'se' | 'sw') => {
    e.preventDefault();
    if (!sourceImgRef.current) return;

    setDragState({
      isDragging: true,
      dragType: type,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...cropBox },
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState || !dragState.isDragging || !sourceImgRef.current) return;

      const imgRect = sourceImgRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragState.startX) / imgRect.width) * 100;
      const dy = ((e.clientY - dragState.startY) / imgRect.height) * 100;

      let { x, y, w, h } = dragState.startCrop;

      if (dragState.dragType === 'move') {
        x = Math.max(0, Math.min(100 - w, x + dx));
        y = Math.max(0, Math.min(100 - h, y + dy));
      } else if (dragState.dragType === 'nw') {
        const newX = Math.max(0, Math.min(x + w - 5, x + dx));
        const newW = w - (newX - x);
        const newY = Math.max(0, Math.min(y + h - 5, y + dy));
        const newH = h - (newY - y);
        x = newX;
        w = newW;
        y = newY;
        h = newH;
      } else if (dragState.dragType === 'ne') {
        w = Math.max(5, Math.min(100 - x, w + dx));
        const newY = Math.max(0, Math.min(y + h - 5, y + dy));
        const newH = h - (newY - y);
        y = newY;
        h = newH;
      } else if (dragState.dragType === 'se') {
        w = Math.max(5, Math.min(100 - x, w + dx));
        h = Math.max(5, Math.min(100 - y, h + dy));
      } else if (dragState.dragType === 'sw') {
        const newX = Math.max(0, Math.min(x + w - 5, x + dx));
        const newW = w - (newX - x);
        x = newX;
        w = newW;
        h = Math.max(5, Math.min(100 - y, h + dy));
      }

      setCropBox({ x, y, w, h });
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    if (dragState?.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState]);

  // Real-time canvas telemetry rendering
  useEffect(() => {
    if (!activeImageSrc || !previewCanvasRef.current || !sourceImgRef.current) return;

    const img = sourceImgRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvas = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;

      const x = (cropBox.x / 100) * img.naturalWidth;
      const y = (cropBox.y / 100) * img.naturalHeight;
      const w = (cropBox.w / 100) * img.naturalWidth;
      const h = (cropBox.h / 100) * img.naturalHeight;

      canvas.width = w;
      canvas.height = h;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);

      if (mode === 'graphic') {
        ctx.filter = 'none';
        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
        return;
      }

      const cv = window.cv;
      if (cv && cv.Mat) {
        try {
          ctx.filter = 'none';
          ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
          OpenCVPreprocessorService.preprocess(canvas, {
            preset: 'document',
            brightness: 80,
            contrast: 200,
            thresholdMode: 'adaptive',
            deskew: true
          });
        } catch (err) {
          console.error('OpenCV preview generation failed:', err);
        }
      } else {
        // CSS Canvas Filter Fallback
        if ('filter' in ctx) {
          try {
            ctx.filter = 'grayscale(100%) brightness(80%) contrast(200%)';
          } catch (e) {
            console.warn('Canvas preview filter failed:', e);
          }
        }
        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
      }
    };

    if (img.complete) {
      updateCanvas();
    } else {
      img.onload = updateCanvas;
    }
  }, [
    activeImageSrc,
    cropBox,
    mode
  ]);

  const handleImageSelected = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
      return; 
    }

    const maxSizeInBytes = 10 * 1024 * 1024; 
    if (file.size > maxSizeInBytes) {
      alert("File is too large. Please keep images under 10MB.");
      return; 
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setActiveImageSrc(event.target?.result as string);
      setCropBox({ x: 10, y: 10, w: 80, h: 80 });
    };
    reader.readAsDataURL(file);
  };

  const handleRunOcr = async () => {
    if (!selectedFile || !activeImageSrc || !sourceImgRef.current) return;

    if (status === 'loading' || isPreparing || isProcessing) {
      setSpamWarning(true);
      setTimeout(() => setSpamWarning(false), 2500);
      return;
    }

    setIsPreparing(true);
    setIsProcessing(true);
    lastSavedTextRef.current = '';

    if (!user) {
      checkAndResetCooldown();
      const currentScans = parseInt(localStorage.getItem('textify_guest_scans') || '0', 10);
      
      if (currentScans >= 10) {
        setShowLimitModal(true);
        setIsPreparing(false);
        setIsProcessing(false);
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
      // 1. Crop image onto canvas
      const img = sourceImgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas 2D context for cropping.');

      const x = (cropBox.x / 100) * img.naturalWidth;
      const y = (cropBox.y / 100) * img.naturalHeight;
      const w = (cropBox.w / 100) * img.naturalWidth;
      const h = (cropBox.h / 100) * img.naturalHeight;

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to generate cropped image.');
          setIsPreparing(false);
          setIsProcessing(false);
          return;
        }

        const croppedFile = new File([blob], selectedFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        try {
          const safeFile = await compressImage(croppedFile);
          await process(safeFile, mode);
          setActiveImageSrc(null);
          setSelectedFile(null);
        } catch (error) {
          console.error("Processing error:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          alert(`OCR FAILED: ${errorMessage}`);
        } finally {
          setIsPreparing(false);
          setTimeout(() => {
            setIsProcessing(false);
          }, 3000);
        }
      }, 'image/jpeg', 0.95);

    } catch (error) {
      console.error('Cropping and processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`OCR FAILED: ${errorMessage}`);
      setIsPreparing(false);
      setIsProcessing(false);
    }
  };

  const [blockToDelete, setBlockToDelete] = useState<ExtractionBlock | null>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const [guestScansCount, setGuestScansCount] = useState<number>(0);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [spamWarning, setSpamWarning] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);

    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    
    window.addEventListener('popstate', handlePopState);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

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



  // Modern Neo-Brutalist telemetry diagnostics bootsplash
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[999] bg-[#FFF3D5] flex flex-col items-center justify-center p-6 text-[#4D694E] font-mono-industrial">
        <div className="border-2 border-[#4D694E] p-6 max-w-sm w-full bg-[#FFF3D5] shadow-[6px_6px_0px_0px_#4D694E] select-none">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#4D694E]/20">
            <div className="w-5 h-5 bg-[#4D694E]" />
            <span className="text-[10px] font-bold tracking-widest uppercase">TEXTIFY SYSTEMS v2.4</span>
          </div>
          <div className="space-y-1.5 text-[9px] font-bold text-[#4D694E]/70 uppercase">
            <div>BOOTING CORE PROCESSOR... OK</div>
            <div>MOUNTING TESSERACT MODULES... OK</div>
            <div>ESTABLISHING SECURE PROTOCOLS... OK</div>
            <div className="animate-pulse text-[#4D694E]">INITIALIZING WORKSPACE INDEX...</div>
          </div>
          <div className="mt-5 h-1.5 bg-[#4D694E]/10 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-[#4D694E] w-[60%] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto relative px-4 md:px-0 font-mono-industrial text-[#4D694E]">
      <div className="mb-6 space-y-4 md:space-y-6">
        
        {/* Mode Selector Panel */}
        <div className="flex flex-col md:flex-row justify-center gap-2.5 md:gap-0 bg-[#FFF3D5] border-2 border-[#4D694E] p-1">
          <div className={`flex items-center justify-between gap-2 px-4 py-3 md:py-2 flex-1 transition-all ${mode === 'document' ? 'bg-[#4D694E] text-[#FFF3D5]' : 'bg-transparent text-[#4D694E] hover:bg-[#4D694E]/10'}`}>
            <button onClick={() => setMode('document')} disabled={isProcessing} className="text-xs font-bold uppercase tracking-wide flex-grow text-left disabled:opacity-50">
              [ DOCUMENT MODE ]
            </button>
            <div className="group relative flex items-center justify-center w-5 h-5 border text-[9px] font-bold cursor-default select-none border-current">
              ?
              <div className="absolute bottom-full right-0 md:left-1/2 md:-translate-x-1/2 mb-3.5 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-[#4D694E] text-[#FFF3D5] text-[9px] font-bold p-3 border border-[#FFF3D5]/20 z-20 pointer-events-none text-left uppercase leading-normal tracking-wide">
                Reads every scattered word. Optimized for receipts, forms, and layout analysis.
              </div>
            </div>
          </div>

          <div className="w-[2px] bg-[#4D694E] hidden md:block" />

          <div className={`flex items-center justify-between gap-2 px-4 py-3 md:py-2 flex-1 transition-all ${mode === 'graphic' ? 'bg-[#4D694E] text-[#FFF3D5]' : 'bg-transparent text-[#4D694E] hover:bg-[#4D694E]/10'}`}>
            <button onClick={() => setMode('graphic')} disabled={isProcessing} className="text-xs font-bold uppercase tracking-wide flex-grow text-left disabled:opacity-50">
              [ GRAPHIC MODE ]
            </button>
            <div className="group relative flex items-center justify-center w-5 h-5 border text-[9px] font-bold cursor-default select-none border-current">
              ?
              <div className="absolute bottom-full right-0 md:left-1/2 md:-translate-x-1/2 mb-3.5 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-[#4D694E] text-[#FFF3D5] text-[9px] font-bold p-3 border border-[#FFF3D5]/20 z-20 pointer-events-none text-left uppercase leading-normal tracking-wide">
                Reads single blocks of text. Optimized for heavy logotypes, logos, and signages.
              </div>
            </div>
          </div>
        </div>

        {spamWarning && (
          <div className="w-full text-center mb-2 animate-pulse">
            <span className="inline-flex items-center gap-1.5 bg-[#4D694E] text-[#FFF3D5] px-4 py-2 border-2 border-[#4D694E] text-[10px] font-bold uppercase tracking-wider">
              <Warning className="w-4 h-4" weight="bold" />
              COOL DOWN! WAIT A FEW SECONDS BETWEEN SCANS.
            </span>
          </div>
        )}

        {/* Preprocessing Crop Editor OR Dropzone */}
        {activeImageSrc ? (
          <div className="border-2 border-[#4D694E] bg-white p-4 font-mono-industrial mb-6 shadow-[4px_4px_0px_0px_#4D694E]">
            <h3 className="text-xs font-black uppercase tracking-wider mb-4 border-b border-[#4D694E]/20 pb-2">
              [ EXTRACTION ENGINE PREPROCESSING CONTROL ]
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column: Image Cropper */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold tracking-widest text-[#4D694E]/60 uppercase">
                  RAW INPUT VIEW (DRAG HANDLES TO CROP)
                </span>
                <div className="relative border-2 border-[#4D694E] bg-black/5 overflow-hidden flex items-center justify-center select-none" style={{ maxHeight: '350px' }}>
                  <img
                    ref={sourceImgRef}
                    src={activeImageSrc}
                    alt="Source Crop"
                    className="max-w-full max-h-[350px] object-contain pointer-events-none"
                    onLoad={() => {
                      // Trigger a render update once image is loaded
                      setCropBox(prev => ({ ...prev }));
                    }}
                  />
                  {/* Cropping box overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${cropBox.x}%`,
                      top: `${cropBox.y}%`,
                      width: `${cropBox.w}%`,
                      height: `${cropBox.h}%`,
                      border: '2px dashed #4D694E',
                      boxShadow: '0 0 0 9999px rgba(77, 105, 78, 0.3)',
                    }}
                    className="cursor-move"
                    onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                  >
                    {/* Handles */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#FFF3D5] border-2 border-[#4D694E] cursor-nwse-resize" onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'nw'); }} />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#FFF3D5] border-2 border-[#4D694E] cursor-nesw-resize" onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'ne'); }} />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#FFF3D5] border-2 border-[#4D694E] cursor-nesw-resize" onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'sw'); }} />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#FFF3D5] border-2 border-[#4D694E] cursor-nwse-resize" onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'se'); }} />
                  </div>
                </div>
              </div>

              {/* Right Column: Preprocessed Live Telemetry Preview */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold tracking-widest text-[#4D694E]/60 uppercase">
                  OCR LIVE ENGINE INPUT PREVIEW
                </span>
                <div className="border-2 border-[#4D694E] bg-white flex items-center justify-center p-2 h-[350px] overflow-auto">
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>



            {/* Actions Bar */}
            <div className="flex justify-end gap-3 border-t border-[#4D694E]/20 pt-4 font-bold text-[10px] uppercase">
              <button
                onClick={() => {
                  setActiveImageSrc(null);
                  setSelectedFile(null);
                }}
                disabled={isProcessing}
                className="px-5 py-2.5 border border-[#4D694E]/30 hover:border-[#4D694E] transition-colors"
              >
                [ DISCARD / CANCEL ]
              </button>
              <button
                onClick={handleRunOcr}
                disabled={isProcessing}
                className="bg-[#4D694E] text-[#FFF3D5] px-6 py-2.5 border-2 border-[#4D694E] hover:bg-[#3a4f3b] transition-all flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(77,105,78,0.4)]"
              >
                [ RUN EXTRACTION PROTOCOL ]
              </button>
            </div>
          </div>
        ) : (
          <div className={isProcessing ? 'opacity-50 pointer-events-none' : ''}>
            <ImageDropzone onImageCaptured={handleImageSelected} />
          </div>
        )}

        {!user && (
          <div className="text-center mt-2">
            <span className="text-[10px] font-bold bg-[#4D694E]/10 border border-[#4D694E]/20 text-[#4D694E] px-4 py-1.5 uppercase tracking-widest">
              GUEST LIMIT: {Math.max(0, 10 - guestScansCount)} / 10 CYCLES
            </span>
          </div>
        )}

        {/* Progress bar */}
        {(status === 'loading' || isPreparing || isProcessing) && (
          <div className="w-full border-2 border-[#4D694E] h-4 bg-[#FFF3D5]/50 overflow-hidden relative">
            <div className="bg-[#4D694E] h-full transition-all duration-300 relative" style={{ width: `${progress > 0 ? progress : 8}%` }}>
              <div className="absolute inset-0 scanlines opacity-50" />
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-extrabold tracking-widest text-current mix-blend-difference">
              OCR ANALYSIS IN PROGRESS /// {Math.round(progress)}%
            </span>
          </div>
        )}

        {status === 'error' && error && (
          <div className="w-full bg-[#FFF3D5] border-2 border-red-700 p-4 text-red-700 text-[10px] font-bold uppercase break-all shadow-[4px_4px_0px_0px_#B91C1C]">
            <span className="font-black tracking-wider block mb-1 text-xs">!!! SCANNING TERMINATED !!!</span>
            {error}
          </div>
        )}
      </div>

      {displayDocument ? (
        <div className="space-y-6 mt-8 border-t-2 border-[#4D694E] pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
 
             <div className="flex items-center gap-3 min-w-0">
               <h2 className="text-sm md:text-base font-extrabold text-[#4D694E] truncate uppercase tracking-wide">&gt;&gt;&gt; {displayDocument.title}</h2>
               <span className="text-[8px] font-bold bg-[#4D694E] text-[#FFF3D5] px-2 py-1 tracking-widest uppercase flex-shrink-0">ACTIVE</span>
             </div>

             <button 
               onClick={() => setIsExportModalOpen(true)}
               disabled={selectedBlockIds.length === 0}
               className="bg-[#4D694E] text-[#FFF3D5] px-5 py-2.5 md:py-2 border-2 border-[#4D694E] font-bold text-[10px] tracking-wider uppercase hover:bg-[#3a4f3b] transition-all disabled:opacity-40 flex items-center justify-center gap-2 w-full md:w-auto"
             >
               <FileText className="w-4 h-4" weight="bold" />
               [ EXPORT SELECTION ]
             </button>
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
        <div className="text-center py-14 border-2 border-dashed border-[#4D694E] bg-[#FFF3D5]/20 select-none">
           <p className="text-[#4D694E] font-extrabold text-xs uppercase tracking-widest">--- READY FOR EXTRACTION PROTOCOL ---</p>
           <p className="text-[#4D694E]/60 text-[9px] font-bold uppercase tracking-wider mt-2.5">PASTE OR DROP AN IMAGE TO INITIALIZE RAW STREAM</p>
        </div>
      )}

      {/* Modal: Delete Block Confirmation */}
      {blockToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4D694E]/40 px-4">
          <div className="bg-[#FFF3D5] w-full max-w-sm border-2 border-[#4D694E] overflow-hidden">
            {/* Header bar */}
            <div className="bg-[#4D694E] text-[#FFF3D5] px-4 py-2 flex items-center justify-between font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase">
              <span>&lt; WARNING // DELETION &gt;</span>
              <button onClick={() => setBlockToDelete(null)} className="hover:text-[#FFF3D5]/70">
                <X className="w-3.5 h-3.5" weight="bold" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="font-extrabold text-[12px] uppercase tracking-wide mb-2 text-[#4D694E]">PURGE EXTRACTION?</h3>
              <p className="text-[10px] font-semibold text-[#4D694E]/70 mb-6 uppercase leading-relaxed tracking-[0.02em]">
                ARE YOU SURE YOU WANT TO DELETE THIS EXTRACTED BLOCK FROM THE LOG THREAD? THIS CANNOT BE UNDONE.
              </p>
              <div className="flex justify-end gap-2.5 font-mono-industrial text-[9px] font-bold uppercase">
                <button onClick={() => setBlockToDelete(null)} className="px-4 py-2 border border-[#4D694E]/30 hover:border-[#4D694E] transition-colors">
                  CANCEL
                </button>
                <button onClick={confirmDeleteBlock} className="px-4 py-2 border-2 border-[#4D694E] bg-red-700 text-white hover:bg-red-800 transition-colors">
                  PURGE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Guest limit warning */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4D694E]/50 px-4">
          <div className="bg-[#FFF3D5] w-full max-w-md border-2 border-[#4D694E] overflow-hidden">
            
            {/* Header */}
            <div className="bg-[#4D694E] text-[#FFF3D5] px-4 py-2.5 flex items-center justify-between font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase">
              <span>&lt; SYSTEM ALERT // DATA LIMIT EXHAUSTED &gt;</span>
              <button onClick={() => setShowLimitModal(false)} className="hover:text-[#FFF3D5]/70">
                <X className="w-3.5 h-3.5" weight="bold" />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="w-12 h-12 border-2 border-[#4D694E] bg-[#FFF3D5] flex items-center justify-center mx-auto mb-4">
                <LockKey className="w-6 h-6 text-[#4D694E]" weight="bold" />
              </div>
              <h3 className="text-sm font-extrabold text-[#4D694E] uppercase mb-2.5 tracking-wide">Daily Cycles Exhausted</h3>

              <p className="text-[#4D694E]/70 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.02em] mb-6">
                YOU HAVE EXHAUSTED ALL 10 FREE SCAN CYCLES AS A GUEST USER. YOUR CYCLE CAP WILL NATURALLY RE-INITIALIZE IN 3 DAYS. SIGN IN TO ACCESS UNLIMITED CLOUD SCANS IMMEDIATELY.
              </p>
              <div className="flex flex-col gap-2.5 font-bold text-[9px] tracking-wide uppercase">
                <button 
                  onClick={() => {
                    setShowLimitModal(false);
                    setIsLoginModalOpen(true);
                  }} 
                  className="w-full bg-[#4D694E] text-[#FFF3D5] py-3.5 px-4 border-2 border-[#4D694E] hover:bg-[#3a4f3b] transition-all flex items-center justify-center gap-2"
                >
                  <Lightning className="w-4 h-4" weight="fill" />
                  AUTHENTICATE WITH GOOGLE
                </button>
                <button onClick={() => setShowLimitModal(false)} className="w-full text-[#4D694E]/60 py-2.5 px-4 border border-[#4D694E]/20 hover:border-[#4D694E] transition-colors">
                  CLOSE PANEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      
      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        blocks={displayDocument ? displayDocument.blocks : []}
        selectedIds={selectedBlockIds}
        documentTitle={displayDocument ? displayDocument.title : 'Textify Document'}
      />
    </div>
  );
};