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
} from "lucide-react"
import config from "../../config/config"
import { getFullImageUrl } from "../../utils/imageUtils"

export default function AdminBanners() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState("home") // "home" | "offers" | "services" | "products" | "contact"
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Banner image states (Pure graphical banners)
  const [homeBanner, setHomeBanner] = useState({ image: "" })
  const [offersBanner, setOffersBanner] = useState({ image: "" })
  const [servicesBanner, setServicesBanner] = useState({ image: "" })
  const [productsBanner, setProductsBanner] = useState({ image: "" })
  const [contactBanner, setContactBanner] = useState({ image: "" })

  // Fetch current salon banners
  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${config.API_URL}/api/banners/salon-banners?_t=${Date.now()}`)
      if (res.data) {
        if (res.data.home) setHomeBanner({ image: res.data.home.image || "" })
        if (res.data.offers) setOffersBanner({ image: res.data.offers.image || "" })
        if (res.data.services) setServicesBanner({ image: res.data.services.image || "" })
        if (res.data.products) setProductsBanner({ image: res.data.products.image || "" })
        if (res.data.contact) setContactBanner({ image: res.data.contact.image || "" })
      }
    } catch (err) {
      console.warn("Could not fetch banners:", err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle image upload via /api/upload/single
  const handleImageUpload = async (e, bannerType) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
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
        if (bannerType === "home") {
          setHomeBanner({ image: uploadedUrl })
        } else if (bannerType === "offers") {
          setOffersBanner({ image: uploadedUrl })
        } else if (bannerType === "services") {
          setServicesBanner({ image: uploadedUrl })
        } else if (bannerType === "products") {
          setProductsBanner({ image: uploadedUrl })
        } else if (bannerType === "contact") {
          setContactBanner({ image: uploadedUrl })
        }
        showToast("Image uploaded successfully! Click Save to apply changes.", "success")
      }
    } catch (err) {
      console.error("Upload error:", err)
      showToast(err.response?.data?.message || "Failed to upload image", "error")
    } finally {
      setUploading(false)
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
          image: homeBanner.image,
          title: "",
          tagline: "",
          subtitle: "",
          buttonText: "",
        }
      }
      if (bannerType === "offers" || bannerType === "all") {
        payload.offers = {
          image: offersBanner.image,
          title: "",
          subtitle: "",
          buttonText: "",
          link: "",
        }
      }
      if (bannerType === "services" || bannerType === "all") {
        payload.services = {
          image: servicesBanner.image,
          title: "",
          subtitle: "",
        }
      }
      if (bannerType === "products" || bannerType === "all") {
        payload.products = {
          image: productsBanner.image,
          title: "",
          subtitle: "",
        }
      }
      if (bannerType === "contact" || bannerType === "all") {
        payload.contact = {
          image: contactBanner.image,
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

      showToast("Banner updated successfully! Changes are live.", "success")
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
          aspectHint: "Recommended size: 1920x650 or 1920x800. Edge-to-edge full width graphic.",
        }
      case "offers":
        return {
          title: "2. Homepage 2nd Banner (Special Offers)",
          description: "Middle full-width promotional banner displayed between Services and Products on the homepage.",
          data: offersBanner,
          setter: setOffersBanner,
          saveLabel: "Save Special Offers Banner",
          aspectHint: "Recommended size: 1920x450 or 1600x400. Clean rectangular graphic (no curved cuts).",
        }
      case "services":
        return {
          title: "3. Services Page Banner",
          description: "Header banner for the /services-products page.",
          data: servicesBanner,
          setter: setServicesBanner,
          saveLabel: "Save Services Banner",
          aspectHint: "Recommended size: 1920x450 or 1600x400. Full-width landscape graphic.",
        }
      case "products":
        return {
          title: "4. Products Page Banner",
          description: "Header banner for the dedicated /products catalog page.",
          data: productsBanner,
          setter: setProductsBanner,
          saveLabel: "Save Products Banner",
          aspectHint: "Recommended size: 1920x450 or 1600x400. Full-width landscape graphic.",
        }
      case "contact":
        return {
          title: "5. Contact Us Page Banner",
          description: "Header banner for the /contact page.",
          data: contactBanner,
          setter: setContactBanner,
          saveLabel: "Save Contact Us Banner",
          aspectHint: "Recommended size: 1920x450 or 1600x400. Full-width landscape graphic.",
        }
      default:
        return null
    }
  }

  const current = getCurrentBannerData()

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-6 sm:p-10 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <ImageIcon className="w-7 h-7 text-[#dfa742]" />
              <span>Main Pages Banner Manager</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload custom graphical banners for all salon website pages. All banners render full-width edge-to-edge.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBanners}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 mb-8 space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("home")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "home"
                ? "border-[#dfa742] text-[#b38743] bg-white shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#dfa742]" />
            <span>1. Homepage Hero</span>
          </button>

          <button
            onClick={() => setActiveTab("offers")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "offers"
                ? "border-[#dfa742] text-[#b38743] bg-white shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#dfa742]" />
            <span>2. Homepage 2nd (Offers)</span>
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "services"
                ? "border-[#dfa742] text-[#b38743] bg-white shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
            }`}
          >
            <Scissors className="w-4 h-4 text-[#dfa742]" />
            <span>3. Services Page</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "products"
                ? "border-[#dfa742] text-[#b38743] bg-white shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#dfa742]" />
            <span>4. Products Page</span>
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "contact"
                ? "border-[#dfa742] text-[#b38743] bg-white shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
            }`}
          >
            <Phone className="w-4 h-4 text-[#dfa742]" />
            <span>5. Contact Us Page</span>
          </button>
        </div>

        {/* ACTIVE TAB CONTENT */}
        {current && (
          <div className="space-y-8 animate-fadeIn">
            {/* Live Visual Preview */}
            <div className="bg-[#0d0e11] text-white rounded-3xl overflow-hidden border border-[#dfa742]/30 shadow-2xl relative min-h-[220px]">
              <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#dfa742] flex items-center gap-1.5 border border-[#dfa742]/30">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </div>

              {Boolean(current.data.image) ? (
                <div className="relative w-full">
                  <img
                    src={getFullImageUrl(current.data.image)}
                    alt="Banner Preview"
                    className="w-full h-auto max-h-[360px] object-cover object-center block"
                  />
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center min-h-[240px]">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                    <ImageIcon className="w-8 h-8 text-[#dfa742]/60" />
                  </div>
                  <h3 className="text-base font-semibold text-white">No Banner Uploaded Yet</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    Upload your custom designed banner graphic below. It will immediately show here and on your live website.
                  </p>
                </div>
              )}
            </div>

            {/* Banner Upload & Editing Card (No extra text fields) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {current.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {current.description}
                </p>
              </div>

              {/* Graphic Banner Image URL & Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Banner Graphic Image (Artwork)
                </label>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={current.data.image}
                    onChange={(e) => current.setter({ image: e.target.value })}
                    placeholder="Upload image or enter file path (/uploads/...)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dfa742] text-sm bg-white"
                  />

                  <div className="flex gap-2">
                    <label className="cursor-pointer bg-[#dfa742] hover:bg-[#caa638] text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                      <Upload className="w-4 h-4" />
                      <span>{uploading ? "Uploading..." : "Upload Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, activeTab)}
                      />
                    </label>

                    {Boolean(current.data.image) && (
                      <button
                        type="button"
                        onClick={() => current.setter({ image: "" })}
                        className="px-3.5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        title="Remove banner"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span>{current.aspectHint}</span>
                  {current.data.image && (
                    <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Image Selected
                    </span>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleSave(activeTab)}
                  disabled={saving}
                  className="bg-[#dfa742] hover:bg-[#caa638] text-black font-bold text-sm px-8 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-[#dfa742]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
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
