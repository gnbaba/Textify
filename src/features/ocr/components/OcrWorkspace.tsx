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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../../../config/firebase';
import { useWorkspace } from '../../../shared/context/WorkspaceContext';
import { LoginModal } from '../../auth/components/LoginModal';
import { useAuth } from '../../auth/hooks/useAuth';
import { type CloudDocument, type ExtractionBlock } from '../../history/hooks/useCloudHistory';
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

interface PendingBlock extends ExtractionBlock {
  docId: string;
  order: number;
  documentTitle: string;
  syncStatus: 'pending' | 'failed';
  isParentSynced: boolean;
  syncError?: string;
}

const toExtractionBlock = (block: PendingBlock): ExtractionBlock => ({
  id: block.id,
  text: block.text,
  timestamp: block.timestamp,
  order: block.order,
});

const mergeExtractionBlocks = (
  existingBlocks: ExtractionBlock[],
  incomingBlocks: ExtractionBlock[]
): ExtractionBlock[] => {
  const mergedBlocks = new Map(existingBlocks.map((block) => [block.id, block]));
  const orderedIncomingBlocks = [...incomingBlocks].sort(
    (firstBlock, secondBlock) =>
      (firstBlock.order ?? firstBlock.timestamp) - (secondBlock.order ?? secondBlock.timestamp)
  );

  for (const block of orderedIncomingBlocks) {
    if (!mergedBlocks.has(block.id)) {
      mergedBlocks.set(block.id, block);
    }
  }

  return Array.from(mergedBlocks.values());
};

export const OcrWorkspace: React.FC = () => {
  const { user } = useAuth();
  const {
    activeDocument,
    setActiveDocument,
    documents,
    generateDocumentId,
    ensureDocument,
    saveBlock,
    reorderBlocks,
  } = useWorkspace();
  const { status, progress, process, cancel } = useOcrProcessor(routingOcrService);

  const prevUidRef = useRef(user?.uid);
  useEffect(() => {
    const prevUid = prevUidRef.current;
    const currUid = user?.uid;
    if (prevUid && prevUid !== currUid) {
      cancel();
      setPendingBlocks([]);
      pendingBlocksRef.current = [];
      setDraftDocId(null);
      draftDocIdRef.current = null;
      setActiveImageSrc(null);
      setSelectedFile(null);
      setWorkspaceError(null);
    }
    prevUidRef.current = currUid;
  }, [user?.uid, cancel]);

  const [mode, setMode] = useState<ExtractionMode>('document');
  const [isCloudAiEnabled, setIsCloudAiEnabled] = useState(false);
  const [showCloudConsentModal, setShowCloudConsentModal] = useState(false);
  const [isEnhancingCloud, setIsEnhancingCloud] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [draftDocId, setDraftDocId] = useState<string | null>(null);
  const [pendingBlocks, setPendingBlocks] = useState<PendingBlock[]>([]);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [isRetryingSync, setIsRetryingSync] = useState(false);
  const draftDocIdRef = useRef<string | null>(null);
  const pendingBlocksRef = useRef<PendingBlock[]>([]);
  const activeDocumentRef = useRef<CloudDocument | null>(null);

  const updatePendingBlocks = useCallback(
    (updater: (currentBlocks: PendingBlock[]) => PendingBlock[]) => {
      const nextBlocks = updater(pendingBlocksRef.current);
      pendingBlocksRef.current = nextBlocks;
      setPendingBlocks(nextBlocks);
    },
    []
  );

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
  const previousActiveDocumentIdRef = useRef<string | null>(null);

  activeDocumentRef.current = activeDocument;

  const cloudDocument = user
    ? activeDocument
      ? documents.find((document) => document.id === activeDocument.id) || null
      : null
    : null;
  const baseDocument = useMemo<CloudDocument | null>(() => {
    if (!user) return activeDocument;
    if (!activeDocument) return null;
    if (!cloudDocument) return activeDocument;

    const mergedBlocks = [
      ...activeDocument.blocks,
      ...cloudDocument.blocks.filter(
        (cloudBlock) => !activeDocument.blocks.some((block) => block.id === cloudBlock.id)
      ),
    ];

    return { ...activeDocument, ...cloudDocument, blocks: mergedBlocks };
  }, [activeDocument, cloudDocument, user]);
  const currentSessionId = activeDocument?.id ?? draftDocId;

  const displayDocument = useMemo<CloudDocument | null>(() => {
    const sessionPendingBlocks = pendingBlocks.filter(
      (pendingBlock) => pendingBlock.docId === (activeDocument?.id ?? draftDocId)
    );
    const baseBlocks = baseDocument?.blocks ?? [];
    const mergedBlocks = [
      ...baseBlocks,
      ...sessionPendingBlocks
        .filter((pendingBlock) => !baseBlocks.some((block) => block.id === pendingBlock.id))
        .map(toExtractionBlock),
    ];

    if (baseDocument) {
      return { ...baseDocument, blocks: mergedBlocks };
    }

    if (user && draftDocId) {
      return {
        id: draftDocId,
        title:
          sessionPendingBlocks[0]?.documentTitle ||
          (mode === 'document' ? 'Document Scan' : 'Graphic Scan'),
        blocks: mergedBlocks,
        timestamp: sessionPendingBlocks[0]?.timestamp ?? 0,
      };
    }

    return null;
  }, [activeDocument?.id, baseDocument, draftDocId, mode, pendingBlocks, user]);

  const activeDragBlock =
    displayDocument?.blocks.find((block) => block.id === activeDragId) || null;
  const failedSessionBlocks = pendingBlocks.filter(
    (pendingBlock) =>
      pendingBlock.docId === currentSessionId && pendingBlock.syncStatus === 'failed'
  );

  // Centralized revocation of blob URLs across image replacements and unmount
  useEffect(() => {
    return () => {
      if (activeImageSrc?.startsWith('blob:')) {
        URL.revokeObjectURL(activeImageSrc);
      }
    };
  }, [activeImageSrc]);

  useEffect(() => {
    if (previousActiveDocumentIdRef.current !== activeDocument?.id) {
      previousActiveDocumentIdRef.current = activeDocument?.id ?? null;
      draftDocIdRef.current = null;
      setDraftDocId(null);
    }
  }, [activeDocument?.id]);

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

  const persistPendingBlock = async (pendingBlock: PendingBlock): Promise<void> => {
    let isParentSynced = pendingBlock.isParentSynced;

    if (!isParentSynced) {
      const parentResult = await ensureDocument(
        pendingBlock.docId,
        pendingBlock.documentTitle,
        pendingBlock.timestamp
      );

      if (!parentResult.ok) {
        updatePendingBlocks((currentBlocks) =>
          currentBlocks.map((block) =>
            block.id === pendingBlock.id
              ? {
                  ...block,
                  syncStatus: 'failed',
                  syncError: parentResult.error,
                }
              : block
          )
        );
        return;
      }

      isParentSynced = true;
      updatePendingBlocks((currentBlocks) =>
        currentBlocks.map((block) =>
          block.id === pendingBlock.id
            ? { ...block, isParentSynced: true, syncStatus: 'pending', syncError: undefined }
            : block
        )
      );
    }

    const blockResult = await saveBlock(pendingBlock.docId, toExtractionBlock(pendingBlock));

    if (!blockResult.ok) {
      updatePendingBlocks((currentBlocks) =>
        currentBlocks.map((block) =>
          block.id === pendingBlock.id
            ? { ...block, syncStatus: 'failed', syncError: blockResult.error }
            : block
        )
      );
      return;
    }

    updatePendingBlocks((currentBlocks) =>
      currentBlocks.filter((block) => block.id !== pendingBlock.id)
    );

    const currentDocument = activeDocumentRef.current;
    const shouldCreateDraft = !currentDocument && draftDocIdRef.current === pendingBlock.docId;
    const shouldUpdateCurrentDocument = currentDocument?.id === pendingBlock.docId;

    if (shouldCreateDraft || shouldUpdateCurrentDocument) {
      const pendingSessionBlocks = pendingBlocksRef.current
        .filter((block) => block.docId === pendingBlock.docId)
        .map(toExtractionBlock);
      const mergedBlocks = mergeExtractionBlocks(currentDocument?.blocks ?? [], [
        ...pendingSessionBlocks,
        toExtractionBlock(pendingBlock),
      ]);
      const nextDocument = currentDocument
        ? { ...currentDocument, blocks: mergedBlocks }
        : {
            id: pendingBlock.docId,
            title: pendingBlock.documentTitle,
            blocks: mergedBlocks,
            timestamp: pendingBlock.timestamp,
          };

      activeDocumentRef.current = nextDocument;
      setActiveDocument(nextDocument);
    }
  };

  const stageExtractedText = (extractedText: string): void => {
    const documentTitle = mode === 'document' ? 'Document Scan' : 'Graphic Scan';
    const timestamp = Date.now();
    const blockId = crypto.randomUUID();

    if (!user) {
      const currentBlocks = activeDocument?.blocks ?? [];
      const maxOrder = currentBlocks.reduce(
        (maximum, block) => Math.max(maximum, block.order ?? 0),
        0
      );
      const guestBlock: ExtractionBlock = {
        id: blockId,
        text: extractedText,
        timestamp,
        order: maxOrder + 1000,
      };

      setActiveDocument(
        activeDocument
          ? { ...activeDocument, blocks: [...currentBlocks, guestBlock] }
          : {
              id: `guest_session_${timestamp}`,
              title: documentTitle,
              blocks: [guestBlock],
              timestamp,
            }
      );
      return;
    }

    let currentDocId = activeDocument?.id ?? draftDocIdRef.current;

    if (!currentDocId) {
      currentDocId = generateDocumentId();
      if (!currentDocId) {
        setWorkspaceError('Could not prepare a cloud document for this scan.');
        return;
      }
      draftDocIdRef.current = currentDocId;
      setDraftDocId(currentDocId);
    }

    const currentSessionBlocks = [
      ...(displayDocument?.blocks ?? []),
      ...(activeDocumentRef.current?.blocks ?? []),
      ...pendingBlocksRef.current.filter((block) => block.docId === currentDocId),
    ];
    const maxOrder = currentSessionBlocks.reduce(
      (maximum, block) => Math.max(maximum, block.order ?? 0),
      0
    );
    const isExistingCloudDocument = Boolean(
      activeDocument?.id && documents.some((document) => document.id === activeDocument.id)
    );
    const pendingBlock: PendingBlock = {
      id: blockId,
      docId: currentDocId,
      text: extractedText,
      timestamp,
      order: maxOrder + 1000,
      documentTitle,
      syncStatus: 'pending',
      isParentSynced: isExistingCloudDocument,
    };

    updatePendingBlocks((currentBlocks) => [...currentBlocks, pendingBlock]);
    void persistPendingBlock(pendingBlock);
  };

  const handleRetrySync = async (): Promise<void> => {
    if (!user || isRetryingSync || !currentSessionId) return;

    const failedBlocks = pendingBlocks.filter(
      (block) => block.docId === currentSessionId && block.syncStatus === 'failed'
    );
    if (failedBlocks.length === 0) return;

    setIsRetryingSync(true);
    try {
      for (const failedBlock of failedBlocks) {
        updatePendingBlocks((currentBlocks) =>
          currentBlocks.map((block) =>
            block.id === failedBlock.id
              ? { ...block, syncStatus: 'pending', syncError: undefined }
              : block
          )
        );
        await persistPendingBlock({ ...failedBlock, syncStatus: 'pending' });
      }
    } finally {
      setIsRetryingSync(false);
    }
  };

  const handleImageSelected = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setWorkspaceError('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setWorkspaceError('File is too large. Please keep images under 10MB.');
      return;
    }

    setWorkspaceError(null);

    const safeFile = await enforceMaxImageResolution(file);
    setSelectedFile(safeFile);
    const objectUrl = URL.createObjectURL(safeFile);
    setActiveImageSrc(objectUrl);
    setCropBox({ x: 0, y: 0, w: 100, h: 100 });
  };

  const getCroppedImageFile = (): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!sourceImgRef.current || !selectedFile) {
        resolve(null);
        return;
      }
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
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);

      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const croppedFile = new File([blob], selectedFile.name.replace(/\.[^/.]+$/, '') + '.png', {
          type: 'image/png',
          lastModified: Date.now(),
        });
        resolve(croppedFile);
      }, 'image/png');
    });
  };

  const handleConfirmCloudAi = async () => {
    setShowCloudConsentModal(false);
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsEnhancingCloud(true);
    setIsPreparing(true);
    setIsProcessing(true);
    setWorkspaceError(null);

    try {
      const croppedFile = await getCroppedImageFile();
      if (!croppedFile) {
        setWorkspaceError('Failed to generate cropped image for Cloud AI.');
        return;
      }

      const res = await process(croppedFile, mode, { engine: 'ai' });
      if (res.ok && res.text.trim()) {
        setActiveImageSrc(null);
        setSelectedFile(null);
        setWorkspaceError(null);
        stageExtractedText(res.text);
      } else if (!res.ok && res.aborted) {
        return;
      } else {
        setWorkspaceError(res.ok ? 'No readable text detected in selected region.' : res.error);
      }
    } catch (error) {
      console.error('Cloud AI Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setWorkspaceError(`CLOUD AI FAILED: ${errorMessage}`);
    } finally {
      setIsEnhancingCloud(false);
      setIsPreparing(false);
      setIsProcessing(false);
    }
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
      const croppedFile = await getCroppedImageFile();
      if (!croppedFile) {
        setWorkspaceError('Failed to generate cropped image.');
        setIsPreparing(false);
        setIsProcessing(false);
        return;
      }

      try {
        const result = await process(croppedFile, mode);

        if (result.ok && result.text.trim()) {
          setActiveImageSrc(null);
          setSelectedFile(null);
          setWorkspaceError(null);
          stageExtractedText(result.text);
        } else if (!result.ok && result.aborted) {
          return;
        } else {
          const errMsg = result.ok ? 'No readable text detected in selected region.' : result.error;
          setWorkspaceError(errMsg);
          if (isCloudAiEnabled) {
            if (!user) {
              setIsLoginModalOpen(true);
            } else {
              setShowCloudConsentModal(true);
            }
          }
        }
      } catch (error) {
        console.error('Processing error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setWorkspaceError(`OCR FAILED: ${errorMessage}`);
      } finally {
        setIsPreparing(false);
        setTimeout(() => {
          setIsProcessing(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Cropping and processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setWorkspaceError(`OCR FAILED: ${errorMessage}`);
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

  const checkAndResetCooldown = useCallback(() => {
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
  }, []);

  useEffect(() => {
    if (!user) {
      checkAndResetCooldown();
      const savedScans = parseInt(localStorage.getItem('textify_guest_scans') || '0', 10);
      setGuestScansCount(savedScans);
    }
  }, [checkAndResetCooldown, user]);

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

    const pendingBlock = pendingBlocksRef.current.find(
      (block) => block.id === blockToDelete.id && block.docId === displayDocument.id
    );

    if (pendingBlock) {
      updatePendingBlocks((currentBlocks) =>
        currentBlocks.filter((block) => block.id !== pendingBlock.id)
      );

      const currentDocument = activeDocumentRef.current;
      if (currentDocument?.id === displayDocument.id) {
        const nextDocument = {
          ...currentDocument,
          blocks: currentDocument.blocks.filter((block) => block.id !== pendingBlock.id),
        };
        activeDocumentRef.current = nextDocument;
        setActiveDocument(nextDocument);
      }

      setBlockToDelete(null);
      return;
    }

    try {
      if (user) {
        const documentRef = doc(db, 'users', user.uid, 'documents', displayDocument.id);
        await updateDoc(documentRef, { blocks: arrayRemove(blockToDelete) });
      } else {
        const nextDocument = {
          ...displayDocument,
          blocks: displayDocument.blocks.filter((b) => b.id !== blockToDelete.id),
        };
        activeDocumentRef.current = nextDocument;
        setActiveDocument(nextDocument);
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
    const nextDocument = {
      ...displayDocument,
      blocks: newBlocks,
    };
    activeDocumentRef.current = nextDocument;
    setActiveDocument(nextDocument);

    try {
      if (user) {
        const pendingBlockIds = new Set(
          pendingBlocksRef.current
            .filter((block) => block.docId === displayDocument.id)
            .map((block) => block.id)
        );
        const persistedBlockIds = newBlocks
          .filter((block) => !pendingBlockIds.has(block.id))
          .map((block) => block.id);

        if (persistedBlockIds.length > 0) {
          await reorderBlocks(displayDocument.id, persistedBlockIds);
        }
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

        {/* Cloud AI Enhancement Toggle */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#FFFDF7] border border-[#20251F]/20 text-[10px] font-bold uppercase tracking-wider shadow-drafting-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCloudAiEnabled}
              onChange={(e) => {
                const nextChecked = e.target.checked;
                setIsCloudAiEnabled(nextChecked);
                if (nextChecked && !user) {
                  setIsLoginModalOpen(true);
                }
              }}
              disabled={isProcessing}
              className="w-3.5 h-3.5 accent-[#214C3A] cursor-pointer"
            />
            <span className="text-[#20251F]">[ OPTIONAL ] Enable Gemini Cloud AI Enhancement</span>
          </label>
          <span className="text-[9px] text-[#20251F]/60">
            {user ? '20 SCANS / DAY QUOTA' : 'REQUIRES AUTHENTICATION'}
          </span>
        </div>

        {workspaceError && (
          <div
            role="alert"
            className="w-full bg-[#FFFDF7] border border-[#E96C3F] p-4 text-[#E96C3F] text-[10px] font-bold uppercase shadow-drafting-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-black tracking-wider block mb-1 text-xs">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  SCANNING TERMINATED
                </span>
                <span className="break-words">{workspaceError}</span>
                {activeImageSrc && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          setIsLoginModalOpen(true);
                        } else {
                          setShowCloudConsentModal(true);
                        }
                      }}
                      disabled={isProcessing}
                      className="bg-[#214C3A] text-[#FFFDF7] px-3 py-1.5 border border-[#20251F]/20 hover:bg-[#183a2b] transition-all text-[9px] font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50"
                    >
                      [ ENHANCE WITH CLOUD AI ]
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setWorkspaceError(null)}
                className="shrink-0 hover:bg-[#E96C3F]/10 p-1"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {user && failedSessionBlocks.length > 0 && (
          <div
            role="alert"
            className="w-full bg-[#FFFDF7] border border-[#E96C3F] p-4 text-[#E96C3F] text-[10px] font-bold uppercase shadow-drafting-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-black tracking-wider block text-xs">
                  [ CLOUD SYNC FAILED — LOCAL DRAFT PRESERVED ]
                </span>
                {failedSessionBlocks[0]?.syncError && (
                  <span className="block mt-1 break-words">{failedSessionBlocks[0].syncError}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handleRetrySync()}
                disabled={isRetryingSync}
                className="shrink-0 border border-[#E96C3F] px-4 py-2 hover:bg-[#E96C3F] hover:text-white transition-colors disabled:opacity-50"
              >
                [ RETRY SYNC ]
              </button>
            </div>
          </div>
        )}

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
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#20251F]/15 pt-4 font-bold text-[10px] uppercase">
              <button
                onClick={() => {
                  setActiveImageSrc(null);
                  setSelectedFile(null);
                  draftDocIdRef.current = null;
                  setDraftDocId(null);
                  setWorkspaceError(null);
                }}
                disabled={isProcessing}
                className="px-5 py-2.5 border border-[#20251F]/20 hover:border-[#20251F] hover:bg-[#20251F]/5 text-[#20251F] transition-colors cursor-pointer"
              >
                [ DISCARD / CANCEL ]
              </button>
              {isCloudAiEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      setIsLoginModalOpen(true);
                    } else {
                      setShowCloudConsentModal(true);
                    }
                  }}
                  disabled={isProcessing}
                  className="border border-[#214C3A] text-[#214C3A] hover:bg-[#214C3A] hover:text-[#FFFDF7] px-5 py-2.5 transition-all flex items-center gap-2 shadow-drafting-sm cursor-pointer disabled:opacity-50"
                >
                  [ ENHANCE WITH CLOUD AI ]
                </button>
              )}
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
              style={{
                width: isEnhancingCloud ? '100%' : `${progress > 0 ? progress : 8}%`,
              }}
            >
              <div className="absolute inset-0 scanlines opacity-30" />
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-extrabold tracking-widest text-[#FFFDF7] mix-blend-difference uppercase">
              {isEnhancingCloud
                ? 'CLOUD AI ENHANCEMENT IN PROGRESS...'
                : `OCR ANALYSIS IN PROGRESS • ${Math.round(progress)}%`}
            </span>
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

      {/* Modal: Cloud AI Consent Pre-Flight */}
      {showCloudConsentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#20251F]/50 backdrop-blur-sm px-4">
          <div className="bg-[#FFFDF7] w-full max-w-md border border-[#20251F] shadow-drafting-lg overflow-hidden">
            <div className="bg-[#20251F] text-[#FFFDF7] px-4 py-2.5 flex items-center justify-between font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase">
              <span>[ CLOUD TRANSMISSION CONSENT ]</span>
              <button
                onClick={() => setShowCloudConsentModal(false)}
                className="hover:text-[#E96C3F] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="font-extrabold text-[12px] uppercase tracking-wide mb-2 text-[#20251F]">
                TRANSMIT IMAGE TO GEMINI CLOUD AI?
              </h3>
              <p className="text-[10px] font-semibold text-[#20251F]/70 mb-4 uppercase leading-relaxed tracking-[0.02em]">
                You are about to transmit the cropped image region to Google Gemini via our secure
                serverless gateway (
                <code className="lowercase text-[#20251F] font-bold">/api/gemini-ocr</code>).
              </p>
              <div className="bg-[#20251F]/5 border border-[#20251F]/15 p-3 text-[9px] font-bold uppercase space-y-1 mb-6 text-[#20251F]/80">
                <div>• Model: Google Gemini (Serverless Proxy)</div>
                <div>• Daily Allowance: 20 Cloud AI scans per account</div>
                <div>• Privacy: Image payload is processed in memory and never stored</div>
              </div>
              <div className="flex justify-end gap-2.5 font-mono-industrial text-[9px] font-bold uppercase">
                <button
                  onClick={() => setShowCloudConsentModal(false)}
                  className="px-4 py-2 border border-[#20251F]/20 hover:border-[#20251F] text-[#20251F] transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => void handleConfirmCloudAi()}
                  disabled={isEnhancingCloud}
                  className="px-4 py-2 bg-[#214C3A] hover:bg-[#183a2b] text-white transition-colors cursor-pointer shadow-drafting-sm disabled:opacity-50"
                >
                  {isEnhancingCloud ? 'ENHANCING...' : '[ CONFIRM & SEND ]'}
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
