import React, { useState } from 'react';
import { useWorkspace } from '../../shared/context/WorkspaceContext';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useCloudHistory } from '../../features/history/hooks/useCloudHistory';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Plus, 
  Trash2, 
  LogOut, 
  MoreVertical, 
  Pin, 
  X 
} from 'lucide-react';

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

  const safeAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=20251F&color=FFFDF7&rounded=false`;

  return (
    <div className="flex h-screen bg-[#F3EFE3] overflow-hidden font-mono-industrial relative text-[#20251F]">
      <div className="fixed inset-0 noise-bg pointer-events-none z-[1]" />
      <div className="fixed inset-0 halftone-overlay pointer-events-none z-[1]" />
      
      {/* Mobile backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-[#20251F]/40 backdrop-blur-xs z-40 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Panel */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 h-full
        bg-[#FFFDF7] border-r border-[#20251F]/15 flex flex-col
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
        ${isSidebarOpen 
          ? 'translate-x-0 w-72 opacity-100' 
          : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 pointer-events-none'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 flex justify-between items-center border-b border-[#20251F]/15 h-16 min-w-[18rem]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-[#214C3A] rounded-full" />
            <span className="font-extrabold text-xs tracking-[0.18em] uppercase text-[#20251F]">TEXTIFY &bull; VAULT</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="p-1.5 border border-[#20251F]/20 hover:border-[#20251F] hover:bg-[#20251F]/5 transition-colors flex items-center justify-center cursor-pointer text-[#20251F]"
            aria-label="Collapse Sidebar"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button Section */}
        <div className="p-4 border-b border-[#20251F]/15 min-w-[18rem]">
          <button 
            onClick={() => { setActiveDocument(null); setOpenMenuId(null); handleMobileNavClose(); }} 
            className="w-full flex items-center justify-center gap-2 bg-[#214C3A] text-[#FFFDF7] py-3 px-4 font-bold text-[10px] tracking-[0.12em] uppercase hover:bg-[#183a2b] active:scale-[0.99] transition-all shadow-drafting-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            NEW EXTRACTION
          </button>
        </div>

        {/* Sidebar Content (Documents list) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 min-w-[18rem] border-b border-[#20251F]/15">
          <div className="font-mono-industrial text-[9px] font-bold text-[#20251F]/50 tracking-[0.18em] uppercase mb-4 px-2">
            DOCUMENT INDEX
          </div>
          
          <div className="space-y-1">
            {!user ? (
              <div className="text-[10px] text-[#20251F]/60 px-3 uppercase tracking-wide leading-relaxed font-semibold">
                [ SIGN IN TO ENABLE CLOUD ARCHIVE ]
              </div>
            ) : isHistoryLoading ? (
              <div className="text-[10px] text-[#20251F]/60 px-3 animate-pulse uppercase tracking-wide">
                RETRIEVING RECORD INDEX...
              </div>
            ) : documents.length === 0 ? (
              <div className="text-[10px] text-[#20251F]/60 px-3 uppercase tracking-wide italic">
                INDEX IS EMPTY
              </div>
            ) : (
              documents.map((item) => {
                const isActive = activeDocument?.id === item.id;
                return (
                  <div 
                    key={item.id} 
                    className="relative group border-b border-[#20251F]/10 last:border-b-0" 
                    onMouseEnter={() => setHoveredDocId(item.id)} 
                    onMouseLeave={() => {
                      setHoveredDocId(null);
                      setOpenMenuId(null);
                    }}
                  >
                    <button 
                      onClick={() => { setActiveDocument(item); setOpenMenuId(null); handleMobileNavClose(); }} 
                      className={`w-full text-left px-3 py-3 transition-colors flex items-start gap-2.5 cursor-pointer ${isActive ? 'bg-[#20251F]/5 border-l-2 border-[#214C3A] pl-2' : 'hover:bg-[#20251F]/[0.03]'}`}
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5 pr-6">
                          {item.isPinned && (
                            <Pin className="w-3 h-3 text-[#214C3A] fill-current shrink-0" />
                          )}
                          <p className="text-[11px] font-extrabold text-[#20251F] truncate uppercase tracking-wide">{item.title}</p>
                        </div>
                        <p className="text-[8px] text-[#20251F]/40 mt-1 tracking-wider uppercase font-semibold">{formatDate(item.timestamp)}</p>
                      </div>
                    </button>

                    {(hoveredDocId === item.id || openMenuId === item.id) && (
                      <div className="absolute top-3 right-2 flex items-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }} 
                          className={`p-1 border border-[#20251F]/20 transition-colors cursor-pointer ${openMenuId === item.id ? 'bg-[#20251F] text-[#FFFDF7]' : 'bg-[#FFFDF7] text-[#20251F] hover:bg-[#20251F] hover:text-[#FFFDF7]'}`}
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        
                        {openMenuId === item.id && (
                          <div className="absolute right-0 top-7 w-28 bg-[#FFFDF7] border border-[#20251F] shadow-drafting z-50 p-1 flex flex-col text-[9px] font-bold tracking-[0.05em] uppercase">
                            <button 
                              onClick={(e) => handleTogglePinClick(item.id, item.isPinned || false, e)} 
                              className="w-full text-left px-2 py-1.5 hover:bg-[#20251F] hover:text-[#FFFDF7] transition-colors cursor-pointer"
                            >
                              {item.isPinned ? 'UNPIN' : 'PIN'}
                            </button>
                            <button 
                              onClick={(e) => handleRenameSessionClick(item.id, item.title, e)} 
                              className="w-full text-left px-2 py-1.5 hover:bg-[#20251F] hover:text-[#FFFDF7] transition-colors border-t border-[#20251F]/10 cursor-pointer"
                            >
                              RENAME
                            </button>
                            <button 
                              onClick={(e) => handleDeleteSessionClick(item.id, e)} 
                              className="w-full text-left px-2 py-1.5 text-[#E96C3F] hover:bg-[#E96C3F] hover:text-[#FFFDF7] transition-colors border-t border-[#20251F]/10 cursor-pointer"
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
          <div className="mt-auto bg-[#FFFDF7] p-4 min-w-[18rem] z-10 border-t border-[#20251F]/15">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={user.photoURL || safeAvatarUrl} 
                    alt="Profile" 
                    className="w-10 h-10 border border-[#20251F]/20 object-cover bg-[#F3EFE3]"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = safeAvatarUrl;
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-[10px] tracking-wide text-[#20251F] truncate uppercase">{user.displayName || 'SYS.USER'}</p>
                    <p className="text-[7px] font-bold text-[#20251F]/60 mt-0.5 px-1.5 py-0.5 inline-block bg-[#20251F]/5 border border-[#20251F]/15">
                      PRO
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={handleClearCache} 
                  disabled={isClearingCache}
                  className="w-full text-center bg-[#FFFDF7] text-[#20251F] py-2.5 px-4 font-bold text-[9px] tracking-[0.1em] uppercase hover:bg-[#20251F] hover:text-[#FFFDF7] border border-[#20251F]/20 transition-all flex items-center justify-center gap-1.5 group disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#20251F]/60 group-hover:text-current" />
                  {isClearingCache ? 'CLEARING...' : cacheClearedStatus ? 'CACHE CLEARED!' : 'CLEAR CACHE'}
                </button>

                <button 
                  onClick={logout} 
                  className="w-full text-center bg-[#FFFDF7] text-[#20251F] py-2.5 px-4 font-bold text-[9px] tracking-[0.1em] uppercase hover:bg-[#20251F] hover:text-[#FFFDF7] border border-[#20251F]/20 transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#20251F]/60 group-hover:text-current" />
                  SIGN OUT
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)} 
                className="w-full bg-[#214C3A] text-[#FFFDF7] py-3 px-4 font-bold text-[9px] tracking-[0.1em] uppercase hover:bg-[#183a2b] transition-all flex items-center gap-2 justify-center shadow-drafting-sm cursor-pointer"
              >
                SIGN IN WITH GOOGLE
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center px-4 md:px-6 z-10 border-b border-[#20251F]/15 bg-[#FFFDF7] justify-between">
          <div className="flex items-center flex-1">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-1.5 border border-[#20251F]/20 hover:border-[#20251F] hover:bg-[#20251F]/5 text-[#20251F] transition-colors flex items-center justify-center gap-2 mr-4 cursor-pointer"
                aria-label="Expand Sidebar"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
                <span className="font-mono-industrial text-[9px] font-bold tracking-[0.12em] uppercase md:block hidden">INDEX</span>
              </button>
            )}
            <div className="flex items-center gap-2 font-mono-industrial text-[10px] font-bold">
              <span className="w-1.5 h-1.5 bg-[#214C3A] rounded-full animate-pulse" />
              <span className="uppercase tracking-[0.18em] text-[#20251F]/70">WORKSPACE ACTIVE</span>
            </div>
          </div>
          
          <div className="flex items-center shrink-0">
            <a 
              href="/"
              className="font-mono-industrial text-[9px] font-bold tracking-[0.12em] uppercase bg-[#FFFDF7] hover:bg-[#20251F] hover:text-[#FFFDF7] border border-[#20251F]/20 px-3.5 py-1.5 transition-all shadow-drafting-sm active:translate-y-0.5 relative z-10 cursor-pointer"
            >
              [ &larr; EXIT WORKSPACE ]
            </a>
          </div>
        </header>

        {/* Main Work Area */}
        <main onClick={() => setOpenMenuId(null)} className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-[#F3EFE3]">
          <div className="max-w-3xl w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Modal: Delete Confirmation */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#20251F]/50 backdrop-blur-sm px-4">
          <div className="bg-[#FFFDF7] w-full max-w-sm border border-[#20251F] shadow-drafting-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#20251F] text-[#FFFDF7] px-4 py-2.5 flex items-center justify-between font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase">
              <span>[ CONFIRM DELETION ]</span>
              <button onClick={() => setSessionToDelete(null)} className="hover:text-[#E96C3F] transition-colors cursor-pointer" aria-label="Close">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="font-extrabold text-[12px] uppercase tracking-wide mb-2 text-[#20251F]">PURGE SESSION?</h3>
              <p className="text-[10px] font-semibold text-[#20251F]/70 mb-6 uppercase leading-relaxed tracking-[0.02em]">
                ARE YOU SURE YOU WANT TO DELETE THIS SESSION AND ALL EXTRACTIONS ATTACHED TO IT? THIS ACTION IS IRREVERSIBLE.
              </p>
              
              <div className="flex justify-end gap-2.5 font-mono-industrial text-[9px] font-bold uppercase">
                <button 
                  onClick={() => setSessionToDelete(null)}
                  className="px-4 py-2 border border-[#20251F]/30 hover:border-[#20251F] text-[#20251F] transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-[#E96C3F] hover:bg-[#d55a2f] text-white transition-colors cursor-pointer shadow-drafting-sm"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#20251F]/50 backdrop-blur-sm px-4">
          <div className="bg-[#FFFDF7] w-full max-w-sm border border-[#20251F] shadow-drafting-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#20251F] text-[#FFFDF7] px-4 py-2.5 flex items-center justify-between font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase">
              <span>[ RENAME SESSION ]</span>
              <button onClick={() => setSessionToRename(null)} className="hover:text-[#E96C3F] transition-colors cursor-pointer" aria-label="Close">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="font-extrabold text-[12px] uppercase tracking-wide mb-2 text-[#20251F]">RENAME SESSION INDEX</h3>
              <p className="text-[9px] font-semibold text-[#20251F]/60 mb-4 uppercase tracking-[0.02em]">ENTER NEW LOG IDENTIFIER BELOW.</p>
              
              <input 
                type="text" 
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); }}
                className="w-full px-3 py-2 border border-[#20251F]/30 bg-[#F3EFE3]/30 focus:outline-none focus:border-[#20251F] text-[#20251F] font-bold font-mono-industrial text-[11px] uppercase mb-6"
              />
              
              <div className="flex justify-end gap-2.5 font-mono-industrial text-[9px] font-bold uppercase">
                <button 
                  onClick={() => setSessionToRename(null)}
                  className="px-4 py-2 border border-[#20251F]/30 hover:border-[#20251F] text-[#20251F] transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button 
                  onClick={confirmRename}
                  className="px-4 py-2 bg-[#214C3A] text-[#FFFDF7] hover:bg-[#183a2b] transition-colors cursor-pointer shadow-drafting-sm"
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
