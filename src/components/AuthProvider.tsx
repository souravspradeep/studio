
'use client';

import React, { createContext, useContext, useState } from 'react';

// This is now a mock user. In a real app, this would come from a database.
export interface AuthUser {
  uid: string;
  email?: string;
  fullName?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
});

// A mock user that is always "logged in"
const mockUser: AuthUser = {
  uid: 'mock-user-123',
  email: 'user@example.com',
  fullName: 'Campus User',
  photoURL: '',
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // The user is always logged in, and loading is always false.
  const [user] = useState<AuthUser | null>(mockUser);
  const [isLoading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
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
