"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { useToast } from "../../context/ToastContext"
import {
  Upload,
  Save,
  ImageIcon,
  Sparkles,
  Scissors,
  ShoppingBag,
  Phone,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle,
  Monitor,
  Smartphone,
  Info,
} from "lucide-react"
import config from "../../config/config"
import { getFullImageUrl } from "../../utils/imageUtils"

export default function AdminBanners() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState("home") // "home" | "offers" | "services" | "products" | "contact"
  const [previewDevice, setPreviewDevice] = useState("desktop") // "desktop" | "mobile"
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingDesktop, setUploadingDesktop] = useState(false)
  const [uploadingMobile, setUploadingMobile] = useState(false)

  // Banner image states (Pure graphical banners with Desktop & Mobile options)
  const [homeBanner, setHomeBanner] = useState({ image: "", mobileImage: "" })
  const [offersBanner, setOffersBanner] = useState({ image: "", mobileImage: "" })
  const [servicesBanner, setServicesBanner] = useState({ image: "", mobileImage: "" })
  const [productsBanner, setProductsBanner] = useState({ image: "", mobileImage: "" })
  const [contactBanner, setContactBanner] = useState({ image: "", mobileImage: "" })

  // Fetch current salon banners
  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${config.API_URL}/api/banners/salon-banners?_t=${Date.now()}`)
      if (res.data) {
        if (res.data.home) setHomeBanner({ image: res.data.home.image || "", mobileImage: res.data.home.mobileImage || "" })
        if (res.data.offers) setOffersBanner({ image: res.data.offers.image || "", mobileImage: res.data.offers.mobileImage || "" })
        if (res.data.services) setServicesBanner({ image: res.data.services.image || "", mobileImage: res.data.services.mobileImage || "" })
        if (res.data.products) setProductsBanner({ image: res.data.products.image || "", mobileImage: res.data.products.mobileImage || "" })
        if (res.data.contact) setContactBanner({ image: res.data.contact.image || "", mobileImage: res.data.contact.mobileImage || "" })
      }
    } catch (err) {
      console.warn("Could not fetch banners:", err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle image upload via /api/upload/single
  const handleImageUpload = async (e, bannerType, device = "desktop") => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      if (device === "mobile") {
        setUploadingMobile(true)
      } else {
        setUploadingDesktop(true)
      }
      const formData = new FormData()
      formData.append("image", file)

      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("userInfo") || "{}").token

      if (!token) {
        showToast("Please login as admin first", "error")
        return
      }

      const res = await axios.post(`${config.API_URL}/api/upload/single`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.data && res.data.url) {
        const uploadedUrl = res.data.url
        const field = device === "mobile" ? "mobileImage" : "image"

        const updateState = (setter) => {
          setter((prev) => ({ ...prev, [field]: uploadedUrl }))
        }

        if (bannerType === "home") updateState(setHomeBanner)
        else if (bannerType === "offers") updateState(setOffersBanner)
        else if (bannerType === "services") updateState(setServicesBanner)
        else if (bannerType === "products") updateState(setProductsBanner)
        else if (bannerType === "contact") updateState(setContactBanner)

        showToast(
          `${device === "mobile" ? "Mobile" : "Desktop"} banner uploaded successfully! Click Save to apply changes.`,
          "success",
        )
      }
    } catch (err) {
      console.error("Upload error:", err)
      showToast(err.response?.data?.message || "Failed to upload image", "error")
    } finally {
      if (device === "mobile") {
        setUploadingMobile(false)
      } else {
        setUploadingDesktop(false)
      }
    }
  }

  // Save banners to backend
  const handleSave = async (bannerType) => {
    try {
      setSaving(true)
      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("userInfo") || "{}").token

      if (!token) {
        showToast("Please login as admin first", "error")
        return
      }

      const payload = {}
      if (bannerType === "home" || bannerType === "all") {
        payload.home = {
          image: homeBanner.image || "",
          mobileImage: homeBanner.mobileImage || "",
          title: "",
          tagline: "",
          subtitle: "",
          buttonText: "",
        }
      }
      if (bannerType === "offers" || bannerType === "all") {
        payload.offers = {
          image: offersBanner.image || "",
          mobileImage: offersBanner.mobileImage || "",
          title: "",
          subtitle: "",
          buttonText: "",
          link: "",
        }
      }
      if (bannerType === "services" || bannerType === "all") {
        payload.services = {
          image: servicesBanner.image || "",
          mobileImage: servicesBanner.mobileImage || "",
          title: "",
          subtitle: "",
        }
      }
      if (bannerType === "products" || bannerType === "all") {
        payload.products = {
          image: productsBanner.image || "",
          mobileImage: productsBanner.mobileImage || "",
          title: "",
          subtitle: "",
        }
      }
      if (bannerType === "contact" || bannerType === "all") {
        payload.contact = {
          image: contactBanner.image || "",
          mobileImage: contactBanner.mobileImage || "",
        }
      }

      await axios.put(`${config.API_URL}/api/banners/salon-banners`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Update local storage cache as well for instant frontend reflection
      try {
        const cached = JSON.parse(localStorage.getItem("trend_salon_banners_v1") || "{}")
        if (bannerType === "home" || bannerType === "all") cached.home = payload.home
        if (bannerType === "offers" || bannerType === "all") cached.offers = payload.offers
        if (bannerType === "services" || bannerType === "all") cached.services = payload.services
        if (bannerType === "products" || bannerType === "all") cached.products = payload.products
        if (bannerType === "contact" || bannerType === "all") cached.contact = payload.contact
        localStorage.setItem("trend_salon_banners_v1", JSON.stringify(cached))
      } catch {}

      showToast("Banners updated successfully! Changes are live on both Desktop & Mobile.", "success")
    } catch (err) {
      console.error("Save error:", err)
      showToast(err.response?.data?.message || "Failed to update banner", "error")
    } finally {
      setSaving(false)
    }
  }

  // Active banner data getter
  const getCurrentBannerData = () => {
    switch (activeTab) {
      case "home":
        return {
          title: "1. Homepage Hero Banner",
          description: "Top primary banner displayed at the very top of the homepage.",
          data: homeBanner,
          setter: setHomeBanner,
          saveLabel: "Save Homepage Hero Banner",
          desktopAspectHint: "Recommended desktop size: 1920x650 or 1920x800. Edge-to-edge full width graphic.",
          mobileAspectHint: "Recommended mobile size: 750x600, 800x800 or 800x600. Optimized for portrait mobile screens.",
        }
      case "offers":
        return {
          title: "2. Homepage 2nd Banner (Special Offers)",
          description: "Middle full-width promotional banner displayed between Services and Products on the homepage.",
          data: offersBanner,
          setter: setOffersBanner,
          saveLabel: "Save Special Offers Banner",
          desktopAspectHint: "Recommended desktop size: 1920x450 or 1600x400. Clean rectangular graphic.",
          mobileAspectHint: "Recommended mobile size: 750x500 or 800x600. Mobile-friendly promotional graphic.",
        }
      case "services":
        return {
          title: "3. Services Page Banner",
          description: "Header banner for the /services-products page.",
          data: servicesBanner,
          setter: setServicesBanner,
          saveLabel: "Save Services Banner",
          desktopAspectHint: "Recommended desktop size: 1920x450 or 1600x400. Full-width landscape graphic.",
          mobileAspectHint: "Recommended mobile size: 750x450 or 800x550. Mobile header graphic.",
        }
      case "products":
        return {
          title: "4. Products Page Banner",
          description: "Header banner for the dedicated /products catalog page.",
          data: productsBanner,
          setter: setProductsBanner,
          saveLabel: "Save Products Banner",
          desktopAspectHint: "Recommended desktop size: 1920x450 or 1600x400. Full-width landscape graphic.",
          mobileAspectHint: "Recommended mobile size: 750x450 or 800x550. Mobile header graphic.",
        }
      case "contact":
        return {
          title: "5. Contact Us Page Banner",
          description: "Header banner for the /contact page.",
          data: contactBanner,
          setter: setContactBanner,
          saveLabel: "Save Contact Us Banner",
          desktopAspectHint: "Recommended desktop size: 1920x450 or 1600x400. Full-width landscape graphic.",
          mobileAspectHint: "Recommended mobile size: 750x450 or 800x550. Mobile header graphic.",
        }
      default:
        return null
    }
  }

  const current = getCurrentBannerData()

  return (
    <div className="flex min-h-screen bg-[#0d0e11] text-gray-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-6 sm:p-10 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <ImageIcon className="w-7 h-7 text-[#dfa742]" />
              <span>Main Pages Banner Manager</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Upload custom desktop and mobile view banners for all website pages. Separate artwork can be set for mobile screens.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBanners}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-300 bg-[#14161d] border border-[#2b2f3a] rounded-lg hover:bg-[#1a1d24] hover:text-white transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#22252d] mb-8 space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("home")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "home"
                ? "border-[#dfa742] text-[#dfa742] bg-[#14161d] shadow-sm"
                : "border-transparent text-gray-400 hover:text-white hover:bg-[#14161d]/50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#dfa742]" />
            <span>1. Homepage Hero</span>
          </button>

          <button
            onClick={() => setActiveTab("offers")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "offers"
                ? "border-[#dfa742] text-[#dfa742] bg-[#14161d] shadow-sm"
                : "border-transparent text-gray-400 hover:text-white hover:bg-[#14161d]/50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#dfa742]" />
            <span>2. Homepage 2nd (Offers)</span>
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "services"
                ? "border-[#dfa742] text-[#dfa742] bg-[#14161d] shadow-sm"
                : "border-transparent text-gray-400 hover:text-white hover:bg-[#14161d]/50"
            }`}
          >
            <Scissors className="w-4 h-4 text-[#dfa742]" />
            <span>3. Services Page</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "products"
                ? "border-[#dfa742] text-[#dfa742] bg-[#14161d] shadow-sm"
                : "border-transparent text-gray-400 hover:text-white hover:bg-[#14161d]/50"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#dfa742]" />
            <span>4. Products Page</span>
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "contact"
                ? "border-[#dfa742] text-[#dfa742] bg-[#14161d] shadow-sm"
                : "border-transparent text-gray-400 hover:text-white hover:bg-[#14161d]/50"
            }`}
          >
            <Phone className="w-4 h-4 text-[#dfa742]" />
            <span>5. Contact Us Page</span>
          </button>
        </div>

        {/* ACTIVE TAB CONTENT */}
        {current && (
          <div className="space-y-8 animate-fadeIn">
            {/* Live Visual Preview Container */}
            <div className="bg-[#0d0e11] text-white rounded-3xl overflow-hidden border border-[#dfa742]/30 shadow-2xl relative">
              {/* Preview Device Switcher Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 px-6 border-b border-[#22252d] bg-[#14161d]/90 gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#dfa742]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Live Preview</span>
                  <span className="text-xs text-gray-400">
                    — Showing {previewDevice === "desktop" ? "Desktop Banner" : "Mobile View"}
                  </span>
                </div>

                <div className="flex items-center bg-[#0d0e11] p-1 rounded-xl border border-[#2b2f3a] gap-1 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      previewDevice === "desktop"
                        ? "bg-[#dfa742] text-black shadow-md font-bold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      previewDevice === "mobile"
                        ? "bg-[#dfa742] text-black shadow-md font-bold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile Preview</span>
                  </button>
                </div>
              </div>

              {/* Preview Rendering: Desktop Mode */}
              {previewDevice === "desktop" ? (
                <div className="relative min-h-[220px] bg-[#090a0d]">
                  {Boolean(current.data.image) ? (
                    <div className="relative w-full">
                      <img
                        src={getFullImageUrl(current.data.image)}
                        alt="Desktop Banner Preview"
                        className="w-full h-auto max-h-[360px] object-cover object-center block"
                      />
                    </div>
                  ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center min-h-[240px]">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                        <Monitor className="w-8 h-8 text-[#dfa742]/60" />
                      </div>
                      <h3 className="text-base font-semibold text-white">No Desktop Banner Uploaded</h3>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm">
                        Upload your custom desktop banner graphic below. It will display on desktop monitors and tablets.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Preview Rendering: Mobile Mode (Framed inside Smartphone Mockup) */
                <div className="p-6 sm:p-8 flex flex-col items-center justify-center bg-[#07080a] min-h-[260px]">
                  <div className="w-full max-w-[340px] rounded-[32px] border-4 border-[#2b2f3a] bg-[#14161d] p-3 shadow-2xl overflow-hidden relative">
                    {/* Phone speaker / camera notch bar */}
                    <div className="w-24 h-3.5 bg-[#2b2f3a] rounded-full mx-auto mb-3 opacity-90 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#14161d] ml-auto mr-2" />
                    </div>

                    {Boolean(current.data.mobileImage) ? (
                      <div className="space-y-2">
                        <img
                          src={getFullImageUrl(current.data.mobileImage)}
                          alt="Mobile Banner Preview"
                          className="w-full h-auto max-h-[380px] object-cover rounded-xl block border border-white/10"
                        />
                        <div className="text-center text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1 pt-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Active Mobile Custom Banner</span>
                        </div>
                      </div>
                    ) : Boolean(current.data.image) ? (
                      <div className="space-y-2">
                        <img
                          src={getFullImageUrl(current.data.image)}
                          alt="Desktop Fallback Preview"
                          className="w-full h-auto max-h-[380px] object-cover rounded-xl block border border-white/10 opacity-90"
                        />
                        <div className="text-center text-[11px] text-amber-400 font-medium pt-1">
                          <span>⚠️ Using Desktop Banner (No mobile-specific banner uploaded)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
                        <Smartphone className="w-8 h-8 text-[#dfa742]/50 mb-2" />
                        <h4 className="text-sm font-semibold text-white">No Banner Uploaded</h4>
                        <p className="text-xs text-gray-400 mt-1">Upload a mobile banner graphic below</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Banner Upload & Editing Sections */}
            <div className="bg-[#14161d] rounded-2xl p-6 sm:p-8 border border-[#262933] shadow-xl space-y-8">
              <div className="border-b border-[#262933] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {current.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {current.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {current.data.image && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Desktop: Ready
                    </span>
                  )}
                  {current.data.mobileImage ? (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Mobile: Custom
                    </span>
                  ) : (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      Mobile: Auto-Fallback
                    </span>
                  )}
                </div>
              </div>

              {/* 1. DESKTOP BANNER CARD */}
              <div className="p-5 rounded-xl bg-[#1a1d24] border border-[#2e3340] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[#dfa742]" />
                    <span>1. Desktop View Banner (Artwork)</span>
                  </label>
                  {current.data.image && (
                    <span className="text-emerald-400 text-xs font-medium inline-flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Set
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Yeh banner desktop computers, laptops aur large screens per nazar aayega.
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <input
                    type="text"
                    value={current.data.image}
                    onChange={(e) => current.setter((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="Enter desktop image URL or file path (/uploads/...)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#2b2f3a] focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm bg-[#14161d] text-white placeholder-gray-500"
                  />

                  <div className="flex gap-2">
                    <label className="cursor-pointer bg-[#dfa742] hover:bg-[#caa638] text-black px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingDesktop ? "Uploading..." : "Upload Desktop Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, activeTab, "desktop")}
                      />
                    </label>

                    {Boolean(current.data.image) && (
                      <button
                        type="button"
                        onClick={() => current.setter((prev) => ({ ...prev, image: "" }))}
                        className="px-3 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        title="Remove desktop banner"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
                  <span>{current.desktopAspectHint}</span>
                </div>
              </div>

              {/* 2. MOBILE BANNER CARD */}
              <div className="p-5 rounded-xl bg-[#1a1d24] border border-[#2e3340] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#dfa742]" />
                    <span>2. Mobile View Banner (Artwork for Smartphones)</span>
                  </label>
                  {current.data.mobileImage ? (
                    <span className="text-emerald-400 text-xs font-medium inline-flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mobile Banner Active
                    </span>
                  ) : (
                    <span className="text-amber-400 text-xs font-medium">
                      Optional (Desktop Fallback)
                    </span>
                  )}
                </div>
                <div className="p-3 bg-[#14161d] rounded-xl border border-blue-500/20 text-xs text-gray-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Mobile View Option:</strong> Mobile screens (phones &lt; 768px) ke liye yahan alag portrait ya square banner add kar sakte hain. Agar mobile banner upload nahi karenge toh default desktop banner hi show hoga.
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <input
                    type="text"
                    value={current.data.mobileImage || ""}
                    onChange={(e) => current.setter((prev) => ({ ...prev, mobileImage: e.target.value }))}
                    placeholder="Enter mobile image URL or file path (/uploads/...)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#2b2f3a] focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm bg-[#14161d] text-white placeholder-gray-500"
                  />

                  <div className="flex gap-2">
                    <label className="cursor-pointer bg-[#2b2f3a] hover:bg-[#383d4c] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md border border-white/10 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                      <Upload className="w-4 h-4 text-[#dfa742]" />
                      <span>{uploadingMobile ? "Uploading..." : "Upload Mobile Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, activeTab, "mobile")}
                      />
                    </label>

                    {Boolean(current.data.mobileImage) && (
                      <button
                        type="button"
                        onClick={() => current.setter((prev) => ({ ...prev, mobileImage: "" }))}
                        className="px-3 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        title="Remove mobile banner"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
                  <span>{current.mobileAspectHint}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#262933] flex items-center justify-between">
                <p className="text-xs text-gray-400 hidden sm:block">
                  Changes save hone ke baad website per Desktop aur Mobile dono views per apply ho jayengi.
                </p>

                <button
                  type="button"
                  onClick={() => handleSave(activeTab)}
                  disabled={saving}
                  className="bg-[#dfa742] hover:bg-[#caa638] text-black font-bold text-sm px-8 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-[#dfa742]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ml-auto"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : current.saveLabel}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
