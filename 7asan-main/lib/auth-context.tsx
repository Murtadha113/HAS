"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth, ADMIN_UID } from "@/lib/firebase";

type AuthCtx = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  isAdmin: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
  error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (cred.user.uid !== ADMIN_UID) {
        await signOut(auth);
        setError("هذا الحساب ليس لديه صلاحيات الأدمن");
      }
    } catch (e: any) {
      const msg =
        e.code === "auth/invalid-credential" || e.code === "auth/wrong-password"
          ? "الإيميل أو كلمة المرور غلط"
          : e.code === "auth/too-many-requests"
          ? "محاولات كثيرة، انتظر قليلاً"
          : "حدث خطأ، حاول مرة ثانية";
      setError(msg);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = user?.uid === ADMIN_UID;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
