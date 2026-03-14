import { createContext, useState, useContext, useEffect } from 'react';
import { loginApi, registerApi, googleAuthApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const storedName = localStorage.getItem('user_name') || "User";
      setUser({ email: "user@cloudvault.com", name: storedName });
    }
  }, [token]);

  const login = async (email, password, name = null) => {
    const data = await loginApi(email, password);
    const userName = name || data.full_name || localStorage.getItem('user_name') || "User";
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user_name', userName);
    setToken(data.access_token);
    setUser({ email, id: "user-id", name: userName });
  };

  const register = async (name, email, password) => {
    await registerApi(name, email, password);
    // auto login after successful register with the name provided
    await login(email, password, name);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    setToken(null);
    setUser(null);
  };

  const googleLogin = async (credential) => {
    const data = await googleAuthApi(credential);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user_name', data.full_name || "User");
    setToken(data.access_token);
    setUser({ id: "user-id", name: data.full_name || "User" });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
