import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../service/api';
import { registerUser } from '../service/authService';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'manager' | 'borrower';
  createdAt: string;
}

// Decode JWT token to extract claims
function decodeToken(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('library_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Use email/username as provided
      const userName = email;
      
      const response = await axiosInstance.post(
        `/login?UserName=${encodeURIComponent(userName)}&Password=${encodeURIComponent(password)}`,
        null
      );

      if (response.data && response.data.accessToken) {
        const decodedToken = decodeToken(response.data.accessToken);
        
        // Extract user info from JWT claims
        const role = decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.toLowerCase();
        const userName = decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        
        const user: User = {
          id: decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 'unknown',
          email: email,
          name: userName || email,
          role: role === 'admin' ? 'manager' : 'borrower',
          createdAt: new Date().toISOString(),
        };

        // Store tokens and user info
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('library_user', JSON.stringify(user));
        
        setUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('library_user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      const response = await registerUser({
        fullName: name,
        email: email,
        userName: email,
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        nationalId: '',
        password: password,
      });

      if (response && response.id) {
        const user: User = {
          id: response.id || 'unknown',
          email: email,
          name: name,
          role: 'borrower',
          createdAt: new Date().toISOString(),
        };

        setUser(user);
        localStorage.setItem('library_user', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
