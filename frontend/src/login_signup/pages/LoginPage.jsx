import { AuthCard, GoogleButton, InputField, Divider } from "../components";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const formData = new FormData(e.target);
      await login(formData.get("email"), formData.get("password"));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to login");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://c4.wallpaperflare.com/wallpaper/9/519/764/mountains-best-for-desktop-background-wallpaper-preview.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md px-4">
        <AuthCard>
          <h1 className="text-2xl font-semibold text-white text-center mb-6">
            Login
          </h1>

          <form onSubmit={handleLogin}>
            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-100/10 rounded-xl border border-red-500/50">{error}</div>}
            <InputField type="email" name="email" placeholder="Enter your email" required />
            <InputField type="password" name="password" placeholder="Enter your password" required />

            <Divider />
            <div className="mb-4">
              <GoogleButton onError={setError} />
            </div>

            <button type="submit" className="w-full mt-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition shadow-lg shadow-indigo-500/30">
              Login
            </button>
          </form>

          <p className="text-slate-300 text-sm text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-white hover:text-indigo-400 transition-colors font-semibold">Sign up</Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}