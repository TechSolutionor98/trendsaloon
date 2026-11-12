import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { TrendLogo } from "../components/TrendHeader";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Convert email to lowercase before sending
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setSuccess("If this email is registered, a reset link has been sent.");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <TrendLogo />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">Forgot Password</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Enter your email to receive a password reset link.</p>
        </div>
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}
        {success && <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-200">{success}</div>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3.5 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#dfa742] focus:border-[#dfa742] transition-colors text-sm"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-md shadow-[#dfa742]/20 text-sm font-bold text-black bg-gradient-to-r from-[#dfa742] via-[#e8be6d] to-[#dfa742] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#dfa742] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="text-center pt-2">
          <button
            className="text-xs sm:text-sm font-bold text-[#b38743] hover:text-[#dfa742] hover:underline transition-colors"
            onClick={() => navigate("/login")}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
