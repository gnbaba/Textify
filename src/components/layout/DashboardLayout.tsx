import React, { useState } from 'react';
import { useWorkspace } from '../../shared/context/WorkspaceContext';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useCloudHistory } from '../../features/history/hooks/useCloudHistory';

import { LoginModal } from '../../features/auth/components/LoginModal';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
  const { user, isAuthLoading, logout } = useAuth();
  const { documents, isLoading: isHistoryLoading, deleteExtraction, renameSession } = useCloudHistory(user?.uid);
  const { setActiveDocument, activeDocument } = useWorkspace();

  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [sessionToRename, setSessionToRename] = useState<{ id: string, title: string } | null>(null);
  const [renameInput, setRenameInput] = useState("");
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
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

  const handleMobileNavClose = () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const safeAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=4D694E&color=FFF3D5`;

  return (
    <div className="flex h-screen bg-[#FFF3D5]/20 overflow-hidden font-sans relative">
      
      <div 
        className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 h-full
        bg-[#FFF3D5] border-r border-[#4D694E]/10 flex flex-col shadow-inner
        transition-all duration-300 ease-in-out
        ${isSidebarOpen 
          ? 'translate-x-0 w-72 opacity-100' 
          : '-translate-x-full md:translate-x-0 md:w-0 opacity-0 overflow-hidden'}
      `}>
        <div className="p-4 flex justify-between items-center border-b border-[#4D694E]/10 min-w-[18rem]">
          <span className="font-extrabold text-xl text-[#4D694E] tracking-tight">Textify</span>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg text-[#4D694E]/60 hover:bg-[#4D694E]/10 hover:text-[#4D694E] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          </button>
        </div>

        <div className="p-4 min-w-[18rem]">
          <button 
            onClick={() => { setActiveDocument(null); setOpenMenuId(null); handleMobileNavClose(); }} 
            className="w-full flex items-center justify-center gap-2 bg-[#4D694E] text-[#FFF3D5] py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-[#4D694E]/90 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            New Extraction
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-visible px-3 pb-4 min-w-[18rem]">
          <p className="text-xs font-bold text-[#4D694E]/50 uppercase tracking-wider mb-3 px-2">Recent</p>
          
          <div className="space-y-1">
            {!user ? (
              <p className="text-sm text-[#4D694E]/60 px-3 italic">Sign in to view history.</p>
            ) : isHistoryLoading ? (
              <p className="text-sm text-[#4D694E]/60 px-3 animate-pulse">Loading cloud data...</p>
            ) : documents.length === 0 ? (
              <p className="text-sm text-[#4D694E]/60 px-3 italic">No extractions yet.</p>
            ) : (
              documents.map((item) => (
                <div key={item.id} className="relative group" onMouseEnter={() => setHoveredDocId(item.id)} onMouseLeave={() => setHoveredDocId(null)}>
                  <button 
                    onClick={() => { setActiveDocument(item); setOpenMenuId(null); handleMobileNavClose(); }} 
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group flex items-start gap-3 ${activeDocument?.id === item.id ? 'bg-[#4D694E]/10' : 'hover:bg-[#4D694E]/10'}`}
                  >
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-[#4D694E] truncate pr-6">{item.title}</p>
                      <p className="text-xs text-[#4D694E]/60 mt-0.5">{formatDate(item.timestamp)}</p>
                    </div>
                  </button>

                  {(hoveredDocId === item.id || openMenuId === item.id) && (
                    <div className="absolute top-2 right-2">
                      <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }} className={`p-1 rounded-md transition-colors ${openMenuId === item.id ? 'bg-[#4D694E]/20 text-[#4D694E]' : 'text-[#4D694E]/60 hover:bg-[#4D694E]/10 hover:text-[#4D694E]'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                      </button>
                      
                      {openMenuId === item.id && (
                        <div className="absolute right-0 top-8 w-32 bg-white border border-[#4D694E]/10 rounded-xl shadow-xl z-50 p-1 space-y-1 text-sm font-semibold animate-in fade-in duration-200">
                          <button onClick={(e) => handleRenameSessionClick(item.id, item.title, e)} className="w-full text-left px-3 py-2 rounded-lg text-[#4D694E] hover:bg-[#4D694E]/10">
                            Rename
                          </button>
                          <button onClick={(e) => handleDeleteSessionClick(item.id, e)} className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {!isAuthLoading && (
          <div className="mt-auto border-t border-[#4D694E]/10 bg-[#FFF3D5] p-5 min-w-[18rem] z-10">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={user.photoURL || safeAvatarUrl} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full border-2 border-[#4D694E]/20 shadow-sm object-cover bg-white"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = safeAvatarUrl;
                    }}
                  />
                  <div>
                    <p className="font-bold text-[#4D694E] tracking-tight">{user.displayName || 'Cloud User'}</p>
                    <p className="text-xs font-semibold text-[#4D694E]/60 mt-0.5 px-2 py-0.5 inline-block bg-[#4D694E]/5 border border-[#4D694E]/10 rounded-md">Pro Plan</p>
                  </div>
                </div>
                
                <button onClick={logout} className="w-full text-center bg-[#4D694E]/5 text-[#4D694E] py-2.5 px-4 rounded-xl font-bold text-sm hover:bg-[#4D694E]/10 hover:text-[#4D694E] border border-[#4D694E]/20 transition-all flex items-center justify-center gap-2 group">
                  <svg className="w-4 h-4 text-[#4D694E]/60 group-hover:text-[#4D694E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign Out
                </button>
              </div>
            ) : (

              <button onClick={() => setIsLoginModalOpen(true)} className="w-full bg-[#4D694E] text-[#FFF3D5] py-3 px-5 rounded-xl text-sm font-bold shadow-md hover:bg-[#4D694E]/90 transition-all flex items-center gap-2 justify-center">
                Sign in with Google
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 flex items-center px-4 md:px-6 z-10">
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 mr-4 rounded-lg text-[#4D694E]/60 hover:bg-[#4D694E]/10 hover:text-[#4D694E] transition-colors flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          )}
          <div className="flex-1"></div>
        </header>

        <main onClick={() => setOpenMenuId(null)} className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className="max-w-3xl w-full">
            {children}
          </div>
        </main>
      </div>

      {sessionToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Session?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Are you sure you want to delete this session and all of its extractions? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setSessionToDelete(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sessionToRename && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFF3D5] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-[#4D694E]/20">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#4D694E] mb-2">Rename Session</h3>
              <p className="text-sm text-[#4D694E]/70 mb-4">Enter a new name for your extraction session.</p>
              
              <input 
                type="text" 
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); }}
                className="w-full px-4 py-3 rounded-xl border border-[#4D694E]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#4D694E] text-[#4D694E] font-medium mb-6"
              />
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setSessionToRename(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#4D694E]/70 hover:bg-[#4D694E]/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRename}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#FFF3D5] bg-[#4D694E] hover:bg-[#3a4f3b] transition-colors shadow-sm"
                >
                  Save Changes
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