// TODO: replace with Supabase Auth (supabase.auth.signInWithPassword)
import type { ReactNode, FC } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

const ADMIN_SESSION_KEY = 'apm_local_delivery_admin_session';

// Admin Credentials
const SECURE_ADMIN_CREDENTIALS = {
  email: 'ajsolutionsmd@gmail.com',
  password: 'ajs@2026',
};

export interface AuthContextType {
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  adminLogin: (email: string, pass: string) => { success: boolean; error?: string };
  adminLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return isAdminAuthenticated ? SECURE_ADMIN_CREDENTIALS.email : null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, isAdminAuthenticated ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to save admin session to localStorage:', e);
    }
  }, [isAdminAuthenticated]);

  const adminLogin = (email: string, pass: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please enter both email address and password' };
    }

    if (
      cleanEmail === SECURE_ADMIN_CREDENTIALS.email.toLowerCase() &&
      cleanPass === SECURE_ADMIN_CREDENTIALS.password
    ) {
      setIsAdminAuthenticated(true);
      setAdminEmail(cleanEmail);
      return { success: true };
    }

    return { success: false, error: 'Invalid admin credentials. Access denied.' };
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (e) {
      console.warn('Failed to clear admin session from localStorage:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminEmail,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
