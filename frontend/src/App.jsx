import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./components/LoginPage";
import FilesPage from "./components/FilesPage";
import SettingsPage from "./components/SettingsPage";
import PublicSharedPage from "./components/PublicSharedPage";
import LandingPage from "./components/LandingPage";
import ForgotPasswordPage from "./login_signup/pages/ForgotPasswordPage";
import ResetPasswordPage from "./login_signup/pages/ResetPasswordPage";
import SharedLinksView from "./dashboard/pages/SharedLinksView";

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage initialTab="signup" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Public shared link */}
          <Route path="/share/:id" element={<PublicSharedPage />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<FilesPage />} />
            <Route path="shared" element={<FilesPage />} />
            <Route path="recent" element={<FilesPage />} />
            <Route path="trash" element={<FilesPage />} />
            <Route path="shared-links" element={<SharedLinksView />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
