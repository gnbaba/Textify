import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { arrayRemove, doc, updateDoc } from 'firebase/firestore';
import { AlertTriangle, FileText, Lock, X, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { db } from '../../../config/firebase';
import { useWorkspace } from '../../../shared/context/WorkspaceContext';
import { LoginModal } from '../../auth/components/LoginModal';
import { useAuth } from '../../auth/hooks/useAuth';
import { ExtractionBlock, useCloudHistory } from '../../history/hooks/useCloudHistory';
import { useOcrProcessor } from '../hooks/useOcrProcessor';
import { routingOcrService } from '../services/routingOcrService';
import type { ExtractionMode } from '../types/ocrTypes';
import { ExportModal } from './ExportModal';
import { ImageDropzone } from './ImageDropzone';
import { BlockCard, SortableBlock } from './SortableBlock';

// Decoded-pixel memory guard: downscale images > 16 MP to prevent mobile tab crashes
const enforceMaxImageResolution = async (file: File, maxPixels = 16_000_000): Promise<File> => {
  return new Promise((resolve) => {
    const tempUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = tempUrl;
    img.onload = () => {
      URL.revokeObjectURL(tempUrl);
      const currentPixels = img.naturalWidth * img.naturalHeight;
      if (currentPixels <= maxPixels) {
        resolve(file);
        return;
      }

      const scale = Math.sqrt(maxPixels / currentPixels);
      const targetWidth = Math.max(1, Math.floor(img.naturalWidth * scale));
      const targetHeight = Math.max(1, Math.floor(img.naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const downscaledFile = new File([blob], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(downscaledFile);
          } else {
            resolve(file);
          }
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        0.95
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      resolve(file);
    };
  });
};

export const OcrWorkspace: React.FC = () => {
  const { user } = useAuth();
  const { documents, createSession, addToSession } = useCloudHistory(user?.uid);
  const { status, text, progress, process, error } = useOcrProcessor(routingOcrService);
  const { activeDocument, setActiveDocument } = useWorkspace();

  const displayDocument = user
    ? activeDocument
      ? documents.find((d) => d.id === activeDocument.id) || null
      : null
    : activeDocument;

  const [mode, setMode] = useState<ExtractionMode>('document');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const lastSavedTextRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeDragBlock = displayDocument?.blocks.find((b) => b.id === activeDragId) || null;

  // Preprocessing and Crop Editor states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeImageSrc, setActiveImageSrc] = useState<string | null>(null);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragType: 'move' | 'nw' | 'ne' | 'se' | 'sw' | null;
    startX: number;
    startY: number;
    startCrop: { x: number; y: number; w: number; h: number };
    pointerId: number;
  } | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImgRef = useRef<HTMLImageElement | null>(null);

  // Centralized revocation of blob URLs across image replacements and unmount
  useEffect(() => {
    return () => {
      if (activeImageSrc?.startsWith('blob:')) {
        URL.revokeObjectURL(activeImageSrc);
      }
    };
  }, [activeImageSrc]);

  const handleCropPointerDown = (
    e: React.PointerEvent,
    type: 'move' | 'nw' | 'ne' | 'se' | 'sw'
  ) => {
    e.preventDefault();
    if (!sourceImgRef.current) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Fallback if setPointerCapture is unsupported
    }

    setDragState({
      isDragging: true,
      dragType: type,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...cropBox },
      pointerId: e.pointerId,
    });
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState || !dragState.isDragging || !sourceImgRef.current) return;

      const imgRect = sourceImgRef.current.getBoundingClientRect();
      if (imgRect.width === 0 || imgRect.height === 0) return;

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
        w = Math.max(5, Math.min(100 - x, newW));
        y = newY;
        h = Math.max(5, Math.min(100 - y, newH));
      } else if (dragState.dragType === 'ne') {
        w = Math.max(5, Math.min(100 - x, w + dx));
        const newY = Math.max(0, Math.min(y + h - 5, y + dy));
        const newH = h - (newY - y);
        y = newY;
        h = Math.max(5, Math.min(100 - y, newH));
      } else if (dragState.dragType === 'se') {
        w = Math.max(5, Math.min(100 - x, w + dx));
        h = Math.max(5, Math.min(100 - y, h + dy));
      } else if (dragState.dragType === 'sw') {
        const newX = Math.max(0, Math.min(x + w - 5, x + dx));
        const newW = w - (newX - x);
        x = newX;
        w = Math.max(5, Math.min(100 - x, newW));
        h = Math.max(5, Math.min(100 - y, h + dy));
      }

      setCropBox({ x, y, w, h });
    };

    const handlePointerEnd = () => {
      setDragState(null);
    };

    if (dragState?.isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerEnd);
      window.addEventListener('pointercancel', handlePointerEnd);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
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

      canvas.width = Math.max(1, Math.round(w));
      canvas.height = Math.max(1, Math.round(h));

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (mode === 'graphic') {
        ctx.filter = 'none';
      } else {
        ctx.filter = 'grayscale(100%) contrast(150%)';
      }
      ctx.drawImage(img, x, y, w, h, 0, 0, canvas.width, canvas.height);
    };

    if (img.complete) {
      updateCanvas();
    } else {
      img.onload = updateCanvas;
    }
  }, [activeImageSrc, cropBox, mode]);

  const handleImageSelected = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      alert('File is too large. Please keep images under 10MB.');
      return;
    }

    const safeFile = await enforceMaxImageResolution(file);
    setSelectedFile(safeFile);
    const objectUrl = URL.createObjectURL(safeFile);
    setActiveImageSrc(objectUrl);
    setCropBox({ x: 0, y: 0, w: 100, h: 100 });
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
      // 1. Crop image onto canvas with dual-dimension capped upscaling
      const img = sourceImgRef.current;
      const cropX = (cropBox.x / 100) * img.naturalWidth;
      const cropY = (cropBox.y / 100) * img.naturalHeight;
      const cropW = (cropBox.w / 100) * img.naturalWidth;
      const cropH = (cropBox.h / 100) * img.naturalHeight;

      let targetW = cropW;
      let targetH = cropH;

      if (cropW < 1200) {
        targetW = cropW * 2;
        targetH = cropH * 2;
      }

      // Enforce dual caps: max 2400px on the longest side AND <= 8_000_000 total pixels
      const longestSide = Math.max(targetW, targetH);
      if (longestSide > 2400) {
        const scale = 2400 / longestSide;
        targetW = targetW * scale;
        targetH = targetH * scale;
      }

      const totalPixels = targetW * targetH;
      if (totalPixels > 8_000_000) {
        const scale = Math.sqrt(8_000_000 / totalPixels);
        targetW = targetW * scale;
        targetH = targetH * scale;
      }

      targetW = Math.max(1, Math.round(targetW));
      targetH = Math.max(1, Math.round(targetH));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas 2D context for cropping.');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to generate cropped image.');
          setIsPreparing(false);
          setIsProcessing(false);
          return;
        }

        const croppedFile = new File([blob], selectedFile.name.replace(/\.[^/.]+$/, '') + '.png', {
          type: 'image/png',
          lastModified: Date.now(),
        });

        try {
          await process(croppedFile, mode);
          setActiveImageSrc(null);
          setSelectedFile(null);
        } catch (error) {
          console.error('Processing error:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          alert(`OCR FAILED: ${errorMessage}`);
        } finally {
          setIsPreparing(false);
          setTimeout(() => {
            setIsProcessing(false);
          }, 3000);
        }
      }, 'image/png');
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

      const safeId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString(36) + Math.random().toString(36).substring(2);

      try {
        if (displayDocument?.id) {
          if (user) {
            await addToSession(displayDocument.id, text);
          } else {
            setActiveDocument({
              ...displayDocument,
              blocks: [...displayDocument.blocks, { id: safeId, text, timestamp: Date.now() }],
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
              timestamp: Date.now(),
            });
          }
        }
      } catch (err) {
        console.error('Session creation failed:', err);
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
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
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
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]
    );
  };

  useEffect(() => {
    if (displayDocument) {
      const allBlockIds = displayDocument.blocks.map((b) => b.id);

      setSelectedBlockIds((prev) => {
        const existingSelections = prev.filter((id) => allBlockIds.includes(id));
        const newBlocks = allBlockIds.filter(
          (id) => !prev.includes(id) && !existingSelections.includes(id)
        );
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
          blocks: displayDocument.blocks.filter((b) => b.id !== blockToDelete.id),
        });
      }
    } catch (err) {
      console.error('Failed to delete block:', err);
    }
    setBlockToDelete(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;
    if (!displayDocument) return;

    const oldIndex = displayDocument.blocks.findIndex((block) => block.id === active.id);

    const newIndex = displayDocument.blocks.findIndex((block) => block.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newBlocks = arrayMove(displayDocument.blocks, oldIndex, newIndex);

    // Optimistic UI update for instant seamless reorder
    setActiveDocument({
      ...displayDocument,
      blocks: newBlocks,
    });

    try {
      if (user) {
        const documentRef = doc(db, 'users', user.uid, 'documents', displayDocument.id);
        await updateDoc(documentRef, { blocks: newBlocks });
      }
    } catch (err) {
      console.error('Reorder failed:', err);
    }
  };

  // Modern architectural telemetry diagnostics bootsplash
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[999] bg-[#F3EFE3] flex flex-col items-center justify-center p-6 text-[#20251F] font-mono-industrial">
        <div className="border border-[#20251F]/20 p-6 max-w-sm w-full bg-[#FFFDF7] shadow-drafting select-none">
          <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-[#20251F]/15">
            <div className="w-4 h-4 bg-[#214C3A]" />
            <span className="text-[10px] font-bold tracking-[0.16em] uppercase">
              TEXTIFY SYSTEMS v2.4
            </span>
          </div>
          <div className="space-y-1.5 text-[9px] font-bold text-[#20251F]/70 uppercase">
            <div>BOOTING CORE PROCESSOR... OK</div>
            <div>MOUNTING TESSERACT MODULES... OK</div>
            <div>ESTABLISHING SECURE PROTOCOLS... OK</div>
            <div className="animate-pulse text-[#214C3A]">INITIALIZING WORKSPACE INDEX...</div>
          </div>
          <div className="mt-5 h-1.5 bg-[#20251F]/10 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-[#214C3A] w-[60%] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto relative font-mono-industrial text-[#20251F]">
      <div className="mb-6 space-y-4 md:space-y-6">
        {/* Mode Selector Panel */}
        <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-0 bg-[#FFFDF7] border border-[#20251F]/20 p-1 shadow-drafting-sm">
          <div
            className={`flex items-center justify-between gap-2 px-4 py-2.5 md:py-2 flex-1 transition-all ${mode === 'document' ? 'bg-[#214C3A] text-[#FFFDF7]' : 'bg-transparent text-[#20251F]/70 hover:bg-[#20251F]/5'}`}
          >
            <button
              onClick={() => setMode('document')}
              disabled={isProcessing}
              className="text-xs font-bold uppercase tracking-wide flex-grow text-left disabled:opacity-50 cursor-pointer"
            >
              [ DOCUMENT MODE ]
            </button>
            <div className="group relative flex items-center justify-center w-4 h-4 border text-[9px] font-bold cursor-default select-none border-current">
              ?
              <div className="absolute bottom-full right-0 md:left-1/2 md:-translate-x-1/2 mb-3.5 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-[#20251F] text-[#FFFDF7] text-[9px] font-bold p-3 border border-[#20251F]/20 z-20 pointer-events-none text-left uppercase leading-normal tracking-wide shadow-drafting">
                Reads every scattered word. Optimized for receipts, forms, and layout analysis.
              </div>
            </div>
          </div>

          <div className="w-[1px] bg-[#20251F]/15 hidden md:block" />

          <div
            className={`flex items-center justify-between gap-2 px-4 py-2.5 md:py-2 flex-1 transition-all ${mode === 'graphic' ? 'bg-[#214C3A] text-[#FFFDF7]' : 'bg-transparent text-[#20251F]/70 hover:bg-[#20251F]/5'}`}
          >
            <button
              onClick={() => setMode('graphic')}
              disabled={isProcessing}
              className="text-xs font-bold uppercase tracking-wide flex-grow text-left disabled:opacity-50 cursor-pointer"
            >
              [ GRAPHIC MODE ]
            </button>
            <div className="group relative flex items-center justify-center w-4 h-4 border text-[9px] font-bold cursor-default select-none border-current">
              ?
              <div className="absolute bottom-full right-0 md:left-1/2 md:-translate-x-1/2 mb-3.5 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-[#20251F] text-[#FFFDF7] text-[9px] font-bold p-3 border border-[#20251F]/20 z-20 pointer-events-none text-left uppercase leading-normal tracking-wide shadow-drafting">
                Reads single blocks of text. Optimized for heavy logotypes, logos, and signages.
              </div>
            </div>
          </div>
        </div>

        {spamWarning && (
          <div className="w-full text-center mb-2 animate-pulse">
            <span className="inline-flex items-center gap-1.5 bg-[#E96C3F] text-white px-4 py-2 border border-[#E96C3F] text-[10px] font-bold uppercase tracking-wider shadow-drafting-sm">
              <AlertTriangle className="w-4 h-4" />
              COOL DOWN! WAIT A FEW SECONDS BETWEEN SCANS.
            </span>
          </div>
        )}

        {/* Preprocessing Crop Editor OR Dropzone */}
        {activeImageSrc ? (
          <div className="border border-[#20251F]/20 bg-[#FFFDF7] p-4 md:p-5 font-mono-industrial mb-6 shadow-drafting-sm">
            <h3 className="text-xs font-black uppercase tracking-wider mb-4 border-b border-[#20251F]/15 pb-2 text-[#20251F]">
              [ EXTRACTION ENGINE PREPROCESSING CONTROL ]
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column: Image Cropper */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold tracking-widest text-[#20251F]/60 uppercase">
                  RAW INPUT VIEW (DRAG HANDLES TO CROP)
                </span>
                <div
                  className="relative border border-[#20251F]/20 bg-black/5 overflow-hidden flex items-center justify-center select-none"
                  style={{ maxHeight: '350px' }}
                >
                  {/* Shrink-wrap container tightly around the rendered img bounds */}
                  <div className="relative inline-block leading-none">
                    <img
                      ref={sourceImgRef}
                      src={activeImageSrc}
                      alt="Source Crop"
                      className="block max-h-[350px] max-w-full w-auto h-auto object-contain pointer-events-none"
                    />
                    {/* Crop overlay positioned relative to the shrink-wrapped img */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${cropBox.x}%`,
                        top: `${cropBox.y}%`,
                        width: `${cropBox.w}%`,
                        height: `${cropBox.h}%`,
                        border: '2px dashed #214C3A',
                        boxShadow: '0 0 0 9999px rgba(32, 37, 31, 0.4)',
                      }}
                      className="cursor-move touch-none"
                      onPointerDown={(e) => handleCropPointerDown(e, 'move')}
                    >
                      {/* Resize handles with 28px touch hit area via padding around visual 12px square */}
                      <div
                        className="absolute -top-3.5 -left-3.5 w-7 h-7 flex items-center justify-center touch-none cursor-nwse-resize p-1"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          handleCropPointerDown(e, 'nw');
                        }}
                      >
                        <div className="w-3 h-3 bg-[#FFFDF7] border border-[#20251F]" />
                      </div>
                      <div
                        className="absolute -top-3.5 -right-3.5 w-7 h-7 flex items-center justify-center touch-none cursor-nesw-resize p-1"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          handleCropPointerDown(e, 'ne');
                        }}
                      >
                        <div className="w-3 h-3 bg-[#FFFDF7] border border-[#20251F]" />
                      </div>
                      <div
                        className="absolute -bottom-3.5 -left-3.5 w-7 h-7 flex items-center justify-center touch-none cursor-nesw-resize p-1"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          handleCropPointerDown(e, 'sw');
                        }}
                      >
                        <div className="w-3 h-3 bg-[#FFFDF7] border border-[#20251F]" />
                      </div>
                      <div
                        className="absolute -bottom-3.5 -right-3.5 w-7 h-7 flex items-center justify-center touch-none cursor-nwse-resize p-1"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          handleCropPointerDown(e, 'se');
                        }}
                      >
                        <div className="w-3 h-3 bg-[#FFFDF7] border border-[#20251F]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Preprocessed Live Telemetry Preview */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold tracking-widest text-[#20251F]/60 uppercase">
                  OCR LIVE ENGINE INPUT PREVIEW
                </span>
                <div className="border border-[#20251F]/20 bg-[#FFFDF7] flex items-center justify-center p-2 h-[350px] overflow-auto">
                  <canvas ref={previewCanvasRef} className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-end gap-3 border-t border-[#20251F]/15 pt-4 font-bold text-[10px] uppercase">
              <button
                onClick={() => {
                  setActiveImageSrc(null);
                  setSelectedFile(null);
                }}
                disabled={isProcessing}
                className="px-5 py-2.5 border border-[#20251F]/20 hover:border-[#20251F] hover:bg-[#20251F]/5 text-[#20251F] transition-colors cursor-pointer"
              >
                [ DISCARD / CANCEL ]
              </button>
              <button
                onClick={handleRunOcr}
                disabled={isProcessing}
                className="bg-[#214C3A] text-[#FFFDF7] px-6 py-2.5 border border-[#20251F]/20 hover:bg-[#183a2b] transition-all flex items-center gap-2 shadow-drafting-sm cursor-pointer"
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
            <span className="text-[10px] font-bold bg-[#20251F]/5 border border-[#20251F]/15 text-[#20251F]/70 px-4 py-1.5 uppercase tracking-widest">
              GUEST LIMIT: {Math.max(0, 10 - guestScansCount)} / 10 CYCLES
            </span>
          </div>
        )}

        {/* Progress bar */}
        {(status === 'loading' || isPreparing || isProcessing) && (
          <div className="w-full border border-[#20251F]/20 h-5 bg-[#FFFDF7] overflow-hidden relative shadow-drafting-sm">
            <div
              className="bg-[#214C3A] h-full transition-all duration-300 relative"
              style={{ width: `${progress > 0 ? progress : 8}%` }}
            >
              <div className="absolute inset-0 scanlines opacity-30" />
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-extrabold tracking-widest text-[#FFFDF7] mix-blend-difference uppercase">
              OCR ANALYSIS IN PROGRESS &bull; {Math.round(progress)}%
            </span>
          </div>
        )}

        {status === 'error' && error && (
          <div className="w-full bg-[#FFFDF7] border border-[#E96C3F] p-4 text-[#E96C3F] text-[10px] font-bold uppercase break-all shadow-drafting-sm">
            <span className="font-black tracking-wider block mb-1 text-xs">
              SCANNING TERMINATED
            </span>
            {error}
          </div>
        )}
      </div>

      {displayDocument ? (
        <div className="space-y-6 mt-8 border-t border-[#20251F]/15 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <h2 className="text-sm md:text-base font-extrabold text-[#20251F] truncate uppercase tracking-wide">
                {displayDocument.title}
              </h2>
              <span className="text-[8px] font-bold bg-[#214C3A] text-[#FFFDF7] px-2 py-1 tracking-widest uppercase flex-shrink-0">
                ACTIVE
              </span>
            </div>

            <button
              onClick={() => setIsExportModalOpen(true)}
              disabled={selectedBlockIds.length === 0}
              className="bg-[#214C3A] text-[#FFFDF7] px-5 py-2.5 md:py-2 border border-[#20251F]/20 font-bold text-[10px] tracking-wider uppercase hover:bg-[#183a2b] transition-all disabled:opacity-40 flex items-center justify-center gap-2 w-full md:w-auto shadow-drafting-sm cursor-pointer"
            >
              <FileText className="w-4 h-4" />[ EXPORT SELECTION ]
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveDragId(null)}
          >
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

            <DragOverlay
              dropAnimation={{
                duration: 200,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
              }}
            >
              {activeDragBlock ? (
                <BlockCard
                  id={activeDragBlock.id}
                  text={activeDragBlock.text}
                  isSelected={selectedBlockIds.includes(activeDragBlock.id)}
                  isCopied={copiedId === activeDragBlock.id}
                  isOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-[#20251F]/20 bg-[#FFFDF7]/60 select-none">
          <p className="text-[#20251F] font-extrabold text-xs uppercase tracking-widest">
            READY FOR DOCUMENT INGESTION
          </p>
          <p className="text-[#20251F]/60 text-[9px] font-bold uppercase tracking-wider mt-2">
            PASTE OR DROP AN IMAGE TO BEGIN CLIENT-SIDE EXTRACTION
          </p>
        </div>
      )}

      {/* Modal: Delete Block Confirmation */}
      {blockToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#20251F]/50 backdrop-blur-sm px-4">
          <div className="bg-[#FFFDF7] w-full max-w-sm border border-[#20251F] shadow-drafting-lg overflow-hidden">
            {/* Header bar */}
            <div className="bg-[#20251F] text-[#FFFDF7] px-4 py-2.5 flex items-center justify-between font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase">
              <span>[ CONFIRM PURGE ]</span>
              <button
                onClick={() => setBlockToDelete(null)}
                className="hover:text-[#E96C3F] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="font-extrabold text-[12px] uppercase tracking-wide mb-2 text-[#20251F]">
                PURGE EXTRACTION?
              </h3>
              <p className="text-[10px] font-semibold text-[#20251F]/70 mb-6 uppercase leading-relaxed tracking-[0.02em]">
                ARE YOU SURE YOU WANT TO DELETE THIS EXTRACTED BLOCK FROM THE LOG THREAD? THIS
                CANNOT BE UNDONE.
              </p>
              <div className="flex justify-end gap-2.5 font-mono-industrial text-[9px] font-bold uppercase">
                <button
                  onClick={() => setBlockToDelete(null)}
                  className="px-4 py-2 border border-[#20251F]/20 hover:border-[#20251F] text-[#20251F] transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmDeleteBlock}
                  className="px-4 py-2 bg-[#E96C3F] hover:bg-[#d55a2f] text-white transition-colors cursor-pointer shadow-drafting-sm"
                >
                  CONFIRM PURGE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Guest limit warning */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#20251F]/50 backdrop-blur-sm px-4">
          <div className="bg-[#FFFDF7] w-full max-w-md border border-[#20251F] shadow-drafting-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#20251F] text-[#FFFDF7] px-4 py-2.5 flex items-center justify-between font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase">
              <span>[ DATA LIMIT EXHAUSTED ]</span>
              <button
                onClick={() => setShowLimitModal(false)}
                className="hover:text-[#E96C3F] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="w-12 h-12 border border-[#20251F]/20 bg-[#F3EFE3] flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-[#20251F]" />
              </div>
              <h3 className="text-sm font-extrabold text-[#20251F] uppercase mb-2.5 tracking-wide">
                Daily Cycles Exhausted
              </h3>

              <p className="text-[#20251F]/70 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.02em] mb-6">
                YOU HAVE EXHAUSTED ALL 10 FREE SCAN CYCLES AS A GUEST USER. YOUR CYCLE CAP WILL
                NATURALLY RE-INITIALIZE IN 3 DAYS. SIGN IN TO ACCESS UNLIMITED CLOUD SCANS
                IMMEDIATELY.
              </p>
              <div className="flex flex-col gap-2.5 font-bold text-[9px] tracking-wide uppercase">
                <button
                  onClick={() => {
                    setShowLimitModal(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full bg-[#214C3A] text-[#FFFDF7] py-3.5 px-4 border border-[#20251F]/20 hover:bg-[#183a2b] transition-all flex items-center justify-center gap-2 shadow-drafting-sm cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  AUTHENTICATE WITH GOOGLE
                </button>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full text-[#20251F]/60 py-2.5 px-4 border border-[#20251F]/20 hover:border-[#20251F] transition-colors cursor-pointer"
                >
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
