import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { token } = useAuth();
  
  // Also check localStorage directly to prevent React state flush race conditions 
  // immediately after login()/register() is called but before Context updates
  const isAuthenticated = token || localStorage.getItem('token');
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
