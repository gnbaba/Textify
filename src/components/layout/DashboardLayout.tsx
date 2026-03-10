import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useCloudHistory } from '../../features/history/hooks/useCloudHistory';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // 1. Bring in the Auth and Database Hooks
  const { user, isAuthLoading, loginWithGoogle, logout } = useAuth();
  const { documents, isLoading: isHistoryLoading, fetchHistory } = useCloudHistory(user?.uid);

  // 2. Fetch history when the user logs in
  useEffect(() => {
    if (user?.uid) {
      fetchHistory();
    }
  }, [user?.uid, fetchHistory]);

  // Helper function to format the timestamp
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
    }).format(new Date(timestamp));
  };

  return (
    <div className="flex h-screen bg-[#FFF3D5]/20 overflow-hidden font-sans">
      
      <div 
        className={`bg-[#FFF3D5] border-r border-[#4D694E]/10 flex flex-col transition-all duration-300 ease-in-out shadow-inner ${
          isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden'
        }`}
      >
        {/* Sidebar Header: App Name & Close Icon */}
        <div className="p-4 flex justify-between items-center border-b border-[#4D694E]/10 min-w-[18rem]">
          <span className="font-extrabold text-xl text-[#4D694E] tracking-tight">Textify</span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg text-[#4D694E]/60 hover:bg-[#4D694E]/10 hover:text-[#4D694E] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          </button>
        </div>

        {/* Global Action: New Extraction (Logic coming soon!) */}
        <div className="p-4 min-w-[18rem]">
          <button 
            className="w-full flex items-center justify-center gap-2 bg-[#4D694E] text-[#FFF3D5] py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-[#4D694E]/90 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            New Extraction
          </button>
        </div>

        {/* Dynamic Cloud History List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 min-w-[18rem]">
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
                <button 
                  key={item.id} 
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#4D694E]/10 transition-colors group"
                >
                  <p className="text-sm font-medium text-[#4D694E] truncate">{item.title}</p>
                  <p className="text-xs text-[#4D694E]/60 mt-0.5">{formatDate(item.timestamp)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {!isAuthLoading && (
          <div className="mt-auto border-t border-[#4D694E]/10 bg-[#FFF3D5] p-5 min-w-[18rem]">
            {user ? (
              <div className="space-y-4">
                {/* 1. Profile Picture & Name */}
                <div className="flex items-center gap-4">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=4D694E&color=FFF3D5`} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full border-2 border-[#4D694E]/20 shadow-sm"
                  />
                  <div>
                    <p className="font-bold text-[#4D694E] tracking-tight">{user.displayName || 'Cloud User'}</p>
                    <p className="text-xs font-semibold text-[#4D694E]/60 mt-0.5 px-2 py-0.5 inline-block bg-[#4D694E]/5 border border-[#4D694E]/10 rounded-md">Free Plan</p>
                  </div>
                </div>
                
                {/* 2. Global Logout Button */}
                <button 
                  onClick={logout}
                  className="w-full text-center bg-[#4D694E]/5 text-[#4D694E] py-2.5 px-4 rounded-xl font-bold text-sm hover:bg-[#4D694E]/10 hover:text-[#4D694E] border border-[#4D694E]/20 transition-all flex items-center justify-center gap-2 group"
                >
                  {/* Exit Icon */}
                  <svg className="w-4 h-4 text-[#4D694E]/60 group-hover:text-[#4D694E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign Out
                </button>
              </div>
            ) : (
              // Case: User is not logged in.
              <button 
                onClick={loginWithGoogle}
                className="w-full bg-[#4D694E] text-[#FFF3D5] py-3 px-5 rounded-xl text-sm font-bold shadow-md hover:bg-[#4D694E]/90 transition-all flex items-center gap-2 justify-center"
              >
                {/* Google Logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Navigation Bar: Now holds ONLY the sidebar toggle */}
        <header className="h-16 flex items-center px-4 md:px-6">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 mr-4 rounded-lg text-[#4D694E]/60 hover:bg-[#4D694E]/10 hover:text-[#4D694E] transition-colors flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          )}
          <div className="flex-1"></div>
        </header>

        {/* Scrollable Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className="max-w-3xl w-full">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};