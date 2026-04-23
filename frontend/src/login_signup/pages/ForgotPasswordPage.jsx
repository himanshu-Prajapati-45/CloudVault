import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthCard, InputField } from "../components";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Something went wrong");
      }
      setSent(true);
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
          {sent ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-6">
                If <strong>{email}</strong> is registered, we sent a password reset link.
              </p>
              <p className="text-gray-400 text-xs mb-6">
                Didn't get it? Check your spam folder, or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-indigo-600 hover:text-indigo-700 underline"
                >
                  try again
                </button>
              </p>
              <Link
                to="/login"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                Forgot password?
              </h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                No worries. Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <InputField
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium transition shadow-lg shadow-indigo-500/30"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="text-gray-500 text-sm text-center mt-6">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-700 transition-colors font-semibold"
                >
                  Login
                </Link>
              </p>
            </>
          )}
        </AuthCard>
      </div>
    </div>
  );
}
