"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import {
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  ShieldCheck,
  Menu,
} from "lucide-react"

const SuperAdminHeader = () => {
  const { admin, adminLogout } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = async () => {
    try {
      await adminLogout()
      navigate("/superadmin/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#13151b]/95 backdrop-blur-md border-b border-white/10 z-30 shadow-lg">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left Section - Breadcrumb / Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            <span className="w-2 h-2 rounded-full bg-[#dfa742] animate-pulse" />
            <span className="text-[11px] font-medium text-gray-300">Live Saloon Engine</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-[#dfa742] transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#dfa742] rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#16181f] rounded-2xl shadow-2xl border border-white/10 py-2 z-50">
                <div className="px-4 py-3 border-b border-white/10">
                  <h3 className="font-semibold text-white text-sm">Notifications</h3>
                </div>
                <div className="py-8 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                  <p className="text-xs">No new notifications</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-white/5 border border-white/5 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#dfa742] to-[#c99335] rounded-lg flex items-center justify-center shadow-md shadow-[#dfa742]/20">
                <ShieldCheck className="w-4 h-4 text-slate-950" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white">{admin?.name || "Super Admin"}</p>
                <p className="text-[10px] text-[#dfa742] font-medium">Super Administrator</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#16181f] rounded-2xl shadow-2xl border border-white/10 py-2 z-50">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="font-semibold text-white text-sm">{admin?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{admin?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/superadmin/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-[#dfa742] transition-all"
                  >
                    <User className="w-4 h-4 text-[#dfa742]" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/superadmin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-[#dfa742] transition-all"
                  >
                    <Settings className="w-4 h-4 text-[#dfa742]" />
                    <span>Settings</span>
                  </Link>
                </div>
                <div className="border-t border-white/10 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 w-full text-left text-xs text-red-400 hover:bg-red-500/10 transition-all font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default SuperAdminHeader
