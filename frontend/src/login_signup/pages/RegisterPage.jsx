import { AuthCard, GoogleButton, InputField, Divider } from "../components";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const formData = new FormData(e.target);
      const name = formData.get("fullname");
      const email = formData.get("email");
      const password = formData.get("password");
      const confirm = formData.get("confirm");

      if (password !== confirm) {
        throw new Error("Passwords do not match");
      }

      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to register");
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
            Create an Account ✨
          </h1>

          <form onSubmit={handleRegister}>
            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-100/10 rounded-xl border border-red-500/50">{error}</div>}
            <InputField type="text" name="fullname" placeholder="Full Name" required />
            <InputField type="email" name="email" placeholder="Email Address" required />
            <InputField type="password" name="password" placeholder="Password" required />
            <InputField type="password" name="confirm" placeholder="Confirm Password" required />

            <Divider />
            <div className="mb-4">
              <GoogleButton />
            </div>

            <button type="submit" className="w-full mt-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition shadow-lg shadow-indigo-500/30">
              Sign Up
            </button>
          </form>

          <p className="text-slate-300 text-sm text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-white hover:text-indigo-400 transition-colors font-semibold">Log in</Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
