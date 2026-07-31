'use client';

// Admin authentication state, shared across the whole admin dashboard.
// Firebase keeps the session in local storage, so a page refresh does not
// log the admin out (session persistence).
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdmin, getAdminRole } from '@/lib/db';

const AuthContext = createContext({ user: null, admin: false, role: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Only accounts listed in the "admins" collection may use the dashboard.
        const allowed = await isAdmin(firebaseUser.uid).catch(() => false);
        setAdmin(allowed);
        // An admin document with no role predates roles existing, and is
        // treated as the owner so the original account never loses access.
        setRole(allowed ? await getAdminRole(firebaseUser.uid) : null);
      } else {
        setAdmin(false);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  // Firebase emails the reset link; the app never sees or sets the password.
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  return (
    <AuthContext.Provider value={{ user, admin, role, isOwner: role !== 'staff', loading, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
