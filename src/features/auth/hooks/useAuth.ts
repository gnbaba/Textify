import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult, 
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from '../../../config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        await getRedirectResult(auth);
      } catch (err) {
        console.error("Failed to process redirect login:", err);
        setError("Authentication failed. Please try again.");
      }
    };
    
    checkRedirect();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Added rememberMe parameter with default to true
  const loginWithGoogle = async (rememberMe: boolean = true) => {
    try {
      setError(null);
      // Set persistence based on the user's "Remember Me" choice
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);

      const provider = new GoogleAuthProvider();
      
      // Force the account chooser
      provider.setCustomParameters({ prompt: 'select_account' });

      // Detect if the user is on a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Safe for mobile: Navigates the same tab to Google to avoid COOP/Popup blocks
        await signInWithRedirect(auth, provider);
      } else {
        // Safe for desktop: Opens the standard popup window
        await signInWithPopup(auth, provider);
      }
    } catch (err) {
      console.error("Failed to log in with Google:", err);
      setError("Login was cancelled or encountered an error. Please try again.");
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      console.error("Failed to log out:", err);
      setError("Failed to sign out. Please check your connection.");
    }
  };

  return { user, isAuthLoading, error, loginWithGoogle, logout };
};