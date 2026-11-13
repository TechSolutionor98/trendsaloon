"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

const SuperAdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { adminLogin, adminLogout } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "email" ? value.trim().toLowerCase() : value,
    })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError("")
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
      }
      const result = await adminLogin(payload)
      if (result.success) {
        // Check if user is super admin
        if (result.isSuperAdmin) {
          navigate("/superadmin/dashboard")
        } else {
          adminLogout()
          setError("Access denied. Super Admin privileges required.")
        }
      } else {
        setError(result.message || "Invalid credentials. Please try again.")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0e11] text-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#dfa742]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#dfa742]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#14161d] rounded-2xl mb-4 shadow-2xl shadow-black/60 border border-[#262933] p-2 group hover:border-[#dfa742]/50 transition-colors">
            <img
              src="/white-logo.png"
              alt="Trend Saloon Super Admin"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(223,167,66,0.3)] transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-wide mb-2">
            Trend <span className="text-[#dfa742]">Super Admin</span>
          </h1>
          <p className="text-gray-400 text-sm">Secure control panel & system configuration</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#13151b] rounded-3xl shadow-2xl border border-white/10 p-8 relative">
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#dfa742]/50 to-transparent" />

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
              <p className="text-red-400 text-sm font-medium text-center">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-[#1a1d24] border border-white/10 rounded-xl focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742] transition-all text-white placeholder-gray-500 text-sm"
                  placeholder="superadmin@trendsaloon.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 bg-[#1a1d24] border border-white/10 rounded-xl focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742] transition-all text-white placeholder-gray-500 text-sm"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#dfa742] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#dfa742] via-[#e5b555] to-[#c99335] text-slate-950 font-bold py-3.5 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#dfa742]/20 hover:shadow-[#dfa742]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm tracking-wide"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Access Super Admin Panel →"
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-white/5 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2.5 text-[#dfa742] text-xs">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span className="text-gray-300">High security restricted area. All access sessions are logged.</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              <span className="font-semibold text-gray-400">Trend Saloon</span> &copy; Super Admin Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminLogin
