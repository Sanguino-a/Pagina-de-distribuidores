import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, query, where, getDocs, collection } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data() || {};
        
        setRol(userData.rol || null);
        setUserProfile({
          ...userData,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || userData.nombre || firebaseUser.email,
          uid: firebaseUser.uid
        });
      } else {
        setRol(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const resetPassword = async (email) => {
    try {
      // First, check if the email exists in our users collection
      const usersQuery = query(
        collection(db, 'users'), 
        where('email', '==', email.toLowerCase().trim())
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      // If no user found with this email, return error
      if (querySnapshot.empty) {
        return { 
          success: false, 
          message: 'No se encontró una cuenta con este correo electrónico.' 
        };
      }
      
      // If user exists, send password reset email
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Email de restablecimiento enviado' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      rol, 
      userProfile, 
      loading,
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}