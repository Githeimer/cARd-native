import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';

interface AuthContextProps {
  user: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
