"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import {
  ShoppingBag,
  Menu,
  X,
  User,
  ChevronDown,
  Package,
  Truck,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react"

export function TrendLogo() {
  const navigate = useNavigate()
  const { getLocalizedPath } = useLanguage()

  return (
    <div
      onClick={() => navigate(getLocalizedPath("/"))}
      className="flex items-center gap-3 select-none group cursor-pointer"
    >
      <div className="relative flex-shrink-0">
        <img
          src="/white-logo.png"
          alt="Trend Gents Saloon Logo"
          width="56"
          height="56"
          decoding="async"
          className="h-12 sm:h-14 w-12 sm:w-14 object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_10px_rgba(223,167,66,0.35)]"
        />
      </div>
      <div className="flex flex-col justify-center text-left">
        <span className="font-serif font-black tracking-[0.22em] text-white text-base sm:text-lg uppercase leading-none group-hover:text-[#dfa742] transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          TREND
        </span>
        <span className="text-[9px] sm:text-[10px] tracking-[0.32em] text-[#dfa742] uppercase font-bold mt-1 leading-none drop-shadow-sm">
          SALOON
        </span>
      </div>
    </div>
  )
}

export default function TrendHeader({ active = "home" }) {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, isAdminAuthenticated, isSuperAdmin } = useAuth()
  const { cartCount, openCart } = useCart()
  const { getLocalizedPath } = useLanguage()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const profileButtonRef = useRef(null)

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target)
      ) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
    navigate(getLocalizedPath("/"))
  }

  const handleNav = (tab, path, hash = "") => {
    setMobileMenuOpen(false)
    setIsProfileOpen(false)
    if (hash && window.location.pathname.endsWith(path)) {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: "smooth" })
      return
    }
    navigate(getLocalizedPath(path + (hash ? `#${hash}` : "")))
  }

  // Display user name: first word or full name
  const displayName = isAuthenticated
    ? (user?.name?.split(" ")[0] || user?.name || "Account")
    : "Account"

  return (
    <header className="sticky top-0 z-50 bg-[#0e0e10]/95 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <TrendLogo />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNav("home", "/")}
            className={`text-sm font-medium tracking-wide transition-colors ${
              active === "home"
                ? "text-[#dfa742] border-b-2 border-[#dfa742] pb-0.5"
                : "text-gray-300 hover:text-[#dfa742]"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav("services", "/services")}
            className={`text-sm font-medium tracking-wide transition-colors ${
              active === "services"
                ? "text-[#dfa742] border-b-2 border-[#dfa742] pb-0.5"
                : "text-gray-300 hover:text-[#dfa742]"
            }`}
          >
            Services
          </button>
          <button
            onClick={() => handleNav("products", "/products")}
            className={`text-sm font-medium tracking-wide transition-colors ${
              active === "products"
                ? "text-[#dfa742] border-b-2 border-[#dfa742] pb-0.5"
                : "text-gray-300 hover:text-[#dfa742]"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => handleNav("contact", "/contact")}
            className={`text-sm font-medium tracking-wide transition-colors ${
              active === "contact"
                ? "text-[#dfa742] border-b-2 border-[#dfa742] pb-0.5"
                : "text-gray-300 hover:text-[#dfa742]"
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* User Account / Profile Section (Replaces Book Appointment Button) */}
          <div className="relative">
            <button
              ref={profileButtonRef}
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-white/10 text-white transition-all duration-200 border border-transparent hover:border-white/10"
              aria-label="Account"
            >
              <div className="w-8 h-8 rounded-full bg-[#dfa742]/15 border border-[#dfa742]/30 flex items-center justify-center text-[#dfa742] shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {isAuthenticated ? "Hello," : "Hello, Sign in"}
                </span>
                <span className="text-xs sm:text-[13px] font-semibold text-white whitespace-nowrap max-w-[110px] truncate">
                  {displayName}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 hidden sm:block ${
                  isProfileOpen ? "rotate-180 text-[#dfa742]" : ""
                }`}
              />
            </button>

            {/* Account Dropdown Menu */}
            {isProfileOpen && (
              <div
                ref={profileRef}
                className="absolute right-0 mt-2 w-56 rounded-xl bg-[#16161a] text-white shadow-2xl border border-white/15 py-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {isAuthenticated ? (
                  <>
                    {/* User Info Header */}
                    <div className="px-4 py-2.5 border-b border-white/10 bg-white/5">
                      <p className="text-[11px] text-gray-400">Signed in as</p>
                      <p className="text-sm font-bold text-[#dfa742] truncate">
                        {user?.name || "Customer"}
                      </p>
                      {user?.email && (
                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to={getLocalizedPath("/profile")}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-200 hover:text-[#dfa742] hover:bg-white/5 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#dfa742]" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to={getLocalizedPath("/orders")}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-200 hover:text-[#dfa742] hover:bg-white/5 transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-[#dfa742]" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to={getLocalizedPath("/track-order")}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-200 hover:text-[#dfa742] hover:bg-white/5 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#dfa742]" />
                        <span>Track Order</span>
                      </Link>

                      {isAdminAuthenticated && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#dfa742] font-semibold hover:bg-white/5 transition-colors border-t border-white/10"
                        >
                          <Settings className="w-3.5 h-3.5 text-[#dfa742]" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      {(isSuperAdmin || localStorage.getItem("isSuperAdmin") === "true") && (
                        <Link
                          to="/superadmin/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-emerald-400 font-semibold hover:bg-white/5 transition-colors border-t border-white/10"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Super Admin Portal</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 mt-1 border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-xs font-semibold text-white">Welcome to Trend Salon</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Manage your orders & appointments</p>
                    </div>

                    <div className="p-3 space-y-2">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false)
                          navigate(getLocalizedPath("/login"))
                        }}
                        className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-[#dfa742] text-black hover:bg-[#caa638] transition-colors shadow-md shadow-[#dfa742]/20"
                      >
                        Sign In / Login
                      </button>

                      <div className="text-center text-[11px] text-gray-400 pt-1">
                        New customer?{" "}
                        <button
                          onClick={() => {
                            setIsProfileOpen(false)
                            navigate(getLocalizedPath("/register"))
                          }}
                          className="text-[#dfa742] hover:underline font-semibold"
                        >
                          Register
                        </button>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-white/10">
                      <Link
                        to={getLocalizedPath("/track-order")}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:text-[#dfa742] hover:bg-white/5 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#dfa742]" />
                        <span>Track Order</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart Icon - Opens Slide-over Cart Sidebar */}
          <button
            onClick={openCart}
            className="relative p-2 text-white hover:text-[#dfa742] transition-colors rounded-full hover:bg-white/10"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-0.5 -right-0.5 bg-[#dfa742] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
              {cartCount || 0}
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-[#dfa742] p-1.5 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121216] border-b border-white/10 px-6 py-5 space-y-4 shadow-2xl">
          <button
            onClick={() => handleNav("home", "/")}
            className={`block w-full text-left font-semibold text-base py-1 ${
              active === "home" ? "text-[#dfa742]" : "text-gray-200"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav("services", "/services")}
            className={`block w-full text-left font-semibold text-base py-1 ${
              active === "services" ? "text-[#dfa742]" : "text-gray-200"
            }`}
          >
            Services
          </button>
          <button
            onClick={() => handleNav("products", "/products")}
            className={`block w-full text-left font-semibold text-base py-1 ${
              active === "products" ? "text-[#dfa742]" : "text-gray-200"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => handleNav("contact", "/contact")}
            className={`block w-full text-left font-semibold text-base py-1 ${
              active === "contact" ? "text-[#dfa742]" : "text-gray-200"
            }`}
          >
            Contact
          </button>

          {/* Mobile Account Section */}
          <div className="pt-3 border-t border-white/10 mt-3 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-[#dfa742]/20 border border-[#dfa742]/40 flex items-center justify-center text-[#dfa742]">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] text-gray-400">Signed in as</p>
                    <p className="text-sm font-semibold text-[#dfa742] truncate">
                      {user?.name || "Customer"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate(getLocalizedPath("/profile"))
                  }}
                  className="block w-full text-left px-2 py-1.5 text-sm text-gray-300 hover:text-[#dfa742]"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate(getLocalizedPath("/orders"))
                  }}
                  className="block w-full text-left px-2 py-1.5 text-sm text-gray-300 hover:text-[#dfa742]"
                >
                  My Orders
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="block w-full text-left px-2 py-1.5 text-sm text-red-400 hover:text-red-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate(getLocalizedPath("/login"))
                  }}
                  className="w-full py-2 px-4 text-sm font-bold rounded-lg bg-[#dfa742] text-black hover:bg-[#caa638] transition-colors"
                >
                  Sign In / Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate(getLocalizedPath("/register"))
                  }}
                  className="w-full py-1.5 px-4 text-xs text-center text-gray-400 hover:text-white"
                >
                  Don't have an account? <span className="text-[#dfa742] underline">Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}


