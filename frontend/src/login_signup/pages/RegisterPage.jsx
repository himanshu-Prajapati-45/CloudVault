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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white relative">
      <div className="absolute inset-0"></div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <img src="/src/assets/logo.png" alt="CloudVault" className="w-full h-full object-cover rounded-xl" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">CloudVault</span>
          </div>
        </div>
        <AuthCard>
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">
            Create an Account
          </h1>

          <form onSubmit={handleRegister}>
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">{error}</div>}
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

          <p className="text-gray-500 text-sm text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors font-semibold">Log in</Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
