"use client"

import { useState, useEffect, useLayoutEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  Megaphone,
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  Tag,
  ImageIcon,
  Percent,
  ChevronDown,
  ChevronRight,
  Palette,
  Shield,
  Calculator,
  Ruler,
  Box,
  Layers,
  BookOpen,
  Truck,
  Phone,
  Star,
  TrendingUp,
  Cog,
  ShoppingBag,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Activity,
  UserCog,
  Languages,
  Unlock,
  Globe,
  Award,
  Gift,
  Boxes,
  BellRing,
  MessageCircle,
  Scissors,
  Sparkles,
  Plus,
  ExternalLink,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"

const SIDEBAR_SCROLL_KEY = "adminSidebarScroll"

const AdminSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef(null)
  const restoreUntil = useRef(0)
  const { adminLogout, isSuperAdmin, hasPermission } = useAuth()
  const isSuper = isSuperAdmin || localStorage.getItem("isSuperAdmin") === "true"

  const [openDropdowns, setOpenDropdowns] = useState({
    services: false,
    productsMenu: false,
    productSystem: false,
    products: false,
    categories: false,
    brands: false,
    volumes: false,
    warranty: false,
    colors: false,
    units: false,
    tax: false,
    sizes: false,
    orders: false,
    blogs: false,
    subcategories: false,
    subcategories2: false,
    subcategories3: false,
    subcategories4: false,
    coupons: false,
    loyalty: false,
    referrals: false,
    reviews: false,
    series: false,
    models: false,
    makes: false,
    manufacturers: false,
    soldBy: false,
    inventory: false,
    bulkMails: false,
    stockAdjustment: false,
    deliveryCharges: false,
    createOrderQuotation: false,
    seoSettings: false,
    superAdmin: false,
  })

  // Auto-open dropdowns based on current route
  useEffect(() => {
    const path = location.pathname
    const search = location.search
    const newOpenDropdowns = { ...openDropdowns }

    if (search.includes("type=services") || search.includes("type=service")) {
      newOpenDropdowns.services = true
    } else if (
      (path === "/admin/products" || path === "/admin/products/add") &&
      (search.includes("type=products") || search.includes("type=product") || !search)
    ) {
      newOpenDropdowns.productsMenu = true
    }

    if (
      path.includes("/admin/product-pm") ||
      path.includes("/admin/country-pm") ||
      path.includes("/admin/categories") ||
      path.includes("/admin/add-category") ||
      path.includes("/admin/trash-categories") ||
      path.includes("/admin/brands") ||
      path.includes("/admin/add-brand") ||
      path.includes("/admin/series") ||
      path.includes("/admin/models") ||
      path.includes("/admin/makes") ||
      path.includes("/admin/manufacturers") ||
      path.includes("/admin/sold-by") ||
      path.includes("/admin/volumes") ||
      path.includes("/admin/warranty") ||
      path.includes("/admin/colors") ||
      path.includes("/admin/units") ||
      path.includes("/admin/tax") ||
      path.includes("/admin/sizes") ||
      path.includes("/admin/subcategories")
    ) {
      newOpenDropdowns.productSystem = true
    }

    if (
      (path.includes("/admin/orders") &&
        !path.includes("/admin/orders/create") &&
        !path.includes("/admin/orders/quotations") &&
        !path.includes("/admin/orders/wholesale")) ||
      path.includes("/admin/orders/new") ||
      path.includes("/admin/orders/confirmed") ||
      path.includes("/admin/orders/processing") ||
      path.includes("/admin/orders/delivered") ||
      path.includes("/admin/orders/cancelled")
    ) {
      newOpenDropdowns.orders = true
    }

    if (
      path.includes("/admin/orders/create") ||
      path.includes("/admin/orders/quotations") ||
      path.includes("/admin/orders/wholesale")
    ) {
      newOpenDropdowns.createOrderQuotation = true
    }

    if (
      path.includes("/admin/blog-dashboard") ||
      path.includes("/admin/blogs") ||
      path.includes("/admin/add-blog") ||
      path.includes("/admin/blog-topics") ||
      path.includes("/admin/blog-categories") ||
      path.includes("/admin/blog-brands") ||
      path.includes("/admin/blog-comments") ||
      path.includes("/admin/blog-rating")
    ) {
      newOpenDropdowns.blogs = true
    }

    if (path.includes("/admin/coupons") || path.includes("/admin/app-discount-settings")) {
      newOpenDropdowns.coupons = true
    }

    if (path.includes("/admin/reviews")) {
      newOpenDropdowns.reviews = true
    }

    if (path.includes("/admin/stock-adjustment")) {
      newOpenDropdowns.stockAdjustment = true
    }

    if (path.includes("/admin/delivery-charges") || path.includes("/admin/delivery-handling-fee")) {
      newOpenDropdowns.deliveryCharges = true
    }

    if (path.includes("/admin/inventory")) {
      newOpenDropdowns.inventory = true
    }

    if (path.includes("/admin/email-templates") || path.includes("/admin/campaigns")) {
      newOpenDropdowns.bulkMails = true
    }

    if (path.includes("/admin/seo-settings")) {
      newOpenDropdowns.seoSettings = true
    }

    if (path.includes("/admin/loyalty")) {
      newOpenDropdowns.loyalty = true
    }

    if (path.includes("/admin/referrals")) {
      newOpenDropdowns.referrals = true
    }

    if (path.includes("/admin/admin-management") || path.includes("/admin/activity-logs")) {
      newOpenDropdowns.superAdmin = true
    }

    setOpenDropdowns(newOpenDropdowns)
  }, [location.pathname, location.search])

  const toggleDropdown = (dropdownName, e) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName],
    }))
  }

  const handleLogout = () => {
    adminLogout()
    navigate("/admin/login")
  }

  // Active check helper
  const isActive = (path) => {
    if (path.includes("?")) {
      const [pathname, search] = path.split("?")
      return location.pathname === pathname && location.search.includes(search)
    }
    return location.pathname === path && (!location.search || location.search === "")
  }

  const restoreScroll = () => {
    const nav = navRef.current
    if (!nav || Date.now() > restoreUntil.current) return
    const saved = Number(sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || 0)
    if (saved > 0 && nav.scrollTop !== saved) nav.scrollTop = saved
  }

  useLayoutEffect(() => {
    restoreUntil.current = Date.now() + 1000
    restoreScroll()
  }, [])

  useEffect(() => {
    restoreScroll()
  }, [openDropdowns])

  // Full Menu Items List
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
      permission: "dashboard",
    },
    {
      title: "Services",
      icon: Scissors,
      dropdown: "services",
      permission: "services",
      items: [
        { title: "All Services", path: "/admin/products?type=services", icon: Sparkles },
        { title: "Add Service", path: "/admin/products/add?type=service", icon: Plus },
      ],
    },
    {
      title: "Products",
      icon: ShoppingBag,
      dropdown: "productsMenu",
      permission: "products",
      items: [
        { title: "All Products", path: "/admin/products?type=products", icon: Package },
        { title: "Add Product", path: "/admin/products/add?type=product", icon: Plus },
      ],
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      dropdown: "orders",
      permission: "orders",
      items: [
        { title: "All Orders", path: "/admin/orders" },
        { title: "New Orders", path: "/admin/orders?status=New", icon: Clock },
        { title: "Confirmed", path: "/admin/orders?status=Confirmed", icon: CheckCircle },
        { title: "Processing", path: "/admin/orders?status=Processing", icon: Truck },
        { title: "Delivered", path: "/admin/orders?status=Delivered", icon: CheckCircle },
        { title: "Cancelled", path: "/admin/orders?status=Cancelled", icon: XCircle },
        { title: "Critical Orders", path: "/admin/orders/critical", icon: AlertTriangle, highlight: true },
      ],
    },
    {
      title: "Order/Quotation",
      icon: ShoppingCart,
      dropdown: "createOrderQuotation",
      permission: "quotations",
      items: [
        { title: "Create Order/Quotation", path: "/admin/orders/create" },
        { title: "Recent Quotation", path: "/admin/orders/quotations" },
        { title: "Wholesale Orders", path: "/admin/orders/wholesale" },
      ],
    },
    {
      title: "Product System",
      icon: Layers,
      dropdown: "productSystem",
      permission: "categories",
      items: [
        {
          title: "Categories",
          icon: Tag,
          dropdown: "categories",
          permission: "categories",
          items: [
            { title: "List Categories", path: "/admin/categories" },
            { title: "Add Category", path: "/admin/categories/add" },
            { title: "Trash Categories", path: "/admin/categories/trash" },
            { title: "Category Slider", path: "/admin/categories/slider" },
          ],
        },
        {
          title: "Sub Categories",
          icon: Tag,
          dropdown: "subcategories",
          permission: "subcategories",
          items: [
            { title: "List Sub Categories", path: "/admin/subcategories" },
            { title: "Add Sub Category", path: "/admin/subcategories/add" },
            { title: "Trash Sub Categories", path: "/admin/subcategories/trash" },
          ],
        },
        {
          title: "Sub Categories 2",
          icon: Tag,
          dropdown: "subcategories2",
          permission: "subcategories",
          items: [
            { title: "List Sub Categories 2", path: "/admin/subcategories-2" },
            { title: "Add Sub Category 2", path: "/admin/subcategories-2/add" },
          ],
        },
        {
          title: "Sub Categories 3",
          icon: Tag,
          dropdown: "subcategories3",
          permission: "subcategories",
          items: [
            { title: "List Sub Categories 3", path: "/admin/subcategories-3" },
            { title: "Add Sub Category 3", path: "/admin/subcategories-3/add" },
          ],
        },
        {
          title: "Sub Categories 4",
          icon: Tag,
          dropdown: "subcategories4",
          permission: "subcategories",
          items: [
            { title: "List Sub Categories 4", path: "/admin/subcategories-4" },
            { title: "Add Sub Category 4", path: "/admin/subcategories-4/add" },
          ],
        },
        {
          title: "Brands",
          icon: Tag,
          dropdown: "brands",
          permission: "brands",
          items: [
            { title: "List Brands", path: "/admin/brands" },
            { title: "Add Brand", path: "/admin/brands/add" },
          ],
        },
        {
          title: "Series",
          icon: Layers,
          dropdown: "series",
          permission: "products",
          items: [
            { title: "List Series", path: "/admin/series" },
            { title: "Add Series", path: "/admin/series/add" },
          ],
        },
        {
          title: "Model",
          icon: Package,
          dropdown: "models",
          permission: "products",
          items: [
            { title: "List Model", path: "/admin/models" },
            { title: "Add Model", path: "/admin/models/add" },
          ],
        },
        {
          title: "Make",
          icon: Settings,
          dropdown: "makes",
          permission: "products",
          items: [
            { title: "List Make", path: "/admin/makes" },
            { title: "Add Make", path: "/admin/makes/add" },
          ],
        },
        {
          title: "Manufacturer",
          icon: Cog,
          dropdown: "manufacturers",
          permission: "products",
          items: [
            { title: "List Manufacturer", path: "/admin/manufacturers" },
            { title: "Add Manufacturer", path: "/admin/manufacturers/add" },
          ],
        },
        {
          title: "Sold By",
          icon: ShoppingBag,
          dropdown: "soldBy",
          permission: "products",
          items: [
            { title: "List Sold By", path: "/admin/sold-by" },
            { title: "Add Sold By", path: "/admin/sold-by/add" },
          ],
        },
        {
          title: "Volumes",
          icon: Box,
          dropdown: "volumes",
          permission: "volumes",
          items: [
            { title: "List Volumes", path: "/admin/volumes" },
            { title: "Add Volume", path: "/admin/volumes/add" },
          ],
        },
        {
          title: "Warranty",
          icon: Shield,
          dropdown: "warranty",
          permission: "warranty",
          items: [
            { title: "List Warranty", path: "/admin/warranty" },
            { title: "Add Warranty", path: "/admin/warranty/add" },
          ],
        },
        {
          title: "Colors",
          icon: Palette,
          dropdown: "colors",
          permission: "colors",
          items: [
            { title: "List Colors", path: "/admin/colors" },
            { title: "Add Color", path: "/admin/colors/add" },
          ],
        },
        {
          title: "Units",
          icon: Ruler,
          dropdown: "units",
          permission: "units",
          items: [
            { title: "List Units", path: "/admin/units" },
            { title: "Add Unit", path: "/admin/units/add" },
          ],
        },
        {
          title: "Tax",
          icon: Calculator,
          dropdown: "tax",
          permission: "tax",
          items: [
            { title: "List Tax", path: "/admin/tax" },
            { title: "Add Tax", path: "/admin/tax/add" },
          ],
        },
        {
          title: "Sizes",
          icon: Ruler,
          dropdown: "sizes",
          permission: "sizes",
          items: [
            { title: "List Sizes", path: "/admin/sizes" },
            { title: "Add Size", path: "/admin/sizes/add" },
          ],
        },
      ],
    },
    {
      title: "Stock Adjustment",
      icon: TrendingUp,
      dropdown: "stockAdjustment",
      permission: "stockAdjustment",
      items: [
        { title: "Price Adjustment", path: "/admin/stock-adjustment/price-adjustment" },
        { title: "Reports", path: "/admin/stock-adjustment/reports" },
      ],
    },
    {
      title: "Delivery Charges",
      icon: Truck,
      dropdown: "deliveryCharges",
      permission: "deliveryCharges",
      items: [
        { title: "List Delivery Charges", path: "/admin/delivery-charges" },
        { title: "Add Delivery Charge", path: "/admin/delivery-charges/add" },
        { title: "Delivery | Handling Fee", path: "/admin/delivery-handling-fee" },
      ],
    },
    {
      title: "Reviews",
      icon: Star,
      dropdown: "reviews",
      permission: "reviews",
      items: [
        { title: "All Reviews", path: "/admin/reviews" },
        { title: "Pending Reviews", path: "/admin/reviews/pending" },
        { title: "Approved Reviews", path: "/admin/reviews/approved" },
        { title: "Rejected Reviews", path: "/admin/reviews/rejected" },
      ],
    },
    {
      title: "Push Notifications",
      icon: BellRing,
      path: "/admin/push-notifications",
      permission: "pushNotifications",
    },
    {
      title: "WhatsApp",
      icon: MessageCircle,
      path: "/admin/whatsapp",
      permission: "whatsapp",
    },
    {
      title: "Request Callbacks",
      icon: Phone,
      path: "/admin/request-callbacks",
      permission: "requestCallbacks",
    },
    {
      title: "Bulk Purchase",
      icon: ShoppingBag,
      path: "/admin/bulk-purchase",
      permission: "bulkPurchase",
    },
    {
      title: "Buyer Protection",
      icon: Shield,
      path: "/admin/buyer-protection",
      permission: "buyerProtection",
    },
    {
      title: "Blogs",
      icon: BookOpen,
      dropdown: "blogs",
      permission: "blogs",
      items: [
        { title: "Dashboard", path: "/admin/blog-dashboard" },
        { title: "Blogs", path: "/admin/blogs" },
        { title: "Comments", path: "/admin/blog-comments" },
        { title: "Categories", path: "/admin/blog-categories" },
        { title: "Topics", path: "/admin/blog-topics" },
        { title: "Brands", path: "/admin/blog-brands" },
      ],
    },
    {
      title: "Users",
      icon: Users,
      path: "/admin/users",
      permission: "users",
    },
    {
      title: "Banners",
      icon: ImageIcon,
      path: "/admin/banners",
      permission: "banners",
    },
    {
      title: "Home Sections",
      icon: ImageIcon,
      path: "/admin/home-sections",
      permission: "homeSections",
    },
    {
      title: "Offer Pages",
      icon: Tag,
      path: "/admin/offer-pages",
      permission: "offerPages",
    },
    {
      title: "Coupons",
      icon: Percent,
      dropdown: "coupons",
      permission: "coupons",
      items: [
        { title: "All Coupons", path: "/admin/coupons/all" },
        { title: "App Discount Settings", path: "/admin/app-discount-settings" },
        { title: "Popup Settings", path: "/admin/app-discount-settings/popup-settings" },
      ],
    },
    {
      title: "Loyalty Points",
      icon: Award,
      dropdown: "loyalty",
      permission: "loyalty",
      items: [
        { title: "Programme Settings", path: "/admin/loyalty/settings" },
        { title: "Category Earning Rules", path: "/admin/loyalty/rules" },
        { title: "Customer Points", path: "/admin/loyalty/customers" },
      ],
    },
    {
      title: "Referrals",
      icon: Gift,
      dropdown: "referrals",
      permission: "referrals",
      items: [
        { title: "Programme Settings", path: "/admin/referrals/settings" },
        { title: "All Referrals", path: "/admin/referrals/list" },
      ],
    },
    {
      title: "SEO Settings",
      icon: Cog,
      dropdown: "seoSettings",
      permission: "seoSettings",
      items: [
        { title: "Pages", path: "/admin/seo-settings/pages" },
        { title: "Home Page SEO", path: "/admin/seo-settings/home" },
        { title: "Redirects", path: "/admin/seo-settings/redirects" },
        { title: "Bing IndexNow", path: "/admin/seo-settings/bing-indexnow" },
      ],
    },
    {
      title: "Bulk Mails",
      icon: Megaphone,
      dropdown: "bulkMails",
      permission: "emailTemplates",
      items: [
        { title: "Email Template", path: "/admin/email-templates" },
        { title: "Create Campaign", path: "/admin/campaigns" },
      ],
    },
    {
      title: "Newsletter Subscribers",
      icon: Users,
      path: "/admin/newsletter-subscribers",
      permission: "newsletter",
    },
    {
      title: "Reset Cache",
      icon: RefreshCw,
      path: "/admin/reset-cache",
      permission: "cache",
    },
    {
      title: "Arabic Conversion",
      icon: Languages,
      path: "/admin/arabic-conversion",
      permission: "cache",
    },
    {
      title: "GCC Countries & Rates",
      icon: Globe,
      path: "/admin/settings?tab=countries",
      permission: "settings",
    },
    {
      title: "Website Appearance",
      icon: Palette,
      path: "/admin/appearance",
      permission: "settings",
    },
    {
      title: "Admin Settings",
      icon: Settings,
      path: "/admin/settings",
      permission: "settings",
    },
  ]

  // Super Admin only menu items
  const superAdminMenuItems = [
    {
      title: "Super Admin",
      icon: ShieldCheck,
      dropdown: "superAdmin",
      superAdminOnly: true,
      items: [
        { title: "Admin Management", path: "/admin/admin-management", icon: UserCog },
        { title: "Activity Logs", path: "/admin/activity-logs", icon: Activity },
      ],
    },
  ]

  // Filter menu items based on permissions
  const filterMenuItems = (items, isTopLevel = true) => {
    return items
      .filter((item) => {
        // Super admin only items
        if (item.superAdminOnly && !isSuper) {
          return false
        }

        // If user is super admin, show everything
        if (isSuper) {
          return true
        }

        // Check permission for item
        if (item.permission) {
          if (item.permission === "services") {
            return hasPermission("services") || hasPermission("products")
          }
          return hasPermission(item.permission)
        }

        // No permission declared: hide it at the top level
        if (isTopLevel) {
          return false
        }

        return true
      })
      .map((item) => {
        if (item.items) {
          return {
            ...item,
            items: filterMenuItems(item.items, false),
          }
        }
        return item
      })
      .filter((item) => {
        // Remove empty dropdowns
        if (item.dropdown && item.items && item.items.length === 0) {
          return false
        }
        return true
      })
  }

  const allMenuItems = [...menuItems, ...superAdminMenuItems]
  const filteredMenuItems = filterMenuItems(allMenuItems)

  // Recursive menu item renderer with luxury styling
  const renderMenuItem = (item, level = 0) => {
    const isTop = level === 0
    const paddingLeft = isTop ? "px-3.5" : level === 1 ? "pl-7 pr-3" : "pl-10 pr-3"
    const textSize = isTop ? "text-sm font-medium" : "text-xs font-medium"

    // Single item dropdown
    if (item.dropdown && item.items && item.items.length === 1) {
      const subItem = item.items[0]
      const active = isActive(subItem.path)
      return (
        <Link
          key={item.title}
          to={subItem.path}
          className={`flex items-center gap-3 ${paddingLeft} py-2.5 rounded-xl ${textSize} transition-all duration-200 ${
            active
              ? "bg-[#dfa742] text-black font-semibold shadow-md shadow-[#dfa742]/20"
              : "text-gray-300 hover:text-white hover:bg-[#1a1d24]"
          }`}
        >
          {item.icon && <item.icon className="w-4 h-4 text-[#dfa742]" />}
          <span>{item.title}</span>
        </Link>
      )
    }

    if (item.dropdown) {
      const hasActiveChild = item.items?.some((sub) =>
        sub.items ? sub.items.some((leaf) => isActive(leaf.path)) : isActive(sub.path),
      )
      const isOpen = openDropdowns[item.dropdown]

      return (
        <div key={item.title} className="pt-0.5">
          <button
            type="button"
            onClick={(e) => toggleDropdown(item.dropdown, e)}
            className={`w-full flex items-center justify-between ${paddingLeft} py-2.5 rounded-xl ${textSize} transition-all duration-200 ${
              hasActiveChild || isOpen
                ? "text-white bg-[#1a1d24]"
                : "text-gray-300 hover:text-white hover:bg-[#1a1d24]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.icon && <item.icon className="w-4 h-4 text-[#dfa742] flex-shrink-0" />}
              <span className="truncate">{item.title}</span>
            </div>
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
          </button>

          {isOpen && (
            <div className={`space-y-0.5 pt-1 pb-1 ${isTop ? "bg-[#13151b]/40 rounded-xl my-0.5" : ""}`}>
              {item.items.map((subItem) => renderMenuItem(subItem, level + 1))}
            </div>
          )}
        </div>
      )
    }

    const active = isActive(item.path)
    return (
      <Link
        key={item.title}
        to={item.path}
        className={`flex items-center gap-2.5 ${paddingLeft} py-2 rounded-lg ${textSize} transition-all duration-200 ${
          active
            ? isTop
              ? "bg-[#dfa742] text-black font-semibold shadow-md shadow-[#dfa742]/20"
              : "bg-[#dfa742]/20 text-[#dfa742] font-semibold border-l-2 border-[#dfa742]"
            : "text-gray-400 hover:text-white hover:bg-[#1a1d24]"
        }`}
      >
        {item.icon && <item.icon className="w-3.5 h-3.5 flex-shrink-0" />}
        <span className="truncate">{item.title}</span>
        {item.highlight && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        )}
      </Link>
    )
  }

  return (
    <aside className="w-64 bg-[#0d0e11] text-gray-200 h-screen inset-y-0 border-r border-[#22252d] fixed left-0 top-0 z-50 flex flex-col shadow-2xl select-none">
      {/* 1. BRAND HEADER */}
      <div className="p-4 border-b border-[#22252d] bg-[#12141a]/60 flex-shrink-0">
        <Link to="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-[#181a20] border border-[#2b2f3a] flex items-center justify-center p-1 flex-shrink-0 group-hover:border-[#dfa742]/50 transition-colors">
            <img
              src="/white-logo.png"
              alt="Trend Saloon"
              className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
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
        </Link>
      </div>

      {/* 2. NAVIGATION MENU (Filtered by Permissions) */}
      <nav
        ref={navRef}
        onScroll={(e) => sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(e.currentTarget.scrollTop))}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1 admin-sidebar-nav"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#2b2f3a #0d0e11" }}
      >
        <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Management
        </p>

        {filteredMenuItems.map((item) => renderMenuItem(item, 0))}
      </nav>

      {/* 3. FOOTER ACTIONS */}
      <div className="p-4 border-t border-[#22252d] bg-[#12141a]/60 space-y-2 flex-shrink-0">
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