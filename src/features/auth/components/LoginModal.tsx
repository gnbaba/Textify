import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; 

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleLoginClick = async () => {
    // Pass the checkbox state to our updated useAuth hook
    await loginWithGoogle(rememberMe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200 px-4 font-sans text-[#4D694E]">
      <div className="bg-[#FFF3D5] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-[#4D694E]/20">
        <div className="p-8">
          
          {/* Header */}
          <div className="flex justify-end mb-2">
            <button onClick={onClose} className="text-[#4D694E]/50 hover:text-[#4D694E] hover:bg-[#4D694E]/10 p-2 rounded-full transition-colors" aria-label="Close">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <h2 className="text-2xl font-extrabold mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-[#4D694E]/70 text-sm mb-8 font-medium">
            Sign in to access your permanent cloud storage and unlimited extractions.
          </p>

          {/* Login Button */}
          <button 
            onClick={handleLoginClick} 
            className="w-full bg-white border border-[#4D694E]/20 text-[#4D694E] py-3.5 px-4 rounded-xl font-bold text-base hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Continue with Google
          </button>

          {/* Remember Me Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer appearance-none w-5 h-5 border-2 border-[#4D694E]/40 rounded bg-white checked:bg-[#4D694E] checked:border-[#4D694E] transition-colors cursor-pointer"
              />
              <svg className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#4D694E]/80 group-hover:text-[#4D694E] transition-colors">
              Remember me on this device
            </span>
          </label>

        </div>
      </div>
    </div>
  );
};