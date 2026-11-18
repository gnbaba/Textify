import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import { X, Check } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleLoginClick = async () => {
    await loginWithGoogle(rememberMe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#20251F]/50 backdrop-blur-sm px-4 font-mono-industrial text-[#20251F]">
      <div className="bg-[#FFFDF7] w-full max-w-sm border border-[#20251F] shadow-drafting-lg overflow-hidden">
        
        {/* Header bar */}
        <div className="bg-[#20251F] text-[#FFFDF7] px-4 py-2.5 flex items-center justify-between font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase">
          <span>[ AUTHENTICATE ]</span>
          <button onClick={onClose} className="hover:text-[#E96C3F] transition-colors cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-sm font-black uppercase mb-1.5 tracking-tight text-[#20251F]">WELCOME TO TEXTIFY</h2>
          <p className="text-[#20251F]/65 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.02em] mb-6">
            SIGN IN TO ACCESS YOUR SECURE CLOUD STORAGE AND UNLIMITED EXTRACTIONS.
          </p>

          {/* Login Button */}
          <button 
            onClick={handleLoginClick} 
            className="w-full bg-[#FFFDF7] border border-[#20251F]/30 text-[#20251F] py-3 px-4 font-bold text-[10px] tracking-[0.1em] uppercase hover:bg-[#20251F] hover:text-[#FFFDF7] transition-all flex items-center justify-center gap-3 mb-6 shadow-drafting-sm cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            CONTINUE WITH GOOGLE
          </button>

          {/* Remember Me Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer appearance-none w-4 h-4 border border-[#20251F]/40 bg-[#F3EFE3] checked:bg-[#214C3A] checked:border-[#214C3A] transition-colors cursor-pointer"
              />
              <Check className="w-3 h-3 text-[#FFFDF7] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <span className="text-[9px] font-bold text-[#20251F]/70 group-hover:text-[#20251F] uppercase tracking-wide transition-colors">
              REMEMBER ME ON THIS DEVICE
            </span>
          </label>

        </div>
      </div>
    </div>
  );
};