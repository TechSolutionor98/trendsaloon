"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import { resolvePostAuthPath, clearReturnPath } from "../utils/authRedirect"
import { TrendLogo } from "../components/TrendHeader"
import { Mail, CheckCircle2, AlertCircle } from "lucide-react"

const EmailVerification = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyEmail, resendVerification } = useAuth()
  const { getLocalizedPath } = useLanguage()

  const queryEmail = new URLSearchParams(location.search).get("email")
  const storedEmail = sessionStorage.getItem("pendingVerificationEmail")
  const email = (location.state?.email || queryEmail || storedEmail || "").trim().toLowerCase()

  useEffect(() => {
    if (email) {
      sessionStorage.setItem("pendingVerificationEmail", email)
    }
  }, [email])

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value

    setCode(newCode)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newCode.every((digit) => digit !== "") && newCode.join("").length === 6) {
      handleVerification(newCode.join(""))
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)

    if (pastedData.length === 6) {
      const newCode = pastedData.split("")
      setCode(newCode)
      setError("")

      // Focus last input
      inputRefs.current[5]?.focus()

      // Auto-submit
      handleVerification(pastedData)
    }
  }

  const handleVerification = async (verificationCode) => {
    if (!email) {
      setError("Email not found. Please register again.")
      return
    }

    if (verificationCode.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setLoading(true)
    setError("")

    try {
      await verifyEmail({
        email,
        code: verificationCode,
      })

      setSuccess("Email verified successfully! Redirecting...")
      sessionStorage.removeItem("pendingVerificationEmail")
      setTimeout(() => {
        // Registration often starts from the cart or a product page.
        const redirectTo = resolvePostAuthPath(location.state, getLocalizedPath)
        clearReturnPath()
        navigate(redirectTo, { replace: true })
      }, 2000)
    } catch (error) {
      setError(error.message || "Verification failed. Please try again.")
      setCode(["", "", "", "", "", ""]) // Clear code on error
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      setError("Email not found. Please register again.")
      return
    }

    setResendLoading(true)
    setError("")

    try {
      await resendVerification(email)
      setSuccess("Verification code sent successfully!")
      setResendCooldown(60) // 60 second cooldown
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      setError(error.message || "Failed to resend code. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const verificationCode = code.join("")
    handleVerification(verificationCode)
  }

  if (!email) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-1">
              <TrendLogo />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">Email Not Found</h2>
            <p className="text-sm text-gray-500">Please register first to verify your email.</p>
            <button
              onClick={() => navigate(getLocalizedPath("/register"))}
              className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-md shadow-[#dfa742]/20 text-sm font-bold text-black bg-gradient-to-r from-[#dfa742] via-[#e8be6d] to-[#dfa742] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#dfa742] transition-all"
            >
              Go to Register
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <TrendLogo />
          </div>

          <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-2xl bg-amber-50 border border-[#dfa742]/40 text-[#dfa742] shadow-sm">
            <Mail className="h-7 w-7 text-[#dfa742]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Verify Your Email
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            We've sent a 6-digit verification code to
            <br />
            <span className="font-semibold text-[#b38743]">{email}</span>
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-xs sm:text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-center gap-2 text-amber-900">
                <CheckCircle2 className="h-5 w-5 text-[#dfa742] shrink-0" />
                <p className="text-xs sm:text-sm font-medium">{success}</p>
              </div>
            </div>
          )}

          <div>
            <label className="sr-only">Verification Code</label>
            <div className="flex justify-center gap-2 sm:gap-2.5">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-11 sm:w-12 h-13 sm:h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all duration-150 outline-none ${
                    digit
                      ? "border-[#dfa742] ring-2 ring-[#dfa742]/30 bg-amber-50/20 text-gray-900"
                      : "border-gray-200 text-gray-900 focus:border-[#dfa742] focus:ring-2 focus:ring-[#dfa742]/30"
                  }`}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !Array.isArray(code) || code.some((digit) => digit === "")}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-black bg-gradient-to-r from-[#dfa742] via-[#e8be6d] to-[#dfa742] hover:brightness-105 shadow-md shadow-[#dfa742]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#dfa742] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </div>
              ) : (
                "Verify Email"
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading || resendCooldown > 0}
                className="font-bold text-[#b38743] hover:text-[#dfa742] hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {resendLoading ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmailVerification
