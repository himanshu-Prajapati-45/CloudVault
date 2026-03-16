import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import LoginPage from "../login_signup/pages/LoginPage";
import RegisterPage from "../login_signup/pages/RegisterPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard/*" element={<div>Dashboard</div>} />
      </Route>
    </Routes>
  );
}
