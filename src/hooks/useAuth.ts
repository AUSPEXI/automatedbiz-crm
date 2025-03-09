import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Define the context with a proper type
interface AuthContextType {
  user: any | null;
  profile: any | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = () => {
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const value: AuthContextType = { user, profile, loading, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};