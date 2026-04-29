import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { loginApi, registerApi, googleAuthApi } from '../services/api';

const AuthContext = createContext();

const SESSION_TIMEOUT_MS = 7 * 60 * 1000; // 7 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const timerRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('auth_provider');
    localStorage.removeItem('login_time');
    setToken(null);
    setUser(null);
  }, []);

  // Check if session has expired
  const checkSessionExpiry = useCallback(() => {
    const loginTime = localStorage.getItem('login_time');
    if (!loginTime) return;
    if (Date.now() - parseInt(loginTime, 10) > SESSION_TIMEOUT_MS) {
      logout();
    }
  }, [logout]);

  // On mount: restore user from localStorage OR logout if expired
  useEffect(() => {
    if (token) {
      const loginTime = localStorage.getItem('login_time');
      // If no login_time stored (legacy session) or session expired → force logout
      if (!loginTime || Date.now() - parseInt(loginTime, 10) > SESSION_TIMEOUT_MS) {
        logout();
        return;
      }
      const storedName = localStorage.getItem('user_name') || "User";
      const storedEmail = localStorage.getItem('user_email') || "";
      const storedProvider = localStorage.getItem('auth_provider') || 'email';
      setUser({ email: storedEmail, name: storedName, auth_provider: storedProvider });
    }
  }, [token, logout]);

  // Periodic session check every 30 seconds
  useEffect(() => {
    if (!token) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(checkSessionExpiry, 30 * 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [token, checkSessionExpiry]);

  const login = async (email, password, name = null) => {
    const data = await loginApi(email, password);
    const userName = name || data.full_name || localStorage.getItem('user_name') || "User";
    const provider = data.auth_provider || 'email';
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user_name', userName);
    localStorage.setItem('user_email', email);
    localStorage.setItem('auth_provider', provider);
    localStorage.setItem('login_time', String(Date.now()));
    setToken(data.access_token);
    setUser({ email, id: "user-id", name: userName, auth_provider: provider });
  };

  const register = async (name, email, password) => {
    await registerApi(name, email, password);
    await login(email, password, name);
  };

  const googleLogin = async (credential) => {
    const data = await googleAuthApi(credential);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user_name', data.full_name || "User");
    localStorage.setItem('user_email', data.email || "");
    localStorage.setItem('auth_provider', 'google');
    localStorage.setItem('login_time', String(Date.now()));
    setToken(data.access_token);
    setUser({ id: "user-id", name: data.full_name || "User", email: data.email || "", auth_provider: 'google' });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

