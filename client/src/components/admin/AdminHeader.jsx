"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { LogOut, User, ChevronDown } from "lucide-react"

const AdminHeader = () => {
  const { admin, adminLogout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    adminLogout()
    navigate("/grabiansadmin/login")
  }

  // Dynamic page title based on route and query param
  const getPageTitle = () => {
    const path = location.pathname
    const search = location.search

    if (path === "/admin/dashboard") return "Dashboard Overview"
    if (path.startsWith("/admin/orders")) return "Orders & Bookings"
    if (path.startsWith("/admin/users")) return "Users & Customers Management"
    if (path.includes("/admin/inventory")) return "Products Stock & Inventory"
    if (path === "/admin/banners") return "Main Page Banners Manager"
    if (path.includes("add-product") || path.includes("products/add")) {
      return search.includes("type=service") ? "Add New Salon Service" : "Add New Retail Product"
    }
    if (path.includes("/admin/products")) {
      return search.includes("type=services") ? "Salon Services Catalog" : "Retail Products Catalog"
    }
    return "Salon Admin Portal"
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 sm:px-8 ml-64 bg-[#12141a] border-b border-[#22252d] z-40 sticky top-0 shadow-md">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-[#dfa742] animate-pulse" />
        <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Live Storefront Quick Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-[#1a1d24] border border-[#22252d] hover:border-[#dfa742]/40 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#dfa742]" />
          <span>Visit Salon Site</span>
        </a>

        {/* Admin User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 px-3 py-1.5 rounded-xl hover:bg-[#1a1d24] border border-[#22252d] hover:border-[#dfa742]/40 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#dfa742] to-[#b8832a] text-black font-bold rounded-xl flex items-center justify-center text-xs shadow-md shadow-[#dfa742]/20">
              <User className="w-4 h-4 text-black" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">
                {admin?.name || "Admin"}
              </p>
              <p className="text-[11px] text-[#dfa742] leading-tight">
                {admin?.email || "admin@trendsalon.ae"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[#16181f] rounded-2xl shadow-2xl border border-[#22252d] py-2 z-50">
              <div className="px-4 py-2.5 border-b border-[#22252d]">
                <p className="text-xs font-bold text-white">{admin?.name || "Admin"}</p>
                <p className="text-[11px] text-gray-400 truncate">{admin?.email || "admin@trendsalon.ae"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-left text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors duration-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
