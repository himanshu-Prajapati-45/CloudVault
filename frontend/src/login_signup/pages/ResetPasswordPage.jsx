import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthCard, InputField } from "../components";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Reset failed");
      }
      setDone(true);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          {done ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Password updated!
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                You can now log in with your new password.
              </p>
              <p className="text-gray-400 text-xs mb-4">Redirecting to login...</p>
              <Link
                to="/login"
                className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Go to login now
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                Set new password
              </h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Choose a strong password you won't forget.
              </p>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Password field */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      minLength={8}
                      required
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password field */}
                <InputField
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium transition shadow-lg shadow-indigo-500/30"
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>

              <p className="text-gray-500 text-sm text-center mt-6">
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-700 transition-colors font-semibold"
                >
                  Back to login
                </Link>
              </p>
            </>
          )}
        </AuthCard>
      </div>
    </div>
  );
}
