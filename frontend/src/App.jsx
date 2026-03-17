import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import LoginPage from "./login_signup/pages/LoginPage";
import RegisterPage from "./login_signup/pages/RegisterPage";
import DashboardLayout from "./dashboard/layout/DashboardLayout";
import MyFilesView from "./dashboard/pages/MyFilesView";
import PlaceholderView from "./dashboard/components/PlaceholderView";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<MyFilesView />} />
              <Route path="recents" element={<PlaceholderView title="Recents" description="Recent files will appear here." />} />
              <Route path="shared" element={<PlaceholderView title="Shared" description="Shared files will appear here." />} />
              <Route path="trash" element={<PlaceholderView title="Trash" description="Trashed files will appear here." />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
