"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const SuperAdminRoute = ({ children }) => {
  const { isAdminAuthenticated, isSuperAdmin, loading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0e11] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-[#dfa742] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#dfa742] font-medium text-sm">Loading Super Admin Portal...</p>
        </div>
      </div>
    )
  }

  const adminToken = localStorage.getItem("adminToken")
  const isSuper = isSuperAdmin || localStorage.getItem("isSuperAdmin") === "true"

  // Redirect to super admin login if not authenticated
  if (!adminToken || !isAdminAuthenticated) {
    return <Navigate to="/superadmin/login" state={{ from: location }} replace />
  }

  // Redirect to regular admin if not super admin
  if (!isSuper) {
    return (
      <div className="min-h-screen bg-[#0d0e11] text-white flex items-center justify-center p-4">
        <div className="bg-[#13151b] rounded-3xl shadow-2xl border border-red-500/30 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6 text-sm">
            You don't have Super Admin privileges to access this area.
          </p>
          <a
            href="/admin/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#dfa742] to-[#c99335] text-slate-950 rounded-xl font-bold hover:brightness-110 transition-all duration-200 text-sm"
          >
            Go to Admin Panel
          </a>
        </div>
      </div>
    )
  }

  return children
}

export default SuperAdminRoute
