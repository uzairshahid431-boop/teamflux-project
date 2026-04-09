import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import { registerUser, loginUser } from "../utils/api";
import { useAuth } from "../Context/AuthContext";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Simple validation
  const validateForm = () => {
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    setError("");
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await registerUser(username, email, password);

      setSuccess("Account created successfully!");

      // Automatically login the user
      const data = await loginUser(email, password);
      await login(data.refresh_token);

      // Auth context and protected routes will handle the redirect, but to be safe:
      navigate("/");

    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
      <div className="bg-white p-8 sm:p-10 max-w-[420px] w-full rounded-2xl border border-gray-100 shadow-sm animate-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-blue-700 tracking-tight mb-2">TeamFlux</h2>
          <p className="text-gray-500 text-sm">Join the TeamFlux community</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 text-xs font-medium flex items-center gap-2">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="username">
              Name
            </label>
            <input
              id="username"
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading || !!success}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || !!success}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="password"
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !!success}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                tabIndex={-1}
                disabled={loading || !!success}
              >
                {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <NavLink to="/login" className="text-blue-600 hover:text-blue-800 font-bold">
              Sign In
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;