import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from './api';

interface User {
  email: string;
  name?: string;
  role: 'admin' | 'client_user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função de logout que limpa tudo
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // Nova função de login que salva o token E busca o usuário
  const login = async (token: string) => {
    localStorage.setItem('authToken', token);
    // Força o apiClient a usar o novo token imediatamente
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      const response = await apiClient.get('/users/me');
      setUser(response.data);
    } catch (error) {
      console.error("Falha ao buscar usuário após o login", error);
      logout(); // Se falhar, limpa tudo por segurança
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      login(token).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};