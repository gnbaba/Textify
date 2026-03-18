import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from '../../../config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Added rememberMe parameter with default to true
  const loginWithGoogle = async (rememberMe: boolean = true) => {
    try {
      // Set persistence based on the user's "Remember Me" choice
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);

      const provider = new GoogleAuthProvider();
      
      // Force the account chooser so you can switch accounts easily
      provider.setCustomParameters({ prompt: 'select_account' });
      
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Failed to log in with Google:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return { user, isAuthLoading, loginWithGoogle, logout };
};