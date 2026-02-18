import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (role, name) => {
    const userData = {
      role, // 'receptionist' or 'owner'
      name,
      loginTime: new Date().toISOString()
    };
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  const value = {
    user,
    login,
    logout,
    switchRole,
    isReceptionist: user?.role === 'receptionist',
    isOwner: user?.role === 'owner'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
