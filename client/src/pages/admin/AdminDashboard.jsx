"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  PackagePlus,
  ClipboardList,
  UserPlus,
  Scissors,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react"
import { adminAPI } from "../../services/api"
import { getOrderCountryName, formatOrderPrice } from "../../utils/paymentUtils"
import { orderCustomerName } from "../../utils/orderCustomer"

const AdminDashboard = () => {
  const { admin } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const formatPrice = (price, orderObj) => {
    return formatOrderPrice(price, orderObj)
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await adminAPI.getDashboardStats()
        setStats(statsData || {})
        const ordersData = await adminAPI.getRecentOrders()
        setRecentOrders(ordersData || [])
        setLoading(false)
      } catch (err) {
        console.error("Dashboard data load error:", err)
        setError("Failed to load dashboard data. Please try again later.")
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0d0e11] text-gray-100">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex flex-col justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-[#dfa742] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-[#dfa742] tracking-wider uppercase">Loading Salon Dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#0d0e11] text-gray-100">
        <AdminSidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-2xl">
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: "Total Orders & Bookings",
      value: stats.totalOrders || 0,
      icon: ShoppingBag,
      accent: "from-[#dfa742] to-[#b8832a]",
      glow: "shadow-[#dfa742]/10",
      desc: "Live bookings snapshot",
    },
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue || 0),
      icon: DollarSign,
      accent: "from-[#10b981] to-[#059669]",
      glow: "shadow-emerald-500/10",
      desc: "All sales & services",
    },
    {
      label: "Services & Products",
      value: stats.totalProducts || 0,
      icon: Scissors,
      accent: "from-[#f59e0b] to-[#d97706]",
      glow: "shadow-amber-500/10",
      desc: "Live salon catalogue",
    },
    {
      label: "Registered Clients",
      value: stats.totalUsers || 0,
      icon: Users,
      accent: "from-[#3b82f6] to-[#1d4ed8]",
      glow: "shadow-blue-500/10",
      desc: "Active client accounts",
    },
  ]

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase()
    if (s.includes("delivered") || s.includes("completed")) {
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
    }
    if (s.includes("processing") || s.includes("confirmed") || s.includes("new")) {
      return "bg-[#dfa742]/15 text-[#dfa742] border border-[#dfa742]/30"
    }
    if (s.includes("way") || s.includes("shipped")) {
      return "bg-sky-500/15 text-sky-400 border border-sky-500/30"
    }
    if (s.includes("cancel") || s.includes("reject") || s.includes("delete")) {
      return "bg-rose-500/15 text-rose-400 border border-rose-500/30"
    }
    return "bg-gray-500/15 text-gray-400 border border-gray-500/30"
  }

  return (
    <div className="flex min-h-screen bg-[#0d0e11] text-gray-100">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-6 sm:p-8 space-y-6 relative overflow-hidden bg-[#0d0e11]">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#dfa742]/5 rounded-full blur-3xl pointer-events-none" />

        {/* 1. HERO WELCOME BANNER */}
        <div className="relative rounded-3xl border border-[#dfa742]/30 bg-gradient-to-r from-[#1c1f26] via-[#16181f] to-[#111217] p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#dfa742]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#dfa742]/15 border border-[#dfa742]/30 rounded-full text-[#dfa742] text-[11px] font-semibold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfa742] animate-pulse" />
                Trend Gents Saloon · Admin Console
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
                Welcome back, <span className="text-[#dfa742]">{admin?.name || "Admin"}</span>
              </h1>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#dfa742]" />
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                <span className="text-gray-600">•</span>
                <span>Real-time overview of salon services, products, bookings & client operations.</span>
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#dfa742] to-[#b8832a] px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-[#dfa742]/20 transition hover:brightness-110 active:scale-95"
              >
                <ClipboardList className="h-4 w-4" />
                Review Orders & Bookings
              </Link>
              <Link
                to="/admin/products/add?type=service"
                className="inline-flex items-center gap-2 rounded-xl border border-[#dfa742]/40 bg-[#dfa742]/10 px-4 py-2.5 text-xs font-semibold text-[#dfa742] transition hover:bg-[#dfa742]/20 active:scale-95"
              >
                <Scissors className="h-4 w-4" />
                Add Service
              </Link>
              <Link
                to="/admin/products/add?type=product"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-300 transition hover:text-white hover:bg-white/10 active:scale-95"
              >
                <PackagePlus className="h-4 w-4" />
                Add Product
              </Link>
            </div>
          </div>
        </div>

        {/* 2. STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className="relative overflow-hidden rounded-2xl border border-[#22252d] bg-[#13151b] p-6 shadow-xl transition-all duration-300 hover:border-[#dfa742]/40 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest font-semibold text-gray-400">
                      {card.label}
                    </p>
                    <p className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {card.value}
                    </p>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-br ${card.accent} p-3 text-black shadow-md`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#22252d] flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#dfa742]" />
                    {card.desc}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#dfa742]" />
                </div>
              </div>
            )
          })}
        </div>

        {/* 3. RECENT ORDERS & QUICK ACTIONS GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
          {/* Recent Orders & Bookings */}
          <div className="bg-[#13151b] rounded-2xl shadow-xl overflow-hidden border border-[#22252d]">
            <div className="px-6 py-4 border-b border-[#22252d] bg-[#16181f] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#dfa742]/10 border border-[#dfa742]/20 flex items-center justify-center text-[#dfa742]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h2 className="text-base font-serif font-bold text-white tracking-wide">
                  Recent Orders & Appointments
                </h2>
              </div>
              <Link
                to="/admin/orders"
                className="text-xs font-semibold text-[#dfa742] hover:text-[#f3c267] transition-colors flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#22252d]">
                <thead className="bg-[#0d0e11]/80">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#dfa742]">
                      Order ID
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#dfa742]">
                      Client
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#dfa742]">
                      Date
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#dfa742]">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#dfa742]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22252d] bg-[#13151b]">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td className="px-6 py-12 text-center text-sm text-gray-500" colSpan={5}>
                        <div className="flex flex-col items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-600 mb-2" />
                          <p>No recent orders or salon appointments found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-[#1a1d24]/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to="/admin/orders"
                            state={{ orderId: order._id }}
                            className="text-xs font-bold text-[#dfa742] hover:underline"
                          >
                            #{order._id.slice(-6).toUpperCase()}
                          </Link>
                          <div className="text-[11px] text-gray-400 capitalize">
                            {order.deliveryType || "standard"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.deliveryType === "pickup" ? (
                            <>
                              <div className="text-xs font-semibold text-white">
                                {order.pickupDetails?.location || "Salon Pickup"}
                              </div>
                              <div className="text-[11px] text-gray-400">
                                {order.pickupDetails?.phone || "N/A"}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-xs font-semibold text-white">
                                {orderCustomerName(order) || "Walk-in / Online Client"}
                              </div>
                              <div className="text-[11px] text-gray-400">
                                {order.shippingAddress?.email || "N/A"}
                              </div>
                              <div className="mt-1">
                                <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#dfa742]/10 text-[#dfa742] border border-[#dfa742]/20 uppercase">
                                  📍 {getOrderCountryName(order)}
                                </span>
                              </div>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-300">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-[11px] font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                            {order.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-white">
                          {formatOrderPrice(order.totalPrice, order)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-[#13151b] rounded-2xl shadow-xl border border-[#22252d] p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#22252d]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#dfa742]" />
                <h2 className="text-base font-serif font-bold text-white tracking-wide">
                  Quick Actions
                </h2>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[#dfa742]/15 text-[#dfa742] border border-[#dfa742]/30">
                Essentials
              </span>
            </div>

            <div className="space-y-3">
              <Link
                to="/admin/orders"
                className="group flex items-center justify-between rounded-xl border border-[#22252d] bg-[#16181f] px-4 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#dfa742]/40 hover:bg-[#1a1d24]"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#dfa742]/10 border border-[#dfa742]/20 flex items-center justify-center text-[#dfa742] group-hover:bg-[#dfa742] group-hover:text-black transition-colors">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <span>Review Orders & Appointments</span>
                </span>
                <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-[#dfa742] transition-colors" />
              </Link>

              <Link
                to="/admin/products?type=services"
                className="group flex items-center justify-between rounded-xl border border-[#22252d] bg-[#16181f] px-4 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#dfa742]/40 hover:bg-[#1a1d24]"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#dfa742]/10 border border-[#dfa742]/20 flex items-center justify-center text-[#dfa742] group-hover:bg-[#dfa742] group-hover:text-black transition-colors">
                    <Scissors className="h-4 w-4" />
                  </div>
                  <span>Salon Services Catalog</span>
                </span>
                <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-[#dfa742] transition-colors" />
              </Link>

              <Link
                to="/admin/products/add?type=service"
                className="group flex items-center justify-between rounded-xl border border-[#22252d] bg-[#16181f] px-4 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#dfa742]/40 hover:bg-[#1a1d24]"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                    <PackagePlus className="h-4 w-4" />
                  </div>
                  <span>Add New Salon Service</span>
                </span>
                <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
              </Link>

              <Link
                to="/admin/products?type=products"
                className="group flex items-center justify-between rounded-xl border border-[#22252d] bg-[#16181f] px-4 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#dfa742]/40 hover:bg-[#1a1d24]"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <span>Retail Products Catalog</span>
                </span>
                <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-amber-400 transition-colors" />
              </Link>

              <Link
                to="/admin/users"
                className="group flex items-center justify-between rounded-xl border border-[#22252d] bg-[#16181f] px-4 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#dfa742]/40 hover:bg-[#1a1d24]"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-black transition-colors">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <span>Manage Users & Clients</span>
                </span>
                <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </Link>
            </div>

            <div className="rounded-xl border border-[#dfa742]/20 bg-[#dfa742]/5 p-4 text-xs text-gray-400 leading-relaxed">
              <p className="font-semibold text-[#dfa742] mb-1">Administrative Role Access</p>
              Your options are automatically filtered based on your permissions granted by the Super Administrator.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
