"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  Users,
  Activity,
  UserCog,
  ShieldCheck,
  LogOut,
  ChevronDown,
  ChevronRight,
  Settings,
  Shield,
  ClipboardList,
  Menu,
  X,
  FileText,
  BarChart3,
} from "lucide-react"

const SuperAdminSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminLogout, admin } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState({
    adminManagement: false,
    activityLogs: false,
  })

  // Auto-open dropdowns based on current route
  useEffect(() => {
    const path = location.pathname

    setOpenDropdowns(prev => {
      const shouldOpenAdminManagement = path.includes("/superadmin/admins")
      const shouldOpenActivityLogs = path.includes("/superadmin/activity-logs")
      
      // Only update if values actually change
      if (prev.adminManagement === shouldOpenAdminManagement && 
          prev.activityLogs === shouldOpenActivityLogs) {
        return prev
      }
      
      return {
        ...prev,
        adminManagement: shouldOpenAdminManagement || prev.adminManagement,
        activityLogs: shouldOpenActivityLogs || prev.activityLogs,
      }
    })
  }, [location.pathname])

  const toggleDropdown = (dropdown) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }))
  }

  const handleLogout = async () => {
    try {
      await adminLogout()
      navigate("/superadmin/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const isActive = (path) => location.pathname === path
  const isActiveDropdown = (paths) => paths.some((path) => location.pathname.includes(path))

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/superadmin/dashboard",
    },
    {
      title: "Admin Management",
      icon: UserCog,
      dropdown: "adminManagement",
      items: [
        { title: "All Admins", path: "/superadmin/admins" },
      //  { title: "Add Admin", path: "/superadmin/admins/add" },
        // { title: "Permissions", path: "/superadmin/permissions" },
      ],
    },
    {
      title: "Activity Logs",
      icon: Activity,
      dropdown: "activityLogs",
      items: [
        { title: "All Logs", path: "/superadmin/activity-logs" },
       // { title: "Login History", path: "/superadmin/activity-logs/login" },
       // { title: "System Changes", path: "/superadmin/activity-logs/changes" },
      ],
    },
    {
      title: "Reports",
      icon: BarChart3,
      path: "/superadmin/reports",
    },
    {
      title: "System Settings",
      icon: Settings,
      path: "/superadmin/settings",
    },
  ]

  const renderMenuItem = (item, index) => {
    const Icon = item.icon

    if (item.dropdown) {
      const isOpen = openDropdowns[item.dropdown]
      const dropdownPaths = item.items.map((i) => i.path)
      const isDropdownActive = isActiveDropdown(dropdownPaths)

      return (
        <div key={index}>
          <button
            onClick={() => toggleDropdown(item.dropdown)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
              isDropdownActive
                ? "bg-[#dfa742]/15 text-[#dfa742] border border-[#dfa742]/30"
                : "text-gray-300 hover:bg-white/5 hover:text-[#dfa742]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.title}</span>
            </div>
            {isOpen ? <ChevronDown className="w-4 h-4 text-[#dfa742]" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          </button>
          {isOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#dfa742]/30 pl-4">
              {item.items.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  to={subItem.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive(subItem.path)
                      ? "bg-gradient-to-r from-[#dfa742] to-[#c99335] text-slate-950 font-bold shadow-md shadow-[#dfa742]/20"
                      : "text-gray-400 hover:bg-white/5 hover:text-[#dfa742]"
                  }`}
                >
                  {subItem.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={index}
        to={item.path}
        onClick={() => setIsMobileOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
          isActive(item.path)
            ? "bg-gradient-to-r from-[#dfa742] via-[#e5b555] to-[#c99335] text-slate-950 font-bold shadow-lg shadow-[#dfa742]/20"
            : "text-gray-300 hover:bg-white/5 hover:text-[#dfa742]"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{item.title}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#dfa742] text-slate-950 rounded-xl shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-[133.33vh] w-72 bg-[#13151b] border-r border-white/10 shadow-2xl z-40 transform transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#181a20] rounded-xl flex items-center justify-center p-1 border border-white/10 flex-shrink-0">
              <img
                src="/white-logo.png"
                alt="Trend Saloon"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div>
              <h1 className="text-base font-serif font-bold text-white tracking-wide">Trend Saloon</h1>
              <p className="text-[10px] font-semibold text-[#dfa742] uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-3.5 mx-4 mt-4 bg-[#1a1d24] rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#dfa742]/15 border border-[#dfa742]/30 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#dfa742]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {admin?.name || "Super Admin"}
              </p>
              <p className="text-[11px] text-[#dfa742] truncate">{admin?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto max-h-[calc(133.33vh-320px)]">
          {menuItems.map(renderMenuItem)}
        </nav>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#13151b]">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-[#dfa742] transition-all duration-200 mb-1 text-sm font-medium"
          >
            <ClipboardList className="w-4 h-4 text-[#dfa742]" />
            <span>Go to Admin Panel</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default SuperAdminSidebar
