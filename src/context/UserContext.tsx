
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, getUser } from '@/lib/db';
import { useRouter } from 'next/navigation';

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is "logged in" from a previous session (using sessionStorage)
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      const existingUser = getUser(storedUserId);
      if (existingUser) {
        setUser(existingUser);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    sessionStorage.setItem('userId', userData.id);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('userId');
    router.push('/');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
