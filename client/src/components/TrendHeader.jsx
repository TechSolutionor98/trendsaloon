"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { ShoppingBag, Menu, X } from "lucide-react"

export function TrendLogo() {
  const navigate = useNavigate()
  const { getLocalizedPath } = useLanguage()

  return (
    <div
      onClick={() => navigate(getLocalizedPath("/"))}
      className="flex flex-col items-center justify-center select-none group cursor-pointer"
    >
      <div className="relative flex items-center justify-center mb-0.5">
        <svg
          className="w-9 h-9 sm:w-10 sm:h-10 text-[#dfa742] filter drop-shadow-[0_2px_4px_rgba(223,167,66,0.4)]"
          viewBox="0 0 64 64"
          fill="none"
        >
          <circle cx="32" cy="32" r="28" stroke="url(#goldLogoGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M22 18L42 46M42 18L22 46" stroke="url(#goldLogoGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="46" r="5" stroke="url(#goldLogoGrad)" strokeWidth="2" />
          <circle cx="44" cy="46" r="5" stroke="url(#goldLogoGrad)" strokeWidth="2" />
          <path d="M28 14L32 8L36 14" stroke="url(#goldLogoGrad)" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="32" cy="8" r="1.5" fill="#f7e7a9" />
          <circle cx="26" cy="10" r="1.2" fill="#f7e7a9" />
          <circle cx="38" cy="10" r="1.2" fill="#f7e7a9" />
          <defs>
            <linearGradient id="goldLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dfa742" />
              <stop offset="50%" stopColor="#f7e7a9" />
              <stop offset="100%" stopColor="#c59d5f" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="font-serif font-black tracking-widest text-[#dfa742] text-sm sm:text-base uppercase leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        TREND
      </span>
      <span className="text-[8px] sm:text-[9px] tracking-[0.25em] text-[#e0cfab] uppercase font-medium mt-0.5">
        GENTS SALOON
      </span>
    </div>
  )
}

export default function TrendHeader({ active = "home" }) {
  const navigate = useNavigate()
  const { cartCount, openCart } = useCart()
  const { getLocalizedPath } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNav = (tab, path, hash = "") => {
    setMobileMenuOpen(false)
    if (hash && window.location.pathname.endsWith(path)) {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: "smooth" })
      return
    }
    navigate(getLocalizedPath(path + (hash ? `#${hash}` : "")))
  }

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
            onClick={() => handleNav("products", "/services", "products")}
            className={`text-sm font-medium tracking-wide transition-colors ${
              active === "products"
                ? "text-[#dfa742] border-b-2 border-[#dfa742] pb-0.5"
                : "text-gray-300 hover:text-[#dfa742]"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("contact")
              if (el) el.scrollIntoView({ behavior: "smooth" })
              else handleNav("contact", "/", "contact")
            }}
            className="text-gray-300 hover:text-[#dfa742] text-sm font-medium tracking-wide transition-colors"
          >
            Contact
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Book Appointment CTA Button (Matching Mockup) */}
          <button
            onClick={() => handleNav("services", "/services")}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#dfa742] hover:bg-[#caa638] text-black font-semibold text-xs sm:text-sm px-4 py-2 rounded-full shadow-md shadow-[#dfa742]/20 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span>📅</span>
            <span>Book Appointment</span>
          </button>

          {/* Cart Icon - Opens Slide-over Cart Sidebar */}
          <button
            onClick={openCart}
            className="relative p-2 text-white hover:text-[#dfa742] transition-colors"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 bg-[#dfa742] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
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
            onClick={() => handleNav("products", "/services", "products")}
            className="block w-full text-left text-gray-200 hover:text-[#dfa742] text-base py-1"
          >
            Products
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              const el = document.getElementById("contact")
              if (el) el.scrollIntoView({ behavior: "smooth" })
              else handleNav("contact", "/", "contact")
            }}
            className="block w-full text-left text-gray-200 hover:text-[#dfa742] text-base py-1"
          >
            Contact
          </button>
        </div>
      )}
    </header>
  )
}

