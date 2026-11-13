"use client"

import { useState, useEffect } from "react"
import { superAdminAPI } from "../../services/api"
import { useToast } from "../../context/ToastContext"
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Shield,
  ShieldCheck,
  ShieldOff,
  Eye,
  EyeOff,
  X,
  Check,
  Mail,
  Lock,
  User,
  ChevronDown,
  ChevronUp,
  Save,
  RefreshCw,
  Sparkles,
  Scissors,
  ShoppingBag,
  ClipboardList,
} from "lucide-react"

export const PERMISSION_CATEGORIES = {
  "General Access": [
    { key: "fullAccess", label: "Full Access (All Permissions)" },
    { key: "dashboard", label: "Dashboard Overview" },
  ],
  "Product & Salon Services": [
    { key: "services", label: "Salon Services (View Services & Add Service)" },
    { key: "products", label: "Retail Products (View Products & Add Product)" },
    { key: "categories", label: "Categories" },
    { key: "subcategories", label: "Sub Categories" },
    { key: "brands", label: "Brands" },
    { key: "volumes", label: "Volumes" },
    { key: "warranty", label: "Warranty" },
    { key: "colors", label: "Colors" },
    { key: "units", label: "Units" },
    { key: "tax", label: "Tax" },
    { key: "sizes", label: "Sizes" },
  ],
  "Orders & Bookings": [
    { key: "orders", label: "Orders & Salon Appointments (All Status)" },
    { key: "quotations", label: "Order / Quotation & Wholesale" },
    { key: "deliveryCharges", label: "Delivery Charges" },
    { key: "stockAdjustment", label: "Stock Adjustment" },
  ],
  "Content & Storefront": [
    { key: "banners", label: "Banners (Homepage & Services)" },
    { key: "homeSections", label: "Home Sections" },
    { key: "offerPages", label: "Offer Pages" },
    { key: "blogs", label: "Blogs & Topics" },
  ],
  "Users & Clients": [
    { key: "users", label: "Users & Client Accounts" },
    { key: "reviews", label: "Client Reviews" },
    { key: "requestCallbacks", label: "Request Callbacks" },
    { key: "bulkPurchase", label: "Bulk Purchase Requests" },
    { key: "buyerProtection", label: "Buyer Protection" },
  ],
  "Marketing & Communications": [
    { key: "coupons", label: "Coupons & Discounts" },
    { key: "loyalty", label: "Loyalty Points" },
    { key: "referrals", label: "Referrals" },
    { key: "seoSettings", label: "SEO Settings & Redirects" },
    { key: "emailTemplates", label: "Email Templates" },
    { key: "newsletter", label: "Newsletter Subscribers" },
    { key: "pushNotifications", label: "Push Notifications" },
    { key: "whatsapp", label: "WhatsApp" },
  ],
  "System Settings": [
    { key: "cache", label: "Reset Cache" },
  ],
}

const SuperAdminManagement = () => {
  const { showToast } = useToast()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [permissionsList, setPermissionsList] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    isAdmin: true,
    isSuperAdmin: false,
    permissions: { dashboard: true, products: true, orders: true },
  })
  const [expandedFormCategories, setExpandedFormCategories] = useState({
    "General Access": true,
    "Product & Salon Services": true,
    "Orders & Bookings": true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [existingUser, setExistingUser] = useState(null)
  const [checkingEmail, setCheckingEmail] = useState(false)

  // Toggle single permission in formData
  const toggleFormPermission = (key) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...(prev.permissions || {}),
        [key]: !prev.permissions?.[key],
      },
    }))
  }

  // Toggle category expansion in form
  const toggleFormCategory = (category) => {
    setExpandedFormCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  // Preset: Services & Orders only
  const setServicesAndOrdersOnly = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        dashboard: true,
        services: true,
        products: true,
        orders: true,
      },
    }))
    showToast("Preset applied: Services, Products & Orders Only", "info")
  }

  // Select all permissions
  const selectAllFormPermissions = () => {
    const all = {}
    Object.values(PERMISSION_CATEGORIES).forEach((cat) => {
      cat.forEach((p) => {
        all[p.key] = true
      })
    })
    setFormData((prev) => ({
      ...prev,
      permissions: all,
    }))
  }

  // Clear all permissions
  const clearAllFormPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        dashboard: true,
      },
    }))
  }

  useEffect(() => {
    fetchAdmins()
    fetchPermissionsList()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await superAdminAPI.getAdmins()
      // API returns { admins: [...] } directly, not wrapped in data
      setAdmins(response?.admins || response?.data?.admins || [])
    } catch (error) {
      showToast("Failed to fetch admins", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissionsList = async () => {
    try {
      const response = await superAdminAPI.getPermissionsList()
      setPermissionsList(response?.permissions || response?.data?.permissions || [])
    } catch (error) {
      console.error("Failed to fetch permissions list:", error)
    }
  }

  const checkEmailExists = async (email) => {
    if (!email || email.length < 3) {
      setExistingUser(null)
      return
    }

    try {
      setCheckingEmail(true)
      const response = await superAdminAPI.checkUserByEmail(email)
      
      if (response.exists) {
        const user = response.user
        // If user is already an admin, show error
        if (user.isAdmin) {
          showToast("This user is already an admin", "error")
          setExistingUser(null)
        } else {
          // User exists but is not an admin - show promotion option
          setExistingUser(user)
        }
      } else {
        setExistingUser(null)
      }
    } catch (error) {
      console.error("Error checking email:", error)
      setExistingUser(null)
    } finally {
      setCheckingEmail(false)
    }
  }

  const handlePromoteToAdmin = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await superAdminAPI.promoteToAdmin(existingUser._id, {
        isSuperAdmin: formData.isSuperAdmin,
        permissions: { fullAccess: false },
      })
      showToast("User promoted to admin successfully", "success")
      setShowCreateModal(false)
      resetForm()
      setExistingUser(null)
      fetchAdmins()
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to promote user", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    
    // If existing user found, promote them instead
    if (existingUser) {
      handlePromoteToAdmin(e)
      return
    }

    try {
      setSaving(true)
      await superAdminAPI.createAdmin(formData)
      showToast("Admin created successfully", "success")
      setShowCreateModal(false)
      resetForm()
      fetchAdmins()
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to create admin", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateAdmin = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const updateData = { ...formData }
      if (!updateData.password) delete updateData.password
      await superAdminAPI.updateAdmin(selectedAdmin._id, updateData)
      showToast("Admin updated successfully", "success")
      setShowEditModal(false)
      resetForm()
      fetchAdmins()
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update admin", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAdmin = async () => {
    try {
      setSaving(true)
      await superAdminAPI.deleteAdmin(selectedAdmin._id)
      showToast("Admin deleted successfully", "success")
      setShowDeleteModal(false)
      setSelectedAdmin(null)
      fetchAdmins()
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete admin", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePermissions = async (permissions) => {
    try {
      setSaving(true)
      await superAdminAPI.updateAdminPermissions(selectedAdmin._id, permissions)
      showToast("Permissions updated successfully", "success")
      setShowPermissionsModal(false)
      fetchAdmins()
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update permissions", "error")
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      isAdmin: true,
      isSuperAdmin: false,
      permissions: { dashboard: true, products: true, orders: true },
    })
    setSelectedAdmin(null)
    setExistingUser(null)
  }

  const openEditModal = (admin) => {
    setSelectedAdmin(admin)
    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
      phone: admin.phone || "",
      isAdmin: admin.isAdmin,
      isSuperAdmin: admin.isSuperAdmin || false,
      permissions: admin.adminPermissions || { dashboard: true, products: true, orders: true },
    })
    setExpandedFormCategories({
      "General Access": true,
      "Product & Salon Services": true,
      "Orders & Bookings": true,
    })
    setShowEditModal(true)
  }

  const openPermissionsModal = (admin) => {
    setSelectedAdmin(admin)
    setShowPermissionsModal(true)
  }

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin)
    setShowDeleteModal(true)
  }

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 text-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">Admin Management</h1>
          <p className="text-gray-400 text-sm">Manage staff administrators and configure granular permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowCreateModal(true)
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#dfa742] via-[#e5b555] to-[#c99335] text-slate-950 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-[#dfa742]/20 text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add New Admin
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#13151b] rounded-2xl border border-white/10 p-4 shadow-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#1a1d24] border border-white/10 rounded-xl focus:outline-none focus:border-[#dfa742] focus:ring-1 focus:ring-[#dfa742] transition-all text-white placeholder-gray-500 text-sm"
          />
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-[#13151b] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-[#dfa742] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Loading admins...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-sm">No admins found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1d24] border-b border-white/10">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Admin</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${admin.isSuperAdmin ? "bg-gradient-to-br from-[#dfa742] to-[#c99335] text-slate-950 font-bold" : "bg-[#1a1d24] text-gray-300 border border-white/10"}`}>
                          {admin.isSuperAdmin ? (
                            <ShieldCheck className="w-5 h-5 text-slate-950" />
                          ) : (
                            <User className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{admin.name}</p>
                          <p className="text-xs text-gray-400">{admin.phone || "No phone"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        admin.isSuperAdmin
                          ? "bg-[#dfa742]/15 text-[#dfa742] border border-[#dfa742]/30"
                          : "bg-white/5 text-gray-300 border border-white/10"
                      }`}>
                        {admin.isSuperAdmin ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Super Admin
                          </>
                        ) : (
                          <>
                            <Shield className="w-3.5 h-3.5" />
                            Admin
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        admin.isAdmin
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/15 text-red-400 border border-red-500/30"
                      }`}>
                        {admin.isAdmin ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openPermissionsModal(admin)}
                          className="p-2 rounded-lg hover:bg-white/10 text-[#dfa742] transition-all"
                          title="Manage Permissions"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-2 rounded-lg hover:bg-white/10 text-blue-400 transition-all"
                          title="Edit Admin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(admin)}
                          className="p-2 rounded-lg hover:bg-white/10 text-red-400 transition-all"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal with Built-in Permissions */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#16181f] rounded-3xl shadow-2xl border border-white/10 w-full max-w-2xl max-h-[92vh] overflow-hidden text-gray-100 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">
                  {showEditModal ? "Edit Admin & Permissions" : "Create New Admin"}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {showEditModal
                    ? `Update account details and sidebar permissions for ${formData.name || formData.email}`
                    : "Add a staff administrator and select which sections they can access"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                  resetForm()
                }}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="adminForm"
              onSubmit={showEditModal ? handleUpdateAdmin : handleCreateAdmin}
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              {/* Email Field - Always visible for create */}
              {!showEditModal && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        setExistingUser(null)
                      }}
                      onBlur={(e) => checkEmailExists(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#1a1d24] border border-white/10 rounded-xl focus:outline-none focus:border-[#dfa742] text-white placeholder-gray-500 text-sm"
                      placeholder="admin@trendsaloon.com"
                      required
                    />
                    {checkingEmail && (
                      <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2">
                        <RefreshCw className="w-5 h-5 text-[#dfa742] animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Existing User Alert */}
                  {existingUser && (
                    <div className="mt-3 p-4 bg-[#dfa742]/10 border border-[#dfa742]/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-[#dfa742] mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-[#dfa742] uppercase tracking-wider">
                            User Already Registered
                          </p>
                          <p className="text-xs text-gray-300 mt-1">
                            <strong>{existingUser.name}</strong> is already registered with this email.
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Click "Promote to Admin" to assign administrative permissions.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Grid: Name & Email (Edit mode) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!existingUser && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-[#1a1d24] border border-white/10 rounded-xl focus:outline-none focus:border-[#dfa742] text-white placeholder-gray-500 text-sm"
                        placeholder="Admin Name"
                        required={!existingUser}
                      />
                    </div>
                  </div>
                )}

                {showEditModal && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-[#1a1d24] border border-white/10 rounded-xl focus:outline-none focus:border-[#dfa742] text-white placeholder-gray-500 text-sm"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Password Field */}
              {!existingUser && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                    Password {showEditModal && "(leave blank to keep unchanged)"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-11 pr-12 py-3 bg-[#1a1d24] border border-white/10 rounded-xl focus:outline-none focus:border-[#dfa742] text-white placeholder-gray-500 text-sm"
                      placeholder={showEditModal ? "••••••••" : "Enter secure password"}
                      required={!showEditModal && !existingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#dfa742]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Super Admin Checkbox */}
              <div className="p-3.5 rounded-2xl bg-[#13151b] border border-white/10">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSuperAdmin}
                    onChange={(e) => setFormData({ ...formData, isSuperAdmin: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded bg-[#1a1d24] border-white/20 text-[#dfa742] focus:ring-[#dfa742]"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Grant Super Admin Rights</span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      Super Admins automatically have unrestricted full access to every module and admin management.
                    </span>
                  </div>
                </label>
              </div>

              {/* DIRECT PERMISSIONS SELECTOR */}
              {!formData.isSuperAdmin && (
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#dfa742] to-[#b8832a] flex items-center justify-center text-black font-bold shadow-md shadow-[#dfa742]/20 flex-shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          Admin Sidebar Permissions
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          Select the specific sections this admin is allowed to see and manage
                        </p>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={setServicesAndOrdersOnly}
                        className="text-xs px-3 py-1.5 rounded-xl bg-[#dfa742]/20 hover:bg-[#dfa742]/30 text-[#dfa742] border border-[#dfa742]/40 font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Services &amp; Orders Only</span>
                      </button>
                      <button
                        type="button"
                        onClick={selectAllFormPermissions}
                        className="text-xs px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-all border border-white/10"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllFormPermissions}
                        className="text-xs px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 font-medium transition-all border border-white/10"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Categories List */}
                  <div className="space-y-3">
                    {Object.entries(PERMISSION_CATEGORIES).map(([category, perms]) => {
                      const activeCount = perms.filter((p) => formData.permissions?.[p.key]).length
                      const isExpanded = expandedFormCategories[category]

                      return (
                        <div
                          key={category}
                          className="border border-white/10 rounded-2xl overflow-hidden bg-[#13151b] shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={() => toggleFormCategory(category)}
                            className="w-full flex items-center justify-between p-3.5 bg-[#1a1d24]/90 hover:bg-[#20242e] transition-all text-left"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold text-white">{category}</span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                  activeCount > 0
                                    ? "bg-[#dfa742]/20 text-[#dfa742] border-[#dfa742]/40"
                                    : "bg-white/5 text-gray-400 border-white/10"
                                }`}
                              >
                                {activeCount}/{perms.length} Active
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="p-3.5 bg-[#13151b] grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-white/5">
                              {perms.map((permission) => {
                                const isChecked = !!formData.permissions?.[permission.key]

                                return (
                                  <label
                                    key={permission.key}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                      isChecked
                                        ? "border-[#dfa742]/50 bg-[#dfa742]/10 text-white shadow-sm"
                                        : "border-white/5 bg-[#16181f] text-gray-400 hover:border-white/15 hover:text-gray-200"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleFormPermission(permission.key)}
                                      className="w-4 h-4 rounded border-white/20 text-[#dfa742] focus:ring-[#dfa742] bg-[#1a1d24]"
                                    />
                                    <span
                                      className={`text-xs ${
                                        isChecked ? "text-white font-semibold" : "text-gray-400"
                                      }`}
                                    >
                                      {permission.label}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </form>

            {/* Sticky Modal Footer */}
            <div className="p-5 border-t border-white/10 bg-[#14151b] flex gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                  resetForm()
                }}
                className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 transition-all text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="adminForm"
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#dfa742] to-[#c99335] text-slate-950 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 text-sm shadow-lg shadow-[#dfa742]/20 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>
                      {showEditModal
                        ? "Save & Update Admin"
                        : existingUser
                        ? "Promote to Admin"
                        : "Create Admin"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedAdmin && (
        <PermissionsModal
          admin={selectedAdmin}
          permissionsList={permissionsList}
          onClose={() => {
            setShowPermissionsModal(false)
            setSelectedAdmin(null)
          }}
          onSave={handleUpdatePermissions}
          saving={saving}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#16181f] rounded-3xl shadow-2xl border border-white/10 w-full max-w-md p-6 text-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Admin?</h2>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete <strong className="text-white">{selectedAdmin.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedAdmin(null)
                  }}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAdmin}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-red-900/30"
                >
                  {saving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Permissions Modal Component
const PermissionsModal = ({ admin, permissionsList, onClose, onSave, saving }) => {
  const [permissions, setPermissions] = useState(admin.adminPermissions || {})
  const [expandedCategories, setExpandedCategories] = useState({})

  const permissionCategories = PERMISSION_CATEGORIES

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const togglePermission = (permission) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }))
  }

  const toggleCategoryAll = (category, value) => {
    const categoryPermissions = permissionCategories[category]
    const newPermissions = { ...permissions }
    categoryPermissions.forEach((p) => {
      newPermissions[p.key] = value
    })
    setPermissions(newPermissions)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#16181f] rounded-3xl shadow-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden text-gray-100 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Manage Permissions</h2>
              <p className="text-xs text-gray-400 mt-1">{admin.name} <span className="text-[#dfa742]">({admin.email})</span></p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {Object.entries(permissionCategories).map(([category, perms]) => (
            <div key={category} className="border border-white/10 rounded-xl overflow-hidden bg-[#13151b]">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 bg-[#1a1d24] hover:bg-[#20242d] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{category}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#dfa742]/15 text-[#dfa742] border border-[#dfa742]/30">
                    {perms.filter(p => permissions[p.key]).length}/{perms.length}
                  </span>
                </div>
                {expandedCategories[category] ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedCategories[category] && (
                <div className="p-4 space-y-3 bg-[#13151b]">
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => toggleCategoryAll(category, true)}
                      className="text-xs px-3 py-1 bg-[#dfa742]/15 border border-[#dfa742]/30 text-[#dfa742] rounded-lg hover:bg-[#dfa742]/25 font-medium transition-all"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => toggleCategoryAll(category, false)}
                      className="text-xs px-3 py-1 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/25 font-medium transition-all"
                    >
                      Deselect All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perms.map((permission) => (
                      <label
                        key={permission.key}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          permissions[permission.key] 
                            ? "border-[#dfa742]/50 bg-[#dfa742]/10 text-white" 
                            : "border-white/5 bg-[#16181f] text-gray-400 hover:border-white/15 hover:text-gray-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={permissions[permission.key] || false}
                          onChange={() => togglePermission(permission.key)}
                          className="w-4 h-4 rounded border-white/20 text-[#dfa742] focus:ring-[#dfa742] bg-[#1a1d24]"
                        />
                        <span className={`text-sm ${permissions[permission.key] ? "text-white font-medium" : "text-gray-400"}`}>
                          {permission.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(permissions)}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#dfa742] to-[#c99335] text-black font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#dfa742]/20"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Permissions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminManagement
