import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import { X, Check } from '@phosphor-icons/react';

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#4D694E]/40 px-4 font-mono-industrial text-[#4D694E]">
      <div className="bg-[#FFF3D5] w-full max-w-sm border-2 border-[#4D694E] overflow-hidden">
        
        {/* Header bar */}
        <div className="bg-[#4D694E] text-[#FFF3D5] px-4 py-2.5 flex items-center justify-between font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase">
          <span>&lt; SECURITY // SIGN-IN &gt;</span>
          <button onClick={onClose} className="hover:text-[#FFF3D5]/70" aria-label="Close">
            <X className="w-4 h-4" weight="bold" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-sm font-extrabold uppercase mb-2 tracking-wide">WELCOME BACK</h2>
          <p className="text-[#4D694E]/70 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.02em] mb-6">
            SIGN IN TO ACCESS YOUR SECURE CLOUD STORAGE AND UNLIMITED EXTRACTIONS.
          </p>

          {/* Login Button */}
          <button 
            onClick={handleLoginClick} 
            className="w-full bg-[#FFF3D5] border-2 border-[#4D694E] text-[#4D694E] py-3 px-4 font-bold text-[10px] tracking-[0.1em] uppercase hover:bg-[#4D694E] hover:text-[#FFF3D5] transition-all flex items-center justify-center gap-3 mb-6"
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
                className="peer appearance-none w-5 h-5 border-2 border-[#4D694E] bg-[#FFF3D5] checked:bg-[#4D694E] checked:border-[#4D694E] transition-colors cursor-pointer"
              />
              <Check className="w-3.5 h-3.5 text-[#FFF3D5] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" weight="bold" />
            </div>
            <span className="text-[9px] font-bold text-[#4D694E]/80 group-hover:text-[#4D694E] uppercase tracking-wide transition-colors">
              REMEMBER ME ON THIS DEVICE
            </span>
          </label>

        </div>
      </div>
    </div>
  );
};