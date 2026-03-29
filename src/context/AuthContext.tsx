import app from '@/src/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

const auth = getAuth(app);
let sessionChecked = false;

const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}>({ user: null, isLoading: true, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 딱 한 번 rememberMe 확인
  useEffect(() => {
    if (sessionChecked) {
      setIsLoading(false);
      return;
    }
    sessionChecked = true;

    const checkRememberMe = async () => {
      if (auth.currentUser) {
        const rememberMe = await AsyncStorage.getItem('rememberMe');
        if (rememberMe !== 'true') {
          await signOut(auth);
        }
      }
      setIsLoading(false);
    };
    checkRememberMe();
  }, []);

  // 로그인/로그아웃 상태 변화만 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);


  const logout = async () => {
    await AsyncStorage.removeItem('rememberMe');
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
