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
    <header className="h-20 flex items-center justify-between px-8 ml-64 top-0 right-0 left-64 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Admin User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 px-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#dfa742] to-[#b8832a] text-black font-bold rounded-full flex items-center justify-center text-xs shadow-sm">
              <User className="w-4 h-4 text-black" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-gray-900 leading-tight">
                {admin?.name || "Admin"}
              </p>
              <p className="text-[11px] text-gray-500 leading-tight">
                {admin?.email || "admin@trendsalon.ae"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900">{admin?.name || "Admin"}</p>
                <p className="text-[11px] text-gray-500 truncate">{admin?.email || "admin@trendsalon.ae"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors duration-200"
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
