// src/hooks/useAuth.ts
import { createContext, useContext, useState, ReactNode } from 'react';

const AuthContext = createContext<any>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const signOut = () => {
    setUser(null);
    setProfile(null);
  };

  const value = { user, profile, loading, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};