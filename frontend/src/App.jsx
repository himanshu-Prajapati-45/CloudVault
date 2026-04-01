import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import LoginPage from "./login_signup/pages/LoginPage";
import RegisterPage from "./login_signup/pages/RegisterPage";
import DashboardLayout from "./dashboard/layout/DashboardLayout";
import MyFilesView from "./dashboard/pages/MyFilesView";
import RecentsView from "./dashboard/pages/RecentsView";
import TrashView from "./dashboard/pages/TrashView";
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
              <Route path="recents" element={<RecentsView />} />
              <Route path="shared" element={
                <PlaceholderView 
                  title="Shared with You" 
                  description="Files shared by others will show up in this secure space." 
                  icon={<svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>}
                />
              } />
              <Route path="trash" element={<TrashView />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}