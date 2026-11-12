"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Scissors,
  Sparkles,
  ImageIcon,
  Plus,
  ExternalLink,
  LogOut,
  ChevronDown,
  ChevronRight,
  Package,
  Boxes,
  Users,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react"

const AdminSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminLogout, admin } = useAuth()

  // Track expanded groups
  const [openDropdowns, setOpenDropdowns] = useState({
    orders: false,
    products: true,
    services: true,
  })

  // Auto-expand active groups based on pathname & search
  useEffect(() => {
    const path = location.pathname
    const search = location.search

    if (path.includes("/admin/orders")) {
      setOpenDropdowns((prev) => ({ ...prev, orders: true }))
    }

    if (path.includes("/admin/products") || path.includes("/admin/add-product") || path.includes("/admin/inventory")) {
      if (search.includes("type=services") || search.includes("type=service")) {
        setOpenDropdowns((prev) => ({ ...prev, services: true }))
      } else {
        setOpenDropdowns((prev) => ({ ...prev, products: true }))
      }
    }
  }, [location.pathname, location.search])

  const toggleDropdown = (key, e) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleLogout = () => {
    adminLogout()
    navigate("/grabiansadmin/login")
  }

  // Check if a path + search is active
  const isItemActive = (path, searchParam = "") => {
    if (searchParam) {
      return location.pathname === path && location.search.includes(searchParam)
    }
    return location.pathname === path && (!location.search || location.search === "")
  }

  return (
    <aside className="w-64 bg-[#0d0e11] text-gray-200 h-[133.33vh] border-r border-[#22252d] fixed left-0 top-0 z-50 flex flex-col shadow-2xl select-none">
      {/* 1. BRAND HEADER */}
      <div className="p-5 border-b border-[#22252d] bg-[#12141a]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dfa742] to-[#b8832a] flex items-center justify-center text-black shadow-md shadow-[#dfa742]/20 flex-shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-wider text-white uppercase font-serif truncate">
              Trend Saloon
            </h1>
            <div className="inline-flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfa742] animate-pulse" />
              <span className="text-[10px] text-[#dfa742] font-semibold tracking-widest uppercase">
                Admin Console
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION MENU (Strictly Tailored Sections) */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
        {/* SECTION LABEL */}
        <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Management
        </p>

        {/* 1. DASHBOARD */}
        <Link
          to="/admin/dashboard"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            location.pathname === "/admin/dashboard"
              ? "bg-[#dfa742] text-black font-semibold shadow-md shadow-[#dfa742]/20"
              : "text-gray-300 hover:text-white hover:bg-[#1a1d24]"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        {/* 2. ORDERS & BOOKINGS (Dropdown with all order statuses) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={(e) => toggleDropdown("orders", e)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname.startsWith("/admin/orders")
                ? "text-white bg-[#1a1d24]"
                : "text-gray-300 hover:text-white hover:bg-[#1a1d24]"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4 text-[#dfa742]" />
              <span>Orders</span>
            </div>
            {openDropdowns.orders ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {openDropdowns.orders && (
            <div className="pl-6 pr-1 pt-1 pb-1 space-y-0.5">
              {/* All Orders */}
              <Link
                to="/admin/orders"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isItemActive("/admin/orders")
                    ? "bg-[#dfa742]/20 text-[#dfa742] font-semibold border-l-2 border-[#dfa742]"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                }`}
              >
                <span>All Orders</span>
              </Link>

              {/* New Orders */}
              <Link
                to="/admin/orders?status=New"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isItemActive("/admin/orders", "status=New")
                    ? "bg-[#dfa742]/20 text-[#dfa742] font-semibold border-l-2 border-[#dfa742]"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>New Orders</span>
              </Link>

              {/* Confirmed Orders */}
              <Link
                to="/admin/orders?status=Confirmed"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isItemActive("/admin/orders", "status=Confirmed")
                    ? "bg-[#dfa742]/20 text-[#dfa742] font-semibold border-l-2 border-[#dfa742]"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span>Confirmed</span>
              </Link>

              {/* Processing Orders */}
              <Link
                to="/admin/orders?status=Processing"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isItemActive("/admin/orders", "status=Processing")
                    ? "bg-[#dfa742]/20 text-[#dfa742] font-semibold border-l-2 border-[#dfa742]"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Processing</span>
              </Link>

              {/* Delivered Orders */}
              <Link
                to="/admin/orders?status=Delivered"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isItemActive("/admin/orders", "status=Delivered")
                    ? "bg-[#dfa742]/20 text-[#dfa742] font-semibold border-l-2 border-[#dfa742]"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Delivered</span>
              </Link>

              {/* Cancelled Orders */}
              <Link
                to="/admin/orders?status=Cancelled"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isItemActive("/admin/orders", "status=Cancelled")
                    ? "bg-[#dfa742]/20 text-[#dfa742] font-semibold border-l-2 border-[#dfa742]"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span>Cancelled</span>
              </Link>
            </div>
          )}
        </div>

        {/* 3. PRODUCTS DROPDOWN */}
        <div className="pt-1">
          <button
            type="button"
            onClick={(e) => toggleDropdown("products", e)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              (location.pathname === "/admin/products" && !location.search.includes("type=services")) ||
              (location.pathname === "/admin/products/add" && !location.search.includes("type=service")) ||
              location.pathname.includes("/admin/inventory")
                ? "text-white bg-[#1a1d24]"
                : "text-gray-300 hover:text-white hover:bg-[#1a1d24]"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-[#dfa742]" />
              <span>Products</span>
            </div>
            {openDropdowns.products ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {openDropdowns.products && (
            <div className="pl-6 pr-1 pt-1 pb-1 space-y-0.5">
              {/* All Products */}
              <Link
                to="/admin/products?type=products"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isItemActive("/admin/products", "type=products") ||
                  (location.pathname === "/admin/products" && !location.search)
                    ? "bg-[#dfa742]/20 text-[#dfa742] font-semibold border-l-2 border-[#dfa742]"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>All Products</span>
              </Link>

              {/* Add Product */}
              <Link
                to="/admin/products/add?type=product"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isItemActive("/admin/products/add", "type=product")
                    ? "bg-[#dfa742]/20 text-[#dfa742] font-semibold border-l-2 border-[#dfa742]"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-green-400" />
                <span>Add Product</span>
              </Link>

              {/* Stock & Inventory */}
              <Link
                to="/admin/inventory"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  location.pathname.includes("/admin/inventory")
                    ? "bg-[#dfa742]/20 text-[#dfa742] font-semibold border-l-2 border-[#dfa742]"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                }`}
              >
                <Boxes className="w-3.5 h-3.5 text-amber-400" />
                <span>Stock & Inventory</span>
              </Link>
            </div>
          )}
        </div>

        {/* 4. SERVICES DROPDOWN */}
        <div className="pt-1">
          <button
            type="button"
            onClick={(e) => toggleDropdown("services", e)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.search.includes("type=services") || location.search.includes("type=service")
                ? "text-white bg-[#1a1d24]"
                : "text-gray-300 hover:text-white hover:bg-[#1a1d24]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Scissors className="w-4 h-4 text-[#dfa742]" />
              <span>Services</span>
            </div>
            {openDropdowns.services ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {openDropdowns.services && (
            <div className="pl-6 pr-1 pt-1 pb-1 space-y-0.5">
              {/* All Services */}
              <Link
                to="/admin/products?type=services"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isItemActive("/admin/products", "type=services")
                    ? "bg-[#dfa742]/20 text-[#dfa742] font-semibold border-l-2 border-[#dfa742]"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>All Services</span>
              </Link>

              {/* Add Service */}
              <Link
                to="/admin/products/add?type=service"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isItemActive("/admin/products/add", "type=service")
                    ? "bg-[#dfa742]/20 text-[#dfa742] font-semibold border-l-2 border-[#dfa742]"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1d24]"
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-[#dfa742]" />
                <span>Add Service</span>
              </Link>
            </div>
          )}
        </div>

        {/* 5. USERS & CUSTOMERS */}
        <div className="pt-1">
          <Link
            to="/admin/users"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname.startsWith("/admin/users")
                ? "bg-[#dfa742] text-black font-semibold shadow-md shadow-[#dfa742]/20"
                : "text-gray-300 hover:text-white hover:bg-[#1a1d24]"
            }`}
          >
            <Users className="w-4 h-4 text-[#dfa742]" />
            <span>Manage Users</span>
          </Link>
        </div>

        {/* 6. MAIN PAGE BANNERS */}
        <div className="pt-1">
          <Link
            to="/admin/banners"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname === "/admin/banners"
                ? "bg-[#dfa742] text-black font-semibold shadow-md shadow-[#dfa742]/20"
                : "text-gray-300 hover:text-white hover:bg-[#1a1d24]"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#dfa742]" />
            <span>Main Banners</span>
          </Link>
        </div>
      </nav>

      {/* 3. FOOTER ACTIONS */}
      <div className="p-4 border-t border-[#22252d] bg-[#12141a]/60 space-y-2">
        {/* Visit Live Website */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-[#1a1d24] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-3.5 h-3.5 text-[#dfa742]" />
            <span>Visit Salon Site</span>
          </div>
          <span className="text-[10px] bg-[#dfa742]/20 text-[#dfa742] px-1.5 py-0.5 rounded">
            Live
          </span>
        </a>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
