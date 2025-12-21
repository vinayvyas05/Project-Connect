import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'

  // Persistent login: Check if token exists on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatus('unauthenticated');
        return;
      }
      try {
        // Use the profile endpoint we created in the backend
        const { data } = await API.get('/auth/profile'); 
        setUser(data.user);
        setStatus('authenticated');
      } catch (err) {
        localStorage.removeItem('token');
        setStatus('unauthenticated');
      }
    };
    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setStatus('authenticated');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setStatus('unauthenticated');
  };

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {status === 'loading' ? <div>Loading Dev-Pulse...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);