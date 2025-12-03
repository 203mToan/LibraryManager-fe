import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, mockUsers } from '../data/mockData';

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
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const userWithoutPassword = { ...foundUser };
      delete (userWithoutPassword as any).password;
      setUser(userWithoutPassword);
      localStorage.setItem('library_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('library_user');
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    const exists = mockUsers.find((u) => u.email === email);
    if (exists) {
      return false;
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      email,
      password,
      name,
      role: 'borrower',
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    const userWithoutPassword = { ...newUser };
    delete (userWithoutPassword as any).password;
    setUser(userWithoutPassword);
    localStorage.setItem('library_user', JSON.stringify(userWithoutPassword));
    return true;
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
