"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { superAdminAPI } from "../../services/api"
import {
  Users,
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  Settings,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Link } from "react-router-dom"

const SuperAdminDashboard = () => {
  const { admin } = useAuth()
  const [stats, setStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    todayActivities: 0,
    totalActivities: 0,
  })
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch admins
      const adminsResponse = await superAdminAPI.getAdmins()
      const admins = adminsResponse?.admins || adminsResponse?.data?.admins || []
      
      // Fetch activity summary (total, today, week, month)
      const summaryResponse = await superAdminAPI.getActivityStats()
      const summary = summaryResponse || {}
      
      // Fetch recent logs
      const logsResponse = await superAdminAPI.getActivityLogs({ limit: 5 })
      const logs = logsResponse?.logs || logsResponse?.data?.logs || []
      
      setStats({
        totalAdmins: admins.length,
        activeAdmins: admins.filter(a => a.isAdmin || a.isSuperAdmin).length,
        todayActivities: summary.todayLogs || 0,
        totalActivities: summary.totalLogs || 0,
      })
      
      setRecentLogs(logs)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Admins",
      value: stats.totalAdmins,
      icon: Users,
      color: "green",
      trend: `${stats.totalAdmins > 0 ? '+' : ''}${stats.totalAdmins}`,
      trendUp: true,
    },
    {
      title: "Active Admins",
      value: stats.activeAdmins,
      icon: ShieldCheck,
      color: "emerald",
      trend: "Active",
      trendUp: true,
    },
    {
      title: "Today's Activities",
      value: stats.todayActivities,
      icon: Activity,
      color: "teal",
      trend: "Today",
      trendUp: stats.todayActivities > 0,
    },
    {
      title: "Total Activities",
      value: stats.totalActivities,
      icon: FileText,
      color: "cyan",
      trend: "All time",
      trendUp: true,
    },
  ]

  const quickActions = [
    {
      title: "Add New Admin",
      description: "Create a new admin account",
      icon: UserPlus,
      path: "/superadmin/admins/add",
      color: "green",
    },
    {
      title: "View Activity Logs",
      description: "Monitor all admin activities",
      icon: Activity,
      path: "/superadmin/activity-logs",
      color: "emerald",
    },
    {
      title: "Manage Permissions",
      description: "Configure admin permissions",
      icon: Settings,
      path: "/superadmin/permissions",
      color: "teal",
    },
    {
      title: "All Admins",
      description: "View and manage admin users",
      icon: Users,
      path: "/superadmin/admins",
      color: "cyan",
    },
  ]

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || ""
    switch (actionLower) {
      case "login":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "create":
        return <UserPlus className="w-4 h-4 text-blue-500" />
      case "update":
      case "status_change":
      case "approve":
        return <Settings className="w-4 h-4 text-yellow-500" />
      case "delete":
      case "reject":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "bulk_action":
        return <FileText className="w-4 h-4 text-purple-500" />
      default:
        return <Activity className="w-4 h-4 text-slate-400" />
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0e11]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#dfa742] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#dfa742] font-medium text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-gray-100">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#1c1f26] via-[#16181f] to-[#111217] border border-[#dfa742]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#dfa742]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="inline-block px-3 py-1 bg-[#dfa742]/15 border border-[#dfa742]/30 rounded-full text-[#dfa742] text-[11px] font-semibold tracking-wider uppercase mb-2">
              Super Admin Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
              Welcome back, <span className="text-[#dfa742]">{admin?.name || "Super Admin"}</span>!
            </h1>
            <p className="text-gray-400 text-sm">Real-time overview of Trend Saloon administrative operations.</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="w-16 h-16 bg-[#dfa742]/10 border border-[#dfa742]/30 rounded-2xl flex items-center justify-center shadow-lg shadow-[#dfa742]/10">
              <ShieldCheck className="w-9 h-9 text-[#dfa742]" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-[#13151b] rounded-2xl p-5 border border-white/10 shadow-lg hover:border-[#dfa742]/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-[#dfa742]/10 border border-[#dfa742]/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#dfa742]" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#dfa742]/10 text-[#dfa742]">
                  {stat.trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{stat.title}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-[#13151b] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Quick Actions</h2>
            <span className="text-xs text-[#dfa742] font-medium">Administration</span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  to={action.path}
                  className="p-4 rounded-xl border border-white/5 bg-[#1a1d24]/50 hover:border-[#dfa742]/40 hover:bg-[#1a1d24] transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-[#dfa742]/10 border border-[#dfa742]/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#dfa742]/20 transition-all">
                    <Icon className="w-5 h-5 text-[#dfa742]" />
                  </div>
                  <h3 className="font-semibold text-white text-sm group-hover:text-[#dfa742] transition-colors">{action.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{action.description}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#13151b] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            <Link
              to="/superadmin/activity-logs"
              className="text-xs text-[#dfa742] hover:text-[#f3c46e] font-medium transition-colors"
            >
              View All Logs →
            </Link>
          </div>
          <div className="p-5">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                <p className="text-sm">No recent activities recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#1a1d24]/40 hover:bg-white/5 border border-white/5 transition-all"
                  >
                    <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-200 font-medium truncate">
                        {log.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-[#dfa742]">{log.userName || "System"}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
