"use client"

import { useState, useEffect, useRef } from "react"
import { superAdminAPI } from "../../services/api"
import { useToast } from "../../context/ToastContext"
import {
  FileText,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Users,
  Activity,
  UserCog,
  BarChart3,
  ChevronDown,
  X,
  Clock,
  Edit,
  Trash,
  Plus,
  LogIn,
  LogOut,
  Eye,
  Upload,
  Settings,
  Shield,
  Package,
  ShoppingCart,
  Tag,
  Image,
  Mail,
  Phone,
  Percent,
  Truck,
  Star,
  FileSpreadsheet,
  Search,
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const SuperAdminReports = () => {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [admins, setAdmins] = useState([])
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    weekLogs: 0,
    monthLogs: 0,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })
  
  // Filters
  const [filters, setFilters] = useState({
    adminId: "",
    action: "",
    module: "",
    startDate: "",
    endDate: "",
    search: "",
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [exporting, setExporting] = useState(false)
  const exportMenuRef = useRef(null)

  // Action types
  const actionTypes = [
    { value: "", label: "All Actions" },
    { value: "CREATE", label: "Create" },
    { value: "UPDATE", label: "Update" },
    { value: "DELETE", label: "Delete" },
    { value: "LOGIN", label: "Login" },
    { value: "LOGOUT", label: "Logout" },
    { value: "VIEW", label: "View" },
    { value: "EXPORT", label: "Export" },
    { value: "IMPORT", label: "Import" },
    { value: "STATUS_CHANGE", label: "Status Change" },
    { value: "PERMISSION_CHANGE", label: "Permission Change" },
    { value: "BULK_ACTION", label: "Bulk Action" },
  ]

  // Module types
  const moduleTypes = [
    { value: "", label: "All Modules" },
    { value: "PRODUCTS", label: "Products" },
    { value: "CATEGORIES", label: "Categories" },
    { value: "SUBCATEGORIES", label: "Sub Categories" },
    { value: "BRANDS", label: "Brands" },
    { value: "ORDERS", label: "Orders" },
    { value: "USERS", label: "Users" },
    { value: "REVIEWS", label: "Reviews" },
    { value: "BLOGS", label: "Blogs" },
    { value: "BANNERS", label: "Banners" },
    { value: "HOME_SECTIONS", label: "Home Sections" },
    { value: "OFFER_PAGES", label: "Offer Pages" },
    { value: "GAMING_ZONE", label: "Gaming Zone" },
    { value: "COUPONS", label: "Coupons" },
    { value: "DELIVERY_CHARGES", label: "Delivery Charges" },
    { value: "SETTINGS", label: "Settings" },
    { value: "EMAIL_TEMPLATES", label: "Email Templates" },
    { value: "NEWSLETTER", label: "Newsletter" },
    { value: "REQUEST_CALLBACKS", label: "Request Callbacks" },
    { value: "BULK_PURCHASE", label: "Bulk Purchase" },
    { value: "BUYER_PROTECTION", label: "Buyer Protection" },
    { value: "STOCK_ADJUSTMENT", label: "Stock Adjustment" },
    { value: "SEO_SETTINGS", label: "SEO Settings" },
    { value: "CACHE", label: "Cache" },
    { value: "VOLUMES", label: "Volumes" },
    { value: "WARRANTY", label: "Warranty" },
    { value: "COLORS", label: "Colors" },
    { value: "UNITS", label: "Units" },
    { value: "TAX", label: "Tax" },
    { value: "SIZES", label: "Sizes" },
    { value: "ADMIN_MANAGEMENT", label: "Admin Management" },
    { value: "AUTH", label: "Authentication" },
    { value: "PERMISSIONS", label: "Permissions" },
  ]

  useEffect(() => {
    fetchAdmins()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [filters, pagination.page])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await superAdminAPI.getAdmins({ limit: 100 })
      setAdmins(response?.admins || [])
    } catch (error) {
      console.error("Failed to fetch admins:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await superAdminAPI.getActivityStats()
      if (response) {
        setStats({
          totalLogs: response.totalLogs || 0,
          todayLogs: response.todayLogs || 0,
          weekLogs: response.weekLogs || 0,
          monthLogs: response.monthLogs || 0,
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: 50,
      }
      
      if (filters.adminId) params.userId = filters.adminId
      if (filters.action) params.action = filters.action
      if (filters.module) params.module = filters.module
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.search) params.search = filters.search

      const response = await superAdminAPI.getActivityLogs(params)
      setLogs(response?.logs || [])
      setPagination({
        page: response?.page || 1,
        pages: response?.pages || 1,
        total: response?.total || 0,
      })
    } catch (error) {
      console.error("Failed to fetch logs:", error)
      showToast("Failed to fetch activity logs", "error")
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      adminId: "",
      action: "",
      module: "",
      startDate: "",
      endDate: "",
      search: "",
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getActionIcon = (action) => {
    const icons = {
      CREATE: <Plus className="w-4 h-4" />,
      UPDATE: <Edit className="w-4 h-4" />,
      DELETE: <Trash className="w-4 h-4" />,
      LOGIN: <LogIn className="w-4 h-4" />,
      LOGOUT: <LogOut className="w-4 h-4" />,
      VIEW: <Eye className="w-4 h-4" />,
      EXPORT: <Download className="w-4 h-4" />,
      IMPORT: <Upload className="w-4 h-4" />,
      STATUS_CHANGE: <RefreshCw className="w-4 h-4" />,
      PERMISSION_CHANGE: <Shield className="w-4 h-4" />,
      BULK_ACTION: <FileSpreadsheet className="w-4 h-4" />,
    }
    return icons[action] || <Activity className="w-4 h-4" />
  }

  const getActionColor = (action) => {
    const colors = {
      CREATE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      UPDATE: "bg-[#dfa742]/15 text-[#dfa742] border-[#dfa742]/30",
      DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
      LOGIN: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      LOGOUT: "bg-gray-500/15 text-gray-400 border-gray-500/30",
      VIEW: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      EXPORT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      IMPORT: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
      STATUS_CHANGE: "bg-orange-500/15 text-orange-400 border-orange-500/30",
      PERMISSION_CHANGE: "bg-pink-500/15 text-pink-400 border-pink-500/30",
      BULK_ACTION: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    }
    return colors[action] || "bg-white/10 text-gray-300 border-white/10"
  }

  const getModuleIcon = (module) => {
    const icons = {
      PRODUCTS: <Package className="w-4 h-4" />,
      CATEGORIES: <Tag className="w-4 h-4" />,
      SUBCATEGORIES: <Tag className="w-4 h-4" />,
      BRANDS: <Tag className="w-4 h-4" />,
      ORDERS: <ShoppingCart className="w-4 h-4" />,
      USERS: <Users className="w-4 h-4" />,
      REVIEWS: <Star className="w-4 h-4" />,
      BLOGS: <FileText className="w-4 h-4" />,
      BANNERS: <Image className="w-4 h-4" />,
      HOME_SECTIONS: <Image className="w-4 h-4" />,
      COUPONS: <Percent className="w-4 h-4" />,
      DELIVERY_CHARGES: <Truck className="w-4 h-4" />,
      SETTINGS: <Settings className="w-4 h-4" />,
      EMAIL_TEMPLATES: <Mail className="w-4 h-4" />,
      REQUEST_CALLBACKS: <Phone className="w-4 h-4" />,
      ADMIN_MANAGEMENT: <UserCog className="w-4 h-4" />,
      AUTH: <Shield className="w-4 h-4" />,
      PERMISSIONS: <Shield className="w-4 h-4" />,
    }
    return icons[module] || <Activity className="w-4 h-4" />
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatModuleName = (module) => {
    return module
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  // Export to PDF
  const exportToPDF = async () => {
    setExporting(true)
    try {
      // Fetch all logs for export (without pagination)
      const params = {}
      if (filters.adminId) params.userId = filters.adminId
      if (filters.action) params.action = filters.action
      if (filters.module) params.module = filters.module
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      params.limit = 1000 // Get more logs for export

      const response = await superAdminAPI.getActivityLogs(params)
      const exportLogs = response?.logs || logs

      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor(34, 197, 94) // Green color
      doc.text("Activity Logs Report", 14, 22)
      
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)
      doc.text(`Total Records: ${exportLogs.length}`, 14, 36)
      
      // Filters applied
      let filterText = "Filters: "
      if (filters.adminId) {
        const admin = admins.find(a => a._id === filters.adminId)
        filterText += `Admin: ${admin?.name || "Unknown"}, `
      }
      if (filters.action) filterText += `Action: ${filters.action}, `
      if (filters.module) filterText += `Module: ${filters.module}, `
      if (filters.startDate) filterText += `From: ${filters.startDate}, `
      if (filters.endDate) filterText += `To: ${filters.endDate}`
      if (filterText === "Filters: ") filterText += "None"
      
      doc.setFontSize(9)
      doc.text(filterText, 14, 42)

      // Table
      const tableData = exportLogs.map((log) => [
        formatDate(log.createdAt),
        log.userName || "Unknown",
        log.action,
        formatModuleName(log.module),
        log.description?.substring(0, 50) + (log.description?.length > 50 ? "..." : ""),
        log.ipAddress || "N/A",
      ])

      autoTable(doc, {
        startY: 48,
        head: [["Date & Time", "Admin", "Action", "Module", "Description", "IP Address"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30 },
          2: { cellWidth: 20 },
          3: { cellWidth: 25 },
          4: { cellWidth: 50 },
          5: { cellWidth: 25 },
        },
      })

      doc.save(`activity-logs-report-${new Date().toISOString().split("T")[0]}.pdf`)
      showToast("PDF report downloaded successfully", "success")
    } catch (error) {
      console.error("Failed to export PDF:", error)
      showToast("Failed to export PDF", "error")
    } finally {
      setExporting(false)
      setShowExportMenu(false)
    }
  }

  // Export to CSV
  const exportToCSV = async () => {
    setExporting(true)
    try {
      const params = {}
      if (filters.adminId) params.userId = filters.adminId
      if (filters.action) params.action = filters.action
      if (filters.module) params.module = filters.module
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      params.limit = 1000

      const response = await superAdminAPI.getActivityLogs(params)
      const exportLogs = response?.logs || logs

      const headers = ["Date & Time", "Admin Name", "Admin Email", "Action", "Module", "Description", "Target", "IP Address", "User Agent"]
      const rows = exportLogs.map((log) => [
        formatDate(log.createdAt),
        log.userName || "",
        log.userEmail || "",
        log.action,
        log.module,
        `"${(log.description || "").replace(/"/g, '""')}"`,
        log.targetName || "",
        log.ipAddress || "",
        `"${(log.userAgent || "").replace(/"/g, '""')}"`,
      ])

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `activity-logs-report-${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      
      showToast("CSV report downloaded successfully", "success")
    } catch (error) {
      console.error("Failed to export CSV:", error)
      showToast("Failed to export CSV", "error")
    } finally {
      setExporting(false)
      setShowExportMenu(false)
    }
  }

  // Export detailed report by admin
  const exportAdminReport = async () => {
    setExporting(true)
    try {
      const params = { limit: 1000 }
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate

      const response = await superAdminAPI.getActivityLogs(params)
      const allLogs = response?.logs || []

      const doc = new jsPDF()
      let yPos = 20

      // Header
      doc.setFontSize(20)
      doc.setTextColor(34, 197, 94)
      doc.text("Admin Activity Report", 14, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, yPos)
      yPos += 15

      // Group logs by admin
      const logsByAdmin = {}
      allLogs.forEach((log) => {
        const key = log.userEmail || "Unknown"
        if (!logsByAdmin[key]) {
          logsByAdmin[key] = {
            name: log.userName || "Unknown",
            email: log.userEmail || "Unknown",
            logs: [],
          }
        }
        logsByAdmin[key].logs.push(log)
      })

      // Create section for each admin
      Object.entries(logsByAdmin).forEach(([email, data]) => {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        // Admin header
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.text(`${data.name}`, 14, yPos)
        yPos += 6
        doc.setFontSize(9)
        doc.setTextColor(100)
        doc.text(`Email: ${email} | Total Actions: ${data.logs.length}`, 14, yPos)
        yPos += 8

        // Action summary
        const actionCounts = {}
        data.logs.forEach((log) => {
          actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
        })

        doc.setFontSize(8)
        let actionText = "Actions: "
        Object.entries(actionCounts).forEach(([action, count]) => {
          actionText += `${action}: ${count}, `
        })
        doc.text(actionText.slice(0, -2), 14, yPos)
        yPos += 10

        // Recent activities table
        const recentLogs = data.logs.slice(0, 10)
        const tableData = recentLogs.map((log) => [
          formatDate(log.createdAt),
          log.action,
          formatModuleName(log.module),
          log.description?.substring(0, 40) + (log.description?.length > 40 ? "..." : ""),
        ])

        autoTable(doc, {
          startY: yPos,
          head: [["Date", "Action", "Module", "Description"]],
          body: tableData,
          theme: "grid",
          headStyles: {
            fillColor: [34, 197, 94],
            textColor: 255,
            fontSize: 8,
          },
          styles: {
            fontSize: 7,
            cellPadding: 2,
          },
          margin: { left: 14 },
        })

        yPos = doc.lastAutoTable.finalY + 15
      })

      doc.save(`admin-activity-report-${new Date().toISOString().split("T")[0]}.pdf`)
      showToast("Admin report downloaded successfully", "success")
    } catch (error) {
      console.error("Failed to export admin report:", error)
      showToast("Failed to export admin report", "error")
    } finally {
      setExporting(false)
      setShowExportMenu(false)
    }
  }

  // Export module-wise report
  const exportModuleReport = async () => {
    setExporting(true)
    try {
      const params = { limit: 1000 }
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate

      const response = await superAdminAPI.getActivityLogs(params)
      const allLogs = response?.logs || []

      const doc = new jsPDF()
      let yPos = 20

      // Header
      doc.setFontSize(20)
      doc.setTextColor(34, 197, 94)
      doc.text("Module Activity Report", 14, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, yPos)
      yPos += 15

      // Group logs by module
      const logsByModule = {}
      allLogs.forEach((log) => {
        const key = log.module || "OTHER"
        if (!logsByModule[key]) {
          logsByModule[key] = []
        }
        logsByModule[key].push(log)
      })

      // Sort modules by activity count
      const sortedModules = Object.entries(logsByModule).sort((a, b) => b[1].length - a[1].length)

      // Create section for each module
      sortedModules.forEach(([module, moduleLogs]) => {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        // Module header
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.text(formatModuleName(module), 14, yPos)
        yPos += 6
        doc.setFontSize(9)
        doc.setTextColor(100)
        doc.text(`Total Activities: ${moduleLogs.length}`, 14, yPos)
        yPos += 8

        // Action breakdown
        const actionCounts = {}
        moduleLogs.forEach((log) => {
          actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
        })

        const actionData = Object.entries(actionCounts).map(([action, count]) => [action, count.toString()])

        autoTable(doc, {
          startY: yPos,
          head: [["Action Type", "Count"]],
          body: actionData,
          theme: "grid",
          headStyles: {
            fillColor: [34, 197, 94],
            textColor: 255,
            fontSize: 8,
          },
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          margin: { left: 14 },
          tableWidth: 80,
        })

        yPos = doc.lastAutoTable.finalY + 15
      })

      doc.save(`module-activity-report-${new Date().toISOString().split("T")[0]}.pdf`)
      showToast("Module report downloaded successfully", "success")
    } catch (error) {
      console.error("Failed to export module report:", error)
      showToast("Failed to export module report", "error")
    } finally {
      setExporting(false)
      setShowExportMenu(false)
    }
  }

  const hasActiveFilters = filters.adminId || filters.action || filters.module || filters.startDate || filters.endDate || filters.search

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Activity Reports</h1>
          <p className="text-gray-400 text-sm mt-1">
            Comprehensive activity logs and downloadable audit reports for all administrators
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh */}
          <button
            onClick={() => { fetchLogs(); fetchStats(); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#13151b] border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all font-medium ${
              showFilters || hasActiveFilters
                ? "bg-gradient-to-r from-[#dfa742] to-[#c99335] text-black border-transparent shadow-lg shadow-[#dfa742]/20 font-semibold"
                : "bg-[#13151b] border-white/10 text-gray-300 hover:text-white hover:border-[#dfa742]/50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-black rounded-full"></span>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#dfa742] to-[#c99335] text-black font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#dfa742]/20 disabled:opacity-50"
            >
              {exporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export Report
              <ChevronDown className="w-4 h-4" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#16181f] rounded-2xl shadow-2xl border border-white/10 py-2 z-50 text-gray-100">
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="text-xs font-semibold text-[#dfa742] uppercase tracking-wider">Export Options</p>
                </div>
                
                <button
                  onClick={exportToPDF}
                  disabled={exporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 bg-red-500/15 border border-red-500/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Activity Logs PDF</p>
                    <p className="text-xs text-gray-400">All filtered logs</p>
                  </div>
                </button>

                <button
                  onClick={exportToCSV}
                  disabled={exporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Activity Logs CSV</p>
                    <p className="text-xs text-gray-400">Excel compatible format</p>
                  </div>
                </button>

                <div className="border-t border-white/10 my-1"></div>

                <button
                  onClick={exportAdminReport}
                  disabled={exporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500/15 border border-blue-500/30 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Admin-wise Report</p>
                    <p className="text-xs text-gray-400">Grouped by each admin</p>
                  </div>
                </button>

                <button
                  onClick={exportModuleReport}
                  disabled={exporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#dfa742]/15 border border-[#dfa742]/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-[#dfa742]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Module-wise Report</p>
                    <p className="text-xs text-gray-400">Grouped by each section</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#13151b] rounded-2xl border border-white/10 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#dfa742]/15 border border-[#dfa742]/30 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#dfa742]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalLogs.toLocaleString()}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Total Activities</p>
            </div>
          </div>
        </div>

        <div className="bg-[#13151b] rounded-2xl border border-white/10 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/15 border border-blue-500/30 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.todayLogs.toLocaleString()}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Today's Activities</p>
            </div>
          </div>
        </div>

        <div className="bg-[#13151b] rounded-2xl border border-white/10 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/30 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.weekLogs.toLocaleString()}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">This Week</p>
            </div>
          </div>
        </div>

        <div className="bg-[#13151b] rounded-2xl border border-white/10 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.monthLogs.toLocaleString()}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-[#13151b] rounded-2xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Filter Activity Logs</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search logs..."
                  className="w-full pl-9 pr-3 py-2 bg-[#1a1d24] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742]"
                />
              </div>
            </div>

            {/* Admin Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Admin</label>
              <select
                value={filters.adminId}
                onChange={(e) => setFilters({ ...filters, adminId: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1d24] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742]"
              >
                <option value="">All Admins</option>
                {admins.map((admin) => (
                  <option key={admin._id} value={admin._id}>
                    {admin.name} {admin.isSuperAdmin && "(Super Admin)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1d24] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742]"
              >
                {actionTypes.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Module</label>
              <select
                value={filters.module}
                onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1d24] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742]"
              >
                {moduleTypes.map((module) => (
                  <option key={module.value} value={module.value}>
                    {module.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1d24] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742]"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1d24] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Table */}
      <div className="bg-[#13151b] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">
              Activity Logs
              <span className="ml-2 text-xs font-normal text-[#dfa742] bg-[#dfa742]/10 px-2 py-0.5 rounded-full border border-[#dfa742]/30">
                {pagination.total.toLocaleString()} records
              </span>
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-[#dfa742] animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Loading activity logs...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No activity logs found</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-[#dfa742] hover:underline text-sm font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1a1d24] border-b border-white/10">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#dfa742]/15 border border-[#dfa742]/30 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-[#dfa742]">
                              {log.userName?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{log.userName || "Unknown"}</p>
                            <p className="text-xs text-gray-400">{log.userEmail || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-300 bg-[#1a1d24] px-2.5 py-1 rounded-lg border border-white/10">
                          {getModuleIcon(log.module)}
                          {formatModuleName(log.module)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-300 max-w-md truncate" title={log.description}>
                          {log.description}
                        </p>
                        {log.targetName && (
                          <p className="text-xs text-[#dfa742]/80 mt-0.5">
                            Target: {log.targetName}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-400 font-mono">
                          {log.ipAddress || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Showing page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1.5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i
                    if (pageNum > pagination.pages) return null
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          pagination.page === pageNum
                            ? "bg-[#dfa742] text-black font-semibold shadow-md shadow-[#dfa742]/20"
                            : "border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1.5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SuperAdminReports
