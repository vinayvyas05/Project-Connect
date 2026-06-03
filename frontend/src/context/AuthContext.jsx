import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../api/auth/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on first load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRefreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      if (savedRefreshToken) setRefreshToken(savedRefreshToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData, jwtToken, refreshJwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    
    if (refreshJwtToken) {
      setRefreshToken(refreshJwtToken);
      localStorage.setItem("refreshToken", refreshJwtToken);
    }
    
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (e) {
      console.error("Logout failed on server", e);
    }
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
