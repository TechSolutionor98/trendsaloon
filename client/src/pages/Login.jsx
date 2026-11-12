"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Star, ShieldCheck, Sparkles } from "lucide-react"
import { useLanguage } from "../context/LanguageContext"
import TranslatedText from "../components/TranslatedText"
import { resolvePostAuthPath, clearReturnPath } from "../utils/authRedirect"
import { TrendLogo } from "../components/TrendHeader"

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { showToast } = useToast()
  const { getLocalizedPath } = useLanguage()

  // Check if user is coming from checkout page
  const isFromCheckout = location.state?.from?.pathname === "/checkout"

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [verifyEmail, setVerifyEmail] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")

      const loginData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      }

      const result = await login(loginData)

      if (result.success) {
        showToast && showToast("Logged in successfully!", "success")
        const redirectTo = resolvePostAuthPath(location.state, getLocalizedPath)
        clearReturnPath()
        navigate(redirectTo, { replace: true })
      } else {
        setError(result.message)
        setVerifyEmail(result.requiresVerification ? result.email || loginData.email : "")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setVerifyEmail("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Left Side: Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10">
          <div className="max-w-md w-full space-y-6">
            {/* Header Brand & Title */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-1">
                <TrendLogo />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">
                <TranslatedText>Welcome Back</TranslatedText>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {isFromCheckout ? (
                  <span>Sign in to complete your salon booking and checkout</span>
                ) : (
                  <span>Sign in to access your appointments and orders</span>
                )}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 rounded-xl text-xs sm:text-sm border border-red-100 animate-fadeIn">
                <div>{error}</div>
                {verifyEmail && (
                  <Link
                    to={getLocalizedPath(`/verify-email?email=${encodeURIComponent(verifyEmail)}`)}
                    className="mt-1.5 inline-block font-semibold text-[#dfa742] underline underline-offset-2 hover:text-[#caa638]"
                  >
                    Resend verification code
                  </Link>
                )}
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700">
                  <TranslatedText>Email Address</TranslatedText>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3.5 py-3 text-sm bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#dfa742] focus:ring-2 focus:ring-[#dfa742]/20 transition-all"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700">
                  <TranslatedText>Password</TranslatedText>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 text-sm bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#dfa742] focus:ring-2 focus:ring-[#dfa742]/20 transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#dfa742] border-gray-300 rounded focus:ring-[#dfa742] cursor-pointer"
                  />
                  <span className="text-xs text-gray-600">
                    <TranslatedText>Remember me</TranslatedText>
                  </span>
                </label>

                <Link
                  to={getLocalizedPath("/forgot-password")}
                  className="text-xs font-semibold text-[#b38743] hover:text-[#dfa742] transition-colors"
                >
                  <TranslatedText>Forgot password?</TranslatedText>
                </Link>
              </div>

              {/* Submit Button (Gold Pill) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#dfa742] hover:bg-[#caa638] text-black font-bold py-3.5 px-6 rounded-full shadow-lg shadow-[#dfa742]/25 text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-400 uppercase tracking-wider font-semibold">
                    <TranslatedText>Or</TranslatedText>
                  </span>
                </div>
              </div>

              {/* Guest Checkout Option */}
              <button
                type="button"
                onClick={() => navigate(getLocalizedPath("/guest"))}
                className="w-full py-3 px-4 border-2 border-[#dfa742] rounded-full text-xs sm:text-sm font-bold text-[#b38743] hover:bg-amber-50/50 hover:text-[#8f641e] transition-all flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>
                  <TranslatedText>Continue as Guest</TranslatedText>
                </span>
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-2 text-xs text-gray-600">
                <TranslatedText>Don't have an account?</TranslatedText>{" "}
                <Link
                  to={getLocalizedPath("/register")}
                  state={isFromCheckout ? { from: { pathname: "/checkout" } } : undefined}
                  className="font-bold text-[#b38743] hover:text-[#dfa742] hover:underline"
                >
                  <TranslatedText>Sign up</TranslatedText>
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Luxury Salon Visual */}
        <div className="hidden md:block md:w-1/2 relative bg-[#0e0e10] overflow-hidden">
          <img
            src="/salon/hero-barber.jpg"
            alt="Trend Salon Grooming"
            className="w-full h-full object-cover filter brightness-80"
          />
          {/* Dark Luxury Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Luxury Salon Overlay Content */}
          <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-between text-white z-10">
            {/* Top Stars & Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#dfa742] fill-current" />
                ))}
              </div>
              <div className="bg-black/60 backdrop-blur-md border border-[#dfa742]/40 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-[#dfa742]">
                VIP Grooming
              </div>
            </div>

            {/* Bottom Quote & Location */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#dfa742] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Look Good • Feel Great</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
                Premium Grooming & Wellness for the Modern Gentleman
              </h3>
              <p className="text-xs text-gray-300 font-light flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Al Yasmeen - Ajman • UAE</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
