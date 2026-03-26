import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<{
  user: string | null;
  login: (token: string) => void;
  logout: () => void;
}>({ user: null, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  // 앱 시작 시 저장된 토큰 불러오기
  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      if (token) setUser(token);
    });
  }, []);

  const login = async (token: string) => {
    await AsyncStorage.setItem('token', token);
    setUser(token);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
