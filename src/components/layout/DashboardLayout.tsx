import React, { useState } from 'react';
import { useWorkspace } from '../../shared/context/WorkspaceContext';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useCloudHistory } from '../../features/history/hooks/useCloudHistory';
import { 
  CaretLeft, 
  Plus, 
  Trash, 
  SignOut, 
  List, 
  DotsThreeVertical, 
  X,
  PushPin
} from '@phosphor-icons/react';

import { LoginModal } from '../../features/auth/components/LoginModal';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
  const { user, isAuthLoading, logout } = useAuth();
  const { documents, isLoading: isHistoryLoading, deleteExtraction, renameSession, togglePinSession } = useCloudHistory(user?.uid);
  const { setActiveDocument, activeDocument } = useWorkspace();

  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [sessionToRename, setSessionToRename] = useState<{ id: string, title: string } | null>(null);
  const [renameInput, setRenameInput] = useState("");
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheClearedStatus, setCacheClearedStatus] = useState(false);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
      
      localStorage.removeItem('textify_guest_scans');
      localStorage.removeItem('textify_exhausted_date');
      
      const { clearIndexedDbPersistence } = await import('firebase/firestore');
      const { db } = await import('../../config/firebase');
      
      try {
        await clearIndexedDbPersistence(db);
      } catch (dbErr) {
        console.warn('Could not clear Firestore IndexedDB cache immediately:', dbErr);
      }

      setCacheClearedStatus(true);
      setTimeout(() => setCacheClearedStatus(false), 3000);
    } catch (err) {
      console.error('Error clearing cache:', err);
    } finally {
      setIsClearingCache(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    }).format(new Date(timestamp)).toUpperCase();
  };

  const handleDeleteSessionClick = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(docId);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (sessionToDelete) {
      await deleteExtraction(sessionToDelete);
      if (activeDocument?.id === sessionToDelete) setActiveDocument(null);
    }
    setSessionToDelete(null);
  };

  const handleRenameSessionClick = (docId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToRename({ id: docId, title: currentTitle });
    setRenameInput(currentTitle);
    setOpenMenuId(null);
  };

  const confirmRename = async () => {
    if (sessionToRename && renameInput.trim() !== "" && renameInput.trim() !== sessionToRename.title) {
      await renameSession(sessionToRename.id, renameInput.trim());
    }
    setSessionToRename(null);
  };

  const handleTogglePinClick = async (docId: string, currentPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    await togglePinSession(docId, currentPinned);
    setOpenMenuId(null);
  };

  const handleMobileNavClose = () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const safeAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=4D694E&color=FFF3D5&rounded=false`;

  return (
    <div className="flex h-screen bg-[#FFF3D5] overflow-hidden font-mono-industrial relative text-[#4D694E]">
      <div className="fixed inset-0 noise-bg pointer-events-none z-[1]" />
      <div className="fixed inset-0 halftone-overlay pointer-events-none z-[1]" />
      
      {/* Mobile backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-[#4D694E]/40 backdrop-blur-xs z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Panel */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 h-full
        bg-[#FFF3D5] border-r-2 border-[#4D694E] flex flex-col
        transition-all duration-300 ease-in-out
        ${isSidebarOpen 
          ? 'translate-x-0 w-72 opacity-100' 
          : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 overflow-hidden'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 flex justify-between items-center border-b-2 border-[#4D694E] h-16 min-w-[18rem]">
          <span className="font-extrabold text-sm tracking-[0.15em] uppercase">TEXTIFY // DB</span>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="p-1.5 border border-[#4D694E]/30 hover:border-[#4D694E] transition-colors flex items-center justify-center"
            aria-label="Collapse Menu"
          >
            <CaretLeft className="w-4 h-4" weight="bold" />
          </button>
        </div>

        {/* Action Button Section */}
        <div className="p-4 border-b-2 border-[#4D694E] min-w-[18rem]">
          <button 
            onClick={() => { setActiveDocument(null); setOpenMenuId(null); handleMobileNavClose(); }} 
            className="w-full flex items-center justify-center gap-2 bg-[#4D694E] text-[#FFF3D5] py-3 px-4 font-bold text-[10px] tracking-[0.1em] uppercase hover:bg-[#3a4f3b] active:scale-[0.97] transition-all border-2 border-[#4D694E]"
          >
            <Plus className="w-3.5 h-3.5" weight="bold" />
            [ NEW EXTRACTION ]
          </button>
        </div>

        {/* Sidebar Content (Documents list) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 min-w-[18rem] border-b-2 border-[#4D694E]">
          <div className="font-mono-industrial text-[9px] font-bold text-[#4D694E]/40 tracking-[0.15em] uppercase mb-4 px-2">
            /// DOCUMENT INDEX
          </div>
          
          <div className="space-y-1">
            {!user ? (
              <div className="text-[10px] text-[#4D694E]/60 px-3 uppercase tracking-wide leading-relaxed font-semibold">
                [ SIGN IN TO ENABLE PERMANENT HISTORICAL ARCHIVE ]
              </div>
            ) : isHistoryLoading ? (
              <div className="text-[10px] text-[#4D694E]/60 px-3 animate-pulse uppercase tracking-wide">
                RETRIEVING RECORD INDEX...
              </div>
            ) : documents.length === 0 ? (
              <div className="text-[10px] text-[#4D694E]/60 px-3 uppercase tracking-wide italic">
                -- INDEX IS EMPTY --
              </div>
            ) : (
              documents.map((item) => {
                const isActive = activeDocument?.id === item.id;
                return (
                  <div 
                    key={item.id} 
                    className="relative group border-b border-[#4D694E]/30 last:border-b-0" 
                    onMouseEnter={() => setHoveredDocId(item.id)} 
                    onMouseLeave={() => {
                      setHoveredDocId(null);
                      setOpenMenuId(null);
                    }}
                  >
                    <button 
                      onClick={() => { setActiveDocument(item); setOpenMenuId(null); handleMobileNavClose(); }} 
                      className={`w-full text-left px-3 py-3 transition-colors flex items-start gap-2.5 ${isActive ? 'bg-[#4D694E]/10 border-l-4 border-[#4D694E] pl-1.5' : 'hover:bg-[#4D694E]/5'}`}
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5 pr-6">
                          {item.isPinned && (
                            <PushPin className="w-3 h-3 text-[#4D694E] shrink-0" weight="fill" />
                          )}
                          <p className="text-[11px] font-extrabold text-[#4D694E] truncate uppercase tracking-wide">{item.title}</p>
                        </div>
                        <p className="text-[8px] text-[#4D694E]/40 mt-1 tracking-wider uppercase font-semibold">{formatDate(item.timestamp)}</p>
                      </div>
                    </button>

                    {(hoveredDocId === item.id || openMenuId === item.id) && (
                      <div className="absolute top-3 right-2 flex items-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }} 
                          className={`p-1 border-2 border-[#4D694E] transition-colors ${openMenuId === item.id ? 'bg-[#4D694E] text-[#FFF3D5]' : 'bg-[#FFF3D5] text-[#4D694E] hover:bg-[#4D694E] hover:text-[#FFF3D5]'}`}
                        >
                          <DotsThreeVertical className="w-3.5 h-3.5" weight="bold" />
                        </button>
                        
                        {openMenuId === item.id && (
                          <div className="absolute right-0 top-7 w-28 bg-[#FFF3D5] border-2 border-[#4D694E] z-50 p-1 flex flex-col text-[9px] font-bold tracking-[0.05em] uppercase">
                            <button 
                              onClick={(e) => handleTogglePinClick(item.id, item.isPinned || false, e)} 
                              className="w-full text-left px-2 py-1.5 hover:bg-[#4D694E] hover:text-[#FFF3D5] transition-colors"
                            >
                              {item.isPinned ? 'UNPIN' : 'PIN'}
                            </button>
                            <button 
                              onClick={(e) => handleRenameSessionClick(item.id, item.title, e)} 
                              className="w-full text-left px-2 py-1.5 hover:bg-[#4D694E] hover:text-[#FFF3D5] transition-colors border-t-2 border-[#4D694E]"
                            >
                              RENAME
                            </button>
                            <button 
                              onClick={(e) => handleDeleteSessionClick(item.id, e)} 
                              className="w-full text-left px-2 py-1.5 text-red-700 hover:bg-red-700 hover:text-white transition-colors border-t-2 border-[#4D694E]"
                            >
                              DELETE
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* User / Session Footer Panel */}
        {!isAuthLoading && (
          <div className="mt-auto bg-[#FFF3D5] p-4 min-w-[18rem] z-10 border-t-2 border-r-2 border-[#4D694E]">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={user.photoURL || safeAvatarUrl} 
                    alt="Profile" 
                    className="w-10 h-10 border-2 border-[#4D694E] object-cover bg-[#FFF3D5]"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = safeAvatarUrl;
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-[10px] tracking-wide text-[#4D694E] truncate uppercase">{user.displayName || 'SYS.USER'}</p>
                    <p className="text-[7px] font-bold text-[#4D694E]/60 mt-0.5 px-1.5 py-0.5 inline-block bg-[#4D694E]/5 border border-[#4D694E]/20">
                      LEVEL // PRO
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={handleClearCache} 
                  disabled={isClearingCache}
                  className="w-full text-center bg-[#FFF3D5] text-[#4D694E] py-2.5 px-4 font-bold text-[9px] tracking-[0.1em] uppercase hover:bg-[#4D694E] hover:text-[#FFF3D5] border-2 border-[#4D694E] transition-all flex items-center justify-center gap-1.5 group disabled:opacity-50"
                >
                  <Trash className="w-3.5 h-3.5 text-[#4D694E] group-hover:text-current" weight="bold" />
                  {isClearingCache ? 'CLEARING...' : cacheClearedStatus ? 'CACHE CLEARED!' : 'CLEAR CACHE'}
                </button>

                <button 
                  onClick={logout} 
                  className="w-full text-center bg-[#FFF3D5] text-[#4D694E] py-2.5 px-4 font-bold text-[9px] tracking-[0.1em] uppercase hover:bg-[#4D694E] hover:text-[#FFF3D5] border-2 border-[#4D694E] transition-all flex items-center justify-center gap-1.5 group"
                >
                  <SignOut className="w-3.5 h-3.5 text-[#4D694E] group-hover:text-current" weight="bold" />
                  SIGN OUT
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)} 
                className="w-full bg-[#4D694E] text-[#FFF3D5] py-3 px-4 font-bold text-[9px] tracking-[0.1em] uppercase border-2 border-[#4D694E] hover:bg-[#3a4f3b] transition-all flex items-center gap-2 justify-center"
              >
                SIGN IN WITH GOOGLE
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center px-4 md:px-6 z-10 border-b-2 border-[#4D694E] justify-between">
          <div className="flex items-center flex-1">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-1.5 border-2 border-[#4D694E] hover:bg-[#4D694E]/10 text-[#4D694E] transition-colors flex items-center justify-center gap-1.5 mr-4"
                aria-label="Expand Sidebar"
              >
                <List className="w-4 h-4" weight="bold" />
                <span className="font-mono-industrial text-[9px] font-bold tracking-[0.1em] uppercase md:block hidden">INDEX</span>
              </button>
            )}
            <div className="flex items-center gap-2 font-mono-industrial text-[10px] font-bold">
              <span className="text-[#4D694E]/30">&lt;&lt;&lt;</span>
              <span className="uppercase tracking-widest text-[#4D694E]/60">WORKSPACE PROTOCOL ACTIVE</span>
              <span className="text-[#4D694E]/30">&gt;&gt;&gt;</span>
            </div>
          </div>
          
          <div className="flex items-center shrink-0">
            <a 
              href="/"
              className="font-mono-industrial text-[9px] font-bold tracking-[0.1em] uppercase bg-[#FFF3D5] hover:bg-[#4D694E] hover:text-[#FFF3D5] border-2 border-[#4D694E] px-3.5 py-1.5 transition-all shadow-[2px_2px_0px_0px_#4D694E] hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 relative z-10"
            >
              [ ← EXIT WORKSPACE ]
            </a>
          </div>
        </header>

        {/* Main Work Area */}
        <main onClick={() => setOpenMenuId(null)} className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className="max-w-3xl w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Modal: Delete Confirmation */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4D694E]/40 px-4">
          <div className="bg-[#FFF3D5] w-full max-w-sm border-2 border-[#4D694E] overflow-hidden">
            {/* Header */}
            <div className="bg-[#4D694E] text-[#FFF3D5] px-4 py-2 flex items-center justify-between font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase">
              <span>&lt; WARNING // DELETION &gt;</span>
              <button onClick={() => setSessionToDelete(null)} className="hover:text-[#FFF3D5]/70">
                <X className="w-3.5 h-3.5" weight="bold" />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="font-extrabold text-[12px] uppercase tracking-wide mb-2 text-[#4D694E]">PURGE SESSION?</h3>
              <p className="text-[10px] font-semibold text-[#4D694E]/70 mb-6 uppercase leading-relaxed tracking-[0.02em]">
                ARE YOU SURE YOU WANT TO DELETE THIS SESSION AND ALL EXTRACTIONS ATTACHED TO IT? THIS ACTION IS IRREVERSIBLE.
              </p>
              
              <div className="flex justify-end gap-2.5 font-mono-industrial text-[9px] font-bold uppercase">
                <button 
                  onClick={() => setSessionToDelete(null)}
                  className="px-4 py-2 border border-[#4D694E]/30 hover:border-[#4D694E] transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 border-2 border-[#4D694E] bg-red-700 hover:bg-red-800 text-white transition-colors"
                >
                  CONFIRM PURGE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Rename Session */}
      {sessionToRename && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4D694E]/40 px-4">
          <div className="bg-[#FFF3D5] w-full max-w-sm border-2 border-[#4D694E] overflow-hidden">
            {/* Header */}
            <div className="bg-[#4D694E] text-[#FFF3D5] px-4 py-2 flex items-center justify-between font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase">
              <span>&lt; PROTOCOL // RENAME &gt;</span>
              <button onClick={() => setSessionToRename(null)} className="hover:text-[#FFF3D5]/70">
                <X className="w-3.5 h-3.5" weight="bold" />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="font-extrabold text-[12px] uppercase tracking-wide mb-2 text-[#4D694E]">RENAME SESSION INDEX</h3>
              <p className="text-[9px] font-semibold text-[#4D694E]/60 mb-4 uppercase tracking-[0.02em]">ENTER NEW LOG IDENTIFIER BELOW.</p>
              
              <input 
                type="text" 
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); }}
                className="w-full px-3 py-2 border-2 border-[#4D694E] bg-[#FFF3D5] focus:outline-none focus:ring-1 focus:ring-[#4D694E] text-[#4D694E] font-bold font-mono-industrial text-[11px] uppercase mb-6"
              />
              
              <div className="flex justify-end gap-2.5 font-mono-industrial text-[9px] font-bold uppercase">
                <button 
                  onClick={() => setSessionToRename(null)}
                  className="px-4 py-2 border-2 border-[#4D694E] bg-transparent hover:bg-[#4D694E]/10 transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={confirmRename}
                  className="px-4 py-2 border-2 border-[#4D694E] bg-[#4D694E] text-[#FFF3D5] hover:bg-[#3a4f3b] transition-colors"
                >
                  SAVE CHANGES
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