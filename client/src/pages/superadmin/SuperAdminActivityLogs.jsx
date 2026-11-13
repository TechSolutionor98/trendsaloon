"use client"

import { useState, useEffect } from "react"
import { superAdminAPI } from "../../services/api"
import { useToast } from "../../context/ToastContext"
import {
  Activity,
  Search,
  Calendar,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Clock,
  Monitor,
  Globe,
  FileText,
  Trash2,
  RefreshCw,
  Download,
  LogIn,
  Plus,
  Edit,
  Trash,
  Settings,
} from "lucide-react"

const SuperAdminActivityLogs = () => {
  const { showToast } = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  })
  const [filters, setFilters] = useState({
    action: "",
    module: "",
    user: "",
    startDate: "",
    endDate: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [pagination.page, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      }
      const response = await superAdminAPI.getActivityLogs(params)
      setLogs(response?.logs || response?.data?.logs || [])
      setPagination((prev) => ({
        ...prev,
        total: response?.pagination?.total || response?.data?.pagination?.total || 0,
        pages: response?.pagination?.pages || response?.data?.pagination?.pages || 1,
      }))
    } catch (error) {
      showToast("Failed to fetch activity logs", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await superAdminAPI.getActivityLogStats()
      setStats(response || response?.data || {})
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const handleCleanup = async (days = 30) => {
    if (!window.confirm(`Are you sure you want to delete logs older than ${days} days?`)) {
      return
    }
    try {
      await superAdminAPI.cleanupActivityLogs(days)
      showToast(`Logs older than ${days} days deleted`, "success")
      fetchLogs()
      fetchStats()
    } catch (error) {
      showToast("Failed to cleanup logs", "error")
    }
  }

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case "login":
        return <LogIn className="w-4 h-4 text-emerald-400" />
      case "create":
        return <Plus className="w-4 h-4 text-blue-400" />
      case "update":
        return <Edit className="w-4 h-4 text-[#dfa742]" />
      case "delete":
        return <Trash className="w-4 h-4 text-red-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case "login":
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
      case "create":
        return "bg-blue-500/15 text-blue-400 border border-blue-500/30"
      case "update":
        return "bg-[#dfa742]/15 text-[#dfa742] border border-[#dfa742]/30"
      case "delete":
        return "bg-red-500/15 text-red-400 border border-red-500/30"
      default:
        return "bg-white/10 text-gray-300 border border-white/10"
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const openDetailModal = (log) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  const clearFilters = () => {
    setFilters({
      action: "",
      module: "",
      user: "",
      startDate: "",
      endDate: "",
    })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Activity Logs</h1>
          <p className="text-gray-400 text-sm mt-1">Monitor all administrative actions and security audit trails</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
              showFilters
                ? "bg-gradient-to-r from-[#dfa742] to-[#c99335] text-black font-semibold shadow-lg shadow-[#dfa742]/20"
                : "bg-[#13151b] border border-white/10 text-gray-300 hover:text-white hover:border-[#dfa742]/50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={() => handleCleanup(30)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/25 rounded-xl font-medium hover:bg-red-500/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Cleanup Logs
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#13151b] rounded-2xl border border-white/10 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#dfa742]/15 border border-[#dfa742]/30 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#dfa742]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalCount || 0}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Total Logs</p>
            </div>
          </div>
        </div>
        <div className="bg-[#13151b] rounded-2xl border border-white/10 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/15 border border-blue-500/30 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.todayCount || 0}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Today</p>
            </div>
          </div>
        </div>
        <div className="bg-[#13151b] rounded-2xl border border-white/10 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.weekCount || 0}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-[#13151b] rounded-2xl border border-white/10 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.uniqueUsers || 0}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Active Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-[#13151b] rounded-2xl border border-white/10 p-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#1a1d24] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742]"
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="view">View</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Module</label>
              <select
                value={filters.module}
                onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#1a1d24] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742]"
              >
                <option value="">All Modules</option>
                <option value="auth">Authentication</option>
                <option value="products">Products</option>
                <option value="orders">Orders</option>
                <option value="users">Users</option>
                <option value="admins">Admins</option>
                <option value="settings">Settings</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#1a1d24] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#1a1d24] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742]"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2.5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-[#13151b] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-[#dfa742] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No activity logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1d24] border-b border-white/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Module</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{log.userName}</p>
                          <p className="text-xs text-gray-400">{log.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#1a1d24] text-gray-300 text-xs border border-white/10 capitalize">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-300 text-sm max-w-xs truncate">{log.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetailModal(log)}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#dfa742] hover:bg-[#dfa742]/10 transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1.5 text-xs text-gray-300 font-medium">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#16181f] rounded-3xl shadow-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden text-gray-100 flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Activity Details</h2>
                  <p className="text-xs text-gray-400 mt-1">Audit log inspection</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedLog(null)
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#13151b] border border-white/10 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Action</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                    {getActionIcon(selectedLog.action)}
                    {selectedLog.action}
                  </span>
                </div>
                <div className="p-4 bg-[#13151b] border border-white/10 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Module</p>
                  <p className="font-medium text-white capitalize">{selectedLog.module}</p>
                </div>
              </div>
              <div className="p-4 bg-[#13151b] border border-white/10 rounded-xl">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">User</p>
                <p className="font-semibold text-white">{selectedLog.userName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{selectedLog.userEmail}</p>
              </div>
              <div className="p-4 bg-[#13151b] border border-white/10 rounded-xl">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-gray-200 text-sm">{selectedLog.description}</p>
              </div>
              <div className="p-4 bg-[#13151b] border border-white/10 rounded-xl">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Timestamp</p>
                <p className="text-gray-200 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#dfa742]" />
                  {formatDate(selectedLog.createdAt)}
                </p>
              </div>
              {selectedLog.ipAddress && (
                <div className="p-4 bg-[#13151b] border border-white/10 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">IP Address</p>
                  <p className="text-gray-200 text-sm font-mono flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    {selectedLog.ipAddress}
                  </p>
                </div>
              )}
              {selectedLog.userAgent && (
                <div className="p-4 bg-[#13151b] border border-white/10 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">User Agent</p>
                  <p className="text-gray-300 text-xs flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-purple-400" />
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}
              {selectedLog.previousData && (
                <div className="p-4 bg-[#13151b] border border-amber-500/30 rounded-xl">
                  <p className="text-xs text-amber-400 uppercase tracking-wider mb-2 font-medium">Previous Data</p>
                  <pre className="text-xs text-amber-200 font-mono bg-[#0d0e11] p-3 rounded-lg overflow-x-auto border border-white/5">
                    {JSON.stringify(selectedLog.previousData, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.newData && (
                <div className="p-4 bg-[#13151b] border border-[#dfa742]/30 rounded-xl">
                  <p className="text-xs text-[#dfa742] uppercase tracking-wider mb-2 font-medium">New Data</p>
                  <pre className="text-xs text-emerald-300 font-mono bg-[#0d0e11] p-3 rounded-lg overflow-x-auto border border-white/5">
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedLog(null)
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-[#dfa742] to-[#c99335] text-black font-semibold rounded-xl hover:brightness-110 transition-all text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminActivityLogs